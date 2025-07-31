import { createHmac, timingSafeEqual } from "crypto";

interface StatePayload {
  fallback: string;
  redirect?: string;
  exp: number;
}

export const sign = (data: string, secret: string) =>
  createHmac("sha256", secret).update(data).digest("base64url");

export function encodeState(
  payload: Omit<StatePayload, "exp">,
  secret: string
) {
  const state: StatePayload = { ...payload, exp: Date.now() + 3 * 60_000 };
  const b64 = Buffer.from(JSON.stringify(state), "utf8").toString("base64url");
  const sig = sign(b64, secret);
  return `${b64}.${sig}`;
}

export function decodeState(token: string, secret: string) {
  const [b64, sig] = token.split(".", 2);
  if (!b64 || !sig) return null;
  const expected = sign(b64, secret);
  if (
    sig.length === expected.length &&
    timingSafeEqual(
      Buffer.from(sig, "base64url"),
      Buffer.from(expected, "base64url")
    )
  ) {
    let state: StatePayload;
    try {
      state = JSON.parse(Buffer.from(b64, "base64url").toString("utf8"));
    } catch {
      return null;
    }
    const { fallback, redirect, exp } = state;
    const validFallback =
      typeof fallback === "string" &&
      fallback.startsWith("/") &&
      !fallback.startsWith("//");
    const validRedirect =
      redirect === undefined || typeof redirect === "string";

    if (validFallback && validRedirect && Date.now() <= exp)
      return { fallback, redirect };
  }
  return null;
}
