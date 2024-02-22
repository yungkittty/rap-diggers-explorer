import { cn } from "../_libs/shadcn";
import { Text } from "./Text";
import { Input, InputProps } from "./ui/input";

type InputPlaylistProps = {
  className?: string;
} & Omit<InputProps, "className" | "spellCheck">;

export const InputPlaylist = (props: InputPlaylistProps) => {
  const { className, ...others } = props;
  return (
    <div className={cn("relative", className)}>
      <div className="absolute flex h-full w-1/2 items-center justify-center rounded-l-md border border-solid border-input bg-primary/5">
        <Text className="text-base text-primary/50">
          https://open.spotify.com/playlist/
        </Text>
      </div>
      <Input
        {...others}
        className="pl-[calc(50%+8px)] text-base text-primary focus-visible:ring-ring/80"
        spellCheck={false}
      />
    </div>
  );
};
