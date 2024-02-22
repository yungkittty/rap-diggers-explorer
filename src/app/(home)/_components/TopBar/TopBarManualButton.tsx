"use client";

import { Heading } from "@/app/_components/Heading";
import { Icon } from "@/app/_components/Icon";
import { Text } from "@/app/_components/Text";
import { Button } from "@/app/_components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/app/_components/ui/dialog";
import { useLocalStorage } from "@uidotdev/usehooks";
import { ComponentType, PropsWithChildren } from "react";
import { PickAxeIcon } from "../PickAxeIcon";

type ManualLineProps = PropsWithChildren & {
  iconName?: string;
  iconComponent?: ComponentType<{ size?: "small" | "large" }>;
};
const ManualLine = (props: ManualLineProps) => {
  const {
    iconName,
    iconComponent: IconComponent = () => null,
    children,
  } = props;
  return (
    <div className="flex flex-row items-center text-base text-primary">
      {iconName ? <Icon name={iconName} filled /> : <IconComponent />}
      <Text className="ml-3">{children}</Text>
    </div>
  );
};

const MANUEL_BUTTON_LOCAL_STORAGE_KEY = "MANUEL_BUTTON_KEY_V1";
export const TopBarManualButton = () => {
  const [isShown, setIsShown] = useLocalStorage(
    MANUEL_BUTTON_LOCAL_STORAGE_KEY, //
    true,
  );
  const handleClick = () => {
    setIsShown(false);
  };
  return (
    <Dialog>
      <DialogTrigger asChild>
        <div className="relative">
          {isShown ? (
            <div className="absolute right-[-3.5px] top-[-2.5px] h-3 aspect-square rounded-full shadow-xs bg-foreground" />
          ) : null}
          <Button variant="outline" size="icon" onClick={handleClick}>
            <Icon className="text-xl" name="book" filled />
          </Button>
        </div>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            <Heading>Manuel d’utilisation</Heading>
          </DialogTitle>
        </DialogHeader>
        <div className="flex flex-col gap-1.5 mt-1">
          <ManualLine iconComponent={PickAxeIcon}>
            Je connais, et j’aime l’artiste.
          </ManualLine>
          <ManualLine iconName="heart">
            Je ne connais pas, mais j’aime l’artiste.
          </ManualLine>
          <ManualLine iconName="time">
            Je ne connais pas, mais je pourrais aimer l’artiste.
          </ManualLine>
          <ManualLine iconName="dislike">
            Je ne connais pas, et je n’aime pas l’artiste.
          </ManualLine>
          <ManualLine iconName="close">
            Je connais, mais je n’aime pas l’artiste.
          </ManualLine>
        </div>
      </DialogContent>
    </Dialog>
  );
};
