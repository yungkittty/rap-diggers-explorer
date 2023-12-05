import { ErrorCode } from "@/app/_constants/error-code";
import prisma from "@/app/_libs/prisma";
import { GET_ArtistStatusOuputDataItem } from "@/app/_types/api";
import { withAuth } from "@/app/_utils/auth";
import { Artist, Image } from "@spotify/web-api-ts-sdk";

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
            // This ...
            const spotifyArtist = spotifyArtists[artistStatusIndex];

            const { tracks: spotifyTracks } = // prettier-ignore
              await spotifyApi.artists.topTracks(spotifyArtist.id, "FR");

            const getSpotifyImageP_Url = (images: Image[]) =>
              images.find((image) => image.width / image.height === 1)?.url;
            const getSpotifyImageB_Url = (images: Image[]) =>
              images.find((image) => image.width / image.height > 1)?.url;

            return {
              id: artistStatus.id,
              artist: {
                spotifyId: spotifyArtist.id,
                spotifyName: spotifyArtist.name,
                spotifyFollowersTotal: spotifyArtist.followers.total,
                spotifyUrl: spotifyArtist.external_urls["spotify"],
                spotifyImageP_Url: getSpotifyImageP_Url(spotifyArtist.images),
                spotifyImageB_Url: getSpotifyImageB_Url(spotifyArtist.images),
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
