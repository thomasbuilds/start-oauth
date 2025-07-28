import { encode } from "../utils";
import type { Methods } from "../types";

const spotify: Methods = {
  requestCode({ id, redirect_uri, state }) {
    const url = "https://accounts.spotify.com/authorize";
    const params = encode({
      response_type: "code",
      scope: "user-read-email",
      client_id: id,
      redirect_uri,
      state,
    });
    return url + "?" + params;
  },

  async requestToken({ id, secret, code, redirect_uri }) {
    const response = await fetch("https://accounts.spotify.com/api/token", {
      method: "post",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        Authorization: "Basic " + btoa(id + ":" + secret),
      },
      body: encode({ grant_type: "authorization_code", code, redirect_uri }),
    });
    if (!response.ok) throw new Error("failed to fetch access token");
    return response.json();
  },

  async requestUser(token) {
    const response = await fetch("https://api.spotify.com/v1/me", {
      headers: { Authorization: token },
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.message);
    return {
      name: data.display_name,
      email: data.email.toLowerCase(),
      image: data.images[0].url,
    };
  },
};

export default spotify;
