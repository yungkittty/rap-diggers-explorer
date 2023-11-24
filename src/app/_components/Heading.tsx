import { PropsWithChildren } from "react";
import { cn } from "../_libs/shadcn";

export type HeadingProps = PropsWithChildren & {
  className?: string;
};

export const Heading = (props: HeadingProps) => {
  const { className, ...others } = props;
  return (
    <div
      className={cn(
        "select-none font-benzin text-xl font-bold uppercase leading-none tracking-tight",
        className,
      )}
      {...others}
    />
  );
};
