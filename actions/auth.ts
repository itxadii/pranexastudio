"use server";

import { prisma } from "@/lib/prisma";

export async function verifyUserRole(email: string, requiredRole: "ADMIN" | "TRAINER" | "CUSTOMER") {
  try {
    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase().trim() }
    });

    if (!user) {
      return { success: false, error: "No account found with this email address." };
    }

    if (user.role !== requiredRole) {
      const displayRole = user.role === "ADMIN" ? "Administrator" : user.role === "TRAINER" ? "Trainer" : "Customer";
      const portalName = requiredRole === "ADMIN" ? "Admin Portal" : requiredRole === "TRAINER" ? "Trainer Portal" : "Customer Portal";
      return { 
        success: false, 
        error: `Access Denied: This account is registered as a ${displayRole}. Please log in via the correct ${portalName}.` 
      };
    }

    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message || "Failed to verify account permissions." };
  }
}
