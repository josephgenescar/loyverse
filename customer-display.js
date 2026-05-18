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
        alert('✅ Ekran kliyan louve avèk siksè!');
        
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
    alert('🔄 Ap louvri ekran kliyan nan yon nouvo fenèt...');
    try {
      // Louvri yon nouvo fenèt/pwojèksyon
      var width = 800;
      var height = 600;
      var left = (window.screen.width - width) / 2;
      var top = (window.screen.height - height) / 2;
      
      console.log('[CustomerDisplay] Ap louvri fenèt fallback...');
      fallbackWindow = window.open(
        window.location.href + '?customer-display=true',
        'KonektemCustomerDisplay',
        'width=' + width + ',height=' + height + ',left=' + left + ',top=' + top + ',resizable=yes,scrollbars=yes'
      );

      if (fallbackWindow) {
        customerDisplay.isEnabled = true;
        customerDisplay.displayWindow = fallbackWindow;
        console.log('[CustomerDisplay] Fallback fenèt louve avèk siksè');
        alert('✅ Ekran kliyan louve nan yon nouvo fenèt!\n\nOu ka deplase fenèt sa sou dezyèm ekran ou.');
        
        // Koute si fenèt fèmen
        var checkClosed = setInterval(function() {
          if (fallbackWindow.closed) {
            clearInterval(checkClosed);
            customerDisplay.isEnabled = false;
            customerDisplay.displayWindow = null;
            console.log('[CustomerDisplay] Fallback fenèt fèmen');
          }
        }, 1000);

        // Ekri konteni inisyal la
        setTimeout(function() { updateCustomerDisplay(); }, 500);
        return true;
      } else {
        alert('⚠️ Pa ka louvri nouvo fenèt. Verifye ou pa gen blokè pop-up aktive.');
        return false;
      }
    } catch (error) {
      alert('❌ Erè lè louvri fenèt: ' + error.message);
      return false;
    }
  }

  // ═══════════════════════════════════════════════════════════════
  // JENERE HTML POU EKRAN KLIYAN
  // ═══════════════════════════════════════════════════════════════
  
  function generateCustomerDisplayHTML() {
    var cart = window.S ? window.S.cart : [];
    var settings = window.S ? window.S.settings : {};
    var currency = settings.currency || 'HTG';
    
    // Kalkile total
    var subtotal = cart.reduce(function(a, x) { return a + (x.price * x.qty); }, 0);
    var discountPercent = parseFloat(document.getElementById('discInp')?.value || 0);
    var discount = subtotal * (discountPercent / 100);
    var taxRate = parseFloat(settings.tax || 0);
    var tax = (subtotal - discount) * (taxRate / 100);
    var total = subtotal - discount + tax;
    
    // Fonksyon pou fòma pri
    var fmtPrice = function(n) {
      return Number(n).toLocaleString('fr-HT') + ' ' + currency;
    };

    // Jenere lis atik yo
    var itemsHTML = '';
    if (cart.length === 0) {
      itemsHTML = '<div class="cd-empty"><div style="font-size:48px;margin-bottom:16px;">🛒</div><div style="font-size:18px;">Panier vide</div></div>';
    } else {
      itemsHTML = cart.map(function(item) {
        var itemTotal = item.price * item.qty;
        var emoji = item.img ? '<img src="' + item.img + '" style="width:40px;height:40px;object-fit:cover;border-radius:8px;">' 
                  : getEmoji(item.category, settings.sector);
        return '<div class="cd-item">' +
          '<div class="cd-item-emoji">' + emoji + '</div>' +
          '<div class="cd-item-info">' +
            '<div class="cd-item-name">' + item.name + '</div>' +
            '<div class="cd-item-qty">' + item.qty + ' x ' + fmtPrice(item.price) + '</div>' +
          '</div>' +
          '<div class="cd-item-total">' + fmtPrice(itemTotal) + '</div>' +
        '</div>';
      }).join('');
    }

    // HTML konplè ekran kliyan
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
          '.cd-content{flex:1;padding:30px;overflow-y:auto;}' +
          '.cd-empty{text-align:center;padding:60px 20px;color:rgba(255,255,255,.5);}' +
          '.cd-item{display:flex;align-items:center;gap:16px;padding:16px;background:rgba(255,255,255,.06);border-radius:12px;margin-bottom:12px;border:1px solid rgba(255,255,255,.1);}' +
          '.cd-item-emoji{width:50px;height:50px;display:flex;align-items:center;justify-content:center;font-size:28px;background:rgba(255,255,255,.1);border-radius:10px;flex-shrink:0;}' +
          '.cd-item-emoji img{width:100%;height:100%;border-radius:8px;}' +
          '.cd-item-info{flex:1;}' +
          '.cd-item-name{font-size:16px;font-weight:700;margin-bottom:4px;}' +
          '.cd-item-qty{font-size:14px;color:rgba(255,255,255,.6);}' +
          '.cd-item-total{font-size:18px;font-weight:800;color:#86efac;}' +
          '.cd-footer{background:rgba(0,0,0,.3);padding:25px 30px;border-top:1px solid rgba(255,255,255,.1);}' +
          '.cd-row{display:flex;justify-content:space-between;margin-bottom:8px;font-size:15px;}' +
          '.cd-row.total{font-size:22px;font-weight:800;color:#86efac;margin-top:16px;padding-top:16px;border-top:1px solid rgba(255,255,255,.2);}' +
          '.cd-label{color:rgba(255,255,255,.7);}' +
          '.cd-value{font-weight:600;}' +
        '</style>' +
      '</head>' +
      '<body>' +
        '<div class="cd-header">' +
          '<div class="cd-logo">Konekte<span>m</span></div>' +
        '</div>' +
        '<div class="cd-content">' +
          itemsHTML +
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
      // Nou nan ekran kliyan - koute mesaj
      window.addEventListener('message', function(event) {
        if (event.data && event.data.type === 'UPDATE_DISPLAY') {
          document.documentElement.innerHTML = event.data.html;
        }
      });
      
      // Ekran an kòmanse ak yon mesaj
      document.body.innerHTML = '<div style="display:flex;align-items:center;justify-content:center;height:100vh;font-family:sans-serif;color:#fff;background:linear-gradient(135deg,#0D1F2D,#0B3D2E);"><div style="text-align:center;"><div style="font-size:48px;margin-bottom:16px;">📺</div><div style="font-size:18px;">Ekran kliyan Konektem</div><div style="font-size:14px;color:rgba(255,255,255,.5);margin-top:8px;">Tann konèksyon...</div></div></div>';
    }
  }

  // ═══════════════════════════════════════════════════════════════
  // HOOK NAN RENDER CART (san modifye orijinal la)
  // ═══════════════════════════════════════════════════════════════
  
  function hookIntoRenderCart() {
    // Tann jiska renderCart defini
    var checkInterval = setInterval(function() {
      if (typeof window.renderCart === 'function') {
        clearInterval(checkInterval);
        
        // Anrejistre fonksyon orijinal la
        var originalRenderCart = window.renderCart;
        
        // Kree nouvo renderCart ki rele orijinal la epi mete ajou ekran kliyan
        window.renderCart = function() {
          // Rele orijinal la
          var result = originalRenderCart.apply(this, arguments);
          
          // Mete ajou ekran kliyan (si aktif)
          try {
            updateCustomerDisplay();
          } catch (e) {
            console.warn('[CustomerDisplay] Erè nan updateCustomerDisplay:', e.message);
          }
          
          return result;
        };
        
        console.log('[CustomerDisplay] Hook nan renderCart reyisi');
      }
    }, 100);
    
    // Si pa jwenn apre 5 segonn, sispann
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
      hookIntoRenderCart();
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
