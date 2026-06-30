"use client";

import React, { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { submitLecture } from "@/actions/lecture";
import { completeSession, cancelSession, submitProgressLog, requestLeave } from "@/actions/session";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/Table";
import { Dialog } from "@/components/ui/Dialog";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import interactionPlugin from "@fullcalendar/interaction";

interface CustomerData {
  id: string;
  name: string;
  email: string;
  phone: string;
  country: string;
  activePlanTitle: string;
}

interface SessionData {
  id: string;
  customerId: string;
  customerName: string;
  title: string;
  start: string;
  end: string;
  duration: number;
  status: string; // Scheduled, Completed, Cancelled, Missed
  meetingProvider: string;
  meetingLink: string | null;
  notes: string | null;
}

interface LeaveData {
  id: string;
  startDate: string;
  endDate: string;
  reason: string;
  status: string;
}

interface TrainerDashboardClientProps {
  userId: string;
  userName: string;
  isTodayCompleted: boolean;
  todayNotes: string | null;
  todaySubmittedTime: string | null;
  stats: {
    completedDays: number;
    missedDays: number;
    completionRate: number;
    currentStreak: number;
    longestStreak: number;
    daysTracked: number;
    totalDaysInMonth: number;
  };
  customers: CustomerData[];
  sessions: SessionData[];
  leaves: LeaveData[];
}

type TabType = "classes" | "calendar" | "customers" | "leaves" | "self-practice";

export default function TrainerDashboardClient({
  userId,
  userName,
  isTodayCompleted,
  todayNotes,
  todaySubmittedTime,
  stats,
  customers,
  sessions,
  leaves
}: TrainerDashboardClientProps) {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<TabType>("classes");

  // Legacy self-practice log form states
  const [selfNotes, setSelfNotes] = useState("");
  const [selfError, setSelfError] = useState("");
  const [selfSuccess, setSelfSuccess] = useState("");
  const [selfLoading, setSelfLoading] = useState(false);

  // Leave Form states
  const [leaveStart, setLeaveStart] = useState("");
  const [leaveEnd, setLeaveEnd] = useState("");
  const [leaveReason, setLeaveReason] = useState("");
  const [leaveError, setLeaveError] = useState("");
  const [leaveSuccess, setLeaveSuccess] = useState("");
  const [leaveLoading, setLeaveLoading] = useState(false);

  // Complete Session Modal Form states
  const [selectedSession, setSelectedSession] = useState<SessionData | null>(null);
  const [isCompleteOpen, setIsCompleteOpen] = useState(false);
  const [isCancelOpen, setIsCancelOpen] = useState(false);
  
  const [trainerPresent, setTrainerPresent] = useState(true);
  const [customerPresent, setCustomerPresent] = useState(true);
  const [sessionNotes, setSessionNotes] = useState("");
  
  // Progress indicators
  const [flexibility, setFlexibility] = useState(5);
  const [balance, setBalance] = useState(5);
  const [breathing, setBreathing] = useState(5);
  const [focus, setFocus] = useState(5);
  const [stress, setStress] = useState(5);
  const [weight, setWeight] = useState("");
  const [progressRemarks, setProgressRemarks] = useState("");
  const [modalError, setModalError] = useState("");
  const [modalLoading, setModalLoading] = useState(false);

  // Map calendar events
  const calendarEvents = useMemo(() => {
    return sessions.map(s => {
      let color = "#0369a1"; // Blue (Scheduled)
      if (s.status === "Completed") color = "#15803d"; // Green
      else if (s.status === "Cancelled") color = "#b91c1c"; // Red
      else if (s.status === "Missed") color = "#ea580c"; // Orange

      return {
        id: s.id,
        title: `${s.customerName}: ${s.title}`,
        start: s.start,
        end: s.end,
        backgroundColor: color,
        borderColor: color,
        textColor: "#ffffff",
        extendedProps: { ...s }
      };
    });
  }, [sessions]);

  // Today's classes filter
  const todayClasses = useMemo(() => {
    const todayStr = new Date().toISOString().split("T")[0];
    return sessions.filter(s => s.start.startsWith(todayStr) && s.status === "Scheduled");
  }, [sessions]);

  // legacy self practice submit handler
  const handleSelfSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSelfError("");
    setSelfSuccess("");
    setSelfLoading(true);

    const res = await submitLecture(userId, selfNotes);
    setSelfLoading(false);
    if (!res.success) {
      setSelfError(res.error || "Failed to submit lecture log.");
    } else {
      setSelfSuccess("Lecture log successfully recorded!");
      router.refresh();
    }
  };

  // Leave Submit Handler
  const handleLeaveSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLeaveError("");
    setLeaveSuccess("");
    setLeaveLoading(true);

    const res = await requestLeave(
      userId,
      new Date(leaveStart),
      new Date(leaveEnd),
      leaveReason || undefined
    );

    setLeaveLoading(false);
    if (!res.success) {
      setLeaveError(res.error || "Failed to submit leave request.");
    } else {
      setLeaveSuccess("Leave request submitted successfully for approval!");
      setLeaveStart("");
      setLeaveEnd("");
      setLeaveReason("");
      router.refresh();
    }
  };

  // Cancel Session submit
  const handleCancelSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedSession) return;
    setModalError("");
    setModalLoading(true);

    const res = await cancelSession(selectedSession.id, sessionNotes || undefined);
    setModalLoading(false);
    if (!res.success) {
      setModalError(res.error || "Failed to cancel session.");
    } else {
      setIsCancelOpen(false);
      router.refresh();
    }
  };

  // Complete Session submit (attendance + progress logs)
  const handleCompleteSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedSession) return;
    setModalError("");
    setModalLoading(true);

    // 1. Complete Session & log Attendance
    const attendRes = await completeSession(
      selectedSession.id,
      trainerPresent,
      customerPresent,
      sessionNotes || undefined
    );

    if (!attendRes.success) {
      setModalError(attendRes.error || "Failed to log session attendance.");
      setModalLoading(false);
      return;
    }

    // 2. Submit customer progress logs
    const progressRes = await submitProgressLog({
      sessionId: selectedSession.id,
      customerId: selectedSession.customerId,
      trainerId: userId,
      flexibility: Number(flexibility),
      balance: Number(balance),
      breathing: Number(breathing),
      focus: Number(focus),
      stress: Number(stress),
      weight: weight ? Number(weight) : undefined,
      remarks: progressRemarks || undefined
    });

    setModalLoading(false);
    if (!progressRes.success) {
      setModalError(progressRes.error || "Session completed, but failed to save progress indicators.");
    } else {
      setIsCompleteOpen(false);
      router.refresh();
    }
  };

  const handleOpenComplete = (s: SessionData) => {
    setSelectedSession(s);
    setTrainerPresent(true);
    setCustomerPresent(true);
    setSessionNotes("");
    setFlexibility(5);
    setBalance(5);
    setBreathing(5);
    setFocus(5);
    setStress(5);
    setWeight("");
    setProgressRemarks("");
    setModalError("");
    setIsCompleteOpen(true);
  };

  const handleOpenCancel = (s: SessionData) => {
    setSelectedSession(s);
    setSessionNotes("");
    setModalError("");
    setIsCancelOpen(true);
  };

  return (
    <div className="space-y-6">
      
      {/* Navigation Tabs Bar */}
      <div className="flex border-b border-cream-dark/60 overflow-x-auto gap-2">
        <button
          onClick={() => setActiveTab("classes")}
          className={`px-5 py-3 border-b-2 font-bold text-sm transition-all whitespace-nowrap ${
            activeTab === "classes" ? "border-deep-teal text-deep-teal" : "border-transparent text-text-muted hover:text-text-dark"
          }`}
        >
          Today's Classes
        </button>
        <button
          onClick={() => setActiveTab("calendar")}
          className={`px-5 py-3 border-b-2 font-bold text-sm transition-all whitespace-nowrap ${
            activeTab === "calendar" ? "border-deep-teal text-deep-teal" : "border-transparent text-text-muted hover:text-text-dark"
          }`}
        >
          Session Calendar
        </button>
        <button
          onClick={() => setActiveTab("customers")}
          className={`px-5 py-3 border-b-2 font-bold text-sm transition-all whitespace-nowrap ${
            activeTab === "customers" ? "border-deep-teal text-deep-teal" : "border-transparent text-text-muted hover:text-text-dark"
          }`}
        >
          My Customers
        </button>
        <button
          onClick={() => setActiveTab("leaves")}
          className={`px-5 py-3 border-b-2 font-bold text-sm transition-all whitespace-nowrap ${
            activeTab === "leaves" ? "border-deep-teal text-deep-teal" : "border-transparent text-text-muted hover:text-text-dark"
          }`}
        >
          Leave Requests
        </button>
        <button
          onClick={() => setActiveTab("self-practice")}
          className={`px-5 py-3 border-b-2 font-bold text-sm transition-all whitespace-nowrap ${
            activeTab === "self-practice" ? "border-deep-teal text-deep-teal" : "border-transparent text-text-muted hover:text-text-dark"
          }`}
        >
          Daily Self-Practice Logs
        </button>
      </div>

      {/* Tab 1: Today's Classes */}
      {activeTab === "classes" && (
        <Card className="bg-white border border-cream-dark p-6 shadow-xs">
          <CardHeader className="px-0 pt-0">
            <CardTitle className="text-lg font-bold text-deep-teal">Today's Class Schedule</CardTitle>
            <CardDescription>Select a scheduled session to record progress ratings and finalize attendance logs.</CardDescription>
          </CardHeader>
          <CardContent className="px-0 pt-4 space-y-4">
            {todayClasses.length === 0 ? (
              <p className="text-sm text-text-muted text-center py-8 bg-warm-cream/10 rounded-xl border border-dashed border-cream-dark">No live classes scheduled for today.</p>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {todayClasses.map(s => (
                  <div key={s.id} className="p-5 border border-cream-dark rounded-xl space-y-4 flex flex-col justify-between hover:border-deep-teal/40 hover:shadow-xs transition-all">
                    <div className="space-y-2">
                      <span className="text-[10px] uppercase font-bold text-terracotta-rose tracking-wider">
                        {new Date(s.start).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} - {new Date(s.end).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                      <h4 className="font-bold text-base text-text-dark">{s.title}</h4>
                      <p className="text-xs text-text-muted">Client: {s.customerName}</p>
                    </div>
                    
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleOpenComplete(s)}
                        className="flex-grow px-4 py-2 rounded-full bg-deep-teal hover:bg-deep-teal/90 text-white font-semibold text-xs transition-colors text-center"
                      >
                        Complete Session
                      </button>
                      <button
                        onClick={() => handleOpenCancel(s)}
                        className="px-4 py-2 rounded-full border border-red-200 text-red-600 hover:bg-red-50 font-semibold text-xs transition-all text-center"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Tab 2: Calendar */}
      {activeTab === "calendar" && (
        <Card className="bg-white border border-cream-dark p-6 shadow-xs">
          <div className="calendar-container">
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
            />
          </div>
        </Card>
      )}

      {/* Tab 3: My Customers */}
      {activeTab === "customers" && (
        <Card className="bg-white border border-cream-dark shadow-xs overflow-hidden">
          <CardHeader className="p-6 border-b border-cream-dark/50 bg-warm-cream/10">
            <CardTitle className="text-base font-bold text-text-dark">Assigned Practice Clients</CardTitle>
            <CardDescription>Directory of customers linked to your training schedules.</CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            {customers.length === 0 ? (
              <p className="text-sm text-text-muted text-center py-12">No customers assigned to you yet.</p>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Customer Name</TableHead>
                    <TableHead>Contact Email</TableHead>
                    <TableHead>Location & Phone</TableHead>
                    <TableHead>Active Subscription Plan</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {customers.map(c => (
                    <TableRow key={c.id} className="hover:bg-warm-cream/10">
                      <TableCell className="font-semibold text-text-dark text-sm">{c.name}</TableCell>
                      <TableCell className="text-sm text-text-muted">{c.email}</TableCell>
                      <TableCell>
                        <div className="text-sm text-text-dark">{c.country}</div>
                        <div className="text-xs text-text-muted mt-0.5">{c.phone}</div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="default" className="text-xs">{c.activePlanTitle}</Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      )}

      {/* Tab 4: Leave Requests */}
      {activeTab === "leaves" && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Card className="bg-white border border-cream-dark p-6 shadow-xs lg:col-span-1 h-fit">
            <CardHeader className="px-0 pt-0">
              <CardTitle className="text-base font-bold text-deep-teal">Request Time-Off</CardTitle>
              <CardDescription>File holiday or medical leave requests.</CardDescription>
            </CardHeader>
            <CardContent className="px-0 pt-4">
              <form onSubmit={handleLeaveSubmit} className="space-y-4">
                {leaveError && <div className="bg-red-50 text-red-700 border border-red-200/50 p-3 rounded-lg text-xs font-semibold">{leaveError}</div>}
                {leaveSuccess && <div className="bg-green-50 text-green-700 border border-green-200/50 p-3 rounded-lg text-xs font-semibold">{leaveSuccess}</div>}
                
                <div className="space-y-1">
                  <label className="text-xs uppercase font-bold tracking-wider text-text-muted">Start Date</label>
                  <input
                    type="date"
                    required
                    value={leaveStart}
                    onChange={(e) => setLeaveStart(e.target.value)}
                    className="w-full bg-transparent border-b border-text-dark/20 py-2.5 focus:outline-none focus:border-deep-teal text-sm text-text-dark"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs uppercase font-bold tracking-wider text-text-muted">End Date</label>
                  <input
                    type="date"
                    required
                    value={leaveEnd}
                    onChange={(e) => setLeaveEnd(e.target.value)}
                    className="w-full bg-transparent border-b border-text-dark/20 py-2.5 focus:outline-none focus:border-deep-teal text-sm text-text-dark"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs uppercase font-bold tracking-wider text-text-muted">Reason / Remarks</label>
                  <Input
                    type="text"
                    required
                    value={leaveReason}
                    onChange={(e) => setLeaveReason(e.target.value)}
                    placeholder="e.g. Family trip or medical leave"
                  />
                </div>
                <Button type="submit" disabled={leaveLoading} fullWidth>
                  {leaveLoading ? "Submitting..." : "Submit Leave Request"}
                </Button>
              </form>
            </CardContent>
          </Card>

          <Card className="bg-white border border-cream-dark shadow-xs lg:col-span-2 overflow-hidden">
            <CardHeader className="p-6 border-b border-cream-dark/50 bg-warm-cream/10">
              <CardTitle className="text-base font-bold text-text-dark">Time-Off Requests History</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              {leaves.length === 0 ? (
                <p className="text-sm text-text-muted text-center py-12">No leave requests logged yet.</p>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Dates Range</TableHead>
                      <TableHead>Reason</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {leaves.map(l => (
                      <TableRow key={l.id}>
                        <TableCell className="font-semibold text-text-dark text-sm">
                          {new Date(l.startDate).toLocaleDateString()} - {new Date(l.endDate).toLocaleDateString()}
                        </TableCell>
                        <TableCell className="text-sm text-text-muted">{l.reason}</TableCell>
                        <TableCell>
                          <Badge variant={
                            l.status === "Approved" ? "success" : 
                            (l.status === "Pending" ? "warning" : "destructive")
                          }>
                            {l.status}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </div>
      )}

      {/* Tab 5: Legacy Self-Practice Log */}
      {activeTab === "self-practice" && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Submission Form Card */}
          <Card className="lg:col-span-1 border border-cream-dark shadow-xs bg-white h-fit">
            <CardHeader>
              <CardTitle className="text-lg font-bold text-deep-teal">Log Today's practice</CardTitle>
              <CardDescription>
                Submit your daily 1-hour self-practice sheet.
              </CardDescription>
            </CardHeader>
            <CardContent>
              {isTodayCompleted ? (
                <div className="bg-green-50 text-green-800 border border-green-200 p-5 rounded-xl space-y-4">
                  <div className="flex items-center gap-2 font-bold text-sm">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2.5" stroke="currentColor" className="w-5 h-5 text-green-600">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
                    </svg>
                    Yoga Practice Logged!
                  </div>
                  <p className="text-xs">
                    You have successfully submitted your daily practice sheet for today. Keep up the high consistency!
                  </p>
                  {todaySubmittedTime && (
                    <div className="text-[10px] text-green-700 font-semibold bg-white px-2 py-1.5 rounded-lg border border-green-200">
                      Logged At: {todaySubmittedTime}
                    </div>
                  )}
                  {todayNotes && (
                    <div className="text-xs bg-white/70 p-3 rounded-lg border border-green-200/50">
                      <span className="font-bold block text-[10px] text-text-muted uppercase">Notes:</span>
                      <span className="italic">"{todayNotes}"</span>
                    </div>
                  )}
                </div>
              ) : (
                <form onSubmit={handleSelfSubmit} className="space-y-4">
                  {selfError && <div className="bg-red-50 text-red-700 border border-red-200/50 p-3 rounded-lg text-xs font-semibold">{selfError}</div>}
                  {selfSuccess && <div className="bg-green-50 text-green-700 border border-green-200/50 p-3 rounded-lg text-xs font-semibold">{selfSuccess}</div>}

                  <div className="space-y-1">
                    <label htmlFor="self-notes" className="text-xs uppercase font-bold tracking-wider text-text-muted">Daily reflections / Notes</label>
                    <textarea
                      id="self-notes"
                      value={selfNotes}
                      onChange={(e) => setSelfNotes(e.target.value)}
                      placeholder="Share reflections on your breathing, flexibility, or flow focus today (max 500 chars)..."
                      maxLength={500}
                      className="w-full min-h-[120px] bg-transparent border border-cream-dark/80 rounded-xl p-3 focus:outline-none focus:border-deep-teal text-sm text-text-dark transition-colors placeholder:text-text-muted/60"
                    />
                    <span className="text-[10px] text-text-muted block text-right mt-0.5">{selfNotes.length}/500 chars</span>
                  </div>
                  <Button type="submit" disabled={selfLoading} fullWidth>
                    {selfLoading ? "Logging..." : "Submit Log Sheet"}
                  </Button>
                </form>
              )}
            </CardContent>
          </Card>

          {/* Stats Summary Dashboard */}
          <div className="lg:col-span-2 space-y-6">
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
              <Card className="bg-white border border-cream-dark shadow-xs text-center p-5">
                <p className="text-[10px] uppercase font-bold text-text-muted tracking-wider">Completed Logs</p>
                <h4 className="text-3xl font-black text-green-700 mt-2">{stats.completedDays} days</h4>
              </Card>
              <Card className="bg-white border border-cream-dark shadow-xs text-center p-5">
                <p className="text-[10px] uppercase font-bold text-text-muted tracking-wider">Completion Rate</p>
                <h4 className="text-3xl font-black text-deep-teal mt-2">{stats.completionRate}%</h4>
              </Card>
              <Card className="bg-white border border-cream-dark shadow-xs text-center p-5 col-span-2 sm:col-span-1">
                <p className="text-[10px] uppercase font-bold text-text-muted tracking-wider">Current Streak</p>
                <h4 className="text-3xl font-black text-logo-gold mt-2">{stats.currentStreak} 🔥</h4>
              </Card>
            </div>

            <Card className="bg-white border border-cream-dark p-6 shadow-xs space-y-4">
              <h3 className="font-serif text-lg font-bold text-deep-teal">Practice Streak Record</h3>
              <p className="text-sm text-text-muted">
                Your historical longest practice streak is <strong className="text-text-dark font-bold">{stats.longestStreak} consecutive days</strong>. Keep practicing daily to set a new record!
              </p>
            </Card>
          </div>
        </div>
      )}

      {/* DIALOG 1: Complete Session Form Modal (Attendance + Progress Logs) */}
      <Dialog isOpen={isCompleteOpen} onClose={() => setIsCompleteOpen(false)} title="Complete Class Session">
        <form onSubmit={handleCompleteSubmit} className="space-y-4">
          {modalError && <div className="bg-red-50 text-red-700 border border-red-200/50 p-3 rounded-lg text-xs font-semibold">{modalError}</div>}
          
          <h4 className="font-bold text-sm text-deep-teal uppercase tracking-wider border-b pb-1">1. Attendance Record</h4>
          <div className="flex gap-6 items-center">
            <label className="flex items-center gap-2 text-sm text-text-dark font-semibold">
              <input
                type="checkbox"
                checked={trainerPresent}
                onChange={(e) => setTrainerPresent(e.target.checked)}
                className="w-4 h-4 rounded text-deep-teal focus:ring-deep-teal"
              />
              Instructor Present
            </label>
            <label className="flex items-center gap-2 text-sm text-text-dark font-semibold">
              <input
                type="checkbox"
                checked={customerPresent}
                onChange={(e) => setCustomerPresent(e.target.checked)}
                className="w-4 h-4 rounded text-deep-teal focus:ring-deep-teal"
              />
              Customer Present
            </label>
          </div>

          <div className="space-y-1">
            <label className="text-xs uppercase font-bold tracking-wider text-text-muted">Attendance Remarks</label>
            <Input
              type="text"
              value={sessionNotes}
              onChange={(e) => setSessionNotes(e.target.value)}
              placeholder="e.g. Customer logged in on time and completed Vinyasa flow."
            />
          </div>

          <h4 className="font-bold text-sm text-deep-teal uppercase tracking-wider border-b pb-1 pt-3">2. Fitness & Meditation Progress Logs</h4>
          <p className="text-xs text-text-muted">Rate customer's progress indicators on a scale of 1 (Needs focus) to 10 (Excellent).</p>
          
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
            <div className="space-y-1">
              <label className="text-[10px] uppercase font-bold text-text-muted">Flexibility</label>
              <input
                type="number"
                min="1"
                max="10"
                required
                value={flexibility}
                onChange={(e) => setFlexibility(Number(e.target.value))}
                className="w-full bg-transparent border-b border-text-dark/20 py-2 text-sm font-bold focus:outline-none focus:border-deep-teal text-center"
              />
            </div>
            <div className="space-y-1">
              <label className="text-[10px] uppercase font-bold text-text-muted">Balance</label>
              <input
                type="number"
                min="1"
                max="10"
                required
                value={balance}
                onChange={(e) => setBalance(Number(e.target.value))}
                className="w-full bg-transparent border-b border-text-dark/20 py-2 text-sm font-bold focus:outline-none focus:border-deep-teal text-center"
              />
            </div>
            <div className="space-y-1">
              <label className="text-[10px] uppercase font-bold text-text-muted">Breathing</label>
              <input
                type="number"
                min="1"
                max="10"
                required
                value={breathing}
                onChange={(e) => setBreathing(Number(e.target.value))}
                className="w-full bg-transparent border-b border-text-dark/20 py-2 text-sm font-bold focus:outline-none focus:border-deep-teal text-center"
              />
            </div>
            <div className="space-y-1">
              <label className="text-[10px] uppercase font-bold text-text-muted">Focus</label>
              <input
                type="number"
                min="1"
                max="10"
                required
                value={focus}
                onChange={(e) => setFocus(Number(e.target.value))}
                className="w-full bg-transparent border-b border-text-dark/20 py-2 text-sm font-bold focus:outline-none focus:border-deep-teal text-center"
              />
            </div>
            <div className="space-y-1">
              <label className="text-[10px] uppercase font-bold text-text-muted">Stress Red.</label>
              <input
                type="number"
                min="1"
                max="10"
                required
                value={stress}
                onChange={(e) => setStress(Number(e.target.value))}
                className="w-full bg-transparent border-b border-text-dark/20 py-2 text-sm font-bold focus:outline-none focus:border-deep-teal text-center"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
            <div className="sm:col-span-1 space-y-1">
              <label className="text-xs uppercase font-bold tracking-wider text-text-muted">Weight (kg)</label>
              <Input
                type="number"
                step="0.1"
                value={weight}
                onChange={(e) => setWeight(e.target.value)}
                placeholder="e.g. 68.5"
              />
            </div>
            <div className="sm:col-span-2 space-y-1">
              <label className="text-xs uppercase font-bold tracking-wider text-text-muted">Progress Remarks</label>
              <Input
                type="text"
                value={progressRemarks}
                onChange={(e) => setProgressRemarks(e.target.value)}
                placeholder="e.g. Emily showed significant hold improvements during Sirsasana."
              />
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-6 border-t mt-4">
            <button
              type="button"
              onClick={() => setIsCompleteOpen(false)}
              className="px-5 py-2.5 rounded-full border border-text-dark/20 text-text-dark hover:bg-cream-dark/50 font-semibold text-sm transition-colors"
            >
              Cancel
            </button>
            <Button type="submit" disabled={modalLoading}>
              {modalLoading ? "Saving Class..." : "Record & Complete Class"}
            </Button>
          </div>
        </form>
      </Dialog>

      {/* DIALOG 2: Cancel Session Modal */}
      <Dialog isOpen={isCancelOpen} onClose={() => setIsCancelOpen(false)} title="Cancel Class Session">
        <form onSubmit={handleCancelSubmit} className="space-y-4">
          {modalError && <div className="bg-red-50 text-red-700 border border-red-200/50 p-3 rounded-lg text-xs font-semibold">{modalError}</div>}
          <p className="text-sm text-text-muted">
            Provide a cancellation reason to notify customer <strong className="text-text-dark">{selectedSession?.customerName}</strong>.
          </p>
          <div className="space-y-1">
            <label className="text-xs uppercase font-bold tracking-wider text-text-muted">Cancellation Reason</label>
            <Input
              type="text"
              required
              value={sessionNotes}
              onChange={(e) => setSessionNotes(e.target.value)}
              placeholder="e.g. Instructor emergency or holiday closure"
            />
          </div>
          <div className="flex justify-end gap-3 pt-3">
            <button
              type="button"
              onClick={() => setIsCancelOpen(false)}
              className="px-5 py-2.5 rounded-full border border-text-dark/20 text-text-dark hover:bg-cream-dark/50 font-semibold text-sm transition-colors"
            >
              Cancel
            </button>
            <Button type="submit" disabled={modalLoading} variant="primary">
              {modalLoading ? "Cancelling..." : "Confirm Cancellation"}
            </Button>
          </div>
        </form>
      </Dialog>

    </div>
  );
}
