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
    // Load portfolio data from localStorage
    const portfolio = JSON.parse(localStorage.getItem('portfolio')) || {}; // User's stock portfolio
    const balance = parseFloat(localStorage.getItem('balance')) || 0; // Available cash balance
    const initialBalance = parseFloat(localStorage.getItem('initialBalance')) || balance; // Initial investment balance
    const portfolioHistory = JSON.parse(localStorage.getItem('portfolioHistory')) || generateSampleHistory(); // Portfolio value history

    // Calculate portfolio metrics such as equity value, total value, and profit/loss percentage
    function calculatePortfolioMetrics() {
        let equityValue = 0; // Total value of stocks in the portfolio
        let totalInvested = initialBalance; // Initial investment amount

        // Calculate equity value by summing up the value of all stocks
        for (const symbol in portfolio) {
            const stock = portfolio[symbol];
            equityValue += stock.shares * (stock.currentPrice || stock.avgPrice); // Use current price or average price
        }

        const totalValue = equityValue + balance; // Total portfolio value (equity + cash)
        const percentChange = initialBalance > 0 
            ? ((totalValue - initialBalance) / initialBalance) * 100 // Calculate profit/loss percentage
            : 0;

        const goalAmount = initialBalance * 2; // Example goal: double the initial investment
        const progressPercent = goalAmount > 0 
            ? Math.min((totalValue / goalAmount) * 100, 100) // Progress towards the goal
            : 0;

        return {
            equityValue,
            totalValue,
            percentChange,
            progressPercent,
            balance,
            goalAmount
        };
    }

    // Generate sample portfolio history if none exists
    function generateSampleHistory() {
        const history = [];
        const now = new Date();
        for (let i = 30; i >= 0; i--) { // Generate data for the past 30 days
            const date = new Date(now);
            date.setDate(date.getDate() - i);
            history.push({
                date: date.toISOString().split('T')[0], // Format date as "YYYY-MM-DD"
                value: 10000 + Math.random() * 2000 * (i / 30) // Simulate portfolio value
            });
        }
        localStorage.setItem('portfolioHistory', JSON.stringify(history)); // Save to localStorage
        return history;
    }

    // Initialize the mini chart to visualize portfolio performance
    function initMiniChart() {
        const ctx = document.getElementById('portfolioMiniChart').getContext('2d');
        const history = portfolioHistory;

        // Determine chart color based on performance (green for positive, red for negative)
        const firstValue = history[0].value;
        const lastValue = history[history.length - 1].value;
        const chartColor = lastValue >= firstValue ? '#10b981' : '#ef4444';

        // Create the chart using Chart.js
        new Chart(ctx, {
            type: 'line',
            data: {
                labels: history.map(item => item.date.split('-')[2]), // Show day numbers as labels
                datasets: [{
                    data: history.map(item => item.value), // Portfolio values
                    borderColor: chartColor, // Line color
                    borderWidth: 2,
                    fill: false,
                    tension: 0.4, // Smoothness of the line
                    pointRadius: 0 // Hide data points
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: { display: false }, // Hide legend
                    tooltip: { enabled: false } // Disable tooltips
                },
                scales: {
                    x: {
                        display: false, // Hide x-axis
                        grid: { display: false }
                    },
                    y: {
                        display: false, // Hide y-axis
                        grid: { display: false }
                    }
                },
                interaction: { intersect: false } // Smooth interaction
            }
        });
    }

    // Update the UI with portfolio data
    function updatePortfolioDisplay() {
        const metrics = calculatePortfolioMetrics(); // Get portfolio metrics

        // Update total portfolio value
        document.getElementById('portfolio-current-value').textContent = 
            `$${metrics.totalValue.toLocaleString('en-US', {minimumFractionDigits: 2, maximumFractionDigits: 2})}`;

        // Update equity value
        document.getElementById('portfolio-equity').textContent = 
            `Equity: $${metrics.equityValue.toLocaleString('en-US', {minimumFractionDigits: 2, maximumFractionDigits: 2})}`;

        // Update cash balance
        document.getElementById('portfolio-cash').textContent = 
            `Cash: $${metrics.balance.toLocaleString('en-US', {minimumFractionDigits: 2, maximumFractionDigits: 2})}`;

        // Update trend indicator (arrow and percentage)
        const trendElement = document.getElementById('portfolio-trend');
        const arrow = trendElement.querySelector('.trend-arrow'); // Arrow element
        const percentage = trendElement.querySelector('.percentage-value'); // Percentage element

        arrow.textContent = metrics.percentChange >= 0 ? '↗' : '↘'; // Up arrow for positive, down arrow for negative
        percentage.textContent = `${metrics.percentChange >= 0 ? '+' : ''}${metrics.percentChange.toFixed(2)}%`;

        // Update trend classes for styling
        trendElement.className = `fp-card-trend trend-${metrics.percentChange >= 0 ? 'positive' : 'negative'}`;
        percentage.className = `percentage-value percentage-${metrics.percentChange >= 0 ? 'positive' : 'negative'}`;
    }

    // Initialize everything
    updatePortfolioDisplay(); // Update the portfolio display
    initMiniChart(); // Initialize the mini chart

    // Periodic refresh to update portfolio data every 30 seconds
    setInterval(() => {
        updatePortfolioDisplay();
    }, 30000);
});
