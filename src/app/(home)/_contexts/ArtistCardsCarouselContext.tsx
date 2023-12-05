"use client";

import type {
  GET_ArtistStatusOuput,
  GET_ArtistStatusOuputDataItem,
} from "@/app/_types/api";
import React, { PropsWithChildren, useState } from "react";
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

export const ArtistCardsCarouselContext = React.createContext<{
  artistStatusCurrent: GET_ArtistStatusOuputDataItem | null;
  artistStatus: (GET_ArtistStatusOuputDataItem | null)[];
  nextArtistStatus: () => void;
}>({
  artistStatusCurrent: null,
  artistStatus: [],
  nextArtistStatus: () => {},
});

export const ArtistCardsCarouselProvider = (props: PropsWithChildren) => {
  const [artistStatus, setArtistStatus] = useState<
    (GET_ArtistStatusOuputDataItem | null)[]
  >(Array(ARTIST_CARDS_CAROUSEL_OFFSET).fill(null));

  const artistStatusCurrent =
    artistStatus[ARTIST_CARDS_CAROUSEL_OFFSET] || null;

  const handleSuccess = (data: GET_ArtistStatusOuput) => {
    const { data: nextArtistStatus = [] } = data;
    setArtistStatus((prevArtistStatus) => [
      ...prevArtistStatus, //
      ...nextArtistStatus,
    ]);
  };

  // This makes sure cache is ignored (as status are updated)!
  // https://github.com/vercel/swr/discussions/456#discussioncomment-25602
  const [
    [offset, offsetId], //
    setOffset,
  ] = useState<[number, string | null]>([0, null]);
  const url =
    "/api/artist-status?" +
    new URLSearchParams({
      offset: String(offset),
      limit: String(ARTIST_CARDS_CAROUSEL_SIZE),
    }).toString();
  useSWRImmutable(
    [url, offsetId], //
    getArtistStatus,
    { onSuccess: handleSuccess },
  );

  const nextArtistStatus = () => {
    setArtistStatus((prevArtistStatus) => {
      const [, ...nextArtistStatus] = prevArtistStatus;
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
    <ArtistCardsCarouselContext.Provider
      {...props} //
      value={{
        artistStatusCurrent,
        artistStatus,
        nextArtistStatus,
      }}
    />
  );
};
