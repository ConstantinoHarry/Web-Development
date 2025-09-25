/*
* Budget Tracking Component of Dashboard
*
* Overview:
* This component allows users to set up and track their monthly budgets.
* It provides a modal for creating budgets, displays budget categories, and shows the total spent and remaining amounts.
* It also includes a refresh button to update the budget tracking data.
*
* Features:
* - Create and edit budgets for different categories.
* - Display total budget amount, total spent amount, and utilization percentage.
* - Show a list of budget categories with progress bars indicating spending.
* - Allow users to delete budgets.
* - Responsive design for mobile and desktop views.
* - Uses localStorage to persist budget data.
* - Allows for automatic updates of budget data every 30 seconds.
*
* Author: Constantino Harry Alexander
*/


document.addEventListener('DOMContentLoaded', function () {
    // DOM Elements
    const budgetsContainer = document.getElementById('budgetCategories'); // Container for displaying budgets
    const createBudgetBtn = document.getElementById('createBudgetBtn'); // Button to create a new budget
    const refreshBudgetsBtn = document.getElementById('refreshBudgetsBtn'); // Button to refresh budgets
    const setupBudgetsBtn = document.getElementById('setupBudgetsBtn'); // Button to set up budgets
    const totalBudgetAmount = document.getElementById('totalBudgetAmount'); // Element to display total budget amount
    const totalSpentAmount = document.getElementById('totalSpentAmount'); // Element to display total spent amount
    const totalUtilization = document.getElementById('totalUtilization'); // Element to display utilization percentage
    const budgetModal = document.getElementById('budgetModal'); // Modal for creating/editing budgets
    const closeModalBtn = document.querySelector('.fp-budget-modal-close'); // Button to close the modal
    const cancelBudgetBtn = document.getElementById('cancelBudgetBtn'); // Button to cancel budget creation/editing
    const budgetForm = document.getElementById('budgetForm'); // Form for creating/editing budgets
    const budgetCategorySelect = document.getElementById('budgetCategory'); // Dropdown for selecting budget category
    const backdrop = document.querySelector('.fp-budget-modal-backdrop'); // Modal backdrop

    // Current month/year for budget identification
    const currentDate = new Date();
    const currentMonth = currentDate.getMonth(); // Current month (0-based index)
    const currentYear = currentDate.getFullYear(); // Current year
    const budgetKey = `budgets_${currentYear}_${currentMonth + 1}`; // Unique key for storing budgets in localStorage

    // Load budgets and transactions from localStorage
    let budgets = JSON.parse(localStorage.getItem(budgetKey)) || []; // Budgets for the current month
    const transactions = JSON.parse(localStorage.getItem('transactions')) || []; // All transactions

    // Initialize the UI
    updateBudgetTracking(); // Update budget tracking and render UI
    populateCategoryOptions(); // Populate category dropdown options

    // Modal Functions

    // Open the budget modal
    function openBudgetModal() {
        budgetModal.style.display = 'block';
        backdrop.style.display = 'block';
        document.body.style.overflow = 'hidden'; // Prevent scrolling
    }

    // Close the budget modal
    function closeBudgetModal() {
        budgetModal.style.display = 'none';
        backdrop.style.display = 'none';
        document.body.style.overflow = 'auto'; // Re-enable scrolling
        budgetForm.reset(); // Reset the form fields
    }

    // Event Listeners
    createBudgetBtn.addEventListener('click', openBudgetModal); // Open modal on "Create Budget" button click
    setupBudgetsBtn?.addEventListener('click', openBudgetModal); // Open modal on "Set Up Budgets" button click
    refreshBudgetsBtn.addEventListener('click', updateBudgetTracking); // Refresh budgets on button click
    closeModalBtn.addEventListener('click', closeBudgetModal); // Close modal on close button click
    cancelBudgetBtn.addEventListener('click', closeBudgetModal); // Close modal on cancel button click

    // Close modal when clicking outside modal content
    budgetModal.addEventListener('click', function (e) {
        if (e.target === budgetModal || e.target === backdrop) {
            closeBudgetModal();
        }
    });

    // Form submission for creating/editing budgets
    budgetForm.addEventListener('submit', function (e) {
        e.preventDefault();

        const category = budgetCategorySelect.value; // Selected category
        const amount = parseFloat(document.getElementById('budgetAmount').value); // Budget amount
        const period = document.getElementById('budgetPeriod').value; // Budget period (monthly/weekly)

        if (!category || isNaN(amount) || !period) {
            alert('Please fill out all fields correctly.');
            return;
        }

        // Check if the budget already exists
        const existingIndex = budgets.findIndex(b => b.category.toLowerCase() === category.toLowerCase());

        if (existingIndex >= 0) {
            // Update existing budget
            budgets[existingIndex].amount = amount;
            budgets[existingIndex].period = period;
        } else {
            // Add new budget
            budgets.push({
                category,
                amount,
                period,
                spent: 0 // Initialize spent amount
            });
        }

        // Save budgets to localStorage and update UI
        localStorage.setItem(budgetKey, JSON.stringify(budgets));
        updateBudgetTracking();
        closeBudgetModal();
    });

    // Function to populate category options in the dropdown
    function populateCategoryOptions() {
        // Clear existing options
        budgetCategorySelect.innerHTML = '<option value="">Select a category</option>';

        // Define standard categories
        const standardCategories = [
            'housing',
            'food',
            'transportation',
            'entertainment',
            'health',
            'education',
            'other'
        ];

        // Get unique categories from transactions and budgets
        const transactionCategories = [...new Set(
            transactions
                .filter(t => t.type === 'expense')
                .map(t => t.category.toLowerCase())
        )];
        const budgetCategories = [...new Set(
            budgets.map(b => b.category.toLowerCase())
        )];

        // Combine all categories and deduplicate
        const allCategories = new Set([
            ...standardCategories,
            ...transactionCategories,
            ...budgetCategories
        ]);

        // Convert to array and sort alphabetically
        const sortedCategories = Array.from(allCategories).sort();

        // Add category options
        sortedCategories.forEach(category => {
            const option = document.createElement('option');
            option.value = category;
            option.textContent = formatCategoryName(category);
            budgetCategorySelect.appendChild(option);
        });
    }

    // Function to update budget tracking
    function updateBudgetTracking() {
        // Calculate spent amounts for each budget category
        const currentMonthStart = new Date(currentYear, currentMonth, 1); // Start of the current month
        const currentMonthEnd = new Date(currentYear, currentMonth + 1, 0); // End of the current month

        const monthExpenses = transactions.filter(t =>
            t.type === 'expense' &&
            new Date(t.date) >= currentMonthStart &&
            new Date(t.date) <= currentMonthEnd
        );

        // Update spent amounts in budgets
        budgets.forEach(budget => {
            budget.spent = monthExpenses
                .filter(e => e.category.toLowerCase() === budget.category.toLowerCase())
                .reduce((sum, e) => sum + e.amount, 0);
        });

        // Save updated budgets (with spent amounts)
        localStorage.setItem(budgetKey, JSON.stringify(budgets));

        // Render budgets
        renderBudgets();

        // Update summary metrics
        updateSummaryMetrics();
    }

    // Function to render budgets
    function renderBudgets() {
        budgetsContainer.innerHTML = ''; // Clear the container

        if (budgets.length === 0) {
            // Show empty state if no budgets exist
            budgetsContainer.innerHTML = `
                <div class="fp-budget-empty-state">
                    <i class="fas fa-chart-pie"></i>
                    <p>No budgets set up for this month</p>
                    <button class="fp-btn primary" id="setupBudgetsBtn">Set Up Budgets</button>
                </div>
            `;

            document.getElementById('setupBudgetsBtn').addEventListener('click', openBudgetModal);
            return;
        }

        budgets.forEach(budget => {
            const progressPercent = Math.min((budget.spent / budget.amount) * 100, 100); // Calculate progress percentage
            const isOverBudget = budget.spent > budget.amount; // Check if over budget
            const remainingAmount = Math.max(budget.amount - budget.spent, 0); // Calculate remaining amount

            // Calculate the over budget percentage
            const overBudgetPercent = isOverBudget 
                ? ((budget.spent - budget.amount) / budget.amount) * 100 
                : 0;

            const budgetCard = document.createElement('div');
            budgetCard.className = 'fp-budget-card';
            budgetCard.innerHTML = `
                <div class="fp-budget-card-header">
                    <h3 class="fp-budget-card-title">${formatCategoryName(budget.category)}</h3>
                    <span class="fp-budget-card-amount">$${budget.amount.toFixed(2)} ${budget.period === 'weekly' ? '/wk' : '/mo'}</span>
                </div>
                <div class="fp-budget-progress">
                    <div class="fp-budget-progress-bar ${isOverBudget ? 'fp-budget-progress-over' : 'fp-budget-progress-under'}" 
                         style="width: ${progressPercent}%"></div>
                </div>
                <div class="fp-budget-card-footer">
                    <span class="fp-budget-spent">$${budget.spent.toFixed(2)} spent</span>
                    <span class="fp-budget-remaining">$${remainingAmount.toFixed(2)} left</span>
                </div>
                <div style="margin-top: 10px; text-align: right;">
                    <span class="fp-budget-status ${isOverBudget ? 'fp-budget-status-over' : 'fp-budget-status-under'}">
                        ${isOverBudget 
                            ? `${overBudgetPercent.toFixed(0)}% OVER` 
                            : `${progressPercent.toFixed(0)}% OF`} BUDGET
                    </span>
                </div>
                <div class="fp-budget-actions" style="margin-top: 15px; display: flex; gap: 10px;">
                    <button class="fp-btn secondary" data-category="${budget.category}" style="flex: 1;">
                        <i class="fas fa-edit"></i> Edit
                    </button>
                    <button class="fp-btn danger" data-category="${budget.category}" style="flex: 1;">
                        <i class="fas fa-trash"></i> Delete
                    </button>
                </div>
            `;

            budgetsContainer.appendChild(budgetCard);
        });

        // Add event listeners to action buttons
        document.querySelectorAll('.fp-btn.danger').forEach(btn => {
            btn.addEventListener('click', function () {
                const category = this.getAttribute('data-category');
                deleteBudget(category);
            });
        });

        document.querySelectorAll('.fp-btn.secondary').forEach(btn => {
            btn.addEventListener('click', function () {
                const category = this.getAttribute('data-category');
                editBudget(category);
            });
        });
    }

    // Function to delete a budget
    function deleteBudget(category) {
        if (confirm(`Are you sure you want to delete the ${formatCategoryName(category)} budget?`)) {
            budgets = budgets.filter(b => b.category.toLowerCase() !== category.toLowerCase());
            localStorage.setItem(budgetKey, JSON.stringify(budgets));
            updateBudgetTracking();
        }
    }

    // Function to edit a budget
    function editBudget(category) {
        const budget = budgets.find(b => b.category.toLowerCase() === category.toLowerCase());
        if (!budget) return;

        // Populate the form
        budgetCategorySelect.value = budget.category.toLowerCase();
        document.getElementById('budgetAmount').value = budget.amount;
        document.getElementById('budgetPeriod').value = budget.period || 'monthly';

        // Open modal
        openBudgetModal();
    }

    // Function to update summary metrics
    function updateSummaryMetrics() {
        const totalBudget = budgets.reduce((sum, b) => sum + b.amount, 0); // Calculate total budget
        const totalSpent = budgets.reduce((sum, b) => sum + b.spent, 0); // Calculate total spent
        const utilization = totalBudget > 0 ? (totalSpent / totalBudget) * 100 : 0; // Calculate utilization percentage

        totalBudgetAmount.textContent = `$${totalBudget.toFixed(2)}`;
        totalSpentAmount.textContent = `$${totalSpent.toFixed(2)}`;
        totalUtilization.textContent = `${utilization.toFixed(0)}%`;
    }

    // Helper function to format category names
    function formatCategoryName(category) {
        return category.split('-').map(word =>
            word.charAt(0).toUpperCase() + word.slice(1)
        ).join(' ');
    }
});





















