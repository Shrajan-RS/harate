const { OAuth2Client } = require('google-auth-library');

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);
const ALLOWED_DOMAIN = 'sode-edu.in';

const verifyGoogleToken = async (token) => {
  const ticket = await client.verifyIdToken({
    idToken: token,
    audience: process.env.GOOGLE_CLIENT_ID,
  });
  const payload = ticket.getPayload();

  if (!payload?.email?.endsWith(`@${ALLOWED_DOMAIN}`)) {
    const err = new Error('Only sode-edu.in accounts are allowed to sign in.');
    err.statusCode = 403;
    throw err;
  }

  return {
    name: payload.name,
    email: payload.email,
    picture: payload.picture,
    googleId: payload.sub,
    emailVerified: payload.email_verified,
  };
};

module.exports = {
  verifyGoogleToken,
  ALLOWED_DOMAIN,
};

