import { ErrorCode } from "@/app/_constants/error-code";
import prisma from "@/app/_libs/prisma";
import { GET_ArtistStatusTracksOutputDataItem } from "@/app/_types/api";
import { withAuth } from "@/app/_utils/auth";
import type { SimplifiedAlbum, SimplifiedTrack } from "@spotify/web-api-ts-sdk";

const SPOTIFY_ALBUMS_LIMIT = 3;
const SPOTIFY_TRACKS_LIMIT = 8;
const SPOTIFY_MARKET = "FR" as const; // @TODO - ...

// @TODO - This should be removed?
// This makes sure returned data isn't cached!
// https://nextjs.org/docs/app/api-reference/file-conventions/route-segment-config#options
export const dynamic = "force-dynamic";
export const GET = withAuth(
  async (
    request, //
    { params },
    userId,
    spotifyApi,
  ) => {
    const artistStatusId = params["artist-status-id"];
    if (artistStatusId == null || typeof artistStatusId !== "string") {
      return Response.json(
        { error: ErrorCode.INPUT_INVALID }, //
        { status: 400 },
      );
    }

    const artistStatus = await prisma.artistStatus.findUnique({
      select: {
        id: true,
        artist: {
          select: {
            spotifyId: true,
          },
        },
      },
      where: {
        id: artistStatusId,
        userId,
      },
    });
    if (!artistStatus) {
      return Response.json(
        { error: ErrorCode.ARTIST_STATUS_NOT_FOUND },
        { status: 404 },
      );
    }

    const spotifyArtistId = artistStatus.artist.spotifyId;

    let spotifyAlbums: SimplifiedAlbum[] = [];
    try {
      const { items: spotifyAlbums_ } = await spotifyApi.artists.albums(
        spotifyArtistId,
        "single,album",
        SPOTIFY_MARKET,
        SPOTIFY_ALBUMS_LIMIT,
      );
      spotifyAlbums = spotifyAlbums_;
    } catch (error) {
      console.log(error);
      return Response.json(
        { error: ErrorCode.SPOTIFY_UNKNOWN }, //
        { status: 500 },
      );
    }
    spotifyAlbums.sort((lSpotifyAlbum, rSpotifyAlbum) => {
      if (lSpotifyAlbum.release_date > rSpotifyAlbum.release_date) return -1;
      if (rSpotifyAlbum.release_date > lSpotifyAlbum.release_date) return 1;
      return 0;
    });

    let spotifyTracksPerAlbum: SimplifiedTrack[][] = [];
    try {
      spotifyTracksPerAlbum = await Promise.all(
        spotifyAlbums.map(async (spotifyAlbum) => {
          const { items: spotifyTracks } = await spotifyApi.albums.tracks(
            spotifyAlbum.id,
            SPOTIFY_MARKET,
            SPOTIFY_TRACKS_LIMIT,
          );
          return spotifyTracks;
        }),
      );
    } catch (error) {
      console.log(error);
      return Response.json(
        { error: ErrorCode.SPOTIFY_UNKNOWN }, //
        { status: 500 },
      );
    }

    const artistStatusTracks: GET_ArtistStatusTracksOutputDataItem[] =
      spotifyAlbums.reduce(
        (artistStatusTracks, spotifyAlbum, spotifyAlbumIndex) => {
          const spotifyTracks = spotifyTracksPerAlbum[spotifyAlbumIndex];
          return [
            ...artistStatusTracks, //
            ...spotifyTracks
              .filter(
                (spotifyTrack) =>
                  spotifyTrack.is_playable && //
                  spotifyTrack.preview_url != null,
              )
              .map((spotifyTrack) => ({
                spotifyUrl: spotifyTrack.preview_url!,
                spotifyImageUrl: spotifyAlbum.images[1]?.url, // = 64px
                spotifyName: spotifyTrack.name,
                spotifyArtistNames: spotifyTrack.artists.map((spotifyArtist) => spotifyArtist.name), // prettier-ignore
                spotifyReleaseDate: spotifyAlbum.release_date,
              })),
          ];
        },
        [] as GET_ArtistStatusTracksOutputDataItem[],
      );

    return Response.json(
      { data: artistStatusTracks }, //
      { status: 200 },
    );
  },
);
