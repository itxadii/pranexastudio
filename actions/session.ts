"use server";

import { prisma } from "@/lib/prisma";
import { z as zod } from "zod";
import { revalidatePath } from "next/cache";

const sessionSchema = zod.object({
  customerId: zod.string(),
  trainerId: zod.string(),
  title: zod.string().min(3, "Title must be at least 3 characters"),
  date: zod.string(), // date string
  startTime: zod.string(), // ISO string or time string
  endTime: zod.string(), // ISO string or time string
  duration: zod.number().min(1, "Duration must be at least 1 minute"),
  meetingProvider: zod.enum(["GoogleMeet", "Zoom", "Manual"])
});

const progressSchema = zod.object({
  sessionId: zod.string(),
  customerId: zod.string(),
  trainerId: zod.string(),
  flexibility: zod.number().min(1).max(10),
  balance: zod.number().min(1).max(10),
  breathing: zod.number().min(1).max(10),
  focus: zod.number().min(1).max(10),
  stress: zod.number().min(1).max(10),
  weight: zod.number().optional(),
  remarks: zod.string().optional()
});

export async function createSession(formData: zod.infer<typeof sessionSchema>) {
  try {
    const validated = sessionSchema.parse(formData);

    // Mock Google Meet link generation
    let meetingLink = null;
    if (validated.meetingProvider === "GoogleMeet") {
      meetingLink = `https://meet.google.com/mock-${Math.random().toString(36).substring(2, 5)}-${Math.random().toString(36).substring(2, 6)}-${Math.random().toString(36).substring(2, 5)}`;
    } else if (validated.meetingProvider === "Zoom") {
      meetingLink = `https://zoom.us/j/mock${Math.floor(100000000 + Math.random() * 900000000)}`;
    }

    const startDateTime = new Date(validated.startTime);
    const endDateTime = new Date(validated.endTime);

    // Create session in database
    const session = await prisma.session.create({
      data: {
        customerId: validated.customerId,
        trainerId: validated.trainerId,
        title: validated.title,
        date: new Date(validated.date),
        startTime: startDateTime,
        endTime: endDateTime,
        duration: validated.duration,
        meetingProvider: validated.meetingProvider,
        meetingLink,
        status: "Scheduled"
      }
    });

    revalidatePath("/admin/customers");
    revalidatePath("/customer");
    revalidatePath("/trainer");
    
    return { success: true, session };
  } catch (error: any) {
    return { success: false, error: error.message || "Failed to create session" };
  }
}

export async function completeSession(
  sessionId: string, 
  trainerPresent: boolean, 
  customerPresent: boolean, 
  remarks?: string
) {
  try {
    // Wrap in Prisma transaction to ensure integrity
    const result = await prisma.$transaction(async (tx) => {
      // 1. Update session status
      const updatedSession = await tx.session.update({
        where: { id: sessionId },
        data: { status: "Completed" }
      });

      // 2. Upsert attendance record
      await tx.attendance.upsert({
        where: { sessionId },
        create: {
          sessionId,
          trainerPresent,
          customerPresent,
          remarks
        },
        update: {
          trainerPresent,
          customerPresent,
          remarks
        }
      });

      return updatedSession;
    });

    revalidatePath("/customer");
    revalidatePath("/trainer");
    return { success: true, session: result };
  } catch (error: any) {
    return { success: false, error: error.message || "Failed to complete session" };
  }
}

export async function cancelSession(sessionId: string, notes?: string) {
  try {
    const updated = await prisma.session.update({
      where: { id: sessionId },
      data: { 
        status: "Cancelled",
        notes
      }
    });

    revalidatePath("/customer");
    revalidatePath("/trainer");
    return { success: true, session: updated };
  } catch (error: any) {
    return { success: false, error: error.message || "Failed to cancel session" };
  }
}

export async function submitProgressLog(formData: zod.infer<typeof progressSchema>) {
  try {
    const validated = progressSchema.parse(formData);

    const log = await prisma.progressLog.upsert({
      where: { sessionId: validated.sessionId },
      create: {
        sessionId: validated.sessionId,
        customerId: validated.customerId,
        trainerId: validated.trainerId,
        flexibility: validated.flexibility,
        balance: validated.balance,
        breathing: validated.breathing,
        focus: validated.focus,
        stress: validated.stress,
        weight: validated.weight || null,
        remarks: validated.remarks || null
      },
      update: {
        flexibility: validated.flexibility,
        balance: validated.balance,
        breathing: validated.breathing,
        focus: validated.focus,
        stress: validated.stress,
        weight: validated.weight || null,
        remarks: validated.remarks || null
      }
    });

    revalidatePath("/customer");
    revalidatePath("/trainer");
    return { success: true, log };
  } catch (error: any) {
    return { success: false, error: error.message || "Failed to log progress metrics" };
  }
}

export async function requestLeave(trainerId: string, startDate: Date, endDate: Date, reason?: string) {
  try {
    const leave = await prisma.trainerLeave.create({
      data: {
        trainerId,
        startDate,
        endDate,
        reason,
        status: "Pending"
      }
    });

    revalidatePath("/trainer");
    revalidatePath("/admin/trainers");
    return { success: true, leave };
  } catch (error: any) {
    return { success: false, error: error.message || "Failed to submit leave request" };
  }
}

export async function updateLeaveStatus(leaveId: string, status: "Approved" | "Rejected") {
  try {
    const leave = await prisma.trainerLeave.update({
      where: { id: leaveId },
      data: { status }
    });

    revalidatePath("/trainer");
    revalidatePath("/admin/trainers");
    return { success: true, leave };
  } catch (error: any) {
    return { success: false, error: error.message || "Failed to update leave status" };
  }
}
