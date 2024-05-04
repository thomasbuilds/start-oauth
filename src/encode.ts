export default (params: Record<string, any>) =>
  Object.entries(params)
    .filter(([_, value]) => value)
    .map(([key, value]) =>
      Array.isArray(value)
        ? `${key}=${value.map(encodeURIComponent).join("+")}`
        : `${key}=${encodeURIComponent(value)}`
    )
    .join("&");
