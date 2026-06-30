import React from "react";
import { prisma } from "@/lib/prisma";
import CustomerDirectoryClient from "@/components/admin/CustomerDirectoryClient";

export const revalidate = 0; // Fresh management datasets

export default async function AdminCustomersPage() {
  // 1. Fetch all Customers
  const customers = await prisma.user.findMany({
    where: { role: "CUSTOMER" },
    include: {
      subscriptions: {
        include: { plan: true },
        orderBy: { expiryDate: "desc" }
      },
      customerTrainer: {
        where: { active: true },
        include: { trainer: true }
      },
      invoices: {
        orderBy: { createdAt: "desc" }
      }
    },
    orderBy: { createdAt: "desc" }
  });

  // 2. Fetch all Trainers for assignment selectors
  const trainers = await prisma.user.findMany({
    where: { role: "TRAINER", status: "ACTIVE" },
    orderBy: { name: "asc" }
  });

  // 3. Fetch all Subscription Plans for assignment selectors
  const plans = await prisma.subscriptionPlan.findMany({
    where: { active: true },
    orderBy: { price: "asc" }
  });

  // Format customers for client usage
  const formattedCustomers = customers.map((c) => {
    const activeSub = c.subscriptions[0];
    const isExpired = activeSub ? new Date(activeSub.expiryDate) < new Date() : true;
    const subStatus = activeSub ? (isExpired ? "EXPIRED" : activeSub.status) : "NO_SUBSCRIPTION";

    return {
      id: c.id,
      name: c.name,
      email: c.email,
      phone: c.phone || "N/A",
      country: c.country || "N/A",
      timezone: c.timezone || "UTC",
      status: c.status,
      createdAt: c.createdAt.toISOString(),
      activePlan: activeSub 
        ? {
            id: activeSub.id,
            title: activeSub.plan.title,
            expiryDate: activeSub.expiryDate.toISOString(),
            status: subStatus
          } 
        : null,
      assignedTrainer: c.customerTrainer[0]?.trainer 
        ? {
            id: c.customerTrainer[0].trainer.id,
            name: c.customerTrainer[0].trainer.name
          } 
        : null,
      invoices: c.invoices.map(inv => ({
        id: inv.id,
        invoiceNumber: inv.invoiceNumber,
        amount: inv.amount,
        status: inv.status,
        createdAt: inv.createdAt.toISOString()
      }))
    };
  });

  const formattedTrainers = trainers.map(t => ({
    id: t.id,
    name: t.name
  }));

  const formattedPlans = plans.map(p => ({
    id: p.id,
    title: p.title,
    price: p.price,
    duration: p.duration
  }));

  return (
    <div className="space-y-6">
      <CustomerDirectoryClient 
        customers={formattedCustomers}
        trainers={formattedTrainers}
        plans={formattedPlans}
      />
    </div>
  );
}
