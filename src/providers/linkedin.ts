import { urlEncode, exchangeToken, fetchUser } from "../utils";
import type { Methods } from "../types";

// LinkedIn ignores Basic auth and only supports PKCE for gated native
// apps, so credentials go in the body and no challenge is sent.
const linkedin: Methods = {
  requestCode({ id, redirect_uri, state }) {
    const params = urlEncode({
      client_id: id,
      redirect_uri,
      response_type: "code",
      scope: ["openid", "profile", "email"],
      state
    });
    return "https://www.linkedin.com/oauth/v2/authorization?" + params;
  },
  async requestToken({ id, secret, code, redirect_uri }) {
    return exchangeToken(
      "https://www.linkedin.com/oauth/v2/accessToken",
      { id, secret },
      code,
      redirect_uri,
      undefined,
      true
    );
  },
  async requestUser(token) {
    const {
      sub,
      name,
      given_name,
      family_name,
      email,
      email_verified,
      picture
    } = await fetchUser("https://api.linkedin.com/v2/userinfo", token);
    if (!email) throw new Error("Email not available");
    if (email_verified !== true) throw new Error("Email not verified");
    return {
      name: name ?? `${given_name} ${family_name}`,
      email: email.toLowerCase(),
      image: picture,
      oauth: { provider: "linkedin", token, id: sub }
    };
  }
};

export default linkedin;
