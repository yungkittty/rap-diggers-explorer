import { ErrorCode } from "@/app/_constants/error-code";
import prisma from "@/app/_libs/prisma";
import { upsertArtistStatus } from "@/app/_utils/artists";
import { withAuth } from "@/app/_utils/auth";
import type {
  Page,
  Playlist,
  PlaylistedTrack,
  SimplifiedTrack,
} from "@spotify/web-api-ts-sdk";
import { z } from "zod";

const SPOTIFY_LIMIT_MAX = 50;
const SPOTIFY_TOTAL_MAX = 5000;

const InputSchema = z.object({
  playlistId: z.string(),
});
type Input = z.infer<typeof InputSchema>;

export const POST = withAuth(
  async (
    request, //
    response,
    userId,
    spotifyApi,
  ) => {
    const data = await request.json();
    if (!InputSchema.safeParse(data).success) {
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

    const { playlistId } = data as Input;
    let playlist: Playlist | null = null;
    try {
      playlist = await spotifyApi.playlists.getPlaylist(playlistId);
    } catch (error) {
      return Response.json(
        { error: ErrorCode.SPOTIFY_UNKNOWN }, //
        { status: 500 },
      );
    }

    if (playlist.tracks.total > SPOTIFY_TOTAL_MAX) {
      return Response.json(
        { error: ErrorCode.USER_FORBIDDEN_MAX_TRACKS },
        { status: 403 },
      );
    }

    const spotifyPlaylistId = playlist.id;

    let next = playlist.tracks.next;
    let offset = playlist.tracks.limit;
    const items = playlist.tracks.items;
    for (; next !== null; offset += SPOTIFY_LIMIT_MAX) {
      let tracks: Page<PlaylistedTrack> | null = null;
      try {
        tracks = await spotifyApi.playlists.getPlaylistItems(
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
      items.push(...tracks.items);
      next = tracks.next;
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
