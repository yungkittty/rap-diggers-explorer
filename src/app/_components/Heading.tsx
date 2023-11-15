import { PropsWithChildren } from "react";
import { cn } from "../_libs/shadcn";
import { twMerge } from "tailwind-merge";

export type HeadingProps = PropsWithChildren & {
  className?: string;
};

export const Heading = (props: HeadingProps) => {
  const { className, ...others } = props;
  return (
    <div
      {...others}
      className={cn(
        className,
        "select-none font-benzin font-bold uppercase leading-none tracking-tight",
      )}
    />
  );
};
