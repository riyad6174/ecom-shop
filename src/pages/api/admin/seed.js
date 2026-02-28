/**
 * One-time admin user seeding endpoint.
 * Only works when ALLOW_SEED=true is set in environment.
 *
 * Usage:
 *   1. Add ALLOW_SEED=true to .env
 *   2. GET /api/admin/seed?email=admin@example.com&password=yourPassword
 *   3. Remove ALLOW_SEED from .env immediately after
 */
import bcrypt from 'bcryptjs';
import { connectDB } from '@/lib/mongodb';
import Admin from '@/models/Admin';

export default async function handler(req, res) {
  if (process.env.ALLOW_SEED !== 'true') {
    return res.status(403).json({ message: 'Seed endpoint is disabled' });
  }

  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  const { email, password } = req.query;

  if (!email || !password) {
    return res.status(400).json({
      message: 'Provide ?email=xxx@example.com&password=yyy in query string',
    });
  }

  if (password.length < 6) {
    return res.status(400).json({ message: 'Password must be at least 6 characters' });
  }

  try {
    await connectDB();

    const existing = await Admin.findOne({ email: email.trim().toLowerCase() });
    if (existing) {
      return res.status(409).json({ message: `Admin '${email}' already exists` });
    }

    const hash = await bcrypt.hash(password, 12);
    const admin = await Admin.create({
      email: email.trim().toLowerCase(),
      password: hash,
    });

    return res.status(201).json({
      message: `Admin '${admin.email}' created. REMOVE ALLOW_SEED from .env now.`,
    });
  } catch (error) {
    console.error('Seed error:', error);
    return res.status(500).json({ message: 'Failed to create admin user' });
  }
}
