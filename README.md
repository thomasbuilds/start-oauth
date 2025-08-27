[![Banner](https://assets.solidjs.com/banner?background=tiles&type=Start&project=oauth)](https://github.com/solidjs/solid-start)

<div align="center">

[![Version](https://img.shields.io/npm/v/start-oauth.svg?style=for-the-badge&color=blue&logo=npm)](https://www.npmjs.com/package/start-oauth)
[![Downloads](https://img.shields.io/npm/dm/start-oauth.svg?style=for-the-badge&color=green&logo=npm)](https://www.npmjs.com/package/start-oauth)
[![Stars](https://img.shields.io/github/stars/thomasbuilds/start-oauth.svg?style=for-the-badge&color=yellow&logo=github)](https://github.com/thomasbuilds/start-oauth)
[![Prettier](https://img.shields.io/badge/code_style-prettier-ff69b4.svg?style=for-the-badge&logo=prettier&logoColor=white)](https://github.com/prettier/prettier)

</div>

**Lightweight and Secure OAuth2 for [SolidStart](https://start.solidjs.com)** — Access the `name`, `email`, and when available `image` of authenticated users.
For extended usage, the `provider` name and access `token` are included in the `oauth` object.

**Supported Providers:** Amazon, Discord, GitHub, Google, LinkedIn, Microsoft, Spotify, X, and Yahoo

## Installation

Install `start-oauth` as a dependency in your **SolidStart** app

```bash
# use preferred package manager
npm add start-oauth
```

## Configuration

Create a catch-all API route at `routes/api/oauth/[...oauth].ts`

```ts
import { redirect } from "@solidjs/router";
import OAuth from "start-oauth";

export const GET = OAuth({
  password: process.env.PASSWORD!, // openssl rand -hex 32
  discord: {
    id: process.env.DISCORD_ID!,
    secret: process.env.DISCORD_SECRET!
  },
  google: {
    id: process.env.GOOGLE_ID!,
    secret: process.env.GOOGLE_SECRET!
  },
  async handler({ name, email, image, oauth }, redirectTo) {
    // implement your logic (e.g. database call, session creation)
    const session = await getSession();
    await session.update({ name, email, image });

    // then redirect user
    return redirect(
      // only allow internal redirects
      redirectTo?.startsWith("/") && !redirectTo.startsWith("//")
        ? redirectTo
        : "/defaultPage"
    );
  }
});
```

In your OAuth provider's dashboard, set the redirect URIs

- **Production**: `https://your-domain.com/api/oauth/[provider]`
- **Development**: `http://localhost:3000/api/oauth/[provider]`

## Usage

```tsx
// for example in routes/login.tsx
import { useOAuthLogin } from "start-oauth";

export default function Login() {
  const login = useOAuthLogin();

  return (
    <div>
      <a href={login("discord")} rel="external">
        Sign in with Discord
      </a>
      <a href={login("google")} rel="external">
        Sign in with Google
      </a>
    </div>
  );
}
```

- To specify a post-login destination, append `?redirect=/dashboard` to the login URL—this value is passed as the `redirectTo` parameter to your handler.
- On authentication failure, users are redirected to the login page with `?error=<reason>` for custom error handling.

## Example

See `start-oauth` in action with the SolidStart [with-auth](https://github.com/solidjs/solid-start/tree/main/examples/with-auth) example

```bash
# using npm
npm create solid -- --s --t with-auth
```

```bash
# using pnpm
pnpm create solid --s --t with-auth
```

```bash
# using bun
bun create solid --s --t with-auth
```

## Security Features

- Stateless PKCE with SHA-256 code challenges
- AES-256-GCM encryption for state parameters to prevent tampering
- Timeout-protected HTTP requests to avoid hanging connections
- Strict validation of fallback URLs to prevent open redirects
