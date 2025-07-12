import { redirect, useLocation, useSearchParams } from "@solidjs/router";
import type { APIEvent } from "@solidjs/start/server";
import { encode, encodeState, decodeState } from "./utils";
import providers, { type Provider } from "./providers";
import type { Configuration, Methods } from "./types";

export default function OAuth(config: Configuration) {
  return async ({ request: { url }, params }: APIEvent) => {
    const provider = Object.values(params)[0] as Provider;
    const methods = providers[provider] as Methods;
    if (!methods) return new Response("Unknown provider", { status: 404 });

    const client = config[provider];
    if (!client?.id || !client.secret || !config.handler)
      return new Response("Invalid OAuth configuration", { status: 400 });

    const { requestCode, requestToken, requestUser } = methods;
    const { searchParams, origin, pathname } = new URL(url);
    const redirect_uri = origin + pathname;
    const fallback = searchParams.get("fallback");
    const returnTo = searchParams.get("redirect");

    if (fallback && !searchParams.get("code") && !searchParams.get("error")) {
      const state = await encodeState(fallback, returnTo || undefined);
      return redirect(requestCode({ ...client, redirect_uri, state }));
    }

    const stateParam = searchParams.get("state");
    const state = stateParam ? await decodeState(stateParam) : null;
    const errorFallback = state?.fallback || "/";

    if (!state)
      return redirect(
        `${errorFallback}?error=${encodeURIComponent("Invalid state")}`
      );

    const error = searchParams.get("error");
    if (error)
      return redirect(`${errorFallback}?error=${encodeURIComponent(error)}`);

    const code = searchParams.get("code");
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
      return await config.handler(user, state.redirect);
    } catch (err: any) {
      return redirect(
        `${errorFallback}?error=${encodeURIComponent(err.message)}`
      );
    }
  };
}

export function useOAuthLogin() {
  const location = useLocation();
  const [searchParams] = useSearchParams();

  return (provider: Provider) => {
    const params = encode({
      fallback: location.pathname,
      redirect: searchParams.redirect,
    });
    return `/api/oauth/${provider}?${params}`;
  };
}

export type { Configuration };
