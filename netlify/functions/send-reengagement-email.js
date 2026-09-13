// Send a controlled re-engagement email to existing Konektem users.
// Required Netlify environment variables:
// SUPABASE_URL, SUPABASE_SERVICE_KEY, and either BREVO_API_KEY or RESEND_API_KEY,
// EMAIL_FROM, REENGAGEMENT_ADMIN_SECRET

const https = require('https');

const defaultCampaignId = process.env.REENGAGEMENT_CAMPAIGN_ID || 'return-to-konektem-2026-09';
const supabaseUrl = process.env.SUPABASE_URL || 'https://mnpgapvltdrpztnjmeie.supabase.co';
const supabaseKey = process.env.SUPABASE_SERVICE_KEY || '';
const resendKey = process.env.RESEND_API_KEY || '';
const brevoKey = process.env.BREVO_API_KEY || '';
const emailFrom = process.env.EMAIL_FROM || 'Konektem <onboarding@resend.dev>';
const emailFromAddress = process.env.EMAIL_FROM_ADDRESS || emailFrom;
const emailFromName = process.env.EMAIL_FROM_NAME || 'Konektem';
const siteUrl = process.env.SITE_URL || 'https://konektem.netlify.app';

function json(statusCode, body) {
  return {
    statusCode,
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      'Access-Control-Allow-Methods': 'POST, OPTIONS'
    },
    body: JSON.stringify(body)
  };
}

function requestJson(hostname, path, method, headers, body) {
  return new Promise((resolve, reject) => {
    const payload = body ? JSON.stringify(body) : '';
    const request = https.request({
      hostname,
      path,
      method,
      headers: Object.assign({}, headers, payload ? {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(payload)
      } : {})
    }, response => {
      let raw = '';
      response.on('data', chunk => { raw += chunk; });
      response.on('end', () => {
        let data = {};
        try { data = raw ? JSON.parse(raw) : {}; } catch (error) { data = { raw }; }
        if (response.statusCode >= 200 && response.statusCode < 300) {
          resolve(data);
        } else {
          reject(new Error((data && (data.message || data.error)) || `HTTP ${response.statusCode}`));
        }
      });
    });
    request.on('error', reject);
    request.setTimeout(15000, () => request.destroy(new Error('Request timeout')));
    if (payload) request.write(payload);
    request.end();
  });
}

function supabaseRequest(path, method, body, extraHeaders) {
  const url = new URL(supabaseUrl);
  return requestJson(url.hostname, `${url.pathname.replace(/\/$/, '')}${path}`, method, Object.assign({
    apikey: supabaseKey,
    Authorization: `Bearer ${supabaseKey}`
  }, extraHeaders || {}), body);
}

function escapeHtml(value) {
  return String(value || '').replace(/[&<>'"]/g, character => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;'
  }[character]));
}

function createEmail(user) {
  const name = escapeHtml(user.bizname || 'zanmi Konektem');
  const paymentUrl = `${siteUrl}/index.html#premium`;
  return {
    subject: 'Retounen sou Konektem epi kontinye jere biznis ou',
    text: `Bonjou ${user.bizname || 'zanmi'},\n\nNou sonje ou sou Konektem. Retounen sèvi ak kas ou, stock ou ak rapò ou.\n\nPou aktive Premium: 10 USD pa mwa oswa 100 USD pa ane. Ou ka peye sou ${paymentUrl}, oswa voye peman MonCash sou +50948868964 oswa Natcash sou +50940683108. Apre sa, voye screenshot konfimasyon an sou WhatsApp +50948868964.\n\nPayPal disponib tou sou paj Premium la.\n\nPou pa resevwa lòt rapèl, reponn UNSUBSCRIBE.`,
    html: `<div style="font-family:Arial,sans-serif;max-width:600px;color:#17251d;line-height:1.6">
      <h2 style="color:#15803d">Bonjou ${name}!</h2>
      <p>Nou sonje ou sou <strong>Konektem</strong>. Retounen sèvi ak kas ou, jere stock ou epi suiv biznis ou pi fasil.</p>
      <p><strong>Premium:</strong> 10 USD pa mwa oswa 100 USD pa ane.</p>
      <p><a href="${paymentUrl}" style="display:inline-block;background:#15803d;color:white;padding:12px 18px;text-decoration:none;border-radius:6px">Retounen sou Konektem</a></p>
      <p><strong>MonCash:</strong> <strong>+50948868964</strong><br><strong>Natcash:</strong> <strong>+50940683108</strong></p>
      <p>Apre peman an, voye screenshot konfimasyon an sou WhatsApp <strong>+50948868964</strong>.</p>
      <p><strong>PayPal:</strong> ouvri paj Premium nan sou sit la epi chwazi "Peye ak PayPal".</p>
      <p style="font-size:12px;color:#64748b">Si ou pa vle resevwa rapèl sa yo ankò, reponn ak mo UNSUBSCRIBE.</p>
    </div>`
  };
}

async function sendEmail(user) {
  const message = createEmail(user);
  if (brevoKey) {
    return requestJson('api.brevo.com', '/v3/smtp/email', 'POST', {
      'api-key': brevoKey
    }, {
      sender: { name: emailFromName, email: emailFromAddress },
      to: [{ email: user.email }],
      subject: message.subject,
      textContent: message.text,
      htmlContent: message.html
    });
  }
  return requestJson('api.resend.com', '/emails', 'POST', {
    Authorization: `Bearer ${resendKey}`
  }, {
    from: emailFrom,
    to: [user.email],
    subject: message.subject,
    text: message.text,
    html: message.html
  });
}

exports.handler = async function(event) {
  if (event.httpMethod === 'OPTIONS') return json(200, { ok: true });
  if (event.httpMethod !== 'POST') return json(405, { error: 'POST selman.' });
  if (!process.env.REENGAGEMENT_ADMIN_SECRET || event.headers.authorization !== `Bearer ${process.env.REENGAGEMENT_ADMIN_SECRET}`) {
    return json(401, { error: 'Pa otorize.' });
  }
  if (!supabaseKey || (!resendKey && !brevoKey)) return json(500, { error: 'SUPABASE_SERVICE_KEY ak BREVO_API_KEY oswa RESEND_API_KEY nesesè.' });

  let body = {};
  try { body = JSON.parse(event.body || '{}'); } catch (error) { return json(400, { error: 'JSON pa valab.' }); }
  const dryRun = body.dryRun !== false;
  const limit = Math.min(Math.max(Number(body.limit) || 10, 1), 100);
  const offset = Math.max(Number(body.offset) || 0, 0);
  const selectedCampaignId = body.campaignId || defaultCampaignId;
  const testEmail = String(body.testEmail || '').trim().toLowerCase();

  try {
    const emailFilter = testEmail ? `&email=eq.${encodeURIComponent(testEmail)}` : '';
    const users = await supabaseRequest(`/rest/v1/konektem_users?select=email,bizname&email=not.is.null${emailFilter}&order=created_at.asc&offset=${offset}&limit=${limit}`, 'GET');
    const uniqueUsers = Array.from(new Map((users || []).filter(user => user.email).map(user => [user.email.toLowerCase(), user])).values());
    if (dryRun) return json(200, { dryRun: true, campaignId: selectedCampaignId, count: uniqueUsers.length, recipients: uniqueUsers.map(user => user.email) });

    const results = { sent: [], skipped: [], failed: [] };
    for (const user of uniqueUsers) {
      const email = user.email.toLowerCase();
      const existing = await supabaseRequest(`/rest/v1/email_campaign_sends?campaign_id=eq.${encodeURIComponent(selectedCampaignId)}&email=eq.${encodeURIComponent(email)}&status=eq.sent&select=id&limit=1`, 'GET');
      if (existing.length) { results.skipped.push(email); continue; }
      try {
        const provider = await sendEmail(Object.assign({}, user, { email }));
        await supabaseRequest('/rest/v1/email_campaign_sends', 'POST', {
          campaign_id: selectedCampaignId, email, status: 'sent', provider_id: provider.id || null
        }, { Prefer: 'resolution=ignore-duplicates' });
        results.sent.push(email);
      } catch (error) {
        results.failed.push({ email, error: error.message });
        await supabaseRequest('/rest/v1/email_campaign_sends', 'POST', {
          campaign_id: selectedCampaignId, email, status: 'failed', error_message: error.message
        }, { Prefer: 'resolution=ignore-duplicates' }).catch(() => {});
      }
    }
    return json(200, Object.assign({ dryRun: false, campaignId: selectedCampaignId }, results));
  } catch (error) {
    return json(500, { error: error.message });
  }
};
