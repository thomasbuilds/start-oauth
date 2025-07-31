import { fetchWithTimeout, throwIfBad } from "./http";
import type { Identifiers } from "../types";
import { urlEncode } from ".";

export async function exchangeToken(
  url: string,
  creds: Identifiers,
  code: string,
  redirect_uri: string,
  state: string,
  verifier: string
): Promise<{ token_type: string; access_token: string }> {
  const headers: Record<string, string> = {
    "Content-Type": "application/x-www-form-urlencoded",
    Accept: "application/json",
  };
  if (creds.secret)
    headers.Authorization = `Basic ${Buffer.from(
      `${creds.id}:${creds.secret}`
    ).toString("base64")}`;
  const response = await fetchWithTimeout(url, {
    method: "POST",
    headers,
    body: urlEncode({
      grant_type: "authorization_code",
      code,
      redirect_uri,
      state,
      code_verifier: verifier,
    }),
  });
  return throwIfBad(response);
}

export async function fetchUser(userUrl: string, token: string) {
  const headers: Record<string, string> = { Authorization: token };
  const response = await fetchWithTimeout(userUrl, { headers });
  return throwIfBad(response);
}
