"use client";

import { Icon } from "@/app/_components/Icon";
import { useContext } from "react";
import { TracksContext } from "./_contexts/TracksContext";

export const BottomBarLink = () => {
  const { trackCurrent } = useContext(TracksContext);
  return (
    <div className="flex justify-end items-end">
      <a className="flex" href={trackCurrent?.spotifyUrl} target="_blank">
        <Icon
          className="text-primary hover:text-spotify transition-colors leading-none"
          name="spotify"
        />
      </a>
    </div>
  );
};
