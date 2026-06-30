import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const users = await prisma.user.findMany();
  console.log("All users in DB:", JSON.stringify(users, null, 2));

  const targetUser = await prisma.user.findUnique({
    where: { email: "diamondgamerz49@gmail.com" }
  });
  console.log("Target user by email:", JSON.stringify(targetUser, null, 2));
}

main().catch(console.error).finally(() => prisma.$disconnect());
