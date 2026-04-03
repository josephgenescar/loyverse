// netlify/functions/moncash-webhook.js
// MonCash voye notifikasyon IPN lè peman konfime
// URL pou Digicel: https://konektem.netlify.app/webhook/moncash

const https = require('https');
const { URL } = require('url');

var SUPA_URL = process.env.SUPABASE_URL || 'https://mnpgapvltdrpztnjmeie.supabase.co';
var SUPA_KEY = process.env.SUPABASE_SERVICE_KEY || process.env.SUPABASE_ANON_KEY || '';

const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, GET, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type'
};

async function supabaseRequest(path, method, body){
  if(!SUPA_KEY) return;
  var bodyStr = body ? JSON.stringify(body) : '';
  return new Promise((resolve) => {
    var url = new URL(SUPA_URL + path);
    var headers = {
      'apikey':        SUPA_KEY,
      'Authorization': 'Bearer ' + SUPA_KEY,
      'Content-Type':  'application/json'
    };
    if(bodyStr) headers['Content-Length'] = Buffer.byteLength(bodyStr);
    var req = https.request({
      hostname: url.hostname,
      path:     url.pathname + (url.search||''),
      method:   method,
      headers:  headers
    }, (res) => {
      let data = '';
      res.on('data', c => data += c);
      res.on('end', () => {
        try { resolve(JSON.parse(data)); }
        catch(e) { resolve(data); }
      });
    });
    req.on('error', () => resolve(null));
    if(bodyStr) req.write(bodyStr);
    req.end();
  });
}

// Jwenn email itilizatè pa orderId
async function getUserByOrderId(orderId){
  var result = await supabaseRequest(
    '/rest/v1/konektem_payments?order_id=eq.' + encodeURIComponent(orderId) + '&select=user_email,plan',
    'GET', null
  );
  if(Array.isArray(result) && result.length > 0) return result[0];
  return null;
}

exports.handler = async function(event){
  if(event.httpMethod === 'OPTIONS') return { statusCode:200, headers:CORS, body:'' };

  console.log('[webhook] MonCash notification received');
  console.log('[webhook] Method:', event.httpMethod);
  console.log('[webhook] Body:', event.body);

  try {
    // MonCash voye done via POST form-data oswa JSON
    var params = {};

    if(event.body){
      // Try JSON first
      try { params = JSON.parse(event.body); }
      catch(e){
        // Parse form-encoded
        event.body.split('&').forEach(function(pair){
          var kv = pair.split('=');
          params[decodeURIComponent(kv[0])] = decodeURIComponent(kv[1] || '');
        });
      }
    }

    // MonCash IPN params
    var orderId       = params.orderId || params.order_id || params.transactionId || '';
    var transactionId = params.transactionId || params.transaction_id || '';
    var message       = params.message || params.status || '';
    var amount        = parseFloat(params.amount) || 0;

    console.log('[webhook] orderId:', orderId, 'status:', message);

    // Si query params (GET redirect)
    if(!orderId && event.queryStringParameters){
      orderId = event.queryStringParameters.orderId || event.queryStringParameters.order_id || '';
      message = event.queryStringParameters.message || event.queryStringParameters.status || 'successful';
    }

    if(!orderId){
      return {
        statusCode: 400,
        headers: CORS,
        body: JSON.stringify({ error: 'orderId manke nan notifikasyon' })
      };
    }

    var isSuccess = message === 'successful' || message === 'success' || message === 'SUCCESSFUL';

    if(isSuccess){
      // 1. Mete a jou peman nan Supabase
      await supabaseRequest(
        '/rest/v1/konektem_payments?order_id=eq.' + encodeURIComponent(orderId),
        'PATCH',
        {
          status:         'confirmed',
          transaction_id: transactionId,
          confirmed_at:   new Date().toISOString()
        }
      );

      // 2. Jwenn email itilizatè
      var userInfo = await getUserByOrderId(orderId);
      if(userInfo && userInfo.user_email){
        // 3. Aktive Premium
        await supabaseRequest(
          '/rest/v1/konektem_users?email=eq.' + encodeURIComponent(userInfo.user_email),
          'PATCH',
          {
            plan:         'premium',
            status:       'active',
            premium_date: new Date().toISOString(),
            premium_plan: userInfo.plan || 'mensuel',
            premium_order_id: orderId
          }
        );

        // 4. Ajoute log
        await supabaseRequest('/rest/v1/konektem_logs', 'POST', {
          type:       'payment',
          message:    'MonCash konfime pou ' + userInfo.user_email + ' — ' + orderId,
          by:         'MonCash Webhook',
          created_at: new Date().toISOString()
        });

        console.log('[webhook] Premium aktivé pou:', userInfo.user_email);
      }

      return {
        statusCode: 200,
        headers: { ...CORS, 'Content-Type': 'application/json' },
        body: JSON.stringify({ success: true, message: 'Premium aktivé' })
      };
    } else {
      // Peman echwe — mete a jou estati
      await supabaseRequest(
        '/rest/v1/konektem_payments?order_id=eq.' + encodeURIComponent(orderId),
        'PATCH',
        { status: 'failed', updated_at: new Date().toISOString() }
      );

      return {
        statusCode: 200,
        headers: { ...CORS, 'Content-Type': 'application/json' },
        body: JSON.stringify({ success: false, message: 'Peman echwe oswa annule' })
      };
    }

  } catch(err){
    console.error('[webhook] Error:', err.message);
    return {
      statusCode: 500,
      headers: CORS,
      body: JSON.stringify({ error: err.message })
    };
  }
};
