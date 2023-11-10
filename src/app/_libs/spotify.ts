import { Account } from "@prisma/client";
import {
  AccessToken,
  IAuthStrategy,
  SdkConfiguration,
  SpotifyApi,
} from "@spotify/web-api-ts-sdk";

// https://github.com/spotify/spotify-web-api-ts-sdk
class NextAuthStrategy implements IAuthStrategy {
  account: Pick<
    Account,
    | "token_type"
    | "access_token" //
    | "refresh_token"
    | "expires_in"
    | "expires_at"
  >;
  constructor(account: Account) {
    this.account = account;
  }

  public setConfiguration(configuration: SdkConfiguration): void {
    console.warn("[Spotify-SDK][WARN]\nsetConfiguration not implemented");
  }

  public getOrCreateAccessToken(): Promise<AccessToken> {
    return this.getAccessToken();
  }

  public async getAccessToken(): Promise<AccessToken> {
    const {
      token_type,
      access_token,
      refresh_token,
      expires_in,
      expires_at: expires,
    } = this.account;
    return {
      token_type,
      access_token,
      refresh_token,
      expires_in,
      expires,
    } as AccessToken;
  }

  public removeAccessToken(): void {
    console.warn("[Spotify-SDK][WARN]\nremoveAccessToken not implemented");
  }
}

export const getSpotifyApi = (account: Account): SpotifyApi => {
  const strategy = new NextAuthStrategy(account);
  return new SpotifyApi(strategy, {});
};
