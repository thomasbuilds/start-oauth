export { makeState, decodeState } from "./state";
export { exchangeToken, fetchUser } from "./helpers";

export const urlEncode = (p: Record<string, string | string[]>) => {
  const params = new URLSearchParams();
  for (const [k, v] of Object.entries(p)) {
    const value = Array.isArray(v) ? v.join(" ") : v;
    params.set(k, value);
  }
  return params.toString();
};

export function parseError(error: unknown) {
  const raw = error instanceof Error ? error.message : String(error);
  try {
    const { error_description, error: parsedError } = JSON.parse(raw);
    return encodeURIComponent(error_description ?? parsedError ?? raw);
  } catch {
    return encodeURIComponent(raw);
  }
}
