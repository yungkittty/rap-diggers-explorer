"use client";

import { useToast } from "@/app/_components/ui/use-toast";
import { ErrorCode } from "@/app/_constants/error-code";
import type {
  GET_ArtistStatusOuput,
  GET_ArtistStatusOuputDataItem,
} from "@/app/_types/api";
import React, { PropsWithChildren, useState } from "react";
import { SWRConfiguration } from "swr";
import useSWRImmutable from "swr/immutable";
import {
  ARTIST_CARDS_CAROUSEL_OFFSET,
  ARTIST_CARDS_CAROUSEL_SIZE,
} from "../_components/ArtistCardsCarousel";

const getArtistStatus = async ([url]: [string, number]): //
Promise<GET_ArtistStatusOuput> => {
  const fetchOptions = {
    method: "GET",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
    },
  };
  return fetch(url, fetchOptions).then((response) => response.json());
};

export const ArtistsStatusContext = React.createContext<{
  isInitialLoading: boolean;
  artistStatusCurrent: GET_ArtistStatusOuputDataItem | null;
  artistStatusNext: GET_ArtistStatusOuputDataItem | null;
  artistStatus: (GET_ArtistStatusOuputDataItem | null)[];
  nextArtistStatus: () => void;
}>({
  isInitialLoading: true,
  artistStatusCurrent: null,
  artistStatusNext: null,
  artistStatus: [],
  nextArtistStatus: () => {},
});

const ARTIST_CARDS_CAROUSEL_FETCH_SIZE = 50; // = spotify max

export const ArtistsStatusContextProvider = (props: PropsWithChildren) => {
  const [artistStatus, setArtistStatus] = useState<
    (GET_ArtistStatusOuputDataItem | null)[]
  >(Array(ARTIST_CARDS_CAROUSEL_SIZE).fill(null));

  const artistStatusCurrent: GET_ArtistStatusOuputDataItem | null =
    artistStatus[ARTIST_CARDS_CAROUSEL_OFFSET] || null;
  const artistStatusNext: GET_ArtistStatusOuputDataItem | null =
    artistStatus[ARTIST_CARDS_CAROUSEL_OFFSET + 1] || null;

  const { toast } = useToast();
  const handleError = () => {
    toast({
      variant: "destructive",
      title: "Erreur",
      description: "Une erreur inconnue est survenu. Réessaie plus tard ou contacte-nous directement si le problème persiste.", // prettier-ignore
    });
    return;
  };

  // @TODO - This should handle when there're no data left ...
  // ... and also on error as data is empty!
  const [isInitialLoading, setIsInitialLoading] = useState(true);
  const handleSuccess = (data: GET_ArtistStatusOuput) => {
    if (data.error) {
      switch (data.error) {
        case ErrorCode.USER_FORBIDDEN_MAX_REQUESTS: {
          toast({
            variant: "destructive",
            title: "Erreur",
            description: "Notre service est surchargé. Réessaie dans quelques minutes.", // prettier-ignore
          });
          return;
        }
        default: {
          handleError();
          return;
        }
      }
    }

    const { data: nextArtistStatus = [] } = data;
    setArtistStatus((previousArtistStatus) => [
      ...(isInitialLoading
        ? previousArtistStatus.slice(0, ARTIST_CARDS_CAROUSEL_OFFSET)
        : previousArtistStatus),
      ...nextArtistStatus,
    ]);

    setIsInitialLoading(false);
  };

  const [
    [offset, offsetId], //
    setOffset,
  ] = useState<[number, string | null]>([0, null]);
  const url =
    "/api/artist-status?" +
    new URLSearchParams({
      offset: String(offset),
      limit: String(ARTIST_CARDS_CAROUSEL_FETCH_SIZE),
    }).toString();
  const swrOptions: SWRConfiguration = {
    onSuccess: handleSuccess,
    onError: handleError,
    shouldRetryOnError: false,
  };
  useSWRImmutable(
    [url, offsetId], //
    getArtistStatus,
    swrOptions,
  );

  // @TODO - This could prevent unnecessary fetch ...
  // ... by setting state upon action type (!= like & size < X => avoid fetch)
  const nextArtistStatus = () => {
    setArtistStatus((previousArtistStatus) => {
      const [, ...nextArtistStatus] = previousArtistStatus;
      if (
        nextArtistStatus.length <=
        ARTIST_CARDS_CAROUSEL_SIZE + ARTIST_CARDS_CAROUSEL_OFFSET
      ) {
        const nextOffset = nextArtistStatus
          .slice(ARTIST_CARDS_CAROUSEL_OFFSET)
          .filter(Boolean).length;
        const nextOffsetId = nextArtistStatus.at(-1)?.id || null;
        setOffset([nextOffset, nextOffsetId]);
      }
      return nextArtistStatus;
    });
  };

  return (
    <ArtistsStatusContext.Provider
      {...props} //
      value={{
        isInitialLoading,
        artistStatusCurrent,
        artistStatusNext,
        artistStatus,
        nextArtistStatus,
      }}
    />
  );
};
