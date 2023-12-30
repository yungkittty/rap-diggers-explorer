"use client";

import { useToast } from "@/app/_components/ui/use-toast";
import { ErrorCode } from "@/app/_constants/error-code";
import type {
  GET_ArtistStatusOuput,
  GET_ArtistStatusOuputDataItem,
} from "@/app/_types/api";
import { CustomError } from "@/app/_utils/errors";
import React, {
  Dispatch,
  PropsWithChildren,
  SetStateAction,
  useEffect,
  useState,
} from "react";
import { SWRConfiguration } from "swr";
import useSWRImmutable from "swr/immutable";
import {
  ARTIST_CARDS_CAROUSEL_IMMUTABLE_SIZE,
  ARTIST_CARDS_CAROUSEL_OFFSET,
  ARTIST_CARDS_CAROUSEL_SIZE,
} from "../_components/ArtistCardsCarousel";

const getArtistStatus = async ([url]: [string, string]): //
Promise<GET_ArtistStatusOuput> => {
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

export type ArtistStatus =
  | (GET_ArtistStatusOuputDataItem & { renderId?: string })
  | null;
export const ArtistsStatusContext = React.createContext<{
  isInitialLoading: boolean;
  artistStatusCurrent: ArtistStatus;
  artistStatusNext: ArtistStatus;
  artistStatusIndex: number;
  artistStatus: ArtistStatus[];
  setArtistStatus: Dispatch<SetStateAction<ArtistStatus[]>>;
  previousArtistStatus: () => void;
  nextArtistStatus: () => void;
  commitArtistStatus: () => void;
}>({
  isInitialLoading: true,
  artistStatusCurrent: null,
  artistStatusNext: null,
  artistStatusIndex: 0,
  artistStatus: [],
  setArtistStatus: () => {},
  previousArtistStatus: () => {},
  nextArtistStatus: () => {},
  commitArtistStatus: () => {},
});

export const ArtistsStatusContextProvider = (props: PropsWithChildren) => {
  const [artistStatusIndex, setArtistStatusIndex] = useState(0);
  const [artistStatus, setArtistStatus] = //
    useState<ArtistStatus[]>(Array(ARTIST_CARDS_CAROUSEL_SIZE).fill(null));

  const artistStatusCurrentIndex =
    artistStatusIndex + ARTIST_CARDS_CAROUSEL_OFFSET;
  const artistStatusCurrent: ArtistStatus =
    artistStatus[artistStatusCurrentIndex] || null;
  const artistStatusNext: ArtistStatus =
    artistStatus[artistStatusCurrentIndex + 1] || null;

  const [isInitialLoading, setIsInitialLoading] = useState(true);
  const [isLoading, setIsLoading] = useState(true);

  const handleSuccess = (data: GET_ArtistStatusOuput) => {
    const { data: artistStatus = [] } = data;
    setArtistStatus((prevArtistStatus) => {
      const nextArtistStatusPast = prevArtistStatus.slice(
        0, //
        artistStatusIndex + ARTIST_CARDS_CAROUSEL_OFFSET,
      );
      const nextArtistStatusImmutable = prevArtistStatus.slice(
        artistStatusIndex + ARTIST_CARDS_CAROUSEL_OFFSET,
        artistStatusIndex +
          ARTIST_CARDS_CAROUSEL_OFFSET +
          (!isInitialLoading ? ARTIST_CARDS_CAROUSEL_IMMUTABLE_SIZE : 0),
      );
      const nextArtistStatusImmutableIds = nextArtistStatusImmutable.map(
        (artistStatus) => (artistStatus ? artistStatus.id : null),
      );
      const prevArtistStatusFuture = prevArtistStatus.slice(
        artistStatusIndex +
          ARTIST_CARDS_CAROUSEL_OFFSET +
          ARTIST_CARDS_CAROUSEL_IMMUTABLE_SIZE,
      );
      const nextArtistStatusFuture = artistStatus.filter(
        (artistStatus) =>
          !nextArtistStatusImmutableIds.includes(artistStatus.id),
      );

      const nextArtistStatusFutureSwapped: ArtistStatus[] = [];
      for (
        let nextArtistStatusFutureIndex = 0;
        nextArtistStatusFutureIndex < nextArtistStatusFuture.length;
        nextArtistStatusFutureIndex += 1
      ) {
        const nextArtistStatusFuture_ =
          nextArtistStatusFuture[nextArtistStatusFutureIndex];

        const prevArtistStatusFuture_ =
          prevArtistStatusFuture[nextArtistStatusFutureIndex];
        const nextArtistStatusFutureRenderId =
          prevArtistStatusFuture_?.renderId || window.crypto.randomUUID();

        nextArtistStatusFutureSwapped.push({
          ...nextArtistStatusFuture_,
          renderId: nextArtistStatusFutureRenderId,
        });
      }

      const nextArtistStatus = [
        ...nextArtistStatusPast,
        ...nextArtistStatusImmutable,
        ...nextArtistStatusFutureSwapped,
      ];
      return nextArtistStatus;
    });
    setIsInitialLoading(false);
    setIsLoading(false);
  };

  const { toast } = useToast();
  const handleError = (error: CustomError) => {
    switch (error.code) {
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
    setIsInitialLoading(false);
    setIsLoading(false);
  };

  const [fetchId, setFetchId] = useState<string | null>(null);
  const configuration: SWRConfiguration = {
    shouldRetryOnError: false,
    onSuccess: handleSuccess,
    onError: handleError,
  };
  useSWRImmutable(
    ["/api/artist-status", fetchId], //
    getArtistStatus,
    configuration,
  );

  const [isCommiting, setIsCommiting] = useState(false);
  const previousArtistStatus = () => {
    if (isInitialLoading) {
      return;
    }
    setArtistStatusIndex((previousArtistStatusIndex) => {
      return previousArtistStatusIndex - 1;
    });
    setIsCommiting(false);
  };
  const nextArtistStatus = () => {
    if (isInitialLoading) {
      return;
    }
    setIsCommiting(true);
    setArtistStatusIndex((previousArtistStatusIndex) => {
      return previousArtistStatusIndex + 1;
    });
  };
  const commitArtistStatus = () => {
    if (isInitialLoading) {
      return;
    }
    setArtistStatus((previousArtistStatus) => {
      const [, ...nextArtistStatus] = previousArtistStatus;
      return nextArtistStatus;
    });
    setArtistStatusIndex((previousArtistStatusIndex) => {
      return previousArtistStatusIndex - 1;
    });
    setIsCommiting(false);
  };
  useEffect(
    () => {
      if (isLoading || isCommiting) {
        return;
      }
      /* prettier-ignore */
      if (artistStatus.length - artistStatusIndex > ARTIST_CARDS_CAROUSEL_SIZE + ARTIST_CARDS_CAROUSEL_OFFSET) {
        return;
      }
      setIsLoading(true);
      const nextFetchId = window.crypto.randomUUID();
      setFetchId(nextFetchId);
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
        setArtistStatus,
        previousArtistStatus,
        nextArtistStatus,
        commitArtistStatus,
      }}
    />
  );
};
