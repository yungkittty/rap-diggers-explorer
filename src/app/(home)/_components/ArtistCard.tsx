"use client";

import { Heading } from "@/app/_components/Heading";
import { Image } from "@/app/_components/Image";
import { SpotifyButton } from "@/app/_components/SpotifyButton";
import { Text } from "@/app/_components/Text";
import { Card } from "@/app/_components/ui/card";
import { cn } from "@/app/_libs/shadcn";
import { GET_ArtistStatusOuputDataItem } from "@/app/_types/api";

type ArtistCardProps = {
  className?: string;
  artist?: GET_ArtistStatusOuputDataItem["artist"];
  isLoading?: boolean;
  isFocused?: boolean;
};
export const ArtistCard = (props: ArtistCardProps) => {
  const {
    className, //
    artist,
    isLoading = false,
    isFocused = false,
  } = props;

  return (
    <Card
      className={cn(
        "flex flex-col h-full aspect-[4/5] overflow-hidden shadow transition-shadow duration-700",
        { shadow: isFocused },
        className,
      )}
    >
      <div
        className={cn(
          "absolute w-full h-[300%] blur-[calc(150px/1.5)]", //
          { "animate-pulse": isLoading },
        )}
        style={{
          WebkitMaskImage: `
            radial-gradient(
              circle,
              rgba(255,255,255,0) 0%,
              rgba(255,255,255,0) 50%,
              rgba(255,255,255,1) 100%
            )
          `,
        }}
      >
        <div className="absolute w-full h-full bg-foreground/50" />
        {artist?.spotifyImageUrl ? (
          <Image
            className="opacity-[0.75]"
            src={artist?.spotifyImageUrl}
            alt="" // @TODO - ...
            fill
            priority
            loading="eager"
          />
        ) : null}
      </div>
      <div className="absolute w-full h-full bg-gradient-to-t from-white" />
      {!isLoading ? (
        <div className="absolute flex flex-col items-center h-full w-full pt-[calc(100%/2/2/2)] pb-[calc(100%/2/2/2/2)] px-[calc(100%/2/2/2/2/2)]">
          {/* @TODO - rounded-lg */}
          <div className="flex relative w-1/2 aspect-square shadow overflow-hidden">
            {artist?.spotifyImageUrl ? (
              <Image
                src={artist?.spotifyImageUrl}
                alt="" // @TODO - ...
                fill
                priority
                loading="eager"
              />
            ) : null}
          </div>
          <Heading className="mt-[calc(100%/2/2/2/2/1.125)] text-lg tall:text-2xl text-primary">
            {artist?.spotifyName}
          </Heading>
          <div className="flex flex-col justify-center items-center mt-[calc(100%/2/2/2/2/2)] tall:mt-[calc(100%/2/2/2/2)]">
            <Text className="text-lg tall:text-2xl text-primary font-bold">
              {artist?.spotifyFollowersTotal != null
                ? Intl.NumberFormat(
                    "fr-FR", //
                    { notation: "compact" },
                  ).format(artist?.spotifyFollowersTotal)
                : null}
            </Text>
            <Text className="tall:mt-0.5 text-xs tall:text-sm text-primary/60 uppercase">
              abonné·e·s
            </Text>
          </div>
          <SpotifyButton className="mt-auto" url={artist?.spotifyUrl} />
        </div>
      ) : null}
      <div
        className={cn(
          "absolute h-[125%] w-[125%] mt-[-25%] ml-[-25%] bg-background transition-all duration-700 overflow-hidden", //
          { "bg-transparent backdrop-blur-none pointer-events-none": isFocused }, // prettier-ignore
        )}
      />
    </Card>
  );
};
