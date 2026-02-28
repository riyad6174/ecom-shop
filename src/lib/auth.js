import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET;
const COOKIE_NAME = 'admin_token';

/** Parse raw Cookie header into key-value map */
function parseCookies(cookieHeader = '') {
  return cookieHeader.split(';').reduce((acc, part) => {
    const [key, ...rest] = part.trim().split('=');
    if (key) acc[key.trim()] = decodeURIComponent(rest.join('='));
    return acc;
  }, {});
}

/** Verify admin JWT from request cookie. Returns payload or null. */
export function verifyAdmin(req) {
  const cookies = parseCookies(req.headers.cookie || '');
  const token = cookies[COOKIE_NAME];
  if (!token) return null;
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch {
    return null;
  }
}

/** Create a signed JWT for an admin user */
export function signAdminToken(payload) {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: '7d' });
}

/** Build a Set-Cookie header string that sets the auth cookie */
export function buildAuthCookie(token) {
  return `${COOKIE_NAME}=${token}; HttpOnly; Path=/; Max-Age=${7 * 24 * 3600}; SameSite=Strict`;
}

/** Build a Set-Cookie header string that clears the auth cookie */
export function clearAuthCookie() {
  return `${COOKIE_NAME}=; HttpOnly; Path=/; Max-Age=0; SameSite=Strict`;
}
