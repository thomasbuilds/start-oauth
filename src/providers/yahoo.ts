import { urlEncode, exchangeToken, fetchUser } from "../utils";
import type { Methods } from "../types";

const yahoo: Methods = {
  requestCode({ id, redirect_uri, state, challenge }) {
    const params = urlEncode({
      client_id: id,
      redirect_uri,
      response_type: "code",
      scope: ["openid", "profile", "email"],
      state,
      nonce: crypto.randomUUID(),
      code_challenge: challenge,
      code_challenge_method: "S256"
    });
    return "https://api.login.yahoo.com/oauth2/request_auth?" + params;
  },
  async requestToken({ id, secret, code, redirect_uri, verifier }) {
    return exchangeToken(
      "https://api.login.yahoo.com/oauth2/get_token",
      { id, secret },
      code,
      redirect_uri,
      verifier
    );
  },
  async requestUser(token) {
    const { sub, name, email, email_verified, picture } = await fetchUser(
      "https://api.login.yahoo.com/openid/v1/userinfo",
      token
    );
    if (!email) throw new Error("Email not available");
    if (!email_verified) throw new Error("Email not verified");
    return {
      name,
      email: email.toLowerCase(),
      image: picture,
      oauth: { provider: "yahoo", token, id: sub }
    };
  }
};

export default yahoo;
