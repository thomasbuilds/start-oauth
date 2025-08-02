import { urlEncode, exchangeToken, fetchUser } from "../utils";
import type { Methods } from "../types";

const amazon: Methods = {
  requestCode({ id, redirect_uri, state, challenge }) {
    const params = urlEncode({
      response_type: "code",
      scope: "profile",
      client_id: id,
      redirect_uri,
      state,
      code_challenge: challenge,
      code_challenge_method: "S256",
    });
    return "https://www.amazon.com/ap/oa?" + params;
  },
  async requestToken({ id, secret, code, redirect_uri, verifier }) {
    return exchangeToken(
      "https://api.amazon.com/auth/o2/token",
      { id, secret },
      code,
      redirect_uri,
      verifier
    );
  },
  async requestUser(token) {
    const { name, email } = await fetchUser(
      "https://api.amazon.com/user/profile",
      token
    );
    if (!email) throw new Error("Email not available");
    return { name, email: email.toLowerCase() };
  },
};

export default amazon;
