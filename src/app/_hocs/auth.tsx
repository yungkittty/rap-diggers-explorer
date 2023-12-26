import { headers } from "next/headers";
import { redirect } from "next/navigation";
import React from "react";
import { auth } from "../_libs/auth";
import prisma from "../_libs/prisma";
import { signOutServerSide } from "../_utils/auth";

export const withAuth = (Component: React.ComponentType<any>) => {
  const displayName = Component.displayName || "Component";
  const WithComponent = async () => {
    const pathname = headers().get("x-pathname");

    // If user isn't signed-in ...
    const session = await auth();
    if (
      !session || //
      !session.user ||
      session.error !== undefined
    ) {
      if (session && session.error !== undefined) {
        await signOutServerSide();
      }
      if (pathname === "/sign-in") {
        return <Component />;
      }
      return redirect("/sign-in");
    }

    // If user hasn't imported playlist ...
    const userId = session.user.id;
    const playlistStatus = await prisma.playlistStatus.findMany({
      select: {
        id: true,
      },
      where: {
        userId,
      },
    });
    if (!playlistStatus.length) {
      if (pathname === "/playlist") {
        return <Component />;
      }
      return redirect("/playlist");
    }

    // Else, ...
    if (pathname === "/") {
      return <Component />;
    }
    return redirect("/");
  };
  WithComponent.displayName = `withAuth(${displayName})`;
  return WithComponent;
};
