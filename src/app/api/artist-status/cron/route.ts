import prisma from "@/app/_libs/prisma";
import { NextRequest } from "next/server";

const SNOOZE_DURATION = 6; // months
const DISLIKE_DURATION = 12; // months
const DIG_OUT_DURATION = 12; // months

export const GET = async (request: NextRequest) => {
  const authorization = request.headers.get("Authorization");
  if (authorization !== `Bearer ${process.env.CRON_SECRET}`) {
    return Response.json(
      { error: null }, //
      { status: 401 },
    );
  }

  const snoozeDate = new Date();
  snoozeDate.setMonth(snoozeDate.getMonth() - SNOOZE_DURATION);
  const dislikeDate = new Date();
  dislikeDate.setMonth(dislikeDate.getMonth() - DISLIKE_DURATION);
  const digOutDate = new Date();
  digOutDate.setMonth(digOutDate.getMonth() - DIG_OUT_DURATION);

  await prisma.artistStatus.updateMany({
    data: { snoozedAt: null, dislikedAt: null, dugOutAt: null },
    where: {
      OR: [
        { snoozedAt: { lte: snoozeDate } },
        { dislikedAt: { lte: dislikeDate } },
        { dugOutAt: { lte: digOutDate } },
      ],
    },
  });

  return Response.json(
    {}, //
    { status: 200 },
  );
};
