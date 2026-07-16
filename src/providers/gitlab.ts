import { urlEncode, exchangeToken, fetchUser } from "../utils";
import type { Methods } from "../types";

const gitlab: Methods = {
  requestCode({ id, redirect_uri, state, challenge }) {
    const params = urlEncode({
      client_id: id,
      redirect_uri,
      response_type: "code",
      scope: ["openid", "email"],
      state,
      code_challenge: challenge,
      code_challenge_method: "S256"
    });
    return "https://gitlab.com/oauth/authorize?" + params;
  },
  async requestToken({ id, secret, code, redirect_uri, verifier }) {
    return exchangeToken(
      "https://gitlab.com/oauth/token",
      { id, secret },
      code,
      redirect_uri,
      verifier
    );
  },
  async requestUser(token) {
    const { sub, name, nickname, email, email_verified, picture } =
      await fetchUser("https://gitlab.com/oauth/userinfo", token);
    if (!email) throw new Error("Email not available");
    if (!email_verified) throw new Error("Email not verified");
    return {
      name: name ?? nickname,
      email: email.toLowerCase(),
      image: picture,
      oauth: { provider: "gitlab", token, id: sub }
    };
  }
};

export default gitlab;
