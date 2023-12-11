"use client";

import { cn } from "@/app/_libs/shadcn";
import { useContext } from "react";
import { ArtistsStatusContext } from "../_contexts/ArtistStatusContext";
import { ArtistCard } from "./ArtistCard";

export const ARTIST_CARDS_CAROUSEL_SIZE = 7;
export const ARTIST_CARDS_CAROUSEL_OFFSET = 3;

type ArtistCardsCarouselProps = {};
export const ArtistCardsCarousel = (props: ArtistCardsCarouselProps) => {
  const { artistStatus } = useContext(ArtistsStatusContext);

  return (
    <div className="flex flex-row flex-1 pt-12 overflow-hidden">
      <div
        className="relative flex flex-row flex-1"
        style={{
          // This allows to use container units!
          // https://developer.mozilla.org/en-US/docs/Web/CSS/CSS_container_queries
          containerName: "artists-carousel",
          containerType: "size",
        }}
      >
        {artistStatus.map(
          (
            artistStatus, //
            artistStatusIndex,
          ) => {
            if (
              !artistStatus ||
              artistStatusIndex >= ARTIST_CARDS_CAROUSEL_SIZE
            ) {
              return null;
            }

            const className = cn(
              "box-border absolute transition-all duration-1000",
              {
                "scale-75": artistStatusIndex !== ARTIST_CARDS_CAROUSEL_OFFSET,
                "origin-left": artistStatusIndex < ARTIST_CARDS_CAROUSEL_OFFSET,
                "origin-right": artistStatusIndex > ARTIST_CARDS_CAROUSEL_OFFSET, // prettier-ignore
                "left-[calc(50%-40cqh-((80cqh*0.75)+48px)*3)]": artistStatusIndex === 0, // prettier-ignore
                "left-[calc(50%-40cqh-((80cqh*0.75)+48px)*2)]": artistStatusIndex === 1, // prettier-ignore
                "left-[calc(50%-40cqh-((80cqh*0.75)+48px)*1)]": artistStatusIndex === 2, // prettier-ignore
                "left-[calc(50%-40cqh)]": artistStatusIndex === ARTIST_CARDS_CAROUSEL_OFFSET, // prettier-ignore
                "left-[calc(50%-40cqh+((80cqh*0.75)+48px)*1)]": artistStatusIndex === 4, // prettier-ignore
                "left-[calc(50%-40cqh+((80cqh*0.75)+48px)*2)]": artistStatusIndex === 5, // prettier-ignore
                "left-[calc(50%-40cqh+((80cqh*0.75)+48px)*3)]": artistStatusIndex === 6, // prettier-ignore
              },
            );
            return (
              <ArtistCard
                className={className}
                key={`artist-card-${artistStatus.id}`}
                artist={artistStatus.artist}
              />
            );
          },
        )}
      </div>
    </div>
  );
};
