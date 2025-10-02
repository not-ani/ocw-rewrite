import { getAuthToken } from "@/lib/auth";
import { api } from "@ocw-rewrite/backend/convex/_generated/api";
import { fetchQuery } from "convex/nextjs";

export default async function AccountPage() {
  const token = await getAuthToken();
  const tokenId = await fetchQuery(api.courseUsers.getTokenId, {}, { token });
  if (!token) {
    return (
      <div>
        <h1>Please log in</h1>
      </div>
    );
  }

  if (!tokenId) {
    return (
      <div>
        <h1>Token not found</h1>
      </div>
    );
  }

  return (
    <div>
      <h1>{token ? "Welcome back!" : "Please log in"}</h1>
      <p>Your account details are:</p>
      <ul>
        <li> token: {JSON.stringify(tokenId)}</li>
      </ul>
    </div>
  );
}
