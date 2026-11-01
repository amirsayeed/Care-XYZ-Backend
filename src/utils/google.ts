import { OAuth2Client } from "google-auth-library";

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

export interface GoogleProfile {
  googleId: string;
  email: string;
  name: string;
}

export async function verifyGoogleIdToken(idToken: string): Promise<GoogleProfile> {
  const ticket = await client.verifyIdToken({
    idToken,
    audience: process.env.GOOGLE_CLIENT_ID,
  });

  const payload = ticket.getPayload();
  if (!payload?.sub || !payload.email || !payload.email_verified) {
    throw new Error("Google account is missing a verified email");
  }

  return {
    googleId: payload.sub,
    email: payload.email,
    name: payload.name ?? payload.email.split("@")[0],
  };
}