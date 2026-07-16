import { urlEncode, exchangeToken, fetchUser } from "../utils";
import type { Methods } from "../types";

// Twitch only reads credentials from the body, has no PKCE, and
// returns non-default claims only when requested via the claims param.
const twitch: Methods = {
  requestCode({ id, redirect_uri, state }) {
    const params = urlEncode({
      client_id: id,
      redirect_uri,
      response_type: "code",
      scope: ["openid", "user:read:email"],
      state,
      claims: JSON.stringify({
        userinfo: {
          email: null,
          email_verified: null,
          picture: null,
          preferred_username: null
        }
      })
    });
    return "https://id.twitch.tv/oauth2/authorize?" + params;
  },
  async requestToken({ id, secret, code, redirect_uri }) {
    return exchangeToken(
      "https://id.twitch.tv/oauth2/token",
      { id, secret },
      code,
      redirect_uri,
      undefined,
      true
    );
  },
  async requestUser(token) {
    const { sub, preferred_username, email, email_verified, picture } =
      await fetchUser("https://id.twitch.tv/oauth2/userinfo", token);
    if (!email || !email_verified) throw new Error("Email not verified");
    return {
      name: preferred_username ?? sub,
      email: email.toLowerCase(),
      image: picture,
      oauth: { provider: "twitch", token, id: sub }
    };
  }
};

export default twitch;
