"use client";

import { Image } from "@/app/_components/Image";
import { cn } from "@/app/_libs/shadcn";
import PickAxeImage from "./_assets/pickaxe_32x32.png";

// @TODO - This should be improved!
type PickAxeDisIconProps = {
  size?: "small" | "large";
};
export const PickAxeDisIcon = (props: PickAxeDisIconProps) => {
  const { size = "large" } = props;
  return (
    <div className="relative flex justify-center items-center">
      <Image
        className={cn({ "scale-75": size === "large" })}
        src={PickAxeImage}
        height={23}
        width={23}
        alt="" // @TODO - ...
        priority
        loading="eager"
      />
      <div
        className={cn(
          "absolute w-0.5 h-[22px] bg-foreground rotate-[-45deg] ml-[-2px] mb-[-2px]", //
          { "scale-75": size === "small" },
        )}
      />
      <div
        className={cn(
          "absolute w-0.5 h-[22px] bg-background rotate-[-45deg] mt-[-1px] mr-[-1px]",
          { "scale-75 mt-[0px] mr-[0px]": size === "small" },
        )}
      />
    </div>
  );
};
