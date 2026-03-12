import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  const { email } = await req.json();
  if (!email)
    return NextResponse.json({ error: "Email is required" }, { status: 400 });

  const user = await prisma.user.findUnique({ where: { email } });

  // Always return success to avoid leaking whether an email exists
  if (!user)
    return NextResponse.json({ message: "If that email exists, a reset link has been generated." });

  const token = crypto.randomUUID();
  const expiry = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

  await prisma.user.update({
    where: { email },
    data: { passwordResetToken: token, passwordResetExpiry: expiry },
  });

  // In production this token would be emailed. For now, return it directly.
  return NextResponse.json({ token });
}
