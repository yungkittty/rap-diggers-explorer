import { ErrorCode } from "@/app/_constants/error-code";
import prisma from "@/app/_libs/prisma";
import { GET_ArtistStatusOuputDataItem } from "@/app/_types/api";
import { withAuth } from "@/app/_utils/auth";
import { Artist, Image } from "@spotify/web-api-ts-sdk";

const SPOTIFY_ALBUMS_LIMIT_MAX = 5;
const SPOTIFY_TRACKS_LIMIT_MAX = 50;

const GET_ARTIST_STATUS_DEFAULT_OFFSET = 0;
const GET_ARTIST_STATUS_DEFAULT_LIMIT = 10;

// This makes sure returned data isn't cached!
// https://nextjs.org/docs/app/api-reference/file-conventions/route-segment-config#options
export const dynamic = "force-dynamic";
export const GET = withAuth(
  async (
    request, //
    _,
    userId,
    spotifyApi,
  ) => {
    const searchParams = request.nextUrl.searchParams;
    const offset = Number(searchParams.get("offset")) || GET_ARTIST_STATUS_DEFAULT_OFFSET; // prettier-ignore
    const limit = Number(searchParams.get("limit")) || GET_ARTIST_STATUS_DEFAULT_LIMIT; // prettier-ignore
    // const filters = "all";

    const artistStatus = await prisma.artistStatus.findMany({
      select: {
        id: true,
        artist: {
          select: {
            spotifyId: true,
          },
        },
      },
      where: {
        userId,

        // filters = all
        dugInAt: null,
        dugOutAt: null,
        likedAt: null,
        dislikedAt: null,
        snoozedAt: null,
      },
      orderBy: [
        { createdAt: "asc" }, //
        { artist: { spotifyId: "asc" } },
      ],
      skip: offset,
      take: limit,
    });
    if (!artistStatus.length) {
      return Response.json(
        { data: [] }, //
        { status: 200 },
      );
    }

    const spotifyArtistIds = artistStatus.map(
      (artistStatus) => artistStatus.artist.spotifyId,
    );

    let spotifyArtists: Artist[] = [];
    try {
      spotifyArtists = await spotifyApi.artists.get(spotifyArtistIds);
    } catch (error) {
      console.log(error);
      return Response.json(
        { error: ErrorCode.SPOTIFY_UNKNOWN }, //
        { status: 500 },
      );
    }

    let artistStatus_: GET_ArtistStatusOuputDataItem[] = [];
    try {
      artistStatus_ = await Promise.all(
        artistStatus.map(
          async (
            artistStatus, //
            artistStatusIndex,
          ) => {
            const spotifyArtist = spotifyArtists[artistStatusIndex];

            const { items: spotifyAlbums } = await spotifyApi.artists.albums(
              spotifyArtist.id,
              "single,album",
              "FR", // @TODO - ... ("FR")!
              SPOTIFY_ALBUMS_LIMIT_MAX,
            );
            const spotifyTracksPerAlbum = await Promise.all(
              spotifyAlbums.map(async (spotifyAlbum) => {
                const { items: spotifyTracks } = await spotifyApi.albums.tracks(
                  spotifyAlbum.id,
                  "FR", // @TODO - ... ("FR")!
                  SPOTIFY_TRACKS_LIMIT_MAX,
                );
                return spotifyTracks;
              }),
            );

            const getSpotifyImageHighUrl = (images: Image[]) =>
              images.find((image) => image.width / image.height === 1)?.url;
            const getSpotifyImageLowUrl = (images: Image[]) =>
              images.findLast((image) => image.width / image.height === 1)?.url;

            return {
              id: artistStatus.id,
              artist: {
                spotifyId: spotifyArtist.id,
                spotifyName: spotifyArtist.name,
                spotifyFollowersTotal: spotifyArtist.followers.total,
                spotifyUrl: spotifyArtist.external_urls["spotify"],
                spotifyImageUrl: getSpotifyImageHighUrl(spotifyArtist.images),
                spotifyTracks: spotifyAlbums.reduce(
                  (spotifyTracks, spotifyAlbum, spotifyAlbumIndex) => {
                    return [
                      ...spotifyTracks,
                      ...spotifyTracksPerAlbum[spotifyAlbumIndex]
                        .filter(
                          (spotifyTrack) =>
                            spotifyTrack.is_playable &&
                            spotifyTrack.preview_url != null,
                        )
                        .map((spotifyTrack) => ({
                          spotifyUrl: spotifyTrack.preview_url!,
                          spotifyImageUrl: getSpotifyImageLowUrl(spotifyAlbum.images), // prettier-ignore
                          spotifyName: spotifyTrack.name,
                          spotifyArtistNames: spotifyTrack.artists.map((spotifyArtist) => spotifyArtist.name), // prettier-ignore
                          spotifyReleaseDate: spotifyAlbum.release_date,
                        })),
                    ];
                  },
                  [] as GET_ArtistStatusOuputDataItem["artist"]["spotifyTracks"],
                ),
              },
            };
          },
        ),
      );
    } catch (error) {
      console.log(error);
      return Response.json(
        { error: ErrorCode.SPOTIFY_UNKNOWN }, //
        { status: 500 },
      );
    }

    return Response.json(
      { data: artistStatus_ }, //
      { status: 200 },
    );
  },
);
