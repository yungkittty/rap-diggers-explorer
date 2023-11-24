import { Icon } from "@/app/_components/Icon";
import { Button } from "@/app/_components/ui/button";

type BottomBarPlayerProps = {
  className?: string;
};

export const BottomBarPlayer = (props: BottomBarPlayerProps) => {
  return (
    <div className="flex flex-row items-center justify-center space-x-6">
      <Button variant="ghost" size="icon">
        <Icon name="skip-back" />
      </Button>
      <Button className="rounded-full w-16 h-[unset] aspect-square">
        <Icon className="relative right-[-2.5px] text-5xl" name="play" />
      </Button>
      <Button variant="ghost" size="icon">
        <Icon name="skip-forward" />
      </Button>
    </div>
  );
};
