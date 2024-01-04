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
import { cn } from "@/app/_libs/shadcn";
import {
  GET_PlaylistsIsImportableOutput,
  POST_PlaylistsImportOutput,
} from "@/app/_types/api";
import { CustomError } from "@/app/_utils/errors";
import useSWRImmutable from "swr/immutable";
import useSWRMutation from "swr/mutation";

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

  const { toast } = useToast();

  const handleSuccess = () => {
    toast({
      title: "Succès 🚀",
      description: "Tes nouveaux artistes ont été importés !",
    });
    return;
  };

  const handleError = (error: CustomError) => {
    switch (error.code) {
      case ErrorCode.USER_FORBIDDEN_MAX_TRACKS: {
        toast({
          title: "Erreur",
          description: "Ta playlist contient plus de 1000 titres !",
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
  const { trigger, isMutating } = useSWRMutation(
    "/api/playlists/playlist", //
    postPlaylistsImport,
    configuration,
  );
  const handleClick = async () => {
    if (isImportable !== true || isMutating) {
      return;
    }
    await trigger();
    await mutate({ isImportable: false });
  };

  const isDisabled = isImportable !== true;
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            // This allows tooltip to be triggered!
            className={cn({ "opacity-50 cursor-default": isDisabled })}
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
                réimporter
              </Text>
              <Icon className="ml-2.5 text-lg" name="loop-left" />
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
        {isImportable === false ? (
          <TooltipContent align="end" sideOffset={2 * 4}>
            <Text className="text-primary text-base">
              Il est possible d’importer qu’une seul fois par jour
            </Text>
          </TooltipContent>
        ) : null}
      </Tooltip>
    </TooltipProvider>
  );
};
