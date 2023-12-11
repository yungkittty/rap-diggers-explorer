"use client";

import { Icon } from "@/app/_components/Icon";
import { Button } from "@/app/_components/ui/button";
import { useContext } from "react";
import { TracksContext } from "./_contexts/TracksContext";

type BottomBarPlayerProps = {};
export const BottomBarPlayer = (props: BottomBarPlayerProps) => {
  const {
    isPlaying, //
    prevTrack,
    toggleTrack,
    nextTrack,
  } = useContext(TracksContext);
  return (
    <div className="flex flex-row items-center justify-center space-x-6">
      <Button variant="ghost" size="icon" onClick={prevTrack}>
        <Icon name="skip-back" />
      </Button>
      <Button
        className="rounded-full w-16 h-[unset] aspect-square"
        onClick={toggleTrack}
      >
        {!isPlaying ? (
          <Icon className="relative right-[-2.5px] text-5xl" name="play" />
        ) : (
          <Icon className="text-5xl" name="pause-mini" />
        )}
      </Button>
      <Button variant="ghost" size="icon" onClick={nextTrack}>
        <Icon name="skip-forward" />
      </Button>
    </div>
  );
};
