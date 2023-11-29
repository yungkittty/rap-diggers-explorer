"use client";

import { Icon } from "@/app/_components/Icon";
import { useToast } from "@/app/_components/ui/use-toast";
import { useRouter } from "next/navigation";
import React, { useCallback, useState } from "react";
import useSWRMutation from "swr/mutation";
import { Text } from "../../_components/Text";
import { Button } from "../../_components/ui/button";
import { CardFooter } from "../../_components/ui/card";
import { Input } from "../../_components/ui/input";

const createPlaylist = async (
  url: string, //
  { arg: { playlistId } }: { arg: { playlistId: string } },
): Promise<{ error?: "string" | null }> => {
  const fetchOptions = {
    method: "POST", //
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      playlistId,
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
    createPlaylist,
  );
  const handleClick = useCallback(
    async () => {
      try {
        const data = await trigger({ playlistId: value });
        if (!data.error) {
          router.replace("/");
          return;
        }
      } catch (error) {
        if (process.env.VERCEL_ENV !== "production") {
          console.log(error);
        }
      }
      // @TODO - ...
      toast({
        title: "",
        description: "",
      });
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [value],
  );

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
        />
      </div>
      <Button
        className="mt-3 w-full"
        size="lg"
        onClick={handleClick}
        disabled={isDisabled}
      >
        {!isMutating ? (
          <Text className="font-bold uppercase">importer</Text>
        ) : (
          <Icon className="animate-spin" name="loader-4" />
        )}
      </Button>
    </CardFooter>
  );
};
