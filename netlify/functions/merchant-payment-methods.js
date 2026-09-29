const https = require('https');

const supabaseUrl = process.env.SUPABASE_URL || 'https://mnpgapvltdrpztnjmeie.supabase.co';
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1ucGdhcHZsdGRycHp0bmptZWllIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzQxMzg5NDQsImV4cCI6MjA4OTcxNDk0NH0.6R9xGtGSJivvVxwqI2EfWjK3pAArZquIMxeEi-lt6tE';
const bucket = 'merchant-payment-qr';
const maxImageBytes = 2 * 1024 * 1024;

function response(statusCode, body) {
  return {
    statusCode,
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      'Access-Control-Allow-Methods': 'GET, POST, DELETE, OPTIONS',
      'Cache-Control': 'no-store'
    },
    body: JSON.stringify(body)
  };
}

function request(hostname, path, method, headers, body) {
  return new Promise((resolve, reject) => {
    const payload = body == null ? null : Buffer.isBuffer(body) ? body : Buffer.from(JSON.stringify(body));
    const requestHeaders = Object.assign({}, headers || {});
    if (payload) requestHeaders['Content-Length'] = payload.length;
    const req = https.request({ hostname, path, method, headers: requestHeaders }, res => {
      const chunks = [];
      res.on('data', chunk => chunks.push(chunk));
      res.on('end', () => {
        const raw = Buffer.concat(chunks).toString('utf8');
        let data = {};
        try { data = raw ? JSON.parse(raw) : {}; } catch (error) { data = { message: raw }; }
        if (res.statusCode >= 200 && res.statusCode < 300) resolve(data);
        else reject(new Error((data.message || data.error_description || data.error || 'Supabase request failed') + ` (${res.statusCode})`));
      });
    });
    req.on('error', reject);
    req.setTimeout(15000, () => req.destroy(new Error('Supabase request timeout')));
    if (payload) req.write(payload);
    req.end();
  });
}

function supabaseRequest(path, method, body, accessToken, headers) {
  const url = new URL(supabaseUrl);
  const requestHeaders = Object.assign({
    apikey: supabaseAnonKey,
    Authorization: `Bearer ${accessToken}`
  }, headers || {});
  if (body != null && !Buffer.isBuffer(body) && !requestHeaders['Content-Type']) requestHeaders['Content-Type'] = 'application/json';
  return request(url.hostname, `${url.pathname.replace(/\/$/, '')}${path}`, method, requestHeaders, body);
}

function sniffImage(buffer) {
  if (buffer.length >= 8 && buffer.subarray(0, 8).equals(Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]))) return 'image/png';
  if (buffer.length >= 3 && buffer[0] === 0xff && buffer[1] === 0xd8 && buffer[2] === 0xff) return 'image/jpeg';
  if (buffer.length >= 12 && buffer.toString('ascii', 0, 4) === 'RIFF' && buffer.toString('ascii', 8, 12) === 'WEBP') return 'image/webp';
  return '';
}

async function getOwnedMethods(merchantId, accessToken) {
  const rows = await supabaseRequest(`/rest/v1/payment_methods?merchant_id=eq.${encodeURIComponent(merchantId)}&select=id,merchant_id,provider,qr_image_url,account_name,phone_number,active,created_at,updated_at`, 'GET', null, accessToken);
  return Array.isArray(rows) ? rows : [];
}

async function withSignedImages(rows, merchantId, accessToken) {
  return Promise.all(rows.map(async row => {
    const path = row.qr_image_url;
    if (!path || !path.startsWith(`${merchantId}/`)) return Object.assign({}, row, { qr_preview_url: null });
    try {
      const signed = await supabaseRequest(`/storage/v1/object/sign/${bucket}/${path.split('/').map(encodeURIComponent).join('/')}`, 'POST', { expiresIn: 900 }, accessToken);
      const signedPath = signed.signedURL || signed.signedUrl;
      const signedUrl = signedPath && /^https?:\/\//i.test(signedPath)
        ? signedPath
        : signedPath ? new URL(signedPath.indexOf('/storage/v1/') === 0 ? signedPath : '/storage/v1' + (signedPath.charAt(0) === '/' ? signedPath : '/' + signedPath), supabaseUrl).toString() : null;
      return Object.assign({}, row, { qr_preview_url: signedUrl });
    } catch (error) {
      return Object.assign({}, row, { qr_preview_url: null });
    }
  }));
}

exports.handler = async function(event) {
  if (event.httpMethod === 'OPTIONS') return response(200, { success: true });
  if (!['GET', 'POST', 'DELETE'].includes(event.httpMethod)) return response(405, { error: 'Method not allowed' });
  const authHeader = event.headers && (event.headers.authorization || event.headers.Authorization) || '';
  const tokenMatch = authHeader.match(/^Bearer\s+(.+)$/i);
  if (!tokenMatch) return response(401, { error: 'Konekte pou kontinye.' });

  try {
    const project = new URL(supabaseUrl);
    const user = await request(project.hostname, `${project.pathname.replace(/\/$/, '')}/auth/v1/user`, 'GET', {
      apikey: supabaseAnonKey,
      Authorization: `Bearer ${tokenMatch[1]}`
    });
    const merchantId = user && user.id;
    if (!merchantId) return response(401, { error: 'Session Supabase la pa valab.' });
    const accessToken = tokenMatch[1];

    if (event.httpMethod === 'GET') {
      const methods = await withSignedImages(await getOwnedMethods(merchantId, accessToken), merchantId, accessToken);
      return response(200, { methods });
    }

    const body = JSON.parse(event.body || '{}');
    const provider = body.provider;
    if (!['moncash', 'natcash'].includes(provider)) return response(400, { error: 'Metòd peman pa valab.' });
    const objectPath = `${merchantId}/${provider}`;

    if (event.httpMethod === 'DELETE') {
      await supabaseRequest(`/storage/v1/object/${bucket}`, 'DELETE', { prefixes: [objectPath] }, accessToken);
      await supabaseRequest(`/rest/v1/payment_methods?merchant_id=eq.${encodeURIComponent(merchantId)}&provider=eq.${provider}`, 'DELETE', null, accessToken);
      return response(200, { success: true });
    }

    const previous = (await getOwnedMethods(merchantId, accessToken)).find(row => row.provider === provider);
    let imagePath = previous && previous.qr_image_url && previous.qr_image_url.startsWith(`${merchantId}/`) ? previous.qr_image_url : null;
    if (body.fileBase64) {
      const image = Buffer.from(body.fileBase64, 'base64');
      const contentType = sniffImage(image);
      if (!contentType) return response(415, { error: 'Imaj la dwe yon PNG, JPG oswa WebP ki valab.' });
      if (image.length > maxImageBytes) return response(413, { error: 'QR la depase limit 2 MB.' });
      await supabaseRequest(`/storage/v1/object/${bucket}/${objectPath}`, 'POST', image, accessToken, {
        'Content-Type': contentType,
        'x-upsert': 'true'
      });
      imagePath = objectPath;
    }

    const active = body.active === true || body.active === 'true';
    if (active && !imagePath) return response(400, { error: 'Ajoute yon imaj QR anvan ou aktive metòd sa a.' });
    const rows = await supabaseRequest('/rest/v1/payment_methods?on_conflict=merchant_id,provider', 'POST', {
      merchant_id: merchantId,
      provider,
      qr_image_url: imagePath,
      account_name: String(body.accountName || '').trim().slice(0, 120) || null,
      phone_number: String(body.phoneNumber || '').trim().slice(0, 40) || null,
      active,
      updated_at: new Date().toISOString()
    }, accessToken, { Prefer: 'resolution=merge-duplicates,return=representation' });
    const saved = Array.isArray(rows) ? rows[0] : null;
    return response(200, { success: true, method: saved ? (await withSignedImages([saved], merchantId, accessToken))[0] : null });
  } catch (error) {
    const unauthorized = /401|JWT|token/i.test(error.message || '');
    return response(unauthorized ? 401 : 500, { error: unauthorized ? 'Session Supabase la ekspire. Rekonekte.' : 'Operasyon peman an echwe.' });
  }
};