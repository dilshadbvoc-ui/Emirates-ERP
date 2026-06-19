import { z } from "zod";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { eq } from "drizzle-orm";
import { TRPCError } from "@trpc/server";
import { createRouter, publicQuery } from "./middleware";
import { getDb } from "./queries/connection";
import { localUsers } from "@db/schema";
import type { LocalUser } from "@db/schema";
import { env } from "./lib/env";

const JWT_SECRET = env.localAuthSecret;

function signToken(userId: number): string {
  return jwt.sign({ userId, type: "local" }, JWT_SECRET, { expiresIn: "7d" });
}

export async function verifyLocalToken(token: string): Promise<Omit<LocalUser, "password"> | null> {
  try {
    const decoded = jwt.verify(token, JWT_SECRET, { clockTolerance: 60 }) as { userId: number };
    const db = getDb();
    const user = await db.select().from(localUsers).where(eq(localUsers.id, decoded.userId)).limit(1);
    if (user.length === 0) return null;
    const { password, ...userWithoutPassword } = user[0];
    return userWithoutPassword;
  } catch {
    return null;
  }
}

export const localAuthRouter = createRouter({
  register: publicQuery
    .input(
      z.object({
        fullName: z.string().min(2, "Name must be at least 2 characters"),
        email: z.string().email("Invalid email address"),
        username: z.string().min(3, "Username must be at least 3 characters"),
        password: z.string().min(6, "Password must be at least 6 characters"),
      })
    )
    .mutation(async ({ input }) => {
      const db = getDb();

      // Check if username or email already exists
      const existing = await db
        .select()
        .from(localUsers)
        .where(eq(localUsers.username, input.username))
        .limit(1);

      if (existing.length > 0) {
        throw new TRPCError({
          code: "CONFLICT",
          message: "Username already exists",
        });
      }

      const existingEmail = await db
        .select()
        .from(localUsers)
        .where(eq(localUsers.email, input.email))
        .limit(1);

      if (existingEmail.length > 0) {
        throw new TRPCError({
          code: "CONFLICT",
          message: "Email already registered",
        });
      }

      const hashedPassword = await bcrypt.hash(input.password, 10);

      const result = await db.insert(localUsers).values({
        fullName: input.fullName,
        email: input.email,
        username: input.username,
        password: hashedPassword,
      });

      const userId = Number(result[0].insertId);
      const token = signToken(userId);

      return {
        token,
        user: {
          id: userId,
          fullName: input.fullName,
          username: input.username,
          role: "user" as const,
        },
      };
    }),

  login: publicQuery
    .input(
      z.object({
        username: z.string(),
        password: z.string(),
      })
    )
    .mutation(async ({ input }) => {
      const db = getDb();

      const users = await db
        .select()
        .from(localUsers)
        .where(eq(localUsers.username, input.username))
        .limit(1);

      if (users.length === 0) {
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: "Invalid username or password",
        });
      }

      const user = users[0];
      const valid = await bcrypt.compare(input.password, user.password);

      if (!valid) {
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: "Invalid username or password",
        });
      }

      const token = signToken(user.id);

      return {
        token,
        user: {
          id: user.id,
          fullName: user.fullName,
          username: user.username,
          role: user.role as "user" | "admin",
        },
      };
    }),

  me: publicQuery.query(async ({ ctx }) => {
    const token = ctx.req.headers.get("x-local-auth-token");
    if (!token) return null;

    const user = await verifyLocalToken(token);
    if (!user) return null;

    return {
      id: user.id,
      fullName: user.fullName,
      email: user.email,
      username: user.username,
      name: user.fullName || user.username,
      role: user.role,
    };
  }),
});
