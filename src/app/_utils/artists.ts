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
  playlistId: string,
  spotifyIds: string[],
): Promise<void> => {
  for (const spotifyId of spotifyIds) {
    const { id: artistId } = await tx.artist.upsert({
      where: {
        spotifyId,
      },
      create: {
        spotifyId,
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
        playlistId,
      },
      update: {},
    });
  }
};
