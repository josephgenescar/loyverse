// netlify/functions/paypal-payment.js
// PayPal Checkout pou plan Premium yo. Pa mete client secret nan frontend lan.
const https = require('https');
const { URL } = require('url');

const SUPA_URL = process.env.SUPABASE_URL || 'https://mnpgapvltdrpztnjmeie.supabase.co';
const SUPA_KEY = process.env.SUPABASE_SERVICE_KEY || process.env.SUPABASE_ANON_KEY || '';
const CORS = {'Access-Control-Allow-Origin':'*','Access-Control-Allow-Headers':'Content-Type, Authorization','Access-Control-Allow-Methods':'GET, POST, OPTIONS'};

function paypalBase(){ return (process.env.PAYPAL_MODE || 'sandbox') === 'live' ? 'https://api-m.paypal.com' : 'https://api-m.sandbox.paypal.com'; }
function request(urlString, options, body){
  return new Promise((resolve, reject) => {
    const url = new URL(urlString);
    const req = https.request({hostname:url.hostname,path:url.pathname + url.search,...options}, res => {
      let raw = ''; res.on('data', chunk => raw += chunk);
      res.on('end', () => { let data={}; try{data=JSON.parse(raw||'{}');}catch(e){data={raw};} resolve({status:res.statusCode,data}); });
    });
    req.on('error', reject); if(body) req.write(body); req.end();
  });
}
async function accessToken(){
  const id=process.env.PAYPAL_CLIENT_ID, secret=process.env.PAYPAL_CLIENT_SECRET;
  if(!id || !secret) throw new Error('PAYPAL_CLIENT_ID ak PAYPAL_CLIENT_SECRET manke nan Netlify env vars');
  const body='grant_type=client_credentials';
  const result=await request(paypalBase()+'/v1/oauth2/token',{method:'POST',headers:{Authorization:'Basic '+Buffer.from(id+':'+secret).toString('base64'),'Content-Type':'application/x-www-form-urlencoded','Content-Length':Buffer.byteLength(body)}},body);
  if(result.status<200 || result.status>=300 || !result.data.access_token) throw new Error('PayPal token echwe');
  return result.data.access_token;
}
async function supabase(path, method, data){
  if(!SUPA_KEY) return;
  const body=data ? JSON.stringify(data) : '';
  const url=new URL(SUPA_URL+path);
  await request(url.toString(),{method,headers:{apikey:SUPA_KEY,Authorization:'Bearer '+SUPA_KEY,'Content-Type':'application/json',Prefer:'return=minimal','Content-Length':Buffer.byteLength(body)}},body);
}
async function findPayment(orderId){
  if(!SUPA_KEY) return null;
  const url = '/rest/v1/konektem_payments?order_id=eq.' + encodeURIComponent(orderId) + '&select=user_email,plan,amount&limit=1';
  const result = await request(SUPA_URL + url, {method:'GET', headers:{apikey:SUPA_KEY, Authorization:'Bearer '+SUPA_KEY}});
  return result.data && result.data[0] ? result.data[0] : null;
}
exports.handler=async function(event){
  if(event.httpMethod==='OPTIONS') return {statusCode:200,headers:CORS,body:''};
  try{
    const action=event.queryStringParameters && event.queryStringParameters.action;
    const body=JSON.parse(event.body||'{}');
    const token=await accessToken();
    const headers={Authorization:'Bearer '+token,'Content-Type':'application/json'};
    if(event.httpMethod==='POST' && (!action || action==='create')){
      const plan=body.plan==='annuel'?'annuel':'mensuel', amount=plan==='annuel'?100:10;
      const siteUrl=process.env.SITE_URL||'https://konektem.netlify.app';
      const order=await request(paypalBase()+'/v2/checkout/orders',{method:'POST',headers},JSON.stringify({intent:'CAPTURE',purchase_units:[{reference_id:'KONEKTEM-'+plan,amount:{currency_code:'USD',value:String(amount)}}],application_context:{brand_name:'Konektem',user_action:'PAY_NOW',return_url:siteUrl+'/payment-return.html?provider=paypal&email='+encodeURIComponent(body.email||'')+'&plan='+plan,cancel_url:siteUrl+'/app.html?paypal=cancel'}}));
      if(order.status<200 || order.status>=300 || !order.data.id){
        const detail = order.data && (order.data.error_description || order.data.name || order.data.message);
        throw new Error('Kreyasyon PayPal echwe' + (detail ? ': ' + detail : ' (verifye credentials ak mode Sandbox/Live)'));
      }
      await supabase('/rest/v1/konektem_payments','POST',{user_email:body.email||'',plan,amount,method:'PayPal',status:'pending',order_id:order.data.id,created_at:new Date().toISOString()});
      const approve=(order.data.links||[]).find(link=>link.rel==='approve');
      if(!approve) throw new Error('PayPal pa bay URL validasyon an');
      return {statusCode:200,headers:{...CORS,'Content-Type':'application/json'},body:JSON.stringify({success:true,redirectUrl:approve.href,orderId:order.data.id})};
    }
    if(event.httpMethod==='POST' && action==='capture'){
      const orderId=body.paypalOrderId||body.orderId;
      if(!orderId) throw new Error('PayPal orderId manke');
      const capture=await request(paypalBase()+'/v2/checkout/orders/'+encodeURIComponent(orderId)+'/capture',{method:'POST',headers},'');
      const captureId=capture.data.purchase_units && capture.data.purchase_units[0] && capture.data.purchase_units[0].payments && capture.data.purchase_units[0].payments.captures && capture.data.purchase_units[0].payments.captures[0] && capture.data.purchase_units[0].payments.captures[0].id;
      if(capture.status<200 || capture.status>=300 || capture.data.status!=='COMPLETED' || !captureId) return {statusCode:200,headers:{...CORS,'Content-Type':'application/json'},body:JSON.stringify({success:false,status:'pending'})};
      const payment = await findPayment(orderId);
      if(!payment || !payment.user_email) throw new Error('Peman PayPal sa a pa jwenn nan bazdone a');
      await supabase('/rest/v1/konektem_payments?order_id=eq.'+encodeURIComponent(orderId),'PATCH',{status:'confirmed',transaction_id:captureId,confirmed_at:new Date().toISOString()});
      await supabase('/rest/v1/konektem_users?email=eq.'+encodeURIComponent(payment.user_email),'PATCH',{plan:'premium',status:'active',premium_date:new Date().toISOString(),premium_plan:payment.plan||'mensuel',premium_order_id:orderId});
      return {statusCode:200,headers:{...CORS,'Content-Type':'application/json'},body:JSON.stringify({success:true,status:'confirmed',transactionId:captureId})};
    }
    return {statusCode:400,headers:CORS,body:JSON.stringify({success:false,error:'Action enkoni'})};
  }catch(error){
    console.error('[paypal-payment]',error.message);
    return {statusCode:500,headers:{...CORS,'Content-Type':'application/json'},body:JSON.stringify({success:false,error:error.message})};
  }
};