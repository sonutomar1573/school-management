import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";

export async function POST(req: Request) {
  const session = await getSession();
  if (!session || session.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { classId, name } = await req.json();
    if (!classId || !name?.trim()) {
      return NextResponse.json({ error: "Class and section name are required" }, { status: 400 });
    }

    const section = await prisma.section.create({
      data: { classId, name: name.trim().toUpperCase() },
    });

    return NextResponse.json(section, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Section already exists in this class" }, { status: 409 });
  }
}
