import { createHash, randomBytes } from "crypto";

type Entry = { verifier: string; expires: number };
const TTL = 2 * 60 * 1000;

class PkceStore {
  private store = new Map<string, Entry>();
  constructor() {
    const timer = setInterval(() => this.cleanup(), TTL);
    timer.unref();
  }
  private cleanup() {
    const now = Date.now();
    for (const [k, v] of this.store) if (v.expires <= now) this.store.delete(k);
  }
  set(state: string, verifier: string) {
    this.store.set(state, { verifier, expires: Date.now() + TTL });
  }
  take(state: string) {
    const entry = this.store.get(state);
    if (!entry || entry.expires < Date.now()) {
      this.store.delete(state);
      return null;
    }
    this.store.delete(state);
    return entry.verifier;
  }
}

export const pkceStore = new PkceStore();

export function makePkcePair() {
  const verifier = randomBytes(32).toString("hex");
  const challenge = createHash("sha256")
    .update(verifier)
    .digest()
    .toString("base64url");
  return { verifier, challenge };
}
