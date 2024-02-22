"use client";

import { Icon } from "@/app/_components/Icon";
import { Text } from "@/app/_components/Text";
import { Button } from "@/app/_components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/app/_components/ui/tooltip";
import { useToast } from "@/app/_components/ui/use-toast";
import { ErrorCode } from "@/app/_constants/error-code";
import { SPOTIFY_PLAYLIST_MAX_TRACKS } from "@/app/_constants/spotify";
import { cn } from "@/app/_libs/shadcn";
import {
  GET_PlaylistsIsImportableOutput,
  POST_PlaylistsImportOutput,
} from "@/app/_types/api";
import { CustomError } from "@/app/_utils/errors";
import { useState } from "react";
import { useSWRConfig } from "swr";
import useSWRImmutable from "swr/immutable";
import useSWRMutation from "swr/mutation";
import { TopBarImportDialog } from "./TopBarImportDialog";

const getPlaylistsIsImportable = async (
  url: string,
): Promise<GET_PlaylistsIsImportableOutput> => {
  const options: RequestInit = {
    method: "GET",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
    },
  };
  const response = await fetch(url, options);
  const data = await response.json();
  if (data.error !== undefined) {
    throw new CustomError(data.error);
  }
  return data;
};

const postPlaylistsImport = async (
  url: string,
): Promise<POST_PlaylistsImportOutput> => {
  const options: RequestInit = {
    method: "POST",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
    },
  };
  const response = await fetch(url, options);
  const data = await response.json();
  if (data.error !== undefined) {
    throw new CustomError(data.error);
  }
  return data;
};

export const TopBarImportButton = () => {
  const { data, mutate } = useSWRImmutable(
    "/api/playlists/is-importable", //
    getPlaylistsIsImportable,
    { shouldRetryOnError: false },
  );
  const isImportable = data?.isImportable;

  const [isMutating, setIsMutating] = useState(false);

  const { toast } = useToast();
  const { mutate: mutateGlobal } = useSWRConfig();

  const handleSuccess = async () => {
    await Promise.allSettled([
      mutate(),
      mutateGlobal(["/api/artist-status", null]),
    ]);
    setIsMutating(false);
    toast({
      title: "Succès 🚀",
      description: "Tes propositions ont été mises à jour !",
    });
  };

  const handleError = (error: CustomError) => {
    setIsMutating(false);
    switch (error.code) {
      case ErrorCode.USER_FORBIDDEN_MAX_TRACKS: {
        toast({
          title: "Erreur",
          description: `Une playlist contient plus de ${SPOTIFY_PLAYLIST_MAX_TRACKS} morceaux !`,
        });
        break;
      }
      case ErrorCode.USER_FORBIDDEN_MAX_REQUESTS: {
        toast({
          variant: "destructive",
          title: "Erreur",
          description: "Notre service est surchargé. Réessaie dans quelques secondes.", // prettier-ignore
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

  const configuration = {
    throwOnError: false,
    onSuccess: handleSuccess,
    onError: handleError,
  };
  const { trigger } = useSWRMutation(
    "/api/playlists/import", //
    postPlaylistsImport,
    configuration,
  );

  const isDisabled = isMutating || isImportable !== true;
  const handleClick = async () => {
    if (isDisabled) {
      return;
    }
    setIsMutating(true);
    await trigger();
  };

  return (
    <div className="flex flex-row items-center">
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              // This allows tooltip to be triggered!
              className={cn(
                { "opacity-50 cursor-default": isDisabled }, //
              )}
              variant="secondary"
              onClick={handleClick}
              // disabled={isDisabled}
            >
              <div
                className={cn(
                  "flex flex-row items-center", //
                  { "opacity-0": isMutating },
                )}
              >
                <Text className="font-bold uppercase leading-none">
                  mettre-à-jour
                </Text>
              </div>
              <Icon
                className={cn(
                  "absolute animate-spin", //
                  { "opacity-0": !isMutating },
                )}
                name="loader-4"
              />
            </Button>
          </TooltipTrigger>
          <TooltipContent
            side="bottom" //
            sideOffset={4 * 1.5}
            align="center"
            alignOffset={-2}
          >
            {!isDisabled ? (
              <Text className="text-sm text-primary">
                Mets à jour tes propositions avec tes playlists.
              </Text>
            ) : (
              <Text className="text-sm text-primary">
                Tu peux mettre à jour une fois par jour max.
              </Text>
            )}
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
      <TopBarImportDialog>
        <Button
          className="ml-1.5"
          variant="secondary"
          size="icon"
          disabled={isMutating}
        >
          <Icon className="text-lg" name="play-list-add" />
        </Button>
      </TopBarImportDialog>
    </div>
  );
};
