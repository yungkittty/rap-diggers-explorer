import type { PrismaClient } from "@prisma/client";

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
  options: { isImported: boolean } = { isImported: false },
): Promise<void> => {
  for (const spotifyArtistId of spotifyArtistIds) {
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
        userId,
        artistId,
        importedAt: options.isImported ? new Date() : null,
      },
      update: {},
    });
  }
};
