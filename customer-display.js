// ═══════════════════════════════════════════════════════════════
// EKRAN KLIYAN (2e EKRAN) - MODIL SEPARÉ
// ═══════════════════════════════════════════════════════════════
// Modil sa a pèmèt afiche panier ak total sou yon dezyèm ekran
// pou kliyan yo ka wè sa yo achte.
// 
// Sekirite: Si Display API pa disponib oswa echwe, sistèm prensipal la
// kontinye travay san pwoblèm.
// ═══════════════════════════════════════════════════════════════

(function() {
  'use strict';
  
  var customerDisplay = {
    displayWindow: null,
    isEnabled: false,
    lastCartData: null
  };

  // ═══════════════════════════════════════════════════════════════
  // INISYALIZASYON DISPLAY API
  // ═══════════════════════════════════════════════════════════════
  
  var fallbackWindow = null;
  var CUSTOMER_SYNC_KEY = 'konektem_customer_sync';
  var CUSTOMER_ACTION_KEY = 'konektem_customer_action';
  var pendingCustomerSelections = [];
  window.__customerDisplayVersion = '202607051300';

  function renderCustomerDisplayView() {
    try {
      var html = generateCustomerDisplayHTML();
      document.documentElement.innerHTML = html;
    } catch (error) {
      console.warn('[CustomerDisplay] Erreur lors du rendu local:', error.message);
    }
  }

  function applyCustomerSelectionToLocalDisplay(productId) {
    if (!productId) return;

    var sharedState = readSharedCustomerState();
    var customerCart = Array.isArray(sharedState.customerCart) ? sharedState.customerCart.slice() : [];
    var products = Array.isArray(sharedState.products) ? sharedState.products : [];
    var product = products.find(function(item) { return String(item.id) === String(productId); });
    var existing = customerCart.find(function(item) { return String(item.id) === String(productId); });

    if (existing) {
      existing.qty += 1;
    } else {
      var item = product ? Object.assign({}, product, { qty: 1 }) : { id: productId, name: productId, price: 0, qty: 1 };
      customerCart.push(item);
    }

    sharedState.customerCart = customerCart;
    sharedState.timestamp = Date.now();
    try { localStorage.setItem(CUSTOMER_SYNC_KEY, JSON.stringify(sharedState)); } catch (error) {}
    renderCustomerDisplayView();
  }

  function handleCustomerSelection(productId) {
    if (!productId) return;

    var isCustomerPage = new URLSearchParams(window.location.search).get('customer-display') === 'true';
    if (isCustomerPage) {
      applyCustomerSelectionToLocalDisplay(productId);
      dispatchCustomerSelection(productId);
      return;
    }

    if (typeof window.addCart === 'function') {
      window.addCart(productId);
      writeSharedCustomerState();
    } else {
      queueCustomerSelection(productId);
    }
  }

  window.selectCustomerProduct = function(productId) {
    if (!productId) return;
    handleCustomerSelection(productId);
  };

  function escapeHtml(text) {
    return String(text == null ? '' : text)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  function getCustomerMessageChannel() {
    if (window.__customerDisplayChannel) return window.__customerDisplayChannel;
    try {
      window.__customerDisplayChannel = new BroadcastChannel('konektem-customer-display');
    } catch (error) {
      console.warn('[CustomerDisplay] BroadcastChannel indisponible:', error.message);
    }
    return window.__customerDisplayChannel;
  }

  function readSharedCustomerState() {
    try {
      return JSON.parse(localStorage.getItem(CUSTOMER_SYNC_KEY) || '{}');
    } catch (error) {
      return {};
    }
  }

  function writeSharedCustomerState() {
    try {
      var existingState = readSharedCustomerState();
      var state = Object.assign({}, existingState, {
        cart: window.S ? (window.S.cart || []) : [],
        products: window.S ? (window.S.products || []) : [],
        settings: window.S ? window.S.settings : {},
        timestamp: Date.now()
      });
      localStorage.setItem(CUSTOMER_SYNC_KEY, JSON.stringify(state));
      return state;
    } catch (error) {
      return null;
    }
  }

  function dispatchCustomerSelection(productId) {
    if (!productId) return;
    var payload = { type: 'CUSTOMER_SELECT_PRODUCT', productId: productId };
    try {
      localStorage.setItem(CUSTOMER_ACTION_KEY, JSON.stringify({ productId: productId, timestamp: Date.now() }));
    } catch (error) {}
    try {
      if (window.opener && window.opener !== window) {
        window.opener.postMessage(payload, '*');
      }
    } catch (error) {
      console.warn('[CustomerDisplay] Impossible d’envoyer au parent:', error.message);
    }
    try {
      var channel = getCustomerMessageChannel();
      if (channel) channel.postMessage(payload);
    } catch (error) {
      console.warn('[CustomerDisplay] Impossible d’envoyer via BroadcastChannel:', error.message);
    }
  }

  function queueCustomerSelection(productId) {
    if (!productId) return;
    pendingCustomerSelections.push(productId);
    if (window.__customerSelectionProcessor) return;
    window.__customerSelectionProcessor = setInterval(function() {
      if (!pendingCustomerSelections.length) return;
      if (typeof window.addCart === 'function') {
        var nextId = pendingCustomerSelections.shift();
        window.addCart(nextId);
        writeSharedCustomerState();
      }
    }, 200);
  }

  async function initCustomerDisplay() {
    try {
      // Verify si Display API disponib
      if (!navigator.presentation || !navigator.presentation.request) {
        console.log('[CustomerDisplay] Display API pa disponib, itilize fallback (nouvo fenèt)');
        return openFallbackWindow();
      }

      // Demann ekran disponib
      console.log('[CustomerDisplay] Ap demann ekran...');
      customerDisplay.displayWindow = await navigator.presentation.request({
        url: window.location.href + '?customer-display=true',
        presentationStyle: 'fullscreen'
      });

      if (customerDisplay.displayWindow) {
        customerDisplay.isEnabled = true;
        console.log('[CustomerDisplay] Ekran kliyan konekte avèk siksè');
        
        // Koute si ekran fèmen
        customerDisplay.displayWindow.addEventListener('terminate', function() {
          console.log('[CustomerDisplay] Ekran kliyan dekonekte');
          customerDisplay.isEnabled = false;
          customerDisplay.displayWindow = null;
        });

        // Ekri konteni inisyal la
        updateCustomerDisplay();
        return true;
      } else {
        console.log('[CustomerDisplay] Display API echwe, itilize fallback');
        return openFallbackWindow();
      }
    } catch (error) {
      console.warn('[CustomerDisplay] Erè lè louvri ekran kliyan:', error.message);
      console.log('[CustomerDisplay] Itilize fallback olye de');
      return openFallbackWindow();
    }
  }

  function openFallbackWindow() {
    try {
      var width = 800;
      var height = 600;
      var left = (window.screen.width - width) / 2;
      var top = (window.screen.height - height) / 2;
      var customerUrl = window.location.href.split('?')[0] + '?customer-display=true';
      
      console.log('[CustomerDisplay] Ap louvri fenèt fallback...');
      fallbackWindow = window.open(
        customerUrl,
        '_blank',
        'width=' + width + ',height=' + height + ',left=' + left + ',top=' + top + ',resizable=yes,scrollbars=yes,noopener,noreferrer'
      );

      if (fallbackWindow) {
        customerDisplay.isEnabled = true;
        customerDisplay.displayWindow = fallbackWindow;
        console.log('[CustomerDisplay] Fallback fenèt louve avèk siksè');
        
        var checkClosed = setInterval(function() {
          if (fallbackWindow.closed) {
            clearInterval(checkClosed);
            customerDisplay.isEnabled = false;
            customerDisplay.displayWindow = null;
            console.log('[CustomerDisplay] Fallback fenèt fèmen');
          }
        }, 1000);

        setTimeout(function() { updateCustomerDisplay(); }, 500);
        return true;
      }

      console.warn('[CustomerDisplay] Fenèt blokè; ouvri ekran an nan yon nouvo onglet');
      window.location.assign(customerUrl);
      return true;
    } catch (error) {
      console.warn('[CustomerDisplay] Erè lè louvri fenèt:', error.message);
      try { window.location.assign(window.location.href.split('?')[0] + '?customer-display=true'); } catch (e) {}
      return false;
    }
  }

  // ═══════════════════════════════════════════════════════════════
  // JENERE HTML POU EKRAN KLIYAN
  // ═══════════════════════════════════════════════════════════════
  
  function generateCustomerDisplayHTML() {
    var sharedState = readSharedCustomerState();
    var cart = Array.isArray(sharedState.customerCart) ? sharedState.customerCart : (Array.isArray(sharedState.cart) ? sharedState.cart : (window.S ? (window.S.cart || []) : []));
    var products = sharedState.products || (window.S ? (window.S.products || []) : []);
    var settings = sharedState.settings || (window.S ? window.S.settings : {});
    var currency = settings.currency || 'USD';

    var subtotal = cart.reduce(function(a, x) { return a + (x.price * x.qty); }, 0);
    var discountPercent = parseFloat((document.getElementById('discInp') && document.getElementById('discInp').value) || 0);
    var discount = subtotal * (discountPercent / 100);
    var taxRate = parseFloat(settings.tax || 0);
    var tax = (subtotal - discount) * (taxRate / 100);
    var total = subtotal - discount + tax;

    var fmtPrice = function(n) {
      return Number(n).toLocaleString('fr-HT') + ' ' + currency;
    };

    var cartItemsHTML = '';
    if (cart.length === 0) {
      cartItemsHTML = '<div class="cd-empty"><div style="font-size:48px;margin-bottom:16px;">🛒</div><div style="font-size:18px;">Panier vide</div></div>';
    } else {
      cartItemsHTML = cart.map(function(item) {
        var itemTotal = item.price * item.qty;
        var emoji = item.img ? '<img src="' + item.img + '" style="width:40px;height:40px;object-fit:cover;border-radius:8px;">' 
                  : getEmoji(item.category, settings.sector);
        return '<div class="cd-item">' +
          '<div class="cd-item-emoji">' + emoji + '</div>' +
          '<div class="cd-item-info">' +
            '<div class="cd-item-name">' + escapeHtml(item.name) + '</div>' +
            '<div class="cd-item-qty">' + item.qty + ' x ' + fmtPrice(item.price) + '</div>' +
          '</div>' +
          '<div class="cd-item-total">' + fmtPrice(itemTotal) + '</div>' +
        '</div>';
      }).join('');
    }

    var productsHTML = '';
    if (!products.length) {
      productsHTML = '<div class="cd-empty" style="padding:18px 0 0;">Aucun produit disponible pour l’instant.</div>';
    } else {
      productsHTML = products.map(function(product) {
        var safeId = String(product.id || '').replace(/'/g, "\\'");
        var qtyInCart = 0;
        var cartItem = cart.find(function(item) { return item.id === product.id; });
        if (cartItem) qtyInCart = cartItem.qty;
        var isOut = product.stock === 0;
        var stockText = product.stock === 999 ? 'Disponible' : product.stock === 0 ? 'Épuisé' : 'Stock: ' + product.stock;
        var emoji = product.img ? '<img src="' + product.img + '" alt="' + escapeHtml(product.name) + '" />' : '<span>' + getEmoji(product.category, settings.sector) + '</span>';
        return '<div class="cd-product-card">' +
          '<div class="cd-product-image">' + emoji + '</div>' +
          '<div class="cd-product-info">' +
            '<div class="cd-product-name">' + escapeHtml(product.name) + '</div>' +
            '<div class="cd-product-meta">' + escapeHtml(product.category || '') + '</div>' +
            '<div class="cd-product-price">' + fmtPrice(product.price) + '</div>' +
            '<div class="cd-product-stock">' + escapeHtml(stockText) + '</div>' +
          '</div>' +
          '<button class="cd-product-btn' + (isOut ? ' disabled' : '') + '" ' + (isOut ? 'disabled' : '') + ' type="button" data-customer-product-btn="true" data-product-id="' + escapeHtml(safeId) + '">' + (isOut ? 'Épuisé' : (qtyInCart ? 'Ajouté (' + qtyInCart + ')' : 'Choisir')) + '</button>' +
        '</div>';
      }).join('');
    }

    return '<!DOCTYPE html>' +
      '<html lang="fr">' +
      '<head>' +
        '<meta charset="UTF-8">' +
        '<meta name="viewport" content="width=device-width, initial-scale=1.0">' +
        '<title>Konektem - Client</title>' +
        '<style>' +
          '*{margin:0;padding:0;box-sizing:border-box;}' +
          'body{font-family:"Plus Jakarta Sans",sans-serif;background:linear-gradient(135deg,#0D1F2D,#0B3D2E);color:#fff;min-height:100vh;display:flex;flex-direction:column;}' +
          '.cd-header{background:rgba(34,197,94,.9);padding:20px 30px;text-align:center;}' +
          '.cd-logo{font-family:Syne,sans-serif;font-size:28px;font-weight:800;letter-spacing:-0.5px;}' +
          '.cd-logo span{color:#86efac;}' +
          '.cd-content{flex:1;padding:24px 24px 16px;overflow-y:auto;display:grid;gap:18px;}' +
          '.cd-section{background:rgba(255,255,255,.06);border:1px solid rgba(255,255,255,.12);border-radius:16px;padding:16px;}' +
          '.cd-section-title{font-size:16px;font-weight:800;margin-bottom:10px;color:#86efac;}' +
          '.cd-empty{text-align:center;padding:28px 20px;color:rgba(255,255,255,.5);}' +
          '.cd-product-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(210px,1fr));gap:12px;}' +
          '.cd-product-card{display:flex;flex-direction:column;gap:10px;padding:12px;background:rgba(255,255,255,.06);border-radius:12px;border:1px solid rgba(255,255,255,.1);}' +
          '.cd-product-image{width:100%;height:88px;border-radius:10px;background:rgba(255,255,255,.1);display:flex;align-items:center;justify-content:center;font-size:30px;overflow:hidden;}' +
          '.cd-product-image img{width:100%;height:100%;object-fit:cover;}' +
          '.cd-product-info{display:flex;flex-direction:column;gap:3px;}' +
          '.cd-product-name{font-size:15px;font-weight:700;line-height:1.25;}' +
          '.cd-product-meta{font-size:12px;color:rgba(255,255,255,.6);}' +
          '.cd-product-price{font-size:16px;font-weight:800;color:#86efac;}' +
          '.cd-product-stock{font-size:11px;color:rgba(255,255,255,.55);}' +
          '.cd-product-btn{border:none;border-radius:10px;padding:9px 10px;background:linear-gradient(135deg,#22c55e,#16a34a);color:#fff;font-weight:800;cursor:pointer;font-family:inherit;}' +
          '.cd-product-btn.disabled{opacity:.55;cursor:not-allowed;background:#64748b;}' +
          '.cd-item{display:flex;align-items:center;gap:16px;padding:12px;background:rgba(255,255,255,.06);border-radius:12px;margin-bottom:10px;border:1px solid rgba(255,255,255,.1);}' +
          '.cd-item-emoji{width:44px;height:44px;display:flex;align-items:center;justify-content:center;font-size:24px;background:rgba(255,255,255,.1);border-radius:10px;flex-shrink:0;}' +
          '.cd-item-emoji img{width:100%;height:100%;border-radius:8px;}' +
          '.cd-item-info{flex:1;}' +
          '.cd-item-name{font-size:15px;font-weight:700;margin-bottom:4px;}' +
          '.cd-item-qty{font-size:13px;color:rgba(255,255,255,.6);}' +
          '.cd-item-total{font-size:16px;font-weight:800;color:#86efac;}' +
          '.cd-footer{background:rgba(0,0,0,.3);padding:20px 24px;border-top:1px solid rgba(255,255,255,.1);}' +
          '.cd-row{display:flex;justify-content:space-between;margin-bottom:8px;font-size:15px;}' +
          '.cd-row.total{font-size:22px;font-weight:800;color:#86efac;margin-top:16px;padding-top:16px;border-top:1px solid rgba(255,255,255,.2);}' +
          '.cd-label{color:rgba(255,255,255,.7);}' +
          '.cd-value{font-weight:600;}' +
          '@media (max-width:700px){.cd-content{padding:16px 14px 12px;}.cd-section{padding:13px;}.cd-product-grid{grid-template-columns:1fr;}}' +
        '</style>' +
      '</head>' +
      '<body>' +
        '<div class="cd-header">' +
          '<div class="cd-logo">Konekte<span>m</span></div>' +
          '<div style="margin-top:8px;font-size:14px;color:rgba(255,255,255,.8);">Choisissez vos produits et envoyez-les à la caisse</div>' +
        '</div>' +
        '<div class="cd-content">' +
          '<div class="cd-section">' +
            '<div class="cd-section-title">Produits disponibles</div>' +
            '<div class="cd-product-grid">' + productsHTML + '</div>' +
          '</div>' +
          '<div class="cd-section">' +
            '<div class="cd-section-title">Votre sélection</div>' +
            cartItemsHTML +
          '</div>' +
        '</div>' +
        '<div class="cd-footer">' +
          '<div class="cd-row"><span class="cd-label">Sous-total</span><span class="cd-value">' + fmtPrice(subtotal) + '</span></div>' +
          (discount > 0 ? '<div class="cd-row"><span class="cd-label">Remise (' + discountPercent + '%)</span><span class="cd-value">-' + fmtPrice(discount) + '</span></div>' : '') +
          (tax > 0 ? '<div class="cd-row"><span class="cd-label">Taxe (' + taxRate + '%)</span><span class="cd-value">' + fmtPrice(tax) + '</span></div>' : '') +
          '<div class="cd-row total"><span class="cd-label">TOTAL</span><span class="cd-value">' + fmtPrice(total) + '</span></div>' +
        '</div>' +
      '</body>' +
      '</html>';
  }

  // ═══════════════════════════════════════════════════════════════
  // METE A JOU EKRAN KLIYAN
  // ═══════════════════════════════════════════════════════════════
  
  function updateCustomerDisplay() {
    if (!customerDisplay.isEnabled || !customerDisplay.displayWindow) {
      return;
    }

    try {
      var html = generateCustomerDisplayHTML();
      customerDisplay.displayWindow.postMessage({
        type: 'UPDATE_DISPLAY',
        html: html
      }, '*');
    } catch (error) {
      console.warn('[CustomerDisplay] Erè lè mete ajou ekran:', error.message);
    }
  }

  // ═══════════════════════════════════════════════════════════════
  // KONFIGIRASYON EKRAN KLIYAN (si li nan mòd display)
  // ═══════════════════════════════════════════════════════════════
  
  function setupCustomerDisplayMode() {
    var urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get('customer-display') === 'true') {
      window.addEventListener('message', function(event) {
        if (event.data && event.data.type === 'UPDATE_DISPLAY') {
          document.documentElement.innerHTML = event.data.html;
        }
      });

      function renderInitialCustomerView() {
        renderCustomerDisplayView();
      }

      renderInitialCustomerView();
      document.addEventListener('click', function(event) {
        var button = event.target && event.target.closest ? event.target.closest('[data-customer-product-btn]') : null;
        if (!button) return;
        var productId = button.getAttribute('data-product-id');
        if (productId) {
          window.selectCustomerProduct(productId);
        }
      });

      window.addEventListener('load', renderInitialCustomerView);
      setTimeout(renderInitialCustomerView, 300);
      setInterval(renderInitialCustomerView, 2000);
    }
  }

  // ═══════════════════════════════════════════════════════════════
  // HOOK NAN RENDERERS POS (san modifye orijinal la)
  // ═══════════════════════════════════════════════════════════════
  
  function setupCustomerDisplayCommunication() {
    if (window.__customerDisplayCommunicationReady) return;
    window.__customerDisplayCommunicationReady = true;

    function handleCustomerSelection(productId) {
      if (!productId) return;
      if (typeof window.addCart === 'function') {
        window.addCart(productId);
        writeSharedCustomerState();
      } else {
        queueCustomerSelection(productId);
      }
    }

    window.addEventListener('message', function(event) {
      if (!event.data || event.data.type !== 'CUSTOMER_SELECT_PRODUCT') return;
      handleCustomerSelection(event.data.productId);
    });

    window.addEventListener('storage', function(event) {
      if (event.key !== CUSTOMER_ACTION_KEY) return;
      try {
        var payload = JSON.parse(event.newValue || '{}');
        handleCustomerSelection(payload.productId);
      } catch (error) {}
    });

    try {
      var channel = getCustomerMessageChannel();
      if (channel) {
        channel.addEventListener('message', function(event) {
          if (!event.data || event.data.type !== 'CUSTOMER_SELECT_PRODUCT') return;
          handleCustomerSelection(event.data.productId);
        });
      }
    } catch (error) {
      console.warn('[CustomerDisplay] Erè lè louvri channel:', error.message);
    }
  }

  function hookIntoPOSRenderers() {
    var checkInterval = setInterval(function() {
      var hasRenderCart = typeof window.renderCart === 'function';
      var hasRenderProds = typeof window.renderProds === 'function';
      if (hasRenderCart || hasRenderProds) {
        clearInterval(checkInterval);

        if (typeof window.renderCart === 'function') {
          var originalRenderCart = window.renderCart;
          window.renderCart = function() {
            var result = originalRenderCart.apply(this, arguments);
            try { writeSharedCustomerState(); updateCustomerDisplay(); } catch (e) { console.warn('[CustomerDisplay] Erè nan updateCustomerDisplay:', e.message); }
            return result;
          };
        }

        if (typeof window.renderProds === 'function') {
          var originalRenderProds = window.renderProds;
          window.renderProds = function() {
            var result = originalRenderProds.apply(this, arguments);
            try { writeSharedCustomerState(); updateCustomerDisplay(); } catch (e) { console.warn('[CustomerDisplay] Erè nan updateCustomerDisplay:', e.message); }
            return result;
          };
        }

        console.log('[CustomerDisplay] Hook nan renderers POS reyisi');
      }
    }, 100);

    setTimeout(function() {
      clearInterval(checkInterval);
    }, 5000);
  }

  // ═══════════════════════════════════════════════════════════════
  // AJOUTE BOUTON NAN UI POU LOUVRI EKRAN KLIYAN
  // ═══════════════════════════════════════════════════════════════
  
  function addCustomerDisplayButton() {
    var attempts = 0;
    var maxAttempts = 50; // 5 segonn
    
    var checkInterval = setInterval(function() {
      attempts++;
      
      // Esaye plizyèl selektè
      var topbar = document.querySelector('.tb-r') || 
                   document.querySelector('.topbar .tb-r') ||
                   document.querySelector('.topbar');
      
      if (topbar) {
        clearInterval(checkInterval);
        
        // Verify si bouton deja egziste
        if (document.querySelector('[data-customer-display-btn]')) {
          console.log('[CustomerDisplay] Bouton deja egziste');
          return;
        }
        
        var btn = document.createElement('button');
        btn.className = 'bo-btn';
        btn.setAttribute('data-customer-display-btn', 'true');
        btn.innerHTML = '📺 Écran Client';
        btn.title = 'Ouvrir écran client sur second moniteur';
        btn.style.cursor = 'pointer';
        btn.onclick = function() {
          console.log('[CustomerDisplay] Bouton klike!');
          initCustomerDisplay();
        };
        
        // Esaye ajoute nan kòmanse oswa nan fen
        if (topbar.firstChild) {
          topbar.insertBefore(btn, topbar.firstChild);
        } else {
          topbar.appendChild(btn);
        }
        
        console.log('[CustomerDisplay] Bouton ekran kliyan ajoute avèk siksè');
        return;
      }
      
      // Si pa jwenn apre maxAttempts
      if (attempts >= maxAttempts) {
        clearInterval(checkInterval);
        console.warn('[CustomerDisplay] Pa ka jwenn topbar pou ajoute bouton');
        // Kreye bouton flote kòm fallback
        createFloatingButton();
      }
    }, 100);
  }

  function createFloatingButton() {
    var btn = document.createElement('button');
    btn.setAttribute('data-customer-display-btn', 'true');
    btn.innerHTML = '📺';
    btn.style.cssText = 'position:fixed;bottom:20px;right:20px;width:50px;height:50px;border-radius:50%;background:#22c55e;color:#fff;border:none;font-size:20px;cursor:pointer;z-index:9999;box-shadow:0 4px 12px rgba(0,0,0,.3);';
    btn.title = 'Ouvrir écran client';
    btn.onclick = function() {
      console.log('[CustomerDisplay] Floating bouton klike!');
      initCustomerDisplay();
    };
    document.body.appendChild(btn);
    console.log('[CustomerDisplay] Floating bouton kreye');
  }

  // ═══════════════════════════════════════════════════════════════
  // ENISYALIZASYON
  // ═══════════════════════════════════════════════════════════════
  
  function init() {
    // Verify si nou nan mòd ekran kliyan
    setupCustomerDisplayMode();
    
    // Si nou nan mòd prensipal, ajoute bouton ak hook
    if (!new URLSearchParams(window.location.search).get('customer-display')) {
      setupCustomerDisplayCommunication();
      hookIntoPOSRenderers();
      addCustomerDisplayButton();
    }
  }

  // Kòmanse lè paj la chaje
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  // Ekspoz fonksyon pou lòt pat (opsyonèl)
  window.customerDisplayAPI = {
    init: initCustomerDisplay,
    update: updateCustomerDisplay,
    isEnabled: function() { return customerDisplay.isEnabled; }
  };

})();
