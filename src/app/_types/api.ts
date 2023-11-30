import { z } from "zod";

type API_Ouput = {
  error?: string;
};

//
// API - api/playlists
//

export const API_POSTPlaylistsInputSchema = z.object({
  spotifyPlaylistId: z.string(),
});
export type API_POSTPlaylistsInput = z.infer<
  typeof API_POSTPlaylistsInputSchema
>;
export type API_POSTPlaylistsOutput = API_Ouput & {};

//
// API - /api/artist-status
//

export type API_GETArtistStatusOuputDataItem = {
  id: string;
  artist: {
    spotifyId: string;
    spotifyName: string;
    spotifyFollowersTotal: number;
    spotifyUrl: string;
    spotifyImageP_Url?: string;
    spotifyImageB_Url?: string;
  };
};
export type API_GETArtistStatusOuput = API_Ouput & {
  data?: API_GETArtistStatusOuputDataItem[];
};
