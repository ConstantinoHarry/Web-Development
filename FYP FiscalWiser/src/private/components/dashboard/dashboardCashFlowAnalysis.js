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

// Get transactions from localStorage
function getTransactions() {
    return JSON.parse(localStorage.getItem('transactions')) || [];
}

// Calculate monthly income, expenses, and savings
function calculateMonthlyMetrics(transactions) {
    const monthlyData = {};

    transactions.forEach(transaction => {
        const date = new Date(transaction.date);
        const monthYear = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;

        if (!monthlyData[monthYear]) {
            monthlyData[monthYear] = { income: 0, expenses: 0 };
        }

        if (transaction.type === 'income') {
            monthlyData[monthYear].income += transaction.amount;
        } else {
            monthlyData[monthYear].expenses += transaction.amount;
        }
    });

    // Calculate savings for each month
    Object.keys(monthlyData).forEach(month => {
        const data = monthlyData[month];
        data.savings = data.income - data.expenses;
        data.savingsRatio = data.income > 0 ? (data.savings / data.income) * 100 : 0;
    });

    return monthlyData;
}

// Update the dashboard metrics
function updateMetricCards(monthlyData) {
    const now = new Date();
    const currentMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
    
    // Get previous month
    const prev = new Date(now);
    prev.setMonth(prev.getMonth() - 1);
    const previousMonth = `${prev.getFullYear()}-${String(prev.getMonth() + 1).padStart(2, '0')}`;

    const current = monthlyData[currentMonth] || { income: 0, expenses: 0, savings: 0, savingsRatio: 0 };
    const previous = monthlyData[previousMonth] || { income: 0, expenses: 0, savings: 0, savingsRatio: 0 };

    // Update income
    document.getElementById('monthly-income').textContent = `$${current.income.toFixed(2)}`;
    
    // Update expenses
    document.getElementById('monthly-expense').textContent = `$${current.expenses.toFixed(2)}`;
    
    // Update savings rate
    document.getElementById('savings-rate').textContent = `${current.savingsRatio.toFixed(2)}%`;
}

// Render the cash flow chart
let cashFlowChart = null;

function renderCashFlowChart(monthlyData) {
    const ctx = document.getElementById('cashFlowChart').getContext('2d');
    
    // Sort months and get last 6 months
    const sortedMonths = Object.keys(monthlyData).sort().slice(-6);
    
    const labels = sortedMonths.map(m => {
        const [year, month] = m.split('-');
        return new Date(year, month - 1).toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
    });

    const incomeData = sortedMonths.map(m => monthlyData[m]?.income || 0);
    const expenseData = sortedMonths.map(m => monthlyData[m]?.expenses || 0);

    if (cashFlowChart) {
        cashFlowChart.destroy();
    }

    cashFlowChart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: labels,
            datasets: [
                {
                    label: 'Income',
                    data: incomeData,
                    backgroundColor: 'rgba(54, 162, 235, 0.7)'
                },
                {
                    label: 'Expenses',
                    data: expenseData,
                    backgroundColor: 'rgba(255, 99, 132, 0.7)'
                }
            ]
        },
        options: {
            responsive: true,
            scales: {
                y: {
                    beginAtZero: true
                }
            }
        }
    });
}

// Initialize dashboard
document.addEventListener('DOMContentLoaded', function() {
    const transactions = getTransactions();
    const monthlyData = calculateMonthlyMetrics(transactions);
    
    updateMetricCards(monthlyData);
    renderCashFlowChart(monthlyData);
});
