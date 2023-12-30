import { ErrorCode } from "@/app/_constants/error-code";
import prisma from "@/app/_libs/prisma";
import type { POST_PlaylistsInput } from "@/app/_types/api";
import { POST_PlaylistsInputSchema } from "@/app/_types/api";
import { upsertArtistStatus } from "@/app/_utils/artist-status";
import { withAuth } from "@/app/_utils/auth";
import { CustomError } from "@/app/_utils/errors";
import { withRate } from "@/app/_utils/rate";
import { getSpotifyPlaylistArtistIds } from "@/app/_utils/spotify";

export const POST = withRate(
  { weight: 20 },
  withAuth(
    async (
      request, //
      _,
      userId,
      spotifyApi,
    ) => {
      const data = await request.json();
      if (!POST_PlaylistsInputSchema.safeParse(data).success) {
        return Response.json(
          { error: ErrorCode.INPUT_INVALID }, //
          { status: 400 },
        );
      }

      const playlistStatus = await prisma.playlistStatus.findMany({
        select: {
          id: true,
        },
        where: {
          userId,
        },
      });
      if (playlistStatus.length) {
        return Response.json(
          { error: ErrorCode.USER_FORBIDDEN_MAX_PLAYLISTS }, //
          { status: 403 },
        );
      }

      const { spotifyPlaylistId } = data as POST_PlaylistsInput;
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

      await prisma.$transaction(async (tx) => {
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
          { importedAt: new Date() },
        );
      });

      return Response.json(
        {}, //
        { status: 200 },
      );
    },
  ),
);
