import { json } from '@sveltejs/kit';
import { DB } from '$lib/server/db.js';
import crypto from 'crypto';
import { dlog } from '$lib/debug/debug_log.js';

export async function POST({ request, cookies }) {
  const { userKey } = await request.json();

  try {
    dlog('Authentication attempt', { userKey });

    const user = await DB.getUserByKey(userKey);

    if (!user) {
      dlog('Invalid user key');
      return json({ error: 'Invalid user key' }, { status: 401 });
    }

    if (user.disabled) {
      dlog('User account disabled', { userId: user.id });
      return json({ error: 'User account is disabled' }, { status: 403 });
    }

    const sessionCode = crypto.randomUUID();
    await DB.createSession(user.id, sessionCode);

    dlog('Session created', { sessionCode, userId: user.id });

    cookies.set('session', sessionCode, {
      path: '/',
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 60 * 60 * 24 * 7
    });

    return json({
      success: true,
      user: {
        role: user.role,
        settings: user.settings ? JSON.parse(user.settings) : {}
      }
    });

  } catch (error) {
    dlog('Authentication error', error);
    return json(
      { error: 'Authentication failed: ' + error.message },
      { status: 500 }
    );
  }
}

export async function DELETE({ cookies }) {
  const sessionCode = cookies.get('session');

  dlog('Session deletion', { sessionCode });

  if (sessionCode) {
    await DB.deleteSession(sessionCode);
  }

  cookies.delete('session', { path: '/' });
  return json({ success: true });
}

export async function GET({ cookies }) {
  const sessionCode = cookies.get('session');
  dlog('Session check, cookie:', sessionCode);

  if (!sessionCode) {
    dlog('No session cookie');
    return json({ authenticated: false }, { status: 401 });
  }

  try {
    const session = await DB.getSession(sessionCode);
    dlog('Session from DB:', session);

    if (!session) {
      dlog('Session not found in DB');
      cookies.delete('session', { path: '/' });
      return json({ authenticated: false }, { status: 401 });
    }

    return json({
      authenticated: true,
      user: {
        role: session.role,
        settings: session.settings
      }
    });

  } catch (error) {
    dlog('Session check error:', error);
    return json({ error: 'Session check failed' }, { status: 500 });
  }
}