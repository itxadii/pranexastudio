"use server";

import { prisma } from "@/lib/prisma";
import * as bcrypt from "bcryptjs";
import { z } from "zod";
import { revalidatePath } from "next/cache";

const customerSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  phone: z.string().optional(),
  country: z.string().optional(),
  timezone: z.string().default("UTC")
});

const editCustomerSchema = z.object({
  id: z.string(),
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  phone: z.string().optional(),
  country: z.string().optional(),
  timezone: z.string().default("UTC")
});

export async function addCustomer(formData: z.infer<typeof customerSchema>) {
  try {
    const validated = customerSchema.parse(formData);

    const existingUser = await prisma.user.findUnique({
      where: { email: validated.email }
    });

    if (existingUser) {
      return { success: false, error: "Customer email already exists" };
    }

    const hashedPassword = await bcrypt.hash(validated.password, 10);

    const newUser = await prisma.user.create({
      data: {
        name: validated.name,
        email: validated.email,
        password: hashedPassword,
        phone: validated.phone || null,
        country: validated.country || "India",
        timezone: validated.timezone || "UTC",
        role: "CUSTOMER",
        status: "ACTIVE"
      }
    });

    revalidatePath("/admin/customers");
    return { success: true, user: { id: newUser.id, name: newUser.name, email: newUser.email } };
  } catch (error: any) {
    return { success: false, error: error.message || "Failed to create customer" };
  }
}

export async function editCustomer(formData: z.infer<typeof editCustomerSchema>) {
  try {
    const validated = editCustomerSchema.parse(formData);

    // Verify email is not taken by another user
    const emailTaken = await prisma.user.findFirst({
      where: {
        email: validated.email,
        NOT: { id: validated.id }
      }
    });

    if (emailTaken) {
      return { success: false, error: "Email is already taken by another user" };
    }

    await prisma.user.update({
      where: { id: validated.id },
      data: {
        name: validated.name,
        email: validated.email,
        phone: validated.phone || null,
        country: validated.country || null,
        timezone: validated.timezone || "UTC"
      }
    });

    revalidatePath("/admin/customers");
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message || "Failed to update customer" };
  }
}

export async function toggleCustomerStatus(id: string, currentStatus: "ACTIVE" | "SUSPENDED" | "EXPIRED") {
  try {
    const targetStatus = currentStatus === "ACTIVE" ? "SUSPENDED" : "ACTIVE";
    await prisma.user.update({
      where: { id },
      data: { status: targetStatus }
    });

    revalidatePath("/admin/customers");
    return { success: true, newStatus: targetStatus };
  } catch (error: any) {
    return { success: false, error: error.message || "Failed to update status" };
  }
}

export async function deleteCustomer(id: string) {
  try {
    await prisma.user.delete({
      where: { id }
    });

    revalidatePath("/admin/customers");
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message || "Failed to delete customer" };
  }
}

export async function assignTrainer(customerId: string, trainerId: string) {
  try {
    // Set all previous trainer assignments for this customer to inactive
    await prisma.trainerAssignment.updateMany({
      where: { customerId, active: true },
      data: { active: false }
    });

    // Create new assignment
    await prisma.trainerAssignment.create({
      data: {
        customerId,
        trainerId,
        active: true
      }
    });

    revalidatePath("/admin/customers");
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message || "Failed to assign trainer" };
  }
}

export async function renewSubscription(customerId: string, planId: string) {
  try {
    const plan = await prisma.subscriptionPlan.findUnique({
      where: { id: planId }
    });

    if (!plan) {
      return { success: false, error: "Subscription plan not found" };
    }

    const now = new Date();
    const expiry = new Date();
    
    // Calculate expiry based on duration title
    if (plan.duration.toLowerCase().includes("monthly") || plan.duration.toLowerCase().includes("month")) {
      expiry.setMonth(expiry.getMonth() + 1);
    } else if (plan.duration.toLowerCase().includes("quarterly")) {
      expiry.setMonth(expiry.getMonth() + 3);
    } else if (plan.duration.toLowerCase().includes("half")) {
      expiry.setMonth(expiry.getMonth() + 6);
    } else if (plan.duration.toLowerCase().includes("yearly") || plan.duration.toLowerCase().includes("year")) {
      expiry.setFullYear(expiry.getFullYear() + 1);
    } else {
      expiry.setMonth(expiry.getMonth() + 1); // default 30 days
    }

    // Wrap subscription and invoice creation in a Prisma Transaction
    const result = await prisma.$transaction(async (tx) => {
      // 1. Deactivate other active subscriptions for this customer
      await tx.customerSubscription.updateMany({
        where: { customerId, status: "ACTIVE" },
        data: { status: "EXPIRED" }
      });

      // 2. Create the new customer subscription
      const newSub = await tx.customerSubscription.create({
        data: {
          customerId,
          planId,
          startDate: now,
          expiryDate: expiry,
          status: "ACTIVE",
          paymentStatus: "PAID"
        }
      });

      // 3. Generate the payment invoice
      const invoiceNumber = `INV-${Date.now().toString().slice(-6)}-${Math.floor(1000 + Math.random() * 9000)}`;
      const newInvoice = await tx.invoice.create({
        data: {
          customerId,
          subscriptionId: newSub.id,
          amount: plan.price,
          currency: plan.currency,
          paymentMethod: "manual_admin",
          invoiceNumber,
          status: "paid"
        }
      });

      // 4. Update the user account status to ACTIVE in case they were suspended or expired
      await tx.user.update({
        where: { id: customerId },
        data: { status: "ACTIVE" }
      });

      return { subscription: newSub, invoice: newInvoice };
    });

    revalidatePath("/admin/customers");
    return { success: true, data: result };
  } catch (error: any) {
    return { success: false, error: error.message || "Failed to renew subscription" };
  }
}
