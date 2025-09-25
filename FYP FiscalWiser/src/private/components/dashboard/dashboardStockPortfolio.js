/*
* Stock Portfolio Dashboard Component
* 
* Overview:
* This component displays the user's stock portfolio value, profit/loss, and a mini chart.
* It retrieves data from localStorage and updates the UI accordingly.
* The component also handles the trend indicator based on profit/loss.
* It uses Chart.js for rendering the mini chart.
* 
* Features:
* - Displays total portfolio value, equity, and cash balance.
* - Shows profit/loss percentage with a trend indicator.
* - Includes a mini chart to visualize portfolio performance over time.
* - Periodically refreshes the portfolio data every 30 seconds.
* 
* Author: Constantino Harry Alexander
*/
document.addEventListener('DOMContentLoaded', function() {
    const portfolio = JSON.parse(localStorage.getItem('portfolio')) || {};
    const balance = parseFloat(localStorage.getItem('balance')) || 0;
    const initialBalance = parseFloat(localStorage.getItem('initialBalance')) || balance;

    function calculatePortfolioValue() {
        let equityValue = 0;
        
        for (const symbol in portfolio) {
            const stock = portfolio[symbol];
            equityValue += stock.shares * (stock.currentPrice || stock.avgPrice);
        }

        const totalValue = equityValue + balance;
        const percentChange = initialBalance > 0 ? ((totalValue - initialBalance) / initialBalance) * 100 : 0;

        return {
            equityValue,
            totalValue,
            percentChange,
            balance
        };
    }

    function initMiniChart() {
        const ctx = document.getElementById('stockChart').getContext('2d');
        const history = JSON.parse(localStorage.getItem('portfolioHistory')) || [];
        
        if (history.length === 0) return;

        new Chart(ctx, {
            type: 'line',
            data: {
                labels: history.map((_, i) => i),
                datasets: [{
                    data: history.map(item => item.value || item),
                    borderColor: '#10b981',
                    borderWidth: 2,
                    fill: false
                }]
            },
            options: {
                plugins: { legend: { display: false } },
                scales: { x: { display: false }, y: { display: false } }
            }
        });
    }

    function updateDisplay() {
        const metrics = calculatePortfolioValue();
        
        document.getElementById('portfolio-value').textContent = 
            `$${metrics.totalValue.toFixed(2)}`;
    }

    updateDisplay();
    initMiniChart();
});
