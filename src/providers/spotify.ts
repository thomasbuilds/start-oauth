import {
  makePkcePair,
  pkceStore,
  urlEncode,
  exchangeToken,
  fetchUser,
} from "../utils";
import type { Methods } from "../types";

const spotify: Methods = {
  requestCode({ id, redirect_uri, state }) {
    const { verifier, challenge } = makePkcePair();
    pkceStore.set(state, verifier);
    const params = urlEncode({
      response_type: "code",
      scope: "user-read-email",
      client_id: id,
      redirect_uri,
      state,
      code_challenge: challenge,
      code_challenge_method: "S256",
    });
    return `https://accounts.spotify.com/authorize?${params}`;
  },

  async requestToken({ id, secret, code, redirect_uri, state }) {
    const verifier = pkceStore.take(state);
    if (!verifier) throw new Error("Invalid or expired PKCE verifier");
    return exchangeToken(
      "https://accounts.spotify.com/api/token",
      { id, secret },
      code,
      redirect_uri,
      state,
      verifier
    );
  },

  async requestUser(token) {
    const { email, display_name, images } = await fetchUser(
      "https://api.spotify.com/v1/me",
      token
    );
    if (!email) throw new Error("Email not verified");
    return {
      name: display_name,
      email: email.toLowerCase(),
      image: images?.[0]?.url,
    };
  },
};

export default spotify;
