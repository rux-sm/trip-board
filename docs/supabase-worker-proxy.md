# Supabase Cloudflare Worker Proxy

Use this setup when a static frontend needs to talk to Supabase through a Cloudflare Worker, including Auth, REST, Storage, and Realtime WebSockets.

## Worker Code

Replace `TARGET` with the Supabase project URL.

```js
const TARGET = "https://PROJECT_REF.supabase.co";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "*",
  "Access-Control-Allow-Methods": "GET,POST,PUT,PATCH,DELETE,OPTIONS",
};

export default {
  async fetch(request) {
    const url = new URL(request.url);
    const target = new URL(url.pathname + url.search, TARGET);

    if (request.method === "OPTIONS") {
      return new Response(null, { status: 204, headers: corsHeaders });
    }

    const headers = new Headers(request.headers);
    headers.delete("host");

    if (request.headers.get("Upgrade")?.toLowerCase() === "websocket") {
      return fetch(target.toString(), {
        method: request.method,
        headers,
      });
    }

    const init = {
      method: request.method,
      headers,
      redirect: "follow",
    };

    if (request.method !== "GET" && request.method !== "HEAD") {
      init.body = request.body;
    }

    const response = await fetch(target.toString(), init);
    const responseHeaders = new Headers(response.headers);

    Object.entries(corsHeaders).forEach(([key, value]) => {
      responseHeaders.set(key, value);
    });

    return new Response(response.body, {
      status: response.status,
      headers: responseHeaders,
    });
  },
};
```

## Frontend Configuration

Point the Supabase client at the Worker, not directly at Supabase.

```js
const SUPABASE_URL = "https://your-worker.your-account.workers.dev";
const SUPABASE_ANON_KEY = "your-anon-key";
```

The anon key remains the same key from the Supabase project.

## Content Security Policy

Allow both HTTP and WebSocket connections to the Worker:

```html
connect-src
  'self'
  https://your-worker.your-account.workers.dev
  wss://your-worker.your-account.workers.dev;
```

If the app loads public Storage assets through the Worker, also allow the Worker in `img-src`:

```html
img-src 'self' data: https://*.supabase.co https://your-worker.your-account.workers.dev;
```

For VS Code Live Preview local development, allow its injected socket:

```html
connect-src ... ws://127.0.0.1:* ws://localhost:*;
```

## Verification

After deploying the Worker, open the app and confirm the browser console logs:

```text
[realtime] connected
```

You can also probe the Realtime upgrade path. A healthy proxy returns `101 Switching Protocols`.

```sh
curl --http1.1 -i -m 5 \
  "https://your-worker.your-account.workers.dev/realtime/v1/websocket?apikey=YOUR_ANON_KEY&vsn=2.0.0" \
  -H "Connection: Upgrade" \
  -H "Upgrade: websocket" \
  -H "Sec-WebSocket-Version: 13" \
  -H "Sec-WebSocket-Key: dGhlIHNhbXBsZSBub25jZQ=="
```

## Common Issues

- `Worker threw exception` / Cloudflare `1101` on Realtime usually means the WebSocket branch is malformed.
- Do not rewrite the upstream target protocol to `wss:` inside the Worker. Use the normal `https://PROJECT_REF.supabase.co/...` target and let `fetch()` handle the `Upgrade: websocket` request.
- Handle `OPTIONS` before proxying to Supabase so CORS preflights are answered consistently.
- A CSP error for `ws://127.0.0.1:*` is usually VS Code Live Preview, not Supabase.
- Browser password-form warnings are unrelated to the proxy.
