// ═══════════════════════════════════════════════════════════════
// PREDIKSYON STOCK
// ═══════════════════════════════════════════════════════════════
// Modul sa a kalkile lè ou bezwen reapprovisionne
// Li baze sou vitès vann ak done istorik
// ═══════════════════════════════════════════════════════════════

(function() {
  'use strict';
  
  var stockPrediction = {
    isEnabled: false,
    predictions: []
  };

  // ═══════════════════════════════════════════════════════════════
  // KALKILE PREDIKSYON POU YON PWODUI
  // ═══════════════════════════════════════════════════════════════
  
  function predictForProduct(productId) {
    if (!window.S || !window.S.sales || !window.S.products) {
      return null;
    }

    var product = window.S.products.find(function(p) { return p.id === productId; });
    if (!product) return null;

    var sales = window.S.sales || [];
    
    // Kalkile vann total pou chak jou nan 7 dènye jou yo
    var dailySales = {};
    var now = new Date();
    
    for (var i = 0; i < 7; i++) {
      var date = new Date(now);
      date.setDate(date.getDate() - i);
      var dateStr = date.toISOString().split('T')[0];
      dailySales[dateStr] = 0;
    }

    sales.forEach(function(sale) {
      var saleDate = new Date(sale.date).toISOString().split('T')[0];
      if (dailySales.hasOwnProperty(saleDate)) {
        sale.items.forEach(function(item) {
          if (item.id === productId) {
            dailySales[saleDate] += item.qty;
          }
        });
      }
    });

    // Kalkile mwayèn vann pa jou
    var totalSales = Object.values(dailySales).reduce(function(a, b) { return a + b; }, 0);
    var avgDailySales = totalSales / 7;

    // Si pa gen vann, retounen null
    if (avgDailySales === 0) {
      return {
        productId: productId,
        productName: product.name,
        currentStock: product.stock,
        avgDailySales: 0,
        daysUntilEmpty: null,
        recommendation: 'Pas de ventes récentes'
      };
    }

    // Kalkile jou ki rete
    var daysUntilEmpty = Math.floor(product.stock / avgDailySales);
    
    // Jenere rekomandasyon
    var recommendation = '';
    if (daysUntilEmpty <= 3) {
      recommendation = 'URGENT: Réapprovisionner maintenant';
    } else if (daysUntilEmpty <= 7) {
      recommendation = 'Commander cette semaine';
    } else if (daysUntilEmpty <= 14) {
      recommendation = 'Planifier réapprovisionnement';
    } else {
      recommendation = 'Stock suffisant';
    }

    return {
      productId: productId,
      productName: product.name,
      currentStock: product.stock,
      avgDailySales: avgDailySales.toFixed(1),
      daysUntilEmpty: daysUntilEmpty,
      recommendation: recommendation,
      suggestedOrderQty: Math.ceil(avgDailySales * 14) // 2 semenn
    };
  }

  // ═══════════════════════════════════════════════════════════════
  // KALKILE TOUT PREDIKSYON YO
  // ═══════════════════════════════════════════════════════════════
  
  function calculateAllPredictions() {
    if (!window.S || !window.S.products) {
      return [];
    }

    var products = window.S.products || [];
    stockPrediction.predictions = [];

    products.forEach(function(product) {
      var prediction = predictForProduct(product.id);
      if (prediction) {
        stockPrediction.predictions.push(prediction);
      }
    });

    // Klasman pa lè ki rete (pi urjan an premye)
    stockPrediction.predictions.sort(function(a, b) {
      var aDays = a.daysUntilEmpty === null ? 999 : a.daysUntilEmpty;
      var bDays = b.daysUntilEmpty === null ? 999 : b.daysUntilEmpty;
      return aDays - bDays;
    });

    return stockPrediction.predictions;
  }

  // ═══════════════════════════════════════════════════════════════
  // AFICHE PREDIKSYON
  // ═══════════════════════════════════════════════════════════════
  
  function showPredictions() {
    var predictions = calculateAllPredictions();
    
    if (predictions.length === 0) {
      alert('⚠️ Pa ase done pou prediksyon');
      return;
    }

    var html = '<div style="padding:20px;max-width:600px;max-height:80vh;overflow-y:auto;">';
    html += '<h3 style="margin-bottom:15px;">📊 Prediksyon Stock</h3>';
    
    // Top 10 ki pi urjan
    var urgent = predictions.filter(function(p) { 
      return p.daysUntilEmpty !== null && p.daysUntilEmpty <= 14; 
    }).slice(0, 10);
    
    if (urgent.length > 0) {
      html += '<div style="margin-bottom:15px;">';
      html += '<h4 style="color:#ef4444;">⚠️ Besoin Réapprovisionnement</h4>';
      urgent.forEach(function(p) {
        var color = p.daysUntilEmpty <= 3 ? '#fef2f2' : '#fef9c3';
        html += '<div style="padding:10px;background:' + color + ';border-radius:6px;margin-bottom:8px;">';
        html += '<strong>' + p.productName + '</strong><br>';
        html += 'Stock: ' + p.currentStock + ' | Vente/jour: ' + p.avgDailySales + '<br>';
        html += '<strong>' + p.daysUntilEmpty + ' jou(s) restant</strong><br>';
        html += '<em>' + p.recommendation + '</em>';
        html += '</div>';
      });
      html += '</div>';
    }
    
    html += '</div>';

    // Kreye modal
    var modal = document.createElement('div');
    modal.style.cssText = 'position:fixed;inset:0;background:rgba(0,0,0,.5);z-index:1000;display:flex;align-items:center;justify-content:center;padding:20px;';
    modal.innerHTML = '<div style="background:#fff;border-radius:12px;padding:20px;max-width:600px;max-height:80vh;overflow-y:auto;">' + html + '<button onclick="this.closest(\'div\').parentElement.remove()" style="margin-top:15px;padding:8px 16px;background:#22c55e;color:#fff;border:none;border-radius:6px;cursor:pointer;">Fermer</button></div>';
    modal.onclick = function(e) {
      if (e.target === modal) modal.remove();
    };
    document.body.appendChild(modal);
  }

  // ═══════════════════════════════════════════════════════════════
  // AJOUTE BOUTON
  // ═══════════════════════════════════════════════════════════════
  
  function addPredictionButton() {
    var attempts = 0;
    var maxAttempts = 50;
    
    var checkInterval = setInterval(function() {
      attempts++;
      
      var topbar = document.querySelector('.tb-r') || 
                   document.querySelector('.topbar .tb-r') ||
                   document.querySelector('.topbar');
      
      if (topbar) {
        clearInterval(checkInterval);
        
        if (document.querySelector('[data-prediction-btn]')) {
          console.log('[StockPrediction] Bouton deja egziste');
          return;
        }
        
        var btn = document.createElement('button');
        btn.className = 'bo-btn';
        btn.setAttribute('data-prediction-btn', 'true');
        btn.innerHTML = '📊 Stock';
        btn.title = 'Voir prédictions de stock';
        btn.style.cursor = 'pointer';
        btn.onclick = function() {
          showPredictions();
        };
        
        if (topbar.firstChild) {
          topbar.insertBefore(btn, topbar.firstChild);
        } else {
          topbar.appendChild(btn);
        }
        
        console.log('[StockPrediction] Bouton ajoute');
        stockPrediction.isEnabled = true;
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
    addPredictionButton();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  // Ekspoz API
  window.stockPredictionAPI = {
    predict: predictForProduct,
    predictAll: calculateAllPredictions,
    show: showPredictions
  };

})();
