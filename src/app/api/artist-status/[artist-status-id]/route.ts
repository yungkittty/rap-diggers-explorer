import { ErrorCode } from "@/app/_constants/error-code";
import prisma from "@/app/_libs/prisma";
import {
  PUT_ArtistStatusInput,
  PUT_ArtistStatusInputSchema,
} from "@/app/_types/api";
import { upsertArtistStatus } from "@/app/_utils/artist-status";
import { withAuth } from "@/app/_utils/auth";
import { withRate } from "@/app/_utils/rate";
import {
  GET_ARTIST_STATUS_DEFAULT_LIMIT,
  GET_ARTIST_STATUS_DEFAULT_OFFSET,
} from "../route";

const PUT_ARTIST_STATUS_DUG_IN_WEIGHT = 1.5;
const PUT_ARTIST_STATUS_DUG_OUT_WEIGHT = -8;
const PUT_ARTIST_STATUS_LIKED_WEIGHT = 5;
const PUT_ARTIST_STATUS_DISLIKED_WEIGHT = -1.5;
const PUT_ARTIST_STATUS_SOONZED_WEIGHT = 2;

export const PUT = withRate(
  { weight: 1 },
  withAuth(
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

      const data = await request.json();
      if (!PUT_ArtistStatusInputSchema.safeParse(data).success) {
        return Response.json(
          { error: ErrorCode.INPUT_INVALID }, //
          { status: 400 },
        );
      }

      const { action } = data as PUT_ArtistStatusInput;
      const artistStatus = await prisma.artistStatus.findUnique({
        select: {
          id: true,
          batchId: true,

          // filters = all
          dugInAt: true,
          dugOutAt: true,
          likedAt: true,
          dislikedAt: true,
          snoozedAt: true,
          skippedAt: true,

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
      if (
        artistStatus.dugInAt ||
        artistStatus.dugOutAt ||
        artistStatus.likedAt ||
        artistStatus.dislikedAt ||
        artistStatus.snoozedAt ||
        artistStatus.skippedAt
      ) {
        return Response.json(
          { error: ErrorCode.USER_FORBIDDEN },
          { status: 403 },
        );
      }

      const spotifyArtistId = artistStatus.artist.spotifyId;

      let spotifyArtistIds: string[] = [];
      if (action === "dig-in" || action === "like") {
        try {
          const { artists: spotifyArtists } =
            await spotifyApi.artists.relatedArtists(spotifyArtistId);
          spotifyArtistIds = spotifyArtists
            .filter((spotifyArtist) => spotifyArtist.followers.total <= 50_000)
            .map((spotifyArtist) => spotifyArtist.id);
        } catch (error) {
          console.log(error);
          return Response.json(
            { error: ErrorCode.SPOTIFY_UNKNOWN }, //
            { status: 500 },
          );
        }
      }

      let score: number | null = null;
      if (artistStatus.batchId && action !== "skipped") {
        const artistStatus_ = await prisma.artistStatus.findMany({
          select: {
            // filters = all - skipped
            dugInAt: true,
            dugOutAt: true,
            likedAt: true,
            dislikedAt: true,
            snoozedAt: true,
          },
          where: {
            batchId: artistStatus.batchId,

            // filters = all - skipped
            OR: [
              { dugInAt: { not: null } },
              { dugOutAt: { not: null } },
              { likedAt: { not: null } },
              { dislikedAt: { not: null } },
              { snoozedAt: { not: null } },
            ],
          },
        });

        type ComputedFields =
          | "dugInAt" //
          | "dugOutAt"
          | "likedAt"
          | "dislikedAt"
          | "snoozedAt";
        const fieldsToActionsMap: { [key in ComputedFields]: typeof action } = {
          dugInAt: "dig-in",
          dugOutAt: "dig-out",
          likedAt: "like",
          dislikedAt: "dislike",
          snoozedAt: "snooze",
        };
        const computeFieldRatio = (artistStatusField: ComputedFields) => 
          (artistStatus_.filter((artistStatus) => artistStatus[artistStatusField] !== null).length + +(fieldsToActionsMap[artistStatusField] === action)) / (artistStatus_.length + 1); // prettier-ignore

        const dugInRatio = computeFieldRatio("dugInAt");
        const dugOutRatio = computeFieldRatio("dugOutAt");
        const likedRatio = computeFieldRatio("likedAt");
        const dislikedRatio = computeFieldRatio("dislikedAt");
        const snoozedRatio = computeFieldRatio("snoozedAt");
        if (process.env.NODE_ENV !== "production") {
          console.log(artistStatus.batchId, {
            "dug-in ratio": dugInRatio,
            "dug-out ratio": dugOutRatio,
            "liked ratio": likedRatio,
            "disliked ratio": dislikedRatio,
            "snoozed ratio": snoozedRatio,
          });
        }

        // prettier-ignore
        score = (
          dugInRatio     * PUT_ARTIST_STATUS_DUG_IN_WEIGHT +
          dugOutRatio    * PUT_ARTIST_STATUS_DUG_OUT_WEIGHT +
          likedRatio     * PUT_ARTIST_STATUS_LIKED_WEIGHT +
          dislikedRatio  * PUT_ARTIST_STATUS_DISLIKED_WEIGHT +
          snoozedRatio   * PUT_ARTIST_STATUS_SOONZED_WEIGHT
        ) / 5;
        score = Math.round((score + Number.EPSILON) * 100) / 100;
        if (process.env.NODE_ENV !== "production") {
          console.log(
            artistStatus.batchId, //
            { score },
          );
        }
      }

      await prisma.$transaction(async (tx) => {
        const parentId = artistStatus.id;
        const batchId = crypto.randomUUID();
        await upsertArtistStatus(
          tx, //
          userId,
          spotifyArtistIds,
          { parentId, batchId, score: 0 },
        );

        await tx.artistStatus.update({
          data: {
            dugInAt: action === "dig-in" ? new Date() : null,
            dugOutAt: action === "dig-out" ? new Date() : null,
            likedAt: action === "like" ? new Date() : null,
            dislikedAt: action === "dislike" ? new Date() : null,
            snoozedAt: action === "snooze" ? new Date() : null,
            skippedAt: action === "skipped" ? new Date() : null,
          },
          where: {
            id: artistStatus.id,
          },
        });

        if (score !== null) {
          await tx.artistStatus.updateMany({
            data: {
              score,
            },
            where: {
              batchId: artistStatus.batchId,
            },
          });
        }
      });

      const artistStatus_ = await prisma.artistStatus.findMany({
        select: {
          id: true,
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
          { createdAt: "asc" },
          { artist: { spotifyId: "asc" } },
        ],
        skip: GET_ARTIST_STATUS_DEFAULT_OFFSET,
        take: GET_ARTIST_STATUS_DEFAULT_LIMIT,
      });
      /* const artistStatus_ = await prisma.$queryRaw<{ id: string }[]>`
        SELECT as2.id
        FROM "ArtistStatus" as2
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
      const artistStatusIds = artistStatus_.map(
        (artistStatus) => artistStatus.id,
      );

      return Response.json(
        { data: artistStatusIds }, //
        { status: 200 },
      );
    },
  ),
);
