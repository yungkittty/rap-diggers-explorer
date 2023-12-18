"use client";

import { Icon } from "@/app/_components/Icon";
import { useToast } from "@/app/_components/ui/use-toast";
import { ErrorCode } from "@/app/_constants/error-code";
import type {
  POST_PlaylistsInput,
  POST_PlaylistsOutput,
} from "@/app/_types/api";
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
  const fetchOptions: RequestInit = {
    method: "POST", //
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      spotifyPlaylistId,
    }),
  };
  return fetch(url, fetchOptions).then((response) => response.json());
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
  const { toast } = useToast();
  const { trigger, isMutating } = useSWRMutation(
    "/api/playlists", //
    postPlaylists,
  );
  const handleClick = async () => {
    if (!value || isMutating) {
      return;
    }
    try {
      const data = await trigger({ spotifyPlaylistId: value });
      if (!data.error) {
        router.replace("/");
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
      description: "Réessaie plus tard ou contacte-nous directement si le problème persiste.", // prettier-ignore
    });
  };

  const isDisabled = isMutating || !Boolean(value);
  return (
    <CardFooter className="flex flex-col">
      <div className="relative w-full">
        <div className="absolute flex h-full w-1/2 items-center justify-center rounded-l-md border border-solid border-input bg-primary/5">
          <Text className="text-base text-primary/50">
            https://open.spotify.com/playlist/
          </Text>
        </div>
        <Input
          className="pl-[calc(50%+12px)] text-base text-primary"
          value={value}
          onChange={handleChange}
          spellCheck={false}
        />
      </div>
      <Button
        className="mt-3.5 w-full"
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
