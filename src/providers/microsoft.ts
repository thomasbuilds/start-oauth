import { urlEncode, exchangeToken, fetchUser } from "../utils";
import type { Methods } from "../types";

const microsoft: Methods = {
  requestCode({ id, redirect_uri, state, challenge }) {
    const params = urlEncode({
      client_id: id,
      redirect_uri,
      response_type: "code",
      scope: "User.Read",
      state,
      code_challenge: challenge,
      code_challenge_method: "S256"
    });
    return (
      "https://login.microsoftonline.com/common/oauth2/v2.0/authorize?" + params
    );
  },
  async requestToken({ id, secret, code, redirect_uri, verifier }) {
    return exchangeToken(
      "https://login.microsoftonline.com/common/oauth2/v2.0/token",
      { id, secret },
      code,
      redirect_uri,
      verifier
    );
  },
  async requestUser(token) {
    const { displayName, mail } = await fetchUser(
      "https://graph.microsoft.com/v1.0/me?$select=displayName,mail",
      token
    );
    if (!mail) throw new Error("Email not available");
    return {
      name: displayName,
      email: mail.toLowerCase(),
      oauth: { provider: "microsoft", token }
    };
  }
};

export default microsoft;
