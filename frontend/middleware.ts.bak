import createMiddleware from "next-intl/middleware";
import { routing } from "./i18n/routing";

/**
 * Next.js 16+ uses proxy.ts at the network boundary (middleware.ts is deprecated).
 * Without this running, next-intl cannot negotiate locale headers and nested routes may 404.
 */
export default createMiddleware(routing);

export const config = {
  matcher: ["/((?!api|_next|_vercel|.*\\..*).*)"],
};
