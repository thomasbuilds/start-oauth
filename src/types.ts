import type { CustomResponse } from "@solidjs/router";
import type { Provider } from "./providers";

export interface Identifiers {
  id: string;
  secret: string;
}

export interface User {
  name: string;
  email: string;
  image?: string;
}

export type Configuration = Partial<Record<Provider, Identifiers>> & {
  password?: string;
  handler: (user: User, redirectTo?: string) => Promise<CustomResponse<never>>;
};

export interface Methods {
  requestCode(
    config: Identifiers & { redirect_uri: string; state: string }
  ): string;
  requestToken(
    config: Identifiers & { redirect_uri: string; code: string }
  ): Promise<{ token_type: string; access_token: string }>;
  requestUser(token: string): Promise<User>;
}
