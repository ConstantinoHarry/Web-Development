/*
* Crypto Paper Trading Simulator - Fixed JS
* 
* Changes made:
* - Added price_change_percentage=24h to CoinGecko request, better error surfacing.
* - Fixed parseuSD -> parseUSD typo in syncNetworthChip.
* - Robust handling of missing price_change fields in tables and chips.
* - Null-safety for modal/notification and various DOM ops.
* - Safe slider/input syncing.
* - Safer DCA average price calc on buys.
* - Minor guards and UX tweaks.
* 
* Author: Constantino Harry Alexander
* Last Updated: 28 APRIL 2025
*/

console.log('Crypto Paper Trading Simulator script loaded successfully.');

// Global variables
let balance; // Initial balance will be 10,000 but will be reloaded from localStorage later on 
let portfolio = {}; // Portfolio to store user's crypto holdings
let cryptoData = []; // Data fetched from the API for cryptocurrencies
let filteredCryptoData = []; // Filtered data for display in the table
let activeTab = 'market'; // Active tab (market or trade)

// DOM elements
const balanceElement = document.getElementById('balance');
const profitChangeElement = document.getElementById('profit-change');
const profitAmountElement = document.getElementById('profit-amount');
const cryptoTableBody = document.getElementById('crypto-table-body');
const portfolioTableBody = document.getElementById('portfolio-table-body');
const tradeAssetSelect = document.getElementById('trade-asset');
const tradeTypeElement = document.getElementById('trade-type');
const tradeAmountInput = document.getElementById('trade-amount');
const amountSlider = document.getElementById('amount-slider');
const currentPriceElement = document.getElementById('current-price');
const quantityDisplayElement = document.getElementById('quantity-display');
const executeTradeBtn = document.getElementById('execute-trade');
const refreshBtn = document.getElementById('refresh-btn');
const searchInput = document.getElementById('search-crypto');
const modal = document.getElementById('trade-modal');
const modalTitle = document.getElementById('modal-title');
const modalContent = document.getElementById('modal-content');
const confirmTradeBtn = document.getElementById('confirm-trade');
const cancelTradeBtn = document.getElementById('cancel-trade');
const closeModal = document.querySelector('.close-modal');
const notification = document.getElementById('notification');
const notificationMessage = document.getElementById('notification-message');
const tabButtons = document.querySelectorAll('.tab');
const tabContents = document.querySelectorAll('.tab-content');
const headerPortfolioValueElement = document.getElementById('header-portfolio-value');
const summaryPortfolioValueElement = document.getElementById('summary-portfolio-value');
const totalPlElement = document.getElementById('total-pl');
const dailyChangeElement = document.getElementById('daily-change');
const filterButtons = document.querySelectorAll('.filter-btn');
const toggleButtons = document.querySelectorAll('.toggle-btn');
const orderSummaryType = document.getElementById('summary-type');
const orderSummaryAsset = document.getElementById('summary-asset');
const orderSummaryAmount = document.getElementById('summary-amount');
const orderSummaryQuantity = document.getElementById('summary-quantity');

// New Trade UI elements (optional presence)
const tradeFormContainer = document.querySelector('.trade-form');
const tradeCtaButton = document.querySelector('.cta-primary') || executeTradeBtn;
const tradeAssetAvatar = document.getElementById('trade-asset-avatar');
const assetNameLabel = document.getElementById('asset-name-label');
const assetSymbolLabel = document.getElementById('asset-symbol-label');
const asset24hChip = document.getElementById('asset-24h-chip');
const holdingsHint = document.getElementById('user-holdings-hint');
const balanceInline = document.getElementById('balance-inline');
const feeDisplay = document.getElementById('fee-display');
const networthChip = document.getElementById('networth-chip');

// Quick amount chips (optional presence)
const quickAmountChips = document.querySelectorAll('.quick-chips .chip');

// Quick stats (optional elements)
const qsAssetsEl = document.getElementById('qs-assets');
const qsGainerEl = document.getElementById('qs-gainer');
const qsLoserEl  = document.getElementById('qs-loser');
const qsBtcmcapEl = document.getElementById('qs-btcmcap');

// Initialize the app
document.addEventListener('DOMContentLoaded', () => {
  console.log('DOM fully loaded');
  loadFromLocalStorage();
  updateBalanceDisplay();
  fetchCryptoData();
  setupEventListeners();
  syncInlineBalance();
  updateTradeSideStyling();
});

function loadFromLocalStorage() {
  const savedData = localStorage.getItem('cryptoPortfolio');
  if (savedData) {
    try {
      const data = JSON.parse(savedData);
      balance = data.balance !== undefined ? data.balance : 10000;
      portfolio = data.portfolio || {};

      Object.keys(portfolio).forEach(cryptoId => {
        if (!portfolio[cryptoId].lastKnownData) {
          const crypto = cryptoData.find(c => c.id === cryptoId);
          if (crypto) {
            portfolio[cryptoId].lastKnownData = {
              id: crypto.id,
              name: crypto.name,
              symbol: crypto.symbol,
              image: crypto.image
            };
          }
        }
        if (!portfolio[cryptoId].lastKnownPrice) {
          portfolio[cryptoId].lastKnownPrice = portfolio[cryptoId].avgBuyPrice || 0;
        }
      });
    } catch (e) {
      console.error('Error parsing saved data:', e);
      balance = 10000;
      portfolio = {};
    }
  } else {
    balance = 10000;
    portfolio = {};
  }
}

// Reset app data
function resetAppData() {
  if (confirm('Are you sure you want to reset your portfolio and balance?')) {
    balance = 10000;
    portfolio = {};
    saveToLocalStorage();
    updateBalanceDisplay();
    updatePortfolioTable();
    updatePortfolioSummary();
    updateTradeAssetSelect();
    updateTradeForm();
    showNotification('Portfolio has been reset', 'success');
  }
}

// Fetch cryptocurrency data from CoinGecko API
async function fetchCryptoData() {
  const API_KEY = 'CG-McKMjk1v49rwGFym8tPdHqZW'; // demo key, rate-limited
  const url = 'https://api.coingecko.com/api/v3/coins/markets' +
              '?vs_currency=usd&order=market_cap_desc&per_page=100&page=1' +
              '&sparkline=false&price_change_percentage=24h';
  try {
    const response = await fetch(url, {
      headers: { 'x-cg-demo-api-key': API_KEY }
    });

    if (!response.ok) {
      const text = await response.text().catch(() => '');
      throw new Error(`API ${response.status} ${response.statusText}${text ? ` - ${text}` : ''}`);
    }

    const data = await response.json();
    if (!Array.isArray(data)) throw new Error('Unexpected API response shape');

    cryptoData = data;
    filteredCryptoData = [...cryptoData];
    console.log('Fetched crypto data:', cryptoData);

    updateCryptoTable();
    updateTradeAssetSelect();
    updatePortfolioTable();
    updatePortfolioSummary();
    updateTradeForm(); // ensure trade header reflects first asset if any
    updateQuickStats();

  } catch (error) {
    console.error('Error fetching crypto data:', error);
    showNotification(`Failed to fetch crypto data: ${error.message}`, 'error');
  }
}

// Update the cryptocurrency table
function updateCryptoTable() {
  if (!cryptoTableBody) return;
  cryptoTableBody.innerHTML = '';

  filteredCryptoData.forEach(crypto => {
    const row = document.createElement('tr');
    const change24h = Number(crypto.price_change_percentage_24h ?? 0);
    const changeClass = change24h >= 0 ? 'positive' : 'negative';
    const changeText = `${change24h >= 0 ? '+' : ''}${change24h.toFixed(2)}%`;

    const price = typeof crypto.current_price === 'number' ? crypto.current_price : 0;
    const mcap = typeof crypto.market_cap === 'number' ? crypto.market_cap : 0;
    const mcapRank = crypto.market_cap_rank ?? '-';
    const name = crypto.name || '';
    const sym = (crypto.symbol || '').toUpperCase();
    const img = crypto.image || '';

    row.innerHTML = `
      <td>${mcapRank}</td>
      <td>
        ${img ? `<img src="${img}" alt="${name}" width="20" height="20">` : ''}
        ${name} (${sym})
      </td>
      <td>$${price.toLocaleString()}</td>
      <td class="${changeClass}">${changeText}</td>
      <td>$${mcap.toLocaleString()}</td>
      <td>
        <button class="action-btn buy-btn" data-id="${crypto.id}">Buy</button>
      </td>
    `;
    cryptoTableBody.appendChild(row);
  });

  document.querySelectorAll('.buy-btn').forEach(button => {
    button.addEventListener('click', (e) => {
      const cryptoId = e.currentTarget.getAttribute('data-id');
      const crypto = filteredCryptoData.find(c => c.id === cryptoId);
      if (crypto) {
        switchTab('trade');
        if (tradeAssetSelect) tradeAssetSelect.value = cryptoId;
        setTradeType('buy');
        updateTradeForm();
      }
    });
  });
}

// Update the portfolio table
function updatePortfolioTable() {
  if (!portfolioTableBody) return;

  portfolioTableBody.innerHTML = '';

  if (Object.keys(portfolio).length === 0) {
    const row = document.createElement('tr');
    row.innerHTML = '<td colspan="7" style="text-align: center;">Your portfolio is empty</td>';
    portfolioTableBody.appendChild(row);
    return;
  }

  Object.keys(portfolio).forEach(cryptoId => {
    const portfolioItem = portfolio[cryptoId];
    const crypto = cryptoData.find(c => c.id === cryptoId) || portfolioItem.lastKnownData;
    if (!crypto) return;

    const currentPrice = Number(crypto.current_price ?? portfolioItem.lastKnownPrice ?? 0);
    const avgBuyPrice = Number(portfolioItem.avgBuyPrice ?? currentPrice ?? 0);
    const amount = Number(portfolioItem.amount ?? 0);

    const value = amount * currentPrice;
    const totalCost = amount * avgBuyPrice;
    const profitLoss = value - totalCost;
    const plPercentage = totalCost > 0 ? (profitLoss / totalCost) * 100 : 0;

    const plClass = profitLoss >= 0 ? 'positive' : 'negative';
    const plText = `${profitLoss >= 0 ? '+' : ''}$${Math.abs(profitLoss).toFixed(2)} (${plPercentage >= 0 ? '+' : ''}${plPercentage.toFixed(2)}%)`;

    const name = crypto.name || '';
    const sym = (crypto.symbol || '').toUpperCase();
    const img = crypto.image || '';

    const row = document.createElement('tr');
    row.innerHTML = `
      <td>
        ${img ? `<img src="${img}" alt="${name}" width="20" height="20">` : ''}
        ${name} (${sym})
      </td>
      <td>${amount.toFixed(6)}</td>
      <td>$${avgBuyPrice.toFixed(2)}</td>
      <td>$${currentPrice.toFixed(2)}</td>
      <td>$${value.toFixed(2)}</td>
      <td class="${plClass}">${plText}</td>
      <td>
        <button class="action-btn sell-btn" data-id="${cryptoId}">Sell</button>
      </td>
    `;
    portfolioTableBody.appendChild(row);
  });

  document.querySelectorAll('.sell-btn').forEach(button => {
    button.addEventListener('click', (e) => {
      const cryptoId = e.currentTarget.getAttribute('data-id');
      switchTab('trade');
      if (tradeAssetSelect) tradeAssetSelect.value = cryptoId;
      setTradeType('sell');
      updateTradeForm();
    });
  });
}

// Update the portfolio summary
function updatePortfolioSummary() {
  if (!headerPortfolioValueElement || !summaryPortfolioValueElement) {
    console.error('Error: portfolio value elements not found in DOM');
    return;
  }

  let totalValue = 0;
  let totalCost = 0;
  let total24hChange = 0;
  let hasPositions = false;
  let totalPreviousValue = 0;

  Object.keys(portfolio).forEach(cryptoId => {
    const crypto = cryptoData.find(c => c.id === cryptoId) || portfolio[cryptoId]?.lastKnownData;
    if (!crypto) return;

    hasPositions = true;
    const currentPrice = Number(crypto.current_price ?? portfolio[cryptoId].lastKnownPrice ?? 0);
    const amount = Number(portfolio[cryptoId].amount ?? 0);
    const avgBuyPrice = Number(portfolio[cryptoId].avgBuyPrice ?? currentPrice ?? 0);

    const value = amount * currentPrice;
    const cost = amount * avgBuyPrice;

    const priceChange24h = Number(crypto.price_change_percentage_24h ?? 0);
    const price24hAgo = currentPrice / (1 + priceChange24h / 100);
    const value24hAgo = amount * price24hAgo;

    totalValue += value;
    totalCost += cost;
    totalPreviousValue += value24hAgo;
  });

  if (hasPositions && totalPreviousValue > 0) {
    total24hChange = ((totalValue - totalPreviousValue) / totalPreviousValue) * 100;
  }

  const profitLoss = hasPositions ? (totalValue - totalCost) : 0;
  const plPercentage = (hasPositions && totalCost > 0) ? (profitLoss / totalCost) * 100 : 0;

  const formattedValue = totalValue.toLocaleString('en-US', {
    style: 'currency', currency: 'USD', minimumFractionDigits: 2, maximumFractionDigits: 2
  });

  headerPortfolioValueElement.textContent = formattedValue;
  summaryPortfolioValueElement.textContent = formattedValue;

  if (totalPlElement) {
    const absPL = Math.abs(profitLoss).toLocaleString('en-US', {
      style: 'currency', currency: 'USD', minimumFractionDigits: 2, maximumFractionDigits: 2
    });
    const plText = hasPositions
      ? `${profitLoss >= 0 ? '+' : '-'}${absPL} (${plPercentage >= 0 ? '+' : ''}${plPercentage.toFixed(2)}%)`
      : '$0.00 (0.00%)';
    totalPlElement.textContent = plText;
    totalPlElement.className = `summary-value ${hasPositions ? (profitLoss >= 0 ? 'positive' : 'negative') : ''}`;
  }

  if (dailyChangeElement) {
    const changeText = hasPositions ? `${total24hChange >= 0 ? '+' : ''}${total24hChange.toFixed(2)}%` : '0.00%';
    dailyChangeElement.textContent = changeText;
    dailyChangeElement.className = `summary-value ${hasPositions ? (total24hChange >= 0 ? 'positive' : 'negative') : ''}`;
  }

  const startingCash = 10000;
  const totalBalance = Number(balance || 0) + totalValue;
  const totalProfitLoss = totalBalance - startingCash;
  const totalPlPercentage = (totalProfitLoss / startingCash) * 100;

  if (profitChangeElement) {
    profitChangeElement.textContent = `${totalPlPercentage >= 0 ? '+' : ''}${totalPlPercentage.toFixed(2)}%`;
    profitChangeElement.className = totalPlPercentage >= 0 ? 'positive' : 'negative';
  }

  if (profitAmountElement) {
    const abs = Math.abs(totalProfitLoss).toLocaleString('en-US', {
      style: 'currency', currency: 'USD', minimumFractionDigits: 2, maximumFractionDigits: 2
    });
    profitAmountElement.textContent = `${totalProfitLoss >= 0 ? '+' : '-'}${abs}`;
    profitAmountElement.className = totalPlPercentage >= 0 ? 'positive' : 'negative';
  }

  // Net worth chip sync
  syncNetworthChip();
}

// Update the trade asset select dropdown
function updateTradeAssetSelect() {
  if (!tradeAssetSelect) return;

  tradeAssetSelect.innerHTML = '';

  Object.keys(portfolio).forEach(cryptoId => {
    const crypto = cryptoData.find(c => c.id === cryptoId) || portfolio[cryptoId].lastKnownData;
    if (!crypto) return;
    const option = document.createElement('option');
    option.value = cryptoId;
    option.textContent = `${crypto.name} (${(crypto.symbol || '').toUpperCase()})`;
    tradeAssetSelect.appendChild(option);
  });

  if (Object.keys(portfolio).length > 0 && cryptoData.length > 0) {
    const separator = document.createElement('option');
    separator.disabled = true;
    separator.textContent = '──────────';
    tradeAssetSelect.appendChild(separator);
  }

  cryptoData.forEach(crypto => {
    if (!portfolio[crypto.id]) {
      const option = document.createElement('option');
      option.value = crypto.id;
      option.textContent = `${crypto.name} (${(crypto.symbol || '').toUpperCase()})`;
      tradeAssetSelect.appendChild(option);
    }
  });

  if (activeTab === 'trade') {
    updateTradeForm();
  }
}

// Update trade form based on selected asset and amount
function updateTradeForm() {
  const assetId = tradeAssetSelect?.value;
  const amount = parseFloat(tradeAmountInput?.value) || 0;

  // keep fee display 0.00 (simulator)
  if (feeDisplay) feeDisplay.textContent = '$0.00';

  if (!assetId) {
    if (currentPriceElement) currentPriceElement.textContent = '$0.00';
    if (quantityDisplayElement) quantityDisplayElement.textContent = '0.00';
    updateTradeContextHeader(null);
    updateHoldingsAndBalanceHints(null);
    updateOrderSummary('-', 0, 0, 0);
    updateTradeSideStyling();
    return;
  }

  const crypto = cryptoData.find(c => c.id === assetId) || portfolio[assetId]?.lastKnownData;
  if (!crypto) return;

  const currentPrice = Number(crypto.current_price ?? portfolio[assetId]?.lastKnownPrice ?? 0);
  const quantity = currentPrice > 0 ? (amount / currentPrice) : 0;

  if (currentPriceElement) currentPriceElement.textContent = `$${currentPrice.toFixed(2)}`;
  if (quantityDisplayElement) quantityDisplayElement.textContent = quantity.toFixed(6);

  updateTradeContextHeader(crypto);
  updateHoldingsAndBalanceHints(crypto);
  updateOrderSummary(assetId, amount, quantity, currentPrice);
  updateTradeSideStyling();
}

// Update the trade context header (avatar, name, symbol, 24h chip)
function updateTradeContextHeader(crypto) {
  if (!assetNameLabel && !assetSymbolLabel && !tradeAssetAvatar && !asset24hChip) return;

  if (!crypto) {
    if (assetNameLabel) assetNameLabel.textContent = 'Select an asset';
    if (assetSymbolLabel) assetSymbolLabel.textContent = '';
    if (tradeAssetAvatar) {
      tradeAssetAvatar.textContent = '₿';
      tradeAssetAvatar.style.backgroundImage = '';
      tradeAssetAvatar.style.backgroundSize = '';
      tradeAssetAvatar.style.backgroundPosition = '';
    }
    if (asset24hChip) {
      asset24hChip.textContent = '0.00%';
      asset24hChip.classList.remove('positive', 'negative');
    }
    return;
  }

  if (assetNameLabel) assetNameLabel.textContent = crypto.name || '';
  if (assetSymbolLabel) assetSymbolLabel.textContent = crypto.symbol ? crypto.symbol.toUpperCase() : '';

  // Avatar uses crypto.image if available; fallback to first letter
  if (tradeAssetAvatar) {
    if (crypto.image) {
      tradeAssetAvatar.style.backgroundImage = `url(${crypto.image})`;
      tradeAssetAvatar.style.backgroundSize = 'cover';
      tradeAssetAvatar.style.backgroundPosition = 'center';
      tradeAssetAvatar.textContent = '';
    } else {
      tradeAssetAvatar.style.backgroundImage = '';
      tradeAssetAvatar.textContent = (crypto.symbol || crypto.name || '₿').toString().slice(0,1).toUpperCase();
    }
  }

  // 24h chip
  if (asset24hChip) {
    const chg = Number(crypto.price_change_percentage_24h ?? 0);
    const cls = chg >= 0 ? 'positive' : 'negative';
    asset24hChip.textContent = `${chg >= 0 ? '+' : ''}${chg.toFixed(2)}%`;
    asset24hChip.classList.remove('positive', 'negative');
    asset24hChip.classList.add(cls);
  }
}

// Update holdings hint and inline cash balance
function updateHoldingsAndBalanceHints(crypto) {
  if (balanceInline && balanceElement) balanceInline.textContent = balanceElement.textContent || '$0.00';

  if (!holdingsHint) return;
  if (!crypto) {
    holdingsHint.textContent = 'Holdings: --';
    return;
  }

  const pos = portfolio[crypto.id];
  if (!pos) {
    holdingsHint.textContent = 'Holdings: 0.000000';
    return;
  }
  holdingsHint.textContent = `Holdings: ${Number(pos.amount || 0).toFixed(6)}`;
}

// Update order summary
function updateOrderSummary(assetId, amount, quantity, price) {
  const crypto = cryptoData.find(c => c.id === assetId) || portfolio[assetId]?.lastKnownData;

  const tradeType = tradeTypeElement?.value || 'buy';
  if (orderSummaryType) orderSummaryType.textContent = tradeType === 'buy' ? 'Buy' : 'Sell';
  if (orderSummaryAsset) orderSummaryAsset.textContent = crypto ? `${crypto.name} (${crypto.symbol?.toUpperCase()})` : '-';
  if (orderSummaryAmount) orderSummaryAmount.textContent = `$${(amount || 0).toFixed(2)}`;
  if (orderSummaryQuantity) orderSummaryQuantity.textContent = (quantity || 0).toFixed(6);
}

// Update the balance display
function updateBalanceDisplay() {
  if (!balanceElement) {
    console.error('Error: balanceElement is not found in the DOM. Ensure the HTML contains an element with id="balance".');
    return;
  }
  const formattedBalance = `$${Number(balance || 0).toLocaleString('en-US', {
    style: 'decimal', minimumFractionDigits: 2, maximumFractionDigits: 2
  })}`;
  balanceElement.textContent = formattedBalance;
  syncInlineBalance();
  syncNetworthChip();
}

// Setup event listeners
function setupEventListeners() {
  // Tab switching
  tabButtons.forEach(button => {
    button.addEventListener('click', () => {
      const tabName = button.getAttribute('data-tab');
      switchTab(tabName);
    });
  });

  // Execute trade button
  if (executeTradeBtn) {
    executeTradeBtn.addEventListener('click', () => {
      const assetId = tradeAssetSelect?.value;
      const tradeType = tradeTypeElement?.value;
      const amount = parseFloat(tradeAmountInput?.value);

      if (!assetId) {
        showNotification('Please select a cryptocurrency', 'error');
        return;
      }
      if (isNaN(amount) || amount <= 0) {
        showNotification('Please enter a valid amount greater than 0', 'error');
        return;
      }

      const crypto = cryptoData.find(c => c.id === assetId) || portfolio[assetId]?.lastKnownData;
      if (!crypto) {
        showNotification('Selected cryptocurrency not found', 'error');
        return;
      }

      const currentPrice = Number(crypto.current_price ?? portfolio[assetId]?.lastKnownPrice ?? 0);
      if (currentPrice <= 0) {
        showNotification('Invalid price for this asset right now', 'error');
        return;
      }
      const quantity = amount / currentPrice;

      showTradeConfirmation(assetId, tradeType, amount, quantity, currentPrice);
    });
  }

  // Confirm trade in modal
  if (confirmTradeBtn) {
    confirmTradeBtn.addEventListener('click', () => {
      const assetId = confirmTradeBtn.getAttribute('data-asset-id');
      const tradeType = confirmTradeBtn.getAttribute('data-trade-type');
      const amount = parseFloat(confirmTradeBtn.getAttribute('data-amount'));
      const quantity = parseFloat(confirmTradeBtn.getAttribute('data-quantity'));
      const price = parseFloat(confirmTradeBtn.getAttribute('data-price'));
      executeTrade(assetId, tradeType, amount, quantity, price);
      if (modal) modal.style.display = 'none';
    });
  }

  // Close modal buttons
  if (closeModal && modal) closeModal.addEventListener('click', () => { modal.style.display = 'none'; });
  if (cancelTradeBtn && modal) cancelTradeBtn.addEventListener('click', () => { modal.style.display = 'none'; });

  // Refresh
  refreshBtn?.addEventListener('click', fetchCryptoData);

  // Search
  searchInput?.addEventListener('input', () => {
    const searchTerm = (searchInput.value || '').toLowerCase();
    filteredCryptoData = cryptoData.filter(crypto =>
      (crypto.name || '').toLowerCase().includes(searchTerm) ||
      (crypto.symbol || '').toLowerCase().includes(searchTerm)
    );
    updateCryptoTable();
  });

  // Filters
  filterButtons.forEach(button => {
    button.addEventListener('click', () => {
      filterButtons.forEach(btn => btn.classList.remove('active'));
      button.classList.add('active');
      const filter = button.getAttribute('data-filter');
      applyMarketFilter(filter);
    });
  });

  // Toggle buttons (buy/sell)
  toggleButtons.forEach(button => {
    button.addEventListener('click', () => {
      toggleButtons.forEach(btn => btn.classList.remove('active'));
      button.classList.add('active');
      const value = button.getAttribute('data-value');
      setTradeType(value);
      updateTradeSideStyling();
    });
  });

  // Amount inputs
  tradeAmountInput?.addEventListener('input', () => {
    if (amountSlider) amountSlider.value = tradeAmountInput.value;
    updateTradeForm();
  });

  amountSlider?.addEventListener('input', () => {
    if (tradeAmountInput) tradeAmountInput.value = amountSlider.value;
    updateTradeForm();
  });

  // Quick amount chips
  quickAmountChips.forEach(chip => {
    chip.addEventListener('click', () => {
      const pct = parseFloat(chip.getAttribute('data-chip')) || 0;
      const side = tradeTypeElement?.value || 'buy';
      const assetId = tradeAssetSelect?.value;
      const crypto = cryptoData.find(c => c.id === assetId) || portfolio[assetId]?.lastKnownData;
      const price = Number(crypto?.current_price ?? portfolio[assetId]?.lastKnownPrice ?? 0);

      let base = 0;
      if (side === 'buy') {
        base = Number(balance || 0); // use cash balance
      } else {
        // use holdings value (amount * current price)
        const qty = Number(portfolio[assetId]?.amount || 0);
        base = qty * (price || 0);
      }

      const targetAmount = Math.max(0, base * pct);
      if (tradeAmountInput) tradeAmountInput.value = targetAmount.toFixed(2);
      if (amountSlider) {
        const max = parseFloat(amountSlider.max || '10000');
        const val = Math.min(Math.max(0, targetAmount), max);
        amountSlider.value = String(Math.round(val));
      }
      updateTradeForm();
    });
  });

  // Asset change
  tradeAssetSelect?.addEventListener('change', updateTradeForm);

  // Close modal when clicking outside
  window.addEventListener('click', (e) => {
    if (modal && e.target === modal) {
      modal.style.display = 'none';
    }
  });

  // Reset
  const resetBtn = document.getElementById('reset-btn');
  resetBtn?.addEventListener('click', resetAppData);
}

// Switch between tabs
function switchTab(tabName) {
  activeTab = tabName;

  tabButtons.forEach(button => {
    if (button.getAttribute('data-tab') === tabName) button.classList.add('active');
    else button.classList.remove('active');
  });

  tabContents.forEach(content => {
    if (content.id === `${tabName}-tab`) content.classList.add('active');
    else content.classList.remove('active');
  });

  if (tabName === 'trade') {
    updateTradeForm();
  }
}

// Apply market filter
function applyMarketFilter(filter) {
  if (!cryptoData.length) return;

  switch (filter) {
    case 'all':
      filteredCryptoData = [...cryptoData];
      break;
    case 'gainers':
      filteredCryptoData = [...cryptoData]
        .filter(c => Number(c.price_change_percentage_24h ?? 0) >= 0)
        .sort((a, b) => Number(b.price_change_percentage_24h ?? 0) - Number(a.price_change_percentage_24h ?? 0));
      break;
    case 'losers':
      filteredCryptoData = [...cryptoData]
        .filter(c => Number(c.price_change_percentage_24h ?? 0) < 0)
        .sort((a, b) => Number(a.price_change_percentage_24h ?? 0) - Number(b.price_change_percentage_24h ?? 0));
      break;
    default:
      filteredCryptoData = [...cryptoData];
  }
  updateCryptoTable();
}

// Set trade type (buy/sell)
function setTradeType(type) {
  if (tradeTypeElement) tradeTypeElement.value = type;
  updateTradeForm();
  updateTradeSideStyling();
}

// Adapt form styling and CTA to Buy/Sell side
function updateTradeSideStyling() {
  const side = tradeTypeElement?.value || 'buy';
  if (tradeFormContainer) {
    tradeFormContainer.classList.toggle('buy-side', side === 'buy');
    tradeFormContainer.classList.toggle('sell-side', side === 'sell');
  }
  if (tradeCtaButton) {
    tradeCtaButton.textContent = side === 'buy' ? 'Preview Buy Order' : 'Preview Sell Order';
  }
}

// Show trade confirmation modal
function showTradeConfirmation(assetId, tradeType, amount, quantity, price) {
  const crypto = cryptoData.find(c => c.id === assetId) || portfolio[assetId]?.lastKnownData;
  if (!modal || !confirmTradeBtn || !modalTitle || !modalContent || !crypto) return;

  modalTitle.textContent = `${tradeType === 'buy' ? 'Buy' : 'Sell'} Confirmation`;

  const sym = (crypto.symbol || '').toUpperCase();
  const avgBuy = portfolio[assetId]?.avgBuyPrice ?? 0;
  const estPL = (price - avgBuy) * quantity;
  const estPLClass = estPL >= 0 ? 'positive' : 'negative';

  modalContent.innerHTML = `
    <div class="confirmation-details">
      <p>You are about to <strong>${tradeType}</strong> <strong>${quantity.toFixed(6)} ${sym}</strong> at <strong>$${price.toFixed(2)}</strong> each.</p>
      <p>Total ${tradeType === 'buy' ? 'cost' : 'value'}: <strong>$${amount.toFixed(2)}</strong></p>
      ${tradeType === 'sell' && portfolio[assetId] ? `
        <p>Average buy price: <strong>$${avgBuy.toFixed(2)}</strong></p>
        <p>Estimated P/L: <strong class="${estPLClass}">$${estPL.toFixed(2)}</strong></p>
      ` : ''}
    </div>
  `;

  confirmTradeBtn.setAttribute('data-asset-id', assetId);
  confirmTradeBtn.setAttribute('data-trade-type', tradeType);
  confirmTradeBtn.setAttribute('data-amount', String(amount));
  confirmTradeBtn.setAttribute('data-quantity', String(quantity));
  confirmTradeBtn.setAttribute('data-price', String(price));

  modal.style.display = 'block';
}

// Execute a trade
function executeTrade(assetId, tradeType, amount, quantity, price) {
  console.log('Trade executed - Type:', tradeType, 'Asset ID:', assetId, 'Amount:', amount, 'Quantity:', quantity, 'Price:', price, 'Current balance:', balance);

  const crypto = cryptoData.find(c => c.id === assetId) || portfolio[assetId]?.lastKnownData;
  if (!crypto) {
    showNotification('Asset not found', 'error');
    return;
  }

  if (tradeType === 'buy') {
    if (amount > balance) {
      showNotification('Insufficient balance', 'error');
      console.log('Trade failed - Insufficient balance');
      return;
    }

    balance -= amount;

    if (portfolio[assetId]) {
      const prevQty = Number(portfolio[assetId].amount || 0);
      const prevAvg = Number(portfolio[assetId].avgBuyPrice || 0);
      const prevCost = prevQty * prevAvg;

      const newQty = prevQty + quantity;
      const newCost = prevCost + amount;

      portfolio[assetId].amount = newQty;
      portfolio[assetId].avgBuyPrice = newQty > 0 ? (newCost / newQty) : price;
      portfolio[assetId].lastKnownPrice = price;
      portfolio[assetId].lastKnownData = crypto;
    } else {
      portfolio[assetId] = {
        amount: quantity,
        avgBuyPrice: price,
        lastKnownPrice: price,
        lastKnownData: crypto
      };
    }

    showNotification(`Successfully bought ${quantity.toFixed(6)} ${(crypto.symbol || '').toUpperCase()} for $${amount.toFixed(2)}`, 'success');
  } else {
    if (!portfolio[assetId] || portfolio[assetId].amount < quantity) {
      showNotification('Insufficient amount to sell', 'error');
      console.log('Trade failed - Insufficient amount to sell');
      return;
    }

    balance += amount;
    portfolio[assetId].amount -= quantity;

    if (portfolio[assetId].amount <= 0.000001) {
      delete portfolio[assetId];
    }
    showNotification(`Successfully sold ${quantity.toFixed(6)} ${(crypto.symbol || '').toUpperCase()} for $${amount.toFixed(2)}`, 'success');
  }

  updateBalanceDisplay();
  updatePortfolioTable();
  updateTradeAssetSelect();
  updatePortfolioSummary();

  saveToLocalStorage();

  // Reset trade form inputs to default
  if (tradeAmountInput) tradeAmountInput.value = '100';
  if (amountSlider) amountSlider.value = '100';
  updateTradeForm();
}

// Show notification
function showNotification(message, type = 'success') {
  if (!notification || !notificationMessage) {
    console[type === 'error' ? 'error' : 'log'](message);
    return;
  }
  notificationMessage.textContent = message;
  notification.className = `notification ${type}`;
  notification.style.display = 'flex';
  setTimeout(() => { if (notification) notification.style.display = 'none'; }, 3000);
}

// Save to localStorage
function saveToLocalStorage() {
  const cleanPortfolio = {};
  Object.keys(portfolio).forEach(cryptoId => {
    cleanPortfolio[cryptoId] = {
      amount: portfolio[cryptoId].amount,
      avgBuyPrice: portfolio[cryptoId].avgBuyPrice,
      lastKnownPrice: portfolio[cryptoId].lastKnownPrice,
      lastKnownData: {
        id: portfolio[cryptoId].lastKnownData?.id,
        name: portfolio[cryptoId].lastKnownData?.name,
        symbol: portfolio[cryptoId].lastKnownData?.symbol,
        image: portfolio[cryptoId].lastKnownData?.image
      }
    };
  });

  const data = { balance, portfolio: cleanPortfolio };
  localStorage.setItem('cryptoPortfolio', JSON.stringify(data));
}

// Helpers

function syncInlineBalance() {
  if (!balanceInline || !balanceElement) return;
  balanceInline.textContent = balanceElement.textContent || '$0.00';
}

function syncNetworthChip() {
  if (!networthChip || !balanceElement || !headerPortfolioValueElement) return;
  const parseUSD = (s) => Number(String(s).replace(/[^0-9.\-]/g,'')) || 0;
  const net = parseUSD(balanceElement.textContent) + parseUSD(headerPortfolioValueElement.textContent);
  networthChip.textContent = net.toLocaleString('en-US', { style:'currency', currency:'USD', minimumFractionDigits:2, maximumFractionDigits:2 });
}

// Update quick stats: assets listed, top gainer/loser, BTC market cap
function updateQuickStats() {
  if (!Array.isArray(cryptoData) || cryptoData.length === 0) return;

  // Assets listed
  if (qsAssetsEl) {
    qsAssetsEl.textContent = cryptoData.length.toString();
  }

  // Top gainer and loser by 24h %
  const withChange = cryptoData.filter(c => typeof c.price_change_percentage_24h === 'number');
  if (withChange.length) {
    // Gainer
    const gainer = [...withChange].sort(
      (a, b) => (b.price_change_percentage_24h || 0) - (a.price_change_percentage_24h || 0)
    )[0];
    if (qsGainerEl && gainer) {
      const sym = (gainer.symbol || gainer.name || '').toUpperCase();
      const chg = (gainer.price_change_percentage_24h || 0).toFixed(1);
      qsGainerEl.textContent = `${sym} ${chg}%`;
    }

    // Loser
    const loser = [...withChange].sort(
      (a, b) => (a.price_change_percentage_24h || 0) - (b.price_change_percentage_24h || 0)
    )[0];
    if (qsLoserEl && loser) {
      const sym = (loser.symbol || loser.name || '').toUpperCase();
      const chg = (loser.price_change_percentage_24h || 0).toFixed(1);
      qsLoserEl.textContent = `${sym} ${chg}%`;
    }
  } else {
    if (qsGainerEl) qsGainerEl.textContent = 'N/A';
    if (qsLoserEl) qsLoserEl.textContent = 'N/A';
  }

  // BTC market cap
  if (qsBtcmcapEl) {
    const btc =
      cryptoData.find(x => x.id === 'bitcoin') ||
      cryptoData.find(x => (x.symbol || '').toLowerCase() === 'btc') ||
      cryptoData.find(x => (x.name || '').toLowerCase() === 'bitcoin');

    if (btc && typeof btc.market_cap === 'number' && !Number.isNaN(btc.market_cap)) {
      qsBtcmcapEl.textContent = `$${btc.market_cap.toLocaleString('en-US')}`;
    } else {
      qsBtcmcapEl.textContent = 'N/A';
    }
  }
}
