import { urlEncode, exchangeToken, fetchUser } from "../utils";
import type { Methods } from "../types";

const x: Methods = {
  requestCode({ id, redirect_uri, state, challenge }) {
    const params = urlEncode({
      client_id: id,
      redirect_uri,
      response_type: "code",
      scope: ["users.email", "users.read", "offline.access"],
      state,
      code_challenge: challenge,
      code_challenge_method: "S256"
    });
    return "https://x.com/i/oauth2/authorize?" + params;
  },
  async requestToken({ id, secret, code, redirect_uri, verifier }) {
    return exchangeToken(
      "https://api.x.com/2/oauth2/token",
      { id, secret },
      code,
      redirect_uri,
      verifier
    );
  },
  async requestUser(token) {
    const { data } = await fetchUser(
      "https://api.x.com/2/users/me?user.fields=confirmed_email,name,profile_image_url",
      token
    );
    if (!data.confirmed_email) throw new Error("Email not available");
    return {
      name: data.name,
      email: data.confirmed_email.toLowerCase(),
      image: data.profile_image_url,
      oauth: { provider: "x", token }
    };
  }
};

export default x;
