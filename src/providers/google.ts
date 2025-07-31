import {
  makePkcePair,
  pkceStore,
  urlEncode,
  exchangeToken,
  fetchUser,
} from "../utils";
import type { Methods } from "../types";

const google: Methods = {
  requestCode({ id, redirect_uri, state }) {
    const { verifier, challenge } = makePkcePair();
    pkceStore.set(state, verifier);
    const params = urlEncode({
      scope: ["profile", "email"],
      response_type: "code",
      client_id: id,
      redirect_uri,
      state,
      code_challenge: challenge,
      code_challenge_method: "S256",
    });
    return `https://accounts.google.com/o/oauth2/v2/auth?${params}`;
  },
  async requestToken({ id, secret, code, redirect_uri, state }) {
    const verifier = pkceStore.take(state);
    if (!verifier) throw new Error("Invalid or expired PKCE verifier");
    return exchangeToken(
      "https://oauth2.googleapis.com/token",
      { id, secret },
      code,
      redirect_uri,
      state,
      verifier
    );
  },
  async requestUser(token) {
    const { email_verified, name, email, picture } = await fetchUser(
      "https://www.googleapis.com/oauth2/v3/userinfo",
      token
    );
    if (!email_verified) throw new Error("Email not verified");
    return { name, email: email.toLowerCase(), image: picture };
  },
};

export default google;
