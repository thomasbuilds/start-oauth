[![Banner](https://assets.solidjs.com/banner?project=oauth)](https://github.com/solidjs)

# OAuth for SolidStart

[![Version](https://img.shields.io/npm/v/start-oauth.svg?style=for-the-badge&color=blue)](https://www.npmjs.com/package/start-oauth)
[![Downloads](https://img.shields.io/npm/dm/start-oauth.svg?style=for-the-badge&color=green)](https://www.npmjs.com/package/start-oauth)
[![Stars](https://img.shields.io/github/stars/thomasbuilds/start-oauth.svg?style=for-the-badge&color=yellow)](https://github.com/thomasbuilds/start-oauth)
[![Prettier](https://img.shields.io/badge/code_style-prettier-ff69b4.svg?style=for-the-badge)](https://github.com/prettier/prettier)

A lightweight and secure OAuth 2.1 implementation for [SolidStart](https://github.com/solidjs/solid-start). Access the `name`, `email`, and, when available, `image` of authenticated users. For extended API usage, the `provider` name and `token` (_access_token_) are included via the `oauth` object.

**Supported Providers:** Amazon, Discord, GitHub, Google, LinkedIn, Microsoft, Spotify, and Yahoo.

## 📦 Installation

```bash
# using npm
npm install start-oauth

# using pnpm
pnpm add start-oauth

# using bun
bun add start-oauth
```

## ⚙️ Configuration

Create a catch-all API route at `routes/api/oauth/[...oauth].ts`:

```ts
import { redirect } from "@solidjs/router";
import OAuth, { type Configuration } from "start-oauth";

const config: Configuration = {
  password: process.env.SESSION_SECRET,
  discord: {
    id: process.env.DISCORD_ID,
    secret: process.env.DISCORD_SECRET,
  },
  google: {
    id: process.env.GOOGLE_ID,
    secret: process.env.GOOGLE_SECRET,
  },
  async handler(user, redirectTo) {
    // implement your logic (e.g. database call, session creation)
    const session = await getSession();
    await session.update(user);

    // then you must redirect user
    return redirect(
      // only allow internal redirects
      redirectTo?.startsWith("/") && !redirectTo.startsWith("//")
        ? redirectTo
        : "/default"
    );
  },
};

export const GET = OAuth(config);
```

In your OAuth provider's dashboard, set the redirect URI to:

`https://your-domain.com/api/oauth/[provider]`

## 🔧 Usage

```tsx
// for example routes/login.tsx
import useOAuthLogin from "start-oauth/client";

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

## 🚀 Example

See `start-oauth` in action with the SolidStart [with-auth](https://github.com/solidjs/solid-start/tree/main/examples/with-auth) example:

```bash
# using npm
npm create solid@latest -- --solidstart --ts --template with-auth

# using pnpm
pnpm create solid@latest --solidstart --ts --template with-auth

# using bun
bun create solid@latest --solidstart --ts --template with-auth
```

## 🔒 Security Features

- Stateless PKCE with SHA-256 code challenges for enhanced security.
- AES-256-GCM encryption for state parameters to prevent tampering, leveraging the Web Crypto API for optimal performance.
- Timeout-protected HTTP requests to avoid hanging connections.
- Strict validation of fallback URLs to prevent open redirects.

## 🤝 Contributing

Contributions are welcome! To add a new provider, duplicate an existing [provider](src/providers/google.ts), update the configuration links, and submit a pull request!
