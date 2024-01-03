"use client";

import { Icon } from "@/app/_components/Icon";
import { useToast } from "@/app/_components/ui/use-toast";
import { ErrorCode } from "@/app/_constants/error-code";
import type {
  POST_PlaylistsInput,
  POST_PlaylistsOutput,
} from "@/app/_types/api";
import { CustomError } from "@/app/_utils/errors";
import { useRouter } from "next/navigation";
import React, { useCallback, useState } from "react";
import useSWRMutation from "swr/mutation";
import { Text } from "../../_components/Text";
import { Button } from "../../_components/ui/button";
import { CardFooter } from "../../_components/ui/card";
import { Input } from "../../_components/ui/input";

const postPlaylists = async (
  url: string, //
  { arg: { spotifyPlaylistId } }: { arg: POST_PlaylistsInput },
): Promise<POST_PlaylistsOutput> => {
  const options: RequestInit = {
    method: "POST", //
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      spotifyPlaylistId,
    }),
  };
  const response = await fetch(url, options);
  const data = await response.json();
  if (data.error !== undefined) {
    throw new CustomError(data.error);
  }
  return data;
};

export const FormFooter = () => {
  const [value, setValue] = useState("");
  const handleChange = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      setValue(event.target.value);
    },
    [],
  );

  const router = useRouter();
  const handleSuccess = () => {
    router.replace("/");
  };

  const { toast } = useToast();
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

  const configutation = {
    throwOnError: false,
    onSuccess: handleSuccess,
    onError: handleError,
  };
  const { trigger, isMutating } = useSWRMutation(
    "/api/playlists", //
    postPlaylists,
    configutation,
  );

  const handleClick = async () => {
    if (!value || isMutating) {
      return;
    }
    await trigger({ spotifyPlaylistId: value });
  };

  const isDisabled = isMutating || !Boolean(value);
  return (
    <CardFooter className="flex flex-col">
      <div className="relative w-full">
        <div className="absolute flex h-full w-1/2 items-center justify-center rounded-l-md border border-solid border-input bg-primary/5">
          <Text className="text-base text-primary/60">
            https://open.spotify.com/playlist/
          </Text>
        </div>
        <Input
          className="pl-[calc(50%+12px)] text-base text-primary focus-visible:ring-ring/90"
          value={value}
          onChange={handleChange}
          spellCheck={false}
        />
      </div>
      {/* <div className="flex flex-row items-center w-full mt-1.5 text-sm text-foreground/90">
        <Checkbox id="playlist" />
        <label className="ml-1.5" htmlFor="playlist">
          <Text className="leading-none">
            J’aime l’intégralité des artistes de cette playlist
          </Text>
        </label>
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger>
              <Icon className="ml-1 text-base" name="question" filled={false} />
            </TooltipTrigger>
            <TooltipContent>
              <Text className="text-primary text-base">
                Si tu coches cette case, nous irons automatiquement creuser les
                artistes de cette playlist
              </Text>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider> 
      </div> */}
      <Button
        className="mt-3 w-full"
        size="lg"
        onClick={handleClick}
        disabled={isDisabled}
      >
        {!isMutating ? (
          <Text className="font-bold uppercase leading-none">importer</Text>
        ) : (
          <Icon className="animate-spin" name="loader-4" />
        )}
      </Button>
    </CardFooter>
  );
};
