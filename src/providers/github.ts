import encode from "../encode";
import type { GitHubUser, GithubEmails, Methods } from "../types";

export default {
  requestCode({ id, redirect_uri, state }) {
    const url = "https://github.com/login/oauth/authorize";
    const params = encode({
      scope: "user:email",
      client_id: id,
      redirect_uri,
      state,
    });
    return url + "?" + params;
  },

  async requestToken({ id, secret, code, redirect_uri }) {
    const params = encode({
      client_id: id,
      client_secret: secret,
      code,
      redirect_uri,
    });
    const response = await fetch(
      `https://github.com/login/oauth/access_token?${params}`,
      { method: "POST", headers: { Accept: "application/json" } }
    );
    if (response.status !== 200)
      throw new Error("failed to fetch access token");
    return await response.json();
  },

  async requestUser(token) {
    const query = async (path: "/user" | "/user/emails") => {
      const response = await fetch("https://api.github.com" + path, {
        headers: { Authorization: token },
      });
      const data = await response.json();
      if (response.status !== 200) throw new Error(data.message);
      return data;
    };
    const { name, avatar_url }: GitHubUser = await query("/user");
    const emails: GithubEmails = await query("/user/emails");
    const { email } = emails.find(({ primary }) => primary === true)!;
    return { name: name, email: email.toLowerCase(), image: avatar_url };
  },
} as Methods;
