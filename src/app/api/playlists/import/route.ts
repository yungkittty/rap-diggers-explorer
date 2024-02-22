import { ErrorCode } from "@/app/_constants/error-code";
import { USER_MAX_PLAYLISTS } from "@/app/_constants/user";
import prisma from "@/app/_libs/prisma";
import { upsertArtistStatus } from "@/app/_utils/artist-status";
import { withAuth } from "@/app/_utils/auth";
import { CustomError } from "@/app/_utils/errors";
import { isImportable } from "@/app/_utils/playlists";
import { withRate } from "@/app/_utils/rate";
import { getSpotifyPlaylistArtistIds } from "@/app/_utils/spotify";
import { createId } from "@paralleldrive/cuid2";
import {
  POST_PLAYLISTS_IMPORT_BATCH_SIZE,
  loadRelatedIds,
} from "../create-and-import/route";

export const POST = withRate(
  { weight: USER_MAX_PLAYLISTS * 10 + POST_PLAYLISTS_IMPORT_BATCH_SIZE },
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
        orderBy: {
          subscribedAt: { sort: "asc", nulls: "first" },
        },
      });
      if (playlistStatus.length > USER_MAX_PLAYLISTS) {
        return Response.json(
          { error: ErrorCode.USER_FORBIDDEN_MAX_PLAYLISTS }, //
          { status: 403 },
        );
      }

      const spotifyPlaylistIds = playlistStatus.map(
        (playlistStatus) => playlistStatus.playlist.spotifyId,
      );

      let spotifyArtistIdsBatchs: string[][] = [];
      for (const spotifyPlaylistId of spotifyPlaylistIds) {
        try {
          const spotifyArtistIds = await getSpotifyPlaylistArtistIds(
            spotifyApi,
            spotifyPlaylistId,
          );
          spotifyArtistIdsBatchs.push(spotifyArtistIds);
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

      const [
        spotifyArtistIdsBatch = [], //
        ...othersSpotifyArtistIdsBatchs
      ] = spotifyArtistIdsBatchs;

      const spotifyArtistIds = [
        ...new Set(spotifyArtistIdsBatch), //
      ];
      const spotifyArtistIdsOthers = [
        ...new Set(othersSpotifyArtistIdsBatchs.flat()),
      ];

      let spotifyRelatedIdsBatchs: string[][] = [];
      let lazyRelatedIds: () => Promise<void> = async () => {};
      try {
        const [spotifyRelatedIdsBatchs_, lazyRelatedIds_] =
          await loadRelatedIds(
            userId, //
            spotifyApi,
            spotifyArtistIds,
          );
        spotifyRelatedIdsBatchs = spotifyRelatedIdsBatchs_;
        lazyRelatedIds = lazyRelatedIds_;
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
          await upsertArtistStatus(
            tx, //
            userId,
            spotifyArtistIdsOthers,
            { isImported: true }, // score: 0
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

      // This loads lazy only once all data is saved!
      await lazyRelatedIds();
      return Response.json(
        {}, //
        { status: 200 },
      );
    },
  ),
);
