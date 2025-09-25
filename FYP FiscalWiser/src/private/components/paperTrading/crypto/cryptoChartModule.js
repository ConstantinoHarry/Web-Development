// CONFIG
const COINGECKO_API_KEY = 'CG-McKMjk1v49rwGFym8tPdHqZW';
const MONKEY_PATCH = false; // set to true to auto-wrap your core functions

// DOM hooks (presence-safe)
const chartCanvas = document.getElementById('asset-chart');
const chartRangeButtons = document.querySelectorAll('.chart-range-btn');
const chartTypeButtons = document.querySelectorAll('.chart-type-btn'); // ok if none

// These IDs may not exist in your HTML; they’ll remain null and be ignored
const chartAssetAvatar = document.getElementById('chart-asset-avatar');
const chartAssetName = document.getElementById('chart-asset-name');
const chartAssetSymbol = document.getElementById('chart-asset-symbol');
const chartAssetLast = document.getElementById('chart-asset-last');
const chartAssetChange = document.getElementById('chart-asset-change');
const chartAssetHigh = document.getElementById('chart-asset-high');
const chartAssetLow = document.getElementById('chart-asset-low');
const chartAssetMcap = document.getElementById('chart-asset-mcap');
const chartLoading = document.getElementById('chart-loading');
const chartEmpty = document.getElementById('chart-empty');

// State
let assetChart = null; // Chart.js instance
let chartCache = new Map(); // key: `${assetId}|${days}|${type}` => payload
let currentChartDays = 1; // 24h default
let currentChartType = 'line'; // 'line' or 'candle'

// Runtime checks for Chart.js and the financial plugin
function ensureChartCapabilities(type) {
  if (!window.Chart) {
    console.warn('Chart.js not found on page. Skipping chart render.');
    return false;
  }
  if (type === 'candlestick') {
    // Financial chart type requires chartjs-chart-financial plugin
    const ok = !!Chart.registry?.controllers?.get?.('candlestick') || !!Chart.registry?.controllers?.candlestick;
    if (!ok) {
      console.warn('Candlestick controller not available (chartjs-chart-financial missing). Falling back to line.');
      return false;
    }
  }
  return true;
}

// Utilities
function fmtUSD(v, digits = 2) {
  const n = Number(v || 0);
  return `$${n.toLocaleString('en-US', { minimumFractionDigits: digits, maximumFractionDigits: digits })}`;
}
function fmtTs(ts, days) {
  const d = new Date(ts);
  if (days <= 1) return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  if (days <= 90) return d.toLocaleDateString([], { month: 'short', day: 'numeric' });
  return d.toLocaleDateString([], { year: 'numeric', month: 'short', day: 'numeric' });
}
function showChartLoading(show) {
  if (chartLoading) chartLoading.style.display = show ? 'block' : 'none';
}
function setChartEmpty(show) {
  if (chartEmpty) chartEmpty.hidden = !show;
}
function getCurrentAssetId() {
  try {
    return window.tradeAssetSelect?.value || document.getElementById('trade-asset')?.value || '';
  } catch { return ''; }
}
function getCurrentSide() {
  try {
    return (window.tradeTypeElement?.value || document.getElementById('trade-type')?.value || 'buy') === 'sell' ? 'sell' : 'buy';
  } catch { return 'buy'; }
}
function getAssetInfo(assetId) {
  try {
    return (window.cryptoData?.find(c => c.id === assetId)) || window.portfolio?.[assetId]?.lastKnownData || null;
  } catch { return null; }
}

// Fetch history (line: market_chart, candles: ohlc)
async function fetchHistory(assetId, days, type) {
  const key = `${assetId}|${days}|${type}`;
  if (chartCache.has(key)) return chartCache.get(key);

  showChartLoading(true);
  setChartEmpty(false);

  let result;
  try {
    if (type === 'candle') {
      result = await fetchCandleHistory(assetId, days);
    } else {
      result = await fetchLineHistory(assetId, days);
    }
  } catch (e) {
    console.error('fetchHistory error:', e);
    result = { labels: [], values: [], candles: [], last: 0, error: e?.message || String(e) };
  } finally {
    showChartLoading(false);
  }

  const empty =
    !result ||
    ((result.values && !result.values.length) && (result.candles && !result.candles.length));

  if (empty) {
    setChartEmpty(true);
  }

  chartCache.set(key, result);
  return result;
}

async function fetchLineHistory(assetId, days) {
  // CoinGecko market_chart supports 'hourly' up to 90 days; beyond that use 'daily'
  const interval = days <= 7 ? 'hourly' : (days <= 90 ? 'daily' : 'daily');
  const url = `https://api.coingecko.com/api/v3/coins/${encodeURIComponent(assetId)}/market_chart?vs_currency=usd&days=${encodeURIComponent(days)}&interval=${encodeURIComponent(interval)}`;

  const res = await fetch(url, { headers: { 'x-cg-demo-api-key': COINGECKO_API_KEY } });
  if (!res.ok) {
    const text = await res.text().catch(() => '');
    throw new Error(`market_chart failed: ${res.status} ${res.statusText}${text ? ' - ' + text : ''}`);
  }
  const data = await res.json();
  const prices = Array.isArray(data.prices) ? data.prices : [];
  const labels = prices.map(p => fmtTs(p[0], days));
  const values = prices.map(p => Number(p[1]) || 0);
  return { labels, values, last: values.at(-1) || 0 };
}

async function fetchCandleHistory(assetId, days) {
  // OHLC supports only these day buckets
  const supported = [1, 7, 14, 30, 90, 180, 365];
  const useDays = supported.reduce((prev, curr) => Math.abs(curr - days) < Math.abs(prev - days) ? curr : prev, supported[0]);
  const url = `https://api.coingecko.com/api/v3/coins/${encodeURIComponent(assetId)}/ohlc?vs_currency=usd&days=${encodeURIComponent(useDays)}`;

  const res = await fetch(url, { headers: { 'x-cg-demo-api-key': COINGECKO_API_KEY } });
  if (!res.ok) {
    const text = await res.text().catch(() => '');
    throw new Error(`ohlc failed: ${res.status} ${res.statusText}${text ? ' - ' + text : ''}`);
  }
  const arr = await res.json(); // [[ts, open, high, low, close], ...]
  const candles = Array.isArray(arr) ? arr.map(([t,o,h,l,c]) => ({ t, o, h, l, c })) : [];
  const labels = candles.map(c => fmtTs(c.t, useDays));
  const last = candles.length ? candles[candles.length - 1].c : 0;
  return { labels, candles, last };
}

// Renderers
function renderChartLine(labels, values, side) {
  if (!chartCanvas) return;
  if (!ensureChartCapabilities('line')) return;

  const ctx = chartCanvas.getContext('2d');
  const base = side === 'sell' ? '255,82,82' : '41,98,255';

  const grad = ctx.createLinearGradient(0, 0, 0, (chartCanvas.height || 300));
  grad.addColorStop(0, `rgba(${base},0.35)`);
  grad.addColorStop(1, `rgba(${base},0.02)`);

  const borderColor = side === 'sell' ? 'rgba(255,82,82,1)' : 'rgba(41,98,255,1)';

  const data = {
    labels,
    datasets: [
      {
        data: values,
        borderColor,
        backgroundColor: grad,
        borderWidth: 2,
        pointRadius: 0,
        tension: 0.3,
        fill: true
      }
    ]
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      x: { grid: { display: false }, ticks: { color: '#aeb7c6', maxTicksLimit: 8 } },
      y: { grid: { color: 'rgba(255,255,255,0.06)' }, ticks: { color: '#aeb7c6', callback: v => `$${Number(v).toLocaleString()}` } }
    },
    plugins: {
      legend: { display: false },
      tooltip: {
        mode: 'index',
        intersect: false,
        backgroundColor: 'rgba(16,18,24,0.92)',
        borderColor: 'rgba(255,255,255,0.08)',
        borderWidth: 1,
        titleColor: '#e8edf5',
        bodyColor: '#e8edf5',
        padding: 10,
        callbacks: {
          label: (ctx) => ` ${fmtUSD(ctx.parsed.y)}`
        }
      }
    },
    interaction: { mode: 'nearest', intersect: false },
    animation: { duration: 250 }
  };

  if (assetChart) assetChart.destroy();
  assetChart = new Chart(ctx, { type: 'line', data, options });
}

function renderChartCandle(labels, candles) {
  if (!chartCanvas) return;
  if (!ensureChartCapabilities('candlestick')) {
    // Fallback to line chart using close prices
    const values = candles.map(c => c.c);
    renderChartLine(labels, values, getCurrentSide());
    return;
  }

  const ctx = chartCanvas.getContext('2d');

  // For chartjs-chart-financial, dataset format can be array of objects {x, o, h, l, c}
  const data = {
    labels,
    datasets: [{
      label: 'OHLC',
      data: candles.map(c => ({ x: c.t, o: c.o, h: c.h, l: c.l, c: c.c })),
      upColor: 'rgba(34,197,94,1)',
      downColor: 'rgba(239,68,68,1)',
      borderColor: 'rgba(160,170,190,0.7)',
    }]
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      x: { grid: { display: false }, ticks: { color: '#aeb7c6', maxTicksLimit: 8 } },
      y: { grid: { color: 'rgba(255,255,255,0.06)' }, ticks: { color: '#aeb7c6', callback: v => `$${Number(v).toLocaleString()}` } }
    },
    plugins: {
      legend: { display: false },
      tooltip: {
        mode: 'index',
        intersect: false,
        backgroundColor: 'rgba(16,18,24,0.92)',
        borderColor: 'rgba(255,255,255,0.08)',
        borderWidth: 1,
        titleColor: '#e8edf5',
        bodyColor: '#e8edf5',
        padding: 10,
        callbacks: {
          label: (ctx) => {
            const v = ctx.raw;
            if (!v) return '';
            return ` O:${fmtUSD(v.o)} H:${fmtUSD(v.h)} L:${fmtUSD(v.l)} C:${fmtUSD(v.c)}`;
          }
        }
      }
    },
    animation: { duration: 250 }
  };

  if (assetChart) assetChart.destroy();
  assetChart = new Chart(ctx, { type: 'candlestick', data, options });
}

// Main updater
async function updateProfessionalChart() {
  if (!chartCanvas) return;
  const assetId = getCurrentAssetId();
  if (!assetId) { setChartEmpty(true); return; }

  const info = getAssetInfo(assetId);
  const side = getCurrentSide();

  // Identity + stats from latest market snapshot (only if elements exist)
  if (chartAssetName) chartAssetName.textContent = info?.name || assetId;
  if (chartAssetSymbol) chartAssetSymbol.textContent = info?.symbol ? info.symbol.toUpperCase() : '';
  if (chartAssetAvatar) {
    if (info?.image) { chartAssetAvatar.style.backgroundImage = `url(${info.image})`; chartAssetAvatar.textContent = ''; }
    else { chartAssetAvatar.style.backgroundImage = ''; chartAssetAvatar.textContent = (info?.symbol || assetId).slice(0,1).toUpperCase(); }
  }

  const lastPrice = Number(info?.current_price ?? window.portfolio?.[assetId]?.lastKnownPrice ?? 0);
  const change24 = Number(info?.price_change_percentage_24h ?? 0);
  const high24 = info?.high_24h ?? null;
  const low24 = info?.low_24h ?? null;
  const mcap = info?.market_cap ?? null;

  if (chartAssetLast) chartAssetLast.textContent = fmtUSD(lastPrice);
  if (chartAssetChange) {
    chartAssetChange.textContent = `${change24 >= 0 ? '+' : ''}${change24.toFixed(2)}%`;
    chartAssetChange.classList.toggle('positive', change24 >= 0);
    chartAssetChange.classList.toggle('negative', change24 < 0);
  }
  if (chartAssetHigh) chartAssetHigh.textContent = high24 != null ? fmtUSD(high24) : '--';
  if (chartAssetLow) chartAssetLow.textContent = low24 != null ? fmtUSD(low24) : '--';
  if (chartAssetMcap) chartAssetMcap.textContent = mcap != null ? `$${Number(mcap).toLocaleString()}` : '--';

  try {
    const payload = await fetchHistory(assetId, currentChartDays, currentChartType);
    if (currentChartType === 'candle' && payload?.candles?.length) {
      renderChartCandle(payload.labels, payload.candles);
    } else if (payload?.values?.length) {
      renderChartLine(payload.labels, payload.values, side);
    } else {
      setChartEmpty(true);
    }
  } catch (err) {
    console.error('updateProfessionalChart failed:', err);
    setChartEmpty(true);
  }
}

// Public API
window.updateChart = updateProfessionalChart;

// UI events for controls
if (chartRangeButtons && chartRangeButtons.length) {
  chartRangeButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      chartRangeButtons.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      currentChartDays = parseInt(btn.getAttribute('data-range'), 10) || 1;
      updateProfessionalChart();
    });
  });
}

if (chartTypeButtons && chartTypeButtons.length) {
  chartTypeButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      chartTypeButtons.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      currentChartType = btn.getAttribute('data-type') || 'line';
      updateProfessionalChart();
    });
  });
}

// Optional: auto integrate without editing core (Monkey Patch mode)
if (MONKEY_PATCH) {
  if (typeof window.updateTradeForm === 'function') {
    const __origUpdateTradeForm = window.updateTradeForm;
    window.updateTradeForm = function () {
      __origUpdateTradeForm.apply(this, arguments);
      updateProfessionalChart();
    };
  }
  if (typeof window.setTradeType === 'function') {
    const __origSetTradeType = window.setTradeType;
    window.setTradeType = function (type) {
      __origSetTradeType.apply(this, arguments);
      updateProfessionalChart();
    };
  }
  if (typeof window.switchTab === 'function') {
    const __origSwitchTab = window.switchTab;
    window.switchTab = function (tabName) {
      __origSwitchTab.apply(this, arguments);
      if (tabName === 'trade') updateProfessionalChart();
    };
  }
  if (typeof window.fetchCryptoData === 'function') {
    const __origFetch = window.fetchCryptoData;
    window.fetchCryptoData = async function () {
      await __origFetch.apply(this, arguments);
      if (window.activeTab === 'trade') updateProfessionalChart();
    };
  }
}

// Lightweight init: update when asset changes if core doesn't already call updateChart
document.getElementById('trade-asset')?.addEventListener('change', () => updateProfessionalChart());
document.querySelectorAll('.toggle-btn[data-value]')?.forEach(btn => {
  btn.addEventListener('click', () => setTimeout(updateProfessionalChart, 0));
});
