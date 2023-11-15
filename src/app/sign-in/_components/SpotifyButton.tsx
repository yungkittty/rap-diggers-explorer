"use client";

import { Button } from "@/app/_components/Button";
import { Image } from "@/app/_components/Image";
import { Text } from "@/app/_components/Text";
import LogoSpotifySVG from "../_assets/logo-spotify-white.svg";
import { cn } from "@/app/_libs/shadcn";

type SpotifyButtonProps = { className?: string };

export const SpotifyButton = (props: SpotifyButtonProps) => {
  const { className } = props;
  return (
    <Button
      className={cn(
        className,
        "relative flex rounded-full bg-spotify hover:bg-spotify/90",
      )}
      size="lg"
    >
      <Image
        className="absolute left-3"
        src={LogoSpotifySVG} //
        width={24}
        height={24}
        alt=""
      />
      <Text className="ml-3 mr-[-8px] text-base font-bold uppercase">
        continuer avec spotify
      </Text>
    </Button>
  );
};
