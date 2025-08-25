import { urlEncode, exchangeToken, fetchUser } from "../utils";
import type { Methods } from "../types";

const google: Methods = {
  requestCode({ id, redirect_uri, state, challenge }) {
    const params = urlEncode({
      client_id: id,
      redirect_uri,
      response_type: "code",
      scope: "profile email",
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
    const { name, email, picture } = await fetchUser(
      "https://www.googleapis.com/oauth2/v3/userinfo",
      token
    );
    if (!email) throw new Error("Email not available");
    return {
      name,
      email: email.toLowerCase(),
      image: picture,
      oauth: { provider: "google", token }
    };
  }
};

export default google;
