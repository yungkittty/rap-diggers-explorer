import { ErrorCode } from "@/app/_constants/error-code";
import prisma from "@/app/_libs/prisma";
import { withAuth } from "@/app/_utils/auth";

export const DELETE = withAuth(
  async (
    request, //
    { params },
    userId,
  ) => {
    const playlistStatusId = params["playlist-status-id"];
    if (playlistStatusId == null || typeof playlistStatusId !== "string") {
      return Response.json(
        { error: ErrorCode.INPUT_INVALID }, //
        { status: 400 },
      );
    }

    const playlistStatus = await prisma.playlistStatus.findUnique({
      select: {
        id: true,
        subscribedAt: true,
      },
      where: {
        id: playlistStatusId,
        userId,
      },
    });
    if (!playlistStatus) {
      return Response.json(
        { error: ErrorCode.PLAYLIST_STATUS_NOT_FOUND }, //
        { status: 404 },
      );
    }
    if (!playlistStatus.subscribedAt) {
      return Response.json(
        { error: ErrorCode.PLAYLIST_STATUS_NOT_SUBSCRIBED }, //
        { status: 403 },
      );
    }

    await prisma.playlistStatus.delete({
      where: {
        id: playlistStatusId,
      },
    });

    return Response.json(
      {}, //
      { status: 200 },
    );
  },
);
