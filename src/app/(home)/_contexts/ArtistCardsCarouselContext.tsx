"use client";

import type {
  GET_ArtistStatusOuput,
  GET_ArtistStatusOuputDataItem,
} from "@/app/_types/api";
import React, { PropsWithChildren, useState } from "react";
import useSWR from "swr";
import {
  ARTIST_CARDS_CAROUSEL_OFFSET,
  ARTIST_CARDS_CAROUSEL_SIZE,
} from "../_components/ArtistCardsCarousel";

export const ArtistCardsCarouselContext = React.createContext<{
  artistStatus: (GET_ArtistStatusOuputDataItem | null)[];
  nextArtistStatus: () => void;
}>({
  artistStatus: [],
  nextArtistStatus: () => {},
});

// @TODO - This should handle erros!
// @TODO - This should handle offset!
export const ArtistCardsCarouselProvider = (props: PropsWithChildren) => {
  const [artistStatus, setArtistStatus] = useState<
    (GET_ArtistStatusOuputDataItem | null)[]
  >(Array(ARTIST_CARDS_CAROUSEL_OFFSET).fill(null));

  // @TODO - This should handle end-of-list!
  const handleSuccess = (data: GET_ArtistStatusOuput) => {
    const { data: loadedArtistStatus = [] } = data;
    setArtistStatus((previousArtistStatus) => [
      ...previousArtistStatus, //
      ...loadedArtistStatus,
    ]);
  };

  // This makes sure cache is ignored (as status are updated)!
  // https://github.com/vercel/swr/discussions/456#discussioncomment-25602
  const [random, setRandom] = useState(Date.now());
  useSWR(
    [`/api/artist-status?limit=${ARTIST_CARDS_CAROUSEL_SIZE}`, random], //
    { onSuccess: handleSuccess },
  );
  const nextArtistStatus = () => {
    setArtistStatus((previousArtistStatus) => {
      const [, ...nextArtistStatus] = previousArtistStatus;
      if (
        nextArtistStatus.length <=
        ARTIST_CARDS_CAROUSEL_SIZE + ARTIST_CARDS_CAROUSEL_OFFSET
      ) {
        setRandom(Date.now());
      }
      return nextArtistStatus;
    });
  };

  return (
    <ArtistCardsCarouselContext.Provider
      {...props} //
      value={{
        artistStatus,
        nextArtistStatus,
      }}
    />
  );
};
