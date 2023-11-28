import prisma from "@/app/_libs/prisma";
import { upsertArtistStatus } from "@/app/_utils/artists";
import { withAuth } from "@/app/_utils/auth";
import { z } from "zod";

const InputSchema = z.object({
  artistId: z.string(),
  action: z.union([
    z.literal("dig-in"), //
    z.literal("dig-out"),
    z.literal("like"),
    z.literal("dislike"),
    z.literal("snooze"),
  ]),
});
type Input = z.infer<typeof InputSchema>;

export const PUT = withAuth(
  async (
    request, //
    response,
    userId,
    spotifyApi,
  ) => {
    const data = await request.json();
    if (!InputSchema.safeParse(data).success) {
      return Response.json(
        {}, //
        { status: 422 },
      );
    }

    const { artistId, action } = data as Input;
    const artistStatus = await prisma.artistStatus.findUnique({
      where: {
        userId_artistId: {
          userId,
          artistId,
        },
      },
      include: {
        artist: true,
      },
    });
    if (!artistStatus) {
      return Response.json(
        {}, //
        { status: 404 },
      );
    }

    const spotifyArtistId = artistStatus.artist.spotifyId;

    let spotifyArtistIds: string[];
    if (action === "dig-in" || action === "like") {
      try {
        const { artists } =
          await spotifyApi.artists.relatedArtists(spotifyArtistId);
        spotifyArtistIds = artists.map((artist) => artist.id);
      } catch (error) {
        console.log(error);
        return Response.json(
          {}, //
          { status: 500 },
        );
      }
    }

    await prisma.$transaction(async (tx) => {
      if (spotifyArtistIds.length > 0) {
        await upsertArtistStatus(
          tx, //
          userId,
          artistStatus.playlistId,
          spotifyArtistIds,
        );
      }

      await tx.artistStatus.update({
        data: {
          dugInAt: action === "dig-in" ? new Date() : null,
          dugOutAt: action === "dig-out" ? new Date() : null,
          likedAt: action === "like" ? new Date() : null,
          dislikedAt: action === "dislike" ? new Date() : null,
          snoozedAt: action === "snooze" ? new Date() : null,
        },
        where: {
          id: artistStatus.id,
        },
      });
    });

    return Response.json(
      {}, //
      { status: 200 },
    );
  },
);
