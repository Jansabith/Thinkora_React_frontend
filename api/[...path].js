/**
 * Vercel Serverless Function – reverse proxy to the Django backend.
 *
 * Every request that arrives at /api/… is forwarded to the Django server.
 * This works around Vercel's limitation where rewrites cannot proxy
 * to external HTTP destinations on non-standard ports.
 */

const BACKEND = 'http://13.62.105.84:8001';

/* Tell Vercel NOT to parse the request body – we forward the raw bytes. */
export const config = {
  api: {
    bodyParser: false,
  },
};

/** Read the raw request body into a Buffer. */
function readBody(req) {
  return new Promise((resolve, reject) => {
    const chunks = [];
    req.on('data', (chunk) => chunks.push(chunk));
    req.on('end', () => resolve(Buffer.concat(chunks)));
    req.on('error', reject);
  });
}

export default async function handler(req, res) {
  // req.url is the full path, e.g. "/api/auth/login/?next=/"
  const target = `${BACKEND}${req.url}`;

  // Forward all headers except hop-by-hop ones
  const headers = {};
  for (const [key, value] of Object.entries(req.headers)) {
    if (key !== 'host' && key !== 'connection') {
      headers[key] = value;
    }
  }

  const options = {
    method: req.method,
    headers,
  };

  // Forward the body for POST / PUT / PATCH / DELETE
  if (req.method !== 'GET' && req.method !== 'HEAD') {
    options.body = await readBody(req);
  }

  try {
    const upstream = await fetch(target, options);

    // Copy every response header back to the client
    for (const [key, value] of upstream.headers.entries()) {
      if (key !== 'transfer-encoding' && key !== 'connection') {
        res.setHeader(key, value);
      }
    }

    const buffer = Buffer.from(await upstream.arrayBuffer());
    res.status(upstream.status).send(buffer);
  } catch (err) {
    console.error('Proxy error:', err);
    res.status(502).json({ error: 'Cannot reach the backend server.' });
  }
}
