/*
* Income and Expense Tracking Application
* 
* Overview:
* This script allows users to track their income and expenses, categorize them, and visualize their financial status.
* It includes features for adding, editing, and deleting transactions, as well as filtering by date and category.
* 
* Features:
* - Add, edit, and delete income and expense transactions.
* - Filter transactions by category, date, and custom ranges.
* - Display recent transactions and calculate totals (income, expenses, balance).
* - Responsive design with tabbed navigation for better user experience.
* - Data is persisted in localStorage for future sessions.
* 
* Author: [Your Name]
*/

document.addEventListener('DOMContentLoaded', function() {
    // DOM Elements
    const currentDateEl = document.getElementById('current-date'); // Element to display the current date
    const totalIncomeEl = document.getElementById('total-income'); // Element to display total income
    const totalExpenseEl = document.getElementById('total-expense'); // Element to display total expenses
    const currentBalanceEl = document.getElementById('current-balance'); // Element to display current balance
    const incomeTransactionsEl = document.getElementById('income-transactions'); // Container for income transactions
    const expenseTransactionsEl = document.getElementById('expense-transactions'); // Container for expense transactions
    const recentIncomeEl = document.getElementById('recent-income'); // Container for recent income transactions
    const recentExpenseEl = document.getElementById('recent-expenses'); // Container for recent expense transactions
    const incomeMonthFilter = document.getElementById('income-category-filter'); // Dropdown for filtering income by category
    const incomeTimePeriod = document.getElementById('income-time-period'); // Dropdown for filtering income by time period
    const expenseMonthFilter = document.getElementById('expense-category-filter'); // Dropdown for filtering expenses by category
    const expenseTimePeriod = document.getElementById('expense-time-period'); // Dropdown for filtering expenses by time period
    const incomeCustomRange = document.getElementById('income-custom-range'); // Custom range inputs for income
    const expenseCustomRange = document.getElementById('expense-custom-range'); // Custom range inputs for expenses
    const incomeStartDate = document.getElementById('income-start-date'); // Start date for custom income range
    const incomeEndDate = document.getElementById('income-end-date'); // End date for custom income range
    const expenseStartDate = document.getElementById('expense-start-date'); // Start date for custom expense range
    const expenseEndDate = document.getElementById('expense-end-date'); // End date for custom expense range
    const incomeForm = document.getElementById('income-form'); // Form for adding income transactions
    const expenseForm = document.getElementById('expense-form'); // Form for adding expense transactions
    const tabButtons = document.querySelectorAll('.tab-btn'); // Tab buttons for navigation
    const tabContents = document.querySelectorAll('.tab-content'); // Tab content sections
    const filterButtons = document.querySelectorAll('.filter-btn'); // Buttons for quick filtering
    const editModal = document.getElementById('edit-modal'); // Modal for editing transactions
    const editForm = document.getElementById('edit-form'); // Form inside the edit modal
    const closeModal = document.querySelector('.close-modal'); // Button to close the edit modal

    // Initialize data
    let transactions = JSON.parse(localStorage.getItem('transactions')) || []; // Load transactions from localStorage
    let currentlyEditingId = null; // ID of the transaction currently being edited

    // Set current date
    const now = new Date();
    currentDateEl.textContent = now.toLocaleDateString('en-US', { 
        weekday: 'long', 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
    });

    // Initialize forms with today's date
    document.getElementById('income-date').valueAsDate = now;
    document.getElementById('expense-date').valueAsDate = now;

    // Tab switching functionality
    tabButtons.forEach(button => {
        button.addEventListener('click', () => {
            // Remove active class from all buttons and contents
            tabButtons.forEach(btn => btn.classList.remove('active'));
            tabContents.forEach(content => content.classList.remove('active'));
            
            // Add active class to clicked button and corresponding content
            button.classList.add('active');
            const tabId = button.id.replace('-tab', '-content'); // Map button ID to content ID
            document.getElementById(tabId).classList.add('active');
        });
    });

    // Filter button functionality
    filterButtons.forEach(button => {
        button.addEventListener('click', function() {
            filterButtons.forEach(btn => btn.classList.remove('active')); // Remove active class from all buttons
            this.classList.add('active'); // Add active class to the clicked button
            
            // Get the time period from the data attribute
            const timePeriod = this.dataset.time;
            
            // Update the time period dropdowns to match the button selection
            if (timePeriod === 'month') {
                incomeTimePeriod.value = 'current-month';
                expenseTimePeriod.value = 'current-month';
            } else if (timePeriod === 'all') {
                incomeTimePeriod.value = 'all';
                expenseTimePeriod.value = 'all';
            }
            
            // Hide custom range inputs if they were visible
            incomeCustomRange.style.display = 'none';
            expenseCustomRange.style.display = 'none';
            
            // Update the display
            displayTransactions();
            displayRecentIncome();
            displayRecentExpenses();
        });
    });

    // Calculate and display totals
    function updateTotals() {
        const totalIncome = transactions
            .filter(t => t.type === 'income') // Filter income transactions
            .reduce((sum, t) => sum + t.amount, 0); // Sum up income amounts
        
        const totalExpense = transactions
            .filter(t => t.type === 'expense') // Filter expense transactions
            .reduce((sum, t) => sum + t.amount, 0); // Sum up expense amounts
        
        const balance = totalIncome - totalExpense; // Calculate balance
        
        totalIncomeEl.textContent = formatCurrency(totalIncome); // Display total income
        totalExpenseEl.textContent = formatCurrency(totalExpense); // Display total expenses
        currentBalanceEl.textContent = formatCurrency(balance); // Display current balance
        
        // Update trend indicator
        const trendEl = document.querySelector('.trend-indicator');
        if (balance > 0) {
            trendEl.classList.remove('negative');
            trendEl.classList.add('positive');
            trendEl.innerHTML = '<i class="fas fa-arrow-up"></i> Positive trend';
        } else if (balance < 0) {
            trendEl.classList.remove('positive');
            trendEl.classList.add('negative');
            trendEl.innerHTML = '<i class="fas fa-arrow-down"></i> Negative trend';
        } else {
            trendEl.classList.remove('positive', 'negative');
            trendEl.innerHTML = '<i class="fas fa-equals"></i> Balanced';
        }
    }

    // Format currency
    function formatCurrency(amount) {
        return new Intl.NumberFormat('en-US', { 
            style: 'currency', 
            currency: 'USD' 
        }).format(amount); // Format amount as USD currency
    }

    // Get icon based on category
    function getCategoryIcon(category, type) {
        const icons = {
            income: {
                salary: 'fa-money-bill-wave',
                freelance: 'fa-laptop-code',
                investment: 'fa-chart-line',
                gift: 'fa-gift',
                other: 'fa-coins'
            },
            expense: {
                housing: 'fa-home',
                food: 'fa-utensils',
                transportation: 'fa-car',
                entertainment: 'fa-film',
                health: 'fa-heartbeat',
                education: 'fa-book',
                other: 'fa-shopping-bag'
            }
        };
        
        return icons[type][category] || (type === 'income' ? 'fa-money-bill-wave' : 'fa-shopping-cart');
    }

    // Display recent income transactions (last 5)
    function displayRecentIncome() {
        const recentIncome = transactions
            .filter(t => t.type === 'income')
            .sort((a, b) => new Date(b.date) - new Date(a.date))
            .slice(0, 5);
        
        recentIncomeEl.innerHTML = recentIncome.length > 0 
            ? recentIncome.map(t => createRecentTransactionHTML(t)).join('')
            : '<li class="no-transactions">No recent income</li>';
    }

    // Display recent expense transactions (last 5)
    function displayRecentExpenses() {
        const recentExpenses = transactions
            .filter(t => t.type === 'expense')
            .sort((a, b) => new Date(b.date) - new Date(a.date))
            .slice(0, 5);
        
        recentExpenseEl.innerHTML = recentExpenses.length > 0 
            ? recentExpenses.map(t => createRecentTransactionHTML(t)).join('')
            : '<li class="no-transactions">No recent expenses</li>';
    }

    // Create HTML for recent transaction
    function createRecentTransactionHTML(transaction) {
        const date = new Date(transaction.date);
        const formattedDate = date.toLocaleDateString('en-US', { 
            month: 'short', 
            day: 'numeric' 
        });
        
        const icon = getCategoryIcon(transaction.category, transaction.type);
        const amountClass = transaction.type === 'income' ? 'positive' : 'negative';
        const amountSign = transaction.type === 'income' ? '+' : '-';
        
        return `
            <li>
                <div class="transaction-icon">
                    <i class="fas ${icon}"></i>
                </div>
                <div class="transaction-info">
                    <span class="transaction-description">${transaction.description}</span>
                    <span class="transaction-amount ${amountClass}">${amountSign}${formatCurrency(transaction.amount)}</span>
                </div>
                <span class="transaction-date">${formattedDate}</span>
            </li>
        `;
    }

    // Display transactions with edit/delete buttons
    function displayTransactions() {
        // Filter and display income transactions
        const incomeCategory = incomeMonthFilter.value;
        const incomeTimePeriodValue = incomeTimePeriod.value;
        
        const filteredIncome = transactions.filter(t => {
            if (t.type !== 'income') return false;
            if (incomeCategory !== 'all' && t.category !== incomeCategory) return false;
            
            const transactionDate = new Date(t.date);
            const currentDate = new Date();
            
            if (incomeTimePeriodValue === 'current-month') {
                return transactionDate.getMonth() === currentDate.getMonth() && 
                       transactionDate.getFullYear() === currentDate.getFullYear();
            } 
            else if (incomeTimePeriodValue === 'last-month') {
                const lastMonth = currentDate.getMonth() === 0 ? 11 : currentDate.getMonth() - 1;
                const year = currentDate.getMonth() === 0 ? currentDate.getFullYear() - 1 : currentDate.getFullYear();
                return transactionDate.getMonth() === lastMonth && 
                       transactionDate.getFullYear() === year;
            }
            else if (incomeTimePeriodValue === 'current-year') {
                return transactionDate.getFullYear() === currentDate.getFullYear();
            }
            else if (incomeTimePeriodValue === 'custom') {
                const startDate = new Date(incomeStartDate.value);
                const endDate = new Date(incomeEndDate.value);
                return transactionDate >= startDate && transactionDate <= endDate;
            }
            
            return true; // For 'all time'
        });
        
        incomeTransactionsEl.innerHTML = filteredIncome.length > 0 
            ? filteredIncome.map(t => createTransactionHTML(t)).join('')
            : '<li class="no-transactions">No income transactions found</li>';
        
        // Filter and display expense transactions
        const expenseCategory = expenseMonthFilter.value;
        const expenseTimePeriodValue = expenseTimePeriod.value;
        
        const filteredExpense = transactions.filter(t => {
            if (t.type !== 'expense') return false;
            if (expenseCategory !== 'all' && t.category !== expenseCategory) return false;
            
            const transactionDate = new Date(t.date);
            const currentDate = new Date();
            
            if (expenseTimePeriodValue === 'current-month') {
                return transactionDate.getMonth() === currentDate.getMonth() && 
                       transactionDate.getFullYear() === currentDate.getFullYear();
            } 
            else if (expenseTimePeriodValue === 'last-month') {
                const lastMonth = currentDate.getMonth() === 0 ? 11 : currentDate.getMonth() - 1;
                const year = currentDate.getMonth() === 0 ? currentDate.getFullYear() - 1 : currentDate.getFullYear();
                return transactionDate.getMonth() === lastMonth && 
                       transactionDate.getFullYear() === year;
            }
            else if (expenseTimePeriodValue === 'current-year') {
                return transactionDate.getFullYear() === currentDate.getFullYear();
            }
            else if (expenseTimePeriodValue === 'custom') {
                const startDate = new Date(expenseStartDate.value);
                const endDate = new Date(expenseEndDate.value);
                return transactionDate >= startDate && transactionDate <= endDate;
            }
            
            return true; // For 'all time'
        });
        
        expenseTransactionsEl.innerHTML = filteredExpense.length > 0 
            ? filteredExpense.map(t => createTransactionHTML(t)).join('')
            : '<li class="no-transactions">No expense transactions found</li>';
            
        // Add event listeners to all edit and delete buttons
        addEditDeleteListeners();
    }

    // Create transaction HTML with edit/delete buttons
    function createTransactionHTML(transaction) {
        const date = new Date(transaction.date);
        const formattedDate = date.toLocaleDateString('en-US', { 
            year: 'numeric', 
            month: 'short', 
            day: 'numeric' 
        });
        
        const icon = getCategoryIcon(transaction.category, transaction.type);
        const amountClass = transaction.type === 'income' ? 'positive' : 'negative';
        const amountSign = transaction.type === 'income' ? '+' : '-';
        
        return `
            <li class="${transaction.type}-transaction" data-id="${transaction.id}">
                <div class="transaction-icon">
                    <i class="fas ${icon}"></i>
                </div>
                <div class="transaction-info">
                    <div class="transaction-main">
                        <span class="transaction-description">${transaction.description}</span>
                        <span class="transaction-amount ${amountClass}">${amountSign}${formatCurrency(Math.abs(transaction.amount))}</span>
                    </div>
                    <div class="transaction-meta">
                        <span class="transaction-category">${transaction.category}</span>
                        <span class="transaction-date">${formattedDate}</span>
                    </div>
                </div>
                <div class="transaction-actions">
                    <button class="edit-btn" data-id="${transaction.id}">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="delete-btn" data-id="${transaction.id}">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </li>
        `;
    }

    // Add event listeners to edit and delete buttons
    function addEditDeleteListeners() {
        document.querySelectorAll('.edit-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                const id = parseInt(btn.dataset.id);
                editTransaction(id);
            });
        });
        
        document.querySelectorAll('.delete-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                const id = parseInt(btn.dataset.id);
                deleteTransaction(id);
            });
        });
    }

    // Edit transaction function
    function editTransaction(id) {
        const transaction = transactions.find(t => t.id === id);
        if (!transaction) return;
        
        currentlyEditingId = id;
        
        // Populate the edit form
        document.getElementById('edit-type').value = transaction.type;
        document.getElementById('edit-amount').value = transaction.amount;
        document.getElementById('edit-description').value = transaction.description;
        document.getElementById('edit-category').value = transaction.category;
        document.getElementById('edit-date').value = transaction.date;
        
        // Show the modal
        editModal.style.display = 'block';
    }

    // Delete transaction function
    function deleteTransaction(id) {
        if (confirm('Are you sure you want to delete this transaction?')) {
            transactions = transactions.filter(t => t.id !== id);
            saveTransactions();
        }
    }

    // Handle edit form submission
    editForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        if (currentlyEditingId === null) return;
        
        const index = transactions.findIndex(t => t.id === currentlyEditingId);
        if (index === -1) return;
        
        // Update the transaction
        transactions[index] = {
            id: currentlyEditingId,
            type: document.getElementById('edit-type').value,
            amount: parseFloat(document.getElementById('edit-amount').value),
            description: document.getElementById('edit-description').value,
            category: document.getElementById('edit-category').value,
            date: document.getElementById('edit-date').value
        };
        
        saveTransactions();
        closeEditModal();
    });

    // Close modal function
    function closeEditModal() {
        editModal.style.display = 'none';
        currentlyEditingId = null;
        editForm.reset();
    }

    // Close modal when clicking X
    closeModal.addEventListener('click', closeEditModal);

    // Close modal when clicking outside
    window.addEventListener('click', (e) => {
        if (e.target === editModal) {
            closeEditModal();
        }
    });

    // Add new income transaction
    incomeForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        const newTransaction = {
            id: Date.now(), // Unique ID for the transaction
            type: 'income',
            amount: parseFloat(document.getElementById('income-amount').value), // Parse amount as float
            description: document.getElementById('income-description').value, // Get description
            category: document.getElementById('income-category').value, // Get category
            date: document.getElementById('income-date').value // Get date
        };
        
        transactions.push(newTransaction); // Add transaction to the list
        saveTransactions(); // Save transactions to localStorage
        this.reset(); // Reset the form
        document.getElementById('income-date').valueAsDate = new Date(); // Reset date to today
        
        // Switch to overview tab after submission
        document.getElementById('overview-tab').click();
    });

    // Add new expense transaction
    expenseForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        const newTransaction = {
            id: Date.now(), // Unique ID for the transaction
            type: 'expense',
            amount: parseFloat(document.getElementById('expense-amount').value), // Parse amount as float
            description: document.getElementById('expense-description').value, // Get description
            category: document.getElementById('expense-category').value, // Get category
            date: document.getElementById('expense-date').value // Get date
        };
        
        transactions.push(newTransaction); // Add transaction to the list
        saveTransactions(); // Save transactions to localStorage
        this.reset(); // Reset the form
        document.getElementById('expense-date').valueAsDate = new Date(); // Reset date to today
        
        // Switch to overview tab after submission
        document.getElementById('overview-tab').click();
    });

    // Save transactions to localStorage
    function saveTransactions() {
        localStorage.setItem('transactions', JSON.stringify(transactions)); // Save transactions as JSON
        updateTotals(); // Update totals
        displayTransactions(); // Refresh transaction display
        displayRecentIncome(); // Refresh recent income display
        displayRecentExpenses(); // Refresh recent expense display
    }

    // Time period filter change handlers
    incomeTimePeriod.addEventListener('change', function() {
        incomeCustomRange.style.display = this.value === 'custom' ? 'flex' : 'none';
        displayTransactions();
        displayRecentIncome();
        displayRecentExpenses();
    });

    expenseTimePeriod.addEventListener('change', function() {
        expenseCustomRange.style.display = this.value === 'custom' ? 'flex' : 'none';
        displayTransactions();
        displayRecentIncome();
        displayRecentExpenses();
    });

    // Custom range input handlers
    [incomeStartDate, incomeEndDate, expenseStartDate, expenseEndDate].forEach(input => {
        input.addEventListener('change', displayTransactions);
        input.addEventListener('change', displayRecentIncome);
        input.addEventListener('change', displayRecentExpenses);
    });

    // Filter change event listeners
    incomeMonthFilter.addEventListener('change', displayTransactions);
    incomeMonthFilter.addEventListener('change', displayRecentIncome);
    incomeMonthFilter.addEventListener('change', displayRecentExpenses);
    expenseMonthFilter.addEventListener('change', displayTransactions);
    expenseMonthFilter.addEventListener('change', displayRecentIncome);
    expenseMonthFilter.addEventListener('change', displayRecentExpenses);

    // Initial setup
    updateTotals();
    displayTransactions();
    displayRecentIncome();
    displayRecentExpenses();
});


