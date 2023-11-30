import { ErrorCode } from "@/app/_constants/error-code";
import prisma from "@/app/_libs/prisma";
import type { API_POSTPlaylistsInput } from "@/app/_types/api";
import { API_POSTPlaylistsInputSchema } from "@/app/_types/api";
import { upsertArtistStatus } from "@/app/_utils/artists";
import { withAuth } from "@/app/_utils/auth";
import type {
  Page,
  Playlist,
  PlaylistedTrack,
  SimplifiedTrack,
} from "@spotify/web-api-ts-sdk";

const SPOTIFY_LIMIT_MAX = 50;
const SPOTIFY_TOTAL_MAX = 5000;

export const POST = withAuth(
  async (
    request, //
    response,
    userId,
    spotifyApi,
  ) => {
    const data = await request.json();
    if (!API_POSTPlaylistsInputSchema.safeParse(data).success) {
      return Response.json(
        { error: ErrorCode.INPUT_INVALID }, //
        { status: 422 },
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

    const { spotifyPlaylistId } = data as API_POSTPlaylistsInput;
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

    if (spotifyPlaylist.tracks.total > SPOTIFY_TOTAL_MAX) {
      return Response.json(
        { error: ErrorCode.USER_FORBIDDEN_MAX_TRACKS },
        { status: 403 },
      );
    }

    let next = spotifyPlaylist.tracks.next;
    let offset = spotifyPlaylist.tracks.limit;
    const items = spotifyPlaylist.tracks.items;
    for (; next !== null; offset += SPOTIFY_LIMIT_MAX) {
      let spotifyTracks: Page<PlaylistedTrack> | null = null;
      try {
        spotifyTracks = await spotifyApi.playlists.getPlaylistItems(
          spotifyPlaylistId,
          undefined,
          undefined,
          SPOTIFY_LIMIT_MAX,
          offset,
        );
      } catch (error) {
        console.log(error);
        return Response.json(
          { error: ErrorCode.SPOTIFY_UNKNOWN }, //
          { status: 500 },
        );
      }
      items.push(...spotifyTracks.items);
      next = spotifyTracks.next;
    }

    const spotifyArtistIdsSet = new Set<string>([]);
    items.forEach((item) =>
      (item.track as SimplifiedTrack).artists.forEach(
        (artist) => spotifyArtistIdsSet.add(artist.id), //
      ),
    );
    const spotifyArtistIds = Array.from(spotifyArtistIdsSet);

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
        playlistId,
        spotifyArtistIds,
      );
    });

    return Response.json(
      {}, //
      { status: 200 },
    );
  },
);
