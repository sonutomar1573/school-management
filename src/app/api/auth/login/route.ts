import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { createSession } from "@/lib/auth";

export async function POST(req: Request) {
  try {
    const { identifier, password } = await req.json();

    if (!identifier || !password) {
      return NextResponse.json({ error: "Identifier and password are required" }, { status: 400 });
    }

    const user = await prisma.user.findUnique({ where: { identifier } });

    if (!user || !user.isActive) {
      return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
    }

    const isValid = await bcrypt.compare(password, user.passwordHash);
    if (!isValid) {
      return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
    }

    await createSession({
      userId: user.id,
      role: user.role,
      identifier: user.identifier,
    });

    const redirectMap = {
      ADMIN: "/admin",
      TEACHER: "/teacher",
      STUDENT: "/student",
      PARENT: "/parent",
    };

    return NextResponse.json({ role: user.role, redirect: redirectMap[user.role] });
  } catch {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
