import { SpotifyApi } from "@spotify/web-api-ts-sdk";
import type { NextRequest } from "next/server";
import { ErrorCode } from "../_constants/error-code";
import { auth } from "../_libs/auth";
import prisma from "../_libs/prisma";
import { getSpotifyApi } from "../_libs/spotify";

export const withAuth =
  (
    callback: (
      request: NextRequest, //
      { params }: { params: { [key: string]: string } },
      userId: string,
      spotifyApi: SpotifyApi,
    ) => Promise<Response>,
  ) =>
  async (
    ...args: [
      NextRequest, //
      { params: { [key: string]: string } },
    ]
  ): Promise<Response> => {
    const session = await auth();
    if (
      !session || //
      !session.user // ||
      // session.error // @TODO - This should be changed!
    ) {
      return Response.json(
        { error: ErrorCode.USER_UNAUTHORIZED },
        { status: 401 },
      );
    }

    const userId = session.user.id;
    const accounts = await prisma.account.findMany({
      where: {
        userId,
        provider: "spotify",
      },
    });
    if (accounts.length !== 1) {
      return Response.json(
        { error: ErrorCode.USER_FORBIDDEN },
        { status: 403 },
      );
    }
    const account = accounts[0];

    return callback(
      ...args, //
      userId,
      getSpotifyApi(account),
    );
  };
