import { ErrorCode } from "@/app/_constants/error-code";
import prisma from "@/app/_libs/prisma";
import { GET_ArtistStatusOuputDataItem } from "@/app/_types/api";
import { withAuth } from "@/app/_utils/auth";
import { withRate } from "@/app/_utils/rate";
import { Artist } from "@spotify/web-api-ts-sdk";

export const GET_ARTIST_STATUS_DEFAULT_OFFSET = 0;
export const GET_ARTIST_STATUS_DEFAULT_LIMIT = 25;

export const GET = withRate(
  { weight: 1 },
  withAuth(
    async (
      request, //
      _,
      userId,
      spotifyApi,
    ) => {
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
          skippedAt: null,
        },
        orderBy: [
          { score: { sort: "desc", nulls: "first" } },
          { createdAt: "asc" }, //
          { artist: { spotifyId: "asc" } },
        ],
        skip: GET_ARTIST_STATUS_DEFAULT_OFFSET,
        take: GET_ARTIST_STATUS_DEFAULT_LIMIT,
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
