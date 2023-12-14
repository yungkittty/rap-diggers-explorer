import prisma from "@/app/_libs/prisma";
import { withAuth } from "@/app/_utils/auth";

export const DELETE = withAuth(
  async (
    request, //
    _,
    userId,
  ) => {
    await prisma.user.delete({
      where: {
        id: userId,
      },
    });
    return Response.json(
      {}, //
      { status: 200 },
    );
  },
);
