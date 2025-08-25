const deriveKey = async (secret: string) =>
  crypto.subtle.deriveKey(
    {
      name: "PBKDF2",
      salt: Buffer.from("oauth-state-pbkdf2"),
      iterations: 100000,
      hash: "SHA-256"
    },
    await crypto.subtle.importKey("raw", Buffer.from(secret), "PBKDF2", false, [
      "deriveKey"
    ]),
    { name: "AES-GCM", length: 256 },
    false,
    ["encrypt", "decrypt"]
  );

type BaseState = { fallback: string; redirect?: string };
type State = BaseState & { exp: number; verifier: string };

export async function makeState(
  { fallback, redirect }: BaseState,
  secret: string
) {
  const verifier = Buffer.from(
    crypto.getRandomValues(new Uint8Array(32))
  ).toString("hex");
  const digest = await crypto.subtle.digest("SHA-256", Buffer.from(verifier));
  const challenge = Buffer.from(digest).toString("base64url");
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const encrypted = await crypto.subtle.encrypt(
    { name: "AES-GCM", iv },
    await deriveKey(secret),
    Buffer.from(
      JSON.stringify({
        fallback,
        redirect,
        exp: Date.now() + 180000,
        verifier
      })
    )
  );
  const state = Buffer.from([...iv, ...new Uint8Array(encrypted)]).toString(
    "base64url"
  );
  return { state, challenge };
}

export async function decodeState(token: string, secret: string) {
  try {
    const data = Buffer.from(token, "base64url");
    if (data.length < 28) return null;
    const decrypted = await crypto.subtle.decrypt(
      { name: "AES-GCM", iv: data.subarray(0, 12) },
      await deriveKey(secret),
      data.subarray(12)
    );
    const { fallback, redirect, exp, verifier }: State = JSON.parse(
      Buffer.from(decrypted).toString("utf8")
    );
    const okFallback =
      typeof fallback === "string" &&
      fallback.startsWith("/") &&
      !fallback.startsWith("//");
    const okRedirect = redirect === undefined || typeof redirect === "string";
    const okVerifier =
      typeof verifier === "string" &&
      verifier.length >= 43 &&
      verifier.length <= 128;
    return okFallback && okRedirect && okVerifier && Date.now() <= exp
      ? { fallback, redirect, verifier }
      : null;
  } catch {
    return null;
  }
}
