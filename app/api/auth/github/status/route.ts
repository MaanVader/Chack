import { authOptions } from "@/lib/auth";
import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";

export async function GET() {
  const session = await getServerSession(authOptions);

  if (session?.user?.provider === "github") {
    return NextResponse.json({
      connected: true,
      username: session.user.name || session.user.email || "GitHub user",
      avatar: session.user.image,
    });
  }

  return NextResponse.json({ connected: false });
}
