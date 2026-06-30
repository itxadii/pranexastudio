"use server";

import { prisma } from "@/lib/prisma";
import * as bcrypt from "bcryptjs";
import { z } from "zod";
import { revalidatePath } from "next/cache";

const employeeSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters")
});

const editEmployeeSchema = z.object({
  id: z.string(),
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Invalid email address")
});

export async function addEmployee(formData: z.infer<typeof employeeSchema>) {
  try {
    const validated = employeeSchema.parse(formData);

    const existingUser = await prisma.user.findUnique({
      where: { email: validated.email }
    });

    if (existingUser) {
      return { success: false, error: "Employee email already exists" };
    }

    const hashedPassword = await bcrypt.hash(validated.password, 10);

    const newUser = await prisma.user.create({
      data: {
        name: validated.name,
        email: validated.email,
        password: hashedPassword,
        role: "TRAINER"
      }
    });

    revalidatePath("/admin/trainers");
    return { success: true, user: { id: newUser.id, name: newUser.name, email: newUser.email } };
  } catch (error: any) {
    return { success: false, error: error.message || "Failed to create trainer" };
  }
}

export async function editEmployee(formData: z.infer<typeof editEmployeeSchema>) {
  try {
    const validated = editEmployeeSchema.parse(formData);

    // Verify email is not taken by another user
    const emailTaken = await prisma.user.findFirst({
      where: {
        email: validated.email,
        NOT: { id: validated.id }
      }
    });

    if (emailTaken) {
      return { success: false, error: "Email is already taken by another trainer" };
    }

    await prisma.user.update({
      where: { id: validated.id },
      data: {
        name: validated.name,
        email: validated.email
      }
    });

    revalidatePath("/admin/trainers");
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message || "Failed to update trainer" };
  }
}

export async function deleteEmployee(id: string) {
  try {
    await prisma.user.delete({
      where: { id }
    });

    revalidatePath("/admin/trainers");
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message || "Failed to delete trainer" };
  }
}

export async function resetEmployeePassword(id: string, newPassword: string) {
  try {
    if (newPassword.length < 6) {
      return { success: false, error: "Password must be at least 6 characters" };
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);

    await prisma.user.update({
      where: { id },
      data: { password: hashedPassword }
    });

    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message || "Failed to reset password" };
  }
}
