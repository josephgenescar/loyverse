// ═══════════════════════════════════════════════════════════════
// ENPRIMANT THERMIQUE - WebUSB/WebBluetooth
// ═══════════════════════════════════════════════════════════════
// Modul sa a pèmèt konekte ak enpriman thermal via USB/Bluetooth
// Li pran resi otomatik lè vant fin
// ═══════════════════════════════════════════════════════════════

(function() {
  'use strict';
  
  var thermalPrinter = {
    device: null,
    isEnabled: false,
    autoPrint: false
  };

  // ═══════════════════════════════════════════════════════════════
  // KONEKTE AVEC ENPRIMANT (WebUSB)
  // ═══════════════════════════════════════════════════════════════
  
  async function connectPrinter() {
    try {
      if (!navigator.usb) {
        alert('⚠️ WebUSB pa disponib sou navigatè sa a.\n\nNecesite Chrome/Edge.');
        return false;
      }

      // Demann pèmisyon ak konekte
      thermalPrinter.device = await navigator.usb.requestDevice({ 
        filters: [{ vendorId: 0x0456, productId: 0x0808 }] // EPSON TM-T88
      });

      if (thermalPrinter.device) {
        await thermalPrinter.device.open();
        await thermalPrinter.device.selectConfiguration(1);
        await thermalPrinter.device.claimInterface(0);
        
        thermalPrinter.isEnabled = true;
        console.log('[ThermalPrinter] Enprimant konekte');
        alert('✅ Enprimant konekte avèk siksè!');
        return true;
      }
    } catch (error) {
      console.warn('[ThermalPrinter] Erè koneksyon:', error.message);
      alert('❌ Erè lè konekte: ' + error.message);
      return false;
    }
    return false;
  }

  // ═══════════════════════════════════════════════════════════════
  // IMPRIME RESI
  // ═══════════════════════════════════════════════════════════════
  
  async function printReceipt(sale) {
    if (!thermalPrinter.isEnabled || !thermalPrinter.device) {
      console.log('[ThermalPrinter] Enprimant pa konekte');
      return false;
    }

    try {
      // Jenere konteni resi a
      var receipt = generateReceiptText(sale);
      
      // Voye nan enpriman
      await thermalPrinter.device.transferOut(1, new TextEncoder().encode(receipt));
      
      console.log('[ThermalPrinter] Resi imprime');
      return true;
    } catch (error) {
      console.error('[ThermalPrinter] Erè lè imprime:', error.message);
      return false;
    }
  }

  // ═══════════════════════════════════════════════════════════════
  // JENERE TEKS RESI
  // ═══════════════════════════════════════════════════════════════
  
  function generateReceiptText(sale) {
    var settings = window.S ? window.S.settings : {};
    var currency = settings.currency || 'USD';
    var bizname = settings.bizname || 'Konektem';
    
    var fmt = function(n) {
      return Number(n).toLocaleString('fr-HT') + ' ' + currency;
    };

    var text = '';
    
    // Header
    text += '\n' + ' '.repeat(16) + bizname + '\n';
    text += ' '.repeat(10) + new Date().toLocaleString('fr-FR') + '\n';
    text += '-'.repeat(32) + '\n\n';
    
    // Atik
    sale.items.forEach(function(item) {
      var name = item.name.substring(0, 20);
      var qty = item.qty.toString().padStart(2);
      var price = fmt(item.price).padStart(8);
      var total = fmt(item.price * item.qty).padStart(8);
      
      text += name + '\n';
      text += qty + ' x ' + price + ' = ' + total + '\n';
    });
    
    text += '-'.repeat(32) + '\n';
    
    // Total
    text += 'Sous-total:'.padEnd(20) + fmt(sale.subtotal) + '\n';
    if (sale.discount > 0) {
      text += 'Remise:'.padEnd(20) + '-' + fmt(sale.discount) + '\n';
    }
    if (sale.tax > 0) {
      text += 'Taxe:'.padEnd(20) + fmt(sale.tax) + '\n';
    }
    text += 'TOTAL:'.padEnd(20) + fmt(sale.total) + '\n';
    text += '-'.repeat(32) + '\n';
    
    // Peman
    text += 'Méthode: ' + sale.method + '\n';
    if (sale.montantRecu) {
      text += 'Reçu:'.padEnd(20) + fmt(sale.montantRecu) + '\n';
      text += 'Rendu:'.padEnd(20) + fmt(sale.rendu) + '\n';
    }
    
    text += '-'.repeat(32) + '\n';
    text += ' '.repeat(10) + settings.receiptmsg || 'Merci pour votre confiance !' + '\n';
    text += '\n\n\n';
    
    return text;
  }

  // ═══════════════════════════════════════════════════════════════
  // HOOK NAN CHECKOUT
  // ═══════════════════════════════════════════════════════════════
  
  function hookIntoCheckout() {
    var checkInterval = setInterval(function() {
      if (typeof window.checkout === 'function') {
        clearInterval(checkInterval);
        
        var originalCheckout = window.checkout;
        
        window.checkout = function(method, montantRecu, rendu, clientInfo) {
          // Rele orijinal la
          var result = originalCheckout.apply(this, arguments);
          
          // Imprime resi otomatik si enpriman konekte
          if (thermalPrinter.isEnabled) {
            // Tanne yon ti kras pou vente fin anrejistre
            setTimeout(function() {
              var lastSale = (window.S.sales || []).slice(-1)[0];
              if (lastSale) {
                printReceipt(lastSale);
              }
            }, 500);
          }
          
          return result;
        };
        
        console.log('[ThermalPrinter] Hook nan checkout reyisi - Imprime otomatik aktive');
      }
    }, 100);
    
    setTimeout(function() {
      clearInterval(checkInterval);
    }, 5000);
  }

  // ═══════════════════════════════════════════════════════════════
  // AJOUTE BOUTON KONTWÒL
  // ═══════════════════════════════════════════════════════════════
  
  function addPrinterControls() {
    var attempts = 0;
    var maxAttempts = 50;
    
    var checkInterval = setInterval(function() {
      attempts++;
      
      var topbar = document.querySelector('.tb-r') || 
                   document.querySelector('.topbar .tb-r') ||
                   document.querySelector('.topbar');
      
      if (topbar) {
        clearInterval(checkInterval);
        
        if (document.querySelector('[data-printer-btn]')) {
          console.log('[ThermalPrinter] Bouton deja egziste');
          return;
        }
        
        var btn = document.createElement('button');
        btn.className = 'bo-btn';
        btn.setAttribute('data-printer-btn', 'true');
        btn.innerHTML = '🖨️ Imprimante';
        btn.title = 'Connecter imprimante thermique';
        btn.style.cursor = 'pointer';
        btn.onclick = function() {
          connectPrinter();
        };
        
        if (topbar.firstChild) {
          topbar.insertBefore(btn, topbar.firstChild);
        } else {
          topbar.appendChild(btn);
        }
        
        console.log('[ThermalPrinter] Bouton ajoute');
        return;
      }
      
      if (attempts >= maxAttempts) {
        clearInterval(checkInterval);
      }
    }, 100);
  }

  // ═══════════════════════════════════════════════════════════════
  // ENISYALIZASYON
  // ═══════════════════════════════════════════════════════════════
  
  function init() {
    hookIntoCheckout(); // Imprime otomatik
    addPrinterControls(); // Bouton pou konekte
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  // Ekspoz API
  window.thermalPrinterAPI = {
    connect: connectPrinter,
    print: printReceipt,
    setAutoPrint: function(auto) { thermalPrinter.autoPrint = auto; }
  };

})();
