/*
This script extends the retirement planning functionality by allowing users to save their retirement plans to local storage. It ensures that users can track their retirement goals over time and review their plans on a dashboard.
Key Features

Data Persistence: Saves retirement plans to local storage.
Input Validation: Ensures that all inputs are valid before saving.
User Feedback: Provides alerts for successful saves and errors.
Data Retrieval: Retrieves and displays saved retirement plans on the user's dashboard.

Author: Constantino Harry Alexander 
*/

document.addEventListener('DOMContentLoaded', function() {
    const ctx = document.getElementById('retirementGrowthChart').getContext('2d'); // Chart context for retirement growth chart
    let retirementChart; // Variable to store the chart instance

    // Load and display the latest retirement plan
    loadAndDisplayRetirementPlan();

    // Function to load and display the retirement plan
    function loadAndDisplayRetirementPlan() {
        try {
            const retirementPlans = JSON.parse(localStorage.getItem('retirementPlans')) || []; // Retrieve saved retirement plans

            if (retirementPlans.length === 0) {
                displayNoDataMessage(); // Show a message if no plans are found
                return;
            }

            const plan = retirementPlans[retirementPlans.length - 1]; // Get the latest retirement plan
            updateOverviewCards(plan); // Update the overview cards with plan details

            // Generate data for the chart that reaches $0 at life expectancy
            const graphData = generateZeroAtLifeExpectancyData(plan);
            createOrUpdateChart(graphData, plan); // Create or update the chart
            updateProjectionDetails(plan); // Update projection details in the UI

        } catch (error) {
            console.error("Error loading retirement plan:", error); // Log errors for debugging
            displayNoDataMessage(); // Show a message if an error occurs
        }
    }

    // Function to generate data for the chart, ensuring funds reach $0 at life expectancy
    function generateZeroAtLifeExpectancyData(plan) {
        const currentAge = plan.currentAge;
        const retirementAge = plan.retirementAge;
        const lifeExpectancy = 85; // Assume life expectancy of 85 years
        const yearlyContribution = plan.monthlySavingsRequired * 12; // Calculate yearly contributions

        const labels = []; // Array to store age labels
        const data = []; // Array to store fund values
        let currentTotal = plan.currentSavings; // Start with current savings

        // Accumulation phase: From current age to retirement age
        for (let age = currentAge; age <= retirementAge; age++) {
            labels.push(age);
            data.push(currentTotal);
            if (age < retirementAge) {
                currentTotal += yearlyContribution; // Add yearly contributions
            }
        }

        // Calculate yearly spending to deplete funds by life expectancy
        const retirementYears = lifeExpectancy - retirementAge;
        const exactYearlySpending = currentTotal / retirementYears;

        // Spending phase: From retirement age to life expectancy
        for (let age = retirementAge + 1; age <= lifeExpectancy; age++) {
            labels.push(age);
            currentTotal = Math.max(0, currentTotal - exactYearlySpending); // Deduct yearly spending
            data.push(currentTotal);
        }

        // Ensure the last value is exactly 0 to avoid rounding errors
        data[data.length - 1] = 0;

        return {
            labels: labels,
            data: data,
            retirementAgeIndex: retirementAge - currentAge, // Index of retirement age in the labels array
            exactYearlySpending: exactYearlySpending // Yearly spending amount
        };
    }

    // Function to create or update the retirement chart
    function createOrUpdateChart(graphData, plan) {
        const chartData = {
            labels: graphData.labels, // Age labels
            datasets: [{
                label: 'Retirement Funds',
                data: graphData.data, // Fund values
                backgroundColor: 'rgba(63, 191, 127, 0.2)', // Chart background color
                borderColor: 'rgba(63, 191, 127, 1)', // Chart border color
                borderWidth: 3,
                fill: true,
                tension: 0.1, // Smoothness of the line
                segment: {
                    borderColor: ctx => {
                        // Change line color after retirement age
                        return ctx.p1DataIndex >= graphData.retirementAgeIndex ? 
                               'rgba(235, 64, 52, 1)' : 
                               'rgba(63, 191, 127, 1)';
                    }
                }
            }]
        };

        const chartOptions = {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            const age = graphData.labels[context.dataIndex];
                            let status = context.dataIndex < graphData.retirementAgeIndex ? 
                                         `Adding $${formatCurrency(plan.monthlySavingsRequired * 12)} yearly` : 
                                         `Spending $${formatCurrency(graphData.exactYearlySpending)} yearly`;
                            return `Age ${age}: ${formatCurrency(context.parsed.y)} (${status})`;
                        }
                    }
                },
                annotation: {
                    annotations: {
                        retirementLine: {
                            type: 'line',
                            yMin: 0,
                            yMax: Math.max(...graphData.data),
                            xMin: graphData.retirementAgeIndex,
                            xMax: graphData.retirementAgeIndex,
                            borderColor: 'rgba(200, 50, 50, 0.7)',
                            borderWidth: 2,
                            label: {
                                content: 'Retirement',
                                enabled: true,
                                position: 'top'
                            }
                        },
                        lifeExpectancyLine: {
                            type: 'line',
                            yMin: 0,
                            yMax: Math.max(...graphData.data),
                            xMin: graphData.labels.length - 1,
                            xMax: graphData.labels.length - 1,
                            borderColor: 'rgba(150, 50, 200, 0.7)',
                            borderWidth: 2,
                            label: {
                                content: 'Life Expectancy',
                                enabled: true,
                                position: 'top'
                            }
                        }
                    }
                }
            },
            scales: {
                x: {
                    title: {
                        display: true,
                        text: 'Age' // X-axis label
                    }
                },
                y: {
                    title: {
                        display: true,
                        text: 'Retirement Funds ($)' // Y-axis label
                    },
                    beginAtZero: true // Ensure the chart starts at 0
                }
            }
        };

        if (retirementChart) {
            // Update existing chart
            retirementChart.data = chartData;
            retirementChart.options = chartOptions;
            retirementChart.update();
        } else {
            // Create a new chart
            retirementChart = new Chart(ctx, {
                type: 'line',
                data: chartData,
                options: chartOptions
            });
        }
    }

    // Function to update the overview cards with plan details
    function updateOverviewCards(plan) {
        document.getElementById('currentBalance').textContent = formatCurrency(plan.currentSavings);
        document.getElementById('retirementSavings').textContent = formatCurrency(plan.retirementSavings);
        document.getElementById('monthlyContributions').textContent = formatCurrency(plan.monthlySavingsRequired);
        document.getElementById('yearlyContributions').textContent = formatCurrency(plan.monthlySavingsRequired * 12);
    }

    // Function to update projection details in the UI
    function updateProjectionDetails(plan) {
        const currentAge = plan.currentAge;
        const retirementAge = plan.retirementAge;
        const lifeExpectancy = 85;

        document.getElementById('currentAgeDetail').textContent = currentAge;
        document.getElementById('retirementAgeDetail').textContent = retirementAge;
        document.getElementById('yearsUntilRetirement').textContent = retirementAge - currentAge;
        document.getElementById('lifeExpectancyDetail').textContent = lifeExpectancy;
    }

    // Function to display a message when no retirement plan is found
    function displayNoDataMessage() {
        document.getElementById('retirementChartContainer').innerHTML = `
            <div class="no-data-message">
                <i class="fas fa-chart-pie"></i>
                <p>No retirement plan found. Please create a retirement plan first.</p>
            </div>
        `;
    }

    // Helper function to format currency values
    function formatCurrency(value) {
        return '$' + value.toFixed(2).replace(/\d(?=(\d{3})+\.)/g, '$&,');
    }
});


/* ============================================================
   Retirement Accounts Section
   ============================================================ */

   document.addEventListener('DOMContentLoaded', function() {
    // DOM Elements
    const addAccountBtn = document.getElementById('addAccountBtn');
    const accountModal = document.getElementById('accountModal');
    const closeModal = document.querySelector('.close');
    const accountForm = document.getElementById('accountForm');
    const accountsGrid = document.getElementById('accountsGrid');
    const retirementProgressFill = document.getElementById('retirementProgressFill');
    const retirementProgressText = document.getElementById('retirementProgressText');
    const accountTypeSelect = document.getElementById('accountType');
    
    // Chart variables
    let accountProjectionChart = null;
    
    // Initialize
    loadAndDisplayAccounts();
    
    // Event Listeners
    addAccountBtn.addEventListener('click', () => accountModal.style.display = 'block');
    closeModal.addEventListener('click', () => accountModal.style.display = 'none');
    
    window.addEventListener('click', (e) => {
        if (e.target === accountModal) {
            accountModal.style.display = 'none';
        }
    });
    
    accountForm.addEventListener('submit', function(e) {
        e.preventDefault();
        saveAccount();
    });
    
    accountTypeSelect.addEventListener('change', function() {
        toggleEmployerMatchField(this.value);
    });
    
    // Function to load and display accounts
    function loadAndDisplayAccounts() {
        const accounts = getAccounts();
        const retirementPlan = getLatestRetirementPlan();
        
        if (accounts.length === 0) {
            accountsGrid.innerHTML = `
                <div class="no-accounts">
                    <i class="fas fa-landmark"></i>
                    <p>No retirement accounts added yet</p>
                </div>
            `;
            updateProgressBar(0);
            return;
        }
        
        // Display accounts
        accountsGrid.innerHTML = '';
        let totalProjectedValue = 0;
        
        accounts.forEach((account, index) => {
            const projectedValue = calculateAccountProjection(account, retirementPlan);
            totalProjectedValue += projectedValue;
            
            const accountCard = document.createElement('div');
            accountCard.className = `account-card ${account.type}`;
            accountCard.innerHTML = `
                <div class="account-header">
                    <h4 class="account-name">${account.name}</h4>
                    <span class="account-type">${getAccountTypeName(account.type)}</span>
                </div>
                <div class="account-details">
                    <div class="account-detail">
                        <span class="label">Current Balance:</span>
                        <span class="value">${formatCurrency(account.balance)}</span>
                    </div>
                    <div class="account-detail">
                        <span class="label">Monthly Contribution:</span>
                        <span class="value">${formatCurrency(account.monthlyContribution)}</span>
                    </div>
                    ${account.type === 'mpf' ? `
                    <div class="account-detail">
                        <span class="label">Employer Match:</span>
                        <span class="value">${account.employerMatch}%</span>
                    </div>
                    ` : ''}
                    <div class="account-detail">
                        <span class="label">Growth Rate:</span>
                        <span class="value">${account.growthRate}%</span>
                    </div>
                    <div class="account-detail">
                        <span class="label">Projected at Retirement:</span>
                        <span class="value">${formatCurrency(projectedValue)}</span>
                    </div>
                </div>
                <div class="account-actions">
                    <button class="btn btn-small btn-edit" data-index="${index}">
                        <i class="fas fa-edit"></i> Edit
                    </button>
                    <button class="btn btn-small btn-delete" data-index="${index}">
                        <i class="fas fa-trash"></i> Delete
                    </button>
                </div>
            `;
            
            accountsGrid.appendChild(accountCard);
        });
        
        // Add event listeners to buttons in the cards
        document.querySelectorAll('.btn-edit').forEach(btn => {
            btn.addEventListener('click', function() {
                editAccount(parseInt(this.dataset.index));
            });
        });
        
        document.querySelectorAll('.btn-delete').forEach(btn => {
            btn.addEventListener('click', function() {
                deleteAccount(parseInt(this.dataset.index));
            });
        });
        
        // Update progress bar
        if (retirementPlan) {
            const progressPercentage = Math.min((totalProjectedValue / retirementPlan.retirementSavings) * 100, 100);
            updateProgressBar(progressPercentage);
        } else {
            updateProgressBar(0);
        }
        
        // Update projection chart
        updateProjectionChart(accounts, retirementPlan);
    }
    
    function toggleEmployerMatchField(accountType) {
        const employerMatchGroup = document.getElementById('employerMatchGroup');
        if (accountType === 'mpf') {
            employerMatchGroup.style.display = 'block';
            document.getElementById('employerMatch').value = '5';
        } else {
            employerMatchGroup.style.display = 'none';
            document.getElementById('employerMatch').value = '0';
        }
    }
    
    function saveAccount() {
        try {
            // Get form values
            const accountType = document.getElementById('accountType').value;
            const accountName = document.getElementById('accountName').value.trim();
            const accountBalance = parseFloat(document.getElementById('accountBalance').value);
            const monthlyContribution = parseFloat(document.getElementById('monthlyContribution').value);
            const growthRate = parseFloat(document.getElementById('growthRate').value);
            
            // Validate common fields
            if (!accountType) throw new Error("Please select an account type");
            if (!accountName) throw new Error("Please enter an account name");
            if (isNaN(accountBalance)) throw new Error("Please enter a valid current balance");
            if (isNaN(monthlyContribution)) throw new Error("Please enter a valid monthly contribution");
            if (isNaN(growthRate)) throw new Error("Please enter a valid growth rate");
            
            // Handle MPF-specific validation
            let employerMatch = 0;
            if (accountType === 'mpf') {
                employerMatch = parseFloat(document.getElementById('employerMatch').value);
                if (isNaN(employerMatch) || employerMatch < 5) {
                    throw new Error("MPF requires minimum 5% employer contribution");
                }
            }
            
            // Create account object
            const account = {
                type: accountType,
                name: accountName,
                balance: accountBalance,
                monthlyContribution: monthlyContribution,
                growthRate: growthRate,
                employerMatch: employerMatch,
                createdAt: new Date().toISOString()
            };
            
            // Save to localStorage
            const accounts = getAccounts();
            accounts.push(account);
            localStorage.setItem('retirementAccounts', JSON.stringify(accounts));
            
            // Reset and close
            accountModal.style.display = 'none';
            accountForm.reset();
            loadAndDisplayAccounts();
            
        } catch (error) {
            alert(`Error: ${error.message}`);
            console.error("Save error:", error);
        }
    }
    
    function editAccount(index) {
        const accounts = getAccounts();
        if (index >= accounts.length) return;
        
        const account = accounts[index];
        
        // Fill form with account data
        document.getElementById('accountType').value = account.type;
        document.getElementById('accountName').value = account.name;
        document.getElementById('accountBalance').value = account.balance;
        document.getElementById('monthlyContribution').value = account.monthlyContribution;
        document.getElementById('growthRate').value = account.growthRate;
        
        // Handle MPF fields
        toggleEmployerMatchField(account.type);
        if (account.type === 'mpf') {
            document.getElementById('employerMatch').value = account.employerMatch;
        }
        
        // Show modal
        accountModal.style.display = 'block';
        
        // Temporarily modify form submit to handle edit
        const originalSubmit = accountForm.onsubmit;
        accountForm.onsubmit = function(e) {
            e.preventDefault();
            
            try {
                // Get updated values
                const updatedAccount = {
                    type: document.getElementById('accountType').value,
                    name: document.getElementById('accountName').value.trim(),
                    balance: parseFloat(document.getElementById('accountBalance').value),
                    monthlyContribution: parseFloat(document.getElementById('monthlyContribution').value),
                    growthRate: parseFloat(document.getElementById('growthRate').value),
                    employerMatch: document.getElementById('accountType').value === 'mpf' 
                        ? parseFloat(document.getElementById('employerMatch').value) 
                        : 0,
                    createdAt: account.createdAt
                };
                
                // Validate
                if (!updatedAccount.type) throw new Error("Please select an account type");
                if (!updatedAccount.name) throw new Error("Please enter an account name");
                if (isNaN(updatedAccount.balance)) throw new Error("Please enter a valid current balance");
                if (isNaN(updatedAccount.monthlyContribution)) throw new Error("Please enter a valid monthly contribution");
                if (isNaN(updatedAccount.growthRate)) throw new Error("Please enter a valid growth rate");
                if (updatedAccount.type === 'mpf' && (isNaN(updatedAccount.employerMatch) || updatedAccount.employerMatch < 5)) {
                    throw new Error("MPF requires minimum 5% employer contribution");
                }
                
                // Update account
                accounts[index] = updatedAccount;
                localStorage.setItem('retirementAccounts', JSON.stringify(accounts));
                
                // Reset and close
                accountModal.style.display = 'none';
                accountForm.reset();
                loadAndDisplayAccounts();
                
            } catch (error) {
                alert(`Error: ${error.message}`);
                console.error("Update error:", error);
            } finally {
                // Restore original submit handler
                accountForm.onsubmit = originalSubmit;
            }
        };
    }
    
    function deleteAccount(index) {
        if (!confirm('Are you sure you want to delete this account?')) return;
        
        const accounts = getAccounts();
        accounts.splice(index, 1);
        localStorage.setItem('retirementAccounts', JSON.stringify(accounts));
        loadAndDisplayAccounts();
    }
    
    function getAccounts() {
        return JSON.parse(localStorage.getItem('retirementAccounts')) || [];
    }
    
    function getLatestRetirementPlan() {
        const plans = JSON.parse(localStorage.getItem('retirementPlans')) || [];
        return plans.length > 0 ? plans[plans.length - 1] : null;
    }
    
    function calculateAccountProjection(account, retirementPlan) {
        if (!retirementPlan) return account.balance;
        
        const yearsToRetirement = retirementPlan.retirementAge - retirementPlan.currentAge;
        let projectedValue = account.balance;
        const annualGrowthRate = account.growthRate / 100;
        
        // For MPF accounts, include employer match
        const effectiveMonthlyContribution = account.type === 'mpf' 
            ? account.monthlyContribution * (1 + (account.employerMatch / 100)) 
            : account.monthlyContribution;
        
        // Monthly compounding calculation
        for (let year = 1; year <= yearsToRetirement; year++) {
            for (let month = 1; month <= 12; month++) {
                projectedValue += effectiveMonthlyContribution;
                projectedValue *= (1 + annualGrowthRate / 12);
            }
        }
        
        return projectedValue;
    }
    
    function updateProgressBar(percentage) {
        retirementProgressFill.style.width = `${percentage}%`;
        retirementProgressText.textContent = `${percentage.toFixed(1)}% of goal reached`;
        
        // Visual feedback
        if (percentage >= 100) {
            retirementProgressFill.style.background = 'linear-gradient(to right, #2ecc71, #27ae60)';
        } else if (percentage >= 75) {
            retirementProgressFill.style.background = 'linear-gradient(to right, #3498db, #2ecc71)';
        } else {
            retirementProgressFill.style.background = 'linear-gradient(to right, #e74c3c, #e67e22)';
        }
    }
    
    function updateProjectionChart(accounts, retirementPlan) {
        if (!retirementPlan || accounts.length === 0) {
            if (accountProjectionChart) {
                accountProjectionChart.destroy();
                accountProjectionChart = null;
            }
            return;
        }
        
        const yearsToRetirement = retirementPlan.retirementAge - retirementPlan.currentAge;
        const labels = Array.from({ length: yearsToRetirement + 1 }, (_, i) => retirementPlan.currentAge + i);
        const datasets = [];
        
        // Calculate data for each account
        accounts.forEach(account => {
            const data = [account.balance]; // Starting balance
            let balance = account.balance;
            const monthlyGrowthRate = account.growthRate / 100 / 12;
            const effectiveMonthlyContribution = account.type === 'mpf' 
                ? account.monthlyContribution * (1 + (account.employerMatch / 100)) 
                : account.monthlyContribution;
            
            for (let year = 1; year <= yearsToRetirement; year++) {
                for (let month = 1; month <= 12; month++) {
                    balance += effectiveMonthlyContribution;
                    balance *= (1 + monthlyGrowthRate);
                }
                data.push(balance);
            }
            
            datasets.push({
                label: `${account.name} (${getAccountTypeName(account.type)})`,
                data: data,
                borderWidth: 2,
                fill: false,
                tension: 0.1
            });
        });
        
        // Create or update chart
        const ctx = document.getElementById('accountProjectionChart').getContext('2d');
        
        if (accountProjectionChart) {
            accountProjectionChart.data.labels = labels;
            accountProjectionChart.data.datasets = datasets;
            accountProjectionChart.update();
        } else {
            accountProjectionChart = new Chart(ctx, {
                type: 'line',
                data: {
                    labels: labels,
                    datasets: datasets
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                        tooltip: {
                            callbacks: {
                                label: function(context) {
                                    return `${context.dataset.label}: ${formatCurrency(context.parsed.y)}`;
                                }
                            }
                        },
                        legend: {
                            position: 'bottom'
                        }
                    },
                    scales: {
                        x: {
                            title: {
                                display: true,
                                text: 'Age'
                            }
                        },
                        y: {
                            title: {
                                display: true,
                                text: 'Account Value (HKD)'
                            },
                            beginAtZero: true
                        }
                    }
                }
            });
        }
    }
    
    function getAccountTypeName(type) {
        const typeNames = {
            'mpf': 'MPF',
            'ira': 'IRA',
            '401k': '401(k)',
            'other': 'Other'
        };
        return typeNames[type] || type;
    }
    
    function formatCurrency(value) {
        return 'HK$' + value.toFixed(2).replace(/\d(?=(\d{3})+\.)/g, '$&,');
    }
});