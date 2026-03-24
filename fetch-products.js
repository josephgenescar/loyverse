// netlify/functions/fetch-products.js
// Proxy sèvè — bypasse CORS, sipòte kle API, plizyè fòma JSON

const https = require('https');
const http  = require('http');
const { URL } = require('url');

exports.handler = async function(event) {
  const CORS = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS'
  };

  if(event.httpMethod === 'OPTIONS'){
    return { statusCode:200, headers:CORS, body:'' };
  }
  if(event.httpMethod !== 'POST'){
    return { statusCode:405, headers:CORS, body:'Method not allowed' };
  }

  try {
    const body   = JSON.parse(event.body);
    const apiUrl = body.url;
    const apiKey = body.key || '';

    if(!apiUrl){
      return { statusCode:400, headers:CORS, body: JSON.stringify({error:'URL manke'}) };
    }

    // Valide URL
    let parsedUrl;
    try { parsedUrl = new URL(apiUrl); }
    catch(e){ return { statusCode:400, headers:CORS, body: JSON.stringify({error:'URL invalide'}) }; }

    // Headers pou request la
    const reqHeaders = {
      'User-Agent': 'Konektem-POS/3.0',
      'Accept': 'application/json, text/plain, */*'
    };
    if(apiKey) reqHeaders['Authorization'] = 'Bearer '+apiKey;
    if(apiKey) reqHeaders['X-API-Key'] = apiKey;

    // Fetch URL la
    const data = await new Promise((resolve, reject) => {
      const lib = parsedUrl.protocol === 'https:' ? https : http;
      const req = lib.request({
        hostname: parsedUrl.hostname,
        path:     parsedUrl.pathname + parsedUrl.search,
        method:   'GET',
        headers:  reqHeaders,
        port:     parsedUrl.port || (parsedUrl.protocol === 'https:' ? 443 : 80)
      }, (res) => {
        let raw = '';
        res.on('data', c => raw += c);
        res.on('end', () => {
          console.log('[fetch-products] Status:', res.statusCode, 'URL:', apiUrl);
          if(res.statusCode >= 400){
            reject(new Error('HTTP '+res.statusCode+' — '+apiUrl));
            return;
          }
          try { resolve(JSON.parse(raw)); }
          catch(e){ reject(new Error('Repons pa JSON valid: '+raw.slice(0,100))); }
        });
      });
      req.on('error', reject);
      req.setTimeout(10000, () => { req.destroy(); reject(new Error('Timeout 10s')); });
      req.end();
    });

    return {
      statusCode: 200,
      headers: { ...CORS, 'Content-Type': 'application/json' },
      body: JSON.stringify({ success:true, data })
    };

  } catch(err) {
    console.error('[fetch-products] Error:', err.message);
    return {
      statusCode: 200,  // 200 pou kliyan ka li erè a
      headers: { ...CORS, 'Content-Type': 'application/json' },
      body: JSON.stringify({ success:false, error: err.message })
    };
  }
};
