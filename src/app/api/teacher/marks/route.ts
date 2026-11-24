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
    include: { assignedSections: { include: { class: { include: { subjects: true } } } } },
  });

  const exams = await prisma.exam.findMany({ orderBy: { startDate: "desc" } });

  const { searchParams } = new URL(req.url);
  const sectionId = searchParams.get("sectionId") || teacher?.assignedSections[0]?.id;
  const examId = searchParams.get("examId") || exams[0]?.id;
  const subjectId = searchParams.get("subjectId");

  const students = sectionId
    ? await prisma.student.findMany({ where: { sectionId, isDeleted: false }, orderBy: { rollNumber: "asc" } })
    : [];

  const existingMarks =
    examId && subjectId
      ? await prisma.mark.findMany({ where: { examId, subjectId } })
      : [];

  const marksMap: Record<string, number> = {};
  existingMarks.forEach((m) => {
    marksMap[m.studentId] = m.marksObtained;
  });

  return NextResponse.json({
    sections: teacher?.assignedSections || [],
    exams,
    students,
    marksMap,
  });
}

export async function POST(req: Request) {
  const session = await getSession();
  if (!session || session.role !== "TEACHER") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { examId, subjectId, maxMarks, entries } = await req.json();

  await prisma.$transaction(
    entries.map((entry: { studentId: string; marksObtained: number }) =>
      prisma.mark.upsert({
        where: { examId_studentId_subjectId: { examId, studentId: entry.studentId, subjectId } },
        update: { marksObtained: Number(entry.marksObtained), maxMarks: Number(maxMarks) || 100 },
        create: {
          examId,
          subjectId,
          studentId: entry.studentId,
          marksObtained: Number(entry.marksObtained),
          maxMarks: Number(maxMarks) || 100,
        },
      })
    )
  );

  return NextResponse.json({ success: true });
}
