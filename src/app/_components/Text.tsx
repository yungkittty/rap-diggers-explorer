import { PropsWithChildren } from "react";
import { cn } from "../_libs/shadcn";

export type TextProps = PropsWithChildren & {
  className?: string;
};

export const Text = (props: TextProps) => {
  const { className, ...others } = props;
  return (
    <p
      className={cn(
        "select-none font-helvetica leading-snug tracking-tight", //
        className,
      )}
      {...others} //
    />
  );
};
