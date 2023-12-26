"use client";

import { Icon } from "@/app/_components/Icon";
import { Button, ButtonProps } from "@/app/_components/ui/button";
import { useToast } from "@/app/_components/ui/use-toast";
import { ErrorCode } from "@/app/_constants/error-code";
import { cn } from "@/app/_libs/shadcn";
import {
  PUT_ArtistStatusInput,
  PUT_ArtistStatusOutput,
} from "@/app/_types/api";
import { ComponentType, useContext } from "react";
import useSWRMutation from "swr/mutation";
import { ArtistsStatusContext } from "../_contexts/ArtistStatusContext";
import { PickAxeIcon } from "./PickAxeIcon";

type ActionButtonProps = {
  className?: string;
  classNameIcon?: string;
  iconName?: string;
  iconComponent?: ComponentType<{ size?: "small" | "large" }>;
  size?: "large" | "medium" | "small";
  onClick: () => void;
};
const ActionButton = (props: ActionButtonProps) => {
  const {
    className,
    classNameIcon: _classNameIcon = "",
    size = "large",
    iconName,
    iconComponent: IconComponent = () => null,
    onClick,
  } = props;

  let variant: ButtonProps["variant"] = "secondary";
  variant = "outline";

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
        "h-[unset] aspect-square rounded-full",
        className,
        classNameButton,
      )}
      onClick={onClick}
    >
      {iconName ? (
        <Icon
          className={classNameIcon} //
          name={iconName}
          filled
        />
      ) : (
        <IconComponent size="small" />
      )}
    </Button>
  );
};

const putArtistStatus = async (
  url: string,
  { arg: { action } }: { arg: PUT_ArtistStatusInput },
): Promise<PUT_ArtistStatusOutput> => {
  const fetchOptions = {
    method: "PUT",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      action,
    }),
  };
  return fetch(url, fetchOptions).then((response) => response.json());
};

type ActionsBarProps = {};
export const ActionsBar = (props: ActionsBarProps) => {
  const {
    artistStatusCurrent, //
    previousArtistStatus,
    nextArtistStatus,
  } = useContext(ArtistsStatusContext);

  const { toast } = useToast();
  const artistStatusId = artistStatusCurrent?.id || null;
  const { trigger } = useSWRMutation(
    artistStatusId ? `/api/artist-status/${artistStatusId}` : null, //
    putArtistStatus,
  );
  const getHandleClick =
    (action: PUT_ArtistStatusInput["action"]) => async () => {
      if (!artistStatusId) {
        return;
      }
      try {
        nextArtistStatus();
        const data = await trigger({ action });
        if (!data.error) {
          return;
        }
        switch (data.error) {
          case ErrorCode.USER_FORBIDDEN_MAX_REQUESTS: {
            toast({
              variant: "destructive",
              title: "Erreur",
              description: "Notre service est surchargé. Réessaie dans quelques minutes.", // prettier-ignore
            });
            break;
          }
        }
      } catch (error) {
        if (process.env.VERCEL_ENV !== "production") {
          console.log(error);
        }
        toast({
          variant: "destructive",
          title: "Erreur",
          description: "Une erreur inconnue est survenu. Réessaie plus tard ou contacte-nous directement si le problème persiste.", // prettier-ignore
        });
      }
      previousArtistStatus();
    };

  return (
    <div className="flex flex-row space-x-3 sm:space-x-6 justify-center items-center pb-12">
      <ActionButton
        // iconName="check" //
        iconComponent={PickAxeIcon}
        size="small"
        onClick={getHandleClick("dig-in")}
      />
      <ActionButton
        classNameIcon="relative bottom-[-2px] left-[-1px]"
        iconName="heart"
        onClick={getHandleClick("like")}
      />
      <ActionButton
        iconName="time" //
        size="medium"
        onClick={getHandleClick("snooze")}
      />
      <ActionButton
        classNameIcon="relative bottom-[-1px] left-[-1px]"
        iconName="dislike"
        onClick={getHandleClick("dislike")}
      />
      <ActionButton
        iconName="close" //
        // iconComponent={PickAxeDisIcon}
        size="small"
        onClick={getHandleClick("dig-out")}
      />
    </div>
  );
};
