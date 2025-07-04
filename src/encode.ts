export default (params: Record<string, any>) =>
  Object.entries(params)
    .filter(([, v]) => v != null && v !== "")
    .map(([k, v]) =>
      Array.isArray(v)
        ? `${k}=${v.map(encodeURIComponent).join("+")}`
        : `${k}=${encodeURIComponent(v)}`
    )
    .join("&");
