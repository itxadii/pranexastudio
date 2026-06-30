import React from "react";
import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import CustomerCalendarClient from "@/components/customer/CustomerCalendarClient";

export const revalidate = 0; // Always serve fresh session events

export default async function CustomerCalendarPage() {
  const session = await auth();

  if (!session?.user || !(session.user as any).id) {
    redirect("/login");
  }

  const userId = (session.user as any).id;

  // Fetch all sessions for this customer
  const sessions = await prisma.session.findMany({
    where: { customerId: userId },
    include: { trainer: true },
    orderBy: { startTime: "asc" }
  });

  const formattedSessions = sessions.map(s => ({
    id: s.id,
    title: s.title,
    start: s.startTime.toISOString(),
    end: s.endTime.toISOString(),
    status: s.status, // Scheduled, Completed, Cancelled, Missed
    meetingProvider: s.meetingProvider,
    meetingLink: s.meetingLink,
    notes: s.notes,
    trainerName: s.trainer.name
  }));

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-serif text-3xl font-bold text-deep-teal">My Practice Calendar</h1>
        <p className="text-sm text-text-muted mt-1">Review scheduled classes, join video sessions, and view completed practice history.</p>
      </div>

      <CustomerCalendarClient sessions={formattedSessions} />
    </div>
  );
}
