[![Banner](https://assets.solidjs.com/banner?project=start-oauth)](https://github.com/thomasbuilds/start-oauth)

# OAuth2 for SolidStart

[![NPM Version](https://img.shields.io/npm/v/start-oauth.svg?style=for-the-badge)](https://www.npmjs.com/package/start-oauth)
[![Downloads](https://img.shields.io/npm/dm/start-oauth.svg?style=for-the-badge)](https://www.npmjs.com/package/start-oauth)
[![Prettier](https://img.shields.io/badge/code_style-prettier-ff69b4.svg?style=for-the-badge)](https://github.com/prettier/prettier)

Secure and lightweight OAuth 2.0 for [SolidStart](https://github.com/solidjs/solid-start). Returns the `name`, `email` and `image` of authenticated users.

**Supports:** Discord, GitHub, Google, Spotify

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
  google: {
    id: process.env.GOOGLE_ID!,
    secret: process.env.GOOGLE_SECRET!,
  },
  github: {
    id: process.env.GITHUB_ID!,
    secret: process.env.GITHUB_SECRET!,
  },
  async handler(user, redirectTo) {
    // create user session and redirect user
    const session = await getSession();
    await session.update(user);
    return redirect(redirectTo || "/defaultRedirect");
  },
};

export const GET = OAuth(config);
```

Ensure the following environment variables are set:

- `SESSION_SECRET` - min. 32 chars, for CSRF protection
- `GOOGLE_ID`, `GOOGLE_SECRET`, etc

In your OAuth provider dashboard, configure the redirect URI to:

`https://your-domain.com/api/oauth/[provider]`

## 💡 Usage

```tsx
// for example routes/login.tsx
import { A } from "@solidjs/router";
import { useOAuthLogin } from "start-oauth";

export default function Login() {
  const login = useOAuthLogin();

  return (
    <A href={login("google")} rel="external">
      Sign in with Google
    </A>
  );
}
```

- To customize the post-login destination, append `?redirect=/dashboard` to the login URL—this value is forwarded as the `redirectTo` parameter in your handler.
- On authentication failure, the user returns to the login page with `?error=<reason>` for custom error handling.

## 🤝 Contributing

Contributions are welcome! To add a new provider, copy an existing [provider](src/providers/google.ts), update the links to match the new configuration, and submit a PR 🎉.

---

⭐ Learn how to setup session context and route protection [here](https://gist.github.com/thomasbuilds/d1f7a2e534189dadb42c429309766d48#file-solidstart-auth-context-md).
