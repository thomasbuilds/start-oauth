import { redirect, useLocation, useSearchParams } from "@solidjs/router";
import type { APIEvent } from "@solidjs/start/server";
import providers, { type Providers } from "./providers";
import encode from "./encode";
import type { Configuration, Methods } from "./types";

export default function OAuth(configuration: Configuration) {
  let errorURL: string;
  let redirectURL: string | undefined;

  return async ({ request: { url }, params }: APIEvent) => {
    const [provider] = Object.values(params);
    const { searchParams, origin, pathname } = new URL(url);

    if (!configuration.handler)
      return new Response("handler function missing in configuration");

    const methods = providers[provider as Providers];
    if (!methods) return new Response(`'${provider}' provider doesn't exist`);
    const { requestCode, requestToken, requestUser }: Methods = methods;

    const clientConfig = configuration[provider as Providers];
    if (!clientConfig.id || !clientConfig.secret)
      return new Response(`${provider} configuration is malformed`);

    const apiConfig = { ...clientConfig, redirect_uri: origin + pathname };

    const fallback = searchParams.get("fallback");
    if (fallback) {
      errorURL = fallback;
      redirectURL = searchParams.get("redirect") || undefined;
      return redirect(requestCode(apiConfig));
    }

    try {
      const error = searchParams.get("error");
      if (error) throw new Error(error);
      const code = searchParams.get("code");
      if (!code) throw new Error("missing code parameter in url");
      const { token_type, access_token } = await requestToken({
        ...apiConfig,
        code,
      });
      const user = await requestUser(`${token_type} ${access_token}`);
      return await configuration.handler(user, redirectURL);
    } catch ({ message }: any) {
      return redirect(`${errorURL}?error=${message}`);
    }
  };
}

export function useOAuthLogin() {
  const location = useLocation();
  const [searchParams] = useSearchParams();
  return (provider: Providers) => {
    const params = encode({
      fallback: location.pathname,
      redirect: searchParams.redirect,
    });
    return `/api/oauth/${provider}?${params}`;
  };
}

export type { User, Configuration } from "./types";
