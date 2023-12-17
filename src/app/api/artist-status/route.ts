import { ErrorCode } from "@/app/_constants/error-code";
import prisma from "@/app/_libs/prisma";
import { GET_ArtistStatusOuputDataItem } from "@/app/_types/api";
import { withAuth } from "@/app/_utils/auth";
import { withRate } from "@/app/_utils/rate";
import { Artist } from "@spotify/web-api-ts-sdk";

const GET_ARTIST_STATUS_DEFAULT_OFFSET = 0;
const GET_ARTIST_STATUS_DEFAULT_LIMIT = 10;
const GET_ARTIST_STATUS_MAX_LIMIT = 50;

export const GET = withRate(
  { weight: 1 },
  withAuth(
    async (
      request, //
      _,
      userId,
      spotifyApi,
    ) => {
      const searchParams = request.nextUrl.searchParams;
      // const filters = "all";
      const offset = Number(searchParams.get("offset")) || GET_ARTIST_STATUS_DEFAULT_OFFSET; // prettier-ignore
      const limit = Number(searchParams.get("limit")) || GET_ARTIST_STATUS_DEFAULT_LIMIT; // prettier-ignore
      // https://developer.spotify.com/documentation/web-api/reference/get-multiple-artists
      if (limit > GET_ARTIST_STATUS_MAX_LIMIT) {
        return Response.json(
          { error: ErrorCode.INPUT_INVALID }, //
          { status: 400 },
        );
      }

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

      const artistStatus_: GET_ArtistStatusOuputDataItem[] = artistStatus.map(
        (artistStatus, artistStatusIndex) => {
          const spotifyArtist = spotifyArtists[artistStatusIndex];
          return {
            id: artistStatus.id,
            artist: {
              spotifyId: spotifyArtist.id,
              spotifyName: spotifyArtist.name,
              spotifyFollowersTotal: spotifyArtist.followers.total,
              spotifyUrl: spotifyArtist.external_urls["spotify"],
              spotifyImageUrl: spotifyArtist.images[0]?.url,
            },
          };
        },
      );

      return Response.json(
        { data: artistStatus_ }, //
        { status: 200 },
      );
    },
  ),
);
