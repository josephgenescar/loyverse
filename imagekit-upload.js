const https = require('https');

exports.handler = async function(event) {
  if (event.httpMethod === 'OPTIONS') {
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

  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method not allowed' };
  }

  try {
    var PRIVATE_KEY = process.env.IMAGEKIT_PRIVATE_KEY;
    if (!PRIVATE_KEY) {
      return {
        statusCode: 500,
        headers: { 'Access-Control-Allow-Origin': '*' },
        body: JSON.stringify({ error: 'IMAGEKIT_PRIVATE_KEY manke nan Netlify Environment Variables' })
      };
    }

    var body = JSON.parse(event.body);
    var fileBase64 = body.file;
    var fileName = body.fileName || ('konektem_' + Date.now() + '.jpg');

    if (!fileBase64) {
      return {
        statusCode: 400,
        headers: { 'Access-Control-Allow-Origin': '*' },
        body: JSON.stringify({ error: 'Champ file obligatwa' })
      };
    }

    var auth = Buffer.from(PRIVATE_KEY + ':').toString('base64');
    var postData = JSON.stringify({
      file: fileBase64,
      fileName: fileName,
      folder: '/konektem/produits',
      useUniqueFileName: true
    });

    var result = await new Promise(function(resolve, reject) {
      var req = https.request({
        hostname: 'upload.imagekit.io',
        path: '/api/v1/files/upload',
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Basic ' + auth,
          'Content-Length': Buffer.byteLength(postData)
        }
      }, function(res) {
        var data = '';
        res.on('data', function(c) { data += c; });
        res.on('end', function() {
          try { resolve(JSON.parse(data)); }
          catch(e) { reject(new Error('Bad response: ' + data)); }
        });
      });
      req.on('error', reject);
      req.write(postData);
      req.end();
    });

    if (result.url) {
      return {
        statusCode: 200,
        headers: { 'Access-Control-Allow-Origin': '*' },
        body: JSON.stringify({ success: true, url: result.url, fileId: result.fileId })
      };
    } else {
      return {
        statusCode: 400,
        headers: { 'Access-Control-Allow-Origin': '*' },
        body: JSON.stringify({ error: result.message || 'Upload rate' })
      };
    }

  } catch(err) {
    return {
      statusCode: 500,
      headers: { 'Access-Control-Allow-Origin': '*' },
      body: JSON.stringify({ error: err.message })
    };
  }
};
