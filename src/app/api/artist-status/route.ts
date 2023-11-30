import { ErrorCode } from "@/app/_constants/error-code";
import prisma from "@/app/_libs/prisma";
import type { API_GETArtistStatusOuputDataItem } from "@/app/_types/api";
import { upsertArtistStatus } from "@/app/_utils/artists";
import { withAuth } from "@/app/_utils/auth";
import { Artist, Image, Track } from "@spotify/web-api-ts-sdk";
import { z } from "zod";

const GET_ARTIST_STATUS_DEFAULT_OFFSET = 0;
const GET_ARTIST_STATUS_DEFAULT_LIMIT = 10;

// This makes sure returned data isn't cached!
// https://nextjs.org/docs/app/api-reference/file-conventions/route-segment-config#options
export const dynamic = "force-dynamic";
export const GET = withAuth(
  async (
    request, //
    response,
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
      orderBy: {
        createdAt: "asc",
      },
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

    let spotifyArtists: Artist[] | null = null;
    try {
      spotifyArtists = await spotifyApi.artists.get(spotifyArtistIds);
    } catch (error) {
      console.log(error);
      return Response.json(
        { error: ErrorCode.SPOTIFY_UNKNOWN }, //
        { status: 500 },
      );
    }

    const artistStatusWithArtist: API_GETArtistStatusOuputDataItem[] = [];

    for (
      let artistStatusIndex = 0;
      artistStatusIndex < artistStatus.length;
      artistStatusIndex++
    ) {
      /* /!\ */
      const artistStatus_ = artistStatus[artistStatusIndex];
      const artistStatusSpotifyArtist = spotifyArtists[artistStatusIndex];

      let spotifyTracks: { tracks: Track[] } | null = null;
      try {
        spotifyTracks = await spotifyApi.artists.topTracks(
          artistStatusSpotifyArtist.id, //
          "FR",
        );
      } catch (error) {
        console.log(error);
        return Response.json(
          { error: ErrorCode.SPOTIFY_UNKNOWN }, //
          { status: 500 },
        );
      }

      const getSpotifyImageP_Url = (images: Image[]) =>
        images.find((image) => image.width / image.height === 1)?.url;
      const getSpotifyImageB_Url = (images: Image[]) =>
        images.find((image) => image.width / image.height > 1)?.url;

      artistStatusWithArtist.push({
        id: artistStatus_.id,
        artist: {
          spotifyId: artistStatusSpotifyArtist.id,
          spotifyName: artistStatusSpotifyArtist.name,
          spotifyFollowersTotal: artistStatusSpotifyArtist.followers.total,
          spotifyUrl: artistStatusSpotifyArtist.external_urls["spotify"],
          spotifyImageP_Url: getSpotifyImageP_Url(artistStatusSpotifyArtist.images), // prettier-ignore
          spotifyImageB_Url: getSpotifyImageB_Url(artistStatusSpotifyArtist.images), // prettier-ignore
        },
      });
    }

    return Response.json(
      { data: artistStatusWithArtist }, //
      { status: 200 },
    );
  },
);

// @TODO - ...
const InputSchema = z.object({
  artistId: z.string(),
  action: z.union([
    z.literal("dig-in"), //
    z.literal("dig-out"),
    z.literal("like"),
    z.literal("dislike"),
    z.literal("snooze"),
  ]),
});
type Input = z.infer<typeof InputSchema>;

// @TODO - This should handle that artist status can't be updated twice!
export const PUT = withAuth(
  async (
    request, //
    response,
    userId,
    spotifyApi,
  ) => {
    const data = await request.json();
    if (!InputSchema.safeParse(data).success) {
      return Response.json(
        {}, //
        { status: 422 },
      );
    }

    const { artistId, action } = data as Input;
    const artistStatus = await prisma.artistStatus.findUnique({
      where: {
        userId_artistId: {
          userId,
          artistId,
        },
      },
      include: {
        artist: true,
      },
    });
    if (!artistStatus) {
      return Response.json(
        {}, //
        { status: 404 },
      );
    }

    const spotifyArtistId = artistStatus.artist.spotifyId;

    let spotifyArtistIds: string[];
    if (action === "dig-in" || action === "like") {
      try {
        const { artists } =
          await spotifyApi.artists.relatedArtists(spotifyArtistId);
        spotifyArtistIds = artists.map((artist) => artist.id);
      } catch (error) {
        console.log(error);
        return Response.json(
          {}, //
          { status: 500 },
        );
      }
    }

    await prisma.$transaction(async (tx) => {
      if (spotifyArtistIds.length > 0) {
        await upsertArtistStatus(
          tx, //
          userId,
          artistStatus.playlistId,
          spotifyArtistIds,
        );
      }

      await tx.artistStatus.update({
        data: {
          dugInAt: action === "dig-in" ? new Date() : null,
          dugOutAt: action === "dig-out" ? new Date() : null,
          likedAt: action === "like" ? new Date() : null,
          dislikedAt: action === "dislike" ? new Date() : null,
          snoozedAt: action === "snooze" ? new Date() : null,
        },
        where: {
          id: artistStatus.id,
        },
      });
    });

    return Response.json(
      {}, //
      { status: 200 },
    );
  },
);
