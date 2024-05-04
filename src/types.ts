import type { Providers } from "./providers";

export type Identifiers = { id: string; secret: string; state?: string };

export type User = { name: string; email: string; image: string | undefined };

export type Configuration = Record<Providers, Identifiers> & {
  handler: (user: User, redirect?: string) => unknown;
};

export type Methods = {
  requestCode: (config: Identifiers & { redirect_uri: string }) => string;
  requestToken: (
    config: Identifiers & { redirect_uri: string; code: string }
  ) => Promise<Record<string, string>>;
  requestUser: (token: string) => Promise<User>;
};

export type Google = {
  sub: string;
  name: string;
  given_name: string;
  picture: string;
  email: string;
  email_verified: boolean;
  locale: string;
};

export type GitHubUser = {
  avatar_url: string;
  bio: string;
  blog: string;
  company: string | null;
  created_at: string;
  email: string | null;
  events_url: string;
  followers: number;
  followers_url: string;
  following: number;
  following_url: string;
  gists_url: string;
  gravatar_id: string;
  hireable: boolean | null;
  html_url: string;
  id: number;
  location: string | null;
  login: string;
  name: string;
  node_id: string;
  organizations_url: string;
  public_gists: number;
  public_repos: number;
  received_events_url: string;
  repos_url: string;
  site_admin: boolean;
  starred_url: string;
  subscriptions_url: string;
  type: string;
  twitter_username: string | null;
  updated_at: string;
  url: string;
};

export type GithubEmails = Array<{
  email: string;
  primary: boolean; //at least one true, other false
  verified: boolean;
  visibility: string | null;
}>;

export type Discord = {
  accent_color: number;
  avatar: string;
  avatar_decoration: null;
  banner: null;
  banner_color: string;
  discriminator: string;
  email: string;
  flags: number;
  global_name: string;
  id: string;
  locale: string;
  mfa_enabled: boolean;
  premium_type: number;
  public_flags: number;
  username: string;
  verified: boolean;
};

export type Spotify = {
  display_name: string;
  external_urls: { spotify: string };
  href: string;
  id: string;
  images:
    | Array<{
        url: string;
        height: number;
        width: number;
      }>
    | [];
  type: string;
  uri: string;
  followers: { href: string | null; total: number };
  email: string;
};
