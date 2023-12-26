"use client";

import { useToast } from "@/app/_components/ui/use-toast";
import { ErrorCode } from "@/app/_constants/error-code";
import type {
  GET_ArtistStatusOuput,
  GET_ArtistStatusOuputDataItem,
} from "@/app/_types/api";
import React, { PropsWithChildren, useEffect, useState } from "react";
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
  artistStatusIndex: number;
  artistStatus: (GET_ArtistStatusOuputDataItem | null)[];
  previousArtistStatus: () => void;
  nextArtistStatus: () => void;
}>({
  isInitialLoading: true,
  artistStatusCurrent: null,
  artistStatusNext: null,
  artistStatusIndex: 0,
  artistStatus: [],
  previousArtistStatus: () => {},
  nextArtistStatus: () => {},
});

const ARTIST_CARDS_CAROUSEL_FETCH_SIZE = 50; // = spotify max

export const ArtistsStatusContextProvider = (props: PropsWithChildren) => {
  const [artistStatusIndex, setArtistStatusIndex] = useState(0);
  const [artistStatus, setArtistStatus] = useState<
    (GET_ArtistStatusOuputDataItem | null)[]
  >(Array(ARTIST_CARDS_CAROUSEL_SIZE).fill(null));

  const artistStatusCurrentIndex =
    artistStatusIndex + ARTIST_CARDS_CAROUSEL_OFFSET;
  const artistStatusCurrent: GET_ArtistStatusOuputDataItem | null =
    artistStatus[artistStatusCurrentIndex] || null;
  const artistStatusNext: GET_ArtistStatusOuputDataItem | null =
    artistStatus[artistStatusCurrentIndex + 1] || null;

  const { toast } = useToast();
  const [isInitialLoading, setIsInitialLoading] = useState(true);
  const [isLoading, setIsLoading] = useState(true);
  const handleError = () => {
    setIsInitialLoading(false);
    setIsLoading(false);
    toast({
      variant: "destructive",
      title: "Erreur",
      description: "Une erreur inconnue est survenu. Réessaie plus tard ou contacte-nous directement si le problème persiste.", // prettier-ignore
    });
    return;
  };
  const handleSuccess = (data: GET_ArtistStatusOuput) => {
    if (data.error) {
      setIsInitialLoading(false);
      setIsLoading(false);
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

    const { data: loadedArtistStatus = [] } = data;
    setArtistStatus((previousArtistStatus) => {
      let nextArtistStatus = [...previousArtistStatus];

      if (isInitialLoading) {
        nextArtistStatus = nextArtistStatus.slice(
          0, //
          ARTIST_CARDS_CAROUSEL_OFFSET,
        );
      }

      const loadedArtistStatus_ = loadedArtistStatus[0];
      if (loadedArtistStatus_) {
        const duplicatedArtistStatusIndex = nextArtistStatus.findIndex(
          (nextArtistStatus_) => {
            if (!nextArtistStatus_) {
              return false;
            }
            return nextArtistStatus_.id === loadedArtistStatus_.id;
          },
        );
        if (duplicatedArtistStatusIndex > 0) {
          nextArtistStatus = nextArtistStatus.slice(
            0, //
            duplicatedArtistStatusIndex,
          );
        }
      }

      nextArtistStatus = [...nextArtistStatus, ...loadedArtistStatus];
      return nextArtistStatus;
    });
    setIsInitialLoading(false);
    setIsLoading(false);
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

  const previousArtistStatus = () => {
    if (isInitialLoading) {
      return;
    }
    setArtistStatusIndex((previousArtistStatusIndex) => {
      return previousArtistStatusIndex - 1;
    });
  };
  const nextArtistStatus = () => {
    if (isInitialLoading) {
      return;
    }
    setArtistStatusIndex((previousArtistStatusIndex) => {
      return previousArtistStatusIndex + 1;
    });
  };
  useEffect(
    () => {
      if (isLoading) {
        return;
      }
      /* prettier-ignore */
      if (artistStatus.length - artistStatusIndex > ARTIST_CARDS_CAROUSEL_SIZE + ARTIST_CARDS_CAROUSEL_OFFSET) {
        return;
      }
      setIsLoading(true);
      const nextOffset = artistStatus.slice(artistStatusCurrentIndex).length;
      const nextOffsetId = artistStatus.at(-1)!.id;
      setOffset([nextOffset, nextOffsetId]);
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [artistStatusIndex],
  );

  return (
    <ArtistsStatusContext.Provider
      {...props} //
      value={{
        isInitialLoading,
        artistStatusCurrent,
        artistStatusNext,
        artistStatusIndex,
        artistStatus,
        previousArtistStatus,
        nextArtistStatus,
      }}
    />
  );
};
