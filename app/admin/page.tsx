import React from "react";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";

// Helper to get midnight UTC representation
function getTodayUTC() {
  const d = new Date();
  return new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()));
}

export default async function AdminDashboardPage() {
  const today = getTodayUTC();
  const now = new Date();

  // 1. Core Metrics Data Fetching
  const totalEmployees = await prisma.user.count({
    where: { role: "TRAINER" }
  });

  const todayCompleted = await prisma.lecture.count({
    where: {
      lectureDate: today,
      status: "COMPLETED"
    }
  });

  const todayPending = Math.max(0, totalEmployees - todayCompleted);

  // Month stats
  const startOfMonth = new Date(Date.UTC(now.getFullYear(), now.getMonth(), 1));
  const completedThisMonth = await prisma.lecture.count({
    where: {
      lectureDate: { gte: startOfMonth, lte: today },
      status: "COMPLETED"
    }
  });

  const daysTrackedThisMonth = now.getDate();
  const maxPossibleSubmissionsThisMonth = totalEmployees * daysTrackedThisMonth;
  const completionRateThisMonth = maxPossibleSubmissionsThisMonth > 0 
    ? Math.round((completedThisMonth / maxPossibleSubmissionsThisMonth) * 100) 
    : 0;

  const totalLecturesAllTime = await prisma.lecture.count({
    where: { status: "COMPLETED" }
  });

  // 2. Recent Submissions Feed
  const recentSubmissions = await prisma.lecture.findMany({
    take: 5,
    orderBy: { submittedAt: "desc" },
    include: {
      user: {
        select: { name: true, email: true }
      }
    }
  });

  // 3. Chart Data Generation: Last 7 Days Daily Submissions
  const last7DaysData: { dateStr: string; label: string; count: number }[] = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const dayMidnight = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()));
    const count = await prisma.lecture.count({
      where: {
        lectureDate: dayMidnight,
        status: "COMPLETED"
      }
    });
    
    const weekdayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
    last7DaysData.push({
      dateStr: dayMidnight.toISOString().split("T")[0],
      label: weekdayNames[dayMidnight.getUTCDay()],
      count
    });
  }

  // 4. Chart Data Generation: Top 5 Employees Completion Rate
  const employees = await prisma.user.findMany({
    where: { role: "TRAINER" },
    include: {
      lectures: {
        where: {
          lectureDate: { gte: startOfMonth, lte: today }
        }
      }
    }
  });

  const employeeRates = employees.map((emp: any) => {
    const completed = emp.lectures.filter((l: any) => l.status === "COMPLETED").length;
    const rate = daysTrackedThisMonth > 0 ? Math.round((completed / daysTrackedThisMonth) * 100) : 0;
    return {
      name: emp.name,
      rate
    };
  })
  .sort((a: any, b: any) => b.rate - a.rate)
  .slice(0, 5);

  // SVG Chart Dimensions & Plots
  const chartHeight = 120;
  const maxCount = Math.max(...last7DaysData.map(d => d.count), 4);
  const linePoints = last7DaysData.map((d, i) => {
    const x = 40 + (i * 70);
    const y = 140 - (d.count / maxCount) * 100;
    return `${x},${y}`;
  }).join(" ");

  return (
    <div className="space-y-10">
      
      {/* Upper Header Welcome Block */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="font-serif text-3xl sm:text-4xl font-extrabold text-deep-teal">Dashboard</h2>
          <p className="text-text-muted mt-1">Real-time tracker overview of employee yoga lectures.</p>
        </div>
        <div className="flex gap-3">
          <Link
            href="/admin/employees"
            className="px-5 py-2.5 bg-deep-teal hover:bg-teal-dark text-white rounded-full font-semibold text-sm shadow-sm transition-colors flex items-center gap-2"
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2.5" stroke="currentColor" className="w-4 h-4">
              <path strokeLinecap="round" strokeLinejoin="round" d="M18 7.5v3m0 0v3m0-3h3m-3 0h-3m-2.25-4.125a3.375 3.375 0 1 1-6.75 0 3.375 3.375 0 0 1 6.75 0ZM3 19.235v-.11a6.375 6.375 0 0 1 12.75 0v.109A12.318 12.318 0 0 1 9.374 21c-2.331 0-4.512-.645-6.374-1.766Z" />
            </svg>
            Manage Employees
          </Link>
        </div>
      </div>

      {/* Grid of Metric Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        
        {/* Total Employees */}
        <Card className="hover:shadow-md transition-shadow">
          <CardContent className="p-6 flex items-center justify-between">
            <div className="space-y-1">
              <span className="text-xs uppercase font-bold tracking-wider text-text-muted">Total Employees</span>
              <h3 className="text-3xl font-black font-sans text-deep-teal">{totalEmployees}</h3>
              <p className="text-xs text-text-muted">Active members registered</p>
            </div>
            <div className="p-3.5 bg-deep-teal/5 text-deep-teal rounded-full">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="w-6 h-6">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z" />
              </svg>
            </div>
          </CardContent>
        </Card>

        {/* Today's Completed */}
        <Card className="hover:shadow-md transition-shadow border-l-4 border-l-green-600">
          <CardContent className="p-6 flex items-center justify-between">
            <div className="space-y-1">
              <span className="text-xs uppercase font-bold tracking-wider text-text-muted">Completed Today</span>
              <h3 className="text-3xl font-black font-sans text-green-700">{todayCompleted}</h3>
              <p className="text-xs text-text-muted">Submitted yoga sheets today</p>
            </div>
            <div className="p-3.5 bg-green-50 text-green-600 rounded-full">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="w-6 h-6">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
              </svg>
            </div>
          </CardContent>
        </Card>

        {/* Today's Pending */}
        <Card className="hover:shadow-md transition-shadow border-l-4 border-l-terracotta-rose">
          <CardContent className="p-6 flex items-center justify-between">
            <div className="space-y-1">
              <span className="text-xs uppercase font-bold tracking-wider text-text-muted">Pending Today</span>
              <h3 className="text-3xl font-black font-sans text-terracotta-rose">{todayPending}</h3>
              <p className="text-xs text-text-muted">Awaiting lecture reports</p>
            </div>
            <div className="p-3.5 bg-red-50 text-terracotta-rose rounded-full">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="w-6 h-6">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9 3.75h.008v.008H12v-.008Z" />
              </svg>
            </div>
          </CardContent>
        </Card>

        {/* Completion % */}
        <Card className="hover:shadow-md transition-shadow">
          <CardContent className="p-6 flex items-center justify-between">
            <div className="space-y-1">
              <span className="text-xs uppercase font-bold tracking-wider text-text-muted">Completion Rate</span>
              <h3 className="text-3xl font-black font-sans text-logo-gold">{completionRateThisMonth}%</h3>
              <p className="text-xs text-text-muted">For the current calendar month</p>
            </div>
            <div className="p-3.5 bg-yellow-50 text-logo-gold rounded-full">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="w-6 h-6">
                <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 6a7.5 7.5 0 1 0 7.5 7.5h-7.5V6Z" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 10.5H21A7.5 7.5 0 0 0 13.5 3v7.5Z" />
              </svg>
            </div>
          </CardContent>
        </Card>

      </div>

      {/* Visual Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* Chart 1: Daily Submissions Trend */}
        <Card>
          <CardHeader>
            <CardTitle>Daily Submissions Trend</CardTitle>
            <CardDescription>Number of completed lectures logged over the last 7 days</CardDescription>
          </CardHeader>
          <CardContent className="flex justify-center pt-2">
            <div className="w-full max-w-[500px]">
              <svg viewBox="0 0 500 160" className="w-full overflow-visible">
                {/* Horizontal Grid lines */}
                <line x1="30" y1="40" x2="470" y2="40" stroke="#f1eee9" strokeWidth="1" />
                <line x1="30" y1="90" x2="470" y2="90" stroke="#f1eee9" strokeWidth="1" />
                <line x1="30" y1="140" x2="470" y2="140" stroke="#cbd5e1" strokeWidth="1.5" />

                {/* Plot Line */}
                <polyline
                  fill="none"
                  stroke="#0f766e"
                  strokeWidth="3.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  points={linePoints}
                />

                {/* Plot Area Shading */}
                <polygon
                  fill="url(#area-gradient)"
                  points={`40,140 ${linePoints} 460,140`}
                />

                {/* Plot points */}
                {last7DaysData.map((d, i) => {
                  const x = 40 + (i * 70);
                  const y = 140 - (d.count / maxCount) * 100;
                  return (
                    <g key={i} className="group cursor-pointer">
                      <circle cx={x} cy={y} r="5" fill="#0f766e" stroke="#fff" strokeWidth="2" />
                      <circle cx={x} cy={y} r="8" fill="#0f766e" opacity="0" className="hover:opacity-20 transition-opacity" />
                      <text x={x} y={y - 12} textAnchor="middle" fontSize="10" className="fill-deep-teal font-bold select-none">
                        {d.count}
                      </text>
                    </g>
                  );
                })}

                {/* X Axis Labels */}
                {last7DaysData.map((d, i) => (
                  <text key={i} x={40 + (i * 70)} y="155" textAnchor="middle" fontSize="11" className="fill-text-muted select-none">
                    {d.label}
                  </text>
                ))}

                {/* Gradients */}
                <defs>
                  <linearGradient id="area-gradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#0f766e" stopOpacity="0.18" />
                    <stop offset="100%" stopColor="#0f766e" stopOpacity="0.0" />
                  </linearGradient>
                </defs>
              </svg>
            </div>
          </CardContent>
        </Card>

        {/* Chart 2: Top Employees Completion Rates */}
        <Card>
          <CardHeader>
            <CardTitle>Top Employees Completion %</CardTitle>
            <CardDescription>Highest completion percentages recorded for this month</CardDescription>
          </CardHeader>
          <CardContent className="space-y-5 pt-2">
            {employeeRates.length === 0 ? (
              <p className="text-sm text-text-muted text-center py-6">No data recorded this month.</p>
            ) : (
              employeeRates.map((emp: { name: string; rate: number }, i: number) => (
                <div key={i} className="space-y-1.5">
                  <div className="flex justify-between items-center text-sm">
                    <span className="font-semibold text-text-dark">{emp.name}</span>
                    <span className="font-bold text-deep-teal">{emp.rate}%</span>
                  </div>
                  <div className="h-2.5 w-full bg-cream-dark/50 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-deep-teal rounded-full transition-all duration-500"
                      style={{ width: `${emp.rate}%` }}
                    />
                  </div>
                </div>
              ))
            )}
          </CardContent>
        </Card>

      </div>

      {/* Lower Row: Recent Submissions Feed */}
      <div className="grid grid-cols-1 gap-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Recent Lecture Submissions</CardTitle>
              <CardDescription>Latest employee sheets submitted to the platform</CardDescription>
            </div>
            <Link 
              href="/admin/reports" 
              className="text-xs font-bold text-deep-teal hover:underline flex items-center gap-1"
            >
              View Reports
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2.5" stroke="currentColor" className="w-3 h-3">
                <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3" />
              </svg>
            </Link>
          </CardHeader>
          <CardContent className="p-0">
            {recentSubmissions.length === 0 ? (
              <p className="text-sm text-text-muted text-center py-12">No submissions recorded yet.</p>
            ) : (
              <div className="divide-y divide-cream-dark/50 border-t border-cream-dark/50">
                {recentSubmissions.map((sub: any) => (
                  <div key={sub.id} className="p-5 flex items-center justify-between flex-wrap sm:flex-nowrap gap-4 hover:bg-warm-cream/10 transition-colors">
                    <div>
                      <h4 className="font-bold text-sm text-text-dark">{sub.user.name}</h4>
                      <p className="text-xs text-text-muted mt-0.5">{sub.user.email}</p>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-xs text-text-muted hidden sm:inline-block">
                        Logged: {new Date(sub.submittedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                      <Badge variant="success">Completed</Badge>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

    </div>
  );
}
