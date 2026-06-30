import React from "react";
import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import TrainerHistoryClient from "@/components/trainer/TrainerHistoryClient";

export const revalidate = 0; // Disable server cache

export default async function TrainerHistoryPage() {
  const session = await auth();

  if (!session?.user || !(session.user as any).id) {
    redirect("/login");
  }

  const userId = (session.user as any).id;
  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: {
      lectures: {
        orderBy: { lectureDate: "desc" }
      }
    }
  });

  if (!user) {
    redirect("/login");
  }

  const formattedData = {
    createdAt: user.createdAt.toISOString(),
    lectures: user.lectures.map((l) => ({
      id: l.id,
      lectureDate: l.lectureDate.toISOString(),
      status: l.status,
      notes: l.notes,
      submittedAt: l.submittedAt.toISOString()
    }))
  };

  return (
    <div className="space-y-6">
      <TrainerHistoryClient initialData={formattedData} />
    </div>
  );
}
