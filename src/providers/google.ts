import { urlEncode, exchangeToken, fetchUser } from "../utils";
import type { Methods } from "../types";

const google: Methods = {
  requestCode({ id, redirect_uri, state, challenge }) {
    const params = urlEncode({
      client_id: id,
      redirect_uri,
      response_type: "code",
      // authentication requests must begin with openid
      scope: ["openid", "profile", "email"],
      state,
      code_challenge: challenge,
      code_challenge_method: "S256"
    });
    return "https://accounts.google.com/o/oauth2/v2/auth?" + params;
  },
  async requestToken({ id, secret, code, redirect_uri, verifier }) {
    return exchangeToken(
      "https://oauth2.googleapis.com/token",
      { id, secret },
      code,
      redirect_uri,
      verifier
    );
  },
  async requestUser(token) {
    const { sub, name, given_name, email, email_verified, picture } =
      await fetchUser(
        "https://openidconnect.googleapis.com/v1/userinfo",
        token
      );
    if (!email) throw new Error("Email not available");
    // google is not authoritative for every address on an account
    if (!email_verified) throw new Error("Email not verified");
    return {
      name: name ?? given_name ?? email,
      email: email.toLowerCase(),
      image: picture,
      oauth: { provider: "google", token, id: sub }
    };
  }
};

export default google;
