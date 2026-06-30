"use client";

import React, { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { 
  addEmployee, 
  editEmployee, 
  deleteEmployee, 
  resetEmployeePassword 
} from "@/actions/trainer";
import { updateLeaveStatus } from "@/actions/session";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/Table";
import { Dialog, ConfirmationDialog } from "@/components/ui/Dialog";
import { Badge } from "@/components/ui/Badge";
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

interface Trainer {
  id: string;
  name: string;
  email: string;
  createdAt: string;
  completedThisMonth: number;
  missedThisMonth: number;
  completionRate: number;
  lectures: LectureLog[];
}

interface TrainerLeave {
  id: string;
  trainerName: string;
  startDate: string;
  endDate: string;
  reason: string;
  status: string;
}

interface TrainerDirectoryClientProps {
  employees: Trainer[];
  leaves: TrainerLeave[];
}

export default function TrainerDirectoryClient({ employees, leaves }: TrainerDirectoryClientProps) {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<"trainers" | "leaves">("trainers");

  // Search filter state
  const [searchQuery, setSearchQuery] = useState("");

  // Modals state
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isResetOpen, setIsResetOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);

  // Selected trainer for actions
  const [selectedEmp, setSelectedEmp] = useState<Trainer | null>(null);

  // Form states
  const [newName, setNewName] = useState("");
  const [newEmail, setNewEmail] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [formError, setFormError] = useState("");
  const [loading, setLoading] = useState(false);

  // Calendar detailed day state
  const [selectedDayDetail, setSelectedDayDetail] = useState<{
    date: string;
    status: "Completed" | "Missed";
    notes: string | null;
    time: string | null;
  } | null>(null);

  // Filtered trainers
  const filteredEmployees = useMemo(() => {
    return employees.filter(
      (emp) =>
        emp.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        emp.email.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [employees, searchQuery]);

  // Open Handlers
  const handleOpenEdit = (emp: Trainer) => {
    setSelectedEmp(emp);
    setNewName(emp.name);
    setNewEmail(emp.email);
    setFormError("");
    setIsEditOpen(true);
  };

  const handleOpenReset = (emp: Trainer) => {
    setSelectedEmp(emp);
    setNewPassword("");
    setFormError("");
    setIsResetOpen(true);
  };

  const handleOpenDelete = (emp: Trainer) => {
    setSelectedEmp(emp);
    setFormError("");
    setIsDeleteOpen(true);
  };

  const handleOpenCalendar = (emp: Trainer) => {
    setSelectedEmp(emp);
    setSelectedDayDetail(null);
    setIsCalendarOpen(true);
  };

  // Submit Handlers
  const handleAddSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError("");
    setLoading(true);

    const res = await addEmployee({
      name: newName,
      email: newEmail,
      password: newPassword
    });

    setLoading(false);
    if (!res.success) {
      setFormError(res.error || "Failed to create employee");
    } else {
      setIsAddOpen(false);
      setNewName("");
      setNewEmail("");
      setNewPassword("");
      router.refresh();
    }
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedEmp) return;
    setFormError("");
    setLoading(true);

    const res = await editEmployee({
      id: selectedEmp.id,
      name: newName,
      email: newEmail
    });

    setLoading(false);
    if (!res.success) {
      setFormError(res.error || "Failed to update employee");
    } else {
      setIsEditOpen(false);
      router.refresh();
    }
  };

  const handleResetSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedEmp) return;
    setFormError("");
    setLoading(true);

    const res = await resetEmployeePassword(selectedEmp.id, newPassword);

    setLoading(false);
    if (!res.success) {
      setFormError(res.error || "Failed to reset password");
    } else {
      setIsResetOpen(false);
      alert("Password reset successfully!");
    }
  };

  const handleDeleteConfirm = async () => {
    if (!selectedEmp) return;
    setLoading(true);
    const res = await deleteEmployee(selectedEmp.id);
    setLoading(false);
    if (!res.success) {
      alert(res.error || "Failed to delete employee");
    } else {
      setIsDeleteOpen(false);
      router.refresh();
    }
  };

  // Streaks calculation helper for selected user's calendar view
  const calendarStats = useMemo(() => {
    if (!selectedEmp) return null;

    const lectures = selectedEmp.lectures;
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
  }, [selectedEmp]);

  // FullCalendar events array
  const calendarEvents = useMemo(() => {
    if (!selectedEmp) return [];

    const events: any[] = [];
    const completedDaysSet = new Set<string>();

    // Add completed events
    selectedEmp.lectures.forEach((lec) => {
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

    // Generate missed events dynamically starting from the user's registration date or start of the year
    const regDate = new Date(selectedEmp.createdAt);
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
  }, [selectedEmp]);

  const handleDateClick = (arg: any) => {
    // Locate event for this date
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
      // Future or registry-before date
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
  const handleLeaveAction = async (leaveId: string, status: "Approved" | "Rejected") => {
    setLoading(true);
    const res = await updateLeaveStatus(leaveId, status);
    setLoading(false);
    if (res.success) {
      router.refresh();
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Navigation Tabs */}
      <div className="flex border-b border-cream-dark/60 gap-2 mb-6">
        <button
          onClick={() => setActiveTab("trainers")}
          className={`px-5 py-3 border-b-2 font-bold text-sm transition-all ${
            activeTab === "trainers" ? "border-deep-teal text-deep-teal" : "border-transparent text-text-muted hover:text-text-dark"
          }`}
        >
          Trainers Directory
        </button>
        <button
          onClick={() => setActiveTab("leaves")}
          className={`px-5 py-3 border-b-2 font-bold text-sm transition-all ${
            activeTab === "leaves" ? "border-deep-teal text-deep-teal" : "border-transparent text-text-muted hover:text-text-dark"
          }`}
        >
          Leave Requests ({leaves.filter(l => l.status === "Pending").length})
        </button>
      </div>

      {activeTab === "trainers" ? (
        <>
          {/* Header and Add Button */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h2 className="font-serif text-3xl font-bold text-deep-teal">Trainer Directory</h2>
              <p className="text-text-muted text-sm mt-0.5">Create, edit, deactivate, and view calendars of yoga instructors.</p>
            </div>
            <Button 
              type="button" 
              onClick={() => {
                setFormError("");
                setNewName("");
                setNewEmail("");
                setNewPassword("");
                setIsAddOpen(true);
              }}
              className="rounded-full"
            >
              Add New Trainer
            </Button>
          </div>

          {/* Search Filter Card */}
          <Card>
            <CardContent className="p-4 flex items-center gap-3">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2.5" stroke="currentColor" className="w-5 h-5 text-text-muted shrink-0">
                <path strokeLinecap="round" strokeLinejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.602 10.602Z" />
              </svg>
              <Input
                type="text"
                placeholder="Search trainers by name or email..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="border-none bg-transparent focus-visible:ring-0 shadow-none p-0 w-full"
              />
            </CardContent>
          </Card>

          {/* Directory Table Card */}
          <Card className="overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Trainer</TableHead>
                  <TableHead className="text-center">Completed (Month)</TableHead>
                  <TableHead className="text-center">Missed (Month)</TableHead>
                  <TableHead className="text-center">Completion Rate</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredEmployees.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center text-text-muted py-8">
                      No trainers found matching filter.
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredEmployees.map((emp) => (
                <TableRow key={emp.id}>
                  
                  {/* Name and Email */}
                  <TableCell>
                    <div className="font-bold text-text-dark">{emp.name}</div>
                    <div className="text-xs text-text-muted mt-0.5">{emp.email}</div>
                  </TableCell>

                  {/* Completed This Month */}
                  <TableCell className="text-center font-bold text-green-700">
                    {emp.completedThisMonth}
                  </TableCell>

                  {/* Missed This Month */}
                  <TableCell className="text-center font-bold text-red-600">
                    {emp.missedThisMonth}
                  </TableCell>

                  {/* Completion Rate */}
                  <TableCell className="text-center">
                    <div className="flex items-center justify-center gap-2">
                      <div className="w-16 bg-cream-dark/50 h-2 rounded-full overflow-hidden hidden sm:block">
                        <div 
                          className="h-full bg-deep-teal rounded-full" 
                          style={{ width: `${emp.completionRate}%` }} 
                        />
                      </div>
                      <Badge variant={emp.completionRate >= 80 ? "success" : emp.completionRate >= 50 ? "warning" : "destructive"}>
                        {emp.completionRate}%
                      </Badge>
                    </div>
                  </TableCell>

                  {/* Action Commands */}
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-1.5">
                      
                      {/* View Calendar */}
                      <button
                        onClick={() => handleOpenCalendar(emp)}
                        title="View Attendance Calendar"
                        className="p-2 text-deep-teal hover:bg-deep-teal/5 rounded-full transition-colors"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor" className="w-4 h-4">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 0 1 2.25-2.25h13.5A2.25 2.25 0 0 1 21 7.5v11.25m-18 0A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75m-18 0v-7.5A2.25 2.25 0 0 1 5.25 9h13.5A2.25 2.25 0 0 1 21 11.25v7.5m-9-6h.008v.008H12v-.008ZM12 15h.008v.008H12V15Zm0 2.25h.008v.008H12v-.008ZM9.75 15h.008v.008H9.75V15Zm0 2.25h.008v.008H9.75v-.008ZM7.5 15h.008v.008H7.5V15Zm0 2.25h.008v.008H7.5v-.008Zm6.75-4.5h.008v.008h-.008v-.008Zm0 2.25h.008v.008h-.008V15Zm0 2.25h.008v.008h-.008v-.008Zm2.25-4.5h.008v.008H16.5v-.008Zm0 2.25h.008v.008H16.5V15Z" />
                        </svg>
                      </button>

                      {/* Edit Details */}
                      <button
                        onClick={() => handleOpenEdit(emp)}
                        title="Edit Details"
                        className="p-2 text-text-muted hover:text-text-dark hover:bg-cream-dark/50 rounded-full transition-colors"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor" className="w-4 h-4">
                          <path strokeLinecap="round" strokeLinejoin="round" d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L6.832 19.82a4.5 4.5 0 0 1-1.897 1.13l-2.685.8.8-2.685a4.5 4.5 0 0 1 1.13-1.897L16.863 4.487Zm0 0L19.5 7.125" />
                        </svg>
                      </button>

                      {/* Reset Password */}
                      <button
                        onClick={() => handleOpenReset(emp)}
                        title="Reset Password"
                        className="p-2 text-logo-gold hover:bg-yellow-50 rounded-full transition-colors"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor" className="w-4 h-4">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 5.25a3 3 0 0 1 3 3m3 0a6 6 0 0 1-7.029 5.912c-.563-.097-1.159.026-1.563.43L10.5 17.25H8.25v2.25H6v2.25H2.25v-2.818c0-.597.237-1.17.659-1.591l6.499-6.499c.404-.404.527-1 .43-1.563A6 6 0 1 1 21.75 8.25Z" />
                        </svg>
                      </button>

                      {/* Delete */}
                      <button
                        onClick={() => handleOpenDelete(emp)}
                        title="Delete Account"
                        className="p-2 text-red-600 hover:bg-red-50 rounded-full transition-colors"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor" className="w-4 h-4">
                          <path strokeLinecap="round" strokeLinejoin="round" d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0" />
                        </svg>
                      </button>

                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </Card>
        </>
      ) : (
        <Card className="bg-white border border-cream-dark shadow-xs overflow-hidden">
          <CardHeader className="p-6 border-b border-cream-dark/50 bg-warm-cream/10">
            <CardTitle className="text-base font-bold text-text-dark">Trainer Leaves Management</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            {leaves.length === 0 ? (
              <p className="text-sm text-text-muted text-center py-12">No leave requests logged on the platform.</p>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Trainer</TableHead>
                    <TableHead>Dates Range</TableHead>
                    <TableHead>Reason</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {leaves.map((l) => (
                    <TableRow key={l.id}>
                      <TableCell className="font-semibold text-text-dark text-sm">{l.trainerName}</TableCell>
                      <TableCell className="text-sm text-text-dark">
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
                      <TableCell className="text-right">
                        {l.status === "Pending" && (
                          <div className="flex gap-2 justify-end">
                            <button
                              onClick={() => handleLeaveAction(l.id, "Approved")}
                              className="px-3 py-1.5 rounded-full bg-green-50 hover:bg-green-100 text-green-700 font-bold text-xs transition-colors"
                            >
                              Approve
                            </button>
                            <button
                              onClick={() => handleLeaveAction(l.id, "Rejected")}
                              className="px-3 py-1.5 rounded-full bg-red-50 hover:bg-red-100 text-red-600 font-bold text-xs transition-colors"
                            >
                              Reject
                            </button>
                          </div>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      )}

      {/* DIALOG 1: Add Employee Modal */}
      <Dialog isOpen={isAddOpen} onClose={() => setIsAddOpen(false)} title="Add New Employee">
        <form onSubmit={handleAddSubmit} className="space-y-4">
          {formError && (
            <div className="bg-red-50 text-red-700 border border-red-200/50 p-3 rounded-lg text-sm font-semibold">
              {formError}
            </div>
          )}
          <div className="space-y-1">
            <label className="text-xs uppercase font-bold tracking-wider text-text-muted">Full Name</label>
            <Input
              type="text"
              required
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              placeholder="e.g. Jane Doe"
            />
          </div>
          <div className="space-y-1">
            <label className="text-xs uppercase font-bold tracking-wider text-text-muted">Email Address</label>
            <Input
              type="email"
              required
              value={newEmail}
              onChange={(e) => setNewEmail(e.target.value)}
              placeholder="e.g. jane.doe@company.com"
            />
          </div>
          <div className="space-y-1">
            <label className="text-xs uppercase font-bold tracking-wider text-text-muted">Initial Password</label>
            <Input
              type="password"
              required
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="Min. 6 characters"
            />
          </div>
          <div className="flex justify-end gap-3 pt-3">
            <button
              type="button"
              onClick={() => setIsAddOpen(false)}
              className="px-5 py-2.5 rounded-full border border-text-dark/20 text-text-dark hover:bg-cream-dark/50 font-semibold text-sm transition-colors"
            >
              Cancel
            </button>
            <Button type="submit" disabled={loading}>
              {loading ? "Adding..." : "Add Employee"}
            </Button>
          </div>
        </form>
      </Dialog>

      {/* DIALOG 2: Edit Employee Modal */}
      <Dialog isOpen={isEditOpen} onClose={() => setIsEditOpen(false)} title="Edit Employee Details">
        <form onSubmit={handleEditSubmit} className="space-y-4">
          {formError && (
            <div className="bg-red-50 text-red-700 border border-red-200/50 p-3 rounded-lg text-sm font-semibold">
              {formError}
            </div>
          )}
          <div className="space-y-1">
            <label className="text-xs uppercase font-bold tracking-wider text-text-muted">Full Name</label>
            <Input
              type="text"
              required
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
            />
          </div>
          <div className="space-y-1">
            <label className="text-xs uppercase font-bold tracking-wider text-text-muted">Email Address</label>
            <Input
              type="email"
              required
              value={newEmail}
              onChange={(e) => setNewEmail(e.target.value)}
            />
          </div>
          <div className="flex justify-end gap-3 pt-3">
            <button
              type="button"
              onClick={() => setIsEditOpen(false)}
              className="px-5 py-2.5 rounded-full border border-text-dark/20 text-text-dark hover:bg-cream-dark/50 font-semibold text-sm transition-colors"
            >
              Cancel
            </button>
            <Button type="submit" disabled={loading}>
              {loading ? "Saving..." : "Save Changes"}
            </Button>
          </div>
        </form>
      </Dialog>

      {/* DIALOG 3: Reset Password Modal */}
      <Dialog isOpen={isResetOpen} onClose={() => setIsResetOpen(false)} title="Reset Password">
        <form onSubmit={handleResetSubmit} className="space-y-4">
          {formError && (
            <div className="bg-red-50 text-red-700 border border-red-200/50 p-3 rounded-lg text-sm font-semibold">
              {formError}
            </div>
          )}
          <p className="text-sm text-text-muted">
            Enter a new password for employee <strong className="text-text-dark">{selectedEmp?.name}</strong>.
          </p>
          <div className="space-y-1">
            <label className="text-xs uppercase font-bold tracking-wider text-text-muted">New Password</label>
            <Input
              type="password"
              required
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="Min. 6 characters"
            />
          </div>
          <div className="flex justify-end gap-3 pt-3">
            <button
              type="button"
              onClick={() => setIsResetOpen(false)}
              className="px-5 py-2.5 rounded-full border border-text-dark/20 text-text-dark hover:bg-cream-dark/50 font-semibold text-sm transition-colors"
            >
              Cancel
            </button>
            <Button type="submit" disabled={loading}>
              {loading ? "Resetting..." : "Reset Password"}
            </Button>
          </div>
        </form>
      </Dialog>

      {/* DIALOG 4: Delete Confirmation Modal */}
      <ConfirmationDialog
        isOpen={isDeleteOpen}
        onClose={() => setIsDeleteOpen(false)}
        onConfirm={handleDeleteConfirm}
        title="Delete Employee Account"
        message={`Are you sure you want to permanently delete the account for ${selectedEmp?.name}? All their yoga lecture tracking records will be removed. This action cannot be undone.`}
        confirmText="Permanently Delete"
        isDestructive={true}
        isLoading={loading}
      />

      {/* DIALOG 5: Attendance Calendar Modal */}
      <Dialog 
        isOpen={isCalendarOpen} 
        onClose={() => setIsCalendarOpen(false)} 
        title={`${selectedEmp?.name}'s Attendance`}
      >
        <div className="space-y-6 max-h-[80vh] overflow-y-auto pr-2">
          
          {/* Stats Bar */}
          {calendarStats && (
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 bg-cream-dark/30 p-4 rounded-xl text-center">
              <div>
                <div className="text-xs font-bold text-text-muted uppercase">Completed</div>
                <div className="text-lg font-black text-green-700">{calendarStats.completed} days</div>
              </div>
              <div>
                <div className="text-xs font-bold text-text-muted uppercase">Missed</div>
                <div className="text-lg font-black text-red-600">{calendarStats.missed} days</div>
              </div>
              <div>
                <div className="text-xs font-bold text-text-muted uppercase">Completion Rate</div>
                <div className="text-lg font-black text-deep-teal">{calendarStats.completionRate}%</div>
              </div>
              <div>
                <div className="text-xs font-bold text-text-muted uppercase">Streak</div>
                <div className="text-lg font-black text-logo-gold">{calendarStats.currentStreak} 🔥</div>
              </div>
              <div className="col-span-2 sm:col-span-1">
                <div className="text-xs font-bold text-text-muted uppercase">Longest Streak</div>
                <div className="text-lg font-black text-terracotta-rose">{calendarStats.longestStreak} days</div>
              </div>
            </div>
          )}

          {/* Calendar Widget */}
          <div className="calendar-container border border-cream-dark/50 rounded-xl p-4 bg-white shadow-xs">
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
          </div>

          {/* Detailed Day Info Card */}
          {selectedDayDetail && (
            <div className={`p-4 rounded-xl border animate-fadeIn ${
              selectedDayDetail.status === "Completed"
                ? "bg-green-50/50 border-green-200 text-green-800"
                : "bg-red-50/50 border-red-200 text-red-800"
            }`}>
              <div className="flex justify-between items-center font-bold">
                <span>Date: {new Date(selectedDayDetail.date).toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</span>
                <Badge variant={selectedDayDetail.status === "Completed" ? "success" : "destructive"}>
                  {selectedDayDetail.status}
                </Badge>
              </div>
              {selectedDayDetail.status === "Completed" && (
                <div className="mt-3 space-y-2 text-sm text-text-dark">
                  <div>
                    <span className="font-bold text-text-muted block text-xs uppercase">Submission Time:</span>
                    <span>{selectedDayDetail.time || "Not logged"}</span>
                  </div>
                  <div>
                    <span className="font-bold text-text-muted block text-xs uppercase">Lecture Notes:</span>
                    <p className="italic bg-white p-2.5 rounded border border-cream-dark mt-1 text-xs leading-relaxed max-h-32 overflow-y-auto">
                      {selectedDayDetail.notes || "No notes submitted."}
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
      </Dialog>

    </div>
  );
}
