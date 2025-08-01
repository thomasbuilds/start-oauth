import {
  randomBytes,
  createHash,
  createCipheriv,
  createDecipheriv,
} from "crypto";

const deriveKey = (secret: string) =>
  createHash("sha256").update(secret, "utf8").digest();

type BaseState = { fallback: string; redirect?: string };
type State = BaseState & { exp: number; verifier: string };

export function makeState({ fallback, redirect }: BaseState, secret: string) {
  const verifier = randomBytes(32).toString("hex");
  const challenge = createHash("sha256")
    .update(verifier)
    .digest()
    .toString("base64url");

  const stateObj = { fallback, redirect, exp: Date.now() + 180000, verifier };
  const plaintext = Buffer.from(JSON.stringify(stateObj));
  const iv = randomBytes(12);
  const cipher = createCipheriv("aes-256-gcm", deriveKey(secret), iv);
  const encrypted = Buffer.concat([
    cipher.update(plaintext),
    cipher.final(),
    cipher.getAuthTag(),
  ]);
  const state = Buffer.concat([iv, encrypted]).toString("base64url");
  return { state, challenge };
}

export function decodeState(token: string, secret: string) {
  try {
    const data = Buffer.from(token, "base64url");
    if (data.length < 28) return null;

    const iv = data.subarray(0, 12);
    const tag = data.subarray(-16);
    const ciphertext = data.subarray(12, data.length - 16);
    const decipher = createDecipheriv("aes-256-gcm", deriveKey(secret), iv);
    decipher.setAuthTag(tag);

    const jsonBuf = Buffer.concat([
      decipher.update(ciphertext),
      decipher.final(),
    ]);
    const { fallback, redirect, exp, verifier }: State = JSON.parse(
      jsonBuf.toString("utf8")
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
