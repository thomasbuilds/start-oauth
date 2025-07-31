export { encodeState, decodeState } from "./codec";
export { fetchWithTimeout, throwIfBad } from "./http";
export { pkceStore, makePkcePair } from "./pkce";
export { exchangeToken, fetchUser } from "./oauthHelpers";

export const urlEncode = (p: Record<string, string | string[]>) =>
  Object.entries(p)
    .map(
      ([k, v]) =>
        `${k}=${
          Array.isArray(v)
            ? v.map(encodeURIComponent).join("+")
            : encodeURIComponent(v)
        }`
    )
    .join("&");
