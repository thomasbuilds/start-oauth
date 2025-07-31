import { redirect, useLocation, useSearchParams } from "@solidjs/router";
import type { APIEvent } from "@solidjs/start/server";
import { encodeState, decodeState } from "./utils";
import { providers, isProvider, type Provider } from "./providers";
import type { Configuration } from "./types";

export default function OAuth(config: Configuration) {
  const { password, handler } = config;
  if (!password) throw new Error("Missing OAuth password");
  if (typeof handler !== "function") throw new Error("Invalid handler");

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
      const state = encodeState(
        { fallback: params.fallback, redirect: params.redirect },
        password
      );
      return redirect(requestCode({ id: client.id, redirect_uri, state }));
    }

    if (!params.state) return redirect("/?error=Invalid state");
    const decoded = decodeState(params.state, password);
    if (!decoded) return redirect("/?error=Invalid state");
    if (params.error)
      return redirect(
        `${decoded.fallback}?error=${encodeURIComponent(params.error)}`
      );
    if (!params.code) return redirect(decoded.fallback + "?error=missing_code");

    try {
      const { token_type, access_token } = await requestToken({
        id: client.id,
        secret: client.secret,
        redirect_uri,
        code: params.code,
        state: params.state,
      });
      const user = await requestUser(`${token_type} ${access_token}`);
      return handler(user, decoded.redirect);
    } catch (error: unknown) {
      let msg = error instanceof Error ? error.message : String(error);
      try {
        const { error_description, error } = JSON.parse(msg);
        msg = error_description ?? error ?? msg;
      } finally {
        return redirect(`${decoded.fallback}?error=${encodeURIComponent(msg)}`);
      }
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
