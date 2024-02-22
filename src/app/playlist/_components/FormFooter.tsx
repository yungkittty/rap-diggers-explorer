"use client";

import { Icon } from "@/app/_components/Icon";
import { InputPlaylist } from "@/app/_components/InputPlaylist";
import { useToast } from "@/app/_components/ui/use-toast";
import { ErrorCode } from "@/app/_constants/error-code";
import { SPOTIFY_PLAYLIST_MAX_TRACKS } from "@/app/_constants/spotify";
import type {
  POST_PlaylistsCreateAndImportInput,
  POST_PlaylistsCreateAndImportOutput,
} from "@/app/_types/api";
import { CustomError } from "@/app/_utils/errors";
import { useRouter } from "next/navigation";
import React, { useState } from "react";
import useSWRMutation from "swr/mutation";
import { Text } from "../../_components/Text";
import { Button } from "../../_components/ui/button";
import { CardFooter } from "../../_components/ui/card";

const postPlaylists = async (
  url: string, //
  { arg: { spotifyPlaylistId } }: { arg: POST_PlaylistsCreateAndImportInput },
): Promise<POST_PlaylistsCreateAndImportOutput> => {
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
  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setValue(event.target.value);
  };

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
          description: `Ta playlist contient plus de ${SPOTIFY_PLAYLIST_MAX_TRACKS} morceaux !`,
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

  const configutation = {
    throwOnError: false,
    onSuccess: handleSuccess,
    onError: handleError,
  };
  const { trigger, isMutating } = useSWRMutation(
    "/api/playlists/create-and-import", //
    postPlaylists,
    configutation,
  );

  const isDisabled = isMutating || !Boolean(value);
  const handleClick = async () => {
    if (isDisabled) {
      return;
    }
    await trigger({ spotifyPlaylistId: value });
  };

  return (
    <CardFooter className="flex flex-col">
      <InputPlaylist
        className="w-full" //
        value={value}
        onChange={handleChange}
      />
      <Button
        className="mt-2.5 w-full"
        size="lg"
        onClick={handleClick}
        disabled={isDisabled}
      >
        {!isMutating ? (
          <Text className="font-bold uppercase leading-none">confirmer</Text>
        ) : (
          <Icon className="animate-spin" name="loader-4" />
        )}
      </Button>
    </CardFooter>
  );
};
