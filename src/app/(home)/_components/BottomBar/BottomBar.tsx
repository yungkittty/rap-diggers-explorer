import { BottomBarPlayer } from "./BottomBarPlayer";
import { BottomBarSeeker } from "./BottomBarSeeker";
import { BottomBarTrack } from "./BottomBarTrack";
import { TracksContextProvider } from "./_contexts/TracksContext";

type BottomBarProps = {};
export const BottomBar = (props: BottomBarProps) => {
  return (
    <TracksContextProvider>
      <div className="flex flex-col w-full">
        <BottomBarSeeker>
          <div className="grid grid-cols-3 w-full h-[85px] p-3">
            <BottomBarTrack />
            <BottomBarPlayer />
          </div>
        </BottomBarSeeker>
      </div>
    </TracksContextProvider>
  );
};
