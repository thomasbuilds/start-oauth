import { urlEncode, exchangeToken, fetchUser } from "../utils";
import type { Methods } from "../types";

const spotify: Methods = {
  requestCode({ id, redirect_uri, state, challenge }) {
    const params = urlEncode({
      client_id: id,
      response_type: "code",
      redirect_uri,
      scope: "user-read-private user-read-email",
      state,
      code_challenge: challenge,
      code_challenge_method: "S256",
    });
    return "https://accounts.spotify.com/authorize?" + params;
  },
  async requestToken({ id, secret, code, redirect_uri, verifier }) {
    return exchangeToken(
      "https://accounts.spotify.com/api/token",
      { id, secret },
      code,
      redirect_uri,
      verifier
    );
  },
  async requestUser(token) {
    const { display_name, email, images } = await fetchUser(
      "https://api.spotify.com/v1/me",
      token
    );
    if (!email) throw new Error("Email not available");
    return {
      name: display_name,
      email: email.toLowerCase(),
      image: images?.[0]?.url,
    };
  },
};

export default spotify;
