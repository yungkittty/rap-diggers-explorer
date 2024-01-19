import { ErrorCode } from "@/app/_constants/error-code";
import prisma from "@/app/_libs/prisma";
import { upsertArtistStatus } from "@/app/_utils/artist-status";
import { withAuth } from "@/app/_utils/auth";
import { CustomError } from "@/app/_utils/errors";
import { isImportable } from "@/app/_utils/playlists";
import { withRate } from "@/app/_utils/rate";
import { getSpotifyPlaylistArtistIds } from "@/app/_utils/spotify";
import { createId } from "@paralleldrive/cuid2";
import { preloadRelatedIds } from "../route";

export const POST = withRate(
  { weight: 20 },
  withAuth(
    async (
      request, //
      _,
      userId,
      spotifyApi,
    ) => {
      const isImportable_ = await isImportable(userId);
      if (!isImportable_) {
        return Response.json(
          { error: ErrorCode.USER_FORBIDDEN_MAX_IMPORTS }, //
          { status: 403 },
        );
      }

      const playlistStatus = await prisma.playlistStatus.findMany({
        select: {
          playlist: {
            select: {
              spotifyId: true,
            },
          },
        },
        where: {
          userId,
        },
      });
      const spotifyPlaylistIds = playlistStatus.map(
        (playlistStatus) => playlistStatus.playlist.spotifyId,
      );

      let spotifyArtistIds: string[] = [];
      for (const spotifyPlaylistId of spotifyPlaylistIds) {
        try {
          const spotifyArtistIds_ = await getSpotifyPlaylistArtistIds(
            spotifyApi,
            spotifyPlaylistId,
          );
          spotifyArtistIds.push(...spotifyArtistIds_);
        } catch (error) {
          console.log(error);
          if (error instanceof CustomError) {
            switch (error.code) {
              case ErrorCode.USER_FORBIDDEN_MAX_TRACKS: {
                return Response.json(
                  { error: ErrorCode.USER_FORBIDDEN_MAX_TRACKS }, //
                  { status: 403 },
                );
              }
            }
          }
          return Response.json(
            { error: ErrorCode.SPOTIFY_UNKNOWN }, //
            { status: 500 },
          );
        }
      }
      spotifyArtistIds = [...new Set(spotifyArtistIds)];

      let spotifyRelatedIdsBatchs: string[][] = [];
      try {
        spotifyRelatedIdsBatchs = await preloadRelatedIds(
          userId, //
          spotifyApi,
          spotifyArtistIds,
        );
      } catch (error) {
        console.log(error);
        return Response.json(
          { error: ErrorCode.SPOTIFY_UNKNOWN }, //
          { status: 500 },
        );
      }

      await prisma.$transaction(
        async (tx) => {
          await upsertArtistStatus(
            tx, //
            userId,
            spotifyArtistIds,
            { isImported: true, isDugIn: true },
          );
          await Promise.all(
            spotifyRelatedIdsBatchs.map(async (spotifyRelatedIds) => {
              const batchId = createId();
              await upsertArtistStatus(
                tx, //
                userId,
                spotifyRelatedIds,
                { batchId, score: 0 },
              );
            }),
          );
        },
        { timeout: 10_000 },
      );

      return Response.json(
        {}, //
        { status: 200 },
      );
    },
  ),
);
