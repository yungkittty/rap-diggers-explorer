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
      /* const artistStatus = await prisma.$queryRaw<{ id: string; spotifyId: string }[]>`
        SELECT as2.id,
          a."spotifyId"
        FROM "ArtistStatus" as2
        LEFT JOIN "Artist" a ON a.id = as2."artistId"
        LEFT JOIN LATERAL
          (SELECT COUNT(as3."dugInAt") / COUNT(as3.id)::float AS "dugInRatio",
                  COUNT(as3."dugOutAt") / COUNT(as3.id)::float AS "dugOutRatio",
                  COUNT(as3."likedAt") / COUNT(as3.id)::float AS "likedRatio",
                  COUNT(as3."dislikedAt") / COUNT(as3.id)::float AS "dislikedRatio",
                  COUNT(as3."snoozedAt") / COUNT(as3.id)::float AS "snoozedRatio",
                  COUNT(as3."skippedAt") / COUNT(as3.id)::float AS "skippedRatio"
          FROM "ArtistStatus" as3
          WHERE as3."userId" = as2."userId"
            AND as3."batchId" IS NOT DISTINCT FROM as2."batchId") AS ratios ON TRUE
        WHERE as2."userId" = ${userId}
          -- filter = all
          AND as2."dugInAt" IS NULL
          AND as2."dugOutAt" IS NULL
          AND as2."likedAt" IS NULL
          AND as2."dislikedAt" IS NULL
          AND as2."snoozedAt" IS NULL
          AND as2."skippedAt" IS NULL
        ORDER BY CASE WHEN as2."batchId" IS NULL THEN 0 ELSE 1 END, 
          ratios."likedRatio" DESC,
          ratios."dugInRatio" DESC,
          ratios."snoozedRatio" DESC,
          ratios."dislikedRatio" DESC,
          ratios."dugOutRatio" DESC,
          ratios."skippedRatio" DESC,
          as2."createdAt",
          as2.id
        LIMIT ${GET_ARTIST_STATUS_DEFAULT_LIMIT}
        OFFSET ${GET_ARTIST_STATUS_DEFAULT_OFFSET};
      `; */
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
