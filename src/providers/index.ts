import discord from "./discord";
import github from "./github";
import google from "./google";
import spotify from "./spotify";

const providers = { discord, github, google, spotify } as const;

export default providers;

export type Provider = keyof typeof providers;
