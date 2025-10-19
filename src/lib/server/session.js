import { DB } from './db';

export async function getSessionUser(event) {
  if (event.locals.user) {
    return event.locals.user;
  }

  const sessionCode = event.cookies.get('session_code');
  if (!sessionCode) return null;

  const userSession = await DB.getSession(sessionCode);
  if (!userSession) return null;

  event.locals.user = {
    id: userSession.user_id,
    key: userSession.user_key,
    role: userSession.role,
    settings: userSession.settings
  };

  return event.locals.user;
}

export async function getUserSettings(event) {
  const user = await getSessionUser(event);
  return user?.settings || null;
}

export function requireAuth(event) {
  const user = event.locals.user;
  if (!user) {
    throw new Error('Authentication required');
  }
  return user;
}