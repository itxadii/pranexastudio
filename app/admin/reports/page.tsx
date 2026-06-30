import React from "react";
import { prisma } from "@/lib/prisma";
import ReportsClient from "@/components/admin/ReportsClient";

export const revalidate = 0; // Fresh telemetry records

export default async function AdminReportsPage() {
  // 1. Fetch Trainers & Lectures (legacy practice sheets)
  const employees = await prisma.user.findMany({
    where: { role: "TRAINER" },
    include: {
      lectures: {
        orderBy: { lectureDate: "asc" }
      }
    },
    orderBy: { name: "asc" }
  });

  // 2. Fetch all sessions (scheduling counts)
  const sessions = await prisma.session.findMany({
    include: { customer: true, trainer: true },
    orderBy: { startTime: "desc" }
  });

  // 3. Fetch all invoices (billing stats)
  const invoices = await prisma.invoice.findMany({
    include: { customer: true },
    orderBy: { createdAt: "desc" }
  });

  // 4. Fetch all progress logs (performance metrics)
  const progressLogs = await prisma.progressLog.findMany({
    include: { customer: true, trainer: true },
    orderBy: { createdAt: "desc" }
  });

  const formattedEmployees = employees.map((emp) => ({
    id: emp.id,
    name: emp.name,
    email: emp.email,
    createdAt: emp.createdAt.toISOString(),
    lectures: emp.lectures.map((l) => ({
      id: l.id,
      lectureDate: l.lectureDate.toISOString(),
      status: l.status,
      notes: l.notes,
      submittedAt: l.submittedAt.toISOString()
    }))
  }));

  const formattedSessions = sessions.map(s => ({
    id: s.id,
    title: s.title,
    customerName: s.customer.name,
    trainerName: s.trainer.name,
    status: s.status,
    date: s.date.toISOString(),
    duration: s.duration
  }));

  const formattedInvoices = invoices.map(i => ({
    id: i.id,
    customerName: i.customer.name,
    amount: i.amount,
    currency: i.currency,
    status: i.status,
    paymentMethod: i.paymentMethod,
    invoiceNumber: i.invoiceNumber,
    createdAt: i.createdAt.toISOString()
  }));

  const formattedProgress = progressLogs.map(p => ({
    id: p.id,
    customerName: p.customer.name,
    trainerName: p.trainer.name,
    flexibility: p.flexibility,
    balance: p.balance,
    breathing: p.breathing,
    focus: p.focus,
    stress: p.stress,
    weight: p.weight || null,
    remarks: p.remarks || "N/A",
    createdAt: p.createdAt.toISOString()
  }));

  return (
    <div className="space-y-6">
      <ReportsClient 
        employees={formattedEmployees} 
        sessions={formattedSessions}
        invoices={formattedInvoices}
        progressLogs={formattedProgress}
      />
    </div>
  );
}
