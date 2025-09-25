/*
* Crypto Portfolio Dashboard Component
* 
* Updated to properly sync with the main Crypto Paper Trading Simulator
* Now correctly calculates portfolio value from the stored cryptoPortfolio data
* Includes proper error handling and data validation
* 
* Author: Constantino Harry Alexander
*/

document.addEventListener('DOMContentLoaded', () => {
    // Load and process portfolio data
    let portfolioValue = 0;
    let balance = 10000; // Default starting balance
    let portfolioData = {};

    try {
        const savedData = localStorage.getItem('cryptoPortfolio');
        if (savedData) {
            portfolioData = JSON.parse(savedData);
            balance = portfolioData.balance || 10000;
            
            // Calculate current portfolio value from holdings
            if (portfolioData.portfolio) {
                portfolioValue = Object.keys(portfolioData.portfolio).reduce((total, cryptoId) => {
                    const holding = portfolioData.portfolio[cryptoId];
                    const currentPrice = holding.lastKnownPrice || holding.avgBuyPrice || 0;
                    return total + (holding.amount * currentPrice);
                }, 0);
            }
        }
    } catch (e) {
        console.error('Error loading portfolio data:', e);
    }

    // Update the portfolio value display
    const portfolioCurrentValueElement = document.getElementById('portfolio-current-value');
    if (portfolioCurrentValueElement) {
        portfolioCurrentValueElement.textContent = `$${portfolioValue.toLocaleString('en-US', {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
        })}`;
    }

    // Calculate profit/loss (matches main script logic)
    const totalBalance = balance + portfolioValue;
    const initialBalance = 10000;
    const profitLoss = totalBalance - initialBalance;
    const profitLossPercentage = (profitLoss / initialBalance) * 100;

    // Update profit/loss display
    const portfolioProfitLossElement = document.getElementById('portfolio-profit-loss');
    if (portfolioProfitLossElement) {
        portfolioProfitLossElement.textContent = 
            `${profitLoss >= 0 ? '+' : ''}$${Math.abs(profitLoss).toFixed(2)} ` +
            `(${profitLoss >= 0 ? '+' : ''}${profitLossPercentage.toFixed(2)}%)`;
    }

    // Update trend indicator
    const portfolioTrendIndicatorElement = document.getElementById('portfolio-trend-indicator');
    if (portfolioTrendIndicatorElement) {
        if (profitLoss > 0) {
            portfolioTrendIndicatorElement.textContent = 'Up';
            portfolioTrendIndicatorElement.className = 'trend-up';
        } else if (profitLoss < 0) {
            portfolioTrendIndicatorElement.textContent = 'Down';
            portfolioTrendIndicatorElement.className = 'trend-down';
        } else {
            portfolioTrendIndicatorElement.textContent = 'Stable';
            portfolioTrendIndicatorElement.className = 'trend-stable';
        }
    }

    // Initialize chart with better data handling
    const ctx = document.getElementById('portfolio-mini-chart')?.getContext('2d');
    if (ctx) {
        try {
            // Try to load historical data if available
            const history = JSON.parse(localStorage.getItem('portfolioHistory')) || [];
            
            // Ensure we have at least the current value
            if (history.length === 0 || history[history.length - 1] !== portfolioValue) {
                history.push(portfolioValue);
                if (history.length > 5) history.shift();
            }

            new Chart(ctx, {
                type: 'line',
                data: {
                    labels: Array.from({length: history.length}, (_, i) => `Day ${i+1}`),
                    datasets: [{
                        label: 'Portfolio Value',
                        data: history,
                        borderColor: profitLoss >= 0 ? 'rgba(75, 192, 192, 1)' : 'rgba(255, 99, 132, 1)',
                        borderWidth: 2,
                        tension: 0.1,
                        fill: false
                    }]
                },
                options: {
                    responsive: true,
                    plugins: {
                        legend: { display: false }
                    },
                    scales: {
                        y: { beginAtZero: false }
                    }
                }
            });
        } catch (e) {
            console.error('Error initializing chart:', e);
        }
    }
});

// Helper function to update portfolio history (call this from your main script when values change)
function updatePortfolioHistory(currentValue) {
    try {
        const history = JSON.parse(localStorage.getItem('portfolioHistory')) || [];
        history.push(currentValue);
        if (history.length > 5) history.shift(); // Keep only last 5 values
        localStorage.setItem('portfolioHistory', JSON.stringify(history));
    } catch (e) {
        console.error('Error updating portfolio history:', e);
    }
}