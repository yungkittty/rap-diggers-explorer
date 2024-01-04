import { ErrorCode } from "@/app/_constants/error-code";
import {
  INNGEST_MAX_RETRIES,
  INNGEST_MAX_RETRIES_AFTER,
} from "@/app/_constants/inngess";
import prisma from "@/app/_libs/prisma";
import { upsertArtistStatus } from "@/app/_utils/artist-status";
import { withAuthInngest } from "@/app/_utils/auth";
import { withRateInngest } from "@/app/_utils/rate";
import { getSpotifyArtistRelatedIds } from "@/app/_utils/spotify";
import { POST_PLAYLISTS_IMPORT_BATCH_SIZE } from "@/app/api/playlists/route";
import { RetryAfterError } from "inngest";
import { inngest } from "./client";

export const importRelated = inngest.createFunction(
  {
    id: "import-related",
    concurrency: {
      key: "event.data.user_id",
      limit: 1,
    },
    retries: INNGEST_MAX_RETRIES,
  },
  {
    event: "spotify.related.imported", //
  },
  async (params) => {
    const {
      step,
      attempt,
      event: {
        data: {
          user_id: userId, //
          spotify_artist_ids: spotifyArtistIds,
          delay_in_ms: delayInMs,
        },
      },
      logger,
    } = params;
    if (attempt === 0) await step.sleep("wait-for-delay", delayInMs);
    return withRateInngest<"spotify.related.imported">(
      { weight: POST_PLAYLISTS_IMPORT_BATCH_SIZE }, //
      async (params) => {
        return withAuthInngest<"spotify.related.imported">(
          userId, //
          async (_, spotifyApi) => {
            const spotifyRelatedIdsBatchs: string[][] = [];
            for (const spotifyArtistId of spotifyArtistIds) {
              try {
                const spotifyRelatedIds = await getSpotifyArtistRelatedIds(
                  spotifyApi, //
                  spotifyArtistId,
                );
                spotifyRelatedIdsBatchs.push(spotifyRelatedIds);
              } catch (error) {
                logger.error(error);
                throw new RetryAfterError(
                  ErrorCode.SPOTIFY_UNKNOWN, //
                  INNGEST_MAX_RETRIES_AFTER,
                  { cause: error },
                );
              }
            }

            await prisma.$transaction(async (tx) => {
              for (const spotifyRelatedIds of spotifyRelatedIdsBatchs) {
                const batchId = crypto.randomUUID();
                await upsertArtistStatus(
                  tx, //
                  userId,
                  spotifyRelatedIds,
                  { batchId, score: 0 }, // @TODO - importedAt: new Date()
                );
              }
            });
          },
        )(params);
      },
    )(params);
  },
);
