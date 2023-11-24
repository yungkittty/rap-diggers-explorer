import { cn } from "@/app/_libs/shadcn";
import { ArtistCard } from "./ArtistCard";

type ArtistsCarouselProps = {};
export const ArtistsCarousel = (props: ArtistsCarouselProps) => {
  /* @TODO - ... */
  const artists = [
    {},
    {},
    {},
    {},
    {},
    {},
    {}, // x7
  ];
  /*  */

  return (
    <div className="flex flex-row flex-1 pt-12 overflow-hidden">
      <div
        className="relative flex flex-row flex-1"
        style={{
          // this allows to use container units!
          // https://developer.mozilla.org/en-US/docs/Web/CSS/CSS_container_queries
          containerName: "artists-carousel",
          containerType: "size",
        }}
      >
        {artists.map((_, artistIndex) => {
          const className = cn(
            "box-border absolute transition-all duration-1000",
            {
              "scale-75": artistIndex !== 3,
              "origin-left": artistIndex < 3,
              "origin-right": artistIndex > 3,
              "left-[calc(50%-40cqh-((80cqh*0.75)+48px)*3)]": artistIndex === 0,
              "left-[calc(50%-40cqh-((80cqh*0.75)+48px)*2)]": artistIndex === 1,
              "left-[calc(50%-40cqh-((80cqh*0.75)+48px)*1)]": artistIndex === 2,
              "left-[calc(50%-40cqh)]": artistIndex === 3,
              "left-[calc(50%-40cqh+((80cqh*0.75)+48px)*1)]": artistIndex === 4,
              "left-[calc(50%-40cqh+((80cqh*0.75)+48px)*2)]": artistIndex === 5,
              "left-[calc(50%-40cqh+((80cqh*0.75)+48px)*3)]": artistIndex === 6,
            },
          );
          return (
            <ArtistCard
              className={className}
              key={`artist-card-${artistIndex}`}
            />
          );
        })}
      </div>
    </div>
  );
};
