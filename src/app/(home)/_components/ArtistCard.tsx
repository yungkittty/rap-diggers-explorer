"use client";

import { Card } from "@/app/_components/ui/card";
import { cn } from "@/app/_libs/shadcn";
import { GET_ArtistStatusOuputDataItem } from "@/app/_types/api";

type ArtistCardProps = {
  className?: string;

  // @TODO - ...
  artist: GET_ArtistStatusOuputDataItem["artist"];
};
export const ArtistCard = (props: ArtistCardProps) => {
  const { className } = props;

  return (
    <Card
      className={cn(
        "flex h-full aspect-[4/5] bg-foreground/5", //
        className,
      )}
    />
  );
};
