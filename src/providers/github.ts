import { urlEncode, exchangeToken, fetchUser } from "../utils";
import type { Methods } from "../types";

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
      verifier
    );
  },
  async requestUser(token) {
    const [{ name, avatar_url }, emails] = await Promise.all([
      fetchUser("https://api.github.com/user", token),
      fetchUser("https://api.github.com/user/emails", token)
    ]);
    const primary = emails.find(({ primary, verified }) => primary && verified);
    if (!primary) throw new Error("Email not verified");
    return {
      name,
      email: primary.email.toLowerCase(),
      image: avatar_url,
      oauth: { provider: "github", token }
    };
  }
};

export default github;
