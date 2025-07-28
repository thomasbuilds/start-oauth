import { redirect, useLocation, useSearchParams } from "@solidjs/router";
import type { APIEvent } from "@solidjs/start/server";
import { encodeState, decodeState } from "./utils";
import { providers, isProvider, type Provider } from "./providers";
import type { Configuration } from "./types";

export default function OAuth(config: Configuration) {
  const { password, handler } = config;
  if (typeof handler !== "function")
    throw new Error("Missing handler in OAuth configuration");
  return async ({ request: { url }, params: { oauth } }: APIEvent) => {
    if (!isProvider(oauth))
      return new Response("Unknown provider", { status: 404 });
    const client = config[oauth];
    if (!client?.id || !client.secret)
      return new Response(`Missing credentials for ${oauth} provider`, {
        status: 400,
      });

    const { requestCode, requestToken, requestUser } = providers[oauth];
    const { searchParams, origin, pathname } = new URL(url);
    const redirect_uri = origin + pathname;
    const fallback = searchParams.get("fallback");
    const returnTo = searchParams.get("redirect");
    const code = searchParams.get("code");
    const error = searchParams.get("error");

    if (fallback && !code && !error) {
      const state = await encodeState(fallback, returnTo, password);
      return redirect(requestCode({ ...client, redirect_uri, state }));
    }

    const stateParam = searchParams.get("state");
    const state = stateParam ? await decodeState(stateParam, password) : null;
    const errorFallback = state?.fallback || "/";

    if (!state)
      return redirect(
        `${errorFallback}?error=${encodeURIComponent("Invalid state")}`
      );
    if (error)
      return redirect(`${errorFallback}?error=${encodeURIComponent(error)}`);
    if (!code)
      return redirect(
        `${errorFallback}?error=${encodeURIComponent("Missing code")}`
      );

    try {
      const { token_type, access_token } = await requestToken({
        ...client,
        redirect_uri,
        code,
      });
      const user = await requestUser(`${token_type} ${access_token}`);
      return handler(user, state.redirect);
    } catch ({ message }: any) {
      return redirect(`${errorFallback}?error=${encodeURIComponent(message)}`);
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
