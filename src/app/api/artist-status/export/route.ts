import prisma from "@/app/_libs/prisma";
import { withAuth } from "@/app/_utils/auth";

const getFileName = () => {
  const now = new Date();
  const years = now.getFullYear();
  const months = (now.getMonth() + 1).toString().padStart(2, "0");
  const days = now.getDate().toString().padStart(2, "0");
  return `explorer_${years}_${months}_${days}`;
};

export const GET = withAuth(
  async (
    request, //
    _,
    userId,
  ) => {
    const artistStatus = await prisma.artistStatus.findMany({
      select: {
        id: true,
        artist: {
          select: {
            spotifyId: true,
          },
        },
      },
      where: {
        userId,
        likedAt: { not: null },
        exportedAt: null,
      },
    });
    const artistStatusIds = artistStatus.map((artistStatus) => artistStatus.id);

    const fileName = getFileName();
    const fileData = artistStatus
      .map(
        (artistStatus) =>
          `https://open.spotify.com/artist/${artistStatus.artist.spotifyId}`,
      )
      .join("\n");
    // https://vercel.com/docs/functions/serverless-functions/runtimes#request-body-size
    if (fileData.length > 4_500_000) {
      throw new Error(""); // @TODO - ...
    }

    if (artistStatusIds.length) {
      await prisma.artistStatus.updateMany({
        data: {
          exportedAt: new Date(),
        },
        where: {
          id: { in: artistStatusIds },
        },
      });
    }

    const headers = new Headers({
      "Content-Type": "text/plain",
      "Content-Disposition": `attachment; filename="${fileName}.txt"`,
    });
    return new Response(
      fileData, //
      { status: 200, headers },
    );
  },
);
