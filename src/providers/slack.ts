import { urlEncode, exchangeToken, fetchUser } from "../utils";
import type { Methods } from "../types";

// Slack does not document PKCE on its authorize endpoint; state and
// nonce cover the flow. Note sub is scoped to the Slack workspace.
const slack: Methods = {
  requestCode({ id, redirect_uri, state }) {
    const params = urlEncode({
      client_id: id,
      redirect_uri,
      response_type: "code",
      scope: ["openid", "profile", "email"],
      state,
      nonce: crypto.randomUUID()
    });
    return "https://slack.com/openid/connect/authorize?" + params;
  },
  async requestToken({ id, secret, code, redirect_uri }) {
    return exchangeToken(
      "https://slack.com/api/openid.connect.token",
      { id, secret },
      code,
      redirect_uri
    );
  },
  async requestUser(token) {
    const { sub, name, email, email_verified, picture } = await fetchUser(
      "https://slack.com/api/openid.connect.userInfo",
      token
    );
    if (!email) throw new Error("Email not available");
    if (!email_verified) throw new Error("Email not verified");
    return {
      name: name || email,
      email: email.toLowerCase(),
      image: picture,
      oauth: { provider: "slack", token, id: sub }
    };
  }
};

export default slack;
