import discord from "./discord";
import github from "./github";
import google from "./google";
import linkedin from "./linkedin";
import x from "./x";
import yahoo from "./yahoo";

export const providers = {
  discord,
  github,
  google,
  linkedin,
  x,
  yahoo
} as const;

export const isProvider = (str: string | undefined): str is Providers =>
  !!str && Object.hasOwn(providers, str);

export type Providers = keyof typeof providers;
