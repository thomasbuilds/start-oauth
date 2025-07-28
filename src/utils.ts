export const encode = (obj: Record<string, string | string[] | undefined>) => {
  const searchParams = new URLSearchParams();
  for (const [k, v] of Object.entries(obj)) {
    if (v === undefined) continue;
    const value = Array.isArray(v)
      ? v.filter((str) => str !== "").join(" ")
      : v;
    if (value === "") continue;
    searchParams.append(k, value);
  }
  return searchParams.toString();
};

export const sign = async (data: string, password: string) => {
  const encoder = new TextEncoder();
  const key = await crypto.subtle.importKey(
    "raw",
    encoder.encode(password),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );
  const signature = await crypto.subtle.sign("HMAC", key, encoder.encode(data));
  return Buffer.from(signature).toString("base64url");
};

export const encodeState = async (
  fallback: string,
  redirect: string | null,
  password: string
) => {
  const data = JSON.stringify({
    fallback,
    redirect: redirect ?? fallback,
    t: Date.now().toString(36),
  });
  const signature = await sign(data, password);
  const base64Data = Buffer.from(data, "utf8").toString("base64url");
  return `${signature}.${base64Data}`;
};

export const decodeState = async (state: string, password: string) => {
  try {
    const [signature, encoded] = state.split(".");
    if (!signature || !encoded) return null;
    const data = Buffer.from(encoded, "base64url").toString("utf8");
    if ((await sign(data, password)) !== signature) return null;
    const { fallback, redirect, t } = JSON.parse(data);
    if (Date.now() - parseInt(t, 36) > 5 * 60 * 1000) return null;
    return {
      fallback,
      redirect: redirect === fallback ? undefined : redirect,
    };
  } catch {
    return null;
  }
};
