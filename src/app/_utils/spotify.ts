import type {
  Page,
  Playlist,
  PlaylistedTrack,
  SimplifiedTrack,
  SpotifyApi,
} from "@spotify/web-api-ts-sdk";
import { ErrorCode } from "../_constants/error-code";

const SPOTIFY_GET_PLAYLIST_ARTISTS_MAX_TRACKS = 2500;
const SPOTIFY_GET_PLAYLIST_ARTISTS_LIMIT_TRACKS = 50;
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

  // @TODO - ...
  if (spotifyPlaylist.tracks.total > SPOTIFY_GET_PLAYLIST_ARTISTS_MAX_TRACKS) {
    throw { name: ErrorCode.USER_FORBIDDEN_MAX_TRACKS };
  }

  const spotifyPlaylistItems = spotifyPlaylist.tracks.items;
  let next = spotifyPlaylist.tracks.next;
  let offset = spotifyPlaylist.tracks.limit;
  for (; next !== null; offset += SPOTIFY_GET_PLAYLIST_ARTISTS_LIMIT_TRACKS) {
    let spotifyPlaylistItems_: Page<PlaylistedTrack> | null = null;
    try {
      spotifyPlaylistItems_ = await spotifyApi.playlists.getPlaylistItems(
        spotifyPlaylistId,
        undefined,
        undefined,
        SPOTIFY_GET_PLAYLIST_ARTISTS_LIMIT_TRACKS,
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
