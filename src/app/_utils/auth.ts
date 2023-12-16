import type { SpotifyApi } from "@spotify/web-api-ts-sdk";
import { cookies } from "next/headers";
import type { NextRequest } from "next/server";
import { ErrorCode } from "../_constants/error-code";
import { auth } from "../_libs/auth";
import prisma from "../_libs/prisma";
import { getSpotifyApi } from "../_libs/spotify";

const NEXT_AUTH_SESSION_COOKIE_NAME = "next-auth.session-token";
export const signOutServerSide = async (): Promise<void> => {
  const sessionCookie = cookies().get(NEXT_AUTH_SESSION_COOKIE_NAME);
  if (!sessionCookie) {
    return;
  }
  const sessionToken = sessionCookie.value;
  try {
    await prisma.session.update({
      data: { expires: new Date() },
      where: { sessionToken: sessionToken },
    });
  } catch (error) {
    console.log(error);
  }
  cookies().delete(NEXT_AUTH_SESSION_COOKIE_NAME);
  return;
};

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
      !session.user ||
      session.error !== undefined
    ) {
      if (session && session.error !== undefined) {
        await signOutServerSide();
      }
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
