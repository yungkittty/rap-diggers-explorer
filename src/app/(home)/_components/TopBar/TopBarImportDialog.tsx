"use client";

import { Heading } from "@/app/_components/Heading";
import { Icon } from "@/app/_components/Icon";
import { InputPlaylist } from "@/app/_components/InputPlaylist";
import { Text } from "@/app/_components/Text";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/app/_components/ui/avatar";
import { Button } from "@/app/_components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/app/_components/ui/dialog";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/app/_components/ui/tooltip";
import { useToast } from "@/app/_components/ui/use-toast";
import { ErrorCode } from "@/app/_constants/error-code";
import { SPOTIFY_PLAYLIST_MAX_TRACKS } from "@/app/_constants/spotify";
import { USER_MAX_PLAYLISTS } from "@/app/_constants/user";
import { cn } from "@/app/_libs/shadcn";
import {
  DELETE_PlaylistStatusOutput,
  GET_PlaylistStatusOutput,
  GET_PlaylistStatusOutputDataItem,
  POST_PlaylistStatusInput,
  POST_PlaylistStatusOutput,
} from "@/app/_types/api";
import { CustomError } from "@/app/_utils/errors";
import { PropsWithChildren, useState } from "react";
import useSWR, { SWRConfiguration, useSWRConfig } from "swr";
import useSWRMutation from "swr/mutation";

const deletePlaylistStatus = async (
  url: string,
): Promise<DELETE_PlaylistStatusOutput> => {
  const options: RequestInit = {
    method: "DELETE", //
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

type TopBarImportDialogItemProps = {
  playlistStatus: GET_PlaylistStatusOutputDataItem;
  playlistStatusIndex: number;
};
const TopBarImportDialogItem = (props: TopBarImportDialogItemProps) => {
  const { playlistStatus, playlistStatusIndex } = props;

  const [isMutating, setIsMutating] = useState(false);

  const { toast } = useToast();
  const { mutate: mutateGlobal } = useSWRConfig();

  const handleSuccess = async () => {
    await mutateGlobal(["/api/playlist-status", "GET"]);
    setIsMutating(false);
    toast({
      title: "Succès 🚀",
      description: "Tu es désabonné de la playlist !",
    });
  };

  const handleError = () => {
    setIsMutating(false);
    toast({
      variant: "destructive",
      title: "Erreur",
      description: "Une erreur inconnue est survenu. Réessaie plus tard ou contacte-nous directement si le problème persiste.", // prettier-ignore
    });
  };

  const playlistStatusId = playlistStatus.id;
  const configuration = {
    throwOnError: false,
    onSuccess: handleSuccess,
    onError: handleError,
  };
  const { trigger } = useSWRMutation(
    `/api/playlist-status/${playlistStatusId}`, //
    deletePlaylistStatus,
    configuration,
  );

  const handleClick = async () => {
    if (isMutating) {
      return;
    }
    setIsMutating(true);
    await trigger();
  };

  const {
    spotifyName, //
    spotifyOwnerName,
    spotifyTracksTotal,
    spotifyUrl,
    spotifyImageUrl,
  } = playlistStatus.playlist;
  return (
    <div className="flex flex-row items-center py-1.5 px-3 mb-3 border rounded-md">
      <Avatar>
        <AvatarImage src={spotifyImageUrl} />
        <AvatarFallback>{spotifyName}</AvatarFallback>
      </Avatar>
      <div className="flex flex-col ml-3">
        <div className="flex flex-row">
          <Text className="text-sm text-primary uppercase tracking-tight">
            {spotifyName}
          </Text>
          <a className="inline-flex ml-1.5" href={spotifyUrl} target="_blank">
            <Icon
              className="text-xl text-primary hover:text-spotify transition-colors leading-none"
              name="spotify"
            />
          </a>
        </div>
        <Text className="text-primary/60 tracking-tight">
          <span className="text-xs uppercase">{spotifyOwnerName}</span>
          <span className="text-sm"> • </span>
          <span className="text-sm">{spotifyTracksTotal} morceaux</span>
        </Text>
      </div>
      {playlistStatusIndex ? (
        <Button
          className="ml-auto"
          variant="ghost"
          size="icon"
          onClick={handleClick}
        >
          {!isMutating ? (
            <Icon className="text-xl" name="close" />
          ) : (
            <Icon className="text-xl  animate-spin" name="loader-4" />
          )}
        </Button>
      ) : null}
    </div>
  );
};

const getPlaylistStatus = async ([url]: [string, string]): //
Promise<GET_PlaylistStatusOutput> => {
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

const postPlaylistStatus = async (
  [url]: [string, string],
  { arg: { spotifyPlaylistId } }: { arg: POST_PlaylistStatusInput },
): Promise<POST_PlaylistStatusOutput> => {
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

type TopBarImportDialogProps = PropsWithChildren;
export const TopBarImportDialog = (props: TopBarImportDialogProps) => {
  const { children } = props;

  const [isOpen, setIsOpen] = useState(false);
  const handleOpenChange = (isOpen_: boolean) => {
    setIsOpen(isOpen_);
  };
  const handleOpenAutoFocus = (event: Event) => {
    event.preventDefault();
  };

  const configuration: SWRConfiguration = {
    shouldRetryOnError: false,
    onSuccess: () => {}, // @TODO - ...
    onError: () => {}, // @TODO - ...
    revalidateOnFocus: false,
    revalidateOnReconnect: false,
  };
  const { data, mutate, isLoading } = useSWR(
    isOpen ? ["/api/playlist-status", "GET"] : null, //
    getPlaylistStatus,
    configuration,
  );
  const playlistStatus = data?.data || [];

  const [value, setValue] = useState("");
  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setValue(event.target.value);
  };

  const [isMutating, setIsMutating] = useState(false);

  const { toast } = useToast();

  const handleSuccess = async () => {
    await mutate();
    setValue("");
    setIsMutating(false);
    toast({
      title: "Succès 🚀",
      description: "Tu es abonné à la playlist !",
    });
  };

  const handleError = (error: CustomError) => {
    setIsMutating(false);
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

  const configuration_ = {
    throwOnError: false,
    onSuccess: handleSuccess,
    onError: handleError,
  };
  const { trigger } = useSWRMutation(
    ["/api/playlist-status", "POST"], //
    postPlaylistStatus,
    configuration_,
  );

  const isLimited = playlistStatus.length >= USER_MAX_PLAYLISTS;
  const isDisabled = isMutating || !Boolean(value) || isLimited;
  const handleClick = async () => {
    if (isDisabled) {
      return;
    }
    setIsMutating(true);
    await trigger({ spotifyPlaylistId: value });
  };

  return (
    <Dialog onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent
        className="w-[550px] min-w-[550px] p-0 py-6"
        onOpenAutoFocus={handleOpenAutoFocus}
      >
        <DialogHeader className="px-6 space-y-4">
          <DialogTitle>
            <Heading>Abonne-toi à des playlists</Heading>
          </DialogTitle>
          <Text className="text-base text-primary/70">
            Abonne-toi à tes playlists favorites pour découvrir les nouveaux
            artistes qui y sont présents directement dans tes propositions.
            <span className="ml-1 text-primary">🔌</span>
          </Text>
        </DialogHeader>
        <div className="relative flex flex-col w-full h-[250px] p-3 pb-0 border-t border-b border-foreground/10 border-solid overflow-y-auto">
          {isLoading ? (
            <div className="absolute z-10 flex h-full w-full justify-center items-center ml-[-12px] mt-[-12px] bg-background">
              <Icon
                className="text-4xl text-primary/20 animate-spin leading-none"
                name="loader-4"
              />
            </div>
          ) : null}
          {playlistStatus.map((playlistStatus, playlistStatusIndex) => (
            <TopBarImportDialogItem
              key={playlistStatus.id}
              playlistStatus={playlistStatus}
              playlistStatusIndex={playlistStatusIndex}
            />
          ))}
        </div>
        <DialogFooter className="flex sm:flex-col sm:space-x-0 px-6 mt-1">
          <InputPlaylist
            className="w-full" //
            value={value}
            onChange={handleChange}
          />
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  // This allows tooltip to be triggered!
                  className={cn(
                    "mt-2.5 w-full", //
                    { "opacity-50 cursor-default": isDisabled },
                  )}
                  size="lg"
                  onClick={handleClick}
                  // disabled={isDisabled}
                >
                  {!isMutating ? (
                    <Text className="font-bold uppercase leading-none">
                      s’abonner
                    </Text>
                  ) : (
                    <Icon className="animate-spin" name="loader-4" />
                  )}
                </Button>
              </TooltipTrigger>
              {isLimited ? (
                <TooltipContent
                  side="bottom" //
                  sideOffset={4 * 1.5}
                  align="end"
                  alignOffset={-2}
                >
                  <Text className="text-sm text-primary">
                    Tu peux ajouter jusqu’à 5 playlists max.
                  </Text>
                </TooltipContent>
              ) : null}
            </Tooltip>
          </TooltipProvider>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
