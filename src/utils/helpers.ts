import type { Identifiers, Token } from "../types";

export function urlEncode(p: Record<string, string | string[]>) {
  const params = new URLSearchParams();
  for (const [key, value] of Object.entries(p))
    params.set(key, Array.isArray(value) ? value.join(" ") : value);
  return params.toString();
}

async function fetchWithTimeout(
  url: string,
  init: Omit<RequestInit, "headers"> & { headers?: Record<string, string> } = {}
) {
  const response = await fetch(url, {
    ...init,
    headers: { "User-Agent": "start-oauth", ...init.headers },
    signal: AbortSignal.timeout(5000)
  });
  if (!response.ok) {
    const body = await response.text().catch(() => "");
    const contentType = response.headers.get("content-type");
    throw new Error(
      contentType?.includes("json") && body ? body : body || response.statusText
    );
  }
  const contentType = response.headers.get("content-type");
  return contentType?.includes("json")
    ? await response.json()
    : await response.text();
}

export async function exchangeToken(
  url: string,
  { id, secret }: Identifiers,
  code: string,
  redirect_uri: string,
  verifier?: string,
  bodyAuth = false
): Token {
  const headers: Record<string, string> = {
    "Content-Type": "application/x-www-form-urlencoded",
    Accept: "application/json"
  };
  const params: Record<string, string> = {
    grant_type: "authorization_code",
    code,
    redirect_uri
  };
  if (verifier) params.code_verifier = verifier;
  if (bodyAuth) {
    params.client_id = id;
    params.client_secret = secret;
  } else
    headers.Authorization =
      "Basic " +
      Buffer.from(
        `${encodeURIComponent(id)}:${encodeURIComponent(secret)}`
      ).toString("base64");
  const { token_type, access_token, error, error_description } =
    await fetchWithTimeout(url, {
      method: "POST",
      headers,
      body: urlEncode(params)
    });
  if (error || !access_token)
    throw new Error(error_description ?? error ?? "Missing access token");
  return {
    token_type: token_type?.replace(/^bearer$/i, "Bearer") ?? "Bearer",
    access_token
  };
}

export const fetchUser = (
  userUrl: string,
  token: string,
  headers?: Record<string, string>
) =>
  fetchWithTimeout(userUrl, { headers: { Authorization: token, ...headers } });
