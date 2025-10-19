import { json } from '@sveltejs/kit';
import { DB } from '$lib/server/db.js';

export async function GET() {
  try {
    const users = await DB.debugGetAllUsers();
    return json({ users });
  } catch (error) {
    return json({ error: error.message }, { status: 500 });
  }
}