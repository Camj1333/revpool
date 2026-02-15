export { auth as middleware } from "@/auth";

export const config = {
  matcher: [
    /*
     * Match all paths except:
     * - _next/static, _next/image, favicon.ico (Next.js internals)
     * - api/auth (NextAuth routes)
     */
    "/((?!_next/static|_next/image|favicon\\.ico|api/auth).*)",
  ],
};
