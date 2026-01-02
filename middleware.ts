import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// Simple pass-through middleware (no auth needed for single-user app)
export function middleware(request: NextRequest) {
  return NextResponse.next();
}

export const config = {
  matcher: [],
};
