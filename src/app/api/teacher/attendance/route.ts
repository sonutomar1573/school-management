import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";

export async function GET(req: Request) {
  const session = await getSession();
  if (!session || session.role !== "TEACHER") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const teacher = await prisma.teacher.findUnique({
    where: { userId: session.userId },
    include: { assignedSections: { include: { class: true } } },
  });

  if (!teacher) return NextResponse.json({ error: "Teacher not found" }, { status: 404 });

  const { searchParams } = new URL(req.url);
  const sectionId = searchParams.get("sectionId") || teacher.assignedSections[0]?.id;
  const dateStr = searchParams.get("date") || new Date().toISOString().split("T")[0];

  if (!sectionId) {
    return NextResponse.json({ sections: [], students: [], records: {} });
  }

  const students = await prisma.student.findMany({
    where: { sectionId, isDeleted: false },
    orderBy: { rollNumber: "asc" },
  });

  const existing = await prisma.attendance.findMany({
    where: { sectionId, date: new Date(dateStr) },
  });

  const records: Record<string, string> = {};
  existing.forEach((a) => {
    records[a.studentId] = a.status;
  });

  return NextResponse.json({ sections: teacher.assignedSections, students, records });
}

export async function POST(req: Request) {
  const session = await getSession();
  if (!session || session.role !== "TEACHER") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const teacher = await prisma.teacher.findUnique({ where: { userId: session.userId } });
  if (!teacher) return NextResponse.json({ error: "Teacher not found" }, { status: 404 });

  const { sectionId, date, entries } = await req.json();
  const attendanceDate = new Date(date);

  await prisma.$transaction(
    entries.map((entry: { studentId: string; status: "PRESENT" | "ABSENT" | "LATE" }) =>
      prisma.attendance.upsert({
        where: { studentId_date: { studentId: entry.studentId, date: attendanceDate } },
        update: { status: entry.status, markedById: teacher.id },
        create: {
          studentId: entry.studentId,
          sectionId,
          date: attendanceDate,
          status: entry.status,
          markedById: teacher.id,
        },
      })
    )
  );

  return NextResponse.json({ success: true });
}
