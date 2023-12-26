"use client";

import { Icon } from "@/app/_components/Icon";
import { Text } from "@/app/_components/Text";
import { Button } from "@/app/_components/ui/button";
import { signIn } from "next-auth/react";

export const SpotifyButton = () => {
  const handleClick = async () => {
    await signIn(
      "spotify", //
      { callbackUrl: "/playlist" },
    );
  };
  return (
    <Button
      className="relative bg-spotify hover:bg-spotify/90"
      size="lg"
      onClick={handleClick}
    >
      <Icon className="absolute left-3" name="spotify" />
      <Text className="ml-3 mr-[-8px] font-bold uppercase">
        continuer avec spotify
      </Text>
    </Button>
  );
};
