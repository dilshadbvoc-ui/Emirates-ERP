import { authRouter } from "./auth-router";
import { localAuthRouter } from "./localAuth";
import { applicationRouter } from "./application";
import { contactRouter } from "./contact";
import { messageRouter } from "./message";
import { adminRouter } from "./admin";
import { userRouter } from "./user";
import { aiRouter } from "./ai";
import { createRouter, publicQuery } from "./middleware";

export const appRouter = createRouter({
  ping: publicQuery.query(() => ({ ok: true, ts: Date.now() })),
  auth: authRouter,
  localAuth: localAuthRouter,
  application: applicationRouter,
  contact: contactRouter,
  message: messageRouter,
  admin: adminRouter,
  user: userRouter,
  ai: aiRouter,
});

export type AppRouter = typeof appRouter;
