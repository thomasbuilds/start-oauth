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

export async function throwIfBad(response: Response) {
  const ct = response.headers.get("content-type") || "";
  if (!response.ok) {
    let body: any;
    try {
      body = ct.includes("application/json")
        ? await response.json()
        : await response.text();
    } catch {
      body = await response.text().catch(() => null);
    }
    const msg =
      typeof body === "object"
        ? JSON.stringify(body)
        : String(body) || response.statusText;
    throw new Error(msg);
  }
  return ct.includes("application/json")
    ? await response.json()
    : await response.text();
}
