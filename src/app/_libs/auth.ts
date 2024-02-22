import prisma from "@/app/_libs/prisma";
import { PrismaAdapter } from "@auth/prisma-adapter";
import NextAuth from "next-auth";
import SpotifyProvider from "next-auth/providers/spotify";

const SPOTIFY_CLIENT_ID = process.env.SPOTIFY_CLIENT_ID ?? "";
const SPOTIFY_CLIENT_SECRET = process.env.SPOTIFY_CLIENT_SECRET ?? "";

// https://authjs.dev/guides/upgrade-to-v5#configuration
export const {
  handlers: { GET, POST },
  auth,
} = NextAuth({
  adapter: PrismaAdapter(prisma),
  providers: [
    SpotifyProvider({
      clientId: SPOTIFY_CLIENT_ID,
      clientSecret: SPOTIFY_CLIENT_SECRET,
      // This makes sure scope is the minimum required!
      // https://developer.spotify.com/documentation/web-api/concepts/scopes
      authorization: "https://accounts.spotify.com/authorize?scope=playlist-read-private", // prettier-ignore
      account(tokens) {
        // This makes sure expires_in is also returned!
        return tokens;
      },
    }),
  ],
  // @TODO - ...
  // https://next-auth.js.org/configuration/pages
  pages: {
    signIn: "",
    signOut: "",
    error: "",
  },
  callbacks: {
    async signIn(params) {
      if (!params.account) {
        return false;
      }
      if (!params.user) {
        return true;
      }

      const userId = params.user.id;
      const accounts = await prisma.account.findMany({
        where: {
          userId,
          provider: "spotify",
        },
      });
      if (accounts.length !== 1) {
        return false;
      }
      const account = accounts[0];
      const accountId = account.id;

      const {
        token_type,
        access_token,
        refresh_token,
        expires_in,
        expires_at,
      } = params.account;
      await prisma.account.update({
        data: {
          token_type,
          access_token,
          refresh_token,
          expires_in,
          expires_at,
        },
        where: {
          id: accountId,
        },
      });

      return true;
    },
    async session(params) {
      const { user } = params;

      const userId = user.id;
      const accounts = await prisma.account.findMany({
        where: {
          userId,
          provider: "spotify",
        },
      });
      if (accounts.length !== 1) {
        return { error: "" };
      }
      const account = accounts[0];
      const accountId = account.id;

      if (account.expires_at! * 1000 < Date.now()) {
        const fetchAuthorization =
          "Basic " + //
            Buffer.from(`${SPOTIFY_CLIENT_ID}:${SPOTIFY_CLIENT_SECRET}`).toString("base64"); // prettier-ignore
        const fetchOptions = {
          method: "POST",
          headers: {
            "Content-Type": "application/x-www-form-urlencoded",
            Authorization: fetchAuthorization,
          },
          body: new URLSearchParams({
            grant_type: "refresh_token",
            refresh_token: account.refresh_token!,
            client_id: SPOTIFY_CLIENT_ID,
          }),
        };

        let data: {
          access_token: string;
          token_type: string;
          expires_in: number;
          refresh_token: string;
          scope: string;
        } | null = null;
        try {
          console.log("re-fetching spotify token...");
          const response = await fetch(
            "https://accounts.spotify.com/api/token", //
            fetchOptions,
          );
          if (response.status !== 200) {
            console.log(response);
            return { error: "" };
          }
          data = await response.json();
        } catch {}
        if (!data) {
          return { error: "" };
        }

        const {
          token_type, //
          access_token,
          refresh_token,
          expires_in,
        } = data;
        const expires_at = Math.floor(Date.now() / 1000 + expires_in);
        await prisma.account.update({
          data: {
            token_type,
            access_token,
            refresh_token,
            expires_in,
            expires_at,
          },
          where: {
            id: accountId,
          },
        });
      }

      const { session } = params;
      return {
        user: {
          id: user.id,
          name: session.user?.name,
          image: session.user?.image,
        },
        expires: session.expires,
      };
    },
  },
});
