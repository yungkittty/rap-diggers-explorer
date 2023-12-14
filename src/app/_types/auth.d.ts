import "next-auth";

declare module "next-auth" {
  interface Session {
    error?: string;
    user?: {
      id: string;
      name?: string | null;
      image?: string | null;
    };
    expires?: ISODateString;
  }
}
