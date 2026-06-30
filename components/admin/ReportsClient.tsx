"use client";

import React, { useState, useMemo } from "react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/Card";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/Table";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";

interface LectureLog {
  id: string;
  lectureDate: string;
  status: "COMPLETED" | "MISSED";
  notes: string | null;
  submittedAt: string;
}

interface Employee {
  id: string;
  name: string;
  email: string;
  createdAt: string;
  lectures: LectureLog[];
}

interface SessionReport {
  id: string;
  title: string;
  customerName: string;
  trainerName: string;
  status: string;
  date: string;
  duration: number;
}

interface InvoiceReport {
  id: string;
  customerName: string;
  amount: number;
  currency: string;
  status: string;
  paymentMethod: string;
  invoiceNumber: string;
  createdAt: string;
}

interface ProgressReport {
  id: string;
  customerName: string;
  trainerName: string;
  flexibility: number;
  balance: number;
  breathing: number;
  focus: number;
  stress: number;
  weight: number | null;
  remarks: string;
  createdAt: string;
}

interface ReportsClientProps {
  employees: Employee[];
  sessions: SessionReport[];
  invoices: InvoiceReport[];
  progressLogs: ProgressReport[];
}

type TabType = "employees" | "sessions" | "finance" | "progress";

export default function ReportsClient({
  employees,
  sessions,
  invoices,
  progressLogs
}: ReportsClientProps) {
  const now = new Date();
  const [activeTab, setActiveTab] = useState<TabType>("employees");

  // Create list of months for the dropdown (last 12 months)
  const monthOptions = useMemo(() => {
    const options = [];
    const weekdayNames = [
      "January", "February", "March", "April", "May", "June", 
      "July", "August", "September", "October", "November", "December"
    ];

    for (let i = 0; i < 12; i++) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      options.push({
        value: `${d.getFullYear()}-${d.getMonth()}`, // e.g. "2026-5" for June 2026
        label: `${weekdayNames[d.getMonth()]} ${d.getFullYear()}`
      });
    }
    return options;
  }, []);

  // Filter states
  const [selectedMonth, setSelectedMonth] = useState(monthOptions[0].value);
  const [selectedEmployeeId, setSelectedEmployeeId] = useState("ALL");
  const [sessionSearch, setSessionSearch] = useState("");
  const [invoiceSearch, setInvoiceSearch] = useState("");
  const [progressSearch, setProgressSearch] = useState("");

  // Parse target year and month for legacy tab
  const [targetYear, targetMonth] = useMemo(() => {
    const [yStr, mStr] = selectedMonth.split("-");
    return [parseInt(yStr), parseInt(mStr)];
  }, [selectedMonth]);

  // Tab 1: legacy report rows
  const employeeReportRows = useMemo(() => {
    const totalDaysInMonth = new Date(targetYear, targetMonth + 1, 0).getDate();
    const isCurrentMonth = now.getFullYear() === targetYear && now.getMonth() === targetMonth;
    const daysTracked = isCurrentMonth ? now.getDate() : totalDaysInMonth;

    const startOfMonth = new Date(Date.UTC(targetYear, targetMonth, 1));
    const endOfMonth = new Date(Date.UTC(targetYear, targetMonth + 1, 0, 23, 59, 59));

    const targets = selectedEmployeeId === "ALL" 
      ? employees 
      : employees.filter(e => e.id === selectedEmployeeId);

    return targets.map(emp => {
      const completions = emp.lectures.filter(
        (l) => {
          const lDate = new Date(l.lectureDate);
          return lDate >= startOfMonth && lDate <= endOfMonth && l.status === "COMPLETED";
        }
      ).length;

      const missed = Math.max(0, daysTracked - completions);
      const rate = daysTracked > 0 ? Math.round((completions / daysTracked) * 100) : 0;

      return {
        id: emp.id,
        name: emp.name,
        email: emp.email,
        completed: completions,
        missed,
        totalDays: daysTracked,
        completionRate: rate
      };
    });
  }, [employees, targetYear, targetMonth, selectedEmployeeId]);

  // Tab 2: Sessions filtered
  const filteredSessions = useMemo(() => {
    return sessions.filter(
      (s) =>
        s.customerName.toLowerCase().includes(sessionSearch.toLowerCase()) ||
        s.trainerName.toLowerCase().includes(sessionSearch.toLowerCase()) ||
        s.title.toLowerCase().includes(sessionSearch.toLowerCase())
    );
  }, [sessions, sessionSearch]);

  // Tab 3: Invoices filtered
  const filteredInvoices = useMemo(() => {
    return invoices.filter(
      (i) =>
        i.customerName.toLowerCase().includes(invoiceSearch.toLowerCase()) ||
        i.invoiceNumber.toLowerCase().includes(invoiceSearch.toLowerCase()) ||
        i.paymentMethod.toLowerCase().includes(invoiceSearch.toLowerCase())
    );
  }, [invoices, invoiceSearch]);

  // Tab 4: Progress logs filtered
  const filteredProgress = useMemo(() => {
    return progressLogs.filter(
      (p) =>
        p.customerName.toLowerCase().includes(progressSearch.toLowerCase()) ||
        p.trainerName.toLowerCase().includes(progressSearch.toLowerCase()) ||
        p.remarks.toLowerCase().includes(progressSearch.toLowerCase())
    );
  }, [progressLogs, progressSearch]);

  // Metrics calculators
  const sessionStats = useMemo(() => {
    const total = sessions.length;
    const completed = sessions.filter(s => s.status === "Completed").length;
    const cancelled = sessions.filter(s => s.status === "Cancelled").length;
    const scheduled = sessions.filter(s => s.status === "Scheduled").length;
    const rate = total > 0 ? Math.round((completed / total) * 100) : 0;
    return { total, completed, cancelled, scheduled, rate };
  }, [sessions]);

  const financeStats = useMemo(() => {
    const totalRevenue = invoices.reduce((acc, curr) => acc + curr.amount, 0);
    const count = invoices.length;
    const average = count > 0 ? Math.round(totalRevenue / count) : 0;
    return { totalRevenue, count, average };
  }, [invoices]);

  const avgProgressRatings = useMemo(() => {
    if (progressLogs.length === 0) return { flex: 0, bal: 0, breath: 0, foc: 0, str: 0 };
    const count = progressLogs.length;
    const flex = Math.round(progressLogs.reduce((acc, p) => acc + p.flexibility, 0) / count * 10) / 10;
    const bal = Math.round(progressLogs.reduce((acc, p) => acc + p.balance, 0) / count * 10) / 10;
    const breath = Math.round(progressLogs.reduce((acc, p) => acc + p.breathing, 0) / count * 10) / 10;
    const foc = Math.round(progressLogs.reduce((acc, p) => acc + p.focus, 0) / count * 10) / 10;
    const str = Math.round(progressLogs.reduce((acc, p) => acc + p.stress, 0) / count * 10) / 10;
    return { flex, bal, breath, foc, str };
  }, [progressLogs]);

  // Export handlers
  const handleExportEmployeesCSV = () => {
    const headers = ["Employee Name", "Email Address", "Completed Days", "Missed Days", "Tracked Days", "Completion Rate (%)"];
    const csvContent = [
      headers.join(","),
      ...employeeReportRows.map(row => [
        `"${row.name.replace(/"/g, '""')}"`,
        `"${row.email.replace(/"/g, '""')}"`,
        row.completed,
        row.missed,
        row.totalDays,
        `${row.completionRate}%`
      ].join(","))
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    const monthLabel = monthOptions.find(o => o.value === selectedMonth)?.label.replace(/\s+/g, "_") || "Report";
    link.setAttribute("href", url);
    link.setAttribute("download", `Yog_Love_Employee_Practice_Report_${monthLabel}.csv`);
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleExportSessionsCSV = () => {
    const headers = ["Session Title", "Customer", "Instructor", "Status", "Date", "Duration (mins)"];
    const csv = [
      headers.join(","),
      ...filteredSessions.map(s => [
        `"${s.title.replace(/"/g, '""')}"`,
        `"${s.customerName.replace(/"/g, '""')}"`,
        `"${s.trainerName.replace(/"/g, '""')}"`,
        s.status,
        new Date(s.date).toLocaleDateString(),
        s.duration
      ].join(","))
    ].join("\n");

    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `Yog_Love_Yoga_Sessions_Report.csv`);
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleExportInvoicesCSV = () => {
    const headers = ["Invoice Number", "Customer Name", "Amount", "Currency", "Gateway Status", "Payment Method", "Issued Date"];
    const csv = [
      headers.join(","),
      ...filteredInvoices.map(i => [
        i.invoiceNumber,
        `"${i.customerName.replace(/"/g, '""')}"`,
        i.amount,
        i.currency,
        i.status,
        i.paymentMethod,
        new Date(i.createdAt).toLocaleDateString()
      ].join(","))
    ].join("\n");

    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `Yog_Love_Revenue_Report.csv`);
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleExportProgressCSV = () => {
    const headers = ["Customer", "Instructor", "Flexibility (1-10)", "Balance (1-10)", "Breathing (1-10)", "Focus (1-10)", "Stress Reduction (1-10)", "Weight (kg)", "Remarks", "Logged Date"];
    const csv = [
      headers.join(","),
      ...filteredProgress.map(p => [
        `"${p.customerName.replace(/"/g, '""')}"`,
        `"${p.trainerName.replace(/"/g, '""')}"`,
        p.flexibility,
        p.balance,
        p.breathing,
        p.focus,
        p.stress,
        p.weight || "N/A",
        `"${p.remarks.replace(/"/g, '""')}"`,
        new Date(p.createdAt).toLocaleDateString()
      ].join(","))
    ].join("\n");

    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `Yog_Love_Client_Progress_Report.csv`);
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      
      {/* Header and Export Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="font-serif text-3xl font-bold text-deep-teal">Analytical Reports</h2>
          <p className="text-text-muted text-sm mt-0.5">Track financial invoicing details, scheduling telemetry, and customer metrics.</p>
        </div>
        <div className="flex gap-2">
          {activeTab === "employees" && (
            <Button onClick={handleExportEmployeesCSV} disabled={employeeReportRows.length === 0} className="rounded-full flex items-center gap-2">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2.5" stroke="currentColor" className="w-4 h-4">
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5M16.5 12 12 16.5m0 0L7.5 12m4.5 4.5V3" />
              </svg>
              Export Employees Practice CSV
            </Button>
          )}
          {activeTab === "sessions" && (
            <Button onClick={handleExportSessionsCSV} disabled={filteredSessions.length === 0} className="rounded-full flex items-center gap-2">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2.5" stroke="currentColor" className="w-4 h-4">
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5M16.5 12 12 16.5m0 0L7.5 12m4.5 4.5V3" />
              </svg>
              Export Sessions CSV
            </Button>
          )}
          {activeTab === "finance" && (
            <Button onClick={handleExportInvoicesCSV} disabled={filteredInvoices.length === 0} className="rounded-full flex items-center gap-2">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2.5" stroke="currentColor" className="w-4 h-4">
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5M16.5 12 12 16.5m0 0L7.5 12m4.5 4.5V3" />
              </svg>
              Export Billing CSV
            </Button>
          )}
          {activeTab === "progress" && (
            <Button onClick={handleExportProgressCSV} disabled={filteredProgress.length === 0} className="rounded-full flex items-center gap-2">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2.5" stroke="currentColor" className="w-4 h-4">
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5M16.5 12 12 16.5m0 0L7.5 12m4.5 4.5V3" />
              </svg>
              Export Progress CSV
            </Button>
          )}
        </div>
      </div>

      {/* Tabs list bar */}
      <div className="flex border-b border-cream-dark/60 overflow-x-auto gap-2">
        <button
          onClick={() => setActiveTab("employees")}
          className={`px-5 py-3 border-b-2 font-bold text-sm transition-all whitespace-nowrap ${
            activeTab === "employees" ? "border-deep-teal text-deep-teal" : "border-transparent text-text-muted hover:text-text-dark"
          }`}
        >
          Trainer Daily Sheets
        </button>
        <button
          onClick={() => setActiveTab("sessions")}
          className={`px-5 py-3 border-b-2 font-bold text-sm transition-all whitespace-nowrap ${
            activeTab === "sessions" ? "border-deep-teal text-deep-teal" : "border-transparent text-text-muted hover:text-text-dark"
          }`}
        >
          Classes & Telemetry
        </button>
        <button
          onClick={() => setActiveTab("finance")}
          className={`px-5 py-3 border-b-2 font-bold text-sm transition-all whitespace-nowrap ${
            activeTab === "finance" ? "border-deep-teal text-deep-teal" : "border-transparent text-text-muted hover:text-text-dark"
          }`}
        >
          Billing & Invoices
        </button>
        <button
          onClick={() => setActiveTab("progress")}
          className={`px-5 py-3 border-b-2 font-bold text-sm transition-all whitespace-nowrap ${
            activeTab === "progress" ? "border-deep-teal text-deep-teal" : "border-transparent text-text-muted hover:text-text-dark"
          }`}
        >
          Client Progress Analytics
        </button>
      </div>

      {/* Tab 1: Legacy Employee Practice Sheets */}
      {activeTab === "employees" && (
        <div className="space-y-6">
          <Card>
            <CardContent className="p-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div className="space-y-1.5">
                  <label className="text-xs uppercase font-bold tracking-wider text-text-muted">Select Reporting Period</label>
                  <select
                    value={selectedMonth}
                    onChange={(e) => setSelectedMonth(e.target.value)}
                    className="w-full rounded-lg border border-cream-dark p-3 text-sm bg-white text-text-dark font-semibold focus-visible:outline-none"
                  >
                    {monthOptions.map((opt) => (
                      <option key={opt.value} value={opt.value}>
                        {opt.label}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs uppercase font-bold tracking-wider text-text-muted">Filter By Employee</label>
                  <select
                    value={selectedEmployeeId}
                    onChange={(e) => setSelectedEmployeeId(e.target.value)}
                    className="w-full rounded-lg border border-cream-dark p-3 text-sm bg-white text-text-dark font-semibold focus-visible:outline-none"
                  >
                    <option value="ALL">All Employees</option>
                    {employees.map((emp) => (
                      <option key={emp.id} value={emp.id}>
                        {emp.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Employee Name</TableHead>
                  <TableHead>Email Address</TableHead>
                  <TableHead className="text-center">Completed Days</TableHead>
                  <TableHead className="text-center">Missed Days</TableHead>
                  <TableHead className="text-center">Total Tracked Days</TableHead>
                  <TableHead className="text-right">Completion Rate</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {employeeReportRows.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center text-text-muted py-8">No data to report for selection.</TableCell>
                  </TableRow>
                ) : (
                  employeeReportRows.map((row) => (
                    <TableRow key={row.id}>
                      <TableCell className="font-bold text-text-dark">{row.name}</TableCell>
                      <TableCell className="text-text-muted">{row.email}</TableCell>
                      <TableCell className="text-center font-bold text-green-700">{row.completed}</TableCell>
                      <TableCell className="text-center font-bold text-red-600">{row.missed}</TableCell>
                      <TableCell className="text-center text-text-dark font-semibold">{row.totalDays}</TableCell>
                      <TableCell className="text-right">
                        <Badge variant={row.completionRate >= 80 ? "success" : row.completionRate >= 50 ? "warning" : "destructive"}>
                          {row.completionRate}%
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </Card>
        </div>
      )}

      {/* Tab 2: Sessions Telemetry */}
      {activeTab === "sessions" && (
        <div className="space-y-6">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <Card className="bg-white border border-cream-dark p-5 text-center shadow-xs">
              <p className="text-[10px] uppercase font-bold text-text-muted">Total Classes Scheduled</p>
              <h4 className="text-2xl font-black text-deep-teal mt-2">{sessionStats.total}</h4>
            </Card>
            <Card className="bg-white border border-cream-dark p-5 text-center shadow-xs">
              <p className="text-[10px] uppercase font-bold text-text-muted">Completed Sessions</p>
              <h4 className="text-2xl font-black text-green-700 mt-2">{sessionStats.completed}</h4>
            </Card>
            <Card className="bg-white border border-cream-dark p-5 text-center shadow-xs">
              <p className="text-[10px] uppercase font-bold text-text-muted">Cancelled Classes</p>
              <h4 className="text-2xl font-black text-red-600 mt-2">{sessionStats.cancelled}</h4>
            </Card>
            <Card className="bg-white border border-cream-dark p-5 text-center shadow-xs">
              <p className="text-[10px] uppercase font-bold text-text-muted">Completion Success</p>
              <h4 className="text-2xl font-black text-logo-gold mt-2">{sessionStats.rate}%</h4>
            </Card>
          </div>

          <Card className="p-4 flex items-center gap-3">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2.5" stroke="currentColor" className="w-5 h-5 text-text-muted shrink-0">
              <path strokeLinecap="round" strokeLinejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.602 10.602Z" />
            </svg>
            <input
              type="text"
              placeholder="Search classes by student name, instructor name, or title..."
              value={sessionSearch}
              onChange={(e) => setSessionSearch(e.target.value)}
              className="border-none bg-transparent focus:outline-none p-0 w-full text-sm text-text-dark placeholder:text-text-muted/60"
            />
          </Card>

          <Card className="overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Class Title</TableHead>
                  <TableHead>Customer</TableHead>
                  <TableHead>Instructor</TableHead>
                  <TableHead>Date & Time</TableHead>
                  <TableHead>Duration</TableHead>
                  <TableHead className="text-right">Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredSessions.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center text-text-muted py-8">No matching classes logged.</TableCell>
                  </TableRow>
                ) : (
                  filteredSessions.map((s) => (
                    <TableRow key={s.id}>
                      <TableCell className="font-semibold text-text-dark text-sm">{s.title}</TableCell>
                      <TableCell className="text-sm text-text-dark">{s.customerName}</TableCell>
                      <TableCell className="text-sm text-text-muted">{s.trainerName}</TableCell>
                      <TableCell className="text-xs text-text-dark">{new Date(s.date).toLocaleDateString()}</TableCell>
                      <TableCell className="text-xs text-text-muted">{s.duration} mins</TableCell>
                      <TableCell className="text-right">
                        <Badge variant={
                          s.status === "Completed" ? "success" : 
                          (s.status === "Scheduled" ? "default" : "destructive")
                        }>
                          {s.status}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </Card>
        </div>
      )}

      {/* Tab 3: Billing & Invoices */}
      {activeTab === "finance" && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Card className="bg-white border border-cream-dark p-6 shadow-xs">
              <p className="text-xs uppercase tracking-wider font-bold text-text-muted">Total Revenue Logged</p>
              <h3 className="text-3xl font-black text-green-700 mt-2">${financeStats.totalRevenue.toFixed(2)}</h3>
            </Card>
            <Card className="bg-white border border-cream-dark p-6 shadow-xs">
              <p className="text-xs uppercase tracking-wider font-bold text-text-muted">Invoices Dispatched</p>
              <h3 className="text-3xl font-black text-deep-teal mt-2">{financeStats.count}</h3>
            </Card>
            <Card className="bg-white border border-cream-dark p-6 shadow-xs">
              <p className="text-xs uppercase tracking-wider font-bold text-text-muted">Avg Transaction Size</p>
              <h3 className="text-3xl font-black text-logo-gold mt-2">${financeStats.average.toFixed(2)}</h3>
            </Card>
          </div>

          <Card className="p-4 flex items-center gap-3">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2.5" stroke="currentColor" className="w-5 h-5 text-text-muted shrink-0">
              <path strokeLinecap="round" strokeLinejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.602 10.602Z" />
            </svg>
            <input
              type="text"
              placeholder="Search billing records by customer, invoice number, or gateway provider..."
              value={invoiceSearch}
              onChange={(e) => setInvoiceSearch(e.target.value)}
              className="border-none bg-transparent focus:outline-none p-0 w-full text-sm text-text-dark placeholder:text-text-muted/60"
            />
          </Card>

          <Card className="overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Invoice Number</TableHead>
                  <TableHead>Customer</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Payment Method</TableHead>
                  <TableHead>Issued Date</TableHead>
                  <TableHead className="text-right">Gateway Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredInvoices.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center text-text-muted py-8">No matching invoices logged.</TableCell>
                  </TableRow>
                ) : (
                  filteredInvoices.map((inv) => (
                    <TableRow key={inv.id}>
                      <TableCell className="font-bold text-text-dark text-sm">{inv.invoiceNumber}</TableCell>
                      <TableCell className="text-sm text-text-dark">{inv.customerName}</TableCell>
                      <TableCell className="text-sm font-bold text-deep-teal">${inv.amount.toFixed(2)} ({inv.currency})</TableCell>
                      <TableCell className="text-xs uppercase tracking-wider font-semibold text-text-muted">{inv.paymentMethod}</TableCell>
                      <TableCell className="text-xs text-text-dark">{new Date(inv.createdAt).toLocaleDateString()}</TableCell>
                      <TableCell className="text-right">
                        <Badge variant="success">paid</Badge>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </Card>
        </div>
      )}

      {/* Tab 4: Client Progress Analytics */}
      {activeTab === "progress" && (
        <div className="space-y-6">
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
            <Card className="bg-white border border-cream-dark p-4 text-center shadow-xs">
              <p className="text-[10px] uppercase font-bold text-text-muted">Flexibility</p>
              <h4 className="text-2xl font-black text-deep-teal mt-1">{avgProgressRatings.flex} / 10</h4>
            </Card>
            <Card className="bg-white border border-cream-dark p-4 text-center shadow-xs">
              <p className="text-[10px] uppercase font-bold text-text-muted">Balance</p>
              <h4 className="text-2xl font-black text-deep-teal mt-1">{avgProgressRatings.bal} / 10</h4>
            </Card>
            <Card className="bg-white border border-cream-dark p-4 text-center shadow-xs">
              <p className="text-[10px] uppercase font-bold text-text-muted">Breathing</p>
              <h4 className="text-2xl font-black text-deep-teal mt-1">{avgProgressRatings.breath} / 10</h4>
            </Card>
            <Card className="bg-white border border-cream-dark p-4 text-center shadow-xs">
              <p className="text-[10px] uppercase font-bold text-text-muted">Focus</p>
              <h4 className="text-2xl font-black text-deep-teal mt-1">{avgProgressRatings.foc} / 10</h4>
            </Card>
            <Card className="bg-white border border-cream-dark p-4 text-center shadow-xs">
              <p className="text-[10px] uppercase font-bold text-text-muted">Stress Red.</p>
              <h4 className="text-2xl font-black text-deep-teal mt-1">{avgProgressRatings.str} / 10</h4>
            </Card>
          </div>

          <Card className="p-4 flex items-center gap-3">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2.5" stroke="currentColor" className="w-5 h-5 text-text-muted shrink-0">
              <path strokeLinecap="round" strokeLinejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.602 10.602Z" />
            </svg>
            <input
              type="text"
              placeholder="Search progress logs by student, trainer, or remarks..."
              value={progressSearch}
              onChange={(e) => setProgressSearch(e.target.value)}
              className="border-none bg-transparent focus:outline-none p-0 w-full text-sm text-text-dark placeholder:text-text-muted/60"
            />
          </Card>

          <Card className="overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Customer</TableHead>
                  <TableHead>Trainer</TableHead>
                  <TableHead className="text-center">Flexibility</TableHead>
                  <TableHead className="text-center">Balance</TableHead>
                  <TableHead className="text-center">Breathing</TableHead>
                  <TableHead className="text-center">Focus</TableHead>
                  <TableHead className="text-center">Stress Red.</TableHead>
                  <TableHead className="text-center">Weight</TableHead>
                  <TableHead>Assessment Remarks</TableHead>
                  <TableHead className="text-right">Logged Date</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredProgress.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={10} className="text-center text-text-muted py-8">No progress indicators logged.</TableCell>
                  </TableRow>
                ) : (
                  filteredProgress.map((p) => (
                    <TableRow key={p.id}>
                      <TableCell className="font-semibold text-text-dark text-sm">{p.customerName}</TableCell>
                      <TableCell className="text-xs text-text-muted">{p.trainerName}</TableCell>
                      <TableCell className="text-center font-semibold text-text-dark">{p.flexibility}</TableCell>
                      <TableCell className="text-center font-semibold text-text-dark">{p.balance}</TableCell>
                      <TableCell className="text-center font-semibold text-text-dark">{p.breathing}</TableCell>
                      <TableCell className="text-center font-semibold text-text-dark">{p.focus}</TableCell>
                      <TableCell className="text-center font-semibold text-text-dark">{p.stress}</TableCell>
                      <TableCell className="text-center text-text-muted">{p.weight ? `${p.weight} kg` : "N/A"}</TableCell>
                      <TableCell className="text-xs text-text-dark italic max-w-[200px] truncate" title={p.remarks}>"{p.remarks}"</TableCell>
                      <TableCell className="text-right text-[10px] text-text-muted">{new Date(p.createdAt).toLocaleDateString()}</TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </Card>
        </div>
      )}

    </div>
  );
}
