import { urlEncode, exchangeToken, fetchUser } from "../utils";
import type { Methods } from "../types";

const linkedin: Methods = {
  requestCode({ id, redirect_uri, state, challenge }) {
    const params = urlEncode({
      client_id: id,
      redirect_uri,
      response_type: "code",
      scope: ["openid", "profile", "email"],
      state,
      code_challenge: challenge,
      code_challenge_method: "S256",
    });
    return "https://www.linkedin.com/oauth/v2/authorization?" + params;
  },
  async requestToken({ id, secret, code, redirect_uri, verifier }) {
    return exchangeToken(
      "https://www.linkedin.com/oauth/v2/accessToken",
      { id, secret },
      code,
      redirect_uri,
      verifier
    );
  },
  async requestUser(token) {
    const { given_name, family_name, email, picture } = await fetchUser(
      "https://api.linkedin.com/v2/userinfo",
      token
    );
    if (!email) throw new Error("Email not available");
    return {
      name: `${given_name} ${family_name}`,
      email: email.toLowerCase(),
      image: picture,
      oauth: { provider: "linkedin", token },
    };
  },
};

export default linkedin;
