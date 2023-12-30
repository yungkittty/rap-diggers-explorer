import { BottomBarLink } from "./BottomBarLink";
import { BottomBarPlayer } from "./BottomBarPlayer";
import { BottomBarSeeker } from "./BottomBarSeeker";
import { BottomBarTrack } from "./BottomBarTrack";

type BottomBarProps = {};
export const BottomBar = (props: BottomBarProps) => {
  return (
    <div className="flex flex-col w-full">
      <BottomBarSeeker>
        <div className="grid grid-cols-3 w-full h-[85px] p-3">
          <BottomBarTrack />
          <BottomBarPlayer />
          <BottomBarLink />
        </div>
      </BottomBarSeeker>
    </div>
  );
};
