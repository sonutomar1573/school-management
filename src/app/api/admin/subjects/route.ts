import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";

export async function GET(req: Request) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const classId = searchParams.get("classId");

  const subjects = await prisma.subject.findMany({
    where: classId ? { classId } : undefined,
    include: { class: true },
    orderBy: { name: "asc" },
  });
  return NextResponse.json(subjects);
}

export async function POST(req: Request) {
  const session = await getSession();
  if (!session || session.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { name, classId } = await req.json();
    if (!name?.trim() || !classId) {
      return NextResponse.json({ error: "Subject name and class are required" }, { status: 400 });
    }

    const subject = await prisma.subject.create({
      data: { name: name.trim(), classId },
    });
    return NextResponse.json(subject, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Subject already exists in this class" }, { status: 409 });
  }
}
