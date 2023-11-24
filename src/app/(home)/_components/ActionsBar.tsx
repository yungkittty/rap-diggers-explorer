import { Icon } from "@/app/_components/Icon";
import { Button } from "@/app/_components/ui/button";
import { cn } from "@/app/_libs/shadcn";

type ActionsBarButtonProps = {
  className?: string;
  classNameIcon?: string;
  iconName: string;
  size?: "large" | "medium" | "small";
};
const ActionsBarButton = (props: ActionsBarButtonProps) => {
  const {
    className,
    classNameIcon: _classNameIcon = "",
    size = "large",
    iconName,
  } = props;

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
      className={cn(
        "rounded-full h-[unset] aspect-square",
        className,
        classNameButton,
      )}
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
  return (
    <div className="flex flex-row space-x-3 sm:space-x-6 justify-center items-center py-12">
      <ActionsBarButton
        className="bg-gray-300 hover:bg-gray-300/90" //
        iconName="check"
        size="small"
      />
      <ActionsBarButton
        className="bg-green-400 hover:bg-green-400/90" //
        classNameIcon="relative bottom-[-2px]"
        iconName="heart"
      />
      <ActionsBarButton
        className="bg-orange-400 hover:bg-orange-400/90" //
        iconName="time"
        size="medium"
      />
      <ActionsBarButton
        className="bg-red-400 hover:bg-red-400/90" //
        classNameIcon="relative bottom-[-2px]"
        iconName="dislike"
      />
      <ActionsBarButton
        className="bg-gray-300 hover:bg-gray-300/90" //
        iconName="close"
        size="small"
      />
    </div>
  );
};
