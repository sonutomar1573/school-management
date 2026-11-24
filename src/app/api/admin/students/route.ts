import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";

export async function GET() {
  const session = await getSession();
  if (!session || session.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const students = await prisma.student.findMany({
    where: { isDeleted: false },
    include: {
      user: { select: { identifier: true } },
      class: true,
      section: true,
      parent: true,
    },
    orderBy: [{ class: { name: "asc" } }, { section: { name: "asc" } }, { rollNumber: "asc" }],
  });

  return NextResponse.json(students);
}

export async function POST(req: Request) {
  const session = await getSession();
  if (!session || session.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { name, rollNumber, classId, sectionId, parentName, parentMobile, address } = await req.json();

    if (!name?.trim() || !rollNumber?.trim() || !classId || !sectionId || !parentName?.trim() || !parentMobile?.trim()) {
      return NextResponse.json({ error: "All required fields must be filled" }, { status: 400 });
    }

    const [cls, sec] = await Promise.all([
      prisma.class.findUnique({ where: { id: classId } }),
      prisma.section.findUnique({ where: { id: sectionId } }),
    ]);

    if (!cls || !sec) {
      return NextResponse.json({ error: "Invalid class or section" }, { status: 400 });
    }

    const studentLoginId = `${cls.name.replace(/\s+/g, "").toUpperCase()}-${sec.name}-${rollNumber.trim()}`;
    const studentHash = await bcrypt.hash("Student@123", 10);
    const parentHash = await bcrypt.hash("Parent@123", 10);

    const student = await prisma.$transaction(async (tx) => {
      // Find existing parent by mobile or create new Parent + User
      let parent = await tx.parent.findUnique({ where: { mobile: parentMobile.trim() } });

      if (!parent) {
        const parentUser = await tx.user.create({
          data: {
            identifier: parentMobile.trim(),
            passwordHash: parentHash,
            role: "PARENT",
          },
        });
        parent = await tx.parent.create({
          data: {
            userId: parentUser.id,
            name: parentName.trim(),
            mobile: parentMobile.trim(),
          },
        });
      }

      const studentUser = await tx.user.create({
        data: {
          identifier: studentLoginId,
          passwordHash: studentHash,
          role: "STUDENT",
        },
      });

      return tx.student.create({
        data: {
          userId: studentUser.id,
          rollNumber: rollNumber.trim(),
          name: name.trim(),
          address: address?.trim() || null,
          classId,
          sectionId,
          parentId: parent.id,
        },
      });
    });

    return NextResponse.json({ student, studentLoginId }, { status: 201 });
  } catch {
    return NextResponse.json(
      { error: "Roll number already exists in this class/section, or parent mobile conflict" },
      { status: 409 }
    );
  }
}
