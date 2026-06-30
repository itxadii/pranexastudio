"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

// Helper to get start of day in UTC
function getStartOfDayUTC(date: Date) {
  return new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
}

// Helper to calculate streaks
function calculateStreaks(completedDatesStr: string[]) {
  if (completedDatesStr.length === 0) {
    return { currentStreak: 0, longestStreak: 0 };
  }

  // Parse strings to unique timestamps sorted ascending
  const uniqueTimeStamps = Array.from(
    new Set(completedDatesStr.map((d) => new Date(d).getTime()))
  ).sort((a, b) => a - b);

  let longest = 0;
  let current = 0;
  let tempStreak = 0;

  const msInDay = 24 * 60 * 60 * 1000;
  const today = getStartOfDayUTC(new Date()).getTime();
  const yesterday = today - msInDay;

  // Calculate longest streak
  for (let i = 0; i < uniqueTimeStamps.length; i++) {
    if (i === 0) {
      tempStreak = 1;
    } else {
      const diff = uniqueTimeStamps[i] - uniqueTimeStamps[i - 1];
      if (diff === msInDay) {
        tempStreak++;
      } else if (diff > msInDay) {
        if (tempStreak > longest) longest = tempStreak;
        tempStreak = 1;
      }
    }
  }
  if (tempStreak > longest) longest = tempStreak;

  // Calculate current streak
  // Check if the user has a submission today or yesterday
  const hasToday = uniqueTimeStamps.includes(today);
  const hasYesterday = uniqueTimeStamps.includes(yesterday);

  if (!hasToday && !hasYesterday) {
    current = 0;
  } else {
    // Traverse backwards from the most recent active date (either today or yesterday)
    let checkDate = hasToday ? today : yesterday;
    current = 0;
    while (uniqueTimeStamps.includes(checkDate)) {
      current++;
      checkDate -= msInDay;
    }
  }

  return { currentStreak: current, longestStreak: longest };
}

export async function submitLecture(userId: string, notes?: string) {
  try {
    const todayMidnight = getStartOfDayUTC(new Date());

    if (notes && notes.length > 500) {
      return { success: false, error: "Notes cannot exceed 500 characters" };
    }

    // Check if user already submitted a lecture for today
    const existing = await prisma.lecture.findUnique({
      where: {
        userId_lectureDate: {
          userId,
          lectureDate: todayMidnight
        }
      }
    });

    if (existing) {
      return { success: false, error: "You have already completed a lecture for today." };
    }

    await prisma.lecture.create({
      data: {
        userId,
        lectureDate: todayMidnight,
        status: "COMPLETED",
        notes: notes || null,
        submittedAt: new Date()
      }
    });

    revalidatePath("/user");
    revalidatePath("/admin");
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message || "Failed to submit lecture" };
  }
}

export async function getEmployeeStats(userId: string, year?: number, month?: number) {
  try {
    const now = new Date();
    const targetYear = year ?? now.getFullYear();
    const targetMonth = month ?? now.getMonth(); // 0-indexed

    // Join date or start of tracking. We will calculate stats for the target month.
    const startOfMonth = new Date(Date.UTC(targetYear, targetMonth, 1));
    const endOfMonth = new Date(Date.UTC(targetYear, targetMonth + 1, 0, 23, 59, 59));

    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        lectures: {
          orderBy: { lectureDate: "asc" }
        }
      }
    });

    if (!user) {
      return { success: false, error: "User not found" };
    }

    const allLectures = user.lectures;
    const monthlyLectures = allLectures.filter(
      (l) => l.lectureDate >= startOfMonth && l.lectureDate <= endOfMonth
    );

    // Streaks are calculated based on all completed lectures (all-time)
    const completedAllTime = allLectures
      .filter((l) => l.status === "COMPLETED")
      .map((l) => getStartOfDayUTC(l.lectureDate).toISOString().split("T")[0]);

    const { currentStreak, longestStreak } = calculateStreaks(completedAllTime);

    // Calculate monthly stats
    const totalDaysInMonth = new Date(targetYear, targetMonth + 1, 0).getDate();
    const isCurrentMonth = now.getFullYear() === targetYear && now.getMonth() === targetMonth;
    
    // Days tracked so far this month (up to today, or all days if past month)
    const daysTracked = isCurrentMonth ? now.getDate() : totalDaysInMonth;

    const completedDays = monthlyLectures.filter((l) => l.status === "COMPLETED").length;
    const missedDays = Math.max(0, daysTracked - completedDays);
    const completionRate = daysTracked > 0 ? Math.round((completedDays / daysTracked) * 100) : 0;

    return {
      success: true,
      stats: {
        completedDays,
        missedDays,
        completionRate,
        currentStreak,
        longestStreak,
        daysTracked,
        totalDaysInMonth
      },
      lectures: monthlyLectures
    };
  } catch (error: any) {
    return { success: false, error: error.message || "Failed to load stats" };
  }
}
