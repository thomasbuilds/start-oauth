import discord from "./discord";
import github from "./github";
import gitlab from "./gitlab";
import google from "./google";
import linkedin from "./linkedin";
import slack from "./slack";
import twitch from "./twitch";
import x from "./x";
import yahoo from "./yahoo";

export const providers = {
  discord,
  github,
  gitlab,
  google,
  linkedin,
  slack,
  twitch,
  x,
  yahoo
} as const;

export const isProvider = (str: string | undefined): str is Providers =>
  !!str && Object.hasOwn(providers, str);

export type Providers = keyof typeof providers;
