import { PrismaClient } from "@prisma/client";
import * as bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("Seeding data...");

  // 0. Clear tables in reverse dependency order
  await prisma.attendance.deleteMany({});
  await prisma.progressLog.deleteMany({});
  await prisma.session.deleteMany({});
  await prisma.invoice.deleteMany({});
  await prisma.customerSubscription.deleteMany({});
  await prisma.trainerAssignment.deleteMany({});
  await prisma.trainerLeave.deleteMany({});
  await prisma.lecture.deleteMany({});
  await prisma.subscriptionPlan.deleteMany({});
  await prisma.user.deleteMany({});

  // Hashed password for users
  const hashedPassword = await bcrypt.hash("admin123", 10);

  // 1. Seed Admin
  const adminEmail = "kolpeprathamesh@gmail.com";
  const admin = await prisma.user.upsert({
    where: { email: adminEmail },
    update: {},
    create: {
      name: "System Admin",
      email: adminEmail,
      password: hashedPassword,
      role: "ADMIN",
      status: "ACTIVE",
      country: "India",
      timezone: "Asia/Kolkata"
    }
  });
  console.log("Admin seeded.");

  // 2. Seed Trainer (formerly Employee)
  const trainerEmail = "trainer@example.com";
  const trainer = await prisma.user.upsert({
    where: { email: trainerEmail },
    update: {},
    create: {
      name: "Ira Trivedi",
      email: trainerEmail,
      password: hashedPassword,
      role: "TRAINER",
      status: "ACTIVE",
      country: "India",
      timezone: "Asia/Kolkata",
      phone: "+919876543210"
    }
  });
  console.log("Trainer seeded.");

  // 3. Seed Customers
  const customer1 = await prisma.user.upsert({
    where: { email: "customer1@example.com" },
    update: {},
    create: {
      name: "Emily Watson",
      email: "customer1@example.com",
      password: hashedPassword,
      role: "CUSTOMER",
      status: "ACTIVE",
      country: "United States",
      timezone: "America/New_York",
      phone: "+15550199"
    }
  });

  const customer2 = await prisma.user.upsert({
    where: { email: "customer2@example.com" },
    update: {},
    create: {
      name: "Akira Tanaka",
      email: "customer2@example.com",
      password: hashedPassword,
      role: "CUSTOMER",
      status: "ACTIVE",
      country: "Japan",
      timezone: "Asia/Tokyo",
      phone: "+819012345678"
    }
  });
  console.log("Customers seeded.");

  // 4. Seed Subscription Plans
  const monthlyPlan = await prisma.subscriptionPlan.create({
    data: {
      title: "Monthly Basic Yoga",
      duration: "Monthly",
      price: 50.0,
      currency: "USD",
      description: "Standard monthly practice package. 3 sessions per week.",
      sessionsPerWeek: 3,
      active: true
    }
  });

  const quarterlyPlan = await prisma.subscriptionPlan.create({
    data: {
      title: "Quarterly Yoga Devotee",
      duration: "Quarterly",
      price: 130.0,
      currency: "USD",
      description: "Extend your yoga journey for 3 months. 3 sessions per week.",
      sessionsPerWeek: 3,
      active: true
    }
  });

  const yearlyPlan = await prisma.subscriptionPlan.create({
    data: {
      title: "Yearly Premium Sadhana",
      duration: "Yearly",
      price: 480.0,
      currency: "USD",
      description: "Full year yoga commitment. 4 sessions per week + customized diet logs.",
      sessionsPerWeek: 4,
      active: true
    }
  });
  console.log("Plans seeded.");

  // 5. Seed Customer Subscription for Customer 1
  const now = new Date();
  const expiry = new Date();
  expiry.setDate(expiry.getDate() + 30); // 30 days from now

  const subscription = await prisma.customerSubscription.create({
    data: {
      customerId: customer1.id,
      planId: monthlyPlan.id,
      startDate: now,
      expiryDate: expiry,
      status: "ACTIVE",
      paymentStatus: "PAID",
      stripePaymentId: "ch_mock_12345"
    }
  });

  // Generate Invoice
  await prisma.invoice.create({
    data: {
      customerId: customer1.id,
      subscriptionId: subscription.id,
      amount: 50.0,
      currency: "USD",
      paymentMethod: "stripe",
      invoiceNumber: "INV-2026-0001",
      status: "paid"
    }
  });
  console.log("Subscriptions and invoices seeded.");

  // 6. Assign Trainer to Customer 1
  await prisma.trainerAssignment.create({
    data: {
      trainerId: trainer.id,
      customerId: customer1.id,
      active: true
    }
  });
  console.log("Trainer assignments seeded.");

  // 7. Seed Session
  const sessionStartTime = new Date();
  sessionStartTime.setHours(sessionStartTime.getHours() + 2); // 2 hours from now
  const sessionEndTime = new Date(sessionStartTime.getTime() + 60 * 60 * 1000); // 1 hour duration

  await prisma.session.create({
    data: {
      trainerId: trainer.id,
      customerId: customer1.id,
      title: "Beginner Hatha Yoga Basics",
      date: sessionStartTime,
      startTime: sessionStartTime,
      endTime: sessionEndTime,
      duration: 60,
      meetingProvider: "GoogleMeet",
      meetingLink: "https://meet.google.com/abc-defg-hij",
      status: "Scheduled",
      notes: "Focus on deep alignment, breathing patterns, and core flexibility stretches."
    }
  });
  console.log("Sessions seeded.");

  // 8. Seed Completed Session & Progress Log
  const pastStartTime = new Date();
  pastStartTime.setDate(pastStartTime.getDate() - 1); // 1 day ago
  const pastEndTime = new Date(pastStartTime.getTime() + 60 * 60 * 1000);

  const completedSession = await prisma.session.create({
    data: {
      trainerId: trainer.id,
      customerId: customer1.id,
      title: "Morning Vinyasa Basics",
      date: pastStartTime,
      startTime: pastStartTime,
      endTime: pastEndTime,
      duration: 60,
      meetingProvider: "GoogleMeet",
      meetingLink: "https://meet.google.com/abc-defg-hij",
      status: "Completed",
      notes: "First introductory session."
    }
  });

  // Seed Attendance for the completed session
  await prisma.attendance.create({
    data: {
      sessionId: completedSession.id,
      trainerPresent: true,
      customerPresent: true,
      remarks: "Excellent energy and posture dedication."
    }
  });

  // Seed Progress Log for the completed session
  await prisma.progressLog.create({
    data: {
      sessionId: completedSession.id,
      customerId: customer1.id,
      trainerId: trainer.id,
      flexibility: 8,
      balance: 7,
      breathing: 9,
      focus: 8,
      stress: 8,
      weight: 62.5,
      remarks: "Great beginner flexibility. Breathing techniques are stable, focus is deep."
    }
  });
  console.log("Completed sessions and progress logs seeded.");
  console.log("Seeding complete successfully!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
