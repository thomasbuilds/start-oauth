# OAuth2 for SolidStart

[![NPM](https://img.shields.io/npm/v/start-oauth.svg)](https://www.npmjs.com/package/start-oauth)
[![code style: prettier](https://img.shields.io/badge/code_style-prettier-ff69b4.svg?style=flat-square)](https://github.com/prettier/prettier)
[![Downloads](https://img.shields.io/npm/dm/start-oauth.svg)](https://www.npmjs.com/package/start-oauth)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](/LICENSE)

Secure OAuth2 integration for SolidStart. Returns the `name`, `email` and `image` of authenticated users.

**Supports:** Discord, GitHub, Google and Spotify

## Installation

```bash
npm install start-oauth
```

## Configuration

```ts
// src/routes/api/oauth/[...oauth].ts
import { redirect } from "@solidjs/router";
import OAuth, { type Configuration } from "start-oauth";

const config: Configuration = {
  google: {
    id: process.env.GOOGLE_ID!,
    secret: process.env.GOOGLE_SECRET!,
  },
  async handler(user, r) {
    //create user session and then redirect user
    return redirect(r || "/myaccount");
  },
};

export const GET = OAuth(config);
```

**Required environment variables:**
- `SESSION_SECRET` - Min 32 characters for CSRF protection
- Provider credentials (e.g., `GOOGLE_ID`, `GOOGLE_SECRET`)

## Usage

```tsx
import { useOAuthLogin } from "start-oauth";

export default function Login() {
  const requestLogin = useOAuthLogin();

  return (
    <a href={requestLogin("google")} rel="external">
      Login with Google
    </a>
  );
}
```

- Errors redirect to the requesting page with `?error=reason`
- Add `?redirect=/path` to return users to a specific page after login

Set redirect URI: `https://yourdomain.com/api/oauth/[provider]`

## Contributing

Issues and PRs welcome, especially for new provider support.
