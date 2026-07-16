import { urlEncode, exchangeToken, fetchUser } from "../utils";
import type { Methods } from "../types";

// GitHub requires a User-Agent and documents credentials in the body;
// its token endpoint reports errors with http 200, caught centrally.
const headers = {
  Accept: "application/vnd.github+json",
  "X-GitHub-Api-Version": "2022-11-28"
};

const github: Methods = {
  requestCode({ id, redirect_uri, state, challenge }) {
    const params = urlEncode({
      scope: "user:email",
      client_id: id,
      redirect_uri,
      state,
      code_challenge: challenge,
      code_challenge_method: "S256"
    });
    return "https://github.com/login/oauth/authorize?" + params;
  },
  async requestToken({ id, secret, code, redirect_uri, verifier }) {
    return exchangeToken(
      "https://github.com/login/oauth/access_token",
      { id, secret },
      code,
      redirect_uri,
      verifier,
      true
    );
  },
  async requestUser(token) {
    const [{ id, name, login, avatar_url }, emails]: [
      { id: number; name: string | null; login: string; avatar_url: string },
      { email: string; primary: boolean; verified: boolean }[]
    ] = await Promise.all([
      fetchUser("https://api.github.com/user", token, headers),
      fetchUser("https://api.github.com/user/emails", token, headers)
    ]);
    const primary = emails.find(({ primary, verified }) => primary && verified);
    if (!primary) throw new Error("Email not verified");
    return {
      name: name ?? login,
      email: primary.email.toLowerCase(),
      image: avatar_url,
      oauth: { provider: "github", token, id: String(id) }
    };
  }
};

export default github;
