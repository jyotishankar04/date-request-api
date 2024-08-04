import { PrismaClient } from "@prisma/client/edge";
import { withAccelerate } from "@prisma/extension-accelerate";
import { Hono } from "hono";
export const requestRouter = new Hono<{
  Bindings: {
    DATABASE_URL: string;
    JWT_SECRET: string;
  };
}>();

requestRouter.post("/:id", async (c) => {
  const { id } = c.req.param();
  const { name, response } = await c.req.json();
  if (!name || !response) {
    c.status(400);
    return c.json({ message: "Missing name or response" });
  }
  const prisma = new PrismaClient({
    datasourceUrl: c.env?.DATABASE_URL,
  }).$extends(withAccelerate());
  const request = await prisma.patner.create({
    data: {
      userId: id,
      isApproved: response,
      name: name,
    },
  });
  if (!request) {
    c.status(400);
    return c.json({ message: "Failed to create request" });
  }
  return c.json(request);
});
