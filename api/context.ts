import type { FetchCreateContextFnOptions } from "@trpc/server/adapters/fetch";
import type { LocalUser } from "@db/schema";
import { verifyLocalToken } from "./localAuth";

export type UnifiedUser = {
  id: number;
  name: string;
  email?: string | null;
  avatar?: string | null;
  role: "user" | "admin";
  authType: "local";
};

export type TrpcContext = {
  req: Request;
  resHeaders: Headers;
  user?: Omit<LocalUser, "password">;
  unifiedUser?: UnifiedUser;
};

export async function createContext(
  opts: FetchCreateContextFnOptions,
): Promise<TrpcContext> {
  const ctx: TrpcContext = { req: opts.req, resHeaders: opts.resHeaders };

  // Authenticate via x-local-auth-token header (sent by tRPC client)
  try {
    const token = opts.req.headers.get("x-local-auth-token");
    if (token) {
      const localUser = await verifyLocalToken(token);
      if (localUser) {
        ctx.user = localUser;
        ctx.unifiedUser = {
          id: localUser.id,
          name: localUser.fullName || localUser.username,
          email: localUser.email,
          avatar: null,
          role: localUser.role as "user" | "admin",
          authType: "local",
        };
      }
    }
  } catch {
    // Auth failed – context remains unauthenticated
  }

  return ctx;
}
