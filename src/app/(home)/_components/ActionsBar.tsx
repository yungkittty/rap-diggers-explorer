"use client";

import { Icon } from "@/app/_components/Icon";
import { Button, ButtonProps } from "@/app/_components/ui/button";
import { cn } from "@/app/_libs/shadcn";

type ActionButtonProps = {
  className?: string;
  classNameIcon?: string;
  iconName: string;
  size?: "large" | "medium" | "small";
  onClick: () => void;
};
const ActionButton = (props: ActionButtonProps) => {
  const {
    className,
    classNameIcon: _classNameIcon = "",
    size = "large",
    iconName,
    onClick,
  } = props;

  let variant: ButtonProps["variant"] = "secondary";
  if (size === "small") {
    variant = "outline";
  }

  const classNameButton = cn({
    "w-20": size === "large",
    "w-16": size === "medium",
    "w-12": size === "small",
  });
  const classNameIcon = cn(_classNameIcon, {
    "text-4xl": size === "large",
    "text-3xl": size === "medium",
    "text-2xl": size === "small",
  });

  return (
    <Button
      variant={variant}
      className={cn(
        "rounded-full h-[unset] aspect-square",
        className,
        classNameButton,
      )}
      onClick={onClick}
    >
      <Icon
        className={classNameIcon} //
        name={iconName}
        filled
      />
    </Button>
  );
};

type ActionsBarProps = {};
export const ActionsBar = (props: ActionsBarProps) => {
  const handleClick = () => {};
  return (
    <div className="flex flex-row space-x-3 sm:space-x-6 justify-center items-center py-12">
      <ActionButton
        iconName="check" //
        size="small"
        onClick={handleClick}
      />
      <ActionButton
        classNameIcon="relative bottom-[-2px]"
        iconName="heart"
        onClick={handleClick}
      />
      <ActionButton
        iconName="time" //
        size="medium"
        onClick={handleClick}
      />
      <ActionButton
        classNameIcon="relative bottom-[-1px] left-[-1px]"
        iconName="dislike"
        onClick={handleClick}
      />
      <ActionButton
        iconName="close" //
        size="small"
        onClick={handleClick}
      />
    </div>
  );
};
