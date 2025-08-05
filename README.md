[![Banner](https://assets.solidjs.com/banner?project=start-oauth)](https://github.com/thomasbuilds/start-oauth)

# OAuth2 for SolidStart

[![NPM Version](https://img.shields.io/npm/v/start-oauth.svg?style=for-the-badge)](https://www.npmjs.com/package/start-oauth)
[![Downloads](https://img.shields.io/npm/dm/start-oauth.svg?style=for-the-badge)](https://www.npmjs.com/package/start-oauth)
[![Prettier](https://img.shields.io/badge/code_style-prettier-ff69b4.svg?style=for-the-badge)](https://github.com/prettier/prettier)

Secure and lightweight OAuth 2.1 for [SolidStart](https://github.com/solidjs/solid-start). Returns the `name`, `email`, and `image` of authenticated users.

**Supports:** Amazon, Discord, GitHub, Google, Linkedin, Microsoft, Spotify, and Yahoo

## 📦 Installation

```bash
# npm
npm install start-oauth

# pnpm
pnpm add start-oauth
```

## ⚙️ Configuration

Create a catch-all API route at `routes/api/oauth/[...oauth].ts`

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
    // Add your logic (e.g. db call, create session)
    const session = await getSession();
    await session.update(user);

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

In your OAuth provider dashboard, configure the redirect URI to:

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

- To customize the post-login destination, append `?redirect=/dashboard` to the login URL—this value is forwarded as the `redirectTo` parameter in your handler.
- On authentication failure, the user returns to the login page with `?error=<reason>` for custom error handling.

## 🚀 Example

Explore `start-oauth` in action with the SolidStart [with-auth](https://github.com/solidjs/solid-start/tree/main/examples/with-auth) example.

```bash
pnpm create solid --solidstart --ts --template with-auth with-auth-example
```

## 🔒 Security Features

- Stateless PKCE with SHA-256 code challenges.
- AES-256-GCM encryption for state parameters to prevent tampering, using Web Crypto API for modern performance.
- Timeout-protected HTTP requests to mitigate hanging connections.
- Strict validation on fallback URLs to prevent open redirects.

## 🤝 Contributing

Contributions are welcome! To add a new provider, copy an existing [provider](src/providers/google.ts), update the links to match the new configuration, and submit a PR 🎉.
