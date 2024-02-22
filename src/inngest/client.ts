import { EventSchemas, Inngest } from "inngest";

export type InngestEvents = {
  "spotify.related.loaded": {
    data: {
      user_id: string;
      spotify_artist_ids: string[];
      delay_in_ms: number;
    };
  };
};

const INNGEST_APP_ID = "rap-diggers-explorer";
export const inngest = new Inngest({
  id: INNGEST_APP_ID,
  schemas: new EventSchemas().fromRecord<InngestEvents>(),
});
