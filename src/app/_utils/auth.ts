import { SpotifyApi } from "@spotify/web-api-ts-sdk";
import type { NextRequest, NextResponse } from "next/server";
import { auth } from "../_libs/auth";
import prisma from "../_libs/prisma";
import { getSpotifyApi } from "../_libs/spotify";

// @TODO - This can be removed as edge?
export const withAuth =
  (
    callback: (
      request: NextRequest, //
      response: NextResponse,
      userId: string,
      spotifyApi: SpotifyApi,
    ) => Promise<Response>,
  ) =>
  async (
    ...args: [
      NextRequest, //
      NextResponse,
    ]
  ): Promise<Response> => {
    const session = await auth();
    if (!session) {
      return Response.json(
        {}, //
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
        {}, //
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
