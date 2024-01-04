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
  artistStatus: Partial<ArtistStatus> = {},
): Promise<void[]> => {
  return Promise.all(
    spotifyArtistIds.map(async (spotifyArtistId) => {
      const { id: artistId } = await tx.artist.upsert({
        where: {
          spotifyId: spotifyArtistId,
        },
        create: {
          spotifyId: spotifyArtistId,
        },
        update: {},
      });

      await tx.artistStatus.upsert({
        where: {
          userId_artistId: {
            userId,
            artistId,
          },
        },
        create: {
          ...artistStatus,
          userId,
          artistId,
        },
        update: {},
      });
    }),
  );
};
