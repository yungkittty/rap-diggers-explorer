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
      | "dugInAt"
      | "importedAt"
    >
  > = {},
): Promise<void> => {
  if (!spotifyArtistIds.length) {
    return;
  }

  // @TODO - This isn't safe!
  await tx.$executeRawUnsafe(/* SQL */ `
    INSERT INTO "Artist" (
      id,
      "spotifyId",
      "createdAt",
      "updatedAt"
    )
    VALUES ${spotifyArtistIds
      .map((spotifyArtistId) => {
        // This makes sure ids have the same formating as prisma!
        return `(
          '${createId()}',
          '${spotifyArtistId}',
          NOW(),
          NOW()
        )`;
      })
      .join(",")}
    ON CONFLICT ("spotifyId")
    DO NOTHING;
  `);

  // @TODO - This isn't safe!
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
    SELECT
      id,
      NOW(),
      NOW(),
      '${userId}',
      id,
      ${artistStatus.parentId != null ? `'${artistStatus.parentId}'` : "NULL"},
      ${artistStatus.batchId != null ? `'${artistStatus.batchId}'` : "NULL"},
      ${artistStatus.score != null ? `${artistStatus.score}` : "NULL"},
      -- @TODO - This could leads to issue(s)!
      ${artistStatus.dugInAt != null ? `NOW()` : "NULL"},
      ${artistStatus.importedAt != null ? `NOW()` : "NULL"}
    FROM "Artist"
    WHERE "Artist"."spotifyId" IN (${spotifyArtistIds
      .map((spotifyArtistId) => {
        return `'${spotifyArtistId}'`;
      })
      .join(",")})
    ON CONFLICT ("userId", "artistId")
    DO NOTHING;
  `);
};
