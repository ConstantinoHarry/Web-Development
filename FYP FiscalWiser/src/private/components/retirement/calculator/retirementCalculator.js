/*
* Retirement Calculator
* This script calculates the required retirement savings based on user inputs.
* It includes input validation, calculations for future expenses, and a chart to visualize savings projection.
* The chart is generated using Chart.js and includes annotations for better understanding.
* The script also handles local storage to save the retirement plan for future reference.   
* Author: Constantino Harry Alexander 
*/

let retirementChart = null; // Global variable to store the retirement chart instance

// Event listener for the "Calculate" button
document.getElementById('calculateButton').addEventListener('click', function () {
    try {
        // Get and validate input values
        const currentAge = validateAge(parseFloat(document.getElementById('currentAge').value), "Current Age");
        const retirementAge = validateAge(parseFloat(document.getElementById('retirementAge').value), "Retirement Age");

        validateAgeOrder(currentAge, retirementAge); // Ensure retirement age is greater than current age

        const monthlyExpenses = validatePositiveNumber(
            parseFloat(document.getElementById('monthlyExpenses').value),
            "Monthly Expenses"
        );

        const inflationRate = validatePercentage(
            parseFloat(document.getElementById('inflationRate').value),
            "Inflation Rate"
        );

        const investmentReturn = validateMinPercentage(
            parseFloat(document.getElementById('investmentReturn').value),
            "Expected Annual Return",
            0.1 // Minimum 0.1% allowed
        );

        const currentSavings = validateNonNegativeNumber(
            parseFloat(document.getElementById('currentSavings').value),
            "Current Savings"
        );

        // Calculate values with safeguards
        const yearsUntilRetirement = retirementAge - currentAge; // Years left until retirement
        const futureMonthlyExpenses = calculateFutureExpenses(monthlyExpenses, inflationRate, yearsUntilRetirement); // Adjust expenses for inflation
        const retirementSavings = calculateRetirementSavings(futureMonthlyExpenses, investmentReturn); // Calculate required savings
        const savingsGap = retirementSavings - currentSavings; // Calculate the gap between required and current savings

        if (yearsUntilRetirement <= 0) {
            throw new Error("Retirement age must be greater than current age");
        }

        const monthlySavingsRequired = savingsGap / (yearsUntilRetirement * 12); // Monthly savings needed
        const yearlySavingsRequired = savingsGap / yearsUntilRetirement; // Yearly savings needed

        // Display results with formatting
        displayResult('result', retirementSavings); // Display total retirement savings required
        displayResult('monthlySavings', monthlySavingsRequired); // Display monthly savings required
        displayResult('yearlySavings', yearlySavingsRequired); // Display yearly savings required

        // Generate chart to visualize savings projection
        generateChart(currentAge, retirementAge, currentSavings, retirementSavings, monthlySavingsRequired);

    } catch (error) {
        alert(error.message); // Show error message to the user
        console.error("Calculation error:", error); // Log error for debugging
    }
});

// Validation functions to ensure input values are valid
function validateAge(age, fieldName) {
    if (isNaN(age)) throw new Error(`${fieldName} must be a number`);
    if (age < 18) throw new Error(`${fieldName} must be at least 18`);
    if (age > 100) throw new Error(`${fieldName} must be less than 100`);
    return age;
}

function validateAgeOrder(currentAge, retirementAge) {
    if (retirementAge <= currentAge) {
        throw new Error("Retirement age must be greater than current age");
    }
}

function validatePositiveNumber(value, fieldName) {
    if (isNaN(value)) throw new Error(`${fieldName} must be a number`);
    if (value <= 0) throw new Error(`${fieldName} must be greater than 0`);
    return value;
}

function validateNonNegativeNumber(value, fieldName) {
    if (isNaN(value)) throw new Error(`${fieldName} must be a number`);
    if (value < 0) throw new Error(`${fieldName} cannot be negative`);
    return value;
}

function validatePercentage(value, fieldName) {
    if (isNaN(value)) throw new Error(`${fieldName} must be a number`);
    if (value < 0) throw new Error(`${fieldName} cannot be negative`);
    if (value > 50) throw new Error(`${fieldName} seems too high (max 50%)`);
    return value / 100; // Convert percentage to decimal
}

function validateMinPercentage(value, fieldName, minValue) {
    if (isNaN(value)) throw new Error(`${fieldName} must be a number`);
    if (value < minValue) throw new Error(`${fieldName} must be at least ${minValue}%`);
    if (value > 50) throw new Error(`${fieldName} seems too high (max 50%)`);
    return value / 100; // Convert percentage to decimal
}

// Calculation functions
function calculateFutureExpenses(currentExpenses, inflationRate, years) {
    // Cap inflation rate to prevent unrealistic projections
    const safeInflationRate = Math.min(inflationRate, 0.1); // Max 10% inflation
    return currentExpenses * Math.pow(1 + safeInflationRate, years); // Compound inflation
}

function calculateRetirementSavings(futureMonthlyExpenses, investmentReturn) {
    // Ensure we don't divide by zero and handle very low returns
    const safeWithdrawalRate = Math.max(0.01, Math.min(investmentReturn, 0.1)); // Between 1% and 10%
    return futureMonthlyExpenses * 12 / safeWithdrawalRate; // Calculate required savings
}

// Display function to format and show results
function displayResult(elementId, value) {
    const formattedValue = value >= 0
        ? `$${Math.abs(value).toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ",")}`
        : `-$${Math.abs(value).toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ",")}`;
    document.getElementById(elementId).textContent = formattedValue; // Update the DOM element
}

// Chart generation function to visualize savings projection
function generateChart(currentAge, retirementAge, currentSavings, retirementSavings, monthlySavingsRequired) {
    const ctx = document.getElementById('retirementChart').getContext('2d');

    if (retirementChart) {
        retirementChart.destroy(); // Destroy existing chart if it exists
    }

    const lifeExpectancy = 85; // Assume life expectancy of 85 years
    const years = [];
    const savings = [];
    const retirementGoals = [];
    let currentSavingsValue = currentSavings;

    for (let age = currentAge; age <= lifeExpectancy; age++) {
        years.push(age);
        if (age < retirementAge) {
            currentSavingsValue += monthlySavingsRequired * 12; // Accumulate savings
        } else {
            currentSavingsValue -= retirementSavings * 0.04; // Withdraw 4% annually
        }
        savings.push(Math.max(0, currentSavingsValue)); // Ensure savings don't go below 0
        retirementGoals.push(retirementSavings); // Constant retirement goal
    }

    // Create the chart
    retirementChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: years,
            datasets: [
                {
                    label: 'Your Savings Projection',
                    data: savings,
                    borderColor: '#4bc0c0',
                    backgroundColor: 'rgba(75, 192, 192, 0.2)',
                    borderWidth: 3,
                    pointBackgroundColor: '#fff',
                    pointBorderColor: '#4bc0c0',
                    pointRadius: 4,
                    pointHoverRadius: 6,
                    fill: true,
                    tension: 0.3,
                    segment: {
                        borderColor: function(context) {
                            return context.p1.parsed.y < retirementSavings ? '#ff6384' : '#4bc0c0';
                        }
                    }
                },
                {
                    label: 'Retirement Goal',
                    data: retirementGoals,
                    borderColor: '#ff9f40',
                    backgroundColor: 'rgba(255, 159, 64, 0.1)',
                    borderWidth: 2,
                    borderDash: [5, 5],
                    pointRadius: 0,
                    fill: false,
                    tension: 0
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            interaction: {
                intersect: false,
                mode: 'index'
            },
            plugins: {
                legend: {
                    position: 'top',
                    labels: {
                        color: '#e0e0e0',
                        font: {
                            size: 14,
                            weight: 'bold'
                        },
                        padding: 20,
                        usePointStyle: true
                    }
                },
                tooltip: {
                    backgroundColor: 'rgba(30, 30, 30, 0.95)',
                    titleColor: '#4bc0c0',
                    bodyColor: '#e0e0e0',
                    borderColor: '#4bc0c0',
                    borderWidth: 1,
                    padding: 12,
                    usePointStyle: true,
                    callbacks: {
                        label: function(context) {
                            let label = context.dataset.label || '';
                            if (label) {
                                label += ': ';
                            }
                            if (context.parsed.y !== null) {
                                label += '$' + context.parsed.y.toLocaleString();
                            }
                            return label;
                        },
                        footer: function(tooltipItems) {
                            const currentAge = tooltipItems[0].label;
                            if (currentAge == retirementAge) {
                                return 'Retirement Age';
                            } else if (currentAge > retirementAge) {
                                return 'Withdrawing 4% annually';
                            }
                            return 'Accumulation Phase';
                        }
                    }
                },
                annotation: {
                    annotations: {
                        line1: {
                            type: 'line',
                            yMin: retirementSavings,
                            yMax: retirementSavings,
                            borderColor: '#ff9f40',
                            borderWidth: 1,
                            borderDash: [6, 6],
                            label: {
                                content: 'Target',
                                enabled: true,
                                position: 'right',
                                backgroundColor: 'rgba(255, 159, 64, 0.7)',
                                color: '#fff',
                                font: {
                                    weight: 'bold'
                                }
                            }
                        },
                        box1: {
                            type: 'box',
                            xMin: retirementAge,
                            xMax: lifeExpectancy,
                            backgroundColor: 'rgba(255, 99, 132, 0.1)',
                            borderColor: 'rgba(255, 99, 132, 0.5)',
                            borderWidth: 1,
                            label: {
                                content: 'Retirement Phase',
                                enabled: true,
                                position: 'top',
                                backgroundColor: 'rgba(255, 99, 132, 0.7)',
                                color: '#fff'
                            }
                        }
                    }
                }
            },
            scales: {
                x: {
                    title: {
                        display: true,
                        text: 'Age',
                        color: '#b0b0b0',
                        font: {
                            size: 14,
                            weight: 'bold'
                        },
                        padding: {top: 10}
                    },
                    grid: {
                        color: 'rgba(255, 255, 255, 0.1)',
                        drawTicks: false
                    },
                    ticks: {
                        color: '#b0b0b0',
                        maxRotation: 0,
                        autoSkipPadding: 20
                    }
                },
                y: {
                    title: {
                        display: true,
                        text: 'Savings ($)',
                        color: '#b0b0b0',
                        font: {
                            size: 14,
                            weight: 'bold'
                        },
                        padding: {bottom: 10}
                    },
                    grid: {
                        color: 'rgba(255, 255, 255, 0.1)',
                        drawTicks: false
                    },
                    ticks: {
                        color: '#b0b0b0',
                        callback: function(value) {
                            return '$' + value.toLocaleString();
                        }
                    },
                    min: 0 // Ensure chart starts at 0
                }
            },
            elements: {
                line: {
                    tension: 0.3
                },
                point: {
                    hoverRadius: 8,
                    hoverBorderWidth: 2
                }
            }
        }
    });
}

// Append retirement information to local storage
document.getElementById('appendRetirementInfo').addEventListener('click', function() {
    try {
        // Get all the input values
        const retirementData = {
            currentAge: parseFloat(document.getElementById('currentAge').value),
            retirementAge: parseFloat(document.getElementById('retirementAge').value),
            monthlyExpenses: parseFloat(document.getElementById('monthlyExpenses').value),
            inflationRate: parseFloat(document.getElementById('inflationRate').value),
            investmentReturn: parseFloat(document.getElementById('investmentReturn').value),
            currentSavings: parseFloat(document.getElementById('currentSavings').value),
            timestamp: new Date().toISOString(),
            retirementSavings: parseFloat(document.getElementById('result').textContent.replace(/[^0-9.-]+/g,"")) || 0,
            monthlySavingsRequired: parseFloat(document.getElementById('monthlySavings').textContent.replace(/[^0-9.-]+/g,"")) || 0,
            yearlySavingsRequired: parseFloat(document.getElementById('yearlySavings').textContent.replace(/[^0-9.-]+/g,""))|| 0
        };

        // Validate the data
        validateAge(retirementData.currentAge, "Current Age");
        validateAge(retirementData.retirementAge, "Retirement Age");
        validateAgeOrder(retirementData.currentAge, retirementData.retirementAge);
        validatePositiveNumber(retirementData.monthlyExpenses, "Monthly Expenses");
        validatePercentage(retirementData.inflationRate, "Inflation Rate");
        validateMinPercentage(retirementData.investmentReturn, "Expected Annual Return", 0.1);
        validateNonNegativeNumber(retirementData.currentSavings, "Current Savings");

        // Save to local storage
        saveRetirementPlan(retirementData);
        
        alert("Retirement plan saved successfully! You can now track it on your dashboard.");
    } catch (error) {
        alert("Error saving retirement plan: " + error.message);
        console.error("Save error:", error);
    }
});

// Function to save retirement plan to local storage
function saveRetirementPlan(data) {
    try {
        // Get existing plans or create new array
        let retirementPlans = JSON.parse(localStorage.getItem('retirementPlans')) || [];
        
        // Add new plan
        retirementPlans.push(data);
        
        // Save back to local storage
        localStorage.setItem('retirementPlans', JSON.stringify(retirementPlans));
    } catch (error) {
        console.error("Error saving to local storage:", error);
        throw new Error("Failed to save retirement plan. Please try again.");
    }
}