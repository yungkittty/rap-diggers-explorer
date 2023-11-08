import prisma from "@/app/_libs/prisma";
import { PrismaAdapter } from "@auth/prisma-adapter";
import NextAuth from "next-auth";
import SpotifyProvider from "next-auth/providers/spotify";

// https://authjs.dev/guides/upgrade-to-v5#configuration
export const {
  handlers: { GET, POST },
  auth,
} = NextAuth({
  adapter: PrismaAdapter(prisma),
  providers: [
    SpotifyProvider({
      clientId: process.env.SPOTIFY_CLIENT_ID ?? "",
      clientSecret: process.env.SPOTIFY_CLIENT_SECRET ?? "",
      account(tokens) {
        return tokens;
      },
    }),
  ],
  callbacks: {
    async session(params) {
      const { session, user } = params;

      // @TODO - This should implement spotify refresh token!
      // https://developer.spotify.com/documentation/web-api/tutorials/refreshing-tokens

      return {
        user: {
          id: user.id,
        },
        expires: session.expires,
      };
    },
  },
});
