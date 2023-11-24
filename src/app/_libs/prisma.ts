import { PrismaClient } from "@prisma/client/edge";
import { withAccelerate } from "@prisma/extension-accelerate";

let prisma: PrismaClient;

if (process.env.NODE_ENV === "production") {
  prisma = new PrismaClient() //
    .$extends(withAccelerate()) as any;
} else {
  if (!(global as any).prisma) {
    (global as any).prisma = new PrismaClient() //
      .$extends(withAccelerate()) as any;
  }
  prisma = (global as any).prisma;
}

export default prisma;
