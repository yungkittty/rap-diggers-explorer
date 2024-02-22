import { ErrorCode } from "@/app/_constants/error-code";
import { SPOTIFY_PLAYLIST_MAX_TRACKS } from "@/app/_constants/spotify";
import { USER_MAX_PLAYLISTS } from "@/app/_constants/user";
import prisma from "@/app/_libs/prisma";
import {
  GET_PlaylistStatusOutputDataItem,
  POST_PlaylistStatusInput,
  POST_PlaylistStatusInputSchema,
} from "@/app/_types/api";
import { withAuth } from "@/app/_utils/auth";
import { withRate } from "@/app/_utils/rate";
import { Playlist } from "@spotify/web-api-ts-sdk";

export const POST = withRate(
  { weight: 1 },
  withAuth(
    async (
      request, //
      { params },
      userId,
      spotifyApi,
    ) => {
      const data = await request.json();
      if (!POST_PlaylistStatusInputSchema.safeParse(data).success) {
        return Response.json(
          { error: ErrorCode.INPUT_INVALID }, //
          { status: 400 },
        );
      }

      const playlistStatus = await prisma.playlistStatus.findMany({
        select: { id: true },
        where: { userId },
      });
      if (playlistStatus.length >= USER_MAX_PLAYLISTS) {
        return Response.json(
          { error: ErrorCode.USER_FORBIDDEN_MAX_PLAYLISTS }, //
          { status: 403 },
        );
      }

      const { spotifyPlaylistId } = data as POST_PlaylistStatusInput;
      let spotifyPlaylist: Playlist | null = null;
      try {
        spotifyPlaylist =
          await spotifyApi.playlists.getPlaylist(spotifyPlaylistId);
      } catch (error) {
        return Response.json(
          { error: ErrorCode.SPOTIFY_UNKNOWN }, //
          { status: 500 },
        );
      }

      if (spotifyPlaylist.tracks.total > SPOTIFY_PLAYLIST_MAX_TRACKS) {
        return Response.json(
          { error: ErrorCode.USER_FORBIDDEN_MAX_TRACKS }, //
          { status: 403 },
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
            subscribedAt: new Date(),
          },
          update: {},
        });
      });

      return Response.json(
        {}, //
        { status: 200 },
      );
    },
  ),
);

export const GET = withRate(
  { weight: 5 },
  withAuth(
    async (
      request, //
      { params },
      userId,
      spotifyApi,
    ) => {
      const playlistStatus = await prisma.playlistStatus.findMany({
        select: {
          id: true,
          playlist: {
            select: {
              spotifyId: true,
            },
          },
        },
        where: {
          userId,
        },
        orderBy: {
          subscribedAt: { sort: "desc", nulls: "first" },
        },
      });

      let spotifyPlaylists: Playlist[] = [];
      try {
        spotifyPlaylists = await Promise.all(
          playlistStatus.map(async (playlistStatus_) => {
            const spotifyPlaylistId = playlistStatus_.playlist.spotifyId;
            return spotifyApi.playlists.getPlaylist(spotifyPlaylistId);
          }),
        );
      } catch (error) {
        return Response.json(
          { error: ErrorCode.SPOTIFY_UNKNOWN }, //
          { status: 500 },
        );
      }

      const playlistStatus_: GET_PlaylistStatusOutputDataItem[] =
        playlistStatus.map((playlistStatus, playlistStatusIndex) => {
          const spotifyPlaylist = spotifyPlaylists[playlistStatusIndex];
          return {
            id: playlistStatus.id,
            playlist: {
              spotifyId: spotifyPlaylist.id,
              spotifyName: spotifyPlaylist.name,
              spotifyOwnerId: spotifyPlaylist.owner.id,
              spotifyOwnerName: spotifyPlaylist.owner.display_name,
              spotifyTracksTotal: spotifyPlaylist.tracks.total,
              spotifyUrl: spotifyPlaylist.external_urls["spotify"],
              spotifyImageUrl: spotifyPlaylist.images[0]?.url,
            },
          };
        });

      return Response.json(
        { data: playlistStatus_ }, //
        { status: 200 },
      );
    },
  ),
);
