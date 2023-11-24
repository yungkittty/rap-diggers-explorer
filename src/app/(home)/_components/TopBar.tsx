import { TopBarAvatar } from "./TopBarAvatar";

type TopBarProps = {};
export const TopBar = (props: TopBarProps) => {
  return (
    <div className="flex flex-col w-full h-[65px] p-3 px-6 items-end border-b-2 border-foreground/5 border-solid">
      <TopBarAvatar />
    </div>
  );
};
