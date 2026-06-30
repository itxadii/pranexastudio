import React from "react";
import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import Link from "next/link";

export const revalidate = 0; // Always fetch fresh dashboard metrics

export default async function CustomerDashboardPage() {
  const session = await auth();
  console.log("DEBUG - Customer page session:", JSON.stringify(session));

  if (!session?.user || !(session.user as any).id) {
    console.log("DEBUG - Redirecting to /login because session or session.user.id is missing");
    redirect("/login");
  }

  const userId = (session.user as any).id;
  console.log("DEBUG - Fetching customer for userId:", userId);

  // 1. Fetch user subscription, assignments, and invoices
  const customer = await prisma.user.findUnique({
    where: { id: userId },
    include: {
      subscriptions: {
        include: { plan: true },
        orderBy: { expiryDate: "desc" },
        take: 1
      },
      customerTrainer: {
        where: { active: true },
        include: { trainer: true },
        take: 1
      },
      invoices: {
        orderBy: { createdAt: "desc" },
        take: 5
      }
    }
  });

  console.log("DEBUG - Customer database query result found:", !!customer);

  if (!customer) {
    console.log("DEBUG - Redirecting to /login because customer record was not found in postgres");
    redirect("/login");
  }

  const activeSub = customer.subscriptions[0];
  const activeTrainer = customer.customerTrainer[0]?.trainer;

  // Check if subscription has expired
  const isExpired = activeSub ? new Date(activeSub.expiryDate) < new Date() : true;
  const subStatus = activeSub 
    ? (isExpired ? "EXPIRED" : activeSub.status) 
    : "NO_SUBSCRIPTION";

  // 2. Fetch next upcoming scheduled session
  const nextSession = await prisma.session.findFirst({
    where: {
      customerId: userId,
      status: "Scheduled",
      startTime: { gte: new Date() }
    },
    include: { trainer: true },
    orderBy: { startTime: "asc" }
  });

  // 3. Fetch session history counts for attendance rate
  const allSessions = await prisma.session.findMany({
    where: { customerId: userId }
  });

  const completedSessions = allSessions.filter(s => s.status === "Completed").length;
  const missedSessions = allSessions.filter(s => s.status === "Missed").length;
  const totalTracked = completedSessions + missedSessions;
  const attendanceRate = totalTracked > 0 ? Math.round((completedSessions / totalTracked) * 100) : 100;

  // 4. Fetch progress logs for summary widget
  const progressLogs = await prisma.progressLog.findMany({
    where: { customerId: userId },
    orderBy: { createdAt: "desc" },
    take: 1
  });
  const latestLog = progressLogs[0];

  return (
    <div className="space-y-8">
      {/* Header and Quick Stats */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="font-serif text-3xl font-bold text-deep-teal">Namaste, {customer.name}</h1>
          <p className="text-sm text-text-muted mt-1">Welcome to your personal Yoga space. Breathe in, stretch, and let go.</p>
        </div>
        <Link 
          href="/customer/calendar"
          className="px-5 py-2.5 rounded-full bg-deep-teal text-white hover:bg-deep-teal/90 text-sm font-semibold shadow-sm transition-colors text-center inline-block"
        >
          View Session Calendar
        </Link>
      </div>

      {/* Grid of Key Info Widgets */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Widget 1: Subscription Card */}
        <Card className="border border-cream-dark shadow-sm bg-white">
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-bold text-text-dark uppercase tracking-wider">My Subscription</CardTitle>
            <CardDescription>Current practice plan status</CardDescription>
          </CardHeader>
          <CardContent className="pt-2 space-y-4">
            {activeSub ? (
              <div>
                <h4 className="text-xl font-bold text-deep-teal">{activeSub.plan.title}</h4>
                <div className="flex gap-2 items-center mt-2">
                  <Badge variant={subStatus === "ACTIVE" ? "success" : "destructive"}>
                    {subStatus}
                  </Badge>
                  <span className="text-xs text-text-muted">Expires: {new Date(activeSub.expiryDate).toLocaleDateString()}</span>
                </div>
                <p className="text-xs text-text-muted mt-3">
                  Allocated sessions: {activeSub.plan.sessionsPerWeek} per week
                </p>
              </div>
            ) : (
              <div className="py-2">
                <p className="text-sm text-text-muted">You do not have an active package.</p>
                <div className="mt-3">
                  <Badge variant="destructive">Inactive</Badge>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Widget 2: Assigned Trainer Card */}
        <Card className="border border-cream-dark shadow-sm bg-white">
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-bold text-text-dark uppercase tracking-wider">Personal Trainer</CardTitle>
            <CardDescription>Your dedicated Yoga instructor</CardDescription>
          </CardHeader>
          <CardContent className="pt-2 space-y-3">
            {activeTrainer ? (
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-logo-gold/30 flex items-center justify-center font-bold text-deep-teal font-serif">
                  {activeTrainer.name.charAt(0)}
                </div>
                <div>
                  <h4 className="font-bold text-sm text-text-dark">{activeTrainer.name}</h4>
                  <p className="text-xs text-text-muted">{activeTrainer.email}</p>
                  <p className="text-[10px] uppercase tracking-wider font-semibold text-terracotta-rose mt-1">Status: Active</p>
                </div>
              </div>
            ) : (
              <div className="py-2">
                <p className="text-sm text-text-muted">No personal trainer assigned yet.</p>
                <p className="text-xs text-text-muted/80 mt-1">Admin will assign an instructor shortly.</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Widget 3: Metrics summary Card */}
        <Card className="border border-cream-dark shadow-sm bg-white">
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-bold text-text-dark uppercase tracking-wider">Attendance Rate</CardTitle>
            <CardDescription>Attendance and class consistency</CardDescription>
          </CardHeader>
          <CardContent className="pt-2 space-y-3">
            <div className="flex items-baseline gap-2">
              <span className="text-4xl font-black text-deep-teal">{attendanceRate}%</span>
              <span className="text-xs text-text-muted">attendance score</span>
            </div>
            <div className="w-full h-2 bg-cream-dark/30 rounded-full overflow-hidden">
              <div 
                className="h-full bg-deep-teal rounded-full" 
                style={{ width: `${attendanceRate}%` }}
              />
            </div>
            <p className="text-xs text-text-muted">
              Completed: {completedSessions} | Missed: {missedSessions}
            </p>
          </CardContent>
        </Card>

      </div>

      {/* Main Content Layout: Next Class vs Invoices */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Column: Next Class Card and Progress Logs (Span 2) */}
        <div className="lg:col-span-2 space-y-8">
          
          {/* Next Class Sheet */}
          <Card className="border border-cream-dark shadow-sm bg-white overflow-hidden">
            <CardHeader className="bg-deep-teal/[0.02] border-b border-cream-dark/50">
              <CardTitle className="text-lg font-bold text-deep-teal">Next Scheduled Class</CardTitle>
              <CardDescription>Your upcoming live virtual yoga session</CardDescription>
            </CardHeader>
            <CardContent className="p-6 space-y-6">
              {nextSession ? (
                <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-6">
                  <div className="space-y-2">
                    <div className="inline-block px-2.5 py-0.5 text-xs font-semibold bg-deep-teal/10 text-deep-teal rounded-full">
                      {nextSession.meetingProvider === "GoogleMeet" ? "Google Meet" : nextSession.meetingProvider} Session
                    </div>
                    <h3 className="text-xl font-bold text-text-dark">{nextSession.title}</h3>
                    <p className="text-sm text-text-dark/80">
                      Date: <strong className="text-text-dark">{new Date(nextSession.startTime).toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</strong>
                    </p>
                    <p className="text-sm text-text-dark/80">
                      Time: <strong className="text-text-dark">{new Date(nextSession.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} - {new Date(nextSession.endTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</strong>
                    </p>
                    <p className="text-xs text-text-muted mt-2">
                      Instructor: {nextSession.trainer.name}
                    </p>
                  </div>
                  <div className="flex flex-col gap-2 shrink-0">
                    {nextSession.meetingLink ? (
                      <a 
                        href={nextSession.meetingLink}
                        target="_blank"
                        rel="noreferrer"
                        className="px-6 py-3 rounded-full bg-deep-teal text-white hover:bg-deep-teal/90 text-sm font-bold shadow-md transition-all text-center flex items-center justify-center gap-2"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
                          <path fillRule="evenodd" d="M1.5 5.625c0-1.036.84-1.875 1.875-1.875h17.25c1.035 0 1.875.84 1.875 1.875v12.75c0 1.036-.84 1.875-1.875 1.875H3.375A1.875 1.875 0 0 1 1.5 18.375V5.625ZM21 9.375V5.625a.375.375 0 0 0-.375-.375H3.375a.375.375 0 0 0-.375.375v3.75h18Zm0 1.5H3v7.5c0 .207.168.375.375.375h17.25a.375.375 0 0 0 .375-.375v-7.5Z" clipRule="evenodd" />
                        </svg>
                        Join Yoga Class
                      </a>
                    ) : (
                      <button 
                        disabled
                        className="px-6 py-3 rounded-full bg-cream-dark text-text-muted/60 text-sm font-bold cursor-not-allowed text-center"
                      >
                        Link Pending
                      </button>
                    )}
                    <span className="text-[10px] text-text-muted text-center italic">Make sure to join 5 mins early</span>
                  </div>
                </div>
              ) : (
                <div className="text-center py-8">
                  <p className="text-sm text-text-muted">You have no upcoming sessions scheduled.</p>
                  <p className="text-xs text-text-muted mt-1">Schedule a session or contact your trainer to add calendars.</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Progress Metrics Overview */}
          <Card className="border border-cream-dark shadow-sm bg-white">
            <CardHeader>
              <CardTitle className="text-base font-bold text-text-dark uppercase tracking-wider">Latest Progress Indicators</CardTitle>
              <CardDescription>Self-improvement rating logged by your trainer</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {latestLog ? (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
                    <div className="p-3 bg-warm-cream/20 border border-cream-dark/50 rounded-xl text-center">
                      <div className="text-[10px] uppercase font-bold text-text-muted">Flexibility</div>
                      <div className="text-xl font-black text-deep-teal mt-1">{latestLog.flexibility}/10</div>
                    </div>
                    <div className="p-3 bg-warm-cream/20 border border-cream-dark/50 rounded-xl text-center">
                      <div className="text-[10px] uppercase font-bold text-text-muted">Balance</div>
                      <div className="text-xl font-black text-deep-teal mt-1">{latestLog.balance}/10</div>
                    </div>
                    <div className="p-3 bg-warm-cream/20 border border-cream-dark/50 rounded-xl text-center">
                      <div className="text-[10px] uppercase font-bold text-text-muted">Breathing</div>
                      <div className="text-xl font-black text-deep-teal mt-1">{latestLog.breathing}/10</div>
                    </div>
                    <div className="p-3 bg-warm-cream/20 border border-cream-dark/50 rounded-xl text-center">
                      <div className="text-[10px] uppercase font-bold text-text-muted">Focus</div>
                      <div className="text-xl font-black text-deep-teal mt-1">{latestLog.focus}/10</div>
                    </div>
                    <div className="p-3 bg-warm-cream/20 border border-cream-dark/50 rounded-xl text-center">
                      <div className="text-[10px] uppercase font-bold text-text-muted">Stress Red.</div>
                      <div className="text-xl font-black text-deep-teal mt-1">{latestLog.stress}/10</div>
                    </div>
                  </div>
                  {latestLog.remarks && (
                    <div className="bg-warm-cream/10 p-3.5 rounded-lg border border-cream-dark/30 text-xs text-text-dark italic">
                      <strong>Trainer Remarks:</strong> "{latestLog.remarks}"
                    </div>
                  )}
                </div>
              ) : (
                <p className="text-xs text-text-muted text-center py-6">No progress logs recorded yet. Your scores will populate after your first class.</p>
              )}
            </CardContent>
          </Card>

        </div>

        {/* Right Column: Billing & Invoices */}
        <div>
          <Card className="border border-cream-dark shadow-sm bg-white h-full flex flex-col justify-between">
            <CardHeader className="border-b border-cream-dark/50">
              <CardTitle className="text-base font-bold text-text-dark uppercase tracking-wider">Invoices & Payments</CardTitle>
              <CardDescription>Recent transaction records</CardDescription>
            </CardHeader>
            <CardContent className="p-0 flex-grow">
              {customer.invoices.length === 0 ? (
                <p className="text-sm text-text-muted text-center py-12">No invoices recorded yet.</p>
              ) : (
                <div className="divide-y divide-cream-dark/50">
                  {customer.invoices.map((inv) => (
                    <div key={inv.id} className="p-4 hover:bg-warm-cream/10 transition-colors flex items-center justify-between">
                      <div>
                        <h4 className="font-bold text-sm text-text-dark">{inv.invoiceNumber}</h4>
                        <p className="text-[10px] text-text-muted mt-0.5">Paid via {inv.paymentMethod}</p>
                      </div>
                      <div className="text-right">
                        <span className="font-bold text-sm text-deep-teal block">${inv.amount.toFixed(2)}</span>
                        <span className="inline-block text-[9px] uppercase font-bold text-green-700 bg-green-50 px-1.5 py-0.25 rounded-md mt-0.5 border border-green-200">
                          {inv.status}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

      </div>

    </div>
  );
}
