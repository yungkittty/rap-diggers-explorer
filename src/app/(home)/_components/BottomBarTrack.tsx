import { Text } from "@/app/_components/Text";

type BottomBarTrackProps = {};

export const BottomBarTrack = (props: BottomBarTrackProps) => {
  // useContext()
  return (
    <div className="flex flex-row">
      <div className="h-full aspect-square rounded-md bg-foreground/5" />
      <div className="flex flex-col justify-between ml-3 whitespace-nowrap">
        <Text className="mb-[-2px] uppercase text-base text-foreground">
          {/*  */}
          oublie pas
        </Text>
        <Text className="uppercase text-sm text-foreground">
          {/*  */}
          abel31, wasting shit
        </Text>
        <Text className="uppercase text-xs text-foreground/70">
          {/*  */}
          jul. 2023
        </Text>
      </div>
    </div>
  );
};
