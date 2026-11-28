import { NextResponse, type NextRequest } from "next/server";
import { SESSION_COOKIE_NAME } from "@/lib/auth-cookie";
import { logoutOnServer } from "@/server/auth/session";
import { assertSameOrigin, authFailure, expireSessionCookie, noStore } from "@/server/auth/http";

export const dynamic = "force-dynamic";
export async function POST(request: NextRequest) {
  try {
    assertSameOrigin(request);
    await logoutOnServer(request.cookies.get(SESSION_COOKIE_NAME)?.value);
    return noStore(expireSessionCookie(new NextResponse(null, { status: 204 }), request));
  } catch (error) { return authFailure(error); }
}
