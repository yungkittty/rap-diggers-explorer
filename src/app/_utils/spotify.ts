import type {
  Page,
  Playlist,
  PlaylistedTrack,
  SimplifiedTrack,
  SpotifyApi,
} from "@spotify/web-api-ts-sdk";
import { ErrorCode } from "../_constants/error-code";
import {
  SPOTIFY_ARTIST_MAX_FOLLOWERS,
  SPOTIFY_PLAYLIST_MAX_TRACKS,
} from "../_constants/spotify";
import { CustomError } from "./errors";

const GET_PLAYLIST_ITEMS_LIMIT = 50;
export const getSpotifyPlaylistArtistIds = async (
  spotifyApi: SpotifyApi,
  spotifyPlaylistId: string,
): Promise<string[]> => {
  let spotifyPlaylist: Playlist | null = null;
  try {
    spotifyPlaylist =
      await spotifyApi.playlists.getPlaylist(spotifyPlaylistId); // prettier-ignore
  } catch (error) {
    console.log(error);
    throw error;
  }

  if (spotifyPlaylist.tracks.total > SPOTIFY_PLAYLIST_MAX_TRACKS) {
    throw new CustomError(ErrorCode.USER_FORBIDDEN_MAX_TRACKS);
  }

  const spotifyPlaylistItems = spotifyPlaylist.tracks.items;
  let next = spotifyPlaylist.tracks.next;
  let offset = spotifyPlaylist.tracks.limit;
  for (; next !== null; offset += GET_PLAYLIST_ITEMS_LIMIT) {
    let spotifyPlaylistItems_: Page<PlaylistedTrack> | null = null;
    try {
      spotifyPlaylistItems_ = await spotifyApi.playlists.getPlaylistItems(
        spotifyPlaylistId,
        undefined,
        undefined,
        GET_PLAYLIST_ITEMS_LIMIT,
        offset,
      );
    } catch (error) {
      console.log(error);
      throw error;
    }
    spotifyPlaylistItems.push(...spotifyPlaylistItems_.items);
    next = spotifyPlaylistItems_.next;
  }

  const spotifyArtistIdsSet = new Set<string>([]);
  for (const spotifyPlaylistItem of spotifyPlaylistItems) {
    const spotifyPlaylistTrack = spotifyPlaylistItem.track as SimplifiedTrack;
    const spotifyArtists = spotifyPlaylistTrack.artists;
    for (const spotifyArtist of spotifyArtists) {
      spotifyArtistIdsSet.add(spotifyArtist.id);
    }
  }

  const spotifyArtistIds = Array.from(spotifyArtistIdsSet);
  return spotifyArtistIds;
};

export const getSpotifyArtistRelatedIds = async (
  spotifyApi: SpotifyApi,
  spotifyArtistId: string,
): Promise<string[]> => {
  let spotifyArtistIds: string[] = [];
  try {
    const { artists: spotifyArtists } =
      await spotifyApi.artists.relatedArtists(spotifyArtistId);
    // prettier-ignore
    spotifyArtistIds = spotifyArtists
      .filter((spotifyArtist) => spotifyArtist.followers.total <= SPOTIFY_ARTIST_MAX_FOLLOWERS) 
      .map((spotifyArtist) => spotifyArtist.id);
  } catch (error) {
    console.log(error);
    throw error;
  }
  return spotifyArtistIds;
};
