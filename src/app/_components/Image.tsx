import type { ImageProps as NextImageProps } from "next/image";
import NextImage from "next/image";
import { cn } from "../_libs/shadcn";

export type ImageProps = NextImageProps;

export const Image = (props: ImageProps) => {
  const { className, ...others } = props;
  return (
    <NextImage
      className={cn(
        "select-none", //
        className,
      )}
      {...others}
    />
  );
};
