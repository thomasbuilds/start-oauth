import type { Identifiers, Token } from "../types";

async function fetchWithTimeout(url: string, init: RequestInit = {}) {
  const signal = AbortSignal.timeout(5000);
  let response: Response;
  try {
    response = await fetch(url, { ...init, signal });
  } catch (error: unknown) {
    if ((error as Error).name === "AbortError")
      throw new Error("Request timed out");
    throw error;
  }
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

export function urlEncode(p: Record<string, string | string[]>) {
  const params = new URLSearchParams();
  for (const [k, v] of Object.entries(p)) {
    const value = Array.isArray(v) ? v.join(" ") : v;
    params.set(k, value);
  }
  return params.toString();
}

export async function exchangeToken(
  url: string,
  creds: Identifiers,
  code: string,
  redirect_uri: string,
  verifier: string
): Token {
  const headers: Record<string, string> = {
    "Content-Type": "application/x-www-form-urlencoded",
    Accept: "application/json",
  };
  if (creds.secret)
    headers.Authorization =
      "Basic " + Buffer.from(`${creds.id}:${creds.secret}`).toString("base64");
  return fetchWithTimeout(url, {
    method: "POST",
    headers,
    body: urlEncode({
      grant_type: "authorization_code",
      code,
      redirect_uri,
      code_verifier: verifier,
    }),
  });
}

export const fetchUser = (userUrl: string, token: string) =>
  fetchWithTimeout(userUrl, { headers: { Authorization: token } });
