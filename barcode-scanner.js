// ═══════════════════════════════════════════════════════════════
// SCAN BARCODE AVANSÉ - USB/BLUETOOTH
// ═══════════════════════════════════════════════════════════════
// Modul sa a pèmèt scan barcode ak lektè USB/Bluetooth
// Li otomatik ajoute pwodui nan panier lè barcode skane
// ═══════════════════════════════════════════════════════════════

(function() {
  'use strict';
  
  var barcodeScanner = {
    isEnabled: false,
    lastScanTime: 0,
    scanBuffer: '',
    scanTimeout: null
  };

  // ═══════════════════════════════════════════════════════════════
  // INISYALIZASYON SCANNER
  // ═══════════════════════════════════════════════════════════════
  
  function initBarcodeScanner() {
    // Koute pou evenman keydown nan tout dokiman an
    document.addEventListener('keydown', handleKeyDown);
    
    // Koute pou evenman keyup nan tout dokiman an
    document.addEventListener('keyup', handleKeyUp);
    
    barcodeScanner.isEnabled = true;
    console.log('[BarcodeScanner] Scanner barcode aktive');
  }

  // ═══════════════════════════════════════════════════════════════
  // TRAITE KEYDOWN
  // ═══════════════════════════════════════════════════════════════
  
  function handleKeyDown(event) {
    // Si nou nan yon chanp input, pa trete kòm barcode
    if (event.target.tagName === 'INPUT' || event.target.tagName === 'TEXTAREA') {
      return;
    }

    // Scanner barcode voye rapidman - detekte si se scanner
    var now = Date.now();
    var timeSinceLastScan = now - barcodeScanner.lastScanTime;
    
    // Si tan ant touches yo kout (< 50ms), se ka scanner
    if (timeSinceLastScan < 50) {
      event.preventDefault();
      
      // Ajoute touch la nan buffer
      if (event.key === 'Enter') {
        // Enter = fin barcode
        processBarcode(barcodeScanner.scanBuffer);
        barcodeScanner.scanBuffer = '';
        barcodeScanner.lastScanTime = 0;
      } else if (event.key.length === 1) {
        barcodeScanner.scanBuffer += event.key;
        barcodeScanner.lastScanTime = now;
      }
      
      // Reset timeout si pa gen nouvo touch
      clearTimeout(barcodeScanner.scanTimeout);
      barcodeScanner.scanTimeout = setTimeout(function() {
        barcodeScanner.scanBuffer = '';
        barcodeScanner.lastScanTime = 0;
      }, 100);
    } else {
      // Reset si tan twò long
      barcodeScanner.scanBuffer = '';
      barcodeScanner.lastScanTime = now;
    }
  }

  function handleKeyUp(event) {
    // Pa fe anyen pou keyup
  }

  // ═══════════════════════════════════════════════════════════════
  // TRAITE BARCODE
  // ═══════════════════════════════════════════════════════════════
  
  function processBarcode(barcode) {
    if (!barcode || barcode.length < 3) {
      return;
    }

    console.log('[BarcodeScanner] Barcode skane:', barcode);
    
    // Chèche pwodui ak barcode sa a
    var product = findProductByBarcode(barcode);
    
    if (product) {
      // Ajoute nan panier
      if (typeof window.addCart === 'function') {
        window.addCart(product.id);
        console.log('[BarcodeScanner] Pwodui ajoute:', product.name);
        
        // Son notifikasyon
        playBeep();
      } else {
        console.warn('[BarcodeScanner] Fonksyon addCart pa jwenn');
      }
    } else {
      console.log('[BarcodeScanner] Pa jwenn pwodui ak barcode:', barcode);
      // Afiche mesaj
      if (typeof window.notif === 'function') {
        window.notif('⚠️ Barcode pa jwenn: ' + barcode, 'err');
      }
    }
  }

  // ═══════════════════════════════════════════════════════════════
  // JWENN PWODUI PA BARCODE
  // ═══════════════════════════════════════════════════════════════
  
  function findProductByBarcode(barcode) {
    if (!window.S || !window.S.products) {
      return null;
    }

    // Chèche nan chan barcode si li egziste
    return window.S.products.find(function(p) {
      return p.barcode === barcode || p.sku === barcode || p.id === barcode;
    });
  }

  // ═══════════════════════════════════════════════════════════════
  // SON BEEP
  // ═══════════════════════════════════════════════════════════════
  
  function playBeep() {
    try {
      var audioContext = new (window.AudioContext || window.webkitAudioContext)();
      var oscillator = audioContext.createOscillator();
      var gainNode = audioContext.createGain();
      
      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);
      
      oscillator.frequency.value = 1000;
      oscillator.type = 'sine';
      gainNode.gain.value = 0.1;
      
      oscillator.start();
      oscillator.stop(audioContext.currentTime + 0.1);
    } catch (e) {
      // Si audio pa disponib, pa fe anyen
    }
  }

  // ═══════════════════════════════════════════════════════════════
  // AJOUTE BOUTON POU AKTIVE/DEZAKTIVE
  // ═══════════════════════════════════════════════════════════════
  
  function addScannerToggleButton() {
    var attempts = 0;
    var maxAttempts = 50;
    
    var checkInterval = setInterval(function() {
      attempts++;
      
      var topbar = document.querySelector('.tb-r') || 
                   document.querySelector('.topbar .tb-r') ||
                   document.querySelector('.topbar');
      
      if (topbar) {
        clearInterval(checkInterval);
        
        // Verify si bouton deja egziste
        if (document.querySelector('[data-barcode-scanner-btn]')) {
          console.log('[BarcodeScanner] Bouton deja egziste');
          return;
        }
        
        var btn = document.createElement('button');
        btn.className = 'bo-btn';
        btn.setAttribute('data-barcode-scanner-btn', 'true');
        btn.innerHTML = '📷 Scanner';
        btn.title = 'Activer/Désactiver scanner barcode';
        btn.style.cursor = 'pointer';
        btn.onclick = function() {
          barcodeScanner.isEnabled = !barcodeScanner.isEnabled;
          btn.innerHTML = barcodeScanner.isEnabled ? '📷 Scanner ON' : '📷 Scanner OFF';
          btn.style.background = barcodeScanner.isEnabled ? 'var(--accent)' : '';
          console.log('[BarcodeScanner] Scanner ' + (barcodeScanner.isEnabled ? 'aktive' : 'dezaktive'));
        };
        
        if (topbar.firstChild) {
          topbar.insertBefore(btn, topbar.firstChild);
        } else {
          topbar.appendChild(btn);
        }
        
        console.log('[BarcodeScanner] Bouton scanner ajoute');
        return;
      }
      
      if (attempts >= maxAttempts) {
        clearInterval(checkInterval);
        console.warn('[BarcodeScanner] Pa ka jwenn topbar');
      }
    }, 100);
  }

  // ═══════════════════════════════════════════════════════════════
  // ENISYALIZASYON
  // ═══════════════════════════════════════════════════════════════
  
  function init() {
    initBarcodeScanner();
    addScannerToggleButton();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  // Ekspoz API
  window.barcodeScannerAPI = {
    enable: function() { barcodeScanner.isEnabled = true; },
    disable: function() { barcodeScanner.isEnabled = false; },
    isEnabled: function() { return barcodeScanner.isEnabled; }
  };

})();
