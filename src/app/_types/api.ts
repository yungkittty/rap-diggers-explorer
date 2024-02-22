import { z } from "zod";
import { ErrorCode } from "../_constants/error-code";

export type API_Ouput = {
  error?: ErrorCode | null;
};

//
// API/POST - /api/playlists/create-and-import
//

export const POST_PlaylistsCreateAndImportInputSchema = z.object({
  spotifyPlaylistId: z.string(),
});
export type POST_PlaylistsCreateAndImportInput = z.infer<
  typeof POST_PlaylistsCreateAndImportInputSchema
>;
export type POST_PlaylistsCreateAndImportOutput = API_Ouput & {};

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
// API/POST - /api/playlist-status
//

export const POST_PlaylistStatusInputSchema = z.object({
  spotifyPlaylistId: z.string(),
});
export type POST_PlaylistStatusInput = z.infer<
  typeof POST_PlaylistStatusInputSchema
>;
export type POST_PlaylistStatusOutput = API_Ouput & {};

//
// API/GET - /api/playlist-status
//

export type GET_PlaylistStatusOutputDataItem = {
  id: string;
  playlist: {
    spotifyId: string;
    spotifyName: string;
    spotifyOwnerId: string;
    spotifyOwnerName: string;
    spotifyTracksTotal: number;
    spotifyUrl: string;
    spotifyImageUrl?: string;
  };
};
export type GET_PlaylistStatusOutput = API_Ouput & {
  data?: GET_PlaylistStatusOutputDataItem[];
};

//
// API/DELETE - /api/playlist-status/[playlist-status-id]
//

export type DELETE_PlaylistStatusOutput = API_Ouput & {};

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
    z.literal("skipped"),
  ]),
});
export type PUT_ArtistStatusInput = z.infer<typeof PUT_ArtistStatusInputSchema>;
export type PUT_ArtistStatusOutput = API_Ouput & {
  data?: string[];
};

//
// API/GET - /api/artist-status/[artist-status-id]/tracks
//

export type GET_ArtistStatusTracksOutputDataItem = {
  spotifyUrl: string;
  spotifyPreviewUrl: string;
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
