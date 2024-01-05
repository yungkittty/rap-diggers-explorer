import { ErrorCode } from "@/app/_constants/error-code";
import prisma from "@/app/_libs/prisma";
import { withAuth } from "@/app/_utils/auth";
import { withRate } from "@/app/_utils/rate";
import { Artist } from "@spotify/web-api-ts-sdk";

const getFileName = () => {
  const now = new Date();
  const years = now.getFullYear();
  const months = (now.getMonth() + 1).toString().padStart(2, "0");
  const days = now.getDate().toString().padStart(2, "0");
  return `explorer_${years}_${months}_${days}`;
};

export const GET = withRate(
  { weight: 1 },
  withAuth(
    async (
      request, //
      _,
      userId,
      spotifyApi,
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

      const spotifyArtistIds = artistStatus.map(
        (artistStatus) => artistStatus.artist.spotifyId,
      );
      let spotifyArtists: Artist[] = [];
      if (spotifyArtistIds.length) {
        try {
          spotifyArtists = await spotifyApi.artists.get(spotifyArtistIds);
        } catch (error) {
          console.log(error);
          return Response.json(
            { error: ErrorCode.SPOTIFY_UNKNOWN }, //
            { status: 500 },
          );
        }
      }

      const fileName = getFileName();
      const fileData = spotifyArtists
        .map((spotifyArtist) => {
          return `${spotifyArtist.name} • ${spotifyArtist.external_urls["spotify"]}`;
        })
        .join("\n");
      // https://vercel.com/docs/functions/serverless-functions/runtimes#request-body-size
      if (fileData.length > 4_500_000) {
        throw new Error(""); // @TODO - ...
      }

      const artistStatusIds = artistStatus.map(
        (artistStatus) => artistStatus.id,
      );
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
  ),
);
