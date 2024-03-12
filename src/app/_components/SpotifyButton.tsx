import { cn } from "../_libs/shadcn";
import { Icon } from "./Icon";
import { Text } from "./Text";

type SpotifyButtonProps = {
  className?: string;
  url?: string;
};

export const SpotifyButton = (props: SpotifyButtonProps) => {
  const { className, url } = props;
  return (
    <a
      className={cn(
        "flex flex-row items-center p-2.5 py-1.5 tall:py-2 pl-3.5 border rounded-full hover:text-secondary hover:border-transparent hover:bg-spotify transition-all", //
        className,
      )}
      href={url}
      target="_blank"
    >
      <Text className="mr-1.5 text-xs tall:text-sm font-bold uppercase leading-none">
        ouvrir spotify
      </Text>
      <Icon className="text-2xl leading-none" name="spotify" />
    </a>
  );
};
