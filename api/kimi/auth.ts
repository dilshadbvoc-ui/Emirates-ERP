import * as cookie from "cookie";
import { env } from "../lib/env.js";
import { Session } from "../../contracts/constants.js";
import { Errors } from "../../contracts/errors.js";
import { verifyLocalToken } from "../localAuth.js";

/**
 * authenticateRequest – JWT-only auth (no external Kimi OAuth).
 *
 * Checks in order:
 *  1. Authorization: Bearer <jwt>  (API clients)
 *  2. x-local-auth-token header    (SPA tRPC calls)
 *  3. Session cookie                (browser fallback)
 */
export async function authenticateRequest(headers: Headers) {
  // 1️⃣ Bearer token
  const authHeader = headers.get("authorization");
  if (authHeader && authHeader.startsWith("Bearer ")) {
    const bearerToken = authHeader.substring(7).trim();
    const user = await verifyLocalToken(bearerToken);
    if (user) return user;
    throw Errors.forbidden("Invalid Bearer token.");
  }

  // 2️⃣ x-local-auth-token header (used by tRPC httpBatchLink)
  const localToken = headers.get("x-local-auth-token");
  if (localToken) {
    const user = await verifyLocalToken(localToken);
    if (user) return user;
    throw Errors.forbidden("Invalid local auth token.");
  }

  // 3️⃣ Session cookie fallback
  const cookies = cookie.parse(headers.get("cookie") || "");
  const cookieToken = cookies[Session.cookieName];
  if (cookieToken) {
    const user = await verifyLocalToken(cookieToken);
    if (user) return user;
  }

  throw Errors.forbidden("Authentication required. Please sign in.");
}
