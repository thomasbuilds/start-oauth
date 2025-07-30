import { redirect, useLocation, useSearchParams } from "@solidjs/router";
import type { APIEvent } from "@solidjs/start/server";
import { encodeState, decodeState } from "./utils";
import { providers, isProvider, type Provider } from "./providers";
import type { Configuration } from "./types";

export default function OAuth(config: Configuration) {
  const { password, handler } = config;
  if (!password || typeof handler !== "function")
    throw new Error("Invalid OAuth configuration");
  return async ({ request: { url }, params: { oauth } }: APIEvent) => {
    if (!isProvider(oauth))
      return new Response("Unknown provider", { status: 404 });
    const client = config[oauth];
    if (!client?.id || !client.secret)
      return new Response(`Missing ${oauth} credentials`, { status: 400 });

    const { requestCode, requestToken, requestUser } = providers[oauth];
    const { searchParams, origin, pathname } = new URL(url);
    const redirect_uri = origin + pathname;
    const params: Record<string, string | undefined> = Object.fromEntries(
      searchParams.entries()
    );

    if (params.fallback && !params.code && !params.error) {
      const state = encodeState(params.fallback, password, params.redirect);
      return redirect(requestCode({ ...client, redirect_uri, state }));
    }

    const state = params.state ? decodeState(params.state, password) : null;
    const validFallback =
      state?.fallback[0] === "/" && state.fallback[1] !== "/";
    const error_path = validFallback ? state.fallback : "/";

    if (!state) return redirect(error_path + "?error=Invalid state");
    if (params.error)
      return redirect(
        error_path + "?error=" + encodeURIComponent(params.error)
      );
    if (!params.code) return redirect(error_path + "?error=Missing code");

    try {
      const { token_type, access_token } = await requestToken({
        ...client,
        redirect_uri,
        code: params.code,
      });
      const user = await requestUser(`${token_type} ${access_token}`);
      return handler(user, state.redirect);
    } catch ({ message }: any) {
      return redirect(`${error_path}?error=${encodeURIComponent(message)}`);
    }
  };
}

export function useOAuthLogin() {
  const location = useLocation();
  const [searchParams] = useSearchParams();

  return (provider: Provider) => {
    const params = new URLSearchParams();
    params.set("fallback", location.pathname);
    if (typeof searchParams.redirect === "string")
      params.set("redirect", searchParams.redirect);
    return `/api/oauth/${provider}?${params.toString()}`;
  };
}

export type { Configuration };
