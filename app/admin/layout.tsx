import React from "react";
import { auth } from "@/auth";
import { redirect } from "next/navigation";
import Sidebar from "@/components/layout/Sidebar";

export default async function AdminLayout({
  children
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  if (!session?.user || (session.user as any).role !== "ADMIN") {
    redirect("/login");
  }

  return (
    <div className="flex flex-col lg:flex-row min-h-screen bg-warm-cream/30">
      <Sidebar
        role="ADMIN"
        userName={session.user.name || "Administrator"}
        userEmail={session.user.email || ""}
      />
      <main className="flex-grow p-6 lg:p-10 w-full overflow-y-auto">
        <div className="max-w-7xl mx-auto">
          {children}
        </div>
      </main>
    </div>
  );
}
