import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    let email = "";
    let planId = "";
    let amount = 0;
    let currency = "usd";
    let method = "stripe_webhook";

    // 1. Stripe webhook mockup parsing
    if (body.provider === "stripe" || body.type?.startsWith("checkout.")) {
      const data = body.data?.object || body.data || {};
      email = data.customer_email || data.email || body.email;
      planId = data.metadata?.planId || body.plan_id;
      amount = (data.amount_total || body.amount || 0) / 100;
      currency = data.currency || body.currency || "usd";
      method = "stripe";
    }
    // 2. Razorpay webhook mockup parsing
    else if (body.provider === "razorpay" || body.event === "payment.captured") {
      const payment = body.payload?.payment?.entity || body.payment || {};
      email = payment.email || body.email;
      planId = payment.notes?.planId || body.plan_id;
      amount = (payment.amount || body.amount || 0) / 100;
      currency = payment.currency || body.currency || "inr";
      method = "razorpay";
    } 
    // 3. Fallback direct mock trigger
    else {
      email = body.email;
      planId = body.plan_id;
      amount = Number(body.amount) || 0;
      currency = body.currency || "usd";
      method = body.method || "mock_webhook";
    }

    if (!email || !planId) {
      return NextResponse.json({ success: false, error: "Missing email or planId in webhook payload" }, { status: 400 });
    }

    // Locate customer user
    const customer = await prisma.user.findFirst({
      where: { email, role: "CUSTOMER" }
    });

    if (!customer) {
      return NextResponse.json({ success: false, error: `Customer not found for email: ${email}` }, { status: 404 });
    }

    // Locate subscription plan
    const plan = await prisma.subscriptionPlan.findUnique({
      where: { id: planId }
    });

    if (!plan) {
      return NextResponse.json({ success: false, error: `Subscription plan not found for ID: ${planId}` }, { status: 404 });
    }

    const now = new Date();
    const expiry = new Date();

    // Compute expiry dates
    if (plan.duration.toLowerCase().includes("monthly") || plan.duration.toLowerCase().includes("month")) {
      expiry.setMonth(expiry.getMonth() + 1);
    } else if (plan.duration.toLowerCase().includes("quarterly")) {
      expiry.setMonth(expiry.getMonth() + 3);
    } else if (plan.duration.toLowerCase().includes("half")) {
      expiry.setMonth(expiry.getMonth() + 6);
    } else if (plan.duration.toLowerCase().includes("yearly") || plan.duration.toLowerCase().includes("year")) {
      expiry.setFullYear(expiry.getFullYear() + 1);
    } else {
      expiry.setMonth(expiry.getMonth() + 1);
    }

    // Transaction execution
    const result = await prisma.$transaction(async (tx) => {
      // Deactivate older active subscriptions
      await tx.customerSubscription.updateMany({
        where: { customerId: customer.id, status: "ACTIVE" },
        data: { status: "EXPIRED" }
      });

      // Write new subscription
      const newSub = await tx.customerSubscription.create({
        data: {
          customerId: customer.id,
          planId,
          startDate: now,
          expiryDate: expiry,
          status: "ACTIVE",
          paymentStatus: "PAID"
        }
      });

      // Generate invoice
      const invoiceNumber = `INV-${Date.now().toString().slice(-6)}-${Math.floor(1000 + Math.random() * 9000)}`;
      const newInvoice = await tx.invoice.create({
        data: {
          customerId: customer.id,
          subscriptionId: newSub.id,
          amount: amount || plan.price,
          currency: currency.toUpperCase(),
          paymentMethod: method,
          invoiceNumber,
          status: "paid"
        }
      });

      // Update user status
      await tx.user.update({
        where: { id: customer.id },
        data: { status: "ACTIVE" }
      });

      return { subscription: newSub, invoice: newInvoice };
    });

    return NextResponse.json({ success: true, message: "Webhook subscription activated successfully", data: result });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message || "Webhook processing failed" }, { status: 500 });
  }
}
