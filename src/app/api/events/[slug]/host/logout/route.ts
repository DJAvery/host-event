import { NextResponse } from "next/server";
import { getHostSessionCookieName } from "@/lib/adminAuth";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;
  const response = NextResponse.json({ success: true });
  response.cookies.set(getHostSessionCookieName(slug), "", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 0,
  });
  return response;
}
