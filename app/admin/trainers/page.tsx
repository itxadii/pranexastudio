import React from "react";
import { prisma } from "@/lib/prisma";
import TrainerDirectoryClient from "@/components/admin/TrainerDirectoryClient";

export const revalidate = 0; // Fresh dataset updates

export default async function AdminTrainersPage() {
  // 1. Fetch Trainers
  const trainers = await prisma.user.findMany({
    where: { role: "TRAINER" },
    include: {
      lectures: {
        orderBy: { lectureDate: "asc" }
      }
    },
    orderBy: { createdAt: "desc" }
  });

  // 2. Fetch Trainer Leaves
  const leaves = await prisma.trainerLeave.findMany({
    include: { trainer: true },
    orderBy: { createdAt: "desc" }
  });

  const now = new Date();
  const daysTrackedThisMonth = now.getDate();

  const formattedTrainers = trainers.map((emp) => {
    const startOfMonth = new Date(Date.UTC(now.getFullYear(), now.getMonth(), 1));
    const todayMidnight = new Date(Date.UTC(now.getFullYear(), now.getMonth(), now.getDate()));
    
    const monthlyLectures = emp.lectures.filter(
      (l) => l.lectureDate >= startOfMonth && l.lectureDate <= todayMidnight
    );

    const completedCount = monthlyLectures.filter((l) => l.status === "COMPLETED").length;
    const missedCount = Math.max(0, daysTrackedThisMonth - completedCount);
    const completionRate = daysTrackedThisMonth > 0 
      ? Math.round((completedCount / daysTrackedThisMonth) * 100) 
      : 0;

    return {
      id: emp.id,
      name: emp.name,
      email: emp.email,
      createdAt: emp.createdAt.toISOString(),
      completedThisMonth: completedCount,
      missedThisMonth: missedCount,
      completionRate,
      lectures: emp.lectures.map((l) => ({
        id: l.id,
        lectureDate: l.lectureDate.toISOString(),
        status: l.status,
        notes: l.notes,
        submittedAt: l.submittedAt.toISOString()
      }))
    };
  });

  const formattedLeaves = leaves.map(l => ({
    id: l.id,
    trainerName: l.trainer.name,
    startDate: l.startDate.toISOString(),
    endDate: l.endDate.toISOString(),
    reason: l.reason || "N/A",
    status: l.status
  }));

  return (
    <div className="space-y-6">
      <TrainerDirectoryClient 
        employees={formattedTrainers} 
        leaves={formattedLeaves}
      />
    </div>
  );
}
