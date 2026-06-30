import React from "react";
import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import Link from "next/link";

export const revalidate = 0; // Always fetch fresh metrics

export default async function CustomerProgressPage() {
  const session = await auth();

  if (!session?.user || !(session.user as any).id) {
    redirect("/login");
  }

  const userId = (session.user as any).id;

  // Fetch all historical progress logs for the customer
  const logs = await prisma.progressLog.findMany({
    where: { customerId: userId },
    include: {
      session: true,
      trainer: true
    },
    orderBy: { createdAt: "desc" }
  });

  // Calculate progress averages if logs exist
  const count = logs.length;
  const avgFlexibility = count > 0 ? (logs.reduce((sum, l) => sum + l.flexibility, 0) / count).toFixed(1) : "0.0";
  const avgBalance = count > 0 ? (logs.reduce((sum, l) => sum + l.balance, 0) / count).toFixed(1) : "0.0";
  const avgBreathing = count > 0 ? (logs.reduce((sum, l) => sum + l.breathing, 0) / count).toFixed(1) : "0.0";
  const avgFocus = count > 0 ? (logs.reduce((sum, l) => sum + l.focus, 0) / count).toFixed(1) : "0.0";
  const avgStress = count > 0 ? (logs.reduce((sum, l) => sum + l.stress, 0) / count).toFixed(1) : "0.0";

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-serif text-3xl font-bold text-deep-teal">My Yoga Progress</h1>
          <p className="text-sm text-text-muted mt-1">Track your physical flexibility, balance, breathing stability, and overall mindfulness scores.</p>
        </div>
        <Link 
          href="/customer"
          className="px-4 py-2 rounded-full border border-cream-dark text-xs font-semibold hover:bg-warm-cream/30 text-text-dark transition-all text-center inline-block"
        >
          ← Back to Dashboard
        </Link>
      </div>

      {count > 0 ? (
        <>
          {/* Average Stats Grid */}
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            <Card className="border border-cream-dark shadow-xs bg-white text-center p-5 space-y-1">
              <span className="text-[10px] uppercase font-bold text-text-muted tracking-wider">Avg Flexibility</span>
              <div className="text-3xl font-black text-deep-teal font-serif">{avgFlexibility}/10</div>
              <p className="text-[9px] text-text-muted">Posture & joint extension</p>
            </Card>

            <Card className="border border-cream-dark shadow-xs bg-white text-center p-5 space-y-1">
              <span className="text-[10px] uppercase font-bold text-text-muted tracking-wider">Avg Balance</span>
              <div className="text-3xl font-black text-deep-teal font-serif">{avgBalance}/10</div>
              <p className="text-[9px] text-text-muted">Core stability & control</p>
            </Card>

            <Card className="border border-cream-dark shadow-xs bg-white text-center p-5 space-y-1">
              <span className="text-[10px] uppercase font-bold text-text-muted tracking-wider">Avg Breathing</span>
              <div className="text-3xl font-black text-deep-teal font-serif">{avgBreathing}/10</div>
              <p className="text-[9px] text-text-muted">Pranayama breathing flows</p>
            </Card>

            <Card className="border border-cream-dark shadow-xs bg-white text-center p-5 space-y-1">
              <span className="text-[10px] uppercase font-bold text-text-muted tracking-wider">Avg Focus</span>
              <div className="text-3xl font-black text-deep-teal font-serif">{avgFocus}/10</div>
              <p className="text-[9px] text-text-muted">Mental clarity & attention</p>
            </Card>

            <Card className="border border-cream-dark shadow-xs bg-white text-center p-5 space-y-1">
              <span className="text-[10px] uppercase font-bold text-text-muted tracking-wider">Stress Red.</span>
              <div className="text-3xl font-black text-deep-teal font-serif">{avgStress}/10</div>
              <p className="text-[9px] text-text-muted">Anxiety & tension relief</p>
            </Card>
          </div>

          {/* Historical Logs List */}
          <div className="space-y-6">
            <h2 className="font-serif text-xl font-bold text-text-dark">Historical Progress Timeline</h2>
            
            <div className="space-y-4">
              {logs.map((log) => (
                <Card key={log.id} className="border border-cream-dark shadow-sm bg-white overflow-hidden">
                  <div className="bg-warm-cream/10 border-b border-cream-dark/40 px-6 py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div>
                      <h4 className="font-bold text-sm text-text-dark">{log.session.title}</h4>
                      <p className="text-xs text-text-muted mt-0.5">
                        Conducted by <strong className="text-text-dark">{log.trainer.name}</strong> on {new Date(log.createdAt).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })}
                      </p>
                    </div>
                    {log.weight && (
                      <Badge variant="secondary" className="font-semibold self-start sm:self-auto">
                        Weight Tracker: {log.weight} kg
                      </Badge>
                    )}
                  </div>
                  
                  <CardContent className="p-6 space-y-4">
                    <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
                      <div className="p-2.5 bg-warm-cream/20 border border-cream-dark/30 rounded-lg text-center">
                        <div className="text-[9px] uppercase font-bold text-text-muted">Flexibility</div>
                        <div className="text-sm font-black text-deep-teal mt-0.5">{log.flexibility}/10</div>
                      </div>
                      <div className="p-2.5 bg-warm-cream/20 border border-cream-dark/30 rounded-lg text-center">
                        <div className="text-[9px] uppercase font-bold text-text-muted">Balance</div>
                        <div className="text-sm font-black text-deep-teal mt-0.5">{log.balance}/10</div>
                      </div>
                      <div className="p-2.5 bg-warm-cream/20 border border-cream-dark/30 rounded-lg text-center">
                        <div className="text-[9px] uppercase font-bold text-text-muted">Breathing</div>
                        <div className="text-sm font-black text-deep-teal mt-0.5">{log.breathing}/10</div>
                      </div>
                      <div className="p-2.5 bg-warm-cream/20 border border-cream-dark/30 rounded-lg text-center">
                        <div className="text-[9px] uppercase font-bold text-text-muted">Focus</div>
                        <div className="text-sm font-black text-deep-teal mt-0.5">{log.focus}/10</div>
                      </div>
                      <div className="p-2.5 bg-warm-cream/20 border border-cream-dark/30 rounded-lg text-center">
                        <div className="text-[9px] uppercase font-bold text-text-muted">Stress Red.</div>
                        <div className="text-sm font-black text-deep-teal mt-0.5">{log.stress}/10</div>
                      </div>
                    </div>

                    {log.remarks && (
                      <div className="bg-warm-cream/10 p-4 rounded-xl border border-cream-dark/30 text-xs text-text-dark leading-relaxed italic">
                        <strong>Instructor feedback & instructions:</strong> "{log.remarks}"
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </>
      ) : (
        <Card className="border border-cream-dark shadow-sm bg-white p-12 text-center">
          <div className="w-16 h-16 bg-warm-cream/45 rounded-full flex items-center justify-center mx-auto text-3xl mb-4">
            📈
          </div>
          <h3 className="font-serif text-lg font-bold text-text-dark">No Progress Metrics Logged Yet</h3>
          <p className="text-sm text-text-muted max-w-sm mx-auto mt-2 leading-relaxed">
            Your metrics will populate here automatically as soon as your assigned trainer completes your first virtual live session and logs progress feedback.
          </p>
        </Card>
      )}
    </div>
  );
}
