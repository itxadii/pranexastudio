import React from "react";
import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getEmployeeStats } from "@/actions/lecture";
import TrainerDashboardClient from "@/components/trainer/TrainerDashboardClient";

export const revalidate = 0; // Fresh dashboard metrics

export default async function TrainerDashboardPage() {
  const session = await auth();

  if (!session?.user || !(session.user as any).id) {
    redirect("/login");
  }

  const userId = (session.user as any).id;

  // 1. Fetch legacy employee stats (trainer self-practice lecture sheets)
  const legacyRes = await getEmployeeStats(userId);
  if (!legacyRes.success || !legacyRes.stats || !legacyRes.lectures) {
    return (
      <div className="p-8 text-center text-red-600 bg-red-50 rounded-xl border border-red-200">
        Failed to load trainer self-practice metrics. Please try again.
      </div>
    );
  }

  // Check if today's self-practice is completed
  const now = new Date();
  const todayMidnight = new Date(Date.UTC(now.getFullYear(), now.getMonth(), now.getDate()));
  const todayLecture = legacyRes.lectures.find(
    (l) => new Date(l.lectureDate).getTime() === todayMidnight.getTime()
  );
  const isTodayCompleted = !!todayLecture && todayLecture.status === "COMPLETED";

  // 2. Fetch Trainer Assignments (active customers)
  const assignments = await prisma.trainerAssignment.findMany({
    where: { trainerId: userId, active: true },
    include: {
      customer: {
        include: {
          subscriptions: {
            where: { status: "ACTIVE" },
            include: { plan: true },
            take: 1
          }
        }
      }
    },
    orderBy: { assignedAt: "desc" }
  });

  // 3. Fetch Trainer Sessions
  const sessions = await prisma.session.findMany({
    where: { trainerId: userId },
    include: { customer: true },
    orderBy: { startTime: "asc" }
  });

  // 4. Fetch Trainer Leaves
  const leaves = await prisma.trainerLeave.findMany({
    where: { trainerId: userId },
    orderBy: { startDate: "desc" }
  });

  // Formats for client utilization
  const formattedCustomers = assignments.map(a => {
    const activeSub = a.customer.subscriptions[0];
    return {
      id: a.customer.id,
      name: a.customer.name,
      email: a.customer.email,
      phone: a.customer.phone || "N/A",
      country: a.customer.country || "N/A",
      activePlanTitle: activeSub ? activeSub.plan.title : "No Active Plan"
    };
  });

  const formattedSessions = sessions.map(s => ({
    id: s.id,
    customerId: s.customerId,
    customerName: s.customer.name,
    title: s.title,
    start: s.startTime.toISOString(),
    end: s.endTime.toISOString(),
    duration: s.duration,
    status: s.status,
    meetingProvider: s.meetingProvider,
    meetingLink: s.meetingLink,
    notes: s.notes
  }));

  const formattedLeaves = leaves.map(l => ({
    id: l.id,
    startDate: l.startDate.toISOString(),
    endDate: l.endDate.toISOString(),
    reason: l.reason || "N/A",
    status: l.status
  }));

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-serif text-3xl font-bold text-deep-teal">Instructor Space</h1>
        <p className="text-sm text-text-muted mt-1">Manage client schedule agendas, file progress log summaries, and trace personal practice sheets.</p>
      </div>

      <TrainerDashboardClient
        userId={userId}
        userName={session.user.name || "Trainer"}
        isTodayCompleted={isTodayCompleted}
        todayNotes={todayLecture?.notes || null}
        todaySubmittedTime={
          todayLecture?.submittedAt 
            ? new Date(todayLecture.submittedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) 
            : null
        }
        stats={legacyRes.stats}
        customers={formattedCustomers}
        sessions={formattedSessions}
        leaves={formattedLeaves}
      />
    </div>
  );
}
