import { Hono, HonoRequest } from "hono";
import cors from "hono/cors";

import { PrismaClient } from "@prisma/client/edge";
import { withAccelerate } from "@prisma/extension-accelerate";
import { userRouter } from "./user";
import { requestRouter } from "./requst";

export const app = new Hono<{
  Bindings: {
    DATABASE_URL: string;
    JWT_SECRET: string;
  };
}>();
app.get("/", async (c) => {
  return c.json("Welcome to DateRequst");
});
app.route("/api/user", userRouter);
app.route("/api/request", requestRouter);

export default app;
