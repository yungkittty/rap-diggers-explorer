import { ErrorCode } from "@/app/_constants/error-code";
import prisma from "@/app/_libs/prisma";
import { upsertArtistStatus } from "@/app/_utils/artists";
import { withAuth } from "@/app/_utils/auth";
import { getSpotifyPlaylistArtistIds } from "@/app/_utils/spotify";

export const POST = withAuth(
  async (
    request, //
    _,
    userId,
    spotifyApi,
  ) => {
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

    if (spotifyArtistIds.length) {
      await prisma.$transaction(async (tx) => {
        await upsertArtistStatus(
          tx, //
          userId,
          spotifyArtistIds,
        );
      });
    }

    return Response.json(
      {}, //
      { status: 200 },
    );
  },
);
