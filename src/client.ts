import { useLocation, useSearchParams } from "@solidjs/router";
import type { Provider } from "./providers";

export default function useOAuthLogin() {
  const location = useLocation();
  const [searchParams] = useSearchParams();

  return (provider: Provider) => {
    const params = new URLSearchParams();
    params.set("fallback", location.pathname);
    if (typeof searchParams.redirect === "string")
      params.set("redirect", searchParams.redirect);
    return `/api/oauth/${provider}?${params.toString()}`;
  };
}
