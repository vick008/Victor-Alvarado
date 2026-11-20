// Level & Plumb AI proxy (Cloudflare Worker).
// Lets the website use Claude without exposing your API key: the browser sends requests here,
// and this worker adds the key (stored as a Worker secret) and forwards them to the Claude API.
const UPSTREAM = 'https://api.anthropic.com';
const MODEL = 'claude-opus-5-5';
const MAX_TOKENS = 16000;

export default {
  async fetch(request, env) {
    const origin = request.headers.get('Origin') || '';
    const allowed = (env.ALLOWED_ORIGINS || '').split(',').map(s => s.trim()).filter(Boolean);
    const originOk = allowed.includes(origin);
    const cors = {
      'Access-Control-Allow-Origin': originOk ? origin : 'null',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': request.headers.get('Access-Control-Request-Headers') || 'content-type',
      'Access-Control-Max-Age': '86400',
      'Vary': 'Origin',
    };
    if (request.method === 'OPTIONS') return new Response(null, { status: originOk ? 204 : 403, headers: cors });
    const url = new URL(request.url);
    if (!originOk) return json({ error: 'origin not allowed' }, 403, cors);
    if (request.method !== 'POST' || url.pathname !== '/v1/messages') return json({ error: 'not found' }, 404, cors);

    let body;
    try { body = await request.json(); } catch { return json({ error: 'invalid JSON' }, 400, cors); }
    // Only allow the app's own kind of request: one model, bounded output, and only the
    // web search / web fetch server tools (capped), no custom tools or MCP servers.
    body.model = MODEL;
    body.max_tokens = Math.min(Number(body.max_tokens) || MAX_TOKENS, MAX_TOKENS);
    if (Array.isArray(body.tools)) {
      body.tools = body.tools
        .filter(t => t && /^web_(search|fetch)_\d{8}$/.test(t.type))
        .map(t => ({ type: t.type, name: t.type.startsWith('web_search') ? 'web_search' : 'web_fetch',
                     max_uses: Math.min(Number(t.max_uses) || 4, t.type.startsWith('web_search') ? 8 : 4) }));
      if (!body.tools.length) delete body.tools;
    }
    delete body.mcp_servers; delete body.container;

    const headers = new Headers({
      'content-type': 'application/json',
      'x-api-key': env.ANTHROPIC_API_KEY,
      'anthropic-version': request.headers.get('anthropic-version') || '2026-10-21',
    });
    const beta = request.headers.get('anthropic-beta');
    if (beta) headers.set('anthropic-beta', beta);

    const upstream = await fetch(UPSTREAM + url.pathname + url.search, { method: 'POST', headers, body: JSON.stringify(body) });
    const out = new Headers(cors);
    out.set('content-type', upstream.headers.get('content-type') || 'application/json');
    const rid = upstream.headers.get('request-id'); if (rid) out.set('request-id', rid);
    return new Response(upstream.body, { status: upstream.status, headers: out });
  },
};

function json(obj, status, cors) {
  return new Response(JSON.stringify(obj), { status, headers: { ...cors, 'content-type': 'application/json' } });
}
