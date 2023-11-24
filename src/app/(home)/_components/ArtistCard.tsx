import { cn } from "@/app/_libs/shadcn";

type ArtistCardProps = {
  className?: string;
};
export const ArtistCard = (props: ArtistCardProps) => {
  const { className } = props;

  return (
    <div
      className={cn(
        "h-full aspect-[4/5] rounded-md bg-foreground/10",
        className,
      )}
    />
  );
};
