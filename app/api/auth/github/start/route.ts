import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const origin = url.origin;

  const callbackUrl = `${origin}/api/auth/github/callback`;
  const authUrl = `/api/auth/signin/github?callbackUrl=${encodeURIComponent(callbackUrl)}`;

  return NextResponse.json({ authUrl });
}
