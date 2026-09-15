/**
 * Vercel Serverless Function – reverse proxy to Django backend.
 *
 * Vercel routes (in vercel.json) send /api/* requests here with
 * the real path passed as the __proxy_path query parameter.
 */

const BACKEND = 'http://ec2-13-62-105-84.eu-north-1.compute.amazonaws.com';

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
  // Vercel route passes the captured path as __proxy_path
  // and merges the original query string automatically.
  const url = new URL(req.url, `http://${req.headers.host}`);
  const proxyPath = url.searchParams.get('__proxy_path') || '';
  url.searchParams.delete('__proxy_path');
  const remaining = url.searchParams.toString();

  const target = `${BACKEND}/thinkora-api/${proxyPath}${remaining ? '?' + remaining : ''}`;

  // Forward headers (skip hop-by-hop ones)
  const headers = {};
  for (const [key, value] of Object.entries(req.headers)) {
    if (key !== 'host' && key !== 'connection') {
      headers[key] = value;
    }
  }

  const options = { method: req.method, headers };

  if (req.method !== 'GET' && req.method !== 'HEAD') {
    options.body = await readBody(req);
  }

  try {
    const upstream = await fetch(target, options);

    for (const [key, value] of upstream.headers.entries()) {
      if (key !== 'transfer-encoding' && key !== 'connection') {
        res.setHeader(key, value);
      }
    }

    res.status(upstream.status).send(Buffer.from(await upstream.arrayBuffer()));
  } catch (err) {
    console.error('Proxy error:', err);
    res.status(502).json({ error: 'Cannot reach the backend server.' });
  }
}
