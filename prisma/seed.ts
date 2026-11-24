import { PrismaClient, Role } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  const passwordHash = await bcrypt.hash("Admin@123", 10);

  const admin = await prisma.user.upsert({
    where: { identifier: "admin@school.com" },
    update: {},
    create: {
      identifier: "admin@school.com",
      passwordHash,
      role: Role.ADMIN,
    },
  });

  console.log("Seeded Admin user:", admin.identifier);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });