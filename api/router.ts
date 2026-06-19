import { authRouter } from "./auth-router.js";
import { localAuthRouter } from "./localAuth.js";
import { applicationRouter } from "./application.js";
import { contactRouter } from "./contact.js";
import { messageRouter } from "./message.js";
import { adminRouter } from "./admin.js";
import { userRouter } from "./user.js";
import { aiRouter } from "./ai.js";
import { createRouter, publicQuery } from "./middleware.js";

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
