// netlify/functions/exchange-rate.js  
// Taux chanj HTG/USD - itilize yon API piblik gratis

const https = require('https');

exports.handler = async function(event) {
  const CORS = {
    'Access-Control-Allow-Origin': '*',
    'Content-Type': 'application/json'
  };

  try {
    // Essaye API Exchange Rate gratis (exchangerate-api.com)
    const data = await new Promise((resolve, reject) => {
      https.get('https://open.er-api.com/v6/latest/USD', (res) => {
        let raw = '';
        res.on('data', c => raw += c);
        res.on('end', () => {
          try { resolve(JSON.parse(raw)); }
          catch(e) { reject(e); }
        });
      }).on('error', reject);
    });

    if (data.rates && data.rates.HTG) {
      return {
        statusCode: 200,
        headers: CORS,
        body: JSON.stringify({
          rate: data.rates.HTG,
          base: 'USD',
          updated: data.time_last_update_utc,
          source: 'open.er-api.com'
        })
      };
    }

    throw new Error('HTG not in response');

  } catch(err) {
    // Fallback: taux approximatif si API indisponible
    return {
      statusCode: 200,
      headers: CORS,
      body: JSON.stringify({
        rate: 131.5, // Taux approximatif - mete a jour selon BRH
        base: 'USD',
        source: 'fallback',
        note: 'Taux approximatif - API unavailable'
      })
    };
  }
};
