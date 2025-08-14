import amazon from "./amazon";
import discord from "./discord";
import github from "./github";
import google from "./google";
import linkedin from "./linkedin";
import microsoft from "./microsoft";
import spotify from "./spotify";
import yahoo from "./yahoo";

export const providers = {
  amazon,
  discord,
  github,
  google,
  linkedin,
  microsoft,
  spotify,
  yahoo,
} as const;

export const isProvider = (str: string): str is Providers =>
  Object.hasOwn(providers, str);

export type Providers = keyof typeof providers;
