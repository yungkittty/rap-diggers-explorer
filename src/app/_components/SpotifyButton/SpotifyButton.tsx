"use client";

import { signIn, useSession } from "next-auth/react";

export const SpotifyButton = () => {
  const { data: session } = useSession();

  if (session) {
    return null;
  }

  return (
    <div
      className="inline p-2 bg-red-500"
      onClick={() => {
        signIn("spotify");
      }}
    >
      Connection With Spotify
    </div>
  );
};
