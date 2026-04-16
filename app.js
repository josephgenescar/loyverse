

// ════════════ STATE ════════════
var S = {
  products:[], categories:[], sales:[], clients:[], tickets:[], cart:[],
  connections:[], csvBuf:[],
  editProd:null, viewSale:null, editClient:null, editEmp:null, activeCat:'',
  employees:[], curImg:'', selPlanId:'mensuel', selPlanTxt:'2 500 HTG/mois',
  settings:{
    bizname:'', cashier:'', currency:'HTG', sector:'',
    tax:0, receiptmsg:'Merci pour votre confiance !',
    showReceipt:true, onboardingDone:false,
    plan:'trial', trialStart:null
  }
};

var TRIAL_LIMIT_ARTICLES = 50;
var TRIAL_LIMIT_SALES = 30;
var TRIAL_DAYS = 14;

var SECTOR_LABELS = {
  marche:'🛒 Marché / Épicerie',
  pharmacie:'💊 Pharmacie',
  electronique:'📱 Électronique',
  restaurant:'🍽️ Restaurant',
  store:'👗 Boutique / Mode',
  quincaillerie:'🔧 Quincaillerie',
  depot:'🏭 Dépôt / Grossiste',
  salon:'✂️ Salon / Beauté',
  service:'🛠️ Services / Réparation'
};
var SECTOR_CATS = {
  marche:['Épicerie','Boissons','Fruits & Légumes','Produits laitiers','Viandes','Condiments','Hygiène','Autres'],
  pharmacie:['Médicaments','Vitamines','Pansements','Hygiène','Bébé','Orthopédie','Parapharmacie','Autres'],
  electronique:['Smartphones','Accessoires','Ordinateurs','Audio/Vidéo','Réseaux','Câbles','Pièces détachées','Services'],
  restaurant:['Entrées','Plats principaux','Boissons','Desserts','Sandwiches','Petits-déjeuners','À emporter','Autres'],
  store:['Vêtements Femme','Vêtements Homme','Enfants','Chaussures','Accessoires','Sacs & Maroquinerie','Lingerie','Autres'],
  quincaillerie:['Matériaux','Quincaillerie','Peintures','Électricité','Plomberie','Outils','Ciment & Sable','Autres'],
  depot:['Alimentaire','Boissons','Hygiène & Beauté','Électroménager','Construction','Divers','En vrac','Autres'],
  salon:['Coiffure','Manucure','Soins visage','Épilation','Maquillage','Produits capillaires','Massages','Autres'],
  service:['Réparation smartphone','Réparation électro','Couture','Impression','Livraison','Informatique','Électricité','Autres']
};


var SECTOR_SEEDS = {
  marche:[
    {name:'Riz blanc 5lb',price:150,cost:100,stock:50,lowStock:5,category:'Épicerie'},
    {name:'Huile végétale 1L',price:400,cost:280,stock:20,lowStock:3,category:'Épicerie'},
    {name:'Haricots noirs 2lb',price:200,cost:140,stock:30,lowStock:5,category:'Épicerie'},
    {name:'Sel 1kg',price:50,cost:30,stock:100,lowStock:10,category:'Condiments'},
    {name:'Jus Tampico',price:75,cost:50,stock:48,lowStock:6,category:'Boissons'},
    {name:'Eau Culligan 5gal',price:500,cost:350,stock:20,lowStock:2,category:'Boissons'},
    {name:'Café Rebo',price:300,cost:200,stock:25,lowStock:5,category:'Boissons'},
    {name:'Maïs moulu',price:120,cost:80,stock:0,lowStock:5,category:'Épicerie'}
  ],
  pharmacie:[
    {name:'Paracétamol 500mg',price:50,cost:30,stock:200,lowStock:20,category:'Médicaments',dci:'Paracétamol',dosage:'500mg',forme:'Comprimé',ordo:false},
    {name:'Amoxicilline 500mg',price:120,cost:80,stock:150,lowStock:15,category:'Médicaments',dci:'Amoxicilline',dosage:'500mg',forme:'Gélule',ordo:true},
    {name:'Ibuprofène 400mg',price:80,cost:50,stock:180,lowStock:20,category:'Médicaments',dci:'Ibuprofène',dosage:'400mg',forme:'Comprimé',ordo:false},
    {name:'Vitamine C 1000mg',price:180,cost:120,stock:60,lowStock:10,category:'Vitamines',dci:'Acide ascorbique',dosage:'1000mg',forme:'Comprimé',ordo:false},
    {name:'Doliprane Sirop',price:250,cost:170,stock:40,lowStock:5,category:'Médicaments',dci:'Paracétamol',dosage:'100mg/mL',forme:'Sirop',ordo:false},
    {name:'Zinc 50mg',price:90,cost:60,stock:80,lowStock:10,category:'Vitamines',dci:'Zinc',dosage:'50mg',forme:'Comprimé',ordo:false}
  ],
  electronique:[
    {name:'Chargeur USB-C 20W',price:800,cost:500,stock:25,lowStock:3,category:'Accessoires'},
    {name:'Écouteurs Bluetooth',price:1500,cost:900,stock:15,lowStock:2,category:'Audio/Vidéo'},
    {name:'Câble HDMI 2m',price:600,cost:350,stock:20,lowStock:3,category:'Câbles'},
    {name:'Recharge Digicel 100',price:100,cost:95,stock:999,lowStock:0,category:'Services'},
    {name:'Powerbank 10000mAh',price:2500,cost:1600,stock:10,lowStock:2,category:'Accessoires'},
    {name:'Protège-écran iPhone',price:500,cost:300,stock:30,lowStock:5,category:'Accessoires'},
    {name:'Recharge Natcom 100',price:100,cost:92,stock:999,lowStock:0,category:'Services'},
    {name:'Câble USB-C 1m',price:300,cost:180,stock:40,lowStock:5,category:'Câbles'},
    {name:'Adaptateur HDMI',price:700,cost:420,stock:12,lowStock:2,category:'Accessoires'},
    {name:'Clé USB 32GB',price:900,cost:550,stock:18,lowStock:3,category:'Accessoires'},
    {name:'Batterie iPhone',price:1800,cost:1100,stock:8,lowStock:2,category:'Pièces détachées'},
    {name:'Écran Samsung A54',price:4500,cost:2800,stock:5,lowStock:1,category:'Pièces détachées'}
  ],
  restaurant:[
    {name:'Riz & Poulet',price:350,cost:180,stock:999,lowStock:0,category:'Plats principaux'},
    {name:'Griot + Bannann',price:400,cost:220,stock:999,lowStock:0,category:'Plats principaux'},
    {name:'Soda Coca-Cola',price:100,cost:60,stock:48,lowStock:6,category:'Boissons'},
    {name:'Eau minérale',price:75,cost:40,stock:60,lowStock:10,category:'Boissons'},
    {name:'Café noir',price:80,cost:30,stock:999,lowStock:0,category:'Boissons'},
    {name:'Sandwich poulet',price:200,cost:100,stock:20,lowStock:3,category:'Sandwiches'}
  ],
  store:[
    {name:'Robe casual',price:1800,cost:1100,stock:15,lowStock:2,category:'Vêtements Femme'},
    {name:'Jeans homme slim',price:2200,cost:1400,stock:12,lowStock:2,category:'Vêtements Homme'},
    {name:'T-shirt basique',price:600,cost:350,stock:40,lowStock:5,category:'Vêtements Homme'},
    {name:'Sneakers blanc',price:3500,cost:2200,stock:8,lowStock:2,category:'Chaussures'},
    {name:'Sandales femme',price:1500,cost:900,stock:10,lowStock:2,category:'Chaussures'},
    {name:'Sac à main',price:2800,cost:1800,stock:7,lowStock:1,category:'Sacs & Maroquinerie'}
  ],
  quincaillerie:[
    {name:'Ciment Portland 50kg',price:1200,cost:850,stock:50,lowStock:10,category:'Ciment & Sable'},
    {name:'Barre de fer 10mm',price:800,cost:550,stock:30,lowStock:5,category:'Matériaux'},
    {name:'Peinture blanc 4L',price:1800,cost:1200,stock:20,lowStock:3,category:'Peintures'},
    {name:'Câble électrique 2.5mm',price:150,cost:90,stock:200,lowStock:30,category:'Électricité'},
    {name:'Marteau 500g',price:600,cost:380,stock:15,lowStock:3,category:'Outils'},
    {name:'Robinet mélangeur',price:1500,cost:950,stock:10,lowStock:2,category:'Plomberie'}
  ],
  depot:[
    {name:'Huile végétale 20L',price:4500,cost:3200,stock:20,lowStock:3,category:'Alimentaire'},
    {name:'Farine blé 25kg',price:2800,cost:2000,stock:15,lowStock:3,category:'Alimentaire'},
    {name:'Riz importé 50kg',price:5500,cost:4000,stock:25,lowStock:5,category:'Alimentaire'},
    {name:'Sucre blanc 25kg',price:3200,cost:2300,stock:18,lowStock:3,category:'Alimentaire'},
    {name:'Savon lessive 10kg',price:1800,cost:1200,stock:30,lowStock:5,category:'Hygiène & Beauté'},
    {name:'Eau minérale (carton 24)',price:700,cost:450,stock:50,lowStock:10,category:'Boissons'}
  ],
  salon:[
    {name:'Coupe femme',price:500,cost:200,stock:999,lowStock:0,category:'Coiffure'},
    {name:'Coupe homme',price:300,cost:100,stock:999,lowStock:0,category:'Coiffure'},
    {name:'Tresse',price:1500,cost:500,stock:999,lowStock:0,category:'Coiffure'},
    {name:'Manucure',price:600,cost:150,stock:999,lowStock:0,category:'Manucure'},
    {name:'Coloration',price:2000,cost:800,stock:999,lowStock:0,category:'Coiffure'},
    {name:'Shampooing',price:400,cost:100,stock:30,lowStock:5,category:'Produits capillaires'}
  ],
  service:[
    {name:'Réparation écran',price:2500,cost:1500,stock:10,lowStock:2,category:'Réparation smartphone'},
    {name:'Changement batterie',price:1500,cost:800,stock:15,lowStock:3,category:'Réparation smartphone'},
    {name:'Déverrouillage',price:1000,cost:200,stock:999,lowStock:0,category:'Réparation smartphone'},
    {name:'Impression A4',price:25,cost:8,stock:500,lowStock:50,category:'Impression'},
    {name:'Impression couleur',price:75,cost:25,stock:200,lowStock:30,category:'Impression'},
    {name:'Réparation PC',price:3000,cost:1000,stock:999,lowStock:0,category:'Informatique'}
  ]
};

function save(){ try{localStorage.setItem('konektem_app',JSON.stringify(S));}catch(e){} }
function load(){
  ['kays_v2','kays_v3','kes_ayisyen','kes_ayisyen_v2','konektem_v1'].forEach(function(k){
    try{localStorage.removeItem(k);}catch(e){}
  });
  var d=localStorage.getItem('konektem_app');
  if(d){ try{ var p=JSON.parse(d); S=Object.assign({},S,p); }catch(e){} }
  if(!S.connections) S.connections=[];
  if(!S.clients) S.clients=[];
  if(!S.tickets) S.tickets=[];
  if(!S.csvBuf) S.csvBuf=[];
  S.activeCat='';
  if(!S.settings.currency) S.settings.currency='HTG';
  if(!S.employees)    S.employees=[];
  if(!S.fournisseurs) S.fournisseurs=[];
  if(!S.achats)       S.achats=[];
  if(!S.settings.hasOwnProperty('askLogin')) S.settings.askLogin=false;
  if(!S.settings.hasOwnProperty('askLoginAlways')) S.settings.askLoginAlways=false;
}
function uid(){ return Date.now().toString(36)+Math.random().toString(36).substr(2,5); }
function fmt(n){ return Number(n).toLocaleString('fr-HT')+' '+(S.settings.currency||'HTG'); }

// ════════════════════════════════════════
// SYSTÈME ESSAI & PREMIUM
// ════════════════════════════════════════

function isPremium(){ return S.settings.plan==='premium'; }

function isTrialExpired(){
  if(isPremium()) return false;
  if(!S.settings.trialStart) return false;
  var diff=Math.floor((Date.now()-new Date(S.settings.trialStart).getTime())/86400000);
  return diff >= TRIAL_DAYS;
}

function trialDaysLeft(){
  if(!S.settings.trialStart) return TRIAL_DAYS;
  var diff=Math.floor((Date.now()-new Date(S.settings.trialStart).getTime())/86400000);
  return Math.max(0,TRIAL_DAYS-diff);
}

function checkTrialOnStart(){
  if(isPremium()) return;
  if(isTrialExpired()) showExpiredWall();
}

function showExpiredWall(){
  if(document.getElementById('expired-wall')) return;
  var wall = document.createElement('div');
  wall.id  = 'expired-wall';
  // Bloke tout evènman klike anba — kliyan pa ka bypass
  wall.style.cssText = 'position:fixed;inset:0;z-index:2000;background:linear-gradient(135deg,#0D1F2D,#0a2e1a);display:flex;align-items:center;justify-content:center;padding:20px;';
  wall.addEventListener('click', function(e){ e.stopPropagation(); });

  var prix = PRIX_MENSUEL || 2500;
  var inner = document.createElement('div');
  inner.style.cssText = 'background:rgba(255,255,255,.06);border:1px solid rgba(255,255,255,.15);border-radius:20px;padding:32px;width:100%;max-width:380px;text-align:center;';

  // Header
  var h = document.createElement('div');
  h.innerHTML = '<div style="font-size:50px;margin-bottom:14px;">⏰</div>'
    + '<div style="font-family:Syne,sans-serif;font-size:22px;font-weight:800;color:#fff;margin-bottom:10px;">Essai termine</div>'
    + '<div style="font-size:13px;color:rgba(255,255,255,.5);margin-bottom:20px;line-height:1.6;">Votre periode d essai de 14 jours est termine.<br>Passez au Premium pour continuer a utiliser Konektem.</div>';

  // Bouton peman
  var btn = document.createElement('button');
  btn.id = 'expired-pay-btn';
  btn.style.cssText = 'width:100%;padding:15px;border:none;border-radius:10px;background:linear-gradient(135deg,#22c55e,#16a34a);color:#fff;font-family:sans-serif;font-size:15px;font-weight:800;cursor:pointer;margin-bottom:10px;';
  btn.textContent = '⭐ Passer Premium — Payer via MonCash';
  btn.onclick = function(e){
    e.stopPropagation();
    wall.style.display = 'none';
    showManualPayModal('mensuel', PRIX_MENSUEL, 'HTG/mois', function(){
      // Callback si kliyan fèmen modal san peye — remete mur la
      wall.style.display = 'flex';
    });
  };

  // Note peman
  var note = document.createElement('div');
  note.style.cssText = 'font-size:12px;color:rgba(255,255,255,.3);margin-top:4px;';
  note.textContent = '📱 MonCash · Envoyez et recevez votre code activation';

  inner.appendChild(h);
  inner.appendChild(btn);
  inner.appendChild(note);
  wall.appendChild(inner);
  document.body.appendChild(wall);

  // Bloke scroll anba
  document.body.style.overflow = 'hidden';
}

function checkArticleLimit(){
  if(isPremium()) return true;
  if(isTrialExpired()){ showExpiredWall(); return false; }
  if(S.products.length>=TRIAL_LIMIT_ARTICLES){ showPremium(); notif('Limite essai atteinte — passez Premium !','err'); return false; }
  return true;
}

function checkSaleLimit(){
  if(isPremium()) return true;
  if(isTrialExpired()){ showExpiredWall(); return false; }
  if(S.sales.length>=TRIAL_LIMIT_SALES){ showPremium(); notif('Limite essai atteinte — passez Premium !','err'); return false; }
  return true;
}

function showLimitWall(type){
  showPremium();
  notif('Limite essai atteinte !','err');
}

function updateTrialBar(){
  var bar = document.getElementById('trial-bar');
  if(!bar) return;
  // Premium → cacher complètement
  if(isPremium()){ bar.classList.add('hidden'); return; }
  // Essai non démarré → cacher
  if(!S.settings.trialStart){ bar.classList.add('hidden'); return; }
  // Essai expiré → rouge
  if(isTrialExpired()){
    bar.classList.remove('hidden');
    bar.style.background='linear-gradient(90deg,#fee2e2,#fecaca)';
    document.getElementById('trial-days-txt').innerHTML='<span style="color:#991b1b;font-weight:800;">Essai expiré</span>';
    document.getElementById('trial-fill').style.width='0%';
    return;
  }
  // Essai actif → afficher avec compteur
  bar.classList.remove('hidden');
  bar.style.background='';
  var days = trialDaysLeft();
  document.getElementById('trial-days-txt').textContent=days+' jour'+(days>1?'s':'')+' restant'+(days>1?'s':'');
  var pct = Math.round((days/TRIAL_DAYS)*100);
  document.getElementById('trial-fill').style.width=pct+'%';
  if(pct<30) document.getElementById('trial-fill').style.background='linear-gradient(90deg,#ef4444,#f87171)';
  else document.getElementById('trial-fill').style.background='linear-gradient(90deg,var(--gold),#fbbf24)';
}

function showPremium(){ document.getElementById('premMov').classList.add('show'); }

function selPlan(el,id,txt){
  document.querySelectorAll('.pm-plan').forEach(function(p){p.classList.remove('sel');});
  el.classList.add('sel'); S.selPlanId=id; S.selPlanTxt=txt;
  document.getElementById('pm-btn').textContent='Activer Premium — '+txt+' →';
}

// ════════════════════════════════════════
// CONFIG PEMAN — Mete done reyèl ou ici
// ════════════════════════════════════════
var MONCASH_NUM  = '509-4886-8964'; // ← Remplace ak nimewo MonCash ou
var WHATSAPP_NUM = '50948868964';    // ← Remplace ak nimewo WhatsApp ou
var PRIX_MENSUEL = 2500;
var PRIX_ANNUEL  = 22000;

function doPremium(){
  var plan = S.selPlanId || 'mensuel';
  var prix = plan === 'annuel' ? PRIX_ANNUEL : PRIX_MENSUEL;
  var unite= plan === 'annuel' ? 'HTG/an' : 'HTG/mois';

  // ── Jwenn email kliyan ──
  var userEmail = S.userEmail || (function(){
    try{ return JSON.parse(localStorage.getItem('konektem_user')||'{}').email||''; }catch(e){return '';}
  })();

  // Mete bouton nan loading state (san fèmen modal)
  var pmBtn = document.getElementById('pm-btn');
  if(pmBtn){
    pmBtn.disabled = true;
    pmBtn.textContent = '⏳ Connexion MonCash...';
    pmBtn.style.opacity = '0.7';
  }

  if(userEmail){
    // Rele Netlify Function MonCash
    fetch('/.netlify/functions/moncash-payment', {
      method: 'POST',
      headers: {'Content-Type':'application/json'},
      body: JSON.stringify({ email: userEmail, plan: plan, amount: prix })
    })
    .then(function(r){ return r.json(); })
    .then(function(data){
      if(data.success && data.redirectUrl){
        // Siksè — fèmen modal epi redirijé
        if(pmBtn){ pmBtn.textContent = '✅ Redirection...'; }
        closeMov('premMov');
        setTimeout(function(){ window.location.href = data.redirectUrl; }, 300);
      } else {
        // API echwe — reset bouton epi ouvri modal manuel
        resetPmBtn(plan, prix);
        closeMov('premMov');
        notif('MonCash pa disponib — itilize peman manuel', 'err');
        setTimeout(function(){ showManualPayModal(plan, prix, unite); }, 400);
      }
    })
    .catch(function(){
      // Pa gen Netlify Function (dev lokal oswa kle manke) — modal manuel
      resetPmBtn(plan, prix);
      closeMov('premMov');
      showManualPayModal(plan, prix, unite);
    });
    return;
  }

  // Pa gen email — ale dirèkteman nan modal manuel
  closeMov('premMov');
  showManualPayModal(plan, prix, unite);
}

function resetPmBtn(plan, prix){
  var pmBtn = document.getElementById('pm-btn');
  if(!pmBtn) return;
  pmBtn.disabled = false;
  pmBtn.style.opacity = '1';
  var txt = (plan==='annuel') ? '22 000 HTG/an' : '2 500 HTG/mois';
  pmBtn.textContent = 'Activer Premium — ' + txt + ' →';
}

function showPayLoading(plan, prix, unite){
  var old = document.getElementById('pay-loading-mov');
  if(old) old.remove();
  var mov = document.createElement('div');
  mov.id = 'pay-loading-mov';
  mov.style.cssText = 'position:fixed;inset:0;z-index:600;background:rgba(0,0,0,.8);display:flex;align-items:center;justify-content:center;';
  mov.innerHTML = '<div style="text-align:center;color:#fff;">'
    + '<div style="width:48px;height:48px;border:3px solid rgba(34,197,94,.3);border-top-color:#22c55e;border-radius:50%;animation:spin .8s linear infinite;margin:0 auto 16px;"></div>'
    + '<div style="font-size:16px;font-weight:700;margin-bottom:6px;">Koneksyon MonCash...</div>'
    + '<div style="font-size:13px;color:rgba(255,255,255,.5);">Tanpri tann yon moman</div>'
    + '</div>';
  document.body.appendChild(mov);
}

function closePayLoading(){
  var el = document.getElementById('pay-loading-mov');
  if(el) el.remove();
}

function showManualPayModal(plan, prix, unite){
  setTimeout(function(){
    var old = document.getElementById('pay-step-mov');
    if(old) old.remove();

    var mov = document.createElement('div');
    mov.id  = 'pay-step-mov';
    // z-index 3000 — anwo tout lòt modal, pa ka fèmen ak klik deyò
    mov.style.cssText = 'position:fixed;inset:0;z-index:3000;background:rgba(0,0,0,.92);display:flex;align-items:center;justify-content:center;padding:16px;overflow-y:auto;';

    // Enrejistre peman an atant nan Supabase
    var userEmail = S.userEmail||(function(){try{return JSON.parse(localStorage.getItem('konektem_user')||'{}').email||'';}catch(e){return '';}})();
    if(userEmail){ recordPaymentIntent(plan, prix); }

    var inner = document.createElement('div');
    inner.style.cssText = 'background:#0a1f14;border:1px solid rgba(34,197,94,.35);border-radius:18px;padding:26px;width:100%;max-width:400px;position:relative;';

    // PAS DE BOUTON FERMER — kliyan OBLIJE peye pou jwenn aksè
    // (Sèlman si pa gen expired wall — janm yon nouvo fonksyon ka pase onClose callback)
    var btnX = document.createElement('button');
    btnX.style.cssText = 'position:absolute;top:12px;right:12px;background:rgba(255,255,255,.06);border:1px solid rgba(255,255,255,.1);color:rgba(255,255,255,.3);width:28px;height:28px;border-radius:50%;cursor:default;font-size:15px;pointer-events:none;opacity:0.3;';
    btnX.textContent = '✕';
    btnX.title = 'Paiement requis pour continuer';
    // btnX.onclick = closePay;  // DESAKTIVE — pa ka fèmen

    // Header
    var hdr = document.createElement('div');
    hdr.style.cssText = 'text-align:center;margin-bottom:22px;';
    hdr.innerHTML = '<div style="font-size:36px;margin-bottom:8px;">📱</div>'
      + '<div style="font-size:18px;font-weight:800;color:#fff;margin-bottom:4px;">Payer via MonCash</div>'
      + '<div style="font-size:13px;color:rgba(255,255,255,.5);">Plan : <strong style="color:#86efac;">'+prix+' '+unite+'</strong></div>';

    // ── SECTION 1: Enstriksyon MonCash ──
    var sec1 = document.createElement('div');
    sec1.style.cssText = 'border:1px solid rgba(255,255,255,.08);border-radius:10px;padding:14px;margin-bottom:10px;';
    sec1.innerHTML = '<div style="font-size:11px;font-weight:700;color:#4ade80;letter-spacing:.6px;margin-bottom:12px;">① VOYE PEMAN NAN MONCASH</div>'
      + '<div style="font-size:13px;color:rgba(255,255,255,.85);line-height:2;">'
      + '1. Ouvri app <strong style="color:#fff;">MonCash</strong><br>'
      + '2. Klike <strong style="color:#fbbf24;">Envoyer de largent</strong><br>'
      + '3. Nimewo : <span style="font-size:19px;font-weight:800;color:#4ade80;letter-spacing:2px;display:block;margin:6px 0 4px;">'+MONCASH_NUM+'</span>'
      + '4. Montan : <strong style="color:#fbbf24;font-size:16px;">'+prix+' HTG</strong>'
      + '</div>';

    // ── SECTION 2: Voye screenshot WhatsApp ──
    var waMsg = 'Bonjour RIVAYO-TECH, mwen voye ' + prix + ' HTG sou MonCash pou plan ' + plan + '. Screenshot nan attachment la.';
    var waUrl = 'https://wa.me/' + WHATSAPP_NUM + '?text=' + encodeURIComponent(waMsg);
    var sec2 = document.createElement('div');
    sec2.style.cssText = 'border:1px solid rgba(255,255,255,.08);border-radius:10px;padding:14px;margin-bottom:10px;';
    var waBtn = document.createElement('a');
    waBtn.href = waUrl;
    waBtn.target = '_blank';
    waBtn.style.cssText = 'display:flex;align-items:center;justify-content:center;gap:8px;padding:12px;background:#25D366;border-radius:8px;color:#fff;font-weight:800;font-size:14px;text-decoration:none;';
    waBtn.textContent = '② Voye screenshot sou WhatsApp';
    waBtn.onclick = function(){ recordPaymentIntent(plan, prix); };
    var sec2lbl = document.createElement('div');
    sec2lbl.style.cssText = 'font-size:11px;font-weight:700;color:#4ade80;letter-spacing:.6px;margin-bottom:10px;';
    sec2lbl.textContent = '② VOYE SCREENSHOT BA NOU';
    var sec2sub = document.createElement('div');
    sec2sub.style.cssText = 'font-size:12px;color:rgba(255,255,255,.45);margin-bottom:10px;line-height:1.5;';
    sec2sub.textContent = 'Apre peman, voye screenshot konfimasyon MonCash ou sou WhatsApp pou nou verifye:';
    sec2.appendChild(sec2lbl);
    sec2.appendChild(sec2sub);
    sec2.appendChild(waBtn);

    // ── SECTION 3: Kòd aktivasyon ──
    var sec3 = document.createElement('div');
    sec3.style.cssText = 'border:1px solid rgba(255,255,255,.08);border-radius:10px;padding:14px;';
    sec3.innerHTML = '<div style="font-size:11px;font-weight:700;color:#4ade80;letter-spacing:.6px;margin-bottom:8px;">③ ANTRE KÒD AKTIVASYON OU</div>'
      + '<div style="font-size:12px;color:rgba(255,255,255,.45);margin-bottom:10px;line-height:1.5;">Apre nou verifye peman, nou voye kòd ba ou sou WhatsApp (ex: PREM-A3X7)</div>'
      + '<div style="display:flex;gap:8px;">'
      + '<input id="act-inp" placeholder="PREM-XXXX" maxlength="9" autocapitalize="characters" style="flex:1;background:rgba(255,255,255,.07);border:1.5px solid rgba(255,255,255,.15);border-radius:8px;padding:11px 12px;color:#fff;font-size:15px;font-family:monospace;outline:none;text-transform:uppercase;letter-spacing:2px;" oninput="this.value=this.value.toUpperCase();">'
      + '<button id="act-btn" onclick="verifyCode()" style="padding:10px 18px;border:none;border-radius:8px;background:#22c55e;color:#fff;font-weight:800;cursor:pointer;font-size:14px;white-space:nowrap;">Valide</button>'
      + '</div>'
      + '<div id="code-result" style="margin-top:8px;font-size:13px;display:none;padding:8px 10px;border-radius:6px;"></div>';

    inner.appendChild(btnX);
    inner.appendChild(hdr);
    inner.appendChild(sec1);
    inner.appendChild(sec2);
    inner.appendChild(sec3);
    mov.appendChild(inner);
    // Klik deyò DEZAKTIVE — pa ka bypass modal peman
    mov.addEventListener('click', function(e){
      e.preventDefault();
      e.stopPropagation();
      // Pa fèmen — kliyan oblije peye
    });
    document.body.appendChild(mov);

    setTimeout(function(){ var inp=document.getElementById('act-inp'); if(inp) inp.focus(); }, 300);
  }, 150);
}


// ── Enrejistre entansyon peman nan Supabase ──
function recordPaymentIntent(plan, montant){
  var userEmail = S.userEmail || (function(){
    try{ return JSON.parse(localStorage.getItem('konektem_user')||'{}').email||''; }catch(e){ return ''; }
  })();
  fetch('https://mnpgapvltdrpztnjmeie.supabase.co/rest/v1/konektem_payments', {
    method: 'POST',
    headers: {
      'apikey': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1ucGdhcHZsdGRycHp0bmptZWllIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzQxMzg5NDQsImV4cCI6MjA4OTcxNDk0NH0.6R9xGtGSJivvVxwqI2EfWjK3pAArZquIMxeEi-lt6tE',
      'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1ucGdhcHZsdGRycHp0bmptZWllIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzQxMzg5NDQsImV4cCI6MjA4OTcxNDk0NH0.6R9xGtGSJivvVxwqI2EfWjK3pAArZquIMxeEi-lt6tE',
      'Content-Type': 'application/json',
      'Prefer': 'return=minimal'
    },
    body: JSON.stringify({
      user_email: userEmail,
      plan: plan,
      amount: montant,
      method: 'MonCash',
      status: 'pending',
      created_at: new Date().toISOString()
    })
  }).catch(function(){});
}

function closePay(){
  var el = document.getElementById('pay-step-mov');
  if(el){ el.style.opacity='0'; setTimeout(function(){ if(el.parentNode) el.remove(); }, 200); }
}

function closeAllMov(){
  closeMov('premMov');
  closePay();
}

// ── VERIFIKASYON KÒD ──
function verifyCode(){
  var inp = document.getElementById('act-inp');
  var res = document.getElementById('code-result');
  var btn = document.getElementById('act-btn');
  if(!inp || !res) return;
  var code = inp.value.trim().toUpperCase();

  if(code.length < 8 || !code.startsWith('PREM-')){
    showCodeResult('err', 'Fòma enkòrèk — egzanp: PREM-A3X7');
    return;
  }

  showCodeResult('loading', 'Verifikasyon...');
  if(btn){ btn.disabled=true; btn.textContent='...'; }

  var userEmail = S.userEmail||(function(){
    try{return JSON.parse(localStorage.getItem('konektem_user')||'{}').email||'';}catch(e){return '';}
  })();

  // ── Verifye via Supabase fonksyon mark_code_used ──
  fetch('https://mnpgapvltdrpztnjmeie.supabase.co/rest/v1/rpc/mark_code_used', {
    method: 'POST',
    headers: {
      'apikey':        'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1ucGdhcHZsdGRycHp0bmptZWllIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzQxMzg5NDQsImV4cCI6MjA4OTcxNDk0NH0.6R9xGtGSJivvVxwqI2EfWjK3pAArZquIMxeEi-lt6tE',
      'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1ucGdhcHZsdGRycHp0bmptZWllIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzQxMzg5NDQsImV4cCI6MjA4OTcxNDk0NH0.6R9xGtGSJivvVxwqI2EfWjK3pAArZquIMxeEi-lt6tE',
      'Content-Type':  'application/json'
    },
    body: JSON.stringify({ p_code: code, p_email: userEmail })
  })
  .then(function(r){ return r.json(); })
  .then(function(valid){
    if(btn){ btn.disabled=false; btn.textContent='Valide'; }
    if(valid === true){
      // Supabase konfime kòd la — aktive lokal tou
      activatePremium(code);
    } else {
      showCodeResult('err', 'Kòd enkòrèk oswa deja itilize. Kontakte nou sou WhatsApp.');
    }
  })
  .catch(function(){
    // Fallback — Netlify Function si Supabase echwe
    fetch('/.netlify/functions/verify-code', {
      method:'POST',
      headers:{'Content-Type':'application/json'},
      body: JSON.stringify({ code:code, plan:S.selPlanId||'mensuel' })
    })
    .then(function(r){ return r.json(); })
    .then(function(data){
      if(btn){ btn.disabled=false; btn.textContent='Valide'; }
      if(data.valid){ activatePremium(code); }
      else showCodeResult('err', 'Kòd invalide. Kontakte nou sou WhatsApp.');
    })
    .catch(function(){
      if(btn){ btn.disabled=false; btn.textContent='Valide'; }
      // Dènye fallback — verifikasyon lokal
      if(verifyCodeLocal(code)){ activatePremium(code); }
      else showCodeResult('err', 'Kòd invalide. Kontakte nou sou WhatsApp.');
    });
  });
}

function showCodeResult(type, msg){
  var res = document.getElementById('code-result');
  if(!res) return;
  res.style.display = 'block';
  if(type==='loading'){
    res.style.background = 'rgba(255,255,255,.05)';
    res.style.color = 'rgba(255,255,255,.5)';
  } else if(type==='err'){
    res.style.background = 'rgba(239,68,68,.12)';
    res.style.color = '#fca5a5';
  } else {
    res.style.background = 'rgba(34,197,94,.12)';
    res.style.color = '#86efac';
  }
  res.textContent = msg;
}

function verifyCodeLocal(code){
  var valid = S.settings.validCodes || [];
  return valid.indexOf(code) > -1;
}

function activatePremium(code){
  S.settings.plan = 'premium';
  S.settings.premiumDate = new Date().toISOString();
  S.settings.premiumCode = code;
  S.settings.premiumPlan = S.selPlanId || 'mensuel';
  S.settings.validCodes = (S.settings.validCodes||[]).filter(function(c){ return c!==code; });
  save();

  // ── Sync Premium → Supabase ──
  var userEmail = S.userEmail || (function(){
    try{ return JSON.parse(localStorage.getItem('konektem_user')||'{}').email||''; }catch(e){ return ''; }
  })();
  if(userEmail){
    fetch('https://mnpgapvltdrpztnjmeie.supabase.co/rest/v1/konektem_users?email=eq.'+encodeURIComponent(userEmail), {
      method: 'PATCH',
      headers: {
        'apikey': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1ucGdhcHZsdGRycHp0bmptZWllIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzQxMzg5NDQsImV4cCI6MjA4OTcxNDk0NH0.6R9xGtGSJivvVxwqI2EfWjK3pAArZquIMxeEi-lt6tE',
        'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1ucGdhcHZsdGRycHp0bmptZWllIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzQxMzg5NDQsImV4cCI6MjA4OTcxNDk0NH0.6R9xGtGSJivvVxwqI2EfWjK3pAArZquIMxeEi-lt6tE',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        plan: 'premium',
        status: 'active',
        premium_code: code,
        premium_date: new Date().toISOString(),
        premium_plan: S.selPlanId||'mensuel'
      })
    }).catch(function(){});
  }

  closePay();
  var wall = document.getElementById('expired-wall');
  if(wall) wall.remove();
  document.getElementById('trial-bar').classList.add('hidden');
  notif('🎉 Premium aktivé ! Tout aksè lib.','ok');
}

// ── FONKSYON ADMIN (itilize nan konsòl) ──
function addValidCode(code){
  if(!S.settings.validCodes) S.settings.validCodes=[];
  code=code.toUpperCase();
  if(S.settings.validCodes.indexOf(code)===-1){
    S.settings.validCodes.push(code); save();
    console.log('✅ Kòd ajoute:', code);
  }
}
function listCodes(){ console.table(S.settings.validCodes||[]); }
function removeCode(code){
  S.settings.validCodes=(S.settings.validCodes||[]).filter(function(c){return c!==code;});
  save(); console.log('🗑️ Kòd retire:', code);
}

// ── METE A JOU AFICHAJ PRI ──
function updatePriceDisplay(){
  var fmtPri = function(n){ return n.toLocaleString('fr-HT'); };
  // premMov — plan cards
  var planMens = document.querySelector('.pm-plan[onclick*="mensuel"] .pm-pprice');
  var planAnn  = document.querySelector('.pm-plan[onclick*="annuel"] .pm-pprice');
  if(planMens) planMens.innerHTML = fmtPri(PRIX_MENSUEL) + ' <span class="pm-pper">HTG/mois</span>';
  if(planAnn)  planAnn.innerHTML  = fmtPri(PRIX_ANNUEL)  + ' <span class="pm-pper">HTG/an</span>';
  // Bouton Activer Premium
  var pmBtn = document.getElementById('pm-btn');
  if(pmBtn){
    var curPlan = S.selPlanId || 'mensuel';
    var curPrix = curPlan === 'annuel' ? PRIX_ANNUEL : PRIX_MENSUEL;
    var curUnite = curPlan === 'annuel' ? 'HTG/an' : 'HTG/mois';
    pmBtn.textContent = 'Activer Premium — ' + fmtPri(curPrix) + ' ' + curUnite + ' →';
  }
  // selPlan onclick update
  var planCards = document.querySelectorAll('.pm-plan');
  planCards.forEach(function(card){
    var isMens = card.getAttribute('onclick') && card.getAttribute('onclick').includes('mensuel');
    var prix   = isMens ? PRIX_MENSUEL : PRIX_ANNUEL;
    var unite  = isMens ? 'HTG/mois' : 'HTG/an';
    var txt    = fmtPri(prix) + ' ' + unite;
    // Update onclick pou pase bon prix
    card.setAttribute('onclick', "selPlan(this,'" + (isMens?'mensuel':'annuel') + "','" + txt + "')");
  });
  // Expired wall / renewal wall si egziste
  var expBtn = document.querySelector('#expired-wall button');
  if(expBtn && expBtn.textContent.includes('HTG')){
    expBtn.textContent = '⭐ Passer Premium — ' + fmtPri(PRIX_MENSUEL) + ' HTG/mois';
  }
}

// ── CLOCK ──
function tick(){var n=new Date();var el=document.getElementById('clock');if(el)el.textContent=String(n.getHours()).padStart(2,'0')+':'+String(n.getMinutes()).padStart(2,'0');}
// tick démarre apre DOM chaje (evite 'document is not defined')

// ── ONBOARDING ──
var obSec='';
function obNext(step){
  if(step===0){
    var biz=document.getElementById('ob-biz').value.trim();
    var cash=document.getElementById('ob-cash').value.trim();
    if(!biz||!cash){notif('Veuillez remplir tous les champs.','err');return;}
    S.settings.bizname=biz; S.settings.cashier=cash;
    S.settings.currency=document.getElementById('ob-cur').value;
  }
  if(step===1){
    if(!obSec){notif('Choisissez votre secteur.','err');return;}
    S.settings.sector=obSec;
    var icons={marche:'🛒',pharmacie:'💊',electronique:'📱',restaurant:'🍽️',store:'👗',quincaillerie:'🔧',depot:'🏭',salon:'✂️',service:'🛠️'};
    document.getElementById('ob-confirm').textContent='Votre espace '+S.settings.bizname+' est configuré en mode '+SECTOR_LABELS[obSec]+'.';
    document.getElementById('ob-summary').innerHTML=[
      obRow('🏪',S.settings.bizname),obRow('👤',S.settings.cashier),
      obRow(icons[obSec],SECTOR_LABELS[obSec]),obRow('💰',S.settings.currency)
    ].join('');
  }
  goObStep(step+1);
}
function obRow(ico,val){return '<div style="display:flex;align-items:center;gap:7px;color:rgba(255,255,255,.85);font-size:13px;font-weight:600"><span>'+ico+'</span><span>'+val+'</span></div>';}
function obBack(s){goObStep(s-1);}
function goObStep(n){
  ['os0','os1','os2'].forEach(function(id,i){document.getElementById(id).classList.toggle('on',i===n);});
  ['d0','d1','d2'].forEach(function(id,i){document.getElementById(id).classList.toggle('on',i===n);});
}
function selSec(el,sec){
  document.querySelectorAll('.sec-card').forEach(function(c){c.classList.remove('sel');});
  el.classList.add('sel'); obSec=sec;
  document.getElementById('ob-btn1').disabled=false;
}
function launchApp(){
  S.settings.onboardingDone = true;
  S.settings.trialStart     = new Date().toISOString();
  S.settings.businessId     = S.settings.businessId || uid();
  S.categories = SECTOR_CATS[S.settings.sector] || ['Général'];
  var seeds = SECTOR_SEEDS[S.settings.sector] || SECTOR_SEEDS.marche;
  S.products = seeds.map(function(p){
    return Object.assign({id:uid(),icon:'',img:'',barcode:'',source:'manual',connType:''},p);
  });
  save();

  // Enrejistre sektè + biznis nan Supabase pou admin wè
  var lu = {};
  try{ lu = JSON.parse(localStorage.getItem('konektem_user')||'{}'); }catch(e){}
  var email = lu.email || '';
  if(email){
    fetch(SUPA_URL_APP+'/rest/v1/konektem_users', {
      method:'POST',
      headers:{
        'apikey':SUPA_KEY_APP,'Authorization':'Bearer '+SUPA_KEY_APP,
        'Content-Type':'application/json',
        'Prefer':'resolution=merge-duplicates,return=minimal',
        'on_conflict':'email'
      },
      body: JSON.stringify({
        email:       email,
        bizname:     S.settings.bizname,
        secteur:     S.settings.sector,
        plan:        'trial',
        status:      'active',
        trial_start: S.settings.trialStart,
        business_id: S.settings.businessId,
        created_at:  new Date().toISOString()
      })
    }).catch(function(){});
  }
  startApp();
}

// ── APP START ──
// ════════════════════════════════════════
// SYNC SUPABASE — tire + pouse done
// Chèche plan, statut, ban depi admin
// ════════════════════════════════════════
var SUPA_URL_APP = 'https://mnpgapvltdrpztnjmeie.supabase.co';
var SUPA_KEY_APP = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1ucGdhcHZsdGRycHp0bmptZWllIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzQxMzg5NDQsImV4cCI6MjA4OTcxNDk0NH0.6R9xGtGSJivvVxwqI2EfWjK3pAArZquIMxeEi-lt6tE';

function syncUserToSupabase(){
  try {
    var lu = JSON.parse(localStorage.getItem('konektem_user')||'{}');
    var email = lu.email||'';
    if(!email) return;
    S.userEmail = email;

    // ── ETAP 1: Tire done kliyan depi Supabase ──
    fetch(SUPA_URL_APP+'/rest/v1/konektem_users?email=eq.'+encodeURIComponent(email)+'&select=plan,status,trial_days,premium_date,premium_plan,message_global,price_mensuel,price_annuel', {
      headers: {
        'apikey': SUPA_KEY_APP,
        'Authorization': 'Bearer '+SUPA_KEY_APP
      }
    })
    .then(function(r){ return r.json(); })
    .then(function(data){
      if(!Array.isArray(data) || data.length === 0){
        // Kliyan pa nan Supabase — kreye li
        pushUserToSupabase(email);
        return;
      }
      var remote = data[0];

      // ── VERIFYE BAN oswa LOCK ──
      if(remote.status === 'banned'){
        showBannedWall();
        return;
      }
      if(remote.status === 'locked'){
        showLockedWall();
        return;
      }

      // ── SYNC PRI PLAN depi admin ──
      if(remote.price_mensuel && remote.price_mensuel !== PRIX_MENSUEL){
        PRIX_MENSUEL = remote.price_mensuel;
        updatePriceDisplay();
      }
      if(remote.price_annuel && remote.price_annuel !== PRIX_ANNUEL){
        PRIX_ANNUEL = remote.price_annuel;
        updatePriceDisplay();
      }

      // ── VERIFYE EXPIRAYSYON PREMIUM ──
      if(remote.plan === 'premium' && remote.premium_date){
        var premPlan = remote.premium_plan || 'mensuel';
        var premDate = new Date(remote.premium_date);
        var nbJou    = premPlan === 'annuel' ? 365 : 30;
        var expDate  = new Date(premDate.getTime() + nbJou * 86400000);
        if(expDate < new Date()){
          // Premium ekspire — retounen trial
          remote.plan = 'expired_premium';
          // Notif + mur renouvèlman
          if(S.settings.plan === 'premium'){
            S.settings.plan = 'trial';
            S.settings.trialStart = new Date().toISOString();
            save();
            showRenewalWall(premPlan);
          }
        }
      }

      // ── SYNC PLAN depi admin ──
      if(remote.plan === 'premium' && S.settings.plan !== 'premium'){
        // Admin te aktive Premium — mete a jou lokal
        S.settings.plan = 'premium';
        S.settings.premiumDate = remote.premium_date || new Date().toISOString();
        S.settings.premiumPlan = remote.premium_plan || 'mensuel';
        save();
        // Retire mur ekspire
        var wall = document.getElementById('expired-wall');
        if(wall) wall.remove();
        document.getElementById('trial-bar').classList.add('hidden');
        notif('⭐ Premium aktivé pa admin — Mèsi!', 'ok');
        updateTrialBar();
      }

      // ── SYNC TRIAL DAYS depi admin ──
      if(remote.trial_days && remote.trial_days !== TRIAL_DAYS){
        TRIAL_DAYS = remote.trial_days;
        updateTrialBar();
      }

      // ── MESAJ GLOBAL depi admin ──
      if(remote.message_global && remote.message_global !== S.settings.lastGlobalMsg){
        S.settings.lastGlobalMsg = remote.message_global;
        save();
        notif('📢 ' + remote.message_global, 'inf');
      }

      // ── ETAP 2: Pouse done lokal → Supabase ──
      pushUserToSupabase(email);
    })
    .catch(function(){
      // Offline oswa erè — jis pouse done lokal
      pushUserToSupabase(email);
    });
  } catch(e){}
}

function pushUserToSupabase(email){
  // Jwenn modpas hash pou sove nan Supabase (pou multi-aparèy)
  var passHash = '';
  try{
    var lu = JSON.parse(localStorage.getItem('konektem_user')||'{}');
    passHash = lu.pass || '';
  }catch(e){}
  var body = JSON.stringify({
    email:       email,
    bizname:     S.settings.bizname||'',
    secteur:     S.settings.sector||'',
    plan:        S.settings.plan||'trial',
    status:      'active',
    last_seen:   new Date().toISOString(),
    trial_start: S.settings.trialStart||null,
    premium_date: S.settings.premiumDate||null,
    premium_plan: S.settings.premiumPlan||null,
    // pass_hash retire — kolonne pa nan Supabase toujou
  });
  // Upsert — kreye si pa egziste, mete a jou si egziste
  fetch(SUPA_URL_APP+'/rest/v1/konektem_users', {
    method: 'POST',
    headers: {
      'apikey':        SUPA_KEY_APP,
      'Authorization': 'Bearer '+SUPA_KEY_APP,
      'Content-Type':  'application/json',
      'Prefer':        'resolution=merge-duplicates,return=minimal'
    },
    body: body
  })
  .then(function(r){
    console.log('[Konektem] Sync user →', r.status, email);
    if(!r.ok) r.text().then(function(t){ console.error('[Konektem] Sync error:', t); });
    else {
      // Apre sync user, sync done biznis (Premium sèlman)
      if(S.settings.plan === 'premium') pushBizDataToSupabase(email);
    }
  })
  .catch(function(err){
    console.warn('[Konektem] Sync echwe (offline?):', err.message);
  });
}

// ── Sync done biznis (atik, vant, kliyan) pou propriétaire ──
// Stocke kòm JSONB nan konektem_data table
function pushBizDataToSupabase(email){
  if(!email) return;
  var bizData = {
    email:     email,
    biz_id:    S.settings.businessId || email,
    products:  JSON.stringify(S.products || []),
    sales:     JSON.stringify((S.sales || []).slice(0, 500)), // dènye 500
    clients:   JSON.stringify(S.clients || []),
    categories: JSON.stringify(S.categories || []),
    employees: JSON.stringify((S.employees || []).map(function(e){
      // Pa voye PIN nan Supabase pou sekirite
      return {id:e.id, name:e.name, role:e.role, tel:e.tel};
    })),
    updated_at: new Date().toISOString()
  };
  fetch(SUPA_URL_APP + '/rest/v1/konektem_data', {
    method: 'POST',
    headers: {
      'apikey': SUPA_KEY_APP,
      'Authorization': 'Bearer ' + SUPA_KEY_APP,
      'Content-Type': 'application/json',
      'Prefer': 'resolution=merge-duplicates,return=minimal',
      'on_conflict': 'email'
    },
    body: JSON.stringify(bizData)
  })
  .then(function(r){
    console.log('[Konektem] BizData sync →', r.status);
  })
  .catch(function(err){
    console.warn('[Konektem] BizData sync echwe:', err.message);
  });
}

// ── Tire done biznis depi Supabase ──
// Rele sa lè propriétaire konekte sou nouvo aparèy
function pullBizDataFromSupabase(email, onDone){
  if(!email) return;
  fetch(SUPA_URL_APP + '/rest/v1/konektem_data?email=eq.' + encodeURIComponent(email) + '&select=*', {
    headers: {
      'apikey': SUPA_KEY_APP,
      'Authorization': 'Bearer ' + SUPA_KEY_APP
    }
  })
  .then(function(r){ return r.json(); })
  .then(function(data){
    if(!data || !data.length) { if(onDone) onDone(false); return; }
    var biz = data[0];
    // Sèlman mete a jou si done Supabase yo pi resan ke lokal yo
    var remoteDate = biz.updated_at ? new Date(biz.updated_at) : null;
    var localDate  = S.settings.lastBizSync ? new Date(S.settings.lastBizSync) : null;
    if(remoteDate && (!localDate || remoteDate > localDate)){
      try {
        var prods = JSON.parse(biz.products || '[]');
        var sales = JSON.parse(biz.sales || '[]');
        var clients = JSON.parse(biz.clients || '[]');
        var cats  = JSON.parse(biz.categories || '[]');
        if(prods.length)   S.products   = prods;
        if(sales.length)   S.sales      = sales;
        if(clients.length) S.clients    = clients;
        if(cats.length)    S.categories = cats;
        S.settings.lastBizSync = biz.updated_at;
        save();
        console.log('[Konektem] BizData pulled:', prods.length, 'prods,', sales.length, 'sales');
        if(onDone) onDone(true);
      } catch(e) {
        console.error('[Konektem] BizData parse error:', e);
        if(onDone) onDone(false);
      }
    } else {
      if(onDone) onDone(false);
    }
  })
  .catch(function(){ if(onDone) onDone(false); });
}

// ══════════════════════════════════════════════════════════════
// SYNC VANT + STOCK AN TAN REYÈL (Multi-appareil)
// ══════════════════════════════════════════════════════════════

function getSyncId(){
  // Itilize business_id kòm idantifyan boutik pou sync
  return S.settings.businessId || S.settings.bizname || 'default';
}

function getSyncEmail(){
  try{ return JSON.parse(localStorage.getItem('konektem_user')||'{}').email||''; }catch(e){ return ''; }
}

// Sove yon vant nan Supabase pou sync
function syncSaleToCloud(sale){
  var email = getSyncEmail();
  var bizId = getSyncId();
  if(!email || !bizId) return;
  fetch(SUPA_URL_APP+'/rest/v1/konektem_sales', {
    method:'POST',
    headers:{
      'apikey':SUPA_KEY_APP,'Authorization':'Bearer '+SUPA_KEY_APP,
      'Content-Type':'application/json','Prefer':'resolution=merge-duplicates,return=minimal',
      'on_conflict':'id'
    },
    body: JSON.stringify({
      id:          sale.id,
      business_id: bizId,
      user_email:  email,
      num:         sale.num,
      date:        sale.date,
      items:       sale.items,
      subtotal:    sale.subtotal||0,
      discount:    sale.discount||0,
      tax:         sale.tax||0,
      total:       sale.total,
      method:      sale.method,
      cashier:     sale.cashier,
      cashier_role:sale.cashierRole||'caissier',
      client_nom:  sale.clientNom||null,
      client_tel:  sale.clientTel||null,
      rendu:       sale.rendu||0,
      is_retour:   sale.isRetour||false,
      rembourse:   sale.rembourse||false
    })
  })
  .then(function(r){
    console.log('[Sync] Vant sove cloud:', sale.num, '→', r.status);
  })
  .catch(function(err){
    console.warn('[Sync] Vant echwe cloud:', err.message);
  });
}

// Sync tout stock atik yo
function syncProductsToCloud(){
  var email = getSyncEmail();
  var bizId = getSyncId();
  if(!email || !bizId || !S.products.length) return;
  var products = S.products.map(function(p){
    return {
      id:          p.id,
      business_id: bizId,
      user_email:  email,
      name:        p.name,
      price:       p.price,
      cost:        p.cost||0,
      stock:       p.stock,
      low_stock:   p.lowStock||5,
      category:    p.category||'',
      barcode:     p.barcode||'',
      img:         p.img||'',
      source:      p.source||'manual',
      updated_at:  new Date().toISOString()
    };
  });
  fetch(SUPA_URL_APP+'/rest/v1/konektem_products', {
    method:'POST',
    headers:{
      'apikey':SUPA_KEY_APP,'Authorization':'Bearer '+SUPA_KEY_APP,
      'Content-Type':'application/json','Prefer':'resolution=merge-duplicates,return=minimal',
      'on_conflict':'id'
    },
    body: JSON.stringify(products)
  })
  .then(function(r){ console.log('[Sync] Stock cloud:', r.status, products.length, 'atik'); })
  .catch(function(err){ console.warn('[Sync] Stock echwe:', err.message); });
}

// Tire vant + stock depi cloud (pou patron wè done kasye)
function pullFromCloud(){
  var email = getSyncEmail();
  var bizId = getSyncId();
  if(!email || !bizId) return;
  // Tire vant 30 dènye jou
  var since = new Date(Date.now()-30*86400000).toISOString();
  fetch(SUPA_URL_APP+'/rest/v1/konektem_sales?business_id=eq.'+encodeURIComponent(bizId)+'&date=gte.'+since+'&order=date.desc&limit=500',{
    headers:{'apikey':SUPA_KEY_APP,'Authorization':'Bearer '+SUPA_KEY_APP}
  })
  .then(function(r){ return r.json(); })
  .then(function(cloudSales){
    if(!Array.isArray(cloudSales)||!cloudSales.length) return;
    // Merge: ajoute vant ki pa nan lokal
    var localIds = new Set(S.sales.map(function(s){ return s.id; }));
    var newSales = cloudSales.filter(function(cs){ return !localIds.has(cs.id); });
    if(!newSales.length) return;
    // Konvèti fòma cloud → lokal
    var converted = newSales.map(function(cs){
      return {
        id:cs.id, num:cs.num, date:cs.date,
        items:cs.items||[], subtotal:cs.subtotal||0,
        discount:cs.discount||0, tax:cs.tax||0,
        total:cs.total, method:cs.method,
        cashier:cs.cashier, cashierRole:cs.cashier_role,
        clientNom:cs.client_nom, clientTel:cs.client_tel,
        rendu:cs.rendu||0, isRetour:cs.is_retour||false,
        rembourse:cs.rembourse||false, locked:true
      };
    });
    S.sales = S.sales.concat(converted);
    S.sales.sort(function(a,b){ return new Date(b.date)-new Date(a.date); });
    save();
    if(document.getElementById('view-recu').classList.contains('on')) renderRecu();
    if(document.getElementById('view-backoffice').classList.contains('on')) renderBO();
    console.log('[Sync] '+newSales.length+' nouvo vant tire depi cloud');
    if(newSales.length>0) notif('📥 '+newSales.length+' vant sync depi lòt aparèy','inf');
  })
  .catch(function(err){ console.warn('[Sync] Pull echwe:', err.message); });

  // Tire stock atik tou
  fetch(SUPA_URL_APP+'/rest/v1/konektem_products?business_id=eq.'+encodeURIComponent(bizId),{
    headers:{'apikey':SUPA_KEY_APP,'Authorization':'Bearer '+SUPA_KEY_APP}
  })
  .then(function(r){ return r.json(); })
  .then(function(cloudProds){
    if(!Array.isArray(cloudProds)||!cloudProds.length) return;
    // Mete a jou stock lokal sèlman (pa ekrase done lokal konplè)
    cloudProds.forEach(function(cp){
      var local = S.products.find(function(p){ return p.id===cp.id; });
      if(local && cp.updated_at > (local.updatedAt||'')){ local.stock = cp.stock; }
    });
    save();
    if(document.getElementById('view-pos').style.display!=='none') renderProds();
    console.log('[Sync] Stock mete a jou depi cloud');
  })
  .catch(function(){});
}

function showRenewalWall(plan){
  if(document.getElementById('renewal-wall')) return;
  var wall = document.createElement('div');
  wall.id = 'renewal-wall';
  wall.style.cssText = 'position:fixed;inset:0;z-index:2000;background:linear-gradient(135deg,#0D1F2D,#0a1f14);display:flex;align-items:center;justify-content:center;padding:20px;';
  var inner = document.createElement('div');
  inner.style.cssText = 'background:rgba(255,255,255,.05);border:1px solid rgba(245,158,11,.3);border-radius:20px;padding:32px;width:100%;max-width:380px;text-align:center;';
  // Bloke klike deyò
  wall.addEventListener('click', function(e){ e.stopPropagation(); });
  document.body.style.overflow = 'hidden';

  var h = document.createElement('div');
  h.innerHTML = '<div style="font-size:46px;margin-bottom:14px;">⏰</div>'
    + '<div style="font-size:20px;font-weight:800;color:#fff;margin-bottom:8px;">Plan '+(plan==='annuel'?'Annuel':'Mensuel')+' ekspire</div>'
    + '<div style="font-size:13px;color:rgba(255,255,255,.5);margin-bottom:16px;line-height:1.6;">Plan Premium ou ekspire. Renouvle pou kontinye san limit.</div>';

  var btn = document.createElement('button');
  btn.style.cssText = 'width:100%;padding:14px;border:none;border-radius:10px;background:linear-gradient(135deg,#22c55e,#16a34a);color:#fff;font-weight:800;font-size:15px;cursor:pointer;';
  btn.textContent = '🔄 Renouvle Premium — Payer via MonCash';
  btn.onclick = function(e){
    e.stopPropagation();
    wall.style.display = 'none';
    document.body.style.overflow = '';
    S.selPlanId = plan;
    showManualPayModal(plan, plan==='annuel'?PRIX_ANNUEL:PRIX_MENSUEL, plan==='annuel'?'HTG/an':'HTG/mois');
  };

  var note = document.createElement('div');
  note.style.cssText = 'font-size:11px;color:rgba(255,255,255,.25);margin-top:10px;';
  note.textContent = '📱 MonCash · Envoyez le paiement et recevez votre code';

  inner.appendChild(h);
  inner.appendChild(btn);
  inner.appendChild(note);
  wall.appendChild(inner);
  document.body.appendChild(wall);

  // Push notifikasyon si pèmisyon disponib
  if('Notification' in window && Notification.permission === 'granted'){
    new Notification('Konektem — Abonnement expiré', {
      body: 'Votre plan ' + (plan==='annuel'?'Annuel':'Mensuel') + ' est expiré. Renouvelez pour continuer.',
      icon: '/manifest.json'
    });
  }
}

function showLockedWall(){
  if(document.getElementById('locked-wall')) return;
  var wall = document.createElement('div');
  wall.id   = 'locked-wall';
  wall.style.cssText = 'position:fixed;inset:0;z-index:3000;background:#0D1F2D;display:flex;align-items:center;justify-content:center;padding:20px;';
  wall.addEventListener('click', function(e){ e.stopPropagation(); });
  document.body.style.overflow = 'hidden';

  var inner = document.createElement('div');
  inner.style.cssText = 'text-align:center;max-width:360px;';

  var ico = document.createElement('div');
  ico.style.cssText = 'font-size:56px;margin-bottom:16px;';
  ico.textContent = '🔒';

  var title = document.createElement('div');
  title.style.cssText = 'font-size:22px;font-weight:800;color:#fff;margin-bottom:10px;';
  title.textContent = 'Acces bloke';

  var sub = document.createElement('div');
  sub.style.cssText = 'font-size:13px;color:rgba(255,255,255,.5);line-height:1.7;margin-bottom:24px;';
  sub.textContent = 'Ou bezwen renouvle abonnman ou pou gen acces ak Konektem. Peye via MonCash epi kontakte nou.';

  var btn = document.createElement('a');
  btn.href   = 'https://wa.me/'+WHATSAPP_NUM+'?text=Mwen vle renouvle plan Konektem mwen';
  btn.target = '_blank';
  btn.style.cssText = 'display:inline-flex;align-items:center;gap:8px;padding:13px 28px;background:#25D366;border-radius:10px;color:#fff;font-weight:800;font-size:14px;text-decoration:none;';
  btn.textContent = '💬 Kontakte nou sou WhatsApp';

  inner.appendChild(ico); inner.appendChild(title);
  inner.appendChild(sub); inner.appendChild(btn);
  wall.appendChild(inner);
  document.body.appendChild(wall);
}



function showBannedWall(){
  if(document.getElementById('banned-wall')) return;
  var wall = document.createElement('div');
  wall.id = 'banned-wall';
  wall.style.cssText = 'position:fixed;inset:0;z-index:3000;background:#0D1F2D;display:flex;align-items:center;justify-content:center;padding:20px;';
  var inner = document.createElement('div');
  inner.style.cssText = 'text-align:center;max-width:360px;';
  inner.innerHTML = '<div style="font-size:48px;margin-bottom:16px;">🚫</div>'
    + '<div style="font-size:20px;font-weight:800;color:#fff;margin-bottom:8px;">Kont bloke</div>'
    + '<div style="font-size:13px;color:rgba(255,255,255,.5);line-height:1.6;margin-bottom:20px;">Kont ou te bloke pa administratè Konektem. Kontakte sipò pou plis enfòmasyon.</div>'
    + '<a href="https://wa.me/'+WHATSAPP_NUM+'" target="_blank" style="display:inline-block;padding:11px 24px;background:#25D366;border-radius:8px;color:#fff;font-weight:800;font-size:14px;text-decoration:none;">💬 Kontakte Sipò</a>';
  wall.appendChild(inner);
  document.body.appendChild(wall);
}

function startApp(){
  document.getElementById('screen-ob').classList.add('hidden');
  var app=document.getElementById('screen-app');
  app.style.display='flex'; app.style.flexDirection='column'; app.style.height='100%';
  // Démare clock sèlman apre DOM prèt
  tick(); setInterval(tick, 1000);
  updateTopbar(); updateTrialBar();
  checkTrialOnStart();
  initDarkMode();
  // Pull done biznis si Premium (nouvo aparèy oswa apre lon tan)
  setTimeout(function(){
    var ueml = (function(){try{return JSON.parse(localStorage.getItem('konektem_user')||'{}').email||'';}catch(e){return '';}}());
    if(ueml && S.settings.plan === 'premium'){
      pullBizDataFromSupabase(ueml, function(pulled){
        if(pulled){
          renderProds(); renderInv(); renderRecu(); renderCatBar();
          notif('🔄 Données synchronisées depuis le cloud','ok');
        }
      });
    }
  }, 3000);

  setTimeout(syncUserToSupabase, 2000);
  setTimeout(syncProductsToCloud, 3000);
  setTimeout(pullFromCloud, 4000);
  // Poll Supabase chak 60 segonn
  setInterval(function(){
    if(document.visibilityState === 'visible'){
      syncUserToSupabase();
      pullFromCloud();
    }
  }, 60000);
  // Pull chak 30 segonn pou wè done kasye rapid
  setInterval(function(){
    if(document.visibilityState === 'visible') pullFromCloud();
  }, 30000);
  // Sync tou lè itilizatè retounen sou app la
  document.addEventListener('visibilitychange', function(){
    if(document.visibilityState === 'visible'){
      syncUserToSupabase();
    }
  });
  updatePriceDisplay();
  setTimeout(checkLowStockNotif, 3000);
  setTimeout(fetchExchangeRate, 1000);
  renderCatBar(); renderProds(); showView('vente');
  // Afficher l'écran de sélection caissier si activé
  // Toujou montre ekran login si gen enpwaye — obligatwa
  if((S.employees||[]).length > 0){
    showLoginScreen();
  } else {
    // Pa gen enpwaye — propriétaire dirèk ak tout aksè
    applyRoleRestrictions('proprio');
  }
  var s=S.settings.sector;
  if(s==='restaurant') document.getElementById('f-resto').style.display='block';
  if(s==='pharmacie'){ document.getElementById('f-pharma').style.display='block'; document.getElementById('pharma-tab').style.display='block'; }
}
function updateTopbar(){
  var s=S.settings;
  document.getElementById('sector-pill').textContent=SECTOR_LABELS[s.sector]||'';
  document.getElementById('cashier-pill').textContent='👤 '+(s.cashier||'Caissier');
  document.getElementById('sb-biz').textContent=s.bizname||'';
  document.getElementById('sb-cash').textContent='👤 '+(s.cashier||'Caissier');
  document.getElementById('sb-sector').textContent=SECTOR_LABELS[s.sector]||'';
}

// ── NAVIGATION ──
var boOpen=false;

function closeSb(){
  document.getElementById('sidebar').classList.remove('open');
  document.getElementById('sbOv').classList.remove('show');
  document.body.style.overflow='';
}
function toggleSb(){
  var isOpen=document.getElementById('sidebar').classList.contains('open');
  if(isOpen){ closeSb(); }
  else {
    document.getElementById('sidebar').classList.add('open');
    document.getElementById('sbOv').classList.add('show');
    document.body.style.overflow='hidden';
  }
}
function nav(view,el){
  closeSb();
  if(el){document.querySelectorAll('.sb-item').forEach(function(x){x.classList.remove('on');});el.classList.add('on');}
  showView(view);
}
function showView(v){
  boOpen=false;
  document.getElementById('bo-btn').classList.remove('on');
  var views=['articles','recu','tickets','clients','integration','employes','fournisseurs','monplan','backup','settings','fonctionnalites','backoffice'];
  views.forEach(function(x){var el=document.getElementById('view-'+x);if(el){el.style.display='none';el.classList.remove('on');}});
  document.getElementById('view-pos').style.display=(v==='vente')?'flex':'none';
  if(v!=='vente'){var el=document.getElementById('view-'+v);if(el){el.style.display='flex';el.classList.add('on');}}
  if(v==='articles'){renderInv();updInvCatF();}
  if(v==='recu') renderRecu();
  if(v==='tickets') renderTickets();
  if(v==='clients') renderClients();
  if(v==='integration') renderInteg();
  if(v==='employes') renderEmpGrid();
  if(v==='fournisseurs') renderFournisseurs();
  if(v==='monplan') renderMonPlan();
  if(v==='backup') renderBackupInfo();
  if(v==='settings') renderSet();
  if(v==='backoffice'){renderBO();boOpen=true;document.getElementById('bo-btn').classList.add('on');}
}
function toggleBO(){if(boOpen)showView('vente');else showView('backoffice');}

// ── CATEGORIES ──
function renderCatBar(){
  var bar=document.getElementById('catBar');
  bar.innerHTML='<button class="chip '+(S.activeCat===''?'on':'')+'" onclick="setCat(this,\'\')">Tous</button>';
  S.categories.forEach(function(c){bar.innerHTML+='<button class="chip '+(S.activeCat===c?'on':'')+'" onclick="setCat(this,\''+c+'\')">'+c+'</button>';});
}
function setCat(btn,cat){
  S.activeCat=cat;
  document.querySelectorAll('.chip').forEach(function(x){x.classList.remove('on');});
  btn.classList.add('on'); renderProds();
}
function updInvCatF(){
  var sel=document.getElementById('invCatF');if(!sel)return;
  var cur=sel.value; sel.innerHTML='<option value="">Toutes catégories</option>';
  S.categories.forEach(function(c){sel.innerHTML+='<option value="'+c+'">'+c+'</option>';});
  sel.value=cur;
}

// ── PRODUCTS ──
function getEmoji(cat,sec){
  var m={marche:{'Épicerie':'🌾','Boissons':'🥤','Fruits & Légumes':'🥦','Viandes':'🥩','Condiments':'🧂','Hygiène':'🧴'},
    pharmacie:{'Médicaments':'💊','Vitamines':'💉','Pansements':'🩹','Hygiène':'🧴','Bébé':'👶'},
    electronique:{'Smartphones':'📱','Accessoires':'🔌','Ordinateurs':'💻','Audio/Vidéo':'🎧','Services':'⚡','Câbles':'🔌'},
    restaurant:{'Plats principaux':'🍽️','Boissons':'🥤','Desserts':'🍰','Sandwiches':'🥪','Entrées':'🥗'}};
  return (m[sec]||{})[cat]||'📦';
}
function renderProds(){
  var q=(document.getElementById('posQ')?document.getElementById('posQ').value:'').toLowerCase();
  var grid=document.getElementById('prodGrid');
  var list=S.products.filter(function(p){
    var mq=!q||p.name.toLowerCase().indexOf(q)>-1||(p.barcode||'').toLowerCase().indexOf(q)>-1;
    var mc=!S.activeCat||p.category===S.activeCat;
    return mq&&mc;
  });
  if(!list.length){grid.innerHTML='<div style="color:var(--text3);font-size:13px;grid-column:1/-1;padding:20px">Aucun article trouvé.</div>';return;}
  grid.innerHTML=list.map(function(p){
    var out=p.stock===0, low=p.stock>0&&p.stock<=(p.lowStock||5);
    var imgH=p.img?'<img src="'+p.img+'" alt="'+p.name+'">'
      :'<div class="ni">'+getEmoji(p.category,S.settings.sector)+'</div>';
    var badge=out?'<div class="pc-badge out">Épuisé</div>':low?'<div class="pc-badge low">Bas</div>':'';
    var ph=S.settings.sector==='pharmacie'&&p.dci?'<div class="pc-pharma">'+p.dci+(p.dosage?' · '+p.dosage:'')+'</div>':'';
    return '<div class="pcard '+(out?'out':'')+'" onclick="addCart(\''+p.id+'\')">'
      +'<div class="pc-img">'+imgH+badge+'</div>'
      +'<div class="pc-body"><div class="pc-name">'+p.name+'</div>'
      +(p.barcode?'<div class="pc-ref">'+p.barcode+'</div>':'')+ph
      +'<div class="pc-price">'+fmt(p.price)+'</div></div></div>';
  }).join('');
}
function filterProds(){renderProds();}

// ── CART ──
function addCart(id){
  var p=S.products.find(function(x){return x.id===id;}); if(!p||p.stock===0)return;
  var ex=S.cart.find(function(x){return x.id===id;});
  if(ex){if(ex.qty>=p.stock){notif('Stock insuffisant !','err');return;}ex.qty++;}
  else S.cart.push(Object.assign({},p,{qty:1}));
  renderCart(); renderProds();
}
function removeCart(id){S.cart=S.cart.filter(function(x){return x.id!==id;});renderCart();renderProds();}
function chgQty(id,d){
  var it=S.cart.find(function(x){return x.id===id;});
  var pr=S.products.find(function(x){return x.id===id;});
  if(!it)return; it.qty+=d;
  if(it.qty<=0) S.cart=S.cart.filter(function(x){return x.id!==id;});
  else if(pr&&it.qty>pr.stock){it.qty--;notif('Stock insuffisant !','err');}
  renderCart(); renderProds();
}
function renderCart(){
  var oi=document.getElementById('ordItems');
  var tot=S.cart.reduce(function(a,x){return a+x.qty;},0);
  document.getElementById('ordBadge').textContent=tot;
  if(!S.cart.length){
    oi.innerHTML='<div class="order-empty"><div style="font-size:38px;opacity:.3">🛒</div><div style="font-size:13px">Panier vide</div></div>';
    calcTot();return;
  }
  oi.innerHTML=S.cart.map(function(it){
    var th=it.img?'<img src="'+it.img+'" style="width:100%;height:100%;object-fit:cover">'
      :getEmoji(it.category,S.settings.sector);
    return '<div class="oitem">'
      +'<div class="oi-img">'+th+'</div>'
      +'<div class="oi-info"><div class="oi-name">'+it.name+'</div><div class="oi-price">'+fmt(it.price)+'</div></div>'
      +'<div class="oi-ctrl"><button class="qb" onclick="chgQty(\''+it.id+'\',-1)">−</button>'
      +'<span class="qv">'+it.qty+'</span>'
      +'<button class="qb" onclick="chgQty(\''+it.id+'\',1)">+</button></div>'
      +'<div class="oi-sub">'+fmt(it.price*it.qty)+'</div>'
      +'<span class="oi-del" onclick="removeCart(\''+it.id+'\')">✕</span></div>';
  }).join('');
  calcTot();
}
function calcTot(){
  var sub=S.cart.reduce(function(a,x){return a+x.price*x.qty;},0);
  var dp=parseFloat(document.getElementById('discInp').value)||0;
  var disc=sub*(dp/100), tax=(sub-disc)*(parseFloat(S.settings.tax)||0)/100, tot=sub-disc+tax;
  document.getElementById('st').textContent=fmt(sub);
  document.getElementById('dt').textContent=disc?'-'+fmt(disc):fmt(0);
  document.getElementById('tt').textContent=fmt(tax);
  document.getElementById('tot').textContent=fmt(tot);
  // Reset rendu lè total chanje
  var box=document.getElementById('rendu-box');
  if(box&&box.classList.contains('show')){
    document.getElementById('renduInp').value='';
    document.getElementById('renduVal').textContent='—';
    document.getElementById('renduVal').className='rendu-val';
  }
}

// ── RENDU MONNAIE ──
function getTotalActuel(){
  var sub=S.cart.reduce(function(a,x){return a+x.price*x.qty;},0);
  var dp=parseFloat(document.getElementById('discInp').value)||0;
  var disc=sub*(dp/100), tax=(sub-disc)*(parseFloat(S.settings.tax)||0)/100;
  return Math.round(sub-disc+tax);
}

function showRenduBox(){
  var box=document.getElementById('rendu-box');
  if(!box) return;
  if(S.cart.length===0){ box.classList.remove('show'); return; }
  box.classList.add('show');
  setTimeout(function(){
    var inp=document.getElementById('renduInp');
    if(inp){ inp.value=''; inp.focus(); }
  },100);
}

function calcRendu(){
  var tot=getTotalActuel();
  var recu=parseFloat(document.getElementById('renduInp').value)||0;
  var valEl=document.getElementById('renduVal');
  if(!recu){ valEl.textContent='—'; valEl.className='rendu-val'; return; }
  var rendu=Math.round(recu-tot);
  var cur=S.settings.currency||'HTG';
  if(rendu<0){
    valEl.textContent=fmt(Math.abs(rendu))+' manke';
    valEl.className='rendu-val err';
  } else if(rendu===0){
    valEl.textContent='Exact ✓';
    valEl.className='rendu-val ok';
  } else {
    valEl.textContent=fmt(rendu);
    valEl.className='rendu-val ok';
  }
}

function setExact(){
  var tot=getTotalActuel();
  document.getElementById('renduInp').value=tot;
  calcRendu();
}

// Version mobile cart sheet
function calcRenduCs(){
  var tot=getTotalActuel();
  var recu=parseFloat(document.getElementById('renduInpCs').value)||0;
  var valEl=document.getElementById('renduValCs');
  if(!recu){ valEl.textContent='—'; valEl.className='rendu-val'; return; }
  var rendu=Math.round(recu-tot);
  if(rendu<0){
    valEl.textContent=fmt(Math.abs(rendu))+' manke';
    valEl.className='rendu-val err';
  } else if(rendu===0){
    valEl.textContent='Exact ✓';
    valEl.className='rendu-val ok';
  } else {
    valEl.textContent=fmt(rendu);
    valEl.className='rendu-val ok';
  }
}

function setExactCs(){
  var tot=getTotalActuel();
  document.getElementById('renduInpCs').value=tot;
  calcRenduCs();
}

// Checkout espèces — vérifie montant reçu
function checkoutCredit(){
  if(!S.cart.length){ notif('Le panier est vide !','err'); return; }
  if(!checkSaleLimit()) return;

  // Modal pou mande non kliyan
  var old = document.getElementById('credit-client-mov');
  if(old) old.remove();

  var mov = document.createElement('div');
  mov.id  = 'credit-client-mov';
  mov.className = 'mov show';

  var inner = document.createElement('div');
  inner.className = 'modal';
  inner.style.maxWidth = '420px';

  var sub = S.cart.reduce(function(a,x){return a+x.price*x.qty;},0);
  var dp  = parseFloat(document.getElementById('discInp').value)||0;
  var disc= sub*(dp/100);
  var tax = (sub-disc)*(parseFloat(S.settings.tax)||0)/100;
  var tot = sub-disc+tax;

  inner.innerHTML = '<h3>📝 Vente à Crédit</h3>'
    + '<div style="background:var(--accent-l);border:1px solid var(--accent-m);border-radius:8px;padding:10px 12px;margin-bottom:14px;display:flex;justify-content:space-between;align-items:center;">'
    + '<span style="font-size:13px;color:var(--text2);">Montant dû</span>'
    + '<span style="font-size:18px;font-weight:800;color:var(--accent-d);">'+fmt(tot)+'</span></div>'
    + '<div class="fg"><label class="flbl">Nom du client *</label>'
    + '<input class="finp" id="credit-client-nom" placeholder="Ex: Jean Pierre" list="clients-list" autocomplete="off">'
    + '<datalist id="clients-list">'
    + S.clients.map(function(cl){ return '<option value="'+cl.name+'">'+(cl.tel?cl.name+' — '+cl.tel:cl.name)+'</option>'; }).join('')
    + '</datalist></div>'
    + '<div class="fg"><label class="flbl">Téléphone</label>'
    + '<input class="finp" id="credit-client-tel" placeholder="509..."></div>'
    + '<div class="fg"><label class="flbl">Note (optionnel)</label>'
    + '<input class="finp" id="credit-client-note" placeholder="Ex: doit payer vendredi..."></div>'
    + '<div class="mfooter" id="credit-footer"></div>';

  mov.appendChild(inner);
  document.body.appendChild(mov);

  // Pré-remplir si client existe dans la liste
  document.getElementById('credit-client-nom').addEventListener('input', function(){
    var nom = this.value.trim();
    var cl  = S.clients.find(function(c){ return c.name.toLowerCase()===nom.toLowerCase(); });
    if(cl && cl.tel) document.getElementById('credit-client-tel').value = cl.tel;
  });

  var btnA = document.createElement('button');
  btnA.className='btn-cancel'; btnA.textContent='Annuler';
  btnA.onclick=function(){mov.remove();};

  var btnC = document.createElement('button');
  btnC.className='btn-g'; btnC.textContent='✅ Confirmer crédit';
  btnC.onclick=function(){
    var nom = document.getElementById('credit-client-nom').value.trim();
    var tel = document.getElementById('credit-client-tel').value.trim();
    var note= document.getElementById('credit-client-note').value.trim();
    if(!nom){ notif('Entrez le nom du client','err'); return; }

    // Sove kliyan si nouvo
    var clExist = S.clients.find(function(cl){ return cl.name.toLowerCase()===nom.toLowerCase(); });
    var clientId = clExist ? clExist.id : null;
    if(!clExist && nom){
      var newCl = {id:uid(), name:nom, tel:tel, addr:'', note:note, createdAt:new Date().toISOString()};
      if(!S.clients) S.clients=[];
      S.clients.push(newCl);
      clientId = newCl.id;
    }

    mov.remove();
    // Pase nan checkout ak info kliyan
    checkout('Crédit', null, 0, {nom:nom, tel:tel, note:note, clientId:clientId});
  };

  document.getElementById('credit-footer').appendChild(btnA);
  document.getElementById('credit-footer').appendChild(btnC);
  mov.addEventListener('click',function(e){if(e.target===mov)mov.remove();});

  setTimeout(function(){ document.getElementById('credit-client-nom').focus(); },200);
}

function checkoutCash(){
  if(!S.cart.length){ notif('Le panier est vide !','err'); return; }
  var tot=getTotalActuel();
  var recu=parseFloat(document.getElementById('renduInp').value)||0;
  var rendu=Math.round(recu-tot);

  // Si montant saisi et insuffisant — bloquer
  if(recu>0 && rendu<0){
    notif('Montant insuffisant ! Manque '+fmt(Math.abs(rendu)),'err');
    document.getElementById('renduInp').focus();
    return;
  }

  // Sauvegarder rendu dans la vente
  var renduFinal = recu>0 ? rendu : 0;
  checkout('Espèces', recu>0?recu:null, renduFinal);

  // Reset rendu box
  document.getElementById('renduInp').value='';
  document.getElementById('renduVal').textContent='—';
  document.getElementById('renduVal').className='rendu-val';
}

function checkoutCashMobile(){
  if(!S.cart.length){ notif('Le panier est vide !','err'); return; }
  var tot=getTotalActuel();
  var recu=parseFloat(document.getElementById('renduInpCs').value)||0;
  var rendu=Math.round(recu-tot);

  if(recu>0 && rendu<0){
    notif('Montant insuffisant ! Manque '+fmt(Math.abs(rendu)),'err');
    return;
  }

  checkout('Espèces', recu>0?recu:null, Math.round(recu>0?rendu:0));
  document.getElementById('renduInpCs').value='';
  document.getElementById('renduValCs').textContent='—';
  closeCartSheet();
}
function clearOrd(){
  if(!S.cart.length)return;
  if(!confirm('Vider la commande ?'))return;
  S.cart=[];document.getElementById('discInp').value='';
  renderCart();renderProds();
}

// ── CHECKOUT ──
function checkout(method, montantRecu, rendu, clientInfo){
  if(!S.cart.length){notif('Le panier est vide !','err');return;}
  if(!checkSaleLimit()) return;
  var sub=S.cart.reduce(function(a,x){return a+x.price*x.qty;},0);
  var dp=parseFloat(document.getElementById('discInp').value)||0;
  var disc=sub*(dp/100),tax=(sub-disc)*(parseFloat(S.settings.tax)||0)/100,total=sub-disc+tax;
  S.cart.forEach(function(it){var p=S.products.find(function(x){return x.id===it.id;});if(p&&p.stock!==999)p.stock=Math.max(0,p.stock-it.qty);});
  var sale={
    id:uid(), num:S.sales.length+1, date:new Date().toISOString(),
    items:S.cart.slice(), subtotal:sub, discount:disc, tax:tax, total:total,
    method:method, cashier:S.settings.cashier||'Caissier',
    montantRecu: montantRecu||null,
    rendu: rendu||0,
    clientNom:  clientInfo ? clientInfo.nom  : null,
    clientTel:  clientInfo ? clientInfo.tel  : null,
    clientNote: clientInfo ? clientInfo.note : null,
    clientId:   clientInfo ? clientInfo.clientId : null
  };
  S.sales.unshift(sale); save();
  // Sync vant nan cloud pou lòt aparèy wè li
  setTimeout(function(){ syncSaleToCloud(sale); }, 500);
  // Verifye stock apre chak vant
  setTimeout(checkStockAfterSale, 800);
  // Sync vant nan Supabase si Premium (pou multi-aparèy)
  if(S.settings.plan === 'premium'){
    var userEmail2 = S.userEmail || (function(){
      try{return JSON.parse(localStorage.getItem('konektem_user')||'{}').email||'';}catch(e){return '';}
    })();
    if(userEmail2) setTimeout(function(){ pushBizDataToSupabase(userEmail2); }, 1500);
  }
  if(S.settings.showReceipt) showRecu(sale);
  S.cart=[]; document.getElementById('discInp').value='';
  // Reset rendu box
  var rb=document.getElementById('rendu-box');
  if(rb){ rb.classList.remove('show'); }
  renderCart(); renderProds();
  // Notif avec rendu si espèces
  if(method==='Espèces' && rendu>0){
    notif('✅ Vente #'+sale.num+' — Rendu : '+fmt(rendu),'ok');
  } else {
    notif('✅ Vente #'+sale.num+' – '+fmt(total),'ok');
  }
}

// ── REÇU ──
function showRecu(sale){
  var d=new Date(sale.date);
  var ds=d.toLocaleDateString('fr-FR')+' '+d.toLocaleTimeString('fr-FR',{hour:'2-digit',minute:'2-digit'});
  var h='<div class="receipt"><div class="r-logo">'+(S.settings.bizname||'Konektem')+'</div>'
    +'<div class="r-sub">'+ds+' · Vente #'+sale.num+'</div><div class="r-sub">Caissier: '+sale.cashier+'</div>'
    +(sale.clientNom?'<div class="r-sub" style="font-weight:700">Client: '+sale.clientNom+(sale.clientTel?' · '+sale.clientTel:'')+'</div>':'')
    +'<div class="r-div"></div>';
  sale.items.forEach(function(i){h+='<div class="r-row"><span>'+i.name+' ×'+i.qty+'</span><span>'+fmt(i.price*i.qty)+'</span></div>';});
  h+='<div class="r-div"></div><div class="r-row"><span>Sous-total</span><span>'+fmt(sale.subtotal)+'</span></div>'
    +(sale.discount?'<div class="r-row"><span>Remise</span><span>-'+fmt(sale.discount)+'</span></div>':'')
    +(sale.tax?'<div class="r-row"><span>Taxe</span><span>'+fmt(sale.tax)+'</span></div>':'')
    +'<div class="r-div"></div><div class="r-row r-tot"><span>TOTAL</span><span>'+fmt(sale.total)+'</span></div>'
    +'<div class="r-row"><span>Paiement</span><span>'+sale.method+'</span></div>'
    +(sale.clientNom&&sale.method==='Crédit'?'<div class="r-row" style="border-top:1px dashed #ddd;margin-top:4px;padding-top:4px;"><span style="font-weight:700">Doit payer</span><span style="font-weight:700;color:#ef4444;">'+fmt(sale.total)+'</span></div>'+( sale.clientNote?'<div class="r-row"><span>Note</span><span>'+sale.clientNote+'</span></div>':''):'')
    +(sale.montantRecu?'<div class="r-row"><span>Reçu</span><span>'+fmt(sale.montantRecu)+'</span></div>':'')
    +(sale.rendu>0?'<div class="r-row r-tot" style="color:#16a34a"><span>Rendu</span><span>'+fmt(sale.rendu)+'</span></div>':'')
    +'<div class="r-div"></div><div class="r-foot">'+(S.settings.receiptmsg||'Merci pour votre confiance !')+'</div></div>';
  document.getElementById('recContent').innerHTML=h;
  document.getElementById('recMov').classList.add('show');
  // Store pour impression 80mm
  window._currentReceipt = sale;
}
function print80mm(){ if(window._currentReceipt) printReceipt80mm(window._currentReceipt); else notif('Aucun reçu disponible','err'); }

// ── INVENTORY ──
function renderInv(){
  var q=(document.getElementById('invQ')?document.getElementById('invQ').value:'').toLowerCase();
  var cf=(document.getElementById('invCatF')?document.getElementById('invCatF').value:'');
  var body=document.getElementById('invBody');
  var list=S.products.filter(function(p){
    return (!q||(p.name.toLowerCase().indexOf(q)>-1)||(p.category.toLowerCase().indexOf(q)>-1))&&(!cf||p.category===cf);
  });
  if(!list.length){body.innerHTML='<tr><td colspan="8" style="text-align:center;color:var(--text3);padding:20px">Aucun article</td></tr>';return;}
  body.innerHTML=list.map(function(p){
    var st=p.stock===0?'<span class="bdg bdg-out">Épuisé</span>':(p.stock<=(p.lowStock||5)?'<span class="bdg bdg-low">Bas</span>':'<span class="bdg bdg-ok">OK</span>');
    var src=p.source==='api'?'<span class="bdg bdg-api">API</span>':(p.source==='csv'?'<span class="bdg bdg-csv">CSV</span>':'<span class="bdg bdg-man">Manuel</span>');
    var th=p.img?'<img src="'+p.img+'" style="width:28px;height:28px;border-radius:4px;object-fit:cover">'
      :'<span style="font-size:18px">'+getEmoji(p.category,S.settings.sector)+'</span>';
    return '<tr><td><div style="display:flex;align-items:center;gap:7px">'+th
      +'<div><strong>'+p.name+'</strong>'+(p.barcode?'<br><small style="color:var(--text3)">'+p.barcode+'</small>':'')+'</div></div></td>'
      +'<td>'+p.category+'</td><td>'+fmt(p.price)+'</td><td>'+(p.cost?fmt(p.cost):'-')+'</td>'
      +'<td><strong>'+p.stock+'</strong></td><td>'+src+'</td><td>'+st+'</td>'
      +'<td><button class="abt" onclick="openProdMod(\''+p.id+'\')">✏️</button>'
      +'<button class="abt del" onclick="delProd(\''+p.id+'\')">🗑️</button></td></tr>';
  }).join('');
}
function openProdMod(id){
  if(!id&&!checkArticleLimit()) return;
  S.editProd=id||null; S.curImg='';
  var sel=document.getElementById('fcat');
  sel.innerHTML=S.categories.map(function(c){return '<option>'+c+'</option>';}).join('');
  if(id){
    var p=S.products.find(function(x){return x.id===id;});
    document.getElementById('prodMTitle').textContent='Modifier Article';
    document.getElementById('fn').value=p.name;
    document.getElementById('fp').value=p.price;
    document.getElementById('fc').value=p.cost||'';
    document.getElementById('fst').value=p.stock;
    document.getElementById('fls').value=p.lowStock||5;
    document.getElementById('fb').value=p.barcode||'';
    document.getElementById('fimgU').value=p.img&&!p.img.startsWith('data:')?p.img:'';
    sel.value=p.category;
    if(p.img)showImgPrev(p.img);else resetImgPrev();
    if(S.settings.sector==='pharmacie'){
      document.getElementById('f-dci').value=p.dci||'';
      document.getElementById('f-dos').value=p.dosage||'';
      document.getElementById('f-for').value=p.forme||'';
      document.getElementById('f-exp').value=p.expiry||'';
      document.getElementById('f-ord').value=p.ordo?'1':'0';
      document.getElementById('f-lab').value=p.labo||'';
    }
  } else {
    document.getElementById('prodMTitle').textContent='Nouvel Article';
    ['fn','fp','fc','fst','fls','fb','fimgU'].forEach(function(x){document.getElementById(x).value='';});
    resetImgPrev();
  }
  document.getElementById('prodMov').classList.add('show');
}
function saveProd(){
  var name=document.getElementById('fn').value.trim();
  var price=parseFloat(document.getElementById('fp').value);
  if(!name||isNaN(price)){notif('Nom et prix obligatoires !','err');return;}
  var imgVal=S.curImg||document.getElementById('fimgU').value.trim();
  var data={name:name,price:price,cost:parseFloat(document.getElementById('fc').value)||0,
    stock:parseInt(document.getElementById('fst').value)||0,lowStock:parseInt(document.getElementById('fls').value)||5,
    category:document.getElementById('fcat').value,barcode:document.getElementById('fb').value.trim(),
    img:imgVal,icon:'',source:'manual',connType:''};
  if(S.settings.sector==='pharmacie'){
    data.dci=document.getElementById('f-dci').value.trim();
    data.dosage=document.getElementById('f-dos').value.trim();
    data.forme=document.getElementById('f-for').value;
    data.expiry=document.getElementById('f-exp').value;
    data.ordo=document.getElementById('f-ord').value==='1';
    data.labo=document.getElementById('f-lab').value.trim();
  }
  if(S.editProd){var i=S.products.findIndex(function(x){return x.id===S.editProd;});if(i>=0){var oldProd=S.products[i];if(oldProd.price!==data.price)addPriceHistory(S.editProd,oldProd.price,data.price);S.products[i]=Object.assign({},oldProd,data);}}
  else S.products.push(Object.assign({id:uid()},data));
  save();renderInv();renderProds();renderCatBar();
  closeMov('prodMov');notif('✅ Article enregistré !','ok');
  setTimeout(syncProductsToCloud, 1000);
  // Sync atik si Premium
  if(S.settings.plan === 'premium'){
    var ueml = S.userEmail||(function(){try{return JSON.parse(localStorage.getItem('konektem_user')||'{}').email||'';}catch(e){return '';}}());
    if(ueml) setTimeout(function(){ pushBizDataToSupabase(ueml); }, 2000);
  }
}
function delProd(id){
  if(!confirm('Supprimer cet article ?'))return;
  S.products=S.products.filter(function(x){return x.id!==id;});
  save();renderInv();renderProds();notif('🗑️ Article supprimé');
}
// ── IMAGEKIT CONFIG ──

function handleImg(inp){
  var f=inp.files[0]; if(!f) return;
  if(f.size>5*1024*1024){ notif('Photo trop grande ! Max 5MB','err'); return; }
  // Aperçu local immédiat pendant l'upload
  var reader=new FileReader();
  reader.onload=function(e){
    showImgPrev(e.target.result);
    S.curImg=e.target.result; // fallback base64 pendant upload
  };
  reader.readAsDataURL(f);
  // Upload vers ImageKit
  uploadToImageKit(f);
}

function uploadToImageKit(file){
  var zone = document.getElementById('imgZ');
  if(zone) zone.style.opacity = '0.6';
  notif('⬆️ Upload en cours...', 'inf');

  var fileName = 'konektem_' + Date.now() + '_' + file.name.replace(/[^a-zA-Z0-9.]/g,'_');

  // Convertir en base64 → envoyer à Netlify Function
  var reader = new FileReader();
  reader.onload = function(e) {
    fetch('/.netlify/functions/imagekit-upload', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ file: e.target.result, fileName: fileName })
    })
    .then(function(r) { return r.json(); })
    .then(function(data) {
      if(data.success && data.url) {
        S.curImg = data.url;
        showImgPrev(data.url);
        document.getElementById('fimgU').value = data.url;
        notif('✅ Photo uploadée sur ImageKit !', 'ok');
      } else {
        notif('⚠️ Upload: ' + (data.error || 'erreur inconnue'), 'err');
        // curImg garde le base64 comme fallback
      }
      if(zone) zone.style.opacity = '1';
    })
    .catch(function(err) {
      notif('❌ Erreur upload: ' + err.message, 'err');
      if(zone) zone.style.opacity = '1';
    });
  };
  reader.readAsDataURL(file);
}
function prevUrl(){var u=document.getElementById('fimgU').value.trim();if(u){showImgPrev(u);S.curImg='';}else resetImgPrev();}
function showImgPrev(src){document.getElementById('imgPrev').src=src;document.getElementById('imgPrev').style.display='block';document.getElementById('imgPh').style.display='none';document.getElementById('imgZ').classList.add('filled');}
function resetImgPrev(){document.getElementById('imgPrev').style.display='none';document.getElementById('imgPh').style.display='';document.getElementById('imgZ').classList.remove('filled');}

// ── INTEGRATION ──
function parseApiProds(data,cType){
  var list=Array.isArray(data)?data:(data.products||data.items||data.data||[]);
  return list.map(function(item){
    return {id:uid(),name:item.name||item.title||item.nom||'Article',
      price:parseFloat(item.price||item.pri||item.regular_price||0),
      cost:parseFloat(item.cost||item.koute||0),
      stock:parseInt(item.stock||item.stock_quantity||item.quantite||0),
      lowStock:parseInt(item.low_stock_alert||5),
      category:item.category||(item.categories&&item.categories[0]&&item.categories[0].name)||'Importé',
      img:item.image||item.img||(item.images&&item.images[0]&&item.images[0].src)||'',
      barcode:item.barcode||item.sku||'',
      dci:item.dci||'',dosage:item.dosage||'',forme:item.forme||'',
      ordo:item.ordo||false,labo:item.labo||'',expiry:item.expiry||'',
      icon:'',source:'api',connType:cType};
  }).filter(function(p){return p.name&&p.price>=0;});
}
function fetchAndImport(url,name,type,apiKey){
  notif('🔄 Connexion en cours...','inf');

  // Itilize Netlify Function kòm proxy — bypasse CORS
  fetch('/.netlify/functions/fetch-products',{
    method:'POST',
    headers:{'Content-Type':'application/json'},
    body: JSON.stringify({ url:url, key:apiKey||'' })
  })
  .then(function(r){ return r.json(); })
  .then(function(resp){
    if(!resp.success) throw new Error(resp.error||'Erreur serveur');
    var data = resp.data;
    var prods = parseApiProds(data, type);
    if(!prods.length) throw new Error('Aucun produit trouvé dans la réponse');

    S.products = S.products.filter(function(p){ return !(p.source==='api' && p.connType===type); });
    S.products = S.products.concat(prods);
    prods.forEach(function(p){
      if(p.category && S.categories.indexOf(p.category)===-1) S.categories.push(p.category);
    });
    S.connections = S.connections.filter(function(c){ return c.type!==type; });
    S.connections.push({
      type:type, url:url, name:name,
      apiKey: apiKey||'',
      lastSync: new Date().toISOString(),
      count: prods.length
    });
    save(); renderInteg(); renderProds(); renderCatBar();
    notif('✅ '+prods.length+' articles importés depuis '+name,'ok');
  })
  .catch(function(err){
    notif('❌ Erreur: '+err.message,'err');
    console.error('[fetchAndImport]', err);
  });
}

function connectSrc(type){
  var url = document.getElementById(type+'-url').value.trim();
  var key = document.getElementById(type+'-key').value.trim();
  if(!url){ notif('Entrez l URL API','err'); return; }
  var btn = document.getElementById(type+'-mbtn');
  if(btn){ btn.disabled=true; btn.textContent='⏳ Connexion...'; }
  fetchAndImport(url, 'Boutique Piyay', type, key);
  setTimeout(function(){
    var b=document.getElementById(type+'-mbtn');
    if(b){ b.disabled=false; b.textContent='🔌 Connecter & Importer'; }
  }, 8000);
}

function connectCustom(){
  var url  = document.getElementById('custom-url').value.trim();
  var name = document.getElementById('custom-name').value.trim() || 'Boutique';
  var key  = document.getElementById('custom-key') ? document.getElementById('custom-key').value.trim() : '';
  if(!url){ notif('Entrez l URL API','err'); return; }
  fetchAndImport(url, name, 'custom_'+Date.now(), key);
}
function refreshSrc(type){var conn=S.connections.find(function(x){return x.type===type;});if(conn)fetchAndImport(conn.url,conn.name,type,conn.apiKey||'');}
function disconnectSrc(type){
  S.connections=S.connections.filter(function(c){return c.type!==type;});
  S.products=S.products.filter(function(p){return !(p.source==='api'&&p.connType===type);});
  save();renderInteg();renderProds();renderCatBar();notif('Boutique déconnectée');
}
function renderInteg(){
  var pc=S.connections.find(function(c){return c.type==='piyay';});
  var ps=document.getElementById('igst-piyay');
  var mb=document.getElementById('piyay-mbtn'),rb=document.getElementById('piyay-rbtn'),db=document.getElementById('piyay-dbtn');
  var ic=document.getElementById('igc-piyay'),pv=document.getElementById('piyay-prev');
  if(pc){
    if(ps)ps.innerHTML='<span class="conn-pill"><span class="conn-dot"></span>Connecté</span>';
    if(mb)mb.style.display='none';if(rb)rb.style.display='block';if(db)db.style.display='block';
    if(ic)ic.classList.add('conn');
    if(pv){var d=new Date(pc.lastSync);pv.innerHTML='<div class="conn-pill"><span class="conn-dot"></span>'+pc.count+' articles · Sync: '+d.toLocaleTimeString('fr-FR',{hour:'2-digit',minute:'2-digit'})+'</div>';}
  } else {
    if(ps)ps.innerHTML='';if(mb)mb.style.display='block';if(rb)rb.style.display='none';if(db)db.style.display='none';
    if(ic)ic.classList.remove('conn');if(pv)pv.innerHTML='';
  }
  var sd=document.getElementById('conn-srcs');
  if(S.connections.length){
    sd.innerHTML='<div class="sec-t">✅ Sources connectées</div>'+S.connections.map(function(c){
      var d=new Date(c.lastSync);
      return '<div class="hcard" style="cursor:default">'
        +'<div style="font-size:18px">'+(c.type==='piyay'?'🏪':'🌐')+'</div>'
        +'<div class="hc-info"><div class="hc-items">'+c.name+'</div>'
        +'<div class="hc-date">'+c.url+'</div>'
        +'<div class="hc-meth">'+c.count+' articles · Sync: '+d.toLocaleTimeString('fr-FR',{hour:'2-digit',minute:'2-digit'})+'</div></div>'
        +'<button class="abt del" onclick="disconnectSrc(\''+c.type+'\')">Déconnecter</button></div>';
    }).join('');
  } else sd.innerHTML='';
}
function handleCSV(inp){
  var f=inp.files[0];if(!f)return;
  var r=new FileReader();r.onload=function(e){
    var lines=e.target.result.trim().split('\n');if(lines.length<2){notif('CSV invalide','err');return;}
    var headers=lines[0].split(',').map(function(h){return h.trim().toLowerCase().replace(/"/g,'');});
    var rows=[];
    for(var i=1;i<lines.length;i++){
      var cols=lines[i].split(',').map(function(c){return c.trim().replace(/"/g,'');});
      var obj={};headers.forEach(function(h,j){obj[h]=cols[j]||'';});
      if(obj.nom||obj.name||obj.titre||obj.title)rows.push(obj);
    }
    S.csvBuf=rows;
    var pv='<div class="csv-prev"><div class="csv-r hdr"><span>Nom</span><span>Prix</span><span>Stock</span></div>';
    rows.slice(0,6).forEach(function(r){pv+='<div class="csv-r"><span>'+(r.nom||r.name||'?')+'</span><span>'+(r.prix||r.price||r.pri||0)+' HTG</span><span>'+(r.stock||0)+'</span></div>';});
    if(rows.length>6)pv+='<div style="padding:3px 5px;font-size:11px;color:var(--text3)">...et '+(rows.length-6)+' autres</div>';
    pv+='</div><div style="font-size:12px;color:var(--accent);margin-top:6px;font-weight:700">✅ '+rows.length+' articles trouvés</div>';
    document.getElementById('csvPrev').innerHTML=pv;
    document.getElementById('csv-ibtn').style.display='block';
  };r.readAsText(f);
}
function importCSV(){
  if(!S.csvBuf||!S.csvBuf.length){notif('Aucune donnée CSV','err');return;}
  var prods=S.csvBuf.map(function(r){
    return {id:uid(),name:r.nom||r.name||r.titre||r.title||'Article',
      price:parseFloat(r.prix||r.price||r.pri||0),cost:parseFloat(r.cout||r.cost||r.koute||0),
      stock:parseInt(r.stock||r.quantite||0),lowStock:parseInt(r.alerte||r.alert||5),
      category:r.categorie||r.category||r.kategori||'Importé',
      img:r.photo||r.image||r.img||'',barcode:r.code||r.barcode||r.reference||'',
      icon:'',source:'csv',connType:'csv'};
  }).filter(function(p){return p.name&&p.price>=0;});
  prods.forEach(function(p){if(S.categories.indexOf(p.category)===-1)S.categories.push(p.category);});
  S.products=S.products.concat(prods);S.csvBuf=[];save();
  document.getElementById('csvPrev').innerHTML='';document.getElementById('csv-ibtn').style.display='none';
  renderProds();renderCatBar();notif('✅ '+prods.length+' articles importés via CSV','ok');
}
function dlCSV(){
  var csv='nom,prix,cout,stock,categorie,code\nRiz blanc,150,100,50,Épicerie,SKU001\nHuile 1L,400,280,20,Épicerie,SKU002\n';
  var b=new Blob([csv],{type:'text/csv'});var a=document.createElement('a');a.href=URL.createObjectURL(b);a.download='modele-articles.csv';a.click();
}

// ── HISTORY ──
function renderRecu(){
  var body=document.getElementById('recuBody');
  var tot=S.sales.reduce(function(a,s){return a+s.total;},0);
  document.getElementById('recuStats').textContent=S.sales.length+' ventes · Total: '+fmt(tot);
  if(!S.sales.length){
    body.innerHTML='<div style="color:var(--text3);text-align:center;padding:40px">Aucune vente enregistrée</div>';
    return;
  }
  var mc={'Espèces':'bdg-cash','Carte':'bdg-card','MonCash':'bdg-mc','Crédit':'bdg-cred'};
  body.innerHTML='';
  S.sales.forEach(function(s){
    var d=new Date(s.date);
    var ds=d.toLocaleDateString('fr-FR')+' '+d.toLocaleTimeString('fr-FR',{hour:'2-digit',minute:'2-digit'});
    var card=document.createElement('div');
    card.className='hcard';
    card.innerHTML='<div class="hc-num">#'+s.num+'</div>'
      +'<div class="hc-info">'
        +'<div class="hc-date">📅 '+ds+(s.locked?'<span style="font-size:11px;color:var(--text3);margin-left:4px;">🔒</span>':'')+(s.rembourse?'<span style="font-size:11px;color:#ef4444;margin-left:4px;">🔄 Remboursé</span>':'')+'</div>'
        +'<div class="hc-items">'+s.items.map(function(i){return i.name;}).join(', ')+'</div>'
        +'<div class="hc-meth"><span class="bdg '+(mc[s.method]||'')+'">'+s.method+'</span> · '+s.cashier+'</div>'
      +'</div>'
      +'<div style="display:flex;flex-direction:column;align-items:flex-end;gap:4px;">'
        +'<div class="hc-tot">'+fmt(s.total)+'</div>'
        +'<div id="acts-'+s.id+'"></div>'
      +'</div>';

    // Klike pou wè detay
    (function(sid){ card.onclick=function(){ viewSale(sid); }; })(s.id);
    body.appendChild(card);

    // Boutons via DOM (evite apostròf)
    var acts=document.getElementById('acts-'+s.id);
    if(!s.isRetour && !s.rembourse){
      var btnR=document.createElement('button');
      btnR.className='abt'; btnR.textContent='↩️ Retour';
      btnR.style.cssText='font-size:11px;padding:4px 7px;';
      (function(sid){ btnR.onclick=function(e){ e.stopPropagation(); openRetourModal(sid); }; })(s.id);
      acts.appendChild(btnR);
    }
    if(can('supprime_vente')){
      var btnD=document.createElement('button');
      btnD.className='abt del'; btnD.textContent='🗑️';
      btnD.style.cssText='font-size:11px;padding:4px 7px;';
      (function(sid){ btnD.onclick=function(e){ e.stopPropagation(); deleteSale(sid); }; })(s.id);
      acts.appendChild(btnD);
    }
  });
}
// ══════════════════════════════════════════════════
// FONKSYON FOURNISSEURS
// ══════════════════════════════════════════════════
function openFournisseurModal(id){
  S.editFourn = id || null;
  var fourn = id ? (S.fournisseurs||[]).find(function(f){return f.id===id;}) : null;
  var old2 = document.getElementById('fourn-mov');
  if(old2) old2.remove();
  var mov = document.createElement('div');
  mov.id='fourn-mov'; mov.className='mov show';
  var box = document.createElement('div');
  box.className='modal'; box.style.maxWidth='420px';
  box.innerHTML='<h3>'+(id?'Modifier':'Ajouter')+' Fournisseur</h3>'
    +'<div class="fg"><label class="flbl">Nom *</label><input class="finp" id="fn-nom" placeholder="Ex: Maison Michel"></div>'
    +'<div class="f2"><div class="fg"><label class="flbl">Téléphone</label><input class="finp" id="fn-tel" placeholder="509..."></div>'
    +'<div class="fg"><label class="flbl">Email</label><input class="finp" id="fn-email" placeholder="email@..."></div></div>'
    +'<div class="fg"><label class="flbl">Adresse</label><input class="finp" id="fn-addr" placeholder="Adresse..."></div>'
    +'<div class="mfooter" id="fourn-footer"></div>';
  if(fourn){
    setTimeout(function(){
      var nm=document.getElementById('fn-nom');if(nm)nm.value=fourn.nom||'';
      var tl=document.getElementById('fn-tel');if(tl)tl.value=fourn.tel||'';
      var em=document.getElementById('fn-email');if(em)em.value=fourn.email||'';
      var ad=document.getElementById('fn-addr');if(ad)ad.value=fourn.addr||'';
    },50);
  }
  var btnC=document.createElement('button'); btnC.className='btn-cancel'; btnC.textContent='Annuler';
  btnC.onclick=function(){mov.remove();};
  var btnS=document.createElement('button'); btnS.className='btn-g'; btnS.textContent='Enregistrer';
  btnS.onclick=saveFournisseur;
  var footer=box.querySelector('#fourn-footer');
  footer.appendChild(btnC); footer.appendChild(btnS);
  mov.appendChild(box);
  mov.addEventListener('click',function(e){if(e.target===mov)mov.remove();});
  document.body.appendChild(mov);
  setTimeout(function(){var nm=document.getElementById('fn-nom');if(nm)nm.focus();},150);
}

function saveFournisseur(){
  var nom=(document.getElementById('fn-nom')||{}).value||'';
  nom=nom.trim();
  if(!nom){notif('Nom obligatoire','err');return;}
  if(!S.fournisseurs)S.fournisseurs=[];
  var data={
    nom:nom,
    tel:((document.getElementById('fn-tel')||{}).value||''),
    email:((document.getElementById('fn-email')||{}).value||''),
    addr:((document.getElementById('fn-addr')||{}).value||'')
  };
  if(S.editFourn){
    var i=S.fournisseurs.findIndex(function(f){return f.id===S.editFourn;});
    if(i>=0)S.fournisseurs[i]=Object.assign({},S.fournisseurs[i],data);
    S.editFourn=null;
  } else {
    S.fournisseurs.push(Object.assign({id:uid()},data));
  }
  save();renderFournisseurs();
  var mov=document.getElementById('fourn-mov');if(mov)mov.remove();
  notif('Fournisseur enregistré','ok');
}

function renderFournisseurs(){
  var el=document.getElementById('fourn-body');
  if(!el)return;
  var fourns=S.fournisseurs||[];
  if(!fourns.length){
    el.innerHTML='<tr><td colspan="5" style="text-align:center;color:var(--text3);padding:20px">Aucun fournisseur</td></tr>';
    return;
  }
  el.innerHTML='';
  fourns.forEach(function(f){
    var total=(S.achats||[]).filter(function(a){return a.fournisseurId===f.id;}).reduce(function(s,a){return s+(a.total||0);},0);
    var tr=document.createElement('tr');
    tr.innerHTML='<td><strong>'+f.nom+'</strong></td><td>'+(f.tel||'—')+'</td><td>'+(f.email||'—')+'</td><td>'+fmt(total)+'</td><td></td>';
    var actTd=tr.cells[4];
    var btnA=document.createElement('button'); btnA.className='abt'; btnA.textContent='+ Achat';
    (function(fid){btnA.onclick=function(){openAchatModal(fid);};})(f.id);
    var btnE=document.createElement('button'); btnE.className='abt'; btnE.textContent='✏️'; btnE.style.marginLeft='3px';
    (function(fid){btnE.onclick=function(){openFournisseurModal(fid);};})(f.id);
    var btnD=document.createElement('button'); btnD.className='abt del'; btnD.textContent='🗑️'; btnD.style.marginLeft='3px';
    (function(fid){btnD.onclick=function(){if(confirm('Supprimer ?')){S.fournisseurs=(S.fournisseurs||[]).filter(function(x){return x.id!==fid;});save();renderFournisseurs();}};})(f.id);
    actTd.appendChild(btnA); actTd.appendChild(btnE); actTd.appendChild(btnD);
    el.appendChild(tr);
  });
}



// ══════════════════════════════════════════════════════════
// FONKSYON KONPLÈ — TOUT SA KI TE MANKE
// ══════════════════════════════════════════════════════════

// ── PÈMISYON PAR ROLE ──
var ROLE_PERMS = {
  caissier:{ vente:true,panier:true,moncash:true,articles:false,backoffice:false,employes:false,fournisseurs:false,settings:false,import:false,remboursement:true,clients:false,export:false,supprime_vente:false },
  vendeur:{ vente:true,panier:true,moncash:true,articles:false,backoffice:false,employes:false,fournisseurs:false,settings:false,import:false,remboursement:true,clients:true,export:false,supprime_vente:false },
  gerant:{ vente:true,panier:true,moncash:true,articles:true,backoffice:true,employes:false,fournisseurs:true,settings:false,import:true,remboursement:true,clients:true,export:true,supprime_vente:false },
  proprio:{ vente:true,panier:true,moncash:true,articles:true,backoffice:true,employes:true,fournisseurs:true,settings:true,import:true,remboursement:true,clients:true,export:true,supprime_vente:true }
};
var CURRENT_PERMS = Object.assign({}, ROLE_PERMS.proprio);
var CURRENT_ROLE  = 'proprio';
var SESSION_OPEN_TIME = null;
function can(perm){ return CURRENT_PERMS[perm] === true; }

function getRoleLabel(role){
  return role==='proprio'?'👑 Propriétaire':role==='gerant'?'👔 Gérant':role==='vendeur'?'🛍️ Vendeur':'🧾 Caissier';
}

function applyRoleRestrictions(role){
  CURRENT_ROLE  = role;
  CURRENT_PERMS = Object.assign({}, ROLE_PERMS[role] || ROLE_PERMS.proprio);
  var sbMap = {
    'vente':true,'recu':true,'tickets':true,
    'clients':can('clients'),'articles':can('articles'),
    'backoffice':can('backoffice'),'employes':can('employes'),
    'fournisseurs':can('fournisseurs'),'settings':can('settings'),
    'monplan':can('settings'),'backup':can('settings'),
    'integration':can('articles'),'fonctionnalites':can('settings')
  };
  document.querySelectorAll('.sb-item').forEach(function(el){
    var oc = el.getAttribute('onclick')||'';
    var m  = oc.match(/nav\('([^']+)'/);
    if(!m) return;
    if(sbMap.hasOwnProperty(m[1])) el.style.display = sbMap[m[1]] ? '' : 'none';
  });
  var boBtn = document.getElementById('bo-btn');
  if(boBtn) boBtn.style.display = can('backoffice') ? '' : 'none';
  var rembBtn = document.getElementById('sb-rembours');
  if(rembBtn) rembBtn.style.display = can('remboursement') ? '' : 'none';
  if(role==='caissier') showView('vente');
  var pill = document.querySelector('.cashier-pill');
  if(pill) pill.textContent = (S.settings.cashier||'') + ' · ' + getRoleLabel(role);
}

function logSessionEvent(type, name, role, time){
  if(!S.sessionLogs) S.sessionLogs=[];
  S.sessionLogs.unshift({type:type,name:name,role:role,time:time,date:new Date().toISOString()});
  if(S.sessionLogs.length>100) S.sessionLogs.pop();
  save();
}

function showLoginScreen(){
  var emps = S.employees||[];
  var ls   = document.getElementById('login-screen');
  var list = document.getElementById('cashier-list');
  var bizEl= document.getElementById('login-biz-name');
  if(bizEl) bizEl.textContent = (S.settings.bizname||'Konektem') + " — Qui travaille aujourd'hui ?";
  if(!emps.length) return;
  list.innerHTML = emps.map(function(e){
    var init = e.name.charAt(0).toUpperCase();
    var roleLabel = getRoleLabel(e.role||'caissier');
    var hasPIN = e.pin && e.pin.length===4;
    return '<button class="cashier-btn" data-empname="'+encodeURIComponent(e.name)+'" onclick="loginAs(decodeURIComponent(this.dataset.empname))">'
      +'<div class="cav">'+init+'</div>'
      +'<div class="cn"><span>'+e.name+'</span><span class="cr">'+roleLabel+' '+(hasPIN?'🔐':'⚠️')+'</span></div>'
      +'<span class="arrow">›</span></button>';
  }).join('');
  var skipBtn = document.getElementById('skip-login-btn');
  if(skipBtn) skipBtn.style.display = emps.length>0 ? 'none' : '';
  ls.classList.remove('hidden');
}

function loginAs(name){
  var emp = (S.employees||[]).find(function(e){ return e.name===name; });
  if(!emp){ notif('Enpwaye pa jwenn','err'); return; }
  if(!emp.pin || emp.pin.length!==4){ showSetPinModal(emp); return; }
  showPinModal(emp, function(){
    var role = emp.role || 'caissier';
    S.settings.cashier = emp.name;
    CURRENT_ROLE  = role;
    CURRENT_PERMS = Object.assign({}, ROLE_PERMS[role]||ROLE_PERMS.caissier);
    save(); updateTopbar(); applyRoleRestrictions(role);
    SESSION_OPEN_TIME = new Date();
    var now = SESSION_OPEN_TIME.toLocaleTimeString('fr-FR',{hour:'2-digit',minute:'2-digit'});
    logSessionEvent('open', emp.name, role, now);
    document.getElementById('login-screen').classList.add('hidden');
    notif('👋 Bonjou '+emp.name+' — '+getRoleLabel(role),'ok');
  });
}

function showPinModal(emp, onSuccess){
  var old = document.getElementById('pin-modal'); if(old) old.remove();
  var mov = document.createElement('div');
  mov.id = 'pin-modal';
  mov.style.cssText='position:fixed;inset:0;z-index:2500;background:rgba(0,0,0,.85);display:flex;align-items:center;justify-content:center;padding:20px;';
  var box = document.createElement('div');
  box.style.cssText='background:var(--surface);border:1px solid var(--border2);border-radius:16px;padding:28px;width:100%;max-width:300px;text-align:center;';
  var init = emp.name.charAt(0).toUpperCase();
  box.innerHTML='<div style="width:52px;height:52px;border-radius:50%;background:var(--accent-l);border:2px solid var(--accent);display:flex;align-items:center;justify-content:center;font-size:22px;font-weight:800;color:var(--accent);margin:0 auto 10px;">'+init+'</div>'
    +'<div style="font-size:17px;font-weight:800;margin-bottom:4px;">'+emp.name+'</div>'
    +'<div style="font-size:12px;color:var(--text3);margin-bottom:16px;">'+getRoleLabel(emp.role)+'</div>'
    +'<div id="pin-dots" style="display:flex;justify-content:center;gap:10px;margin-bottom:16px;">'
    +'<div style="width:14px;height:14px;border-radius:50%;border:2px solid var(--border2);background:transparent;" id="pd0"></div>'
    +'<div style="width:14px;height:14px;border-radius:50%;border:2px solid var(--border2);background:transparent;" id="pd1"></div>'
    +'<div style="width:14px;height:14px;border-radius:50%;border:2px solid var(--border2);background:transparent;" id="pd2"></div>'
    +'<div style="width:14px;height:14px;border-radius:50%;border:2px solid var(--border2);background:transparent;" id="pd3"></div>'
    +'</div>'
    +'<div id="pin-pad" style="display:grid;grid-template-columns:repeat(3,1fr);gap:8px;max-width:200px;margin:0 auto 12px;"></div>'
    +'<div id="pin-err" style="font-size:12px;color:var(--red);min-height:18px;"></div>';
  var cancelBtn = document.createElement('button');
  cancelBtn.style.cssText='margin-top:8px;background:none;border:none;color:var(--text3);font-size:12px;cursor:pointer;';
  cancelBtn.textContent='Annuler';
  cancelBtn.onclick=function(){ mov.remove(); };
  box.appendChild(cancelBtn);
  mov.appendChild(box);
  document.body.appendChild(mov);
  var entered='';
  var pad=document.getElementById('pin-pad');
  [1,2,3,4,5,6,7,8,9,'',0,'⌫'].forEach(function(n){
    var btn=document.createElement('button');
    btn.style.cssText='padding:14px;border-radius:10px;border:1.5px solid var(--border2);background:var(--bg);color:var(--text);font-size:18px;font-weight:700;cursor:pointer;';
    btn.textContent=n;
    if(n===''){btn.style.visibility='hidden';pad.appendChild(btn);return;}
    btn.onclick=function(){
      if(n==='⌫') entered=entered.slice(0,-1);
      else if(entered.length<4) entered+=n;
      for(var i=0;i<4;i++){var d=document.getElementById('pd'+i);if(d)d.style.background=i<entered.length?'var(--accent)':'transparent';}
      if(entered.length===4){
        if(entered===String(emp.pin)){mov.remove();onSuccess();}
        else{
          document.getElementById('pin-err').textContent='❌ PIN inkòrèk';
          entered='';
          for(var i=0;i<4;i++){var d=document.getElementById('pd'+i);if(d)d.style.background='transparent';}
        }
      } else { document.getElementById('pin-err').textContent=''; }
    };
    pad.appendChild(btn);
  });
}

function showSetPinModal(emp){
  var mov=document.createElement('div'); mov.className='mov show'; mov.id='setpin-modal';
  var box=document.createElement('div'); box.className='modal'; box.style.maxWidth='340px'; box.style.textAlign='center';
  box.innerHTML='<h3>⚠️ PIN manke — '+emp.name+'</h3>'
    +'<div style="font-size:13px;color:var(--text2);margin:10px 0 16px;line-height:1.6;">Kreye yon PIN 4 chif pou li konekte.</div>'
    +'<input id="setpin-inp" type="password" maxlength="4" inputmode="numeric" placeholder="4 chiffres" style="width:100%;padding:11px;font-size:20px;text-align:center;letter-spacing:8px;border:2px solid var(--accent);border-radius:8px;background:var(--bg);color:var(--text);outline:none;">';
  var footer=document.createElement('div'); footer.className='mfooter';
  var btnC=document.createElement('button'); btnC.className='btn-cancel'; btnC.textContent='Annuler'; btnC.onclick=function(){mov.remove();};
  var btnS=document.createElement('button'); btnS.className='btn-g'; btnS.textContent='💾 Sauvegarder';
  btnS.onclick=function(){
    var pin=document.getElementById('setpin-inp').value.trim();
    if(pin.length!==4||isNaN(pin)){notif('PIN 4 chif obligatwa','err');return;}
    var empObj=(S.employees||[]).find(function(e){return e.name===emp.name;});
    if(empObj){empObj.pin=pin;save();}
    mov.remove();
    showPinModal(Object.assign({},emp,{pin:pin}),function(){
      S.settings.cashier=emp.name; save(); updateTopbar();
      applyRoleRestrictions(emp.role||'caissier');
      SESSION_OPEN_TIME=new Date();
      var now=SESSION_OPEN_TIME.toLocaleTimeString('fr-FR',{hour:'2-digit',minute:'2-digit'});
      logSessionEvent('open',emp.name,emp.role,now);
      document.getElementById('login-screen').classList.add('hidden');
      notif('👋 Bonjou '+emp.name+'!','ok');
    });
  };
  footer.appendChild(btnC); footer.appendChild(btnS);
  box.appendChild(footer); mov.appendChild(box); document.body.appendChild(mov);
  setTimeout(function(){var i=document.getElementById('setpin-inp');if(i)i.focus();},100);
}

function fermerSession(){
  if(!SESSION_OPEN_TIME){notif('Aucune session ouverte','err');return;}
  var now=new Date();
  var dur=Math.round((now-SESSION_OPEN_TIME)/60000);
  var cashier=S.settings.cashier||'Caissier';
  var nowTxt=now.toLocaleTimeString('fr-FR',{hour:'2-digit',minute:'2-digit'});
  var sessionSales=S.sales.filter(function(s){return new Date(s.date)>=SESSION_OPEN_TIME;});
  var totalSes=sessionSales.reduce(function(a,s){return a+s.total;},0);
  logSessionEvent('close',cashier,CURRENT_ROLE,nowTxt);
  SESSION_OPEN_TIME=null;
  notif('🏁 Sesyon '+cashier+' fèmen — '+dur+'min · '+sessionSales.length+' vant · '+fmt(totalSes),'ok');
  applyRoleRestrictions('proprio');
  S.settings.cashier=S.settings.bizname||'Caissier';
  save(); updateTopbar();
  if((S.employees||[]).length>0) showLoginScreen();
}

function skipLogin(){
  if((S.employees||[]).length>0){notif('Seleksyone enpwaye epi antre PIN ou','err');return;}
  applyRoleRestrictions('proprio');
  document.getElementById('login-screen').classList.add('hidden');
}

function showOwnerLogin(){
  var mov=document.getElementById('ownerLoginMov');
  if(!mov)return;
  mov.style.zIndex='1100'; mov.style.display='flex'; mov.classList.add('show');
  setTimeout(function(){var i=document.getElementById('owner-pw-inp');if(i){i.value='';i.focus();}var e=document.getElementById('owner-pw-err');if(e)e.textContent='';},100);
}

function checkOwnerPassword(){
  var inp=document.getElementById('owner-pw-inp');
  var errEl=document.getElementById('owner-pw-err');
  var entered=inp?inp.value.trim():'';
  var ownerPw=S.settings.ownerPassword||'RIVAYO2025';
  if(entered===ownerPw){
    var mov=document.getElementById('ownerLoginMov');
    if(mov){mov.style.display='none';mov.classList.remove('show');}
    var ls=document.getElementById('login-screen');
    if(ls)ls.classList.add('hidden');
    S.settings.cashier=S.settings.bizname||'Propriétaire';
    CURRENT_ROLE='proprio'; CURRENT_PERMS=Object.assign({},ROLE_PERMS.proprio);
    save(); updateTopbar(); applyRoleRestrictions('proprio');
    SESSION_OPEN_TIME=new Date();
    notif('👑 Bonjou Propriétaire — Tout aksè!','ok');
  } else {
    if(errEl) errEl.textContent='❌ Mot de passe incorrect';
    if(inp){inp.value='';inp.focus();}
  }
}

function quitterSession(){
  closeSb();
  var url=window.location.href;
  if(url.indexOf('app')!==-1){var base=url.substring(0,url.lastIndexOf('/')+1);window.location.href=base+'index.html';}
  else window.location.href='/';
}

function changerCaissier(){
  closeSb();
  if((S.employees||[]).length>0) showLoginScreen();
  else{var name=prompt('Entrez le nom du caissier :');if(name&&name.trim()){S.settings.cashier=name.trim();save();updateTopbar();notif('👋 Bonjour '+name.trim()+'!','ok');}}
}

// ── EMPLOYÉS ──
function onEmpRoleChange(){
  var roleEl=document.getElementById('emp-role'); if(!roleEl)return;
  var role=roleEl.value;
  var PERMS={
    caissier:{vente:'✅',articles:'❌',backoffice:'❌',employes:'❌',settings:'❌',remboursement:'✅',clients:'❌',export:'❌'},
    vendeur:{vente:'✅',articles:'❌',backoffice:'❌',employes:'❌',settings:'❌',remboursement:'✅',clients:'✅',export:'❌'},
    gerant:{vente:'✅',articles:'✅',backoffice:'✅',employes:'❌',settings:'❌',remboursement:'✅',clients:'✅',export:'✅'},
    proprio:{vente:'✅',articles:'✅',backoffice:'✅',employes:'✅',settings:'✅',remboursement:'✅',clients:'✅',export:'✅'}
  };
  var labels={vente:'Caisse/Ventes',articles:'Articles',backoffice:'Back Office',employes:'Équipe',settings:'Paramètres',remboursement:'Remboursement',clients:'Clients',export:'Export CSV'};
  var p=PERMS[role]||PERMS.caissier;
  var box=document.getElementById('emp-perms-list'); if(!box)return;
  box.innerHTML=Object.keys(labels).map(function(k){
    var ok=p[k]==='✅';
    return '<div style="display:flex;align-items:center;gap:5px;padding:3px 6px;border-radius:5px;background:'+(ok?'rgba(34,197,94,.08)':'rgba(239,68,68,.06)')+';"><span>'+(ok?'✅':'❌')+'</span><span style="font-size:11px;color:'+(ok?'var(--accent-d)':'var(--text3)')+'">'+labels[k]+'</span></div>';
  }).join('');
}

function renderEmpGrid(){
  var grid=document.getElementById('empGrid'); if(!grid)return;
  var emps=S.employees||[];
  if(!emps.length){grid.innerHTML='<div style="text-align:center;color:var(--text3);padding:30px;background:#fff;border-radius:var(--r);">Aucun membre. Cliquez "+ Ajouter membre".</div>';return;}
  grid.innerHTML='';
  emps.forEach(function(e){
    var isActive=S.settings.cashier===e.name;
    var sales=S.sales.filter(function(s){return s.cashier===e.name;});
    var total=sales.reduce(function(a,s){return a+s.total;},0);
    var card=document.createElement('div');
    card.className='emp-card'+(isActive?' active-cashier':'');
    card.innerHTML=(isActive?'<div class="emp-active-badge">Actif</div>':'')
      +'<div class="emp-avatar">'+e.name.charAt(0).toUpperCase()+'</div>'
      +'<div class="emp-name">'+e.name+'</div>'
      +'<div class="emp-role">'+getRoleLabel(e.role||'caissier')+'</div>'
      +'<div style="font-size:10px;margin-top:2px;">'+(e.pin?'🔐 PIN défini':'⚠️ Pas de PIN')+'</div>'
      +'<div class="emp-stats">'+sales.length+' vente(s) · '+fmt(total)+'</div>';
    var actions=document.createElement('div'); actions.className='emp-actions';
    var btnA=document.createElement('button'); btnA.className='abt'; btnA.textContent='✓ Activer';
    (function(n){btnA.onclick=function(){setActiveCashier(n);};})(e.name);
    var btnE=document.createElement('button'); btnE.className='abt'; btnE.textContent='✏️';
    (function(id){btnE.onclick=function(){openEmpMod(id);};})(e.id);
    var btnD=document.createElement('button'); btnD.className='abt del'; btnD.textContent='🗑️';
    (function(id){btnD.onclick=function(){delEmp(id);};})(e.id);
    actions.appendChild(btnA); actions.appendChild(btnE); actions.appendChild(btnD);
    card.appendChild(actions); grid.appendChild(card);
  });
}

function openEmpMod(id){
  S.editEmp=id||null;
  if(id){
    var e=(S.employees||[]).find(function(x){return x.id===id;});
    document.getElementById('empMTitle').textContent='Modifier membre';
    document.getElementById('emp-name').value=e.name||'';
    document.getElementById('emp-role').value=e.role||'caissier';
    var p=document.getElementById('emp-pin'); if(p){p.value='';p.placeholder='Laisser vide = garder PIN';}
    var t=document.getElementById('emp-tel'); if(t)t.value=e.tel||'';
  } else {
    document.getElementById('empMTitle').textContent='Nouveau membre';
    ['emp-name','emp-tel'].forEach(function(x){var el=document.getElementById(x);if(el)el.value='';});
    var p=document.getElementById('emp-pin'); if(p){p.value='';p.placeholder='Ex: 1234';}
    document.getElementById('emp-role').value='caissier';
    onEmpRoleChange();
  }
  document.getElementById('empMov').classList.add('show');
  setTimeout(function(){var n=document.getElementById('emp-name');if(n)n.focus();},200);
}

function saveEmp(){
  var name=document.getElementById('emp-name').value.trim();
  var pin=document.getElementById('emp-pin')?document.getElementById('emp-pin').value.trim():'';
  var role=document.getElementById('emp-role').value||'caissier';
  if(!name){notif('Nom obligatoire !','err');return;}
  if(!S.editEmp&&(!pin||pin.length!==4)){notif('PIN 4 chiffres obligatoire','err');if(document.getElementById('emp-pin'))document.getElementById('emp-pin').focus();return;}
  if(!S.employees)S.employees=[];
  var data={name:name,role:role,tel:document.getElementById('emp-tel')?document.getElementById('emp-tel').value.trim():''};
  if(pin&&pin.length===4)data.pin=pin;
  if(S.editEmp){
    var i=S.employees.findIndex(function(x){return x.id===S.editEmp;});
    if(i>=0)S.employees[i]=Object.assign({},S.employees[i],data);
    S.editEmp=null;
  } else {data.id=uid();S.employees.push(data);}
  save();renderEmpGrid();closeMov('empMov');
  document.getElementById('emp-name').value='';
  if(document.getElementById('emp-pin'))document.getElementById('emp-pin').value='';
  notif('✅ '+name+' enregistré!','ok');
}

function delEmp(id){
  if(!confirm('Supprimer ce membre ?'))return;
  S.employees=(S.employees||[]).filter(function(x){return x.id!==id;});
  save();renderEmpGrid();notif('🗑️ Membre supprimé');
}

function setActiveCashier(name){
  S.settings.cashier=name;save();updateTopbar();renderEmpGrid();
  notif('✅ '+name+' est maintenant le caissier actif','ok');
}

// ── REMBOURSEMENT ──
function showRemboursement(){
  if(!can('remboursement')){notif('Accès refusé','err');return;}
  var old2=document.getElementById('rembMov'); if(old2)old2.remove();
  var mov=document.createElement('div'); mov.id='rembMov'; mov.className='mov show';
  var inner=document.createElement('div'); inner.className='modal'; inner.style.maxWidth='520px';
  var titleEl=document.createElement('h3'); titleEl.textContent='🔄 Remboursement'; inner.appendChild(titleEl);
  var subEl=document.createElement('div'); subEl.style.cssText='font-size:12px;color:var(--text3);margin-bottom:14px;'; subEl.textContent='Choisissez la vente à rembourser:'; inner.appendChild(subEl);
  var listDiv=document.createElement('div'); listDiv.style.cssText='max-height:340px;overflow-y:auto;';
  var recent=S.sales.slice(0,50).filter(function(s){return !s.rembourse&&!s.isRetour;});
  if(!recent.length){var empty=document.createElement('div');empty.style.cssText='text-align:center;padding:24px;color:var(--text3);';empty.textContent='Aucune vente disponible';listDiv.appendChild(empty);}
  else recent.forEach(function(s){
    var d=new Date(s.date).toLocaleDateString('fr-FR',{day:'2-digit',month:'short',hour:'2-digit',minute:'2-digit'});
    var items=s.items.map(function(i){return i.name+' x'+i.qty;}).join(', ');
    var card=document.createElement('div');
    card.style.cssText='border:1px solid var(--border);border-radius:8px;padding:12px;margin-bottom:8px;cursor:pointer;';
    card.innerHTML='<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:4px;"><div style="font-size:13px;font-weight:700;">Vente #'+s.num+' — '+d+'</div><div style="font-size:14px;font-weight:800;color:var(--accent);">'+fmt(s.total)+'</div></div><div style="font-size:11px;color:var(--text3);">'+items.slice(0,60)+'</div>'+(s.clientNom?'<div style="font-size:11px;color:var(--text2);margin-top:2px;">👤 '+s.clientNom+'</div>':'');
    (function(sid){card.onclick=function(){confirmRemboursement(sid);};})(s.id);
    listDiv.appendChild(card);
  });
  inner.appendChild(listDiv);
  var footer=document.createElement('div'); footer.className='mfooter';
  var closeBtn=document.createElement('button'); closeBtn.className='btn-cancel'; closeBtn.textContent='Fermer'; closeBtn.onclick=function(){mov.remove();};
  footer.appendChild(closeBtn); inner.appendChild(footer); mov.appendChild(inner); document.body.appendChild(mov);
}

function confirmRemboursement(saleId){
  var s=S.sales.find(function(x){return x.id===saleId;}); if(!s){notif('Vente non trouvée','err');return;}
  var raison=prompt('Motif du remboursement (optionnel):',''); if(raison===null)return;
  s.rembourse=true; s.rembourseDate=new Date().toISOString(); s.rembourseRaison=raison; s.rembourseBy=S.settings.cashier||'Admin';
  s.items.forEach(function(it){var p=S.products.find(function(x){return x.id===it.id;});if(p&&p.stock!==999)p.stock=(p.stock||0)+it.qty;});
  save(); renderProds();
  var mov=document.getElementById('rembMov'); if(mov)mov.remove();
  notif('✅ Remboursement #'+s.num+' — '+fmt(s.total)+' — Stock rétabli','ok');
  showRecuRemboursement(s);
}

function showRecuRemboursement(s){
  var d=new Date().toLocaleDateString('fr-FR')+' '+new Date().toLocaleTimeString('fr-FR',{hour:'2-digit',minute:'2-digit'});
  var items=s.items.map(function(i){return '<div class="r-row"><span>'+i.name+' ×'+i.qty+'</span><span>-'+fmt(i.price*i.qty)+'</span></div>';}).join('');
  var h='<div class="receipt"><div class="r-logo">'+(S.settings.bizname||'Konektem')+'</div><div class="r-sub" style="color:#ef4444;font-weight:800;">🔄 REMBOURSEMENT</div><div class="r-sub">'+d+' · Vente #'+s.num+'</div>'+(s.clientNom?'<div class="r-sub">Client: '+s.clientNom+'</div>':'')+'<div class="r-div"></div>'+items+'<div class="r-div"></div><div class="r-row r-tot" style="color:#ef4444;"><span>REMBOURSÉ</span><span>'+fmt(s.total)+'</span></div>'+(s.rembourseRaison?'<div class="r-sub">Motif: '+s.rembourseRaison+'</div>':'')+'<div class="r-sub">Par: '+(s.rembourseBy||'')+'</div></div>';
  var recEl=document.getElementById('recContent'); if(recEl)recEl.innerHTML=h;
  document.getElementById('recMov').classList.add('show');
}

// ── PARAMÈTRES / SÉCURITÉ ──
function saveOwnerPw(){
  var inp=document.getElementById('owner-pw-set'); if(!inp)return;
  var val=inp.value.trim();
  if(!val||val.length<4){notif('Minimum 4 caractères','err');return;}
  S.settings.ownerPassword=val; save(); inp.value='';
  notif('✅ Mot de passe propriétaire changé!','ok');
}

function changePassword(){
  var np=document.getElementById('new-pass')?document.getElementById('new-pass').value:'';
  var cp=document.getElementById('conf-pass')?document.getElementById('conf-pass').value:'';
  if(!np){notif('Entrez un mot de passe','err');return;}
  if(np!==cp){notif('Mots de passe différents','err');return;}
  if(np.length<4){notif('Minimum 4 caractères','err');return;}
  S.settings.appPassword=np; save();
  if(document.getElementById('new-pass')) document.getElementById('new-pass').value='';
  if(document.getElementById('conf-pass')) document.getElementById('conf-pass').value='';
  notif('✅ Mot de passe changé!','ok');
}

// ── FOURNISSEURS (manke) ──
function openAchatModal(fournId){
  var old=document.getElementById('achat-mov'); if(old)old.remove();
  var fourn=(S.fournisseurs||[]).find(function(f){return f.id===fournId;})||{nom:'?'};
  var mov=document.createElement('div'); mov.id='achat-mov'; mov.className='mov show';
  var inner=document.createElement('div'); inner.className='modal';
  var prodsOpts=S.products.map(function(p){return '<option value="'+p.id+'">'+p.name+' (stock: '+p.stock+')</option>';}).join('');
  inner.innerHTML='<h3>Achat — '+fourn.nom+'</h3>'
    +'<div class="fg"><label class="flbl">Article</label><select class="fsel" id="ac-prod">'+prodsOpts+'</select></div>'
    +'<div class="f2"><div class="fg"><label class="flbl">Quantité</label><input class="finp" type="number" id="ac-qty" value="1" min="1"></div>'
    +'<div class="fg"><label class="flbl">Prix coût</label><input class="finp" type="number" id="ac-prix" placeholder="0"></div></div>'
    +'<div class="fg"><label class="flbl">Note</label><input class="finp" id="ac-note" placeholder="Réf. facture..."></div>'
    +'<div class="mfooter" id="achat-footer"></div>';
  mov.appendChild(inner); document.body.appendChild(mov);
  var bA=document.createElement('button'); bA.className='btn-cancel'; bA.textContent='Annuler'; bA.onclick=function(){mov.remove();};
  var bS=document.createElement('button'); bS.className='btn-g'; bS.textContent='Enregistrer';
  (function(fid){bS.onclick=function(){saveAchat(fid);};})(fournId);
  document.getElementById('achat-footer').appendChild(bA);
  document.getElementById('achat-footer').appendChild(bS);
  mov.addEventListener('click',function(e){if(e.target===mov)mov.remove();});
}

function saveAchat(fournId){
  var prodId=document.getElementById('ac-prod').value;
  var qty=parseInt(document.getElementById('ac-qty').value)||0;
  var prix=parseFloat(document.getElementById('ac-prix').value)||0;
  var note=document.getElementById('ac-note').value;
  if(qty<=0){notif('Quantité invalide','err');return;}
  var prod=S.products.find(function(p){return p.id===prodId;});
  if(prod&&prod.stock!==999)prod.stock+=qty;
  if(prod&&prix>0)prod.cost=prix;
  if(!S.achats)S.achats=[];
  S.achats.unshift({id:uid(),date:new Date().toISOString(),fournisseurId:fournId,produitId:prodId,produitNom:prod?prod.name:'?',qty:qty,prixUnit:prix,total:prix*qty,note:note});
  save();
  document.getElementById('achat-mov').remove();
  notif('✅ Achat enregistré — Stock +'+qty,'ok');
  renderInv();
}

// ── SYNC CLOUD MANUEL ──
function forcePullCloud(){ pullFromCloud(); notif('🔄 Synchronisation en cours...','inf'); }
function manualCloudSync(){ syncProductsToCloud(); notif('☁️ Sync cloud lancé','ok'); }

// ── INIT FINAL ──
// Démare app si onboarding deja fini
(function initCheck(){
  load();
  if(S.settings.onboardingDone){ startApp(); }
})();



// ═══════════════════════════════════════════════════════════
// FONKSYON ESANSYÈL 2 — TOUT SA KI TOUJOU MANKE
// ═══════════════════════════════════════════════════════════

// ── UI UTILS ──
function closeMov(id){ var el=document.getElementById(id); if(el) el.classList.remove('show'); }
function togSet(el,key){ el.classList.toggle('on'); S.settings[key]=el.classList.contains('on'); save(); }
function mtab(btn,panel){ document.querySelectorAll('.mtab').forEach(function(b){b.classList.remove('on');}); document.querySelectorAll('.mtp').forEach(function(p){p.classList.remove('on');}); btn.classList.add('on'); document.getElementById(panel).classList.add('on'); }
function boTab(btn,panel){ document.querySelectorAll('.bo-tab').forEach(function(b){b.classList.remove('on');}); document.querySelectorAll('.bo-panel').forEach(function(p){p.classList.remove('on');}); btn.classList.add('on'); document.getElementById(panel).classList.add('on'); }

// ── DARK MODE ──
function toggleDarkMode(){ var isDark=document.body.classList.toggle('dark-mode'); S.settings.darkMode=isDark; save(); var btn=document.getElementById('dark-mode-btn'); if(btn)btn.textContent=isDark?'☀️':'🌙'; notif(isDark?'🌙 Mode sombre activé':'☀️ Mode clair activé'); }
function initDarkMode(){ if(S.settings.darkMode) document.body.classList.add('dark-mode'); var btn=document.getElementById('dark-mode-btn'); if(btn)btn.textContent=S.settings.darkMode?'☀️':'🌙'; }

// ── PWA ──
var deferredInstallPrompt=null;
window.addEventListener('beforeinstallprompt',function(e){ e.preventDefault(); deferredInstallPrompt=e; var btn=document.getElementById('install-app-btn'); if(btn)btn.style.display='inline-flex'; });
function installApp(){ if(!deferredInstallPrompt)return; deferredInstallPrompt.prompt(); deferredInstallPrompt.userChoice.then(function(c){ if(c.outcome==='accepted'){notif('✅ Konektem ap enstale!','ok'); var btn=document.getElementById('install-app-btn'); if(btn)btn.style.display='none';} deferredInstallPrompt=null; }); }

// ── MOBILE NAV + CART SHEET ──
function mobileNav(view,el){ document.querySelectorAll('.bn-item').forEach(function(b){b.classList.remove('on');}); if(el)el.classList.add('on'); showView(view); }
function openCartSheet(){ renderCartSheet(); document.getElementById('cartSheet').classList.add('open'); document.getElementById('sheet-ov').style.display='block'; document.body.style.overflow='hidden'; }
function closeCartSheet(){ document.getElementById('cartSheet').classList.remove('open'); document.getElementById('sheet-ov').style.display='none'; document.body.style.overflow=''; }
function renderCartSheet(){
  var ci=document.getElementById('cs-items');
  if(!S.cart.length){ci.innerHTML='<div style="text-align:center;padding:30px;color:var(--text3)"><div style="font-size:36px;margin-bottom:8px">🧺</div><div>Panier vide</div></div>';document.getElementById('cs-st').textContent=fmt(0);document.getElementById('cs-tot').textContent=fmt(0);return;}
  ci.innerHTML=S.cart.map(function(it){var th=it.img?'<img src="'+it.img+'" style="width:100%;height:100%;object-fit:cover">':getEmoji(it.category,S.settings.sector);return '<div class="oitem" style="padding:10px 16px"><div class="oi-img">'+th+'</div><div class="oi-info"><div class="oi-name">'+it.name+'</div><div class="oi-price">'+fmt(it.price)+'</div></div><div class="oi-ctrl"><button class="qb" onclick="chgQty(\''+it.id+'\',-1);renderCartSheet()">−</button><span class="qv">'+it.qty+'</span><button class="qb" onclick="chgQty(\''+it.id+'\',1);renderCartSheet()">+</button></div><div class="oi-sub">'+fmt(it.price*it.qty)+'</div><span class="oi-del" onclick="removeCart(\''+it.id+'\');renderCartSheet()">✕</span></div>';}).join('');
  var sub=S.cart.reduce(function(a,x){return a+x.price*x.qty;},0);
  document.getElementById('cs-st').textContent=fmt(sub);
  document.getElementById('cs-tot').textContent=fmt(sub);
}
var origRC=renderCart;
renderCart=function(){ origRC(); var tot=S.cart.reduce(function(a,x){return a+x.qty;},0); var badge=document.getElementById('bn-badge'); if(badge){badge.textContent=tot;badge.style.display=tot?'block':'none';} };

// ── TICKETS ──
function newTicket(){ var t={id:uid(),num:S.tickets.length+1,name:'',items:S.cart.slice(),date:new Date().toISOString()}; S.tickets.push(t); if(S.cart.length){S.cart=[];renderCart();notif('📋 Commande sauvée comme ticket','ok');}else notif('📋 Nouveau ticket créé'); save();renderTickets(); }

// ── CLIENTS ──
function renderClients(){
  var q=(document.getElementById('clientQ')?document.getElementById('clientQ').value:'').toLowerCase();
  var body=document.getElementById('clientBody');
  var list=(S.clients||[]).filter(function(c){return !q||c.name.toLowerCase().indexOf(q)>-1;});
  if(!list.length){body.innerHTML='<tr><td colspan="5" style="text-align:center;color:var(--text3);padding:20px">Aucun client</td></tr>';return;}
  body.innerHTML='';
  list.forEach(function(cl){
    var init=cl.name.charAt(0).toUpperCase();
    var tot=S.sales.filter(function(s){return s.clientId===cl.id;}).reduce(function(a,s){return a+s.total;},0);
    var tr=document.createElement('tr');
    tr.innerHTML='<td><div style="display:flex;align-items:center;gap:7px"><div class="cav">'+init+'</div><strong>'+cl.name+'</strong></div></td><td>'+(cl.tel||'-')+'</td><td>'+(cl.addr||'-')+'</td><td>'+(tot?fmt(tot):'-')+'</td><td></td>';
    var actTd=tr.querySelector('td:last-child');
    var btnE=document.createElement('button'); btnE.className='abt'; btnE.textContent='✏️';
    (function(id){btnE.onclick=function(){openClientMod(id);};})(cl.id);
    var btnD=document.createElement('button'); btnD.className='abt del'; btnD.textContent='🗑️';
    (function(id){btnD.onclick=function(){delClient(id);};})(cl.id);
    actTd.appendChild(btnE); actTd.appendChild(btnD);
    body.appendChild(tr);
  });
}
function openClientMod(id){
  S.editClient=id||null;
  if(id){var cl=S.clients.find(function(x){return x.id===id;});document.getElementById('clientMTitle').textContent='Modifier Client';document.getElementById('cl-n').value=cl.name||'';document.getElementById('cl-t').value=cl.tel||'';document.getElementById('cl-a').value=cl.addr||'';document.getElementById('cl-no').value=cl.note||'';}
  else{document.getElementById('clientMTitle').textContent='Nouveau Client';['cl-n','cl-t','cl-a','cl-no'].forEach(function(x){document.getElementById(x).value='';});}
  document.getElementById('clientMov').classList.add('show');
}
function saveClient(){ var name=document.getElementById('cl-n').value.trim();if(!name){notif('Nom obligatoire!','err');return;} var data={name:name,tel:document.getElementById('cl-t').value,addr:document.getElementById('cl-a').value,note:document.getElementById('cl-no').value}; if(S.editClient){var i=S.clients.findIndex(function(x){return x.id===S.editClient;});if(i>=0)S.clients[i]=Object.assign({},S.clients[i],data);}else S.clients.push(Object.assign({id:uid()},data)); save();renderClients();closeMov('clientMov');notif('✅ Client enregistré!','ok'); }
function delClient(id){if(!confirm('Supprimer?'))return;S.clients=S.clients.filter(function(x){return x.id!==id;});save();renderClients();}

// ── SETTINGS ──
function saveSet(){ S.settings.bizname=document.getElementById('s-biz').value; S.settings.cashier=document.getElementById('s-cash').value; S.settings.currency=document.getElementById('s-cur').value; S.settings.tax=parseFloat(document.getElementById('s-tax').value)||0; S.settings.receiptmsg=document.getElementById('s-msg').value; updateTopbar();save();calcTot();notif('✅ Paramètres sauvegardés','ok'); }
function addCat(){ var v=document.getElementById('newCat').value.trim();if(!v)return;if(S.categories.indexOf(v)>-1){notif('Déjà existante','err');return;}S.categories.push(v);document.getElementById('newCat').value='';save();renderCatList();renderCatBar();notif('✅ Catégorie ajoutée','ok'); }
function renderCatList(){ document.getElementById('catList').innerHTML=S.categories.map(function(c){return '<div style="display:inline-flex;align-items:center;gap:4px;background:var(--accent-l);border:1px solid var(--accent-m);border-radius:20px;padding:3px 11px;font-size:12px;font-weight:700;color:var(--accent-d)">'+c+'<span style="cursor:pointer;margin-left:3px;color:var(--text3)" onclick="delCat(\''+c+'\')">✕</span></div>';}).join(''); }
function delCat(cat){ if(S.products.some(function(p){return p.category===cat;})){notif('Catégorie utilisée!','err');return;}S.categories=S.categories.filter(function(x){return x!==cat;});save();renderCatList();renderCatBar(); }
function resetData(){ if(!confirm('Effacer TOUTES les données?'))return;localStorage.removeItem('konektem_app');location.reload(); }
function requestNotifPermission(){ if(!('Notification' in window)){notif('Non supporté','err');return;}Notification.requestPermission().then(function(p){if(p==='granted'){notif('✅ Notifications activées','ok');new Notification('Konektem',{body:'Alertes stock activées!'});}else notif('Refusé','err');}); }

// ── REÇU ──
function recuFromSale(){ if(S.viewSale){closeMov('saleMov');showRecu(S.viewSale);} }

// ── BACK OFFICE ──
function renderBoV(){
  var per=document.getElementById('bo-per')?document.getElementById('bo-per').value:'all';
  var now=new Date();
  var list=S.sales.filter(function(s){ var d=new Date(s.date); if(per==='today')return d.toDateString()===now.toDateString(); if(per==='week'){var w=new Date(now);w.setDate(now.getDate()-7);return d>=w;} if(per==='month'){var m=new Date(now);m.setDate(now.getDate()-30);return d>=m;} return true; });
  var mc={'Espèces':'bdg-cash','Carte':'bdg-card','MonCash':'bdg-mc','Crédit':'bdg-cred'};
  var body=document.getElementById('boVB');
  if(!list.length){body.innerHTML='<tr><td colspan="8" style="text-align:center;color:var(--text3);padding:20px">Aucune vente</td></tr>';return;}
  body.innerHTML=list.map(function(s){var d=new Date(s.date);var ds=d.toLocaleDateString('fr-FR')+' '+d.toLocaleTimeString('fr-FR',{hour:'2-digit',minute:'2-digit'});return '<tr><td><strong>#'+s.num+'</strong></td><td>'+ds+'</td><td>'+s.items.map(function(i){return i.name+' ×'+i.qty;}).join(', ')+'</td><td><span class="bdg '+(mc[s.method]||'')+'">'+s.method+'</span></td><td>'+(s.discount?fmt(s.discount):'-')+'</td><td>'+(s.rendu>0?fmt(s.rendu):'-')+'</td><td><strong>'+fmt(s.total)+'</strong></td><td>'+(s.cashier||'')+'</td></tr>';}).join('');
}
function renderBoS(){
  var f=document.getElementById('bo-stf')?document.getElementById('bo-stf').value:'all';
  var list=S.products.filter(function(p){if(f==='low')return p.stock>0&&p.stock<=(p.lowStock||5);if(f==='out')return p.stock===0;return true;});
  var body=document.getElementById('boSB');
  if(!list.length){body.innerHTML='<tr><td colspan="7" style="text-align:center;color:var(--text3);padding:20px">Aucun article</td></tr>';return;}
  body.innerHTML=list.map(function(p){var st=p.stock===0?'<span class="bdg bdg-out">Épuisé</span>':(p.stock<=(p.lowStock||5)?'<span class="bdg bdg-low">Bas</span>':'<span class="bdg bdg-ok">OK</span>');return '<tr><td>'+getEmoji(p.category,S.settings.sector)+' <strong>'+p.name+'</strong></td><td>'+p.category+'</td><td><strong>'+p.stock+'</strong></td><td>'+(p.cost?fmt(p.cost):'-')+'</td><td>'+fmt(p.price)+'</td><td>'+(p.cost&&p.stock?fmt(p.stock*p.cost):'-')+'</td><td>'+st+'</td></tr>';}).join('');
}

// ── EXPORT ──
function dateStr(){var d=new Date();return d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0')+'-'+String(d.getDate()).padStart(2,'0');}
function dlFile(content,filename,mime){var blob=new Blob([content],{type:mime});var a=document.createElement('a');a.href=URL.createObjectURL(blob);a.download=filename;a.click();URL.revokeObjectURL(a.href);}
function exportSalesCSV(){var cur=S.settings.currency||'HTG';var rows=[['#','Date','Articles','Methode','Remise','Rendu','Total','Caissier']];S.sales.forEach(function(s){var d=new Date(s.date);rows.push([s.num,d.toLocaleDateString('fr-FR'),s.items.map(function(i){return i.name+'(x'+i.qty+')';}).join('|'),s.method,(s.discount||0).toFixed(0),(s.rendu||0).toFixed(0),s.total.toFixed(0),s.cashier||'']);});var csv='\uFEFF'+rows.map(function(r){return r.map(function(v){return '"'+(v+'').replace(/"/g,'""')+'"';}).join(',');}).join('\n');dlFile(csv,'ventes-'+dateStr()+'.csv','text/csv;charset=utf-8');notif('✅ CSV exporté','ok');}
function exportInventoryCSV(){var rows=[['Nom','Categorie','Prix','Cout','Stock','Statut']];S.products.forEach(function(p){rows.push([p.name,p.category,p.price,p.cost||0,p.stock===999?'Illimite':p.stock,p.stock===0?'Epuise':p.stock<=(p.lowStock||5)?'Bas':'OK']);});var csv='\uFEFF'+rows.map(function(r){return r.map(function(v){return '"'+(v+'').replace(/"/g,'""')+'"';}).join(',');}).join('\n');dlFile(csv,'inventaire-'+dateStr()+'.csv','text/csv;charset=utf-8');notif('✅ CSV inventaire exporté','ok');}
function exportSalesPDF(){var biz=S.settings.bizname||'Konektem';var total=S.sales.reduce(function(a,s){return a+s.total;},0);var html='<!DOCTYPE html><html><head><meta charset="UTF-8"><style>body{font-family:Arial,sans-serif;font-size:12px;margin:20px;}table{width:100%;border-collapse:collapse;}th{background:#16a34a;color:#fff;padding:7px;text-align:left;font-size:11px;}td{padding:6px;border-bottom:1px solid #eee;}</style></head><body><h2>'+biz+' — Rapport Ventes</h2><table><thead><tr><th>#</th><th>Date</th><th>Articles</th><th>Méthode</th><th>Total</th><th>Caissier</th></tr></thead><tbody>'+S.sales.map(function(s){return '<tr><td>'+s.num+'</td><td>'+new Date(s.date).toLocaleDateString('fr-FR')+'</td><td>'+s.items.map(function(i){return i.name+' ×'+i.qty;}).join(', ')+'</td><td>'+s.method+'</td><td>'+s.total.toLocaleString('fr-HT')+' HTG</td><td>'+(s.cashier||'')+'</td></tr>';}).join('')+'</tbody><tfoot><tr><td colspan="4"><strong>TOTAL</strong></td><td><strong>'+total.toLocaleString('fr-HT')+' HTG</strong></td><td></td></tr></tfoot></table></body></html>';var win=window.open('','_blank');if(win){win.document.write(html);win.document.close();win.print();}else notif('Autorisez les popups','err');}
function exportBackup(){var backup={version:'3.0',date:new Date().toISOString(),bizname:S.settings.bizname||'Konektem',data:JSON.parse(JSON.stringify(S))};var json=JSON.stringify(backup,null,2);dlFile(json,'konektem-backup-'+dateStr()+'.json','application/json');notif('✅ Backup téléchargé','ok');}
function importBackup(inp){var file=inp.files[0];if(!file)return;var r=new FileReader();r.onload=function(e){try{var backup=JSON.parse(e.target.result);if(!backup.data)throw new Error('Fichier invalide');if(!confirm('Restaurer? DONNÉES ACTUELLES REMPLACÉES!'))return;S=Object.assign({},S,backup.data);if(!S.employees)S.employees=[];if(!S.connections)S.connections=[];if(!S.clients)S.clients=[];save();location.reload();}catch(err){notif('❌ Erreur backup: '+err.message,'err');}inp.value='';};r.readAsText(file);}

// ── RAPPORT JOURNALIER ──
function genRapportJournalier(){
  var today=new Date().toDateString();
  var ventes=S.sales.filter(function(s){return !s.isRetour&&new Date(s.date).toDateString()===today;});
  var totalV=ventes.reduce(function(a,s){return a+s.total;},0);
  var methods={};ventes.forEach(function(s){methods[s.method]=(methods[s.method]||0)+s.total;});
  var rapport='📊 RAPPORT — '+(S.settings.bizname||'Konektem')+'\n'+new Date().toLocaleDateString('fr-FR',{weekday:'long',year:'numeric',month:'long',day:'numeric'})+'\n━━━━━━━━━━━━━━━━━━━━\n✅ Ventes: '+ventes.length+' · '+totalV.toLocaleString('fr-HT')+' HTG\n';
  Object.entries(methods).forEach(function(m){rapport+='  '+m[0]+': '+m[1].toLocaleString('fr-HT')+' HTG\n';});
  rapport+='━━━━━━━━━━━━━━━━━━━━\nKonektem POS · RIVAYO-TECH';
  var old=document.getElementById('rapport-mov');if(old)old.remove();
  var mov=document.createElement('div');mov.id='rapport-mov';mov.className='mov show';
  var inner=document.createElement('div');inner.className='modal';inner.style.maxWidth='400px';
  var h3=document.createElement('h3');h3.textContent='Rapport Journalier';inner.appendChild(h3);
  var pre=document.createElement('pre');pre.style.cssText='background:var(--bg);border-radius:8px;padding:14px;font-size:12px;line-height:1.6;overflow-x:auto;font-family:monospace;white-space:pre-wrap;';pre.textContent=rapport;inner.appendChild(pre);
  var footer=document.createElement('div');footer.className='mfooter';
  var btnF=document.createElement('button');btnF.className='btn-cancel';btnF.textContent='Fermer';btnF.onclick=function(){mov.remove();};
  var btnS=document.createElement('button');btnS.className='btn-g';btnS.textContent='WhatsApp';
  btnS.onclick=function(){window.open('https://wa.me/'+WHATSAPP_NUM+'?text='+encodeURIComponent(rapport),'_blank');};
  footer.appendChild(btnF);footer.appendChild(btnS);inner.appendChild(footer);mov.appendChild(inner);document.body.appendChild(mov);
  window._currentRapport=rapport;
}

// ── SCANNER ──
var scanStream=null, scanInterval=null;
function openScanner(){
  var overlay=document.getElementById('scanOverlay');overlay.classList.remove('hidden');
  document.getElementById('scanResult').innerHTML='';document.getElementById('scanManualInp').value='';
  var statusEl=document.getElementById('scanStatus');
  setTimeout(function(){document.getElementById('scanManualInp').focus();},200);
  if(navigator.mediaDevices&&navigator.mediaDevices.getUserMedia){
    if(statusEl)statusEl.textContent='📷 Démarrage caméra...';
    navigator.mediaDevices.getUserMedia({video:{facingMode:'environment'}})
    .then(function(stream){
      scanStream=stream;var video=document.getElementById('scanVideo');video.srcObject=stream;video.play();
      if('BarcodeDetector' in window){
        if(statusEl)statusEl.textContent='📷 Caméra active — montrez le barcode';
        var detector=new BarcodeDetector({formats:['ean_13','ean_8','code_128','code_39','qr_code','upc_a']});
        scanInterval=setInterval(function(){if(video.readyState===video.HAVE_ENOUGH_DATA){detector.detect(video).then(function(barcodes){if(barcodes.length>0)handleScanResult(barcodes[0].rawValue);}).catch(function(){});}},500);
      } else {if(statusEl)statusEl.textContent='⚠️ Scan auto non disponible — tapez le code';}
    }).catch(function(){if(statusEl)statusEl.textContent='⚠️ Caméra bloquée — tapez le code (Chrome recommandé)';var fb=document.getElementById('scan-frame-box');if(fb)fb.style.display='none';});
  } else {if(statusEl)statusEl.textContent='⚠️ Caméra non disponible';var fb=document.getElementById('scan-frame-box');if(fb)fb.style.display='none';}
}
function closeScanner(){
  var overlay=document.getElementById('scanOverlay');if(overlay)overlay.classList.add('hidden');
  if(scanInterval){clearInterval(scanInterval);scanInterval=null;}
  if(scanStream){scanStream.getTracks().forEach(function(t){t.stop();});scanStream=null;}
  var video=document.getElementById('scanVideo');if(video)video.srcObject=null;
}
function handleScanResult(code){if(scanInterval){clearInterval(scanInterval);scanInterval=null;}scanSearch(code);}
function scanManualLookup(){ var code=document.getElementById('scanManualInp').value.trim();if(!code){showScanResult('err','Entrez un code ou nom');return;}showScanResult('info','Recherche: <strong>'+code+'</strong>...');scanSearch(code); }
function scanLiveSearch(val){ if(!val||val.length<2){document.getElementById('scanResult').innerHTML='';return;}var q=val.toLowerCase();var found=S.products.filter(function(p){return p.name.toLowerCase().indexOf(q)>-1||(p.barcode&&p.barcode.indexOf(val)>-1);}).slice(0,4);if(!found.length){showScanResult('info','Aucun article pour: <strong>'+val+'</strong>');return;}showScanResults(found); }

// ── INVENTAIRE PHYSIQUE ──
function startInventairePhysique(){
  var old=document.getElementById('inv-phys-mov');if(old)old.remove();
  var mov=document.createElement('div');mov.id='inv-phys-mov';mov.className='mov show';
  var inner=document.createElement('div');inner.className='modal';inner.style.cssText='max-width:560px;max-height:80vh;overflow-y:auto;';
  var h3=document.createElement('h3');h3.textContent='Inventaire Physique';inner.appendChild(h3);
  var tbl=document.createElement('table');tbl.className='dtable';
  tbl.innerHTML='<thead><tr><th>Article</th><th>Système</th><th>Compté</th></tr></thead><tbody>';
  var tbody=tbl.querySelector('tbody');
  S.products.filter(function(p){return p.stock!==999;}).forEach(function(p){
    var tr=document.createElement('tr');
    tr.innerHTML='<td><strong>'+p.name+'</strong></td><td style="text-align:center">'+p.stock+'</td><td><input type="number" id="phys-'+p.id+'" value="'+p.stock+'" min="0" data-sys="'+p.stock+'" style="width:70px;border:1.5px solid var(--border);border-radius:5px;padding:5px;text-align:center;" oninput="var c=parseInt(this.value)||0,s=parseInt(this.dataset.sys);this.style.borderColor=c>s?\'#22c55e\':c<s?\'#ef4444\':\'var(--border)\';"></td>';
    tbody.appendChild(tr);
  });
  inner.appendChild(tbl);
  var footer=document.createElement('div');footer.className='mfooter';
  var btnA=document.createElement('button');btnA.className='btn-cancel';btnA.textContent='Annuler';btnA.onclick=function(){mov.remove();};
  var btnC=document.createElement('button');btnC.className='btn-g';btnC.textContent='Appliquer';
  btnC.onclick=function(){
    var corrections=0;
    S.products.forEach(function(p){if(p.stock===999)return;var inp=document.getElementById('phys-'+p.id);if(!inp)return;var n=parseInt(inp.value);if(!isNaN(n)&&n!==p.stock){p.stock=n;corrections++;}});
    save();mov.remove();renderProds();renderInv();notif('✅ Inventaire: '+corrections+' correction(s)','ok');
  };
  footer.appendChild(btnA);footer.appendChild(btnC);inner.appendChild(footer);mov.appendChild(inner);
  mov.addEventListener('click',function(e){if(e.target===mov)mov.remove();});document.body.appendChild(mov);
}

// ── INIT FINAL ──
document.querySelectorAll('.mov').forEach(function(m){ m.addEventListener('click',function(e){if(e.target===m)m.classList.remove('show');}); });


// ── NOTIF ──
var notifT=null;
function notif(msg,type){
  var el=document.getElementById('notif');
  if(!el)return;
  el.textContent=msg;
  el.className='notif show '+(type||'');
  clearTimeout(notifT);
  notifT=setTimeout(function(){el.classList.remove('show');},3000);
}

// ── RENDERBO KONPLÈ ──
function renderBO(){
  var boDate=document.getElementById('bo-date');
  if(boDate) boDate.textContent='📅 '+new Date().toLocaleDateString('fr-FR',{weekday:'long',year:'numeric',month:'long',day:'numeric'});
  var today=new Date().toDateString();
  var todayS=S.sales.filter(function(s){return new Date(s.date).toDateString()===today;});
  var todayR=todayS.reduce(function(a,s){return a+s.total;},0);
  var totalR=S.sales.reduce(function(a,s){return a+s.total;},0);
  var totalC=S.sales.reduce(function(a,s){return a+s.items.reduce(function(b,i){return b+i.qty*(i.cost||0);},0);},0);
  var profit=totalR-totalC;
  var kpi=document.getElementById('kpiGrid');
  if(kpi) kpi.innerHTML=
    '<div class="kpi"><div class="kpi-lbl">Ventes aujourd\'hui</div><div class="kpi-val">'+fmt(todayR)+'</div><div class="kpi-sub">'+todayS.length+' transaction(s)</div></div>'
    +'<div class="kpi or"><div class="kpi-lbl">Revenu total</div><div class="kpi-val">'+fmt(totalR)+'</div><div class="kpi-sub">'+S.sales.length+' ventes</div></div>'
    +'<div class="kpi bl"><div class="kpi-lbl">Bénéfice estimé</div><div class="kpi-val">'+fmt(profit)+'</div><div class="kpi-sub">Revenu − Coût</div></div>'
    +'<div class="kpi re"><div class="kpi-lbl">Articles épuisés</div><div class="kpi-val">'+S.products.filter(function(p){return p.stock===0;}).length+'</div><div class="kpi-sub">sur '+S.products.length+'</div></div>';
  // Graphique 7 jou
  var days=[];
  for(var i=6;i>=0;i--){var d=new Date();d.setDate(d.getDate()-i);var ds=d.toDateString();var rv=S.sales.filter(function(s){return new Date(s.date).toDateString()===ds;}).reduce(function(a,s){return a+s.total;},0);days.push({label:d.toLocaleDateString('fr-FR',{weekday:'short'}),rev:rv});}
  var mx=Math.max.apply(null,days.map(function(d){return d.rev;}).concat([1]));
  var cbars=document.getElementById('cbars');
  if(cbars) cbars.innerHTML=days.map(function(d){var h=Math.max(4,Math.round((d.rev/mx)*100));return '<div class="cw"><div class="cb" style="height:'+h+'px">'+(d.rev?'<div class="cv">'+Math.round(d.rev/1000)+'k</div>':'')+'</div><div class="cl">'+d.label+'</div></div>';}).join('');
  // Top articles
  var sold={};S.sales.forEach(function(s){s.items.forEach(function(i){if(!sold[i.id])sold[i.id]=Object.assign({},i,{ts:0,tr:0});sold[i.id].ts+=i.qty;sold[i.id].tr+=i.qty*i.price;});});
  var top=Object.values(sold).sort(function(a,b){return b.ts-a.ts;}).slice(0,5);
  var topList=document.getElementById('topList');
  if(topList) topList.innerHTML=top.length?top.map(function(p,i){return '<div class="tp"><div class="tp-rk">#'+(i+1)+'</div><div class="tp-img">'+getEmoji(p.category,S.settings.sector)+'</div><div class="tp-info"><div class="tp-name">'+p.name+'</div><div class="tp-sold">'+p.ts+' vendu(s)</div></div><div class="tp-rev">'+fmt(p.tr)+'</div></div>';}).join(''):'<div style="color:var(--text3);font-size:13px">Aucune vente</div>';
  renderBoV(); renderBoS(); renderBoE();
}

function renderBoE(){
  var emp={};
  S.sales.forEach(function(s){var k=s.cashier||'Caissier';if(!emp[k])emp[k]={name:k,count:0,total:0};emp[k].count++;emp[k].total+=s.total;});
  var list=Object.values(emp).sort(function(a,b){return b.total-a.total;});
  var body=document.getElementById('boEB');
  if(!body)return;
  if(!list.length){body.innerHTML='<tr><td colspan="4" style="text-align:center;color:var(--text3);padding:20px">Aucune donnée</td></tr>';return;}
  body.innerHTML=list.map(function(e){return '<tr><td><strong>👤 '+e.name+'</strong></td><td>'+e.count+'</td><td>'+fmt(e.total)+'</td><td>'+fmt(e.count?e.total/e.count:0)+'</td></tr>';}).join('');
}


// ══════════════════════════════════════════════════════
// FONKSYON MANKE — AJOUTE
// ══════════════════════════════════════════════════════

function openSb(){ document.getElementById('sidebar').classList.add('open'); }

function viewSale(saleId){
  var s = S.sales.find(function(x){ return x.id===saleId; });
  if(!s){ notif('Vente introuvable','err'); return; }
  var d = new Date(s.date);
  var ds = d.toLocaleDateString('fr-FR') + ' ' + d.toLocaleTimeString('fr-FR',{hour:'2-digit',minute:'2-digit'});
  var items = s.items.map(function(i){
    return '<div class="r-row"><span>'+ i.name +' ×'+ i.qty +'</span><span>'+ fmt(i.price*i.qty) +'</span></div>';
  }).join('');
  var html = '<div class="receipt">'
    + '<div class="r-logo">'+ (S.settings.bizname||'Konektem') +'</div>'
    + '<div class="r-sub">Vente #'+ s.num +' — '+ ds +'</div>'
    + (s.cashier ? '<div class="r-sub">Caissier: '+ s.cashier +'</div>' : '')
    + (s.clientNom ? '<div class="r-sub">Client: '+ s.clientNom +'</div>' : '')
    + '<div class="r-div"></div>'
    + items
    + '<div class="r-div"></div>'
    + (s.discount ? '<div class="r-row"><span>Remise</span><span>-'+ fmt(s.discount) +'</span></div>' : '')
    + (s.tax ? '<div class="r-row"><span>Taxe</span><span>'+ fmt(s.tax) +'</span></div>' : '')
    + '<div class="r-row r-tot"><span>TOTAL</span><span>'+ fmt(s.total) +'</span></div>'
    + '<div class="r-row"><span>Paiement</span><span>'+ (s.method||'') +'</span></div>'
    + (s.rendu ? '<div class="r-row"><span>Monnaie rendue</span><span>'+ fmt(s.rendu) +'</span></div>' : '')
    + (s.rembourse ? '<div class="r-sub" style="color:#ef4444;font-weight:700;">🔄 REMBOURSÉ</div>' : '')
    + '</div>';
  var recEl = document.getElementById('recContent');
  if(recEl) recEl.innerHTML = html;
  document.getElementById('recMov').classList.add('show');
}

function deleteSale(saleId){
  if(!can('supprime_vente')){ notif('Accès refusé','err'); return; }
  if(!confirm('Supprimer cette vente définitivement ?')) return;
  var s = S.sales.find(function(x){ return x.id===saleId; });
  if(s && !s.rembourse){
    s.items.forEach(function(it){
      var p = S.products.find(function(x){ return x.id===it.id; });
      if(p && p.stock !== 999) p.stock += it.qty;
    });
  }
  S.sales = S.sales.filter(function(x){ return x.id !== saleId; });
  save(); renderRecu(); notif('🗑️ Vente supprimée','ok');
}

function openRetourModal(saleId){
  var s = S.sales.find(function(x){ return x.id===saleId; });
  if(!s){ notif('Vente introuvable','err'); return; }
  if(s.rembourse){ notif('Déjà remboursé','err'); return; }
  var old = document.getElementById('retourMov'); if(old) old.remove();
  var mov = document.createElement('div'); mov.id='retourMov'; mov.className='mov show';
  var inner = document.createElement('div'); inner.className='modal'; inner.style.maxWidth='460px';
  var d = new Date(s.date).toLocaleDateString('fr-FR');
  var items = s.items.map(function(i){
    return '<div class="r-row" style="padding:6px 0;border-bottom:1px solid var(--border);">'
      + '<span>'+ i.name +' ×'+ i.qty +'</span><span style="color:var(--accent);">'+ fmt(i.price*i.qty) +'</span></div>';
  }).join('');
  inner.innerHTML = '<h3>↩️ Retour — Vente #'+ s.num +'</h3>'
    + '<div style="font-size:12px;color:var(--text3);margin-bottom:12px;">Du '+ d +' · Total: '+ fmt(s.total) +'</div>'
    + '<div style="max-height:200px;overflow-y:auto;margin-bottom:12px;">'+ items +'</div>'
    + '<div class="fg"><label class="flbl">Motif du retour</label>'
    + '<input class="finp" id="retour-motif" placeholder="Ex: Produit défectueux..."></div>'
    + '<div id="retour-footer" class="mfooter"></div>';
  mov.appendChild(inner); document.body.appendChild(mov);
  mov.addEventListener('click', function(e){ if(e.target===mov) mov.remove(); });
  var btnC = document.createElement('button'); btnC.className='btn-cancel'; btnC.textContent='Annuler';
  btnC.onclick = function(){ mov.remove(); };
  var btnA = document.createElement('button'); btnA.className='btn-g'; btnA.textContent='✅ Confirmer remboursement';
  (function(sid){ btnA.onclick = function(){
    var motif = document.getElementById('retour-motif').value;
    mov.remove();
    var sale = S.sales.find(function(x){ return x.id===sid; });
    if(!sale) return;
    sale.rembourse = true; sale.rembourseDate = new Date().toISOString();
    sale.rembourseRaison = motif; sale.rembourseBy = S.settings.cashier||'Admin';
    sale.items.forEach(function(it){
      var p = S.products.find(function(x){ return x.id===it.id; });
      if(p && p.stock !== 999) p.stock += it.qty;
    });
    save(); renderProds(); renderRecu();
    notif('✅ Remboursement effectué — Stock rétabli','ok');
    showRecuRemboursement(sale);
  };})(saleId);
  var footer = document.getElementById('retour-footer');
  footer.appendChild(btnC); footer.appendChild(btnA);
}

function renderTickets(){
  var body = document.getElementById('ticketsBody'); if(!body) return;
  var tickets = S.tickets||[];
  if(!tickets.length){
    body.innerHTML='<div style="text-align:center;color:var(--text3);padding:40px;">Aucun ticket ouvert</div>';
    return;
  }
  body.innerHTML='';
  tickets.forEach(function(t){
    var card = document.createElement('div'); card.className='hcard';
    var d = new Date(t.date).toLocaleTimeString('fr-FR',{hour:'2-digit',minute:'2-digit'});
    card.innerHTML = '<div class="hc-num">#'+t.num+'</div>'
      + '<div class="hc-info"><div class="hc-date">🕐 '+d+'</div>'
      + '<div class="hc-items">'+(t.name||'Ticket sans nom')+' — '+(t.items.length)+' article(s)</div></div>'
      + '<div class="hc-tot">'+fmt(t.items.reduce(function(a,i){return a+i.price*i.qty;},0))+'</div>';
    var btnL = document.createElement('button'); btnL.className='abt'; btnL.textContent='📂 Charger';
    (function(tid){ btnL.onclick = function(){
      var tk = (S.tickets||[]).find(function(x){return x.id===tid;});
      if(!tk) return;
      S.cart = tk.items.slice();
      S.tickets = (S.tickets||[]).filter(function(x){return x.id!==tid;});
      save(); renderCart(); nav('vente'); notif('📂 Ticket chargé dans le panier','ok');
    };})(t.id);
    var btnD = document.createElement('button'); btnD.className='abt del'; btnD.textContent='🗑️';
    (function(tid){ btnD.onclick = function(){
      S.tickets = (S.tickets||[]).filter(function(x){return x.id!==tid;});
      save(); renderTickets(); notif('Ticket supprimé');
    };})(t.id);
    card.appendChild(btnL); card.appendChild(btnD);
    body.appendChild(card);
  });
}

function renderMonPlan(){
  var el = document.getElementById('monplanBody'); if(!el) return;
  var plan = S.settings.plan||'trial';
  var trialStart = new Date(S.settings.trialStart||Date.now());
  var trialDays = S.settings.trialDays||14;
  var elapsed = Math.floor((Date.now()-trialStart)/86400000);
  var remaining = Math.max(0, trialDays - elapsed);
  var isPrem = plan==='premium';
  var premDate = S.settings.premiumDate ? new Date(S.settings.premiumDate).toLocaleDateString('fr-FR') : '—';
  var pm = S.settings.priceMensuel||2500;
  var pa = S.settings.priceAnnuel||22000;
  el.innerHTML = '<div style="max-width:480px;margin:0 auto;">'
    + '<div class="kpi '+(isPrem?'bl':'or')+'" style="margin-bottom:16px;padding:20px;">'
    + '<div style="font-size:28px;margin-bottom:6px;">'+(isPrem?'⭐ Premium':'⏳ Essai gratuit')+'</div>'
    + '<div style="font-size:15px;font-weight:700;">'+(isPrem?'Actif depuis '+premDate:remaining+' jour(s) restant(s) sur '+trialDays)+'</div>'
    + '</div>'
    + (isPrem ? ''
      : '<div style="background:var(--bg);border:1px solid var(--border);border-radius:var(--r);padding:20px;margin-bottom:16px;">'
        + '<h3 style="margin-bottom:12px;">Passer Premium</h3>'
        + '<div style="display:flex;gap:10px;flex-wrap:wrap;">'
        + '<div class="plan-card sel" onclick="selPlanLocal(this,\'mensuel\')">'
        + '<div class="plan-title">Mensuel</div><div class="plan-price">'+pm+' HTG</div><div class="plan-per">/ mois</div></div>'
        + '<div class="plan-card" onclick="selPlanLocal(this,\'annuel\')">'
        + '<div class="plan-title">Annuel</div><div class="plan-price">'+pa+' HTG</div>'
        + '<div class="plan-per">/ an · économisez '+(pm*12-pa)+' HTG</div></div>'
        + '</div>'
        + '<button class="btn-g" style="margin-top:14px;width:100%" onclick="landingDoPremium()">⭐ Activer Premium</button>'
        + '</div>')
    + '</div>';
}

function renderBackupInfo(){
  var el = document.getElementById('backupBody'); if(!el) return;
  var sales = S.sales.length;
  var prods = S.products.length;
  var clients = (S.clients||[]).length;
  var size = JSON.stringify(S).length;
  el.innerHTML = '<div style="max-width:480px;margin:0 auto;">'
    + '<div class="kpi" style="margin-bottom:12px;"><div class="kpi-lbl">Ventes</div><div class="kpi-val">'+sales+'</div></div>'
    + '<div class="kpi" style="margin-bottom:12px;"><div class="kpi-lbl">Articles</div><div class="kpi-val">'+prods+'</div></div>'
    + '<div class="kpi" style="margin-bottom:12px;"><div class="kpi-lbl">Clients</div><div class="kpi-val">'+clients+'</div></div>'
    + '<div class="kpi" style="margin-bottom:16px;"><div class="kpi-lbl">Taille données</div><div class="kpi-val">'+Math.round(size/1024)+' KB</div></div>'
    + '<div style="display:flex;gap:10px;flex-wrap:wrap;">'
    + '<button class="btn-g" onclick="exportBackup()">💾 Exporter backup</button>'
    + '<button class="btn-o" onclick="document.getElementById(\'importFile\').click()">📂 Importer backup</button>'
    + '</div>'
    + '<input type="file" id="importFile" accept=".json" style="display:none" onchange="importBackup(this)">'
    + '</div>';
}

function renderSet(){
  var s = S.settings;
  var el = document.getElementById('settingsBody'); if(!el) return;
  function setV(id, val){ var e=document.getElementById(id); if(e) e.value=val; }
  function setC(id, val){ var e=document.getElementById(id); if(e) e.checked=val; }
  setV('set-biz', s.bizname||'');
  setV('set-cash', s.cashier||'');
  setV('set-cur', s.currency||'HTG');
  setV('set-tax', s.taxRate||0);
  setV('set-sector', s.sector||'marche');
  var tog = function(id, key){ var e=document.getElementById(id); if(e){ e.classList.toggle('on', !!s[key]); } };
  tog('tog-rec','showReceipt'); tog('tog-tax','taxEnabled');
  tog('tog-dk','darkMode'); tog('tog-snd','soundEnabled');
  tog('tog-autop','autoPrint');
  // Pèmisyon propriétaire
  var ownerSec = document.getElementById('owner-sec');
  if(ownerSec) ownerSec.style.display = can('settings') ? '' : 'none';
}

function selPlanLocal(el, plan){
  document.querySelectorAll('.plan-card').forEach(function(c){ c.classList.remove('sel'); });
  el.classList.add('sel');
  S.selectedPlan = plan;
}


// ══════════════════════════════════════════════════════════════════
// SISTÈM ALÈT STOCK — 3 NIvo
// 1. Notifikasyon navigatè (Push)
// 2. Bouton WhatsApp direkteman
// 3. Badge wouj + panel nan Back Office
// ══════════════════════════════════════════════════════════════════

// ── Kle pou pa voye menm alèt 2 fwa ──
var STOCK_ALERT_SENT = {};

function checkLowStockNotif(){
  if(!S.products || !S.products.length) return;

  // Jwenn atik ki ba oswa vid (pa 999=illimité)
  var epuise  = S.products.filter(function(p){ return p.stock !== 999 && p.stock === 0; });
  var bas     = S.products.filter(function(p){ return p.stock !== 999 && p.stock > 0 && p.stock <= (p.lowStock||5); });
  var total   = epuise.length + bas.length;

  if(!total) return;

  // ── NIvo 3: Badge wouj nan Back Office btn ──
  updateStockBadge(epuise.length, bas.length);

  // ── NIvo 3: Panel alèt nan BO (si ouvert) ──
  updateBOStockPanel(epuise, bas);

  // ── NIvo 1: Notif navigatè ──
  var alertKey = epuise.map(function(p){return p.id;}).join(',') + bas.map(function(p){return p.id;}).join(',');
  if(STOCK_ALERT_SENT[alertKey]) return; // pa voye 2 fwa menm alèt
  STOCK_ALERT_SENT[alertKey] = true;

  if('Notification' in window && Notification.permission === 'granted'){
    var msg = '';
    if(epuise.length) msg += epuise.length + ' article(s) ÉPUISÉ(S): ' + epuise.map(function(p){return p.name;}).slice(0,3).join(', ');
    if(bas.length)    msg += (msg?' · ':'' ) + bas.length + ' article(s) stock bas: ' + bas.map(function(p){return p.name+' ('+p.stock+' restant)';}).slice(0,3).join(', ');

    try {
      new Notification('⚠️ Konektem — Alèt Stock', {
        body: msg,
        icon: '/manifest-icon.png',
        badge: '/manifest-icon.png',
        tag: 'stock-alert',
        requireInteraction: true  // Rete jiskaske moun a li
      });
    } catch(e) {}
  }

  // ── NIvo 1b: Voye notif via Service Worker (fonksyone lè app fèmen) ──
  if('serviceWorker' in navigator && navigator.serviceWorker.controller){
    navigator.serviceWorker.controller.postMessage({
      type: 'STOCK_ALERT',
      epuise: epuise.map(function(p){return p.name;}),
      bas: bas.map(function(p){return p.name + ' (' + p.stock + ')';})
    });
  }
}

// ── Badge wouj sou bouton Back Office ──
function updateStockBadge(nEpuise, nBas){
  var boBtn = document.getElementById('bo-btn');
  if(!boBtn) return;

  // Retire vye badge
  var old = document.getElementById('stock-badge');
  if(old) old.remove();

  if(!nEpuise && !nBas) return;

  var badge = document.createElement('div');
  badge.id = 'stock-badge';
  badge.style.cssText = 'position:absolute;top:-6px;right:-6px;min-width:18px;height:18px;'
    + 'background:#ef4444;color:#fff;border-radius:10px;font-size:10px;font-weight:800;'
    + 'display:flex;align-items:center;justify-content:center;padding:0 4px;'
    + 'box-shadow:0 2px 6px rgba(239,68,68,.5);border:2px solid var(--bg);z-index:10;';
  badge.textContent = nEpuise + nBas;
  badge.title = nEpuise + ' épuisé(s), ' + nBas + ' stock bas';

  boBtn.style.position = 'relative';
  boBtn.appendChild(badge);
}

// ── Panel stock alèt nan Back Office ──
function updateBOStockPanel(epuise, bas){
  var panel = document.getElementById('bo-stock-alert');
  if(!panel) return;

  if(!epuise.length && !bas.length){
    panel.style.display = 'none';
    return;
  }

  panel.style.display = 'block';
  var html = '';

  if(epuise.length){
    html += '<div style="margin-bottom:10px;">'
      + '<div style="font-size:12px;font-weight:800;color:#ef4444;margin-bottom:6px;">🔴 ÉPUISÉ — ' + epuise.length + ' article(s)</div>'
      + epuise.map(function(p){
          return '<div style="display:flex;justify-content:space-between;align-items:center;padding:6px 10px;'
            + 'background:rgba(239,68,68,.08);border:1px solid rgba(239,68,68,.2);border-radius:6px;margin-bottom:4px;">'
            + '<span style="font-size:13px;font-weight:600;">' + p.name + '</span>'
            + '<span style="font-size:11px;color:#ef4444;font-weight:800;">Stock: 0</span></div>';
        }).join('')
      + '</div>';
  }

  if(bas.length){
    html += '<div>'
      + '<div style="font-size:12px;font-weight:800;color:#f59e0b;margin-bottom:6px;">🟡 STOCK BAS — ' + bas.length + ' article(s)</div>'
      + bas.map(function(p){
          var pct = Math.round((p.stock / Math.max(p.lowStock * 2, 1)) * 100);
          return '<div style="display:flex;justify-content:space-between;align-items:center;padding:6px 10px;'
            + 'background:rgba(245,158,11,.08);border:1px solid rgba(245,158,11,.2);border-radius:6px;margin-bottom:4px;">'
            + '<div><span style="font-size:13px;font-weight:600;">' + p.name + '</span>'
            + '<div style="margin-top:3px;height:4px;background:rgba(255,255,255,.1);border-radius:2px;width:100px;">'
            + '<div style="height:4px;background:#f59e0b;border-radius:2px;width:' + Math.min(pct,100) + '%;"></div></div></div>'
            + '<span style="font-size:12px;color:#f59e0b;font-weight:800;">' + p.stock + ' / min ' + (p.lowStock||5) + '</span></div>';
        }).join('')
      + '</div>';
  }

  // Bouton WhatsApp
  html += buildStockWhatsApp(epuise, bas);

  panel.innerHTML = html;
}

// ── Bouton WhatsApp pou voye alèt stock ──
function buildStockWhatsApp(epuise, bas){
  var bizname = S.settings.bizname || 'Boutique';
  var now = new Date().toLocaleDateString('fr-FR') + ' ' + new Date().toLocaleTimeString('fr-FR',{hour:'2-digit',minute:'2-digit'});
  var msg = '⚠️ *ALÈT STOCK — ' + bizname.toUpperCase() + '*\n';
  msg += '📅 ' + now + '\n\n';

  if(epuise.length){
    msg += '🔴 *ÉPUISÉ (' + epuise.length + ' atik):*\n';
    epuise.forEach(function(p){ msg += '  • ' + p.name + ' → STOCK = 0\n'; });
    msg += '\n';
  }
  if(bas.length){
    msg += '🟡 *STOCK BAS (' + bas.length + ' atik):*\n';
    bas.forEach(function(p){ msg += '  • ' + p.name + ' → ' + p.stock + ' restant (min: ' + (p.lowStock||5) + ')\n'; });
    msg += '\n';
  }

  msg += '👉 Konekte sou Konektem pou renouvle stock yo.';

  var waUrl = 'https://wa.me/' + (WHATSAPP_NUM||'50948868964') + '?text=' + encodeURIComponent(msg);

  return '<a href="' + waUrl + '" target="_blank" style="display:flex;align-items:center;gap:8px;'
    + 'margin-top:12px;padding:10px 16px;background:#25D366;border-radius:8px;color:#fff;'
    + 'font-weight:800;font-size:13px;text-decoration:none;justify-content:center;">'
    + '📲 Voye alèt stock sou WhatsApp</a>';
}

// ── Mete a jou alèt chak fwa yon vant fèt ──
function checkStockAfterSale(){
  var epuise = S.products.filter(function(p){ return p.stock !== 999 && p.stock === 0; });
  var bas    = S.products.filter(function(p){ return p.stock !== 999 && p.stock > 0 && p.stock <= (p.lowStock||5); });

  // Reset key pou alèt ka revoye si nouvo atik epuize
  STOCK_ALERT_SENT = {};

  updateStockBadge(epuise.length, bas.length);
  updateBOStockPanel(epuise, bas);

  // Notif navigatè pou atik ki fenk vin vid
  if(epuise.length || bas.length){
    checkLowStockNotif();
  }
}

// ── Verifikasyon peryodik chak 5 minit ──
setInterval(function(){
  if(document.visibilityState === 'visible' && S.products){
    checkLowStockNotif();
  }
}, 5 * 60 * 1000);

