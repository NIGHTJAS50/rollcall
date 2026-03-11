import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { Role } from "@prisma/client";

export async function POST(req: NextRequest) {
  try {
    const { name, email, password, role, studentId } = await req.json();

    if (!name || !email || !password || !role) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      return NextResponse.json(
        { error: "Email already in use" },
        { status: 409 }
      );
    }

    const hashedPassword = await bcrypt.hash(password, 12);

    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        role: role as Role,
        studentId: role === "STUDENT" ? studentId : null,
      },
    });

    return NextResponse.json(
      { message: "User created", userId: user.id },
      { status: 201 }
    );
  } catch {
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
