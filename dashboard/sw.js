// sw.js - simple service worker that proxies requests to `/auth` to the
// local auth server at http://localhost:3000/auth. This allows the static
// frontend to call `/auth` and let the service worker forward the request
// during local development (works on localhost).

self.addEventListener('fetch', (event) => {
  try {
    const url = new URL(event.request.url);
    if (url.pathname === '/auth') {
      const target = 'http://localhost:3000/auth';
      event.respondWith((async () => {
        try {
          const req = event.request;
          const init = {
            method: req.method,
            headers: req.headers,
            credentials: 'include',
            redirect: 'follow'
          };

          if (!['GET', 'HEAD'].includes(req.method)) {
            init.body = await req.clone().arrayBuffer();
          }

          const resp = await fetch(target, init);
          const body = await resp.arrayBuffer();
          return new Response(body, {
            status: resp.status,
            statusText: resp.statusText,
            headers: resp.headers
          });
        } catch (err) {
          return new Response(JSON.stringify({ error: 'proxy_failed' }), {
            status: 502,
            headers: { 'Content-Type': 'application/json' }
          });
        }
      })());
    }
  } catch (e) {
    // ignore non-HTTP(S) requests or malformed URLs
  }
});
