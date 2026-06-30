"use server";

import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";
import * as bcrypt from "bcryptjs";

export async function changeOwnPassword(currentPass: string, newPass: string) {
  try {
    const session = await auth();
    if (!session?.user?.email) {
      return { success: false, error: "You must be logged in to change your password." };
    }

    if (newPass.length < 6) {
      return { success: false, error: "New password must be at least 6 characters." };
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email }
    });

    if (!user) {
      return { success: false, error: "User not found." };
    }

    const isCurrentValid = await bcrypt.compare(currentPass, user.password);
    if (!isCurrentValid) {
      return { success: false, error: "Incorrect current password." };
    }

    const hashed = await bcrypt.hash(newPass, 10);
    
    await prisma.user.update({
      where: { email: session.user.email },
      data: { password: hashed }
    });

    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message || "Failed to update password." };
  }
}
