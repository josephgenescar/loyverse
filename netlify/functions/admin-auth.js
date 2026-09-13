const crypto = require('crypto');

function response(statusCode, body) {
  return {
    statusCode,
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Headers': 'Content-Type',
      'Access-Control-Allow-Methods': 'POST, OPTIONS'
    },
    body: JSON.stringify(body)
  };
}

function sign(value) {
  return crypto.createHmac('sha256', process.env.ADMIN_SESSION_SECRET).update(value).digest('hex');
}

function createToken(username) {
  const expires = Date.now() + 8 * 60 * 60 * 1000;
  const payload = `${username}.${expires}`;
  return `${payload}.${sign(payload)}`;
}

function validToken(token) {
  const parts = String(token || '').split('.');
  if (parts.length !== 3) return false;
  const payload = `${parts[0]}.${parts[1]}`;
  const expected = sign(payload);
  if (parts[2].length !== expected.length) return false;
  return crypto.timingSafeEqual(Buffer.from(parts[2]), Buffer.from(expected)) && Number(parts[1]) > Date.now();
}

exports.handler = async function(event) {
  if (event.httpMethod === 'OPTIONS') return response(200, { ok: true });
  if (event.httpMethod !== 'POST') return response(405, { error: 'POST selman.' });
  if (!process.env.ADMIN_USER || !process.env.ADMIN_PASSWORD || !process.env.ADMIN_SESSION_SECRET) {
    return response(500, { error: 'Admin auth pa konfigire nan Netlify.' });
  }

  let body;
  try { body = JSON.parse(event.body || '{}'); } catch (error) { return response(400, { error: 'JSON pa valab.' }); }

  if (body.action === 'verify') {
    return validToken(body.token) ? response(200, { ok: true }) : response(401, { error: 'Sesyon ekspire.' });
  }

  if (body.username !== process.env.ADMIN_USER || body.password !== process.env.ADMIN_PASSWORD) {
    return response(401, { error: 'Identifiants incorrects.' });
  }
  return response(200, { ok: true, token: createToken(body.username) });
};
