import { ErrorCode } from "@/app/_constants/error-code";
import prisma from "@/app/_libs/prisma";
import type { POST_PlaylistsCreateAndImportInput } from "@/app/_types/api";
import { POST_PlaylistsCreateAndImportInputSchema } from "@/app/_types/api";
import { getBatchs } from "@/app/_utils/arrays";
import { upsertArtistStatus } from "@/app/_utils/artist-status";
import { withAuth } from "@/app/_utils/auth";
import { CustomError } from "@/app/_utils/errors";
import { withRate } from "@/app/_utils/rate";
import {
  getSpotifyArtistRelatedIds,
  getSpotifyPlaylistArtistIds,
} from "@/app/_utils/spotify";
import { inngest } from "@/inngest/client";
import { createId } from "@paralleldrive/cuid2";
import { SpotifyApi } from "@spotify/web-api-ts-sdk";

export const POST_PLAYLISTS_IMPORT_BATCH_SIZE = 5;
export const POST_PLAYLISTS_IMPORT_BATCH_DELAY_IN_MS = 60_000; // 60 second(s)
export const loadRelatedIds = async (
  userId: string,
  spotifyApi: SpotifyApi,
  spotifyArtistIds: string[],
): Promise<[string[][], () => Promise<void>]> => {
  const [
    spotifyArtistIdsBatch = [], //
    ...othersSpotifyArtistIdsBatchs
  ] = getBatchs(
    spotifyArtistIds, //
    POST_PLAYLISTS_IMPORT_BATCH_SIZE,
  );

  let spotifyRelatedIdsBatchs: string[][] = [];
  for (const spotifyArtistId of spotifyArtistIdsBatch) {
    try {
      const spotifyRelatedIds = await getSpotifyArtistRelatedIds(
        spotifyApi, //
        spotifyArtistId,
      );
      spotifyRelatedIdsBatchs.push(spotifyRelatedIds);
    } catch (error) {
      console.log(error);
      throw error;
    }
  }
  spotifyRelatedIdsBatchs = spotifyRelatedIdsBatchs.filter(
    (spotifyRelatedIdsBatch) => Boolean(spotifyRelatedIdsBatch.length), //
  );

  const lazyRelatedIds = async () => {
    if (!othersSpotifyArtistIdsBatchs.length) {
      return;
    }
    await inngest.send(
      othersSpotifyArtistIdsBatchs.map(
        (spotifyArtistIds, spotifyArtistIdsIndex) => ({
          name: "spotify.related.loaded",
          data: {
            user_id: userId, //
            spotify_artist_ids: spotifyArtistIds,
            delay_in_ms: POST_PLAYLISTS_IMPORT_BATCH_DELAY_IN_MS * spotifyArtistIdsIndex, // prettier-ignore
          },
        }),
      ),
    );
  };

  return [spotifyRelatedIdsBatchs, lazyRelatedIds];
};

export const POST = withRate(
  { weight: 10 + POST_PLAYLISTS_IMPORT_BATCH_SIZE },
  withAuth(
    async (
      request, //
      _,
      userId,
      spotifyApi,
    ) => {
      const data = await request.json();
      if (!POST_PlaylistsCreateAndImportInputSchema.safeParse(data).success) {
        return Response.json(
          { error: ErrorCode.INPUT_INVALID }, //
          { status: 400 },
        );
      }

      const playlistStatus = await prisma.playlistStatus.findMany({
        select: { id: true },
        where: { userId },
      });
      if (playlistStatus.length) {
        return Response.json(
          { error: ErrorCode.USER_FORBIDDEN_MAX_PLAYLISTS }, //
          { status: 403 },
        );
      }

      const { spotifyPlaylistId } = data as POST_PlaylistsCreateAndImportInput;
      let spotifyArtistIds: string[] = [];
      try {
        spotifyArtistIds = await getSpotifyPlaylistArtistIds(
          spotifyApi,
          spotifyPlaylistId,
        );
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
          const { id: playlistId } = await tx.playlist.upsert({
            where: {
              spotifyId: spotifyPlaylistId,
            },
            create: {
              spotifyId: spotifyPlaylistId,
            },
            update: {},
          });

          await tx.playlistStatus.upsert({
            where: {
              userId_playlistId: {
                userId,
                playlistId,
              },
            },
            create: {
              userId,
              playlistId,
            },
            update: {},
          });

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

      // This loads lazy only once all data is saved!
      await lazyRelatedIds();
      return Response.json(
        {}, //
        { status: 200 },
      );
    },
  ),
);
