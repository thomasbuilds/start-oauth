import { urlEncode, exchangeToken, fetchUser } from "../utils";
import type { Methods } from "../types";

const discord: Methods = {
  requestCode({ id, redirect_uri, state, challenge }) {
    const params = urlEncode({
      response_type: "code",
      scope: ["identify", "email"],
      client_id: id,
      redirect_uri,
      state,
      code_challenge: challenge,
      code_challenge_method: "S256"
    });
    return "https://discord.com/oauth2/authorize?" + params;
  },
  async requestToken({ id, secret, code, redirect_uri, verifier }) {
    return exchangeToken(
      "https://discord.com/api/oauth2/token",
      { id, secret },
      code,
      redirect_uri,
      verifier
    );
  },
  async requestUser(token) {
    const { verified, email, username, global_name, id, avatar } =
      await fetchUser("https://discord.com/api/users/@me", token);
    if (!verified || !email) throw new Error("Email not verified");
    return {
      // username is the unique handle; global_name the display name
      name: global_name ?? username,
      email: email.toLowerCase(),
      image: avatar
        ? `https://cdn.discordapp.com/avatars/${id}/${avatar}.${avatar.startsWith("a_") ? "gif" : "png"}`
        : `https://cdn.discordapp.com/embed/avatars/${Number(BigInt(id) >> 22n) % 6}.png`,
      oauth: { provider: "discord", token, id }
    };
  }
};

export default discord;
