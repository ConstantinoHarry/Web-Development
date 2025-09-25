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
    const budgetsContainer = document.getElementById('budgetCategories');
    const createBudgetBtn = document.getElementById('createBudgetBtn');
    const budgetModal = document.getElementById('budgetModal');
    const budgetForm = document.getElementById('budgetForm');
    const budgetCategorySelect = document.getElementById('budgetCategory');

    const currentDate = new Date();
    const budgetKey = `budgets_${currentDate.getFullYear()}_${currentDate.getMonth() + 1}`;
    
    let budgets = JSON.parse(localStorage.getItem(budgetKey)) || [];
    const transactions = JSON.parse(localStorage.getItem('transactions')) || [];

    updateBudgetTracking();
    populateCategoryOptions();

    function openBudgetModal() {
        budgetModal.style.display = 'block';
    }

    function closeBudgetModal() {
        budgetModal.style.display = 'none';
        budgetForm.reset();
    }

    createBudgetBtn.addEventListener('click', openBudgetModal);
    
    budgetForm.addEventListener('submit', function (e) {
        e.preventDefault();
        
        const category = budgetCategorySelect.value;
        const amount = parseFloat(document.getElementById('budgetAmount').value);

        if (!category || isNaN(amount)) {
            alert('Please fill out all fields correctly.');
            return;
        }

        const existingIndex = budgets.findIndex(b => b.category.toLowerCase() === category.toLowerCase());

        if (existingIndex >= 0) {
            budgets[existingIndex].amount = amount;
        } else {
            budgets.push({
                category,
                amount,
                spent: 0
            });
        }

        localStorage.setItem(budgetKey, JSON.stringify(budgets));
        updateBudgetTracking();
        closeBudgetModal();
    });

    function populateCategoryOptions() {
        budgetCategorySelect.innerHTML = '<option value="">Select a category</option>';
        
        const categories = ['housing', 'food', 'transportation', 'entertainment', 'health', 'other'];
        
        categories.forEach(category => {
            const option = document.createElement('option');
            option.value = category;
            option.textContent = category.charAt(0).toUpperCase() + category.slice(1);
            budgetCategorySelect.appendChild(option);
        });
    }

    function updateBudgetTracking() {
        const monthStart = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
        const monthEnd = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);

        const monthExpenses = transactions.filter(t =>
            t.type === 'expense' &&
            new Date(t.date) >= monthStart &&
            new Date(t.date) <= monthEnd
        );

        budgets.forEach(budget => {
            budget.spent = monthExpenses
                .filter(e => e.category.toLowerCase() === budget.category.toLowerCase())
                .reduce((sum, e) => sum + e.amount, 0);
        });

        localStorage.setItem(budgetKey, JSON.stringify(budgets));
        renderBudgets();
    }

    function renderBudgets() {
        budgetsContainer.innerHTML = '';

        if (budgets.length === 0) {
            budgetsContainer.innerHTML = '<p>No budgets set up for this month</p>';
            return;
        }

        budgets.forEach(budget => {
            const progressPercent = Math.min((budget.spent / budget.amount) * 100, 100);
            const remainingAmount = Math.max(budget.amount - budget.spent, 0);

            const budgetCard = document.createElement('div');
            budgetCard.className = 'budget-card';
            budgetCard.innerHTML = `
                <h3>${budget.category}</h3>
                <div class="progress-bar">
                    <div class="progress" style="width: ${progressPercent}%"></div>
                </div>
                <p>$${budget.spent.toFixed(2)} spent / $${budget.amount.toFixed(2)} budget</p>
                <p>$${remainingAmount.toFixed(2)} remaining</p>
                <button class="delete-btn" data-category="${budget.category}">Delete</button>
            `;

            budgetsContainer.appendChild(budgetCard);
        });

        document.querySelectorAll('.delete-btn').forEach(btn => {
            btn.addEventListener('click', function () {
                const category = this.getAttribute('data-category');
                budgets = budgets.filter(b => b.category.toLowerCase() !== category.toLowerCase());
                localStorage.setItem(budgetKey, JSON.stringify(budgets));
                updateBudgetTracking();
            });
        });
    }
});




















