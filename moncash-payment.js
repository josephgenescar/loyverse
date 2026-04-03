// netlify/functions/moncash-payment.js
// Kreye ak verifye peman MonCash — kle yo nan Netlify env vars

const https = require('https');
const { URL } = require('url');

// ── CONFIG MonCash ──
// Mete sa yo nan Netlify → Site Settings → Environment Variables:
// MONCASH_CLIENT_ID      = your_client_id
// MONCASH_CLIENT_SECRET  = your_client_secret
// MONCASH_MODE           = sandbox   (oswa "live" pou pwoduksyon)
// MONCASH_BASE_URL       = https://moncashbutton.digicelhaiti.com
// SITE_URL               = https://konektem.netlify.app

function getMonCashBase(){
  var mode = process.env.MONCASH_MODE || 'sandbox';
  if(mode === 'live') return 'https://moncashbutton.digicelhaiti.com';
  return 'https://sandbox.moncashbutton.digicelhaiti.com';
}

// Supabase config
var SUPA_URL = process.env.SUPABASE_URL || 'https://mnpgapvltdrpztnjmeie.supabase.co';
var SUPA_KEY = process.env.SUPABASE_SERVICE_KEY || process.env.SUPABASE_ANON_KEY || '';

const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS'
};

// ── Jwenn token MonCash ──
async function getMonCashToken(){
  var clientId     = process.env.MONCASH_CLIENT_ID;
  var clientSecret = process.env.MONCASH_CLIENT_SECRET;
  if(!clientId || !clientSecret){
    throw new Error('MONCASH_CLIENT_ID ak MONCASH_CLIENT_SECRET manke nan Netlify env vars');
  }
  var auth     = Buffer.from(clientId + ':' + clientSecret).toString('base64');
  var base     = getMonCashBase();
  var tokenUrl = base + '/Api/oauth/token';
  var postData = 'grant_type=client_credentials&scope=read,write';

  return new Promise((resolve, reject) => {
    var parsed = new URL(tokenUrl);
    var req = https.request({
      hostname: parsed.hostname,
      path:     parsed.pathname,
      method:   'POST',
      headers: {
        'Authorization': 'Basic ' + auth,
        'Content-Type':  'application/x-www-form-urlencoded',
        'Content-Length': Buffer.byteLength(postData)
      }
    }, (res) => {
      let data = '';
      res.on('data', c => data += c);
      res.on('end', () => {
        try {
          var json = JSON.parse(data);
          if(json.access_token) resolve(json.access_token);
          else reject(new Error('Token MonCash echwe: ' + data));
        } catch(e) { reject(e); }
      });
    });
    req.on('error', reject);
    req.setTimeout(10000, () => { req.destroy(); reject(new Error('Timeout token MonCash')); });
    req.write(postData);
    req.end();
  });
}

// ── API MonCash helper ──
async function monCashAPI(path, data, token){
  var base = getMonCashBase();
  var url  = new URL(base + path);
  var body = JSON.stringify(data);
  return new Promise((resolve, reject) => {
    var req = https.request({
      hostname: url.hostname,
      path:     url.pathname,
      method:   'POST',
      headers: {
        'Authorization': 'Bearer ' + token,
        'Content-Type':  'application/json',
        'Content-Length': Buffer.byteLength(body)
      }
    }, (res) => {
      let raw = '';
      res.on('data', c => raw += c);
      res.on('end', () => {
        try { resolve({ status: res.statusCode, data: JSON.parse(raw) }); }
        catch(e) { resolve({ status: res.statusCode, data: raw }); }
      });
    });
    req.on('error', reject);
    req.setTimeout(15000, () => { req.destroy(); reject(new Error('Timeout API MonCash')); });
    req.write(body);
    req.end();
  });
}

// ── Sauvegarder peman nan Supabase ──
async function savePaymentToSupabase(paymentData){
  if(!SUPA_KEY) return;
  var body = JSON.stringify(paymentData);
  return new Promise((resolve) => {
    var url  = new URL(SUPA_URL + '/rest/v1/konektem_payments');
    var req  = https.request({
      hostname: url.hostname,
      path:     url.pathname,
      method:   'POST',
      headers: {
        'apikey':        SUPA_KEY,
        'Authorization': 'Bearer ' + SUPA_KEY,
        'Content-Type':  'application/json',
        'Prefer':        'return=minimal',
        'Content-Length': Buffer.byteLength(body)
      }
    }, (res) => { res.resume(); resolve(); });
    req.on('error', resolve);
    req.write(body);
    req.end();
  });
}

// ── Mete a jou peman nan Supabase ──
async function updatePaymentInSupabase(orderId, updateData){
  if(!SUPA_KEY) return;
  var body = JSON.stringify(updateData);
  var path = '/rest/v1/konektem_payments?order_id=eq.' + encodeURIComponent(orderId);
  return new Promise((resolve) => {
    var url  = new URL(SUPA_URL + path);
    var req  = https.request({
      hostname: url.hostname,
      path:     url.pathname + url.search,
      method:   'PATCH',
      headers: {
        'apikey':        SUPA_KEY,
        'Authorization': 'Bearer ' + SUPA_KEY,
        'Content-Type':  'application/json',
        'Content-Length': Buffer.byteLength(body)
      }
    }, (res) => { res.resume(); resolve(); });
    req.on('error', resolve);
    req.write(body);
    req.end();
  });
}

// ── Aktive Premium nan Supabase ──
async function activatePremiumInSupabase(email, plan, orderId){
  if(!SUPA_KEY || !email) return;
  var body = JSON.stringify({
    plan:         'premium',
    status:       'active',
    premium_date: new Date().toISOString(),
    premium_plan: plan,
    premium_order_id: orderId
  });
  var path = '/rest/v1/konektem_users?email=eq.' + encodeURIComponent(email);
  return new Promise((resolve) => {
    var url = new URL(SUPA_URL + path);
    var req = https.request({
      hostname: url.hostname,
      path:     url.pathname + url.search,
      method:   'PATCH',
      headers: {
        'apikey':        SUPA_KEY,
        'Authorization': 'Bearer ' + SUPA_KEY,
        'Content-Type':  'application/json',
        'Content-Length': Buffer.byteLength(body)
      }
    }, (res) => { res.resume(); resolve(); });
    req.on('error', resolve);
    req.write(body);
    req.end();
  });
}

// ══════════════════════════════════════════════
// HANDLER PRENSIPAL
// ══════════════════════════════════════════════
exports.handler = async function(event){

  if(event.httpMethod === 'OPTIONS'){
    return { statusCode:200, headers:CORS, body:'' };
  }

  var path = event.path || event.rawUrl || '';
  var action = event.queryStringParameters && event.queryStringParameters.action;

  try {

    // ────────────────────────────────────────
    // ACTION 1: KREYE PEMAN → POST ?action=create
    // ────────────────────────────────────────
    if(event.httpMethod === 'POST' && (!action || action === 'create')){
      var body = JSON.parse(event.body || '{}');
      var userEmail = body.email    || '';
      var plan      = body.plan     || 'mensuel';
      var amount    = body.amount   || (plan === 'annuel' ? 22000 : 2500);
      var orderId   = 'KNK-' + Date.now() + '-' + Math.random().toString(36).slice(2,6).toUpperCase();
      var siteUrl   = process.env.SITE_URL || 'https://konektem.netlify.app';
      var returnUrl = siteUrl + '/payment-return.html?order=' + orderId + '&email=' + encodeURIComponent(userEmail) + '&plan=' + plan;

      // Jwenn token
      var token = await getMonCashToken();

      // Kreye peman MonCash
      var result = await monCashAPI('/Api/v1/CreatePayment', {
        amount:   amount,
        orderId:  orderId,
        returnUrl: returnUrl
      }, token);

      if(result.status !== 200 || !result.data.payment_token){
        throw new Error('MonCash echwe: ' + JSON.stringify(result.data));
      }

      var paymentToken = result.data.payment_token.token;
      var base         = getMonCashBase();
      var redirectUrl  = base + '/Payment/Redirect?token=' + paymentToken;

      // Sauvegarder nan Supabase kòm "pending"
      await savePaymentToSupabase({
        user_email:  userEmail,
        plan:        plan,
        amount:      amount,
        method:      'MonCash',
        status:      'pending',
        order_id:    orderId,
        payment_token: paymentToken,
        created_at:  new Date().toISOString()
      });

      return {
        statusCode: 200,
        headers: { ...CORS, 'Content-Type': 'application/json' },
        body: JSON.stringify({
          success:      true,
          redirectUrl:  redirectUrl,
          orderId:      orderId,
          paymentToken: paymentToken
        })
      };
    }

    // ────────────────────────────────────────
    // ACTION 2: VERIFYE PEMAN → POST ?action=verify
    // ────────────────────────────────────────
    if(event.httpMethod === 'POST' && action === 'verify'){
      var body    = JSON.parse(event.body || '{}');
      var orderId = body.orderId || '';
      var email   = body.email   || '';
      var plan    = body.plan    || 'mensuel';

      if(!orderId) throw new Error('orderId manke');

      var token  = await getMonCashToken();
      var result = await monCashAPI('/Api/v1/RetrieveOrder', { orderId: orderId }, token);

      if(result.status !== 200){
        throw new Error('Verifikasyon echwe: ' + JSON.stringify(result.data));
      }

      var paymentData = result.data;
      var isSuccess   = paymentData.payment && paymentData.payment.message === 'successful';
      var transId     = paymentData.payment && paymentData.payment.transaction_id;

      if(isSuccess){
        // Mete a jou Supabase — peman konfime
        await updatePaymentInSupabase(orderId, {
          status:         'confirmed',
          transaction_id: transId,
          confirmed_at:   new Date().toISOString()
        });

        // Aktive Premium
        await activatePremiumInSupabase(email, plan, orderId);

        return {
          statusCode: 200,
          headers: { ...CORS, 'Content-Type': 'application/json' },
          body: JSON.stringify({
            success:       true,
            status:        'confirmed',
            transactionId: transId,
            message:       'Peman konfime — Premium aktive!'
          })
        };
      } else {
        return {
          statusCode: 200,
          headers: { ...CORS, 'Content-Type': 'application/json' },
          body: JSON.stringify({
            success: false,
            status:  paymentData.payment ? paymentData.payment.message : 'pending',
            message: 'Peman pa ankò konfime'
          })
        };
      }
    }

    return {
      statusCode: 400,
      headers: { ...CORS, 'Content-Type': 'application/json' },
      body: JSON.stringify({ error: 'Action enkoni: ' + action })
    };

  } catch(err){
    console.error('[moncash-payment] Error:', err.message);
    return {
      statusCode: 500,
      headers: { ...CORS, 'Content-Type': 'application/json' },
      body: JSON.stringify({ success: false, error: err.message })
    };
  }
};
