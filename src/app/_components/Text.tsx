import { PropsWithChildren } from "react";
import { cn } from "../_libs/shadcn";

export type TextProps = PropsWithChildren & {
  className?: string;
};

export const Text = (props: TextProps) => {
  const { className, ...others } = props;
  return (
    <div
      {...others} //
      className={cn(
        className,
        "select-none font-helvetica leading-none tracking-tight", //
      )}
    />
  );
};
