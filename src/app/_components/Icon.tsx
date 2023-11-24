import { cn } from "../_libs/shadcn";

type IconProps = {
  className?: string;
  name: string;
  filled?: boolean;
};

export const Icon = (props: IconProps) => {
  const { className, name, filled = true } = props;
  return (
    <i
      className={cn(
        `ri-${name}-${filled ? "fill" : "line"} text-2xl`, //
        className,
      )}
    />
  );
};
