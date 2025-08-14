import { redirect } from "@solidjs/router";
import type { APIEvent } from "@solidjs/start/server";
import { makeState, decodeState, parseError } from "./utils";
import { providers, isProvider } from "./providers";
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
      const { state, challenge } = await makeState(
        { fallback: params.fallback, redirect: params.redirect },
        password
      );
      return redirect(
        requestCode({ id: client.id, redirect_uri, state, challenge })
      );
    }

    if (!params.state) return redirect("/?error=Invalid state");
    const decoded = await decodeState(params.state, password);
    if (!decoded) return redirect("/?error=Invalid state");
    if (params.error)
      return redirect(
        `${decoded.fallback}?error=${encodeURIComponent(params.error)}`
      );
    if (!params.code) return redirect(decoded.fallback + "?error=Missing code");

    try {
      const { token_type, access_token } = await requestToken({
        id: client.id,
        secret: client.secret,
        redirect_uri,
        code: params.code,
        verifier: decoded.verifier,
      });
      const user = await requestUser(`${token_type} ${access_token}`);
      return handler(user, decoded.redirect);
    } catch (error: unknown) {
      return redirect(`${decoded.fallback}?error=${parseError(error)}`);
    }
  };
}

export type { Configuration };
