'use server';

import { redirect } from 'next/navigation';
import { z } from 'zod';
import { getSql } from '@/lib/db';
import { authenticate, createSession, destroySession, hashPassword } from '@/lib/auth';

export interface ActionState {
  error?: string;
  success?: string;
}

const signupSchema = z.object({
  name: z.string().trim().min(2, 'Please enter your name'),
  email: z.string().trim().email('Enter a valid email'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

const loginSchema = z.object({
  email: z.string().trim().min(1, 'Enter your email'),
  password: z.string().min(1, 'Enter your password'),
});

export async function signupAction(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const sql = getSql();
  if (!sql) return { error: 'Database is not configured.' };

  const parsed = signupSchema.safeParse({
    name: formData.get('name'),
    email: formData.get('email'),
    password: formData.get('password'),
  });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? 'Invalid details' };
  }

  const { name, email, password } = parsed.data;
  try {
    const existing = (await sql`SELECT id FROM users WHERE lower(email) = lower(${email}) LIMIT 1`) as Array<
      Record<string, unknown>
    >;
    if (existing.length) return { error: 'An account with this email already exists.' };

    const hash = await hashPassword(password);
    const rows = (await sql`
      INSERT INTO users (email, password_hash, name, role)
      VALUES (${email.toLowerCase()}, ${hash}, ${name}, 'seller')
      RETURNING id
    `) as Array<Record<string, unknown>>;
    const userId = String(rows[0].id);
    await createSession(userId);
  } catch (error) {
    console.error('signup failed', error);
    return { error: 'Could not create your account. Please try again.' };
  }
  redirect('/dashboard/onboarding');
}

export async function loginAction(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const parsed = loginSchema.safeParse({
    email: formData.get('email'),
    password: formData.get('password'),
  });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? 'Invalid details' };
  }
  const user = await authenticate(parsed.data.email, parsed.data.password);
  if (!user) return { error: 'Incorrect email or password.' };
  if (!user.is_active) return { error: 'This account has been disabled. Contact support.' };

  await createSession(user.id);
  redirect(user.role === 'admin' ? '/admin' : '/dashboard');
}

export async function logoutAction() {
  await destroySession();
  redirect('/login');
}
