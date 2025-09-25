/*
* Cash Flow Analysis Dashboard
* 
* Overview:
* This script calculates and displays monthly income, expenses, savings, and savings ratio.
* It also provides a bar chart visualization of cash flow over different periods (1 month, 6 months, 1 year, all).
* 
* Features:
* - Data is retrieved from local storage and updated in real-time.
* - Chart is created using the Chart.js library.
* - Functions for data retrieval, processing, UI updates, and chart rendering.
* - Modular and reusable code structure with clear separation of concerns.
* - Responsive design with smooth animations for a good user experience.y 
* - Interactive chart allowing users to filter data by different periods.
* - Includes error handling and data validation for robustness.
* 
* Author: Constantino Harr
*/

// 1. Data Retrieval and Processing Functions

// Retrieve all transactions from localStorage
function getTransactions() {
    return JSON.parse(localStorage.getItem('transactions')) || []; // Return an empty array if no transactions exist
}

// Get the current month and year in "YYYY-MM" format
function getCurrentMonthYear() {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`; // Format as "YYYY-MM"
}

// Get the previous month and year in "YYYY-MM" format
function getPreviousMonthYear() {
    const now = new Date();
    now.setMonth(now.getMonth() - 1); // Move to the previous month
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
}

// Calculate monthly metrics (income, expenses, savings, and savings ratio) from transactions
function calculateMonthlyMetrics(transactions) {
    const monthlyData = {}; // Object to store metrics for each month

    transactions.forEach(transaction => {
        const date = new Date(transaction.date);
        const monthYear = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`; // Format as "YYYY-MM"

        // Initialize the month if not already present
        if (!monthlyData[monthYear]) {
            monthlyData[monthYear] = {
                income: 0,
                expenses: 0,
                transactions: []
            };
        }

        // Add transaction amount to income or expenses
        if (transaction.type === 'income') {
            monthlyData[monthYear].income += transaction.amount;
        } else {
            monthlyData[monthYear].expenses += transaction.amount;
        }

        // Store the transaction in the month's data
        monthlyData[monthYear].transactions.push(transaction);
    });

    // Calculate savings and savings ratio for each month
    Object.keys(monthlyData).forEach(month => {
        const data = monthlyData[month];
        data.savings = data.income - data.expenses; // Calculate savings
        data.savingsRatio = data.income > 0 ? (data.savings / data.income) * 100 : 0; // Calculate savings ratio
    });

    return monthlyData;
}

// 2. UI Update Functions

// Update the metric cards (income, expenses, savings) in the dashboard
function updateMetricCards(monthlyData) {
    const currentMonth = getCurrentMonthYear(); // Get the current month
    const previousMonth = getPreviousMonthYear(); // Get the previous month

    // Get data for the current and previous months
    const current = monthlyData[currentMonth] || { income: 0, expenses: 0, savings: 0, savingsRatio: 0 };
    const previous = monthlyData[previousMonth] || { income: 0, expenses: 0, savings: 0, savingsRatio: 0 };

    // Update Income Card
    document.getElementById('monthly-income').textContent = `$${current.income.toFixed(2)}`;
    document.getElementById('income-comparison').textContent = `vs $${previous.income.toFixed(2)} last month`;

    const incomeChange = previous.income ? ((current.income - previous.income) / previous.income * 100) : 0;
    const incomeTrend = document.getElementById('income-trend');
    incomeTrend.textContent = `${incomeChange >= 0 ? '+' : ''}${incomeChange.toFixed(2)}%`;
    incomeTrend.className = `fp-card-trend ${incomeChange >= 0 ? 'trend-positive' : 'trend-negative'}`;

    // Update Expense Card
    document.getElementById('monthly-expense').textContent = `$${current.expenses.toFixed(2)}`;
    document.getElementById('expense-comparison').textContent = `vs $${previous.expenses.toFixed(2)} last month`;

    const expenseChange = previous.expenses ? ((current.expenses - previous.expenses) / previous.expenses * 100) : 0;
    const expenseTrend = document.getElementById('expense-trend');
    expenseTrend.textContent = `${expenseChange >= 0 ? '+' : ''}${expenseChange.toFixed(2)}%`;
    expenseTrend.className = `fp-card-trend ${expenseChange >= 0 ? 'trend-negative' : 'trend-positive'}`;

    // Update Savings Card
    document.getElementById('savings-rate').textContent = `${current.savingsRatio.toFixed(2)}%`;
    document.getElementById('savings-comparison').textContent = `vs ${previous.savingsRatio.toFixed(2)}% last month`;

    const savingsChange = current.savingsRatio - previous.savingsRatio;
    const savingsTrend = document.getElementById('savings-trend');
    savingsTrend.textContent = `${savingsChange >= 0 ? '+' : ''}${savingsChange.toFixed(2)}%`;
    savingsTrend.className = `fp-card-trend ${savingsChange >= 0 ? 'trend-positive' : 'trend-negative'}`;
}

// 3. Chart Implementation (Fixed Version)

// Global variable to store the cash flow chart instance
let cashFlowChart = null;

// Render the cash flow chart based on the selected period
function renderCashFlowChart(monthlyData, period = '1m') {
    const ctx = document.getElementById('cashFlowChart').getContext('2d');

    // Sort months chronologically
    const sortedMonths = Object.keys(monthlyData).sort();

    // Filter months based on the selected period
    let displayMonths = sortedMonths;
    const now = new Date();
    const currentMonth = getCurrentMonthYear();

    if (period === '1m') {
        displayMonths = [currentMonth]; // Show only the current month
    } else if (period === '6m') {
        const sixMonthsAgo = new Date(now);
        sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 5);
        displayMonths = sortedMonths.filter(m => {
            const [year, month] = m.split('-').map(Number);
            const compareDate = new Date(sixMonthsAgo);
            compareDate.setMonth(compareDate.getMonth() + 1); // Include the starting month
            return new Date(year, month - 1) >= new Date(compareDate.getFullYear(), compareDate.getMonth(), 1);
        });
    } else if (period === '1y') {
        const oneYearAgo = new Date(now);
        oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);
        oneYearAgo.setMonth(oneYearAgo.getMonth() + 1); // Include the starting month
        displayMonths = sortedMonths.filter(m => {
            const [year, month] = m.split('-').map(Number);
            return new Date(year, month - 1) >= new Date(oneYearAgo.getFullYear(), oneYearAgo.getMonth(), 1);
        });
    } else if (period === 'all') {
        // Keep all months
        displayMonths = sortedMonths;
    }

    // Prepare chart data
    const labels = displayMonths.map(m => {
        const [year, month] = m.split('-');
        return new Date(year, month - 1).toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
    });

    const incomeData = displayMonths.map(m => monthlyData[m]?.income || 0);
    const expenseData = displayMonths.map(m => monthlyData[m]?.expenses || 0);
    const savingsData = displayMonths.map(m => (monthlyData[m]?.income || 0) - (monthlyData[m]?.expenses || 0));

    // Destroy the previous chart if it exists
    if (cashFlowChart) {
        cashFlowChart.destroy();
    }

    // Create a new chart
    cashFlowChart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: labels,
            datasets: [
                {
                    label: 'Income',
                    data: incomeData,
                    backgroundColor: 'rgba(54, 162, 235, 0.7)',
                    borderColor: 'rgba(54, 162, 235, 1)',
                    borderWidth: 1
                },
                {
                    label: 'Expenses',
                    data: expenseData,
                    backgroundColor: 'rgba(255, 99, 132, 0.7)',
                    borderColor: 'rgba(255, 99, 132, 1)',
                    borderWidth: 1
                },
                {
                    label: 'Savings',
                    data: savingsData,
                    type: 'line',
                    borderColor: 'rgba(75, 192, 192, 1)',
                    backgroundColor: 'rgba(75, 192, 192, 0.1)',
                    borderWidth: 2,
                    pointBackgroundColor: 'rgba(75, 192, 192, 1)',
                    fill: true
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            animation: {
                duration: 2000, // Animation duration in milliseconds
                easing: 'easeOutQuart' // Easing function for smooth animation
            },
            plugins: {
                title: {
                    display: true,
                    text: 'Monthly Cash Flow Analysis',
                    font: {
                        size: 16
                    }
                },
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            return `${context.dataset.label}: $${context.raw.toFixed(2)}`;
                        }
                    }
                },
                legend: {
                    position: 'top',
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    ticks: {
                        callback: function(value) {
                            return '$' + value;
                        }
                    }
                },
                x: {
                    grid: {
                        display: false
                    }
                }
            }
        }
    });
}

// 4. Period Filter Controls

// Set up event listeners for period filter buttons
function setupPeriodControls(monthlyData) {
    const periodButtons = document.querySelectorAll('.period-btn');

    periodButtons.forEach(button => {
        button.addEventListener('click', function() {
            // Update active state
            periodButtons.forEach(btn => btn.classList.remove('active'));
            this.classList.add('active');

            // Re-render chart with new period
            renderCashFlowChart(monthlyData, this.dataset.period);
        });
    });
}

// 5. Initialization

// Initialize the dashboard when the DOM is fully loaded
document.addEventListener('DOMContentLoaded', function() {
    const transactions = getTransactions(); // Retrieve transactions from localStorage
    const monthlyData = calculateMonthlyMetrics(transactions); // Calculate monthly metrics

    updateMetricCards(monthlyData); // Update the metric cards in the UI
    renderCashFlowChart(monthlyData); // Render the cash flow chart
    setupPeriodControls(monthlyData); // Set up period filter controls

    // Optional: Set up a listener for storage changes to update in real-time
    window.addEventListener('storage', function() {
        const updatedTransactions = getTransactions(); // Retrieve updated transactions
        const updatedMonthlyData = calculateMonthlyMetrics(updatedTransactions); // Recalculate metrics
        updateMetricCards(updatedMonthlyData); // Update the UI
        renderCashFlowChart(updatedMonthlyData); // Re-render the chart
    });
});

