"use client";

import { Image } from "@/app/_components/Image";
import { Text } from "@/app/_components/Text";
import { useContext } from "react";
import { ArtistsStatusContext } from "../../_contexts/ArtistStatusContext";
import { TracksContext } from "./_contexts/TracksContext";

type BottomBarTrackProps = {};
export const BottomBarTrack = (props: BottomBarTrackProps) => {
  const {
    isInitialLoading, //
    artistStatusCurrent,
  } = useContext(ArtistsStatusContext);

  const {
    trackCurrent, //
    trackNext,
    nextTrackCurrent,
  } = useContext(TracksContext);

  return (
    <div className="flex flex-row flex-1">
      {isInitialLoading || artistStatusCurrent ? (
        <>
          <div className="flex shrink-0 relative h-full aspect-square rounded-md overflow-hidden">
            <div className="flex flex-1 bg-foreground/10 animate-pulse" />
            {trackCurrent?.spotifyImageUrl ? (
              <Image
                src={trackCurrent.spotifyImageUrl}
                alt="" // @TODO - ...
                fill
                priority
                loading="eager"
              />
            ) : null}
            {/* This preload artist next track cover! */}
            {trackNext?.spotifyImageUrl ? (
              <Image
                className="opacity-0"
                src={trackNext.spotifyImageUrl}
                alt="" // @TODO - ...
                fill
                // priority
                loading="eager"
              />
            ) : null}
            {/* This preload next artist track cover! */}
            {nextTrackCurrent?.spotifyImageUrl ? (
              <Image
                className="opacity-0"
                src={nextTrackCurrent.spotifyImageUrl}
                alt="" // @TODO - ...
                fill
                // priority
                loading="eager"
              />
            ) : null}
          </div>
          <div className="flex flex-col justify-between my-0.5 ml-3 min-w-0">
            {trackCurrent ? (
              <Text className="uppercase text-base text-foreground leading-none whitespace-nowrap text-ellipsis overflow-hidden">
                {trackCurrent.spotifyName}
              </Text>
            ) : (
              <div className="h-4 w-56 bg-foreground/10 animate-pulse" />
            )}
            {trackCurrent ? (
              <Text className="mt-[-1px] uppercase text-sm text-foreground leading-none whitespace-nowrap text-ellipsis overflow-hidden">
                {trackCurrent.spotifyArtistNames.join(" • ")}
              </Text>
            ) : (
              <div className="mt-[-1px] h-3.5 w-28 bg-foreground/10 animate-pulse" />
            )}
            {trackCurrent ? (
              <Text className="uppercase text-xs text-primary/70 leading-none whitespace-nowrap text-ellipsis overflow-hidden">
                {new Intl.DateTimeFormat(
                  "fr-FR", //
                  { month: "short", year: "numeric" },
                ).format(new Date(trackCurrent.spotifyReleaseDate))}
              </Text>
            ) : (
              <div className="h-3 w-14 bg-foreground/10 animate-pulse" />
            )}
          </div>
        </>
      ) : null}
    </div>
  );
};
