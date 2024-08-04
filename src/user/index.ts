import { Hono } from "hono";
import { PrismaClient } from "@prisma/client/edge";
import { withAccelerate } from "@prisma/extension-accelerate";
import bcrypt from "bcryptjs";
import { jwt } from "hono/jwt";
export const userRouter = new Hono<{
  Bindings: {
    DATABASE_URL: string;
    JWT_SECRET: string;
  };
}>();

userRouter.post("/signup", async (c) => {
  const prisma = new PrismaClient({
    datasourceUrl: c.env?.DATABASE_URL,
  }).$extends(withAccelerate());
  const { name, password } = await c.req.json();
  if (!name || !password) {
    c.status(400);
    return c.json({ message: "Missing name or password" });
  }
  const randomNumber = Math.floor(1000 + Math.random() * 9000);
  const hashedPassword = await bcrypt.hash(password, 10);
  const sanitizedName = name.replace(/\s+/g, "");
  let username = sanitizedName.toLowerCase() + randomNumber.toString();
  if (username.length > 12) {
    username = username.slice(0, 12);
  }
  const user = await prisma.user.create({
    data: {
      username,
      password: hashedPassword,
      name,
    },
  });
  if (!user) {
    c.status(400);
    return c.json({ message: "Failed to signup" });
  }
  const newUser = {
    name: user.name,
    id: user.id,
    username: user.username,
  };

  return c.json({ user: newUser });
});

userRouter.post("/login", async (c) => {
  const prisma = new PrismaClient({
    datasourceUrl: c.env?.DATABASE_URL,
  }).$extends(withAccelerate());
  const { username, password } = await c.req.json();
  if (!username || !password) {
    c.status(400);
    return c.json({ message: "Missing name or password" });
  }
  const user = await prisma.user.findFirst({
    where: {
      username,
    },
    select: {
      id: true,
      name: true,
      username: true,
      password: true,
      patners: {
        select: {
          name: true,
          isApproved: true,
        },
      },
    },
  });
  const isMetch = await bcrypt.compare(password, user?.password || " ");
  if (!isMetch) {
    c.status(401);
    return c.json({ message: "Invalid credentials" });
  }
  const newUser = {
    name: user?.name,
    id: user?.id,
    username: user?.username,
    partners: user?.patners,
  };
  return c.json(newUser);
});
