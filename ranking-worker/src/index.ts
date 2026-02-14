export interface Env {
  DB: D1Database;
}

interface TrackBody {
  slug: string;
  name: string;
  thumb_url?: string;
}

interface RankedStory {
  story_slug: string;
  story_name: string;
  thumb_url: string;
  total_views: number;
}

const CORS_HEADERS: Record<string, string> = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
  'Access-Control-Max-Age': '86400',
};

function json(data: unknown, status = 200): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json', ...CORS_HEADERS },
  });
}

function err(message: string, status = 400): Response {
  return json({ error: message }, status);
}

// Period → number of days to look back
function periodToDays(period: string): number | null {
  switch (period) {
    case 'day': return 1;
    case 'week': return 7;
    case 'month': return 30;
    case 'all': return null;
    default: return 30;
  }
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    // CORS preflight
    if (request.method === 'OPTIONS') {
      return new Response(null, { status: 204, headers: CORS_HEADERS });
    }

    const url = new URL(request.url);
    const path = url.pathname;

    try {
      if (path === '/track' && request.method === 'POST') {
        return await handleTrack(request, env);
      }

      if (path === '/top' && request.method === 'GET') {
        return await handleTop(url, env);
      }

      return err('Not found', 404);
    } catch (e) {
      const message = e instanceof Error ? e.message : 'Internal error';
      return err(message, 500);
    }
  },
} satisfies ExportedHandler<Env>;

async function handleTrack(request: Request, env: Env): Promise<Response> {
  const body = await request.json<TrackBody>();

  if (!body.slug || !body.name) {
    return err('Missing slug or name');
  }

  const slug = body.slug.trim().slice(0, 200);
  const name = body.name.trim().slice(0, 500);
  const thumbUrl = (body.thumb_url ?? '').trim().slice(0, 500);

  await env.DB.prepare(`
    INSERT INTO story_views (story_slug, story_name, thumb_url, view_date, view_count)
    VALUES (?1, ?2, ?3, date('now'), 1)
    ON CONFLICT(story_slug, view_date)
    DO UPDATE SET
      view_count = view_count + 1,
      story_name = excluded.story_name,
      thumb_url = CASE WHEN excluded.thumb_url != '' THEN excluded.thumb_url ELSE story_views.thumb_url END
  `)
    .bind(slug, name, thumbUrl)
    .run();

  return json({ ok: true });
}

async function handleTop(url: URL, env: Env): Promise<Response> {
  const period = url.searchParams.get('period') ?? 'month';
  const limit = Math.min(Math.max(parseInt(url.searchParams.get('limit') ?? '10'), 1), 100);
  const days = periodToDays(period);

  let query: string;
  let params: unknown[];

  if (days === null) {
    // All time
    query = `
      SELECT story_slug, story_name, thumb_url, SUM(view_count) AS total_views
      FROM story_views
      GROUP BY story_slug
      ORDER BY total_views DESC
      LIMIT ?1
    `;
    params = [limit];
  } else {
    query = `
      SELECT story_slug, story_name, thumb_url, SUM(view_count) AS total_views
      FROM story_views
      WHERE view_date >= date('now', ?1)
      GROUP BY story_slug
      ORDER BY total_views DESC
      LIMIT ?2
    `;
    params = [`-${days} days`, limit];
  }

  const { results } = await env.DB.prepare(query).bind(...params).all<RankedStory>();

  return json(results ?? []);
}
