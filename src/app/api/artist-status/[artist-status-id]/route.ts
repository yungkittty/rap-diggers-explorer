import { ErrorCode } from "@/app/_constants/error-code";
import prisma from "@/app/_libs/prisma";
import {
  PUT_ArtistStatusInput,
  PUT_ArtistStatusInputSchema,
} from "@/app/_types/api";
import { upsertArtistStatus } from "@/app/_utils/artist-status";
import { withAuth } from "@/app/_utils/auth";
import { withRate } from "@/app/_utils/rate";

export const PUT = withRate(
  { weight: 1 },
  withAuth(
    async (
      request, //
      { params },
      userId,
      spotifyApi,
    ) => {
      const artistStatusId = params["artist-status-id"];
      if (artistStatusId == null || typeof artistStatusId !== "string") {
        return Response.json(
          { error: ErrorCode.INPUT_INVALID }, //
          { status: 400 },
        );
      }

      const data = await request.json();
      if (!PUT_ArtistStatusInputSchema.safeParse(data).success) {
        return Response.json(
          { error: ErrorCode.INPUT_INVALID }, //
          { status: 400 },
        );
      }

      const { action } = data as PUT_ArtistStatusInput;
      const artistStatus = await prisma.artistStatus.findUnique({
        select: {
          id: true,

          // filters = all
          dugInAt: true,
          dugOutAt: true,
          likedAt: true,
          dislikedAt: true,
          snoozedAt: true,

          artist: {
            select: {
              spotifyId: true,
            },
          },
        },
        where: {
          id: artistStatusId,
          userId,
        },
      });
      if (!artistStatus) {
        return Response.json(
          { error: ErrorCode.ARTIST_STATUS_NOT_FOUND },
          { status: 404 },
        );
      }
      if (
        artistStatus.dugInAt ||
        artistStatus.dugOutAt ||
        artistStatus.likedAt ||
        artistStatus.dislikedAt ||
        artistStatus.snoozedAt
      ) {
        return Response.json(
          { error: ErrorCode.USER_FORBIDDEN },
          { status: 403 },
        );
      }

      const spotifyArtistId = artistStatus.artist.spotifyId;

      let spotifyArtistIds: string[] = [];
      if (action === "dig-in" || action === "like") {
        try {
          const { artists: spotifyArtists } =
            await spotifyApi.artists.relatedArtists(spotifyArtistId);
          spotifyArtistIds = spotifyArtists.map(
            (spotifyArtist) => spotifyArtist.id,
          );
        } catch (error) {
          console.log(error);
          return Response.json(
            { error: ErrorCode.SPOTIFY_UNKNOWN }, //
            { status: 500 },
          );
        }
      }

      await prisma.$transaction(async (tx) => {
        await upsertArtistStatus(
          tx, //
          userId,
          spotifyArtistIds,
        );

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
  ),
);
