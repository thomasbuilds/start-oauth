import discord from "./discord";
import github from "./github";
import google from "./google";
import spotify from "./spotify";

export const providers = { discord, github, google, spotify } as const;
export type Provider = keyof typeof providers;
export const isProvider = (s: string): s is Provider =>
  Object.hasOwn(providers, s);
