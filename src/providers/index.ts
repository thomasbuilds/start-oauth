import discord from "./discord";
import github from "./github";
import google from "./google";
import spotify from "./spotify";

export const providers = { discord, github, google, spotify } as const;

export const isProvider = (str: string): str is Provider =>
  Object.hasOwn(providers, str);

export type Provider = keyof typeof providers;
