"use client";

import { Icon } from "@/app/_components/Icon";
import { Text } from "@/app/_components/Text";
import { Button } from "@/app/_components/ui/button";
import { useToast } from "@/app/_components/ui/use-toast";
import { cn } from "@/app/_libs/shadcn";
import { POST_PlaylistsImportOutput } from "@/app/_types/api";
import useSWRMutation from "swr/mutation";

const importPlaylists = async (
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
  const { toast } = useToast();
  const { trigger, isMutating } = useSWRMutation(
    "/api/playlists/import", //
    importPlaylists,
  );
  const handleClick = async () => {
    try {
      const data = await trigger();
      if (!data.error) {
        // @TODO - ...
        toast({
          title: "",
          description: "",
        });
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
  };

  return (
    <Button variant="secondary" onClick={handleClick}>
      <div
        className={cn(
          "flex flex-row items-center", //
          { "opacity-0": isMutating },
        )}
      >
        <Text className="font-bold uppercase leading-none">réimporter</Text>
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
  );
};
