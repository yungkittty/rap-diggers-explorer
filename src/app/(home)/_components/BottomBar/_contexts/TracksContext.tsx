"use client";

import { ArtistsStatusContext } from "@/app/(home)/_contexts/ArtistStatusContext";
import { GET_ArtistStatusOuputDataItemTrack } from "@/app/_types/api";
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

type TrackCurrentMetadata = {
  duration: number;
  currentTime: number;
};
export const TracksContext = React.createContext<{
  isLoading: boolean;
  isPlaying: boolean;
  isSeeking: boolean;
  setIsSeeking: Dispatch<SetStateAction<boolean>>;
  tracks: (GET_ArtistStatusOuputDataItemTrack | null)[];
  trackCurrent: GET_ArtistStatusOuputDataItemTrack | null;
  trackCurrentMetadata: TrackCurrentMetadata | null;
  prevTrack: () => void;
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
  prevTrack: () => {},
  nextTrack: () => {},
  toggleTrack: () => {},
  seekTrackToPercentage: () => {},
});

export const TracksContextProvider = (props: PropsWithChildren) => {
  const { children } = props;

  const audioRef = useRef<HTMLAudioElement | null>(null);

  const { artistStatusCurrent } = useContext(ArtistsStatusContext);

  const tracks: GET_ArtistStatusOuputDataItemTrack[] =
    artistStatusCurrent?.artist.spotifyTracks || [];

  const [trackIndex, setTrackIndex] = useState(0);
  const trackCurrent: GET_ArtistStatusOuputDataItemTrack | null =
    tracks[trackIndex] || null;

  const [isPlaying, setIsPlaying] = useState(false);
  const toggleTrack = () => {
    if (!audioRef.current) {
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
    [artistStatusCurrent?.id],
  );

  const prevTrack = async () => {
    setTrackIndex((prevTrackIndex) => {
      const nextTrackIndex = prevTrackIndex - 1;
      if (nextTrackIndex < 0) {
        return Math.max(0, tracks.length - 1);
      }
      return nextTrackIndex;
    });
  };
  const nextTrack = async () => {
    setTrackIndex((prevTrackIndex) => {
      const nextTrackIndex = prevTrackIndex + 1;
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
        isLoading,
        isPlaying,
        isSeeking,
        setIsSeeking,
        tracks,
        trackCurrent,
        trackCurrentMetadata,
        prevTrack,
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
