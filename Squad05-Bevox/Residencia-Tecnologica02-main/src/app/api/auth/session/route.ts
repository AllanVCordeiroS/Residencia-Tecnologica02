import { NextResponse, type NextRequest } from "next/server";
import { SESSION_COOKIE_NAME } from "@/lib/auth-cookie";
import { verifyServerSession } from "@/server/auth/session";
import { authFailure, expireSessionCookie, noStore } from "@/server/auth/http";

export const dynamic = "force-dynamic";
export async function GET(request: NextRequest) {
  try {
    const session = await verifyServerSession(request.cookies.get(SESSION_COOKIE_NAME)?.value);
    if (!session) return noStore(expireSessionCookie(NextResponse.json({ error: "SESSION_INVALID", message: "Sua sessão expirou. Entre novamente para continuar." }, { status: 401 }), request));
    return noStore(NextResponse.json({ session }));
  } catch (error) { return expireSessionCookie(authFailure(error), request); }
}
