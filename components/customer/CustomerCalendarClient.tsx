"use client";

import React, { useState, useMemo } from "react";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import interactionPlugin from "@fullcalendar/interaction";
import { Card, CardContent } from "@/components/ui/Card";
import { Dialog } from "@/components/ui/Dialog";
import { Badge } from "@/components/ui/Badge";

interface CalendarSession {
  id: string;
  title: string;
  start: string;
  end: string;
  status: string; // Scheduled, Completed, Cancelled, Missed
  meetingProvider: string;
  meetingLink: string | null;
  notes: string | null;
  trainerName: string;
}

interface CustomerCalendarClientProps {
  sessions: CalendarSession[];
}

export default function CustomerCalendarClient({ sessions }: CustomerCalendarClientProps) {
  const [selectedSession, setSelectedSession] = useState<CalendarSession | null>(null);
  const [isOpen, setIsOpen] = useState(false);

  // Map database session statuses to premium calendar colors
  const calendarEvents = useMemo(() => {
    return sessions.map((s) => {
      let color = "#0369a1"; // Blue (Scheduled)
      if (s.status === "Completed") {
        color = "#15803d"; // Green
      } else if (s.status === "Cancelled") {
        color = "#b91c1c"; // Red
      } else if (s.status === "Missed") {
        color = "#ea580c"; // Orange
      }

      return {
        id: s.id,
        title: s.title,
        start: s.start,
        end: s.end,
        backgroundColor: color,
        borderColor: color,
        textColor: "#ffffff",
        extendedProps: { ...s }
      };
    });
  }, [sessions]);

  const handleEventClick = (info: any) => {
    const sessionDetails = info.event.extendedProps as CalendarSession;
    setSelectedSession(sessionDetails);
    setIsOpen(true);
  };

  return (
    <div className="space-y-6">
      
      {/* Legend guide bar */}
      <div className="flex flex-wrap items-center gap-4 bg-white p-4 rounded-xl border border-cream-dark shadow-xs text-xs font-semibold">
        <span className="text-text-muted">Status Legend:</span>
        <div className="flex items-center gap-1.5">
          <span className="w-3.5 h-3.5 rounded-md bg-[#0369a1] block" />
          <span className="text-text-dark">Upcoming</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-3.5 h-3.5 rounded-md bg-[#15803d] block" />
          <span className="text-text-dark">Completed</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-3.5 h-3.5 rounded-md bg-[#b91c1c] block" />
          <span className="text-text-dark">Cancelled</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-3.5 h-3.5 rounded-md bg-[#ea580c] block" />
          <span className="text-text-dark">Missed Class</span>
        </div>
      </div>

      {/* Main Calendar Card */}
      <Card className="bg-white border border-cream-dark shadow-sm p-4 sm:p-6 overflow-hidden">
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
            eventClick={handleEventClick}
          />
        </div>
      </Card>

      {/* Session Details Dialog Modal */}
      <Dialog isOpen={isOpen} onClose={() => setIsOpen(false)} title="Session Details">
        {selectedSession && (
          <div className="space-y-5">
            <div className="space-y-1">
              <Badge variant={
                selectedSession.status === "Completed" ? "success" : 
                (selectedSession.status === "Scheduled" ? "default" : 
                (selectedSession.status === "Cancelled" ? "destructive" : "warning"))
              }>
                {selectedSession.status}
              </Badge>
              <h3 className="text-xl font-bold text-text-dark pt-1">{selectedSession.title}</h3>
            </div>

            <div className="divide-y divide-cream-dark/50 border-t border-b border-cream-dark/50 py-1 text-sm space-y-3">
              <div className="flex justify-between items-center pt-2">
                <span className="text-xs uppercase tracking-wider font-bold text-text-muted">Instructor</span>
                <span className="font-semibold text-text-dark">{selectedSession.trainerName}</span>
              </div>
              <div className="flex justify-between items-center pt-3">
                <span className="text-xs uppercase tracking-wider font-bold text-text-muted">Date</span>
                <span className="font-semibold text-text-dark">
                  {new Date(selectedSession.start).toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' })}
                </span>
              </div>
              <div className="flex justify-between items-center pt-3">
                <span className="text-xs uppercase tracking-wider font-bold text-text-muted">Time</span>
                <span className="font-semibold text-text-dark">
                  {new Date(selectedSession.start).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} - {new Date(selectedSession.end).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
            </div>

            {/* Video Call Integration Button */}
            {selectedSession.status === "Scheduled" && (
              <div className="space-y-2 pt-1">
                {selectedSession.meetingLink ? (
                  <a
                    href={selectedSession.meetingLink}
                    target="_blank"
                    rel="noreferrer"
                    className="w-full px-5 py-3 rounded-full bg-deep-teal hover:bg-deep-teal/90 text-white font-bold shadow-md transition-colors flex items-center justify-center gap-2 text-sm text-center"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor" className="w-4 h-4">
                      <path strokeLinecap="round" strokeLinejoin="round" d="m15.75 10.5 4.72-4.72a.75.75 0 0 1 1.28.53v11.38a.75.75 0 0 1-1.28.53l-4.72-4.72M4.5 18.75h9a2.25 2.25 0 0 0 2.25-2.25v-9a2.25 2.25 0 0 0-2.25-2.25h-9A2.25 2.25 0 0 0 2.25 7.5v9a2.25 2.25 0 0 0 2.25 2.25Z" />
                    </svg>
                    Join {selectedSession.meetingProvider === "GoogleMeet" ? "Google Meet" : selectedSession.meetingProvider} Session
                  </a>
                ) : (
                  <button
                    disabled
                    className="w-full px-5 py-3 rounded-full bg-cream-dark text-text-muted/60 font-bold cursor-not-allowed text-center text-sm"
                  >
                    Meeting Link Pending
                  </button>
                )}
              </div>
            )}

            {/* Reflection Notes logged by trainer */}
            {selectedSession.notes && (
              <div className="bg-warm-cream/20 p-3.5 rounded-xl border border-cream-dark/50 text-xs">
                <span className="font-bold text-text-muted uppercase tracking-wider block mb-1">Session Summary & Notes:</span>
                <p className="text-text-dark leading-relaxed italic">"{selectedSession.notes}"</p>
              </div>
            )}

            <div className="flex justify-end pt-2">
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="px-5 py-2.5 rounded-full border border-text-dark/20 text-text-dark hover:bg-cream-dark/50 font-semibold text-sm transition-colors"
              >
                Close Details
              </button>
            </div>
          </div>
        )}
      </Dialog>

    </div>
  );
}
