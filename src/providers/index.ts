import discord from "./discord";
import github from "./github";
import google from "./google";
import spotify from "./spotify";

const providers = { discord, github, google, spotify };

export default providers;

export type Providers = keyof typeof providers;
