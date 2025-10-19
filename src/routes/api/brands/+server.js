import { json } from '@sveltejs/kit';
import { ApiClient } from '$lib/server/api-client.js';

export async function GET() {
  try {
    const client = new ApiClient();
    const brands = await client.get('/brands');
    return json(brands);
  } catch (error) {
    return json({ error: error.message }, { status: 500 });
  }
}