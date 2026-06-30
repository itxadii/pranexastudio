"use client";

import React, { useState, useMemo } from "react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Skeleton } from "@/components/ui/LoadingSkeleton";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import interactionPlugin from "@fullcalendar/interaction";

interface LectureLog {
  id: string;
  lectureDate: string;
  status: "COMPLETED" | "MISSED";
  notes: string | null;
  submittedAt: string;
}

interface TrainerHistoryClientProps {
  initialData: {
    createdAt: string;
    lectures: LectureLog[];
  };
}

export default function TrainerHistoryClient({ initialData }: TrainerHistoryClientProps) {
  const [selectedDayDetail, setSelectedDayDetail] = useState<{
    date: string;
    status: "Completed" | "Missed";
    notes: string | null;
    time: string | null;
  } | null>(null);

  // 1. Calculate Attendance Statistics (Streaks, Completion Rate)
  const stats = useMemo(() => {
    const lectures = initialData.lectures;
    const completedDatesStr = lectures
      .filter((l) => l.status === "COMPLETED")
      .map((l) => l.lectureDate.split("T")[0]);

    if (completedDatesStr.length === 0) {
      return { completed: 0, missed: 0, completionRate: 0, currentStreak: 0, longestStreak: 0 };
    }

    const uniqueTimeStamps = Array.from(
      new Set(completedDatesStr.map((d) => new Date(d).getTime()))
    ).sort((a, b) => a - b);

    let longest = 0;
    let tempStreak = 0;
    const msInDay = 24 * 60 * 60 * 1000;

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

    const today = new Date();
    const todayMidnight = new Date(Date.UTC(today.getFullYear(), today.getMonth(), today.getDate())).getTime();
    const yesterdayMidnight = todayMidnight - msInDay;

    const hasToday = uniqueTimeStamps.includes(todayMidnight);
    const hasYesterday = uniqueTimeStamps.includes(yesterdayMidnight);

    let current = 0;
    if (hasToday || hasYesterday) {
      let checkDate = hasToday ? todayMidnight : yesterdayMidnight;
      while (uniqueTimeStamps.includes(checkDate)) {
        current++;
        checkDate -= msInDay;
      }
    }

    // Monthly completed count
    const now = new Date();
    const startOfMonth = new Date(Date.UTC(now.getFullYear(), now.getMonth(), 1));
    const daysTrackedThisMonth = now.getDate();
    
    const monthlyCompleted = lectures.filter(
      (l) => new Date(l.lectureDate) >= startOfMonth && l.status === "COMPLETED"
    ).length;

    const monthlyMissed = Math.max(0, daysTrackedThisMonth - monthlyCompleted);
    const monthlyRate = daysTrackedThisMonth > 0 ? Math.round((monthlyCompleted / daysTrackedThisMonth) * 100) : 0;

    return {
      completed: monthlyCompleted,
      missed: monthlyMissed,
      completionRate: monthlyRate,
      currentStreak: current,
      longestStreak: longest
    };
  }, [initialData]);

  // 2. Generate FullCalendar events list
  const calendarEvents = useMemo(() => {
    const events: any[] = [];
    const completedDaysSet = new Set<string>();

    // Add completed events
    initialData.lectures.forEach((lec) => {
      const dateStr = lec.lectureDate.split("T")[0];
      completedDaysSet.add(dateStr);
      events.push({
        title: "Completed",
        start: dateStr,
        allDay: true,
        display: "background",
        backgroundColor: "#d1fae5", // soft green BG
        textColor: "#065f46",
        extendedProps: {
          status: "Completed",
          notes: lec.notes,
          time: new Date(lec.submittedAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
        }
      });
    });

    // Generate missed events dynamically starting from the user's registration date
    const regDate = new Date(initialData.createdAt);
    const startDate = new Date(Date.UTC(regDate.getFullYear(), regDate.getMonth(), regDate.getDate()));
    const today = new Date();
    const endDate = new Date(Date.UTC(today.getFullYear(), today.getMonth(), today.getDate()));

    let current = startDate;
    const msInDay = 24 * 60 * 60 * 1000;

    while (current.getTime() < endDate.getTime()) {
      const dateStr = current.toISOString().split("T")[0];
      if (!completedDaysSet.has(dateStr)) {
        events.push({
          title: "Missed",
          start: dateStr,
          allDay: true,
          display: "background",
          backgroundColor: "#fee2e2", // soft red BG
          textColor: "#991b1b",
          extendedProps: {
            status: "Missed",
            notes: null,
            time: null
          }
        });
      }
      current = new Date(current.getTime() + msInDay);
    }

    return events;
  }, [initialData]);

  const handleDateClick = (arg: any) => {
    const dateStr = arg.dateStr;
    const ev = calendarEvents.find(e => e.start === dateStr);
    
    if (ev) {
      setSelectedDayDetail({
        date: dateStr,
        status: ev.extendedProps.status,
        notes: ev.extendedProps.notes,
        time: ev.extendedProps.time
      });
    } else {
      const clickedTime = new Date(dateStr).getTime();
      const todayTime = new Date().setHours(0, 0, 0, 0);
      if (clickedTime > todayTime) {
        setSelectedDayDetail(null);
      } else {
        setSelectedDayDetail({
          date: dateStr,
          status: "Missed",
          notes: null,
          time: null
        });
      }
    }
  };

  // Filter out logs with notes
  const notesFeed = useMemo(() => {
    return initialData.lectures.filter(l => l.notes && l.notes.trim().length > 0);
  }, [initialData]);

  return (
    <div className="space-y-8">
      
      {/* Title */}
      <div>
        <h2 className="font-serif text-3xl font-bold text-deep-teal">My Progress History</h2>
        <p className="text-text-muted text-sm mt-0.5">Review your calendar logs, lecture reflections, and stats.</p>
      </div>

      {/* Grid: Calendar vs Notes Feed */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Column: Calendar and Detail Info */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Stats Bar */}
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 bg-cream-dark/30 p-4 rounded-xl text-center">
            <div>
              <div className="text-xs font-bold text-text-muted uppercase">Completed</div>
              <div className="text-lg font-black text-green-700">{stats.completed} days</div>
            </div>
            <div>
              <div className="text-xs font-bold text-text-muted uppercase">Missed</div>
              <div className="text-lg font-black text-red-600">{stats.missed} days</div>
            </div>
            <div>
              <div className="text-xs font-bold text-text-muted uppercase">Completion Rate</div>
              <div className="text-lg font-black text-deep-teal">{stats.completionRate}%</div>
            </div>
            <div>
              <div className="text-xs font-bold text-text-muted uppercase">Streak</div>
              <div className="text-lg font-black text-logo-gold">{stats.currentStreak} 🔥</div>
            </div>
            <div className="col-span-2 sm:col-span-1">
              <div className="text-xs font-bold text-text-muted uppercase">Longest Streak</div>
              <div className="text-lg font-black text-terracotta-rose">{stats.longestStreak} days</div>
            </div>
          </div>

          {/* Calendar Box */}
          <Card className="p-4 bg-white shadow-sm border border-cream-dark/50">
            <FullCalendar
              plugins={[dayGridPlugin, interactionPlugin]}
              initialView="dayGridMonth"
              headerToolbar={{
                left: "prev,next today",
                center: "title",
                right: ""
              }}
              height="auto"
              events={calendarEvents}
              dateClick={handleDateClick}
              eventClick={(info) => handleDateClick({ dateStr: info.event.startStr })}
            />
          </Card>

          {/* Detailed Day Info Card */}
          {selectedDayDetail && (
            <div className={`p-5 rounded-2xl border animate-fadeIn ${
              selectedDayDetail.status === "Completed"
                ? "bg-green-50/50 border-green-200 text-green-800"
                : "bg-red-50/50 border-red-200 text-red-800"
            }`}>
              <div className="flex justify-between items-center font-bold">
                <span className="text-base">
                  {new Date(selectedDayDetail.date).toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                </span>
                <Badge variant={selectedDayDetail.status === "Completed" ? "success" : "destructive"}>
                  {selectedDayDetail.status}
                </Badge>
              </div>
              {selectedDayDetail.status === "Completed" && (
                <div className="mt-4 space-y-2 text-sm text-text-dark">
                  <div>
                    <span className="font-bold text-text-muted block text-xs uppercase">Logged Time:</span>
                    <span>{selectedDayDetail.time || "Not logged"}</span>
                  </div>
                  <div>
                    <span className="font-bold text-text-muted block text-xs uppercase">Your Notes:</span>
                    <p className="italic bg-white p-3.5 rounded-lg border border-cream-dark mt-1 text-sm leading-relaxed max-h-32 overflow-y-auto">
                      "{selectedDayDetail.notes || "No notes submitted."}"
                    </p>
                  </div>
                </div>
              )}
              {selectedDayDetail.status === "Missed" && (
                <div className="mt-2 text-sm text-text-muted">
                  No yoga lecture was completed on this date.
                </div>
              )}
            </div>
          )}

        </div>

        {/* Right Column: Lecture Notes Timeline Feed */}
        <div className="space-y-6">
          <Card className="h-full flex flex-col max-h-[750px] overflow-hidden">
            <CardHeader className="border-b border-cream-dark/50 p-6 shrink-0">
              <CardTitle>My Reflection Logs</CardTitle>
              <CardDescription>Feed of notes and thoughts logged from past yoga sheets.</CardDescription>
            </CardHeader>
            <CardContent className="p-0 overflow-y-auto flex-grow divide-y divide-cream-dark/50">
              {notesFeed.length === 0 ? (
                <p className="text-sm text-text-muted text-center py-12 px-4">
                  No lecture notes recorded yet.
                </p>
              ) : (
                notesFeed.map((lec) => (
                  <div key={lec.id} className="p-5 space-y-2 hover:bg-warm-cream/10 transition-colors">
                    <div className="flex justify-between items-baseline">
                      <span className="text-xs font-bold text-deep-teal">
                        {new Date(lec.lectureDate).toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" })}
                      </span>
                      <span className="text-[10px] text-text-muted">
                        {new Date(lec.submittedAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                      </span>
                    </div>
                    <p className="text-sm text-text-dark font-medium italic leading-relaxed">
                      "{lec.notes}"
                    </p>
                  </div>
                ))
              )}
            </CardContent>
          </Card>
        </div>

      </div>

    </div>
  );
}
