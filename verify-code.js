// netlify/functions/verify-code.js
// Verifye kòd aktivasyon Premium

exports.handler = async function(event) {

  if(event.httpMethod === 'OPTIONS'){
    return {
      statusCode: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Access-Control-Allow-Methods': 'POST, OPTIONS'
      },
      body: ''
    };
  }

  if(event.httpMethod !== 'POST'){
    return { statusCode: 405, body: 'Method not allowed' };
  }

  try {
    var body  = JSON.parse(event.body);
    var code  = (body.code||'').trim().toUpperCase();
    var email = body.email||'';
    var plan  = body.plan||'mensuel';

    if(!code){
      return {
        statusCode: 400,
        headers: { 'Access-Control-Allow-Origin': '*' },
        body: JSON.stringify({ valid: false, error: 'Code manke' })
      };
    }

    // ══════════════════════════════════════════════
    // KÒD VALID YO — Ou ajoute yo la manyèlman
    // apre ou verifye peman MonCash kliyan an
    // Fòmat: 'PREM-XXXX'
    // ══════════════════════════════════════════════
    var VALID_CODES = (process.env.VALID_CODES || '').split(',').map(function(c){ return c.trim().toUpperCase(); }).filter(Boolean);

    // Verifye si kòd la valid
    var isValid = VALID_CODES.indexOf(code) > -1;

    // Log pou swivi (parèt nan Netlify Function logs)
    console.log('[verify-code]', {
      code: code,
      email: email,
      plan: plan,
      valid: isValid,
      time: new Date().toISOString()
    });

    if(isValid){
      // Retire kòd la pou li pa reutilize
      // (Note: pou retire kòd apre itilizasyon,
      //  ou ta bezwen yon baz done. Pou kounye a,
      //  ou ka chanje VALID_CODES manyèlman.)
      return {
        statusCode: 200,
        headers: { 'Access-Control-Allow-Origin': '*' },
        body: JSON.stringify({
          valid: true,
          plan: plan,
          message: 'Premium aktive!'
        })
      };
    } else {
      return {
        statusCode: 200,
        headers: { 'Access-Control-Allow-Origin': '*' },
        body: JSON.stringify({
          valid: false,
          message: 'Kòd invalide oswa ekspire'
        })
      };
    }

  } catch(err) {
    return {
      statusCode: 500,
      headers: { 'Access-Control-Allow-Origin': '*' },
      body: JSON.stringify({ valid: false, error: err.message })
    };
  }
};
