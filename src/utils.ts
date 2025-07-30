import { createHmac, timingSafeEqual } from "crypto";

export const encode = (p: Record<string, string | string[]>) =>
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

export const sign = (data: string, password: string) =>
  createHmac("sha256", password).update(data).digest("base64url");

export const encodeState = (
  fallback: string,
  password: string,
  redirect?: string
) => {
  const data = JSON.stringify({
    fallback,
    redirect,
    t: Date.now().toString(36),
  });
  const signature = sign(data, password);
  const base64Data = Buffer.from(data, "utf8").toString("base64url");
  return `${signature}.${base64Data}`;
};

type parsedDecode = { fallback: string; redirect?: string; t: string };

export const decodeState = (state: string, password: string) => {
  try {
    const parts = state.split(".", 2);
    if (parts.length !== 2) return null;
    const [signature, encoded] = parts;
    const data = Buffer.from(encoded, "base64url").toString("utf8");
    const expectedSig = Buffer.from(sign(data, password), "base64url");
    const providedSig = Buffer.from(signature, "base64url");
    if (
      expectedSig.length !== providedSig.length ||
      !timingSafeEqual(providedSig, expectedSig)
    )
      return null;
    const { fallback, redirect, t }: parsedDecode = JSON.parse(data);
    if (Date.now() - parseInt(t, 36) > 5 * 60 * 1000) return null;
    return { fallback, redirect };
  } catch {
    return null;
  }
};
