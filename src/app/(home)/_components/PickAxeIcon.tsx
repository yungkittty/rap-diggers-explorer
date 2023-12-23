"use client";

import { Image } from "@/app/_components/Image";
import { cn } from "@/app/_libs/shadcn";
import PickAxeImage from "./_assets/pickaxe_32x32.png";

type PickAxeIconProps = {
  size?: "small" | "large";
};
export const PickAxeIcon = (props: PickAxeIconProps) => {
  const { size = "large" } = props;
  return (
    <Image
      className={cn({ "scale-75": size === "large" })}
      src={PickAxeImage}
      height={23}
      width={23}
      alt="" // @TODO - ...
      priority
      loading="eager"
    />
  );
};
