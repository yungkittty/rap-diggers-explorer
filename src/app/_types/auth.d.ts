import "next-auth";

declare module "next-auth" {
  interface Session {
    error?: string;
    user?: {
      id: string;
    };
    expires?: ISODateString;
  }
}
