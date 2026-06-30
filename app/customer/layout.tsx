import React from "react";
import { auth } from "@/auth";
import { redirect } from "next/navigation";
import Sidebar from "@/components/layout/Sidebar";

export default async function CustomerLayout({
  children
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  if (!session?.user || (session.user as any).role !== "CUSTOMER") {
    redirect("/login");
  }

  return (
    <div className="flex flex-col lg:flex-row min-h-screen bg-warm-cream/30">
      <Sidebar
        role="CUSTOMER"
        userName={session.user.name || "Customer"}
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
