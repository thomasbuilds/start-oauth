import encode from "../encode";
import type { Methods, Spotify } from "../types";

export default {
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
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        Authorization: "Basic " + btoa(id + ":" + secret),
      },
      body: encode({ grant_type: "authorization_code", code, redirect_uri }),
    });
    if (response.status !== 200)
      throw new Error("failed to fetch access token");
    return await response.json();
  },

  async requestUser(token) {
    const response = await fetch("https://api.spotify.com/v1/me", {
      headers: { Authorization: token },
    });
    const data = await response.json();
    if (response.status !== 200) throw new Error(data.message);
    const { display_name, email, images }: Spotify = data;
    return {
      name: display_name,
      email: email.toLowerCase(),
      image: images[0].url,
    };
  },
} as Methods;
