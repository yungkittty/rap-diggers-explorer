import { createId } from "@paralleldrive/cuid2";
import type { ArtistStatus, PrismaClient } from "@prisma/client";

export const upsertArtistStatus = async (
  tx: Omit<
    PrismaClient,
    | "$connect" //
    | "$disconnect"
    | "$on"
    | "$transaction"
    | "$use"
    | "$extends"
  >,
  userId: string,
  spotifyArtistIds: string[],
  artistStatus: Partial<
    Pick<
      ArtistStatus,
      | "parentId" //
      | "batchId"
      | "score"
    >
  > & {
    isDugIn?: boolean;
    isImported?: boolean;
  } = {},
): Promise<void> => {
  if (!spotifyArtistIds.length) {
    return;
  }

  await tx.$executeRawUnsafe(/* SQL */ `
    INSERT INTO "Artist" (
      id,
      "spotifyId",
      "createdAt",
      "updatedAt"
    )
    VALUES ${spotifyArtistIds
      .map((spotifyArtistId) => {
        const artistId = createId();
        const artistSpotifyId = spotifyArtistId;
        return `(
          '${artistId}',
          '${artistSpotifyId}',
          NOW(),
          NOW()
        )`;
      })
      .join(",")}
    ON CONFLICT ("spotifyId")
    DO NOTHING;
  `);

  const artists = await tx.artist.findMany({
    select: {
      id: true,
    },
    where: {
      spotifyId: { in: spotifyArtistIds },
    },
  });

  await tx.$executeRawUnsafe(/* SQL */ `
    INSERT INTO "ArtistStatus" (
      id,
      -- this is required
      "createdAt",
      "updatedAt",
      "userId",
      "artistId",
      -- this isn't required
      "parentId",
      "batchId",
      "score",
      "dugInAt",
      "importedAt"
    )
    VALUES ${artists
      .map((artist) => {
        const artistStatusId = createId();
        const artistStatusUserId = userId;
        const artistStatusArtistId = artist.id;
        const {
          parentId, //
          batchId,
          score,
          isDugIn,
          isImported,
        } = artistStatus;
        return `(
          '${artistStatusId}',
          -- this is required
          NOW(),
          NOW(),
          '${artistStatusUserId}',
          '${artistStatusArtistId}',
          -- this isn't required
          ${parentId != null ? `'${parentId}'` : "NULL"},
          ${batchId != null ? `'${batchId}'` : "NULL"},
          ${score != null ? score : "NULL"},
          ${isDugIn ? `NOW()` : "NULL"},
          ${isImported ? `NOW()` : "NULL"}
        )`;
      })
      .join(",")}
    ON CONFLICT ("userId", "artistId")
    DO NOTHING;
  `);
};
