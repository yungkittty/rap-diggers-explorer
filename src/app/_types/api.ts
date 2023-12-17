import { z } from "zod";
import { ErrorCode } from "../_constants/error-code";

type API_Ouput = {
  error?: ErrorCode | null;
};

//
// API/POST - /api/playlists
//

export const POST_PlaylistsInputSchema = z.object({
  spotifyPlaylistId: z.string(),
});
export type POST_PlaylistsInput = z.infer<typeof POST_PlaylistsInputSchema>;
export type POST_PlaylistsOutput = API_Ouput & {};

//
// API/POST - /api/playlists/import
//

export type POST_PlaylistsImportOutput = API_Ouput & {};

//
// API/GET - /api/playlists/is-importable
//

export type GET_PlaylistsIsImportableOutput = {
  isImportable: boolean;
};

//
// API/GET - /api/artist-status
//

export type GET_ArtistStatusOuputDataItem = {
  id: string;
  artist: {
    spotifyId: string;
    spotifyName: string;
    spotifyFollowersTotal: number;
    spotifyUrl: string;
    spotifyImageUrl?: string;
  };
};
export type GET_ArtistStatusOuput = API_Ouput & {
  data?: GET_ArtistStatusOuputDataItem[];
};

//
// API/PUT - /api/artist-status/[artist-status-id]
//

export const PUT_ArtistStatusInputSchema = z.object({
  action: z.union([
    z.literal("dig-in"), //
    z.literal("dig-out"),
    z.literal("like"),
    z.literal("dislike"),
    z.literal("snooze"),
  ]),
});
export type PUT_ArtistStatusInput = z.infer<typeof PUT_ArtistStatusInputSchema>;
export type PUT_ArtistStatusOutput = API_Ouput & {};

//
// API/GET - /api/artist-status/[artist-status-id]/tracks
//

export type GET_ArtistStatusTracksOutputDataItem = {
  spotifyUrl: string;
  spotifyImageUrl?: string;
  spotifyName: string;
  spotifyArtistNames: string[];
  spotifyReleaseDate: string;
};
export type GET_ArtistStatusTracksOutput = API_Ouput & {
  data?: GET_ArtistStatusTracksOutputDataItem[];
};

//
// API/DELETE - /api/users
//

export type DELETE_UsersOuput = {};
