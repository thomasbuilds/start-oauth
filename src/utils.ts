export const encode = (params: Record<string, any>) =>
  Object.entries(params)
    .filter(([, v]) => v != null && v !== "")
    .map(([k, v]) =>
      Array.isArray(v)
        ? `${k}=${v.map(encodeURIComponent).join("+")}`
        : `${k}=${encodeURIComponent(v)}`
    )
    .join("&");

const sign = async (data: string) => {
  const encoder = new TextEncoder();
  const key = await crypto.subtle.importKey(
    "raw",
    encoder.encode(process.env.SESSION_SECRET!),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );
  const signature = await crypto.subtle.sign("HMAC", key, encoder.encode(data));
  return Array.from(new Uint8Array(signature), (b) =>
    b.toString(16).padStart(2, "0")
  ).join("");
};

export const encodeState = async (fallback: string, redirect?: string) => {
  const timestamp = Date.now().toString(36);
  const data = JSON.stringify({
    fallback,
    redirect: redirect || fallback,
    t: timestamp,
  });
  const signature = await sign(data);
  const state = `${signature}.${btoa(data)}`;
  return state.replace(/\+/g, "-").replace(/\//g, "_").replace(/=/g, "");
};

export const decodeState = async (state: string) => {
  try {
    const normalized = state.replace(/-/g, "+").replace(/_/g, "/");
    const [signature, encoded] = normalized.split(".");
    if (!signature || !encoded) return null;

    const data = atob(encoded);
    const expected = await sign(data);

    if (expected !== signature) return null;

    const { fallback, redirect, t } = JSON.parse(data);

    const timestamp = parseInt(t, 36);
    if (Date.now() - timestamp > 15 * 60 * 1000) return null;

    return {
      fallback,
      redirect: redirect === fallback ? undefined : redirect,
    };
  } catch {
    return null;
  }
};
