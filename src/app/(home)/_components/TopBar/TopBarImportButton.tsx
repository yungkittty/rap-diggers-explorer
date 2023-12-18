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
import useSWRImmutable from "swr/immutable";
import useSWRMutation from "swr/mutation";

const getPlaylistsIsImportable = async (
  url: string,
): Promise<GET_PlaylistsIsImportableOutput> => {
  const fetchOptions: RequestInit = {
    method: "GET",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
    },
  };
  return fetch(url, fetchOptions).then((response) => response.json());
};

const postPlaylistsImport = async (
  url: string,
): Promise<POST_PlaylistsImportOutput> => {
  const fetchOptions: RequestInit = {
    method: "POST",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
    },
  };
  return fetch(url, fetchOptions).then((response) => response.json());
};

export const TopBarImportButton = () => {
  const { data, mutate } = useSWRImmutable(
    "/api/playlists/is-importable", //
    getPlaylistsIsImportable,
    { shouldRetryOnError: false },
  );
  const isImportable = data?.isImportable;

  const { toast } = useToast();
  const { trigger, isMutating } = useSWRMutation(
    "/api/playlists/import", //
    postPlaylistsImport,
  );
  const handleClick = async () => {
    if (isImportable !== true || isMutating) {
      return;
    }
    try {
      const data = await trigger();
      if (!data.error) {
        await mutate({ isImportable: false });
        toast({
          title: "Succès 🚀",
          description: "Tes nouveaux artistes ont été importés !",
        });
        return;
      }
      switch (data.error) {
        case ErrorCode.USER_FORBIDDEN_MAX_TRACKS: {
          toast({
            title: "Erreur",
            description: "Ta playlist contient plus de 1000 titres !",
          });
          return;
        }
        case ErrorCode.USER_FORBIDDEN_MAX_REQUESTS: {
          toast({
            variant: "destructive",
            title: "Erreur",
            description: "Notre service est surchargé. Réessaie dans quelques minutes.", // prettier-ignore
          });
          return;
        }
      }
    } catch (error) {
      if (process.env.VERCEL_ENV !== "production") {
        console.log(error);
      }
    }
    toast({
      variant: "destructive",
      title: "Erreur",
      description: "Une erreur inconnue est survenu. Réessaie plus tard ou contacte-nous directement si le problème persiste.", // prettier-ignore
    });
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
