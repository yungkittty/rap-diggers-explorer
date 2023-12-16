"use client";

import { ArtistsStatusContext } from "@/app/(home)/_contexts/ArtistStatusContext";
import {
  GET_ArtistStatusTracksOutput,
  GET_ArtistStatusTracksOutputDataItem,
} from "@/app/_types/api";
import React, {
  ChangeEvent,
  Dispatch,
  PropsWithChildren,
  SetStateAction,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import useSWRImmutable from "swr/immutable";

const getArtistStatusTracks = async (
  url: string,
): //
Promise<GET_ArtistStatusTracksOutput> => {
  const fetchOptions = {
    method: "GET",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
    },
  };
  return fetch(url, fetchOptions).then((response) => response.json());
};

type TrackCurrentMetadata = {
  duration: number;
  currentTime: number;
};
export const TracksContext = React.createContext<{
  isLoading: boolean;
  isPlaying: boolean;
  isSeeking: boolean;
  setIsSeeking: Dispatch<SetStateAction<boolean>>;
  tracks: GET_ArtistStatusTracksOutputDataItem[];
  trackCurrent: GET_ArtistStatusTracksOutputDataItem | null;
  trackCurrentMetadata: TrackCurrentMetadata | null;
  previousTrack: () => void;
  nextTrack: () => void;
  toggleTrack: () => void;
  seekTrackToPercentage: (percentage: number) => void;
}>({
  isLoading: true,
  isPlaying: false,
  isSeeking: false,
  setIsSeeking: () => {},
  tracks: [],
  trackCurrent: null,
  trackCurrentMetadata: null,
  previousTrack: () => {},
  nextTrack: () => {},
  toggleTrack: () => {},
  seekTrackToPercentage: () => {},
});

export const TracksContextProvider = (props: PropsWithChildren) => {
  const { children } = props;

  const audioRef = useRef<HTMLAudioElement | null>(null);

  const { artistStatusCurrent, artistStatusNext } =
    useContext(ArtistsStatusContext);

  // @TODO - This should handle errors! (only spotify?)
  let artistStatusId = artistStatusCurrent?.id || null;
  const { data, isLoading: isLoading_ } = useSWRImmutable(
    artistStatusId ? `/api/artist-status/${artistStatusId}/tracks` : null, //
    getArtistStatusTracks,
    // { onError: () => {} },
  );
  // This allows to pre-fetch next track(s)!
  artistStatusId = artistStatusNext?.id || null;
  useSWRImmutable(
    artistStatusId ? `/api/artist-status/${artistStatusId}/tracks` : null, //
    getArtistStatusTracks,
    // { onError: () => {} },
  );

  const [trackIndex, setTrackIndex] = useState(0);
  const tracks: GET_ArtistStatusTracksOutputDataItem[] = data?.data || []; // prettier-ignore
  const trackCurrent: GET_ArtistStatusTracksOutputDataItem | null = tracks[trackIndex] || null; // prettier-ignore

  const [isPlaying, setIsPlaying] = useState(false);
  const toggleTrack = () => {
    if (!audioRef.current) {
      return;
    }
    if (!trackCurrent) {
      return;
    }
    if (!isPlaying) {
      audioRef.current.play();
    } else {
      audioRef.current.pause();
    }
    setIsPlaying(!isPlaying);
  };

  const [trackCurrentMetadata, setTrackCurrentMetadata] =
    useState<TrackCurrentMetadata | null>(null);
  const handleLoadedMetadata = (event: ChangeEvent<HTMLAudioElement>) => {
    const { target } = event;
    setTrackCurrentMetadata({
      duration: target.duration,
      currentTime: 0,
    });
  };
  const handleTimeUpdate = (event: ChangeEvent<HTMLAudioElement>) => {
    const { target } = event;
    setTrackCurrentMetadata({
      duration: target.duration,
      currentTime: target.currentTime,
    });
  };
  const [isSeeking, setIsSeeking] = useState(false);
  const seekTrackToPercentage = (percentage: number /* 0 -> 1 */) => {
    if (!audioRef.current) {
      return;
    }
    const trackCurrentDuration = audioRef.current.duration;
    const trackCurrentTime = trackCurrentDuration * percentage;
    audioRef.current.currentTime = trackCurrentTime;

    // This makes sure audio still play ...
    // ... if ended event is fired (while seeking)!
    if (trackCurrentTime !== trackCurrentDuration && isPlaying) {
      audioRef.current.play();
    }
  };

  const [isLoading, setIsLoading] = useState(false);
  const handleLoadStart = () => {
    setIsLoading(true);
  };
  const handleCanPlayThrough = () => {
    setIsLoading(false);
  };
  const handleWaiting = () => {
    setIsLoading(true);
  };
  const handlePlaying = () => {
    setIsLoading(false);
  };
  useEffect(
    () => {
      if (!audioRef.current) {
        return;
      }
      if (isLoading || !isPlaying || isSeeking) {
        return;
      }
      audioRef.current.play();
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [isLoading, isSeeking],
  );

  useEffect(
    () => {
      if (!artistStatusCurrent) {
        return;
      }
      setIsLoading(true);
      setTrackIndex(0);
      setTrackCurrentMetadata(null);
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [artistStatusId],
  );

  const previousTrack = async () => {
    if (!trackCurrent) {
      return;
    }
    setTrackIndex((previousTrackIndex) => {
      const nextTrackIndex = previousTrackIndex - 1;
      if (nextTrackIndex < 0) {
        return Math.max(0, tracks.length - 1);
      }
      return nextTrackIndex;
    });
  };
  const nextTrack = async () => {
    if (!trackCurrent) {
      return;
    }
    setTrackIndex((previousTrackIndex) => {
      const nextTrackIndex = previousTrackIndex + 1;
      if (nextTrackIndex >= tracks.length) {
        return 0;
      }
      return nextTrackIndex;
    });
  };

  const handleEnded = () => {
    if (!isSeeking) {
      nextTrack();
    }
  };

  return (
    <TracksContext.Provider
      value={{
        isLoading: isLoading_ || isLoading,
        isPlaying,
        isSeeking,
        setIsSeeking,
        tracks,
        trackCurrent,
        trackCurrentMetadata,
        previousTrack,
        nextTrack,
        toggleTrack,
        seekTrackToPercentage,
      }}
    >
      {trackCurrent ? (
        <audio
          ref={audioRef}
          src={trackCurrent.spotifyUrl}
          onLoadStart={handleLoadStart}
          onLoadedMetadata={handleLoadedMetadata}
          onCanPlayThrough={handleCanPlayThrough}
          onWaiting={handleWaiting}
          onPlaying={handlePlaying}
          onTimeUpdate={handleTimeUpdate}
          onEnded={handleEnded}
        />
      ) : null}
      {children}
    </TracksContext.Provider>
  );
};
