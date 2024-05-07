# OAuth2 for SolidStart

[![NPM](https://img.shields.io/npm/v/start-oauth.svg)](https://www.npmjs.com/package/start-oauth)

This package returns the `name`, `email` and `image` of user authenticated through third party services (supporting Discord, GitHub, Google and Spotify as of now).

## Installation

```bash
# npm
npm install start-oauth

# pnpm
pnpm add start-oauth
```

## Configuration

```ts
//MUST BE api/oauth/[...oauth].ts
import OAuth, { type Configuration } from "start-oauth";

const configuration: Configuration = {
  google: {
    id: process.env.GOOGLE_ID as string,
    secret: process.env.GOOGLE_SECRET as string,
    state: process.env.STATE, //optional XSRF protection
  },
  async handler(user, redirect) {
    //create user session
  },
};

export const GET = OAuth(configuration);
```

- In case of error, you are redirected to page requesting login and `error` parameter specifies reason.
- Adding a `redirect` search parameter on page requesting login gives you access to the value on handler function.

```tsx
//login.tsx for example
export default function Login() {
  const requestLogin = useOAuthLogin();

  return (
    <div>
      <a href={requestLogin("google")} rel="external">
        <GoogleIcon />
      </a>
    </div>
  );
}
```

The package doesn’t provide the session management.
This gives you complete control over redirections and you can seamlessly integrate multiple authentication methods sharing the same logic.

## Contributions

Please open issues for bugs and we much appreciate contributions for more provider support.
