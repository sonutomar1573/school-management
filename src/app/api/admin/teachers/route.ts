import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";

export async function GET() {
  const session = await getSession();
  if (!session || session.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const teachers = await prisma.teacher.findMany({
    where: { isDeleted: false },
    include: {
      assignedSections: { include: { class: true } },
    },
    orderBy: { name: "asc" },
  });

  return NextResponse.json(teachers);
}

export async function POST(req: Request) {
  const session = await getSession();
  if (!session || session.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { name, mobile, subjectSpecialization, sectionId } = await req.json();

    if (!name?.trim() || !mobile?.trim()) {
      return NextResponse.json({ error: "Name and mobile are required" }, { status: 400 });
    }

    const passwordHash = await bcrypt.hash("Teacher@123", 10);

    const teacher = await prisma.$transaction(async (tx) => {
      const user = await tx.user.create({
        data: {
          identifier: mobile.trim(),
          passwordHash,
          role: "TEACHER",
        },
      });

      const createdTeacher = await tx.teacher.create({
        data: {
          userId: user.id,
          name: name.trim(),
          mobile: mobile.trim(),
          subjectSpecialization: subjectSpecialization?.trim() || null,
        },
      });

      if (sectionId) {
        await tx.section.update({
          where: { id: sectionId },
          data: { classTeacherId: createdTeacher.id },
        });
      }

      return createdTeacher;
    });

    return NextResponse.json(teacher, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Mobile number already registered" }, { status: 409 });
  }
}
