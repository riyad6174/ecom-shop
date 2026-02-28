import bcrypt from 'bcryptjs';
import Admin from '@/models/Admin';

let _ensured = false;

/**
 * Creates the default admin if no admins exist.
 * Called once per process — subsequent calls are no-ops.
 */
export async function ensureDefaultAdmin() {
  if (_ensured) return;

  try {
    const count = await Admin.estimatedDocumentCount();
    if (count === 0) {
      const hash = await bcrypt.hash('sheiishop123', 12);
      await Admin.create({ email: 'admin@sheiishop.com', password: hash });
      console.log('[Init] Default admin created: admin@sheiishop.com');
    }
    _ensured = true;
  } catch (err) {
    // Will retry on next request
    console.warn('[Init] ensureDefaultAdmin error:', err.message);
  }
}
