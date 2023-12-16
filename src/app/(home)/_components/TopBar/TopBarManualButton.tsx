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
import { PropsWithChildren } from "react";

type ManualLineProps = PropsWithChildren & {
  iconName: string;
};
const ManualLine = (props: ManualLineProps) => {
  const { iconName, children } = props;
  return (
    <div className="flex flex-row items-center text-base text-primary">
      <Icon name={iconName} filled />
      <Text className="mx-2.5">=</Text>
      <Text>{children}</Text>
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
            <div className="absolute right-[-3.5px] top-[-2.5px] h-3 aspect-square rounded-full bg-foreground" />
          ) : null}
          <Button variant="outline" size="icon" onClick={handleClick}>
            <Icon name="book" filled />
          </Button>
        </div>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            <Heading>Manuel d’utilisation</Heading>
          </DialogTitle>
        </DialogHeader>
        <div className="flex flex-col gap-1.5">
          {/* prettier-ignore */}
          <ManualLine iconName="check">
            Je <span className="italic mr-0.5">creuse</span> l’artiste.
          </ManualLine>
          {/* prettier-ignore */}
          <ManualLine iconName="heart">
            Je <span className="italic mr-0.5">creuse</span> l’artiste et le sauvegarde pour l’export.
          </ManualLine>
          {/* prettier-ignore */}
          <ManualLine iconName="time">
            Je passe l’artiste pour une durée de 6 mois.
          </ManualLine>
          {/* prettier-ignore */}
          <ManualLine iconName="dislike"><ManualLine iconName="close">
            Je passe l’artiste pour une durée de 1 an.
          </ManualLine></ManualLine>
          {/* prettier-ignore */}
          <ManualLine iconName="loop-left">
            J’importe les nouveaux artistes de ma playlist.
          </ManualLine>
          {/* prettier-ignore */}
          <ManualLine iconName="download">
            J’exporte les artistes sauvegardés depuis le dernier export.
          </ManualLine>
          {/* prettier-ignore */}
          <Text className="mt-2 text-sm text-primary/50">
            <span className="italic">creuser</span><span className="ml-1.5 mr-2">:</span>chercher les artistes similaires
          </Text>
        </div>
      </DialogContent>
    </Dialog>
  );
};
