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
import { CustomError } from "@/app/_utils/errors";
import { ComponentType, useContext } from "react";
import useSWRMutation from "swr/mutation";
import {
  ArtistStatus,
  ArtistsStatusContext,
} from "../_contexts/ArtistStatusContext";
import {
  ARTIST_CARDS_CAROUSEL_IMMUTABLE_SIZE,
  ARTIST_CARDS_CAROUSEL_OFFSET,
} from "./ArtistCardsCarousel";
import { TracksContext } from "./BottomBar/_contexts/TracksContext";
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
  const options: RequestInit = {
    method: "PUT",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      action,
    }),
  };
  const response = await fetch(url, options);
  const data = await response.json();
  if (data.error !== undefined) {
    throw new CustomError(data.error);
  }
  return data;
};

type ActionsBarProps = {};
export const ActionsBar = (props: ActionsBarProps) => {
  const {
    artistStatusCurrent, //
    artistStatusIndex,
    setArtistStatus,
    previousArtistStatus,
    nextArtistStatus,
    commitArtistStatus,
  } = useContext(ArtistsStatusContext);

  const {
    isLoading, //
    trackCurrent,
  } = useContext(TracksContext);

  const handleSuccess = (data: PUT_ArtistStatusOutput) => {
    commitArtistStatus();

    const { data: artistStatusIds = [] } = data;
    if (!artistStatusIds.length) {
      return;
    }

    setArtistStatus((prevArtistStatus) => {
      const nextArtistStatusPast = prevArtistStatus.slice(
        0, //
        artistStatusIndex + ARTIST_CARDS_CAROUSEL_OFFSET,
      );
      const nextArtistStatusImmutable = prevArtistStatus.slice(
        artistStatusIndex + ARTIST_CARDS_CAROUSEL_OFFSET,
        artistStatusIndex +
          ARTIST_CARDS_CAROUSEL_OFFSET +
          ARTIST_CARDS_CAROUSEL_IMMUTABLE_SIZE,
      );
      const nextArtistStatusImmutableIds = nextArtistStatusImmutable.map(
        (artistStatus) => (artistStatus ? artistStatus.id : null),
      );
      const prevArtistStatusFuture = prevArtistStatus.slice(
        artistStatusIndex +
          ARTIST_CARDS_CAROUSEL_OFFSET +
          ARTIST_CARDS_CAROUSEL_IMMUTABLE_SIZE,
      );
      const nextArtistStatusFutureIds = artistStatusIds.filter(
        (artistStatusId) =>
          !nextArtistStatusImmutableIds.includes(artistStatusId),
      );

      const nextArtistStatusFutureSwapped: ArtistStatus[] = [];
      for (
        let nextArtistStatusFutureIdIndex = 0;
        nextArtistStatusFutureIdIndex < nextArtistStatusFutureIds.length;
        nextArtistStatusFutureIdIndex += 1
      ) {
        const nextArtistStatusFutureId =
          nextArtistStatusFutureIds[nextArtistStatusFutureIdIndex];
        const nextArtistStatusFuture = prevArtistStatusFuture.find(
          (artistStatus) => {
            if (!artistStatus) {
              return false;
            }
            return artistStatus.id === nextArtistStatusFutureId;
          },
        );
        if (!nextArtistStatusFuture) {
          break;
        }

        const prevArtistStatusFutureSwapped =
          prevArtistStatusFuture[nextArtistStatusFutureIdIndex];
        const nextArtistStatusFutureRenderId =
          prevArtistStatusFutureSwapped?.renderId || window.crypto.randomUUID();

        nextArtistStatusFutureSwapped.push({
          ...nextArtistStatusFuture,
          renderId: nextArtistStatusFutureRenderId,
        });
      }

      const nextArtistStatus = [
        ...nextArtistStatusPast,
        ...nextArtistStatusImmutable,
        ...nextArtistStatusFutureSwapped,
      ];
      return nextArtistStatus;
    });
  };

  const { toast } = useToast();
  const handleError = (error: CustomError) => {
    previousArtistStatus();

    switch (error.code) {
      case ErrorCode.USER_FORBIDDEN_MAX_REQUESTS: {
        toast({
          variant: "destructive",
          title: "Erreur",
          description: "Notre service est surchargé. Réessaie dans quelques minutes.", // prettier-ignore
        });
        break;
      }
      default: {
        toast({
          variant: "destructive",
          title: "Erreur",
          description: "Une erreur inconnue est survenu. Réessaie plus tard ou contacte-nous directement si le problème persiste.", // prettier-ignore
        });
        break;
      }
    }
  };

  const artistStatusId = artistStatusCurrent?.id || null;
  const configuration = {
    throwOnError: false,
    onSuccess: handleSuccess,
    onError: handleError,
  };
  const { trigger } = useSWRMutation(
    artistStatusId ? `/api/artist-status/${artistStatusId}` : null,
    putArtistStatus,
    configuration,
  );

  const getHandleClick =
    (action: PUT_ArtistStatusInput["action"]) => async () => {
      if (!artistStatusId) {
        return;
      }
      nextArtistStatus();
      await trigger({
        action: !isLoading && !trackCurrent ? "skipped" : action,
      });
    };

  return (
    <div className="flex flex-row space-x-3 sm:space-x-6 justify-center items-center pb-12">
      <ActionButton
        iconComponent={PickAxeIcon}
        size="small"
        onClick={getHandleClick("dig-in")}
      />
      <ActionButton
        classNameIcon="relative bottom-[-2px] left-[-0.5px]"
        iconName="heart"
        onClick={getHandleClick("like")}
      />
      <ActionButton
        iconName="time"
        size="medium"
        onClick={getHandleClick("snooze")}
      />
      <ActionButton
        classNameIcon="relative bottom-[-1px] left-[-1px]"
        iconName="dislike"
        onClick={getHandleClick("dislike")}
      />
      <ActionButton
        iconName="close"
        size="small"
        onClick={getHandleClick("dig-out")}
      />
    </div>
  );
};
