export async function fetchWithTimeout(
  input: RequestInfo,
  init: RequestInit = {}
) {
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), 5000);
  try {
    return await fetch(input, { ...init, signal: controller.signal });
  } finally {
    clearTimeout(id);
  }
}

export async function throwIfBad(res: Response): Promise<any> {
  const ct = res.headers.get("content-type") || "";
  if (!res.ok) {
    let body: any;
    try {
      body = ct.includes("application/json")
        ? await res.json()
        : await res.text();
    } catch {
      body = await res.text().catch(() => null);
    }
    const msgContent =
      typeof body === "object"
        ? JSON.stringify(body)
        : String(body) || res.statusText;
    throw new Error(msgContent);
  }
  return ct.includes("application/json") ? await res.json() : await res.text();
}
