import { ErrorCode } from "@/app/_constants/error-code";
import prisma from "@/app/_libs/prisma";
import { upsertArtistStatus } from "@/app/_utils/artist-status";
import { withAuth } from "@/app/_utils/auth";
import { isImportable } from "@/app/_utils/playlists";
import { withRate } from "@/app/_utils/rate";
import { getSpotifyPlaylistArtistIds } from "@/app/_utils/spotify";

export const POST = withRate(
  { weight: 25 },
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
          return Response.json(
            { error: ErrorCode.SPOTIFY_UNKNOWN }, //
            { status: 500 },
          );
        }
      }

      const spotifyArtistIdsSet = new Set<string>([]);
      for (const spotifyArtistId of spotifyArtistIds) {
        spotifyArtistIdsSet.add(spotifyArtistId);
      }
      spotifyArtistIds = Array.from(spotifyArtistIdsSet);

      await prisma.$transaction(async (tx) => {
        await upsertArtistStatus(
          tx, //
          userId,
          spotifyArtistIds,
          { isImported: true },
        );
      });

      return Response.json(
        {}, //
        { status: 200 },
      );
    },
  ),
);
