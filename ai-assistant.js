// ═══════════════════════════════════════════════════════════════
// AI ASISTAN VANT
// ═══════════════════════════════════════════════════════════════
// Modul sa a bay konsèy entelijan pou kaissier yo
// Li analize done yo epi bay rekomandasyon
// ═══════════════════════════════════════════════════════════════

(function() {
  'use strict';
  
  var aiAssistant = {
    isEnabled: false,
    lastAnalysis: null
  };

  // ═══════════════════════════════════════════════════════════════
  // ANALIZE DONE VANT
  // ═══════════════════════════════════════════════════════════════
  
  function analyzeSalesData() {
    if (!window.S) return null;

    var products = window.S.products || [];
    var sales = window.S.sales || [];
    var settings = window.S.settings || {};

    var analysis = {
      lowStock: [],
      fastMoving: [],
      slowMoving: [],
      recommendations: []
    };

    // 1. Detekte stok ba
    products.forEach(function(p) {
      if (p.stock <= p.lowStock && p.stock > 0) {
        analysis.lowStock.push({
          name: p.name,
          stock: p.stock,
          lowStock: p.lowStock,
          recommendation: 'Recommande achat de ' + (p.lowStock * 2) + ' unités'
        });
      } else if (p.stock === 0) {
        analysis.lowStock.push({
          name: p.name,
          stock: 0,
          lowStock: p.lowStock,
          recommendation: 'URGENT: Produit épuisé'
        });
      }
    });

    // 2. Analize vitès vann (si gen done istorik)
    if (sales.length > 10) {
      var productSales = {};
      
      sales.forEach(function(sale) {
        sale.items.forEach(function(item) {
          if (!productSales[item.id]) {
            productSales[item.id] = { count: 0, qty: 0, name: item.name };
          }
          productSales[item.id].count++;
          productSales[item.id].qty += item.qty;
        });
      });

      // Klasman
      var sortedProducts = Object.values(productSales).sort(function(a, b) {
        return b.qty - a.qty;
      });

      // Top 5 ki vann byen
      analysis.fastMoving = sortedProducts.slice(0, 5);

      // Bottom 5 ki vann mal
      analysis.slowMoving = sortedProducts.slice(-5).reverse();
    }

    // 3. Jenere rekomandasyon
    if (analysis.lowStock.length > 0) {
      analysis.recommendations.push({
        type: 'warning',
        message: analysis.lowStock.length + ' produit(s) en stock faible'
      });
    }

    if (analysis.fastMoving.length > 0) {
      var topProduct = analysis.fastMoving[0];
      analysis.recommendations.push({
        type: 'info',
        message: 'Top vente: ' + topProduct.name + ' (' + topProduct.qty + ' vendus)'
      });
    }

    aiAssistant.lastAnalysis = analysis;
    return analysis;
  }

  // ═══════════════════════════════════════════════════════════════
  // AFICHE ANALIZ
  // ═══════════════════════════════════════════════════════════════
  
  function showAnalysis() {
    var analysis = analyzeSalesData();
    
    if (!analysis) {
      alert('⚠️ Pa ase done pou analiz');
      return;
    }

    var html = '<div style="padding:20px;max-width:500px;max-height:80vh;overflow-y:auto;">';
    
    html += '<h3 style="margin-bottom:15px;">🤖 Analize AI</h3>';
    
    // Stok ba
    if (analysis.lowStock.length > 0) {
      html += '<div style="margin-bottom:15px;">';
      html += '<h4 style="color:#ef4444;">⚠️ Stock Faible</h4>';
      analysis.lowStock.forEach(function(item) {
        html += '<div style="padding:8px;background:#fef2f2;border-radius:6px;margin-bottom:5px;">';
        html += '<strong>' + item.name + '</strong><br>';
        html += 'Stock: ' + item.stock + ' | ' + item.recommendation;
        html += '</div>';
      });
      html += '</div>';
    }
    
    // Vann rapid
    if (analysis.fastMoving.length > 0) {
      html += '<div style="margin-bottom:15px;">';
      html += '<h4 style="color:#22c55e;">📈 Ventes Rapides</h4>';
      analysis.fastMoving.forEach(function(item, i) {
        html += '<div style="padding:8px;background:#f0fdf4;border-radius:6px;margin-bottom:5px;">';
        html += '<strong>' + (i+1) + '. ' + item.name + '</strong> - ' + item.qty + ' vendus';
        html += '</div>';
      });
      html += '</div>';
    }
    
    // Rekomandasyon
    if (analysis.recommendations.length > 0) {
      html += '<div style="margin-bottom:15px;">';
      html += '<h4>💡 Recommandations</h4>';
      analysis.recommendations.forEach(function(rec) {
        html += '<div style="padding:8px;background:#f8fafc;border-radius:6px;margin-bottom:5px;">';
        html += rec.message;
        html += '</div>';
      });
      html += '</div>';
    }
    
    html += '</div>';

    // Kreye modal
    var modal = document.createElement('div');
    modal.style.cssText = 'position:fixed;inset:0;background:rgba(0,0,0,.5);z-index:1000;display:flex;align-items:center;justify-content:center;padding:20px;';
    modal.innerHTML = '<div style="background:#fff;border-radius:12px;padding:20px;max-width:500px;max-height:80vh;overflow-y:auto;">' + html + '<button onclick="this.closest(\'div\').parentElement.remove()" style="margin-top:15px;padding:8px 16px;background:#22c55e;color:#fff;border:none;border-radius:6px;cursor:pointer;">Fermer</button></div>';
    modal.onclick = function(e) {
      if (e.target === modal) modal.remove();
    };
    document.body.appendChild(modal);
  }

  // ═══════════════════════════════════════════════════════════════
  // AFICHE PANEL OTOMATIK NAN UI
  // ═══════════════════════════════════════════════════════════════
  
  function addAIPanel() {
    var attempts = 0;
    var maxAttempts = 50;
    
    var checkInterval = setInterval(function() {
      attempts++;
      
      // Chwe yon kote pou mete panel la (nan zòn pwodwi oswa nan sidebar)
      var prodGrid = document.querySelector('.prod-grid');
      var sidebar = document.querySelector('.sidebar');
      
      if (prodGrid) {
        clearInterval(checkInterval);
        
        // Verify si panel deja egziste
        if (document.querySelector('[data-ai-panel]')) {
          console.log('[AIAssistant] Panel deja egziste');
          return;
        }
        
        // Kreye panel la
        var panel = document.createElement('div');
        panel.setAttribute('data-ai-panel', 'true');
        panel.style.cssText = 'position:fixed;top:60px;right:20px;width:280px;background:#fff;border:1px solid var(--border);border-radius:12px;padding:15px;box-shadow:0 4px 16px rgba(0,0,0,.1);z-index:100;max-height:400px;overflow-y:auto;';
        panel.innerHTML = '<div style="display:flex;align-items:center;gap:8px;margin-bottom:12px;"><span style="font-size:18px;">🤖</span><strong style="font-size:14px;">Asistan AI</strong></div><div id="ai-content" style="font-size:12px;color:var(--text2);">Chargement...</div>';
        
        document.body.appendChild(panel);
        
        // Mete ajou konteni
        updateAIPanel();
        
        // Mete ajou chak 30 segonn
        setInterval(updateAIPanel, 30000);
        
        console.log('[AIAssistant] Panel AI ajoute');
        return;
      }
      
      if (attempts >= maxAttempts) {
        clearInterval(checkInterval);
      }
    }, 100);
  }

  function updateAIPanel() {
    var content = document.getElementById('ai-content');
    if (!content) return;

    var analysis = analyzeSalesData();
    
    if (!analysis) {
      content.innerHTML = '<div style="color:var(--text3);">Pas assez de données</div>';
      return;
    }

    var html = '';
    
    // Stok ba
    if (analysis.lowStock.length > 0) {
      html += '<div style="margin-bottom:10px;">';
      html += '<div style="color:#ef4444;font-weight:700;margin-bottom:4px;">⚠️ Stock Faible</div>';
      analysis.lowStock.slice(0, 3).forEach(function(item) {
        html += '<div style="padding:6px;background:#fef2f2;border-radius:6px;margin-bottom:4px;">';
        html += '<strong>' + item.name + '</strong><br>';
        html += '<span style="font-size:11px;">Stock: ' + item.stock + '</span>';
        html += '</div>';
      });
      html += '</div>';
    }
    
    // Top vente
    if (analysis.fastMoving.length > 0) {
      html += '<div style="margin-bottom:10px;">';
      html += '<div style="color:#22c55e;font-weight:700;margin-bottom:4px;">📈 Top Vente</div>';
      html += '<div style="padding:6px;background:#f0fdf4;border-radius:6px;">';
      html += '<strong>' + analysis.fastMoving[0].name + '</strong><br>';
      html += '<span style="font-size:11px;">' + analysis.fastMoving[0].qty + ' vendus</span>';
      html += '</div>';
      html += '</div>';
    }
    
    // Rekomandasyon
    if (analysis.recommendations.length > 0) {
      html += '<div>';
      html += '<div style="font-weight:700;margin-bottom:4px;">💡 Conseil</div>';
      analysis.recommendations.slice(0, 2).forEach(function(rec) {
        html += '<div style="padding:6px;background:#f8fafc;border-radius:6px;margin-bottom:4px;font-size:11px;">';
        html += rec.message;
        html += '</div>';
      });
      html += '</div>';
    }
    
    if (html === '') {
      html = '<div style="color:var(--text3);">Analyse en cours...</div>';
    }
    
    content.innerHTML = html;
  }

  // ═══════════════════════════════════════════════════════════════
  // NOTIFIKASYON OTOMATIK
  // ═══════════════════════════════════════════════════════════════
  
  function checkAndNotify() {
    if (!aiAssistant.isEnabled) return;

    var analysis = analyzeSalesData();
    
    if (analysis.lowStock.length > 0) {
      var urgent = analysis.lowStock.filter(function(p) { return p.stock === 0; });
      if (urgent.length > 0 && typeof window.notif === 'function') {
        window.notif('⚠️ ' + urgent.length + ' produit(s) épuisé(s)', 'err');
      }
    }
  }

  // ═══════════════════════════════════════════════════════════════
  // AJOUTE BOUTON
  // ═══════════════════════════════════════════════════════════════
  
  function addAIButton() {
    var attempts = 0;
    var maxAttempts = 50;
    
    var checkInterval = setInterval(function() {
      attempts++;
      
      var topbar = document.querySelector('.tb-r') || 
                   document.querySelector('.topbar .tb-r') ||
                   document.querySelector('.topbar');
      
      if (topbar) {
        clearInterval(checkInterval);
        
        if (document.querySelector('[data-ai-btn]')) {
          console.log('[AIAssistant] Bouton deja egziste');
          return;
        }
        
        var btn = document.createElement('button');
        btn.className = 'bo-btn';
        btn.setAttribute('data-ai-btn', 'true');
        btn.innerHTML = '🤖 AI';
        btn.title = 'Voir analyse AI';
        btn.style.cursor = 'pointer';
        btn.onclick = function() {
          showAnalysis();
        };
        
        if (topbar.firstChild) {
          topbar.insertBefore(btn, topbar.firstChild);
        } else {
          topbar.appendChild(btn);
        }
        
        console.log('[AIAssistant] Bouton AI ajoute');
        
        // Aktive otomatik
        aiAssistant.isEnabled = true;
        
        // Vèfikasyon chak 5 minit
        setInterval(checkAndNotify, 300000);
        
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
    addAIPanel(); // Panel otomatik
    addAIButton(); // Bouton pou analiz deta
    aiAssistant.isEnabled = true; // Aktive otomatik
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  // Ekspoz API
  window.aiAssistantAPI = {
    analyze: analyzeSalesData,
    show: showAnalysis,
    enable: function() { aiAssistant.isEnabled = true; },
    disable: function() { aiAssistant.isEnabled = false; }
  };

})();
