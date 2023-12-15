import { TopBarAvatarMenu } from "./TopBarAvatarMenu";
import { TopBarExportButton } from "./TopBarExportButton";
import { TopBarImportButton } from "./TopBarImportButton";
// import { TopBarManualButton } from "./TopBarManualButton";

type TopBarProps = {};
export const TopBar = (props: TopBarProps) => {
  return (
    <div className="flex flex-row justify-end items-center w-full h-[65px] p-3 px-6 border-solid border-b-2 border-foreground/5">
      <div className="flex flex-row gap-3">
        {/* @TODO - ... */}
        {/* <TopBarManualButton /> */}
        <TopBarImportButton />
        <TopBarExportButton />
      </div>
      <div className="h-full mx-6 border-solid border-l-[1px] border-foreground/10" />
      <TopBarAvatarMenu />
    </div>
  );
};
