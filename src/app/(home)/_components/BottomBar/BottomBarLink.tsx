"use client";

import { SpotifyButton } from "@/app/_components/SpotifyButton";
import { useContext } from "react";
import { TracksContext } from "./_contexts/TracksContext";

export const BottomBarLink = () => {
  const { trackCurrent } = useContext(TracksContext);
  return (
    <div className="flex justify-end items-center mr-3">
      <SpotifyButton url={trackCurrent?.spotifyUrl} />
    </div>
  );
};
