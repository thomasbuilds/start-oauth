import { encode } from "../utils";
import type { Methods } from "../types";

const discord: Methods = {
  requestCode({ id, redirect_uri, state }) {
    const url = "https://discord.com/oauth2/authorize";
    const params = encode({
      response_type: "code",
      scope: ["identify", "email"],
      client_id: id,
      redirect_uri,
      state,
    });
    return url + "?" + params;
  },

  async requestToken({ id, secret, code, redirect_uri }) {
    const response = await fetch("https://discord.com/api/oauth2/token", {
      method: "post",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: encode({
        grant_type: "authorization_code",
        client_id: id,
        client_secret: secret,
        code,
        redirect_uri,
      }),
    });
    if (!response.ok) throw new Error("failed to fetch access token");
    return response.json();
  },

  async requestUser(token) {
    const response = await fetch("https://discord.com/api/users/@me", {
      headers: { Authorization: token },
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.message);
    return {
      name: data.username,
      email: data.email.toLowerCase(),
      image: `https://cdn.discordapp.com/avatars/${data.id}/${data.avatar}.png`,
    };
  },
};

export default discord;
