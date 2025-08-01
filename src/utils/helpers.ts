import { urlEncode } from ".";
import type { Identifiers } from "../types";

async function http(url: string, init: RequestInit = {}) {
  const signal = AbortSignal.timeout(5000);
  let response: Response;
  try {
    response = await fetch(url, { ...init, signal });
  } catch (e) {
    if (e.name === "AbortError") throw new Error("Request timed out");
    throw e;
  }
  if (!response.ok) {
    let body = await response.text().catch(() => "");
    throw new Error(
      response.headers.get("content-type")?.includes("json")
        ? JSON.stringify(JSON.parse(body))
        : body || response.statusText
    );
  }
  return response.headers.get("content-type")?.includes("json")
    ? await response.json()
    : await response.text();
}

export async function exchangeToken(
  url: string,
  creds: Identifiers,
  code: string,
  redirect_uri: string,
  verifier: string
): Promise<{ token_type: string; access_token: string }> {
  const headers: Record<string, string> = {
    "Content-Type": "application/x-www-form-urlencoded",
    Accept: "application/json",
  };
  if (creds.secret)
    headers.Authorization =
      "Basic " + Buffer.from(`${creds.id}:${creds.secret}`).toString("base64");
  return http(url, {
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
  http(userUrl, { headers: { Authorization: token } });
