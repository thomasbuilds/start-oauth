<img width="100%" src="https://assets.solidjs.com/banner?project=start-oauth" alt="Banner">

# OAuth2 for SolidStart

[![NPM](https://img.shields.io/npm/v/start-oauth.svg)](https://www.npmjs.com/package/start-oauth)
[![code style: prettier](https://img.shields.io/badge/code_style-prettier-ff69b4.svg?style=flat-square)](https://github.com/prettier/prettier)
[![Downloads](https://img.shields.io/npm/dm/start-oauth.svg)](https://www.npmjs.com/package/start-oauth)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](/LICENSE)

Secure OAuth2 integration for SolidStart. Returns the `name`, `email` and `image` of authenticated users.

**Supports:** Discord, GitHub, Google and Spotify

## Installation

```bash
# npm
npm install start-oauth

#pnpm
pnpm add start-oauth
```

## Configuration

```ts
// must be in routes/api/oauth/[...oauth].ts
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
    //create user session and then redirect user
    const session = await getSession();
    await session.update({ user });
    return redirect(redirectTo || "/myaccount");
  },
};

export const GET = OAuth(config);
```

**Required environment variables:**

- `SESSION_SECRET` - Min 32 characters for CSRF protection
- Provider credentials (`GOOGLE_ID`, `GOOGLE_SECRET`, ...)

## Usage

```tsx
// in routes/login.tsx for example
import { A } from "@solidjs/router";
import { useOAuthLogin } from "start-oauth";

export default function Login() {
  const login = useOAuthLogin();

  return (
    <A href={login("google")} rel="external">
      Login with Google
    </A>
  );
}
```

- Errors redirect to the requesting page (here login.tsx) with `?error=reason`
- Add `?redirect=/path` on the requesting page to redirect users after successful sign in

Set redirect URI: `https://yourdomain.com/api/oauth/[provider]`

## Contributing

Issues and PRs welcome, especially for new provider support.
