"use client";

import { cn } from "@/app/_libs/shadcn";
import React, {
  PropsWithChildren,
  useContext,
  useEffect,
  useState,
} from "react";
import { TracksContext } from "./_contexts/TracksContext";
import { useEffectEvent } from "./_hooks/useEffectEvent";

export const BottomBarSeeker = (props: PropsWithChildren) => {
  const { children } = props;

  const {
    isSeeking, //
    setIsSeeking,
    trackCurrentMetadata,
    seekTrackToPercentage,
  } = useContext(TracksContext);
  const trackCurrentDuration = trackCurrentMetadata?.duration ?? 1;
  const trackCurrentTime = trackCurrentMetadata?.currentTime ?? 0;
  const trackCurrentTimePct = Math.round(
    (trackCurrentTime / trackCurrentDuration) * 100,
  );

  const handleMouseDown = (event: React.MouseEvent<HTMLDivElement>) => {
    event.stopPropagation();
    const { button } = event;
    if (button != 0) {
      return;
    }
    if (!trackCurrentMetadata) {
      return;
    }
    setIsSeeking(true);
  };
  const seekTrackToPctFromEvent = (event: MouseEvent) => {
    const { clientX } = event;
    const windowWidth = window.innerWidth;
    const windowWidthPct = Math.min(Math.max(clientX / windowWidth, 0), 1);
    seekTrackToPercentage(windowWidthPct);
  };
  const handleMouseMove = useEffectEvent((event: MouseEvent) => {
    if (!isSeeking) {
      return;
    }
    seekTrackToPctFromEvent(event);
  });
  const handleMouseUp = useEffectEvent((event: MouseEvent) => {
    if (!isSeeking) {
      return;
    }
    const { button } = event;
    if (button != 0) {
      return;
    }
    seekTrackToPctFromEvent(event);
    setIsSeeking(false);
  });
  useEffect(
    () => {
      window.addEventListener("mousemove", handleMouseMove);
      window.addEventListener("mouseup", handleMouseUp);
      return () => {
        window.removeEventListener("mousemove", handleMouseMove);
        window.removeEventListener("mouseup", handleMouseUp);
      };
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [],
  );

  const [isAllOver, setIsAllOver] = useState(false);
  const handleMouseOverAll = () => {
    setIsAllOver(true);
  };
  const handleMouseOutAll = () => {
    setIsAllOver(false);
  };
  const [isOver, setIsOver] = useState(false);
  const handleMouseOver = () => {
    setIsOver(true);
  };
  const handleMouseOut = () => {
    setIsOver(false);
  };

  return (
    <div
      className="flex flex-col"
      onMouseOver={handleMouseOverAll}
      onMouseOut={handleMouseOutAll}
    >
      <div
        className={cn(
          "flex relative items-center w-full h-0.5 bg-foreground/5 transition-transform duration-75", //
          { "scale-y-125": isOver },
        )}
      >
        <div
          className="absolute h-full rounded-r-full bg-foreground/90"
          style={{
            width: `calc(${trackCurrentTimePct}% - 7.5px)`,
          }}
        />
        <div
          className={cn(
            "absolute h-3 aspect-square rounded-full bg-foreground opacity-0 transition-opacity transition-transform duration-75",
            { "opacity-1": isAllOver },
            { "scale-x-125": isOver },
          )}
          style={{
            left: `calc(${trackCurrentTimePct}% - 7.5px - 6px)`,
          }}
        />
        <div
          className="absolute w-full h-8 hover:cursor-pointer"
          onMouseOver={handleMouseOver}
          onMouseOut={handleMouseOut}
          onMouseDown={handleMouseDown}
        />
      </div>
      {children}
    </div>
  );
};
