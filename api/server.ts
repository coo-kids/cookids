Bun.serve({
  routes: {
    '/health': () => Response.json({ status: 'ok' }),
  },
  fetch() {
    return new Response('Hello from Bun on Vercel');
  },
});