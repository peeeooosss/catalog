import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { createHash, randomBytes, timingSafeEqual } from 'crypto';
import bcrypt from 'bcryptjs';
import { getSql, getTenantByOwner, type StoreRow } from '@/lib/db';
import type { User, UserRole } from '@/types';

const SESSION_COOKIE = 'cp_session';
const SESSION_DAYS = 30;

export interface AuthUser {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  phone: string | null;
  is_active: boolean;
}

export async function hashPassword(password: string) {
  return bcrypt.hash(password, 10);
}

export async function verifyPassword(password: string, hash: string) {
  try {
    return await bcrypt.compare(password, hash);
  } catch {
    return false;
  }
}

function sha256(value: string) {
  return createHash('sha256').update(value).digest('hex');
}

function safeEqual(a: string, b: string) {
  const ab = Buffer.from(a);
  const bb = Buffer.from(b);
  if (ab.length !== bb.length) return false;
  return timingSafeEqual(ab, bb);
}

export async function createSession(userId: string) {
  const sql = getSql();
  if (!sql) throw new Error('Database not configured');
  const token = randomBytes(32).toString('hex');
  const tokenHash = sha256(token);
  const expires = new Date(Date.now() + SESSION_DAYS * 24 * 60 * 60 * 1000);
  await sql`
    INSERT INTO sessions (token_hash, user_id, expires_at)
    VALUES (${tokenHash}, ${userId}, ${expires.toISOString()})
  `;
  cookies().set(SESSION_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    expires,
  });
  return token;
}

export async function destroySession() {
  const token = cookies().get(SESSION_COOKIE)?.value;
  if (token) {
    const sql = getSql();
    if (sql) {
      try {
        await sql`DELETE FROM sessions WHERE token_hash = ${sha256(token)}`;
      } catch {
        // ignore
      }
    }
  }
  cookies().delete(SESSION_COOKIE);
}

export async function getSessionUser(): Promise<AuthUser | null> {
  const token = cookies().get(SESSION_COOKIE)?.value;
  if (!token) return null;
  const sql = getSql();
  if (!sql) return null;
  try {
    const rows = (await sql`
      SELECT u.id, u.email, u.name, u.role, u.phone, u.is_active
      FROM sessions s
      JOIN users u ON u.id = s.user_id
      WHERE s.token_hash = ${sha256(token)} AND s.expires_at > now()
      LIMIT 1
    `) as Array<Record<string, unknown>>;
    if (!rows.length) return null;
    const r = rows[0];
    return {
      id: String(r.id),
      email: String(r.email),
      name: String(r.name),
      role: String(r.role) as UserRole,
      phone: (r.phone as string | null) ?? null,
      is_active: Boolean(r.is_active),
    };
  } catch {
    return null;
  }
}

export async function requireUser(): Promise<AuthUser> {
  const user = await getSessionUser();
  if (!user) redirect('/login');
  if (!user.is_active) {
    await destroySession();
    redirect('/login?disabled=1');
  }
  return user;
}

export async function requireSeller(): Promise<{ user: AuthUser; store: StoreRow | null }> {
  const user = await requireUser();
  if (user.role === 'admin') redirect('/admin');
  const store = await getTenantByOwner(user.id);
  return { user, store };
}

export async function requireStore(): Promise<{ user: AuthUser; store: StoreRow }> {
  const { user, store } = await requireSeller();
  if (!store) redirect('/dashboard/onboarding');
  return { user, store };
}

export async function requireAdmin(): Promise<AuthUser> {
  const user = await requireUser();
  if (user.role !== 'admin') redirect('/dashboard');
  return user;
}

export async function authenticate(email: string, password: string): Promise<AuthUser | null> {
  const sql = getSql();
  if (!sql) return null;
  const rows = (await sql`
    SELECT id, email, name, role, phone, is_active, password_hash
    FROM users WHERE lower(email) = lower(${email}) LIMIT 1
  `) as Array<Record<string, unknown>>;
  if (!rows.length) return null;
  const r = rows[0];
  const ok = await verifyPassword(password, String(r.password_hash));
  if (!ok) return null;
  if (!Boolean(r.is_active)) return { ...toAuthUser(r), is_active: false };
  await sql`UPDATE users SET last_login_at = now() WHERE id = ${String(r.id)}`;
  return toAuthUser(r);
}

function toAuthUser(r: Record<string, unknown>): AuthUser {
  return {
    id: String(r.id),
    email: String(r.email),
    name: String(r.name),
    role: String(r.role) as UserRole,
    phone: (r.phone as string | null) ?? null,
    is_active: r.is_active === undefined ? true : Boolean(r.is_active),
  };
}

export type { User };
export { sha256, safeEqual, SESSION_COOKIE };
