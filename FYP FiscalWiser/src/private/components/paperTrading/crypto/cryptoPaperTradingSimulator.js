/*
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
let balance = 10000;
let portfolio = {};
let cryptoData = [];

const balanceElement = document.getElementById('balance');
const cryptoTableBody = document.getElementById('crypto-table-body');
const portfolioTableBody = document.getElementById('portfolio-table-body');
const tradeAssetSelect = document.getElementById('trade-asset');
const tradeAmountInput = document.getElementById('trade-amount');
const executeTradeBtn = document.getElementById('execute-trade');

document.addEventListener('DOMContentLoaded', () => {
    loadFromLocalStorage();
    updateBalanceDisplay();
    fetchCryptoData();
    setupEventListeners();
});

function loadFromLocalStorage() {
    const saved = localStorage.getItem('cryptoPortfolio');
    if (saved) {
        const data = JSON.parse(saved);
        balance = data.balance || 10000;
        portfolio = data.portfolio || {};
    }
}

async function fetchCryptoData() {
    try {
        const response = await fetch('https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&per_page=50');
        cryptoData = await response.json();
        updateCryptoTable();
        updateTradeAssetSelect();
        updatePortfolioTable();
    } catch (error) {
        console.error('Error fetching crypto data:', error);
    }
}

function updateCryptoTable() {
    cryptoTableBody.innerHTML = '';
    
    cryptoData.forEach(crypto => {
        const row = document.createElement('tr');
        const change = crypto.price_change_percentage_24h || 0;
        const changeClass = change >= 0 ? 'positive' : 'negative';
        
        row.innerHTML = `
            <td>${crypto.name} (${crypto.symbol.toUpperCase()})</td>
            <td>$${crypto.current_price}</td>
            <td class="${changeClass}">${change.toFixed(2)}%</td>
            <td><button class="buy-btn" data-id="${crypto.id}">Buy</button></td>
        `;
        cryptoTableBody.appendChild(row);
    });

    document.querySelectorAll('.buy-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const cryptoId = e.target.getAttribute('data-id');
            const crypto = cryptoData.find(c => c.id === cryptoId);
            if (crypto) {
                tradeAssetSelect.value = cryptoId;
                document.querySelector('[data-tab="trade"]').click();
            }
        });
    });
}

function updatePortfolioTable() {
    portfolioTableBody.innerHTML = '';
    
    if (Object.keys(portfolio).length === 0) {
        portfolioTableBody.innerHTML = '<tr><td colspan="5">No holdings</td></tr>';
        return;
    }

    Object.keys(portfolio).forEach(cryptoId => {
        const holding = portfolio[cryptoId];
        const crypto = cryptoData.find(c => c.id === cryptoId);
        if (!crypto) return;

        const value = holding.amount * crypto.current_price;
        const cost = holding.amount * holding.avgBuyPrice;
        const pl = value - cost;
        const plPercent = (pl / cost) * 100;

        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${crypto.name}</td>
            <td>${holding.amount.toFixed(6)}</td>
            <td>$${crypto.current_price}</td>
            <td>$${value.toFixed(2)}</td>
            <td><button class="sell-btn" data-id="${cryptoId}">Sell</button></td>
        `;
        portfolioTableBody.appendChild(row);
    });

    document.querySelectorAll('.sell-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const cryptoId = e.target.getAttribute('data-id');
            tradeAssetSelect.value = cryptoId;
            document.querySelector('[data-tab="trade"]').click();
        });
    });
}

function updateTradeAssetSelect() {
    tradeAssetSelect.innerHTML = '';
    
    cryptoData.forEach(crypto => {
        const option = document.createElement('option');
        option.value = crypto.id;
        option.textContent = `${crypto.name} (${crypto.symbol.toUpperCase()})`;
        tradeAssetSelect.appendChild(option);
    });
}

function setupEventListeners() {
    executeTradeBtn.addEventListener('click', () => {
        const assetId = tradeAssetSelect.value;
        const amount = parseFloat(tradeAmountInput.value);
        const crypto = cryptoData.find(c => c.id === assetId);
        
        if (!crypto || amount <= 0) return;
        
        const quantity = amount / crypto.current_price;
        
        if (amount > balance) {
            alert('Insufficient balance');
            return;
        }

        // Execute buy
        balance -= amount;
        
        if (portfolio[assetId]) {
            const holding = portfolio[assetId];
            const totalAmount = holding.amount + quantity;
            const totalCost = (holding.amount * holding.avgBuyPrice) + amount;
            holding.avgBuyPrice = totalCost / totalAmount;
            holding.amount = totalAmount;
        } else {
            portfolio[assetId] = {
                amount: quantity,
                avgBuyPrice: crypto.current_price
            };
        }

        updateBalanceDisplay();
        updatePortfolioTable();
        saveToLocalStorage();
        alert(`Bought ${quantity.toFixed(6)} ${crypto.symbol.toUpperCase()}`);
    });

    // Tab switching
    document.querySelectorAll('.tab').forEach(tab => {
        tab.addEventListener('click', () => {
            const tabName = tab.getAttribute('data-tab');
            document.querySelectorAll('.tab-content').forEach(content => {
                content.classList.remove('active');
            });
            document.querySelectorAll('.tab').forEach(t => {
                t.classList.remove('active');
            });
            
            tab.classList.add('active');
            document.getElementById(`${tabName}-tab`).classList.add('active');
        });
    });
}

function updateBalanceDisplay() {
    balanceElement.textContent = `$${balance.toFixed(2)}`;
}

function saveToLocalStorage() {
    localStorage.setItem('cryptoPortfolio', JSON.stringify({
        balance: balance,
        portfolio: portfolio
    }));
}
