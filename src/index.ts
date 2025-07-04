import { redirect, useLocation, useSearchParams } from "@solidjs/router";
import type { APIEvent } from "@solidjs/start/server";
import encode from "./encode";
import providers, { Provider } from "./providers";
import type { Configuration, Methods } from "./types";

export default function OAuth(config: Configuration) {
  return async ({ request: { url }, params }: APIEvent) => {
    const provider = Object.values(params)[0] as Provider;
    const methods = providers[provider] as Methods;
    if (!methods) return new Response("Unknown provider", { status: 404 });

    const client = config[provider];
    if (!client?.id || !client.secret)
      return new Response("Invalid provider configuration", { status: 400 });

    const { requestCode, requestToken, requestUser } = methods;
    const { searchParams, origin, pathname } = new URL(url);
    const redirectUri = origin + pathname;
    const fallback = searchParams.get("fallback") || "";
    const returnTo = searchParams.get("redirect") || undefined;

    if (fallback && !searchParams.get("code"))
      return redirect(requestCode({ ...client, redirect_uri: redirectUri }));

    try {
      const error = searchParams.get("error");
      if (error) throw new Error(error);
      const code = searchParams.get("code");
      if (!code) throw new Error("Missing code");
      const { token_type, access_token } = await requestToken({
        ...client,
        redirect_uri: redirectUri,
        code,
      });
      const user = await requestUser(`${token_type} ${access_token}`);
      return await config.handler(user, returnTo);
    } catch (err: any) {
      return redirect(`${fallback}?error=${encodeURIComponent(err.message)}`);
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
