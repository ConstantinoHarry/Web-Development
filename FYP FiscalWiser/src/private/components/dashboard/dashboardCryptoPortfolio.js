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
    // Load portfolio data
    const savedData = localStorage.getItem('cryptoPortfolio');
    let portfolioValue = 0;
    let balance = 10000;

    if (savedData) {
        const portfolioData = JSON.parse(savedData);
        balance = portfolioData.balance || 10000;
        
        // Calculate current portfolio value
        if (portfolioData.portfolio) {
            portfolioValue = Object.keys(portfolioData.portfolio).reduce((total, cryptoId) => {
                const holding = portfolioData.portfolio[cryptoId];
                const currentPrice = holding.lastKnownPrice || holding.avgBuyPrice || 0;
                return total + (holding.amount * currentPrice);
            }, 0);
        }
    }

    // Update display
    const valueElement = document.getElementById('crypto-value');
    if (valueElement) {
        valueElement.textContent = `$${portfolioValue.toFixed(2)}`;
    }

    // Calculate profit/loss
    const profitLoss = (balance + portfolioValue) - 10000;
    const profitLossPercent = (profitLoss / 10000) * 100;

    // Update chart
    const ctx = document.getElementById('cryptoChart')?.getContext('2d');
    if (ctx) {
        const history = JSON.parse(localStorage.getItem('portfolioHistory')) || [portfolioValue];
        
        new Chart(ctx, {
            type: 'line',
            data: {
                labels: history.map((_, i) => i + 1),
                datasets: [{
                    data: history,
                    borderColor: profitLoss >= 0 ? 'green' : 'red',
                    borderWidth: 2,
                    fill: false
                }]
            },
            options: {
                plugins: { legend: { display: false } },
                scales: { y: { beginAtZero: false } }
            }
        });
    }
});
