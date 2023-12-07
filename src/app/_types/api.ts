import { z } from "zod";

type API_Ouput = {
  error?: string;
};

//
// API/POST - api/playlists
//

export const POST_PlaylistsInputSchema = z.object({
  spotifyPlaylistId: z.string(),
});
export type POST_PlaylistsInput = z.infer<typeof POST_PlaylistsInputSchema>;
export type POST_PlaylistsOutput = API_Ouput & {};

//
// API/GET - /api/artist-status
//

export type GET_ArtistStatusOuputDataItemTrack = {
  spotifyUrl: string;
  spotifyName: string;
  spotifyArtistNames: string[];
  spotifyReleaseDate: string;
};
export type GET_ArtistStatusOuputDataItem = {
  id: string;
  artist: {
    spotifyId: string;
    spotifyName: string;
    spotifyFollowersTotal: number;
    spotifyUrl: string;
    spotifyImageP_Url?: string;
    spotifyImageB_Url?: string;
    spotifyTracks: GET_ArtistStatusOuputDataItemTrack[];
  };
};
export type GET_ArtistStatusOuput = API_Ouput & {
  data?: GET_ArtistStatusOuputDataItem[];
};

//
// API/PUT - /api/artist-status
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
