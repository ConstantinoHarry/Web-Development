/*
    * Stock Ticker Application
    * This application allows users to:
    * - Search for stock data using stock symbols.
    * - View detailed stock information, including current price, daily high/low, and price changes.
    * - Buy and sell stocks, with real-time updates to the user's balance and portfolio.
    * - Visualize portfolio allocation using a dynamic doughnut chart.
    * - Track portfolio performance, including total returns and daily changes.
    * - Reset the portfolio and balance to start fresh.
    * - View historical stock price data with interactive line charts.
    * 
    * Key Features:
    * - Uses the Financial Modeling Prep API to fetch real-time stock data and historical prices.
    * - Stores portfolio and balance data in localStorage for persistence across sessions.
    * - Provides a responsive and visually appealing user interface with modern charting techniques.
    * - Includes a modal for selling stocks, allowing users to specify the number of shares to sell.
    * - Calculates and displays total portfolio returns (both dollar and percentage).
    * 
    * Operations:
    * - Search: Fetches stock data and historical prices for a given symbol.
    * - Buy: Deducts the cost of shares from the balance and updates the portfolio.
    * - Sell: Adds the revenue from selling shares to the balance and updates the portfolio.
    * - Reset: Clears the portfolio and resets the balance to the initial value.
    * - Update: Periodically fetches the latest stock prices to keep the portfolio up-to-date.
    * - Visualization: Renders charts for portfolio allocation and historical stock prices.
    * 
    * Designed for educational purposes to simulate stock trading in a risk-free environment.
*/

document.addEventListener('DOMContentLoaded', function() {
    // DOM Elements

    const balanceElement = document.getElementById('balance'); // Element to display the user's balance
    const portfolioValueElement = document.getElementById('portfolio-value'); // Element to display the total portfolio value
    const portfolioBody = document.getElementById('portfolio-body'); // Table body for displaying portfolio stocks
    const stockSymbolInput = document.getElementById('stock-symbol'); // Input field for entering stock symbols
    const searchBtn = document.getElementById('search-btn'); // Button to search for stock data
    const stockInfoSection = document.getElementById('stock-info'); // Section to display stock information
    const stockNameElement = document.getElementById('stock-name'); // Element to display the stock name
    const currentPriceElement = document.getElementById('current-price'); // Element to display the current stock price
    const priceChangeElement = document.getElementById('price-change'); // Element to display the price change
    const openPriceElement = document.getElementById('open-price'); // Element to display the opening price
    const highPriceElement = document.getElementById('high-price'); // Element to display the highest price of the day
    const lowPriceElement = document.getElementById('low-price'); // Element to display the lowest price of the day
    const prevCloseElement = document.getElementById('prev-close'); // Element to display the previous closing price
    const sharesAmountInput = document.getElementById('shares-amount'); // Input field for entering the number of shares
    const buyBtn = document.getElementById('buy-btn'); // Button to buy stocks
    const sellBtn = document.getElementById('sell-btn'); // Button to sell stocks
    const resetBalanceBtn = document.getElementById('reset-balance'); // Button to reset the user's balance
    const initialBalanceInput = document.getElementById('initial-balance'); // Input field for setting the initial balance

    // Chart elements
    const ctx = document.getElementById('stockChart').getContext('2d'); // Canvas context for the stock chart
    const portfolioCtx = document.getElementById('portfolioChart').getContext('2d'); // Canvas context for the portfolio chart
    let stockChart = null; // Variable to store the stock chart instance
    let portfolioChart = null; // Variable to store the portfolio chart instance

    // State
    let balance = parseFloat(localStorage.getItem('balance')) || 10000; // User's balance, default to $10,000
    let initialBalance = parseFloat(localStorage.getItem('initialBalance')) || balance; // Initial balance for resetting
    let portfolio = {}; // Object to store the user's portfolio
    const savedPortfolio = JSON.parse(localStorage.getItem('portfolio')) || {}; // Load saved portfolio from localStorage
    for (const symbol in savedPortfolio) {
        portfolio[symbol] = {
            ...savedPortfolio[symbol],
            currentPrice: savedPortfolio[symbol].currentPrice || savedPortfolio[symbol].avgPrice // Use current price or average price
        };
    }
    let currentStock = null;      // Currently selected stock symbol
    let currentStockData = null; // Data for the currently selected stock
    let updateInterval = null;  // Interval for updating stock prices

    // Financial Modeling Prep API 
    const API_KEY = 'quMs7bPlpU8a53b7MFP2RwWxJYc8QQAa';  // API key for Financial Modeling Prep
    const API_BASE_URL = 'https://financialmodelingprep.com/api/v3/quote/';  // Base URL for fetching stock quotes
    const HISTORICAL_API_URL = 'https://financialmodelingprep.com/api/v3/historical-price-full/';  // URL for fetching historical stock data

    // Initialize the application
        updateBalanceDisplay(); // Update the balance display
        fetchAllCurrentPrices().then(() => {
        updatePortfolioValue(); // Update the total portfolio value
        updatePortfolioTable(); // Update the portfolio table
        renderPortfolioChart(); // Render the portfolio chart
    });

    // Event Listeners
    searchBtn.addEventListener('click', searchStock); // Search for stock data when the search button is clicked
    stockSymbolInput.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') searchStock(); // Search for stock data when the Enter key is pressed
    });
    buyBtn.addEventListener('click', buyStock); // Buy stocks when the buy button is clicked
    sellBtn.addEventListener('click', sellStock); // Sell stocks when the sell button is clicked
    resetBalanceBtn.addEventListener('click', resetBalance); // Reset the user's balance and portfolio
    initialBalanceInput.addEventListener('change', updateInitialBalance); // Update the initial balance when the input value changes

    // Add resize event listener for portfolio chart
    window.addEventListener('resize', () => {
        if (portfolioChart) {
            portfolioChart.resize(); // Resize the portfolio chart on window resize
        }
    });

    // Functions

    function updateInitialBalance() {
        const newBalance = parseFloat(initialBalanceInput.value) || 10000;
        if (newBalance >= 100) {
            balance = newBalance;
            initialBalance = newBalance; // Store initial balance
            portfolio = {};
            localStorage.setItem('balance', balance);
            localStorage.setItem('initialBalance', initialBalance); // Store in localStorage
            localStorage.setItem('portfolio', JSON.stringify(portfolio));
            updateBalanceDisplay();
            updatePortfolioValue();
            updatePortfolioTable();
            renderPortfolioChart();
        } else {
            alert('Minimum starting balance is $100');
            initialBalanceInput.value = balance;
        }
    }
    
    function resetBalance() {
        if (confirm('Are you sure you want to reset your balance and portfolio?')) {
            balance = parseFloat(initialBalanceInput.value) || 10000;
            initialBalance = balance; // Reset initial balance
            portfolio = {};
            localStorage.setItem('balance', balance);
            localStorage.setItem('initialBalance', initialBalance); // Store in localStorage
            localStorage.setItem('portfolio', JSON.stringify(portfolio));
            updateBalanceDisplay();
            updatePortfolioValue();
            updatePortfolioTable();
            renderPortfolioChart();
        }
    }


    // Search for stock data
    async function searchStock() {
        const symbol = stockSymbolInput.value.trim().toUpperCase(); // Get the stock symbol from the input
        if (!symbol) {
            alert('Please enter a stock symbol'); // Show an alert if the input is empty
            return;
        }

        try {
            // Show loading state
            stockInfoSection.style.display = 'none'; // Hide the stock info section
            stockNameElement.textContent = 'Loading...'; // Show a loading message

            // Fetch stock data and historical data
            const [quoteData, historicalData] = await Promise.all([
                fetchStockData(symbol), // Fetch the stock quote data
                fetchHistoricalData(symbol) // Fetch the historical stock data
            ]);

            if (!quoteData || quoteData.length === 0) {
                throw new Error('Invalid stock symbol'); // Throw an error if the stock symbol is invalid
            }

            currentStock = symbol; // Set the current stock symbol
            currentStockData = quoteData[0]; // Set the current stock data

            // Update the UI with stock data
            stockNameElement.textContent = `${symbol} - ${currentStockData.symbol}`; // Display the stock name and symbol
            const currentPrice = parseFloat(currentStockData.price); // Get the current price
            const openPrice = parseFloat(currentStockData.open); // Get the opening price
            const highPrice = parseFloat(currentStockData.dayHigh); // Get the highest price of the day
            const lowPrice = parseFloat(currentStockData.dayLow); // Get the lowest price of the day
            const prevClose = parseFloat(currentStockData.prevClose); // Get the previous closing price
            const changeAmount = parseFloat(currentStockData.change); // Get the price change amount
            const changePercent = currentStockData.changesPercentage; // Get the price change percentage

            // Update the stock info section
            currentPriceElement.textContent = `$${currentPrice.toFixed(2)}`; // Display the current price
            openPriceElement.textContent = `$${openPrice.toFixed(2)}`; // Display the opening price
            highPriceElement.textContent = `$${highPrice.toFixed(2)}`; // Display the highest price
            lowPriceElement.textContent = `$${lowPrice.toFixed(2)}`; // Display the lowest price
            prevCloseElement.textContent = `$${prevClose.toFixed(2)}`; // Display the previous closing price
            priceChangeElement.textContent = `${changeAmount >= 0 ? '+' : ''}${changeAmount.toFixed(2)} (${changePercent}%)`; // Display the price change
            priceChangeElement.className = changeAmount >= 0 ? 'change' : 'change negative'; // Style the price change based on its value

            // Enable/disable the sell button based on whether the user owns this stock
            sellBtn.disabled = !portfolio[symbol] || portfolio[symbol].shares === 0;

            // Show the stock info section
            stockInfoSection.style.display = 'block';

            // Render the stock chart
            renderChart(historicalData);

            // Start updating the stock price every 10 seconds
            if (updateInterval) clearInterval(updateInterval); // Clear any existing interval
            updateInterval = setInterval(() => updateStockPrice(symbol), 10000); // Set a new interval

        } catch (error) {
            console.error('Error fetching stock data:', error); // Log the error
            alert('Failed to fetch stock data. Please check the symbol and try again.'); // Show an alert
            stockInfoSection.style.display = 'none'; // Hide the stock info section
        }
    }

    async function fetchStockData(symbol) {
        const url = `${API_BASE_URL}${symbol}?apikey=${API_KEY}`;
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }
        const data = await response.json();
        if (!data || data.length === 0) {
            throw new Error('Invalid stock symbol');
        }
        
        // Store previous close price in portfolio
        if (portfolio[symbol]) {
            portfolio[symbol].prevClose = parseFloat(data[0].previousClose);
        }
        
        return data;
    }

    async function fetchHistoricalData(symbol) {
        const url = `${HISTORICAL_API_URL}${symbol}?apikey=${API_KEY}`;
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }
        const data = await response.json();
        return data;
    }

    // Fetch all current prices for stocks in the portfolio
    // Modified fetchAllCurrentPrices to handle current stock data
async function fetchAllCurrentPrices() {
    const symbols = Object.keys(portfolio);
    if (symbols.length === 0) return;

    try {
        const response = await fetch(`${API_BASE_URL}${symbols.join(',')}?apikey=${API_KEY}`);
        const data = await response.json();

        if (data && Array.isArray(data)) {
            data.forEach(stock => {
                if (portfolio[stock.symbol]) {
                    portfolio[stock.symbol].currentPrice = stock.price;
                    // Update currentStockData if this is the currently selected stock
                    if (currentStock === stock.symbol) {
                        currentStockData = stock;
                    }
                }
            });
            localStorage.setItem('portfolio', JSON.stringify(portfolio));
        }
    } catch (error) {
        console.error('Error fetching current prices:', error);
        // Fallback to using average price if API fails
        for (const symbol in portfolio) {
            if (!portfolio[symbol].currentPrice) {
                portfolio[symbol].currentPrice = portfolio[symbol].avgPrice;
            }
        }
    }
}

    function renderChart(data) {
        // Destroy previous chart if it  exists
        if (stockChart) {
            stockChart.destroy();
        }
    
        // Prepare data for chart
        const historical = data.historical || [];
        const dates = historical.map(day => day.date).reverse();
        const prices = historical.map(day => day.close).reverse();
        const volume = historical.map(day => day.volume / 1000000).reverse(); // Convert to millions
    
        // Calculate 50-day and 200-day moving averages
        const calculateMA = (data, windowSize) => {
            return data.map((_, index) => {
                if (index < windowSize - 1) return null;
                const window = data.slice(index - windowSize + 1, index + 1);
                return window.reduce((a, b) => a + b, 0) / windowSize;
            });
        };
    
        const ma50 = calculateMA(prices, 50);
        const ma200 = calculateMA(prices, 200);
    
        // Create gradient for area fill
        const gradient = ctx.createLinearGradient(0, 0, 0, 400);
        gradient.addColorStop(0, 'rgba(58, 123, 213, 0.4)');
        gradient.addColorStop(1, 'rgba(58, 123, 213, 0.1)');
    
        // Create new chart with modern trading style
        stockChart = new Chart(ctx, {
            type: 'line',
            data: {
                labels: dates,
                datasets: [
                    {
                        label: 'Price',
                        data: prices,
                        borderColor: 'rgba(0, 191, 255, 1)',
                        backgroundColor: gradient,
                        borderWidth: 2.5,
                        pointRadius: 0,
                        tension: 0.1,
                        fill: true,
                        yAxisID: 'y'
                    },
                    {
                        label: '50-Day MA',
                        data: ma50,
                        borderColor: 'rgba(255, 193, 7, 0.8)',
                        backgroundColor: 'transparent',
                        borderWidth: 1.5,
                        pointRadius: 0,
                        borderDash: [5, 5],
                        tension: 0,
                        yAxisID: 'y'
                    },
                    {
                        label: '200-Day MA',
                        data: ma200,
                        borderColor: 'rgba(233, 30, 99, 0.8)',
                        backgroundColor: 'transparent',
                        borderWidth: 1.5,
                        pointRadius: 0,
                        tension: 0,
                        yAxisID: 'y'
                    },
                    {
                        label: 'Volume (millions)',
                        data: volume,
                        backgroundColor: 'rgba(100, 100, 100, 0.3)',
                        borderColor: 'rgba(100, 100, 100, 0.3)',
                        borderWidth: 0,
                        yAxisID: 'y1',
                        type: 'bar'
                    }
                ]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                animation: {
                    duration: 1000,
                    easing: 'easeInOutQuart'
                },
                plugins: {
                    legend: {
                        position: 'top',
                        labels: {
                            color: '#e0e0e0',
                            font: {
                                size: 12,
                                family: "'Roboto', sans-serif"
                            },
                            padding: 20,
                            usePointStyle: true,
                            pointStyle: 'circle'
                        }
                    },
                    title: {
                        display: true,
                        text: `${currentStock} - PRICE CHART`,
                        color: '#ffffff',
                        font: {
                            size: 18,
                            weight: 'bold',
                            family: "'Roboto', sans-serif"
                        },
                        padding: {
                            top: 10,
                            bottom: 20
                        }
                    },
                    tooltip: {
                        mode: 'index',
                        intersect: false,
                        backgroundColor: 'rgba(30, 30, 30, 0.9)',
                        borderColor: 'rgba(255, 255, 255, 0.1)',
                        borderWidth: 1,
                        titleColor: '#4fc3f7',
                        bodyColor: '#e0e0e0',
                        titleFont: {
                            size: 14,
                            weight: 'bold'
                        },
                        bodyFont: {
                            size: 12
                        },
                        padding: 12,
                        callbacks: {
                            label: function(context) {
                                let label = context.dataset.label || '';
                                if (label) {
                                    label += ': ';
                                }
                                if (context.parsed.y !== null) {
                                    if (context.datasetIndex === 3) { // Volume
                                        label += `${context.parsed.y.toFixed(2)}M`;
                                    } else {
                                        label += `$${context.parsed.y.toFixed(2)}`;
                                    }
                                }
                                return label;
                            }
                        }
                    },
                    crosshair: {
                        line: {
                            color: 'rgba(255, 255, 255, 0.2)',
                            width: 1,
                            dashPattern: [5, 5]
                        },
                        sync: {
                            enabled: true
                        },
                        zoom: {
                            enabled: false
                        }
                    }
                },
                scales: {
                    x: {
                        grid: {
                            display: false,
                            color: 'rgba(255, 255, 255, 0.1)'
                        },
                        ticks: {
                            color: '#b0b0b0',
                            maxRotation: 45,
                            minRotation: 45,
                            font: {
                                size: 10
                            }
                        },
                        border: {
                            color: 'rgba(255, 255, 255, 0.1)'
                        }
                    },
                    y: {
                        position: 'left',
                        grid: {
                            color: 'rgba(255, 255, 255, 0.05)',
                            drawBorder: false
                        },
                        ticks: {
                            color: '#b0b0b0',
                            callback: function(value) {
                                return '$' + value.toFixed(2);
                            },
                            font: {
                                size: 10
                            }
                        },
                        border: {
                            color: 'rgba(255, 255, 255, 0.1)'
                        }
                    },
                    y1: {
                        position: 'right',
                        grid: {
                            display: false,
                            drawOnChartArea: false
                        },
                        ticks: {
                            color: '#b0b0b0',
                            callback: function(value) {
                                return value + 'M';
                            },
                            font: {
                                size: 10
                            }
                        },
                        border: {
                            color: 'rgba(255, 255, 255, 0.1)'
                        }
                    }
                },
                interaction: {
                    mode: 'index',
                    intersect: false
                },
                elements: {
                    line: {
                        cubicInterpolationMode: 'monotone'
                    }
                }
            }
        });
    }


   function renderPortfolioChart() {
    if (portfolioChart) {
        portfolioChart.destroy();
    }

    // Prepare data with percentage calculations
    const labels = [];
    const data = [];
    const backgroundColors = [];
    const borderColors = [];
    let totalValue = 0;
    
    // Generate vibrant but professional color palette
    const colorPalette = [
        '#00c6fb', '#005bea', // Blues
        '#00d2b2', '#00b09b', // Teals
        '#ff8a00', '#ff5e00', // Oranges
        '#9c27b0', '#673ab7', // Purples
        '#4caf50', '#8bc34a', // Greens
        '#f44336', '#ff5252'  // Reds
    ];

    for (const symbol in portfolio) {
        const stock = portfolio[symbol];
        const currentValue = stock.shares * stock.currentPrice;
        labels.push(symbol);
        data.push(currentValue);
        totalValue += currentValue;
    }

    // Assign colors and generate hover effects
    data.forEach((value, i) => {
        const colorIndex = i % colorPalette.length;
        backgroundColors.push(colorPalette[colorIndex]);
        borderColors.push('#121212'); // Dark border for contrast
    });

    portfolioChart = new Chart(portfolioCtx, {
        type: 'doughnut',
        data: {
            labels: labels,
            datasets: [{
                data: data,
                backgroundColor: backgroundColors,
                borderColor: borderColors,
                borderWidth: 2,
                hoverBorderWidth: 3,
                hoverBorderColor: '#ffffff',
                hoverOffset: 10
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            cutout: '65%',
            radius: '90%',
            rotation: -30,
            circumference: 360,
            animation: {
                animateScale: true,
                animateRotate: true,
                duration: 1500,
                easing: 'easeInOutQuart'
            },
            layout: {
                padding: {
                    top: 20,
                    bottom: 20,
                    left: 20,
                    right: 20
                }
            },
            plugins: {
                legend: {
                    position: 'right',
                    labels: {
                        color: '#e0e0e0',
                        font: {
                            family: "'Roboto', sans-serif",
                            size: 12,
                            weight: '500'
                        },
                        padding: 15,
                        usePointStyle: true,
                        pointStyle: 'circle',
                        boxWidth: 10
                    },
                    onHover: function(e) {
                        e.native.target.style.cursor = 'pointer';
                    },
                    onLeave: function(e) {
                        e.native.target.style.cursor = 'default';
                    }
                },
                title: {
                    display: true,
                    text: 'PORTFOLIO ALLOCATION',
                    color: '#ffffff',
                    font: {
                        family: "'Roboto', sans-serif",
                        size: 18,
                        weight: 'bold'
                    },
                    padding: {
                        top: 10,
                        bottom: 20
                    }
                },
                subtitle: {
                    display: true,
                    text: `Total Value: $${totalValue.toLocaleString('en-US', {minimumFractionDigits: 2, maximumFractionDigits: 2})}`,
                    color: '#b0b0b0',
                    font: {
                        family: "'Roboto', sans-serif",
                        size: 14,
                        weight: 'normal'
                    },
                    padding: {
                        bottom: 20
                    }
                },
                tooltip: {
                    enabled: true,
                    backgroundColor: 'rgba(30, 30, 30, 0.95)',
                    titleColor: '#4fc3f7',
                    bodyColor: '#e0e0e0',
                    borderColor: 'rgba(255, 255, 255, 0.1)',
                    borderWidth: 1,
                    cornerRadius: 8,
                    padding: 12,
                    displayColors: true,
                    usePointStyle: true,
                    callbacks: {
                        label: function(context) {
                            const label = context.label || '';
                            const value = context.raw;
                            const percentage = (value / totalValue * 100).toFixed(2);
                            return [
                                `${label}`,
                                `Value: $${value.toLocaleString('en-US', {minimumFractionDigits: 2, maximumFractionDigits: 2})}`,
                                `Allocation: ${percentage}%`,
                                `Shares: ${portfolio[context.label].shares}`
                            ];
                        }
                    }
                },
                datalabels: {
                    display: false
                }
            },
            interaction: {
                mode: 'nearest',
                intersect: false
            },
            elements: {
                arc: {
                    borderJoinStyle: 'round',
                    borderRadius: 5
                }
            }
        },
        plugins: [{
            id: 'customCenterText',
            beforeDraw: function(chart) {
                if (chart.config.options.elements?.center) {
                    const ctx = chart.ctx;
                    const centerConfig = chart.config.options.elements.center;
                    const fontStyle = centerConfig.fontStyle || 'Arial';
                    const txt = centerConfig.text;
                    const color = centerConfig.color || '#000';
                    const sidePadding = centerConfig.sidePadding || 20;
                    
                    const {width, height} = chart;
                    ctx.restore();
                    const fontSize = Math.min(width, height) / 4;
                    ctx.font = `bold ${fontSize}px ${fontStyle}`;
                    ctx.textBaseline = 'middle';
                    
                    const textX = Math.round((width - ctx.measureText(txt).width)) / 2;
                    const textY = height / 2;
                    
                    ctx.fillStyle = color;
                    ctx.fillText(txt, textX, textY);
                    ctx.save();
                }
            }
        }]
    });

    // Add animation on load
    animateChartSections();
}

function animateChartSections() {
    const chartArea = portfolioCtx.canvas.closest('.chart-container');
    const arcs = chartArea.querySelectorAll('canvas');
    
    arcs.forEach((arc, i) => {
        arc.style.transform = 'scale(0.9)';
        arc.style.opacity = '0';
        arc.style.transition = `all 0.5s ease ${i * 0.1}s`;
        
        setTimeout(() => {
            arc.style.transform = 'scale(1)';
            arc.style.opacity = '1';
        }, 100);
    });
}

    async function updateStockPrice(symbol) {
        try {
            const data = await fetchStockData(symbol);
            if (!data || data.length === 0) return;

            const currentPrice = parseFloat(data[0].price);
            const changeAmount = parseFloat(data[0].change);
            const changePercent = data[0].changesPercentage;

            currentPriceElement.textContent = `$${currentPrice.toFixed(2)}`;
            priceChangeElement.textContent = `${changeAmount >= 0 ? '+' : ''}${changeAmount.toFixed(2)} (${changePercent}%)`;
            priceChangeElement.className = changeAmount >= 0 ? 'change' : 'change negative';

            // Update current stock data
            currentStockData = data[0];

            // Update portfolio table if we own this stock
            if (portfolio[symbol]) {
                portfolio[symbol].currentPrice = currentPrice;
                updatePortfolioTable();
                updatePortfolioValue();
                renderPortfolioChart();
            }

        } catch (error) {
            console.error('Error updating stock price:', error);
        }
    }

    function buyStock() {
        const shares = parseInt(sharesAmountInput.value) || 1;
        if (shares <= 0) {
            alert('Please enter a valid number of shares');
            return;
        }
    
        const currentPrice = parseFloat(currentStockData.price);
        const totalCost = currentPrice * shares;
    
        if (totalCost > balance) {
            alert('Insufficient funds for this purchase');
            return;
        }
    
        // Update balance
        balance -= totalCost;
        localStorage.setItem('balance', balance);
        updateBalanceDisplay();
    
        // Update portfolio
        if (!portfolio[currentStock]) {
            portfolio[currentStock] = {
                shares: shares,
                avgPrice: currentPrice,
                currentPrice: currentPrice,
                initialPrice: currentPrice // Store initial purchase price
            };
        } else {
            const totalShares = portfolio[currentStock].shares + shares;
            const totalValue = (portfolio[currentStock].avgPrice * portfolio[currentStock].shares) + totalCost;
            portfolio[currentStock].shares = totalShares;
            portfolio[currentStock].avgPrice = totalValue / totalShares;
            portfolio[currentStock].currentPrice = currentPrice;
            // Don't update initialPrice for additional purchases
        }
        // Save portfolio to localStorage
        localStorage.setItem('portfolio', JSON.stringify(portfolio));

        // Update UI
        sellBtn.disabled = false;
        updatePortfolioTable();
        updatePortfolioValue();
        renderPortfolioChart();

        // Show confirmation
        alert(`Successfully bought ${shares} shares of ${currentStock} at $${currentPrice.toFixed(2)} per share. Total cost: $${totalCost.toFixed(2)}`);
    }

    // Update balance display
    function updateBalanceDisplay() {
        balanceElement.textContent = `$${balance.toFixed(2)}`;
    }

    // Update portfolio value
    function updatePortfolioValue() {
        // Calculate current stock portfolio value
        let stockPortfolioValue = 0;
        for (const symbol in portfolio) {
            stockPortfolioValue += portfolio[symbol].shares * portfolio[symbol].currentPrice;
        }
        
        // Calculate returns
        const returns = calculateTotalPortfolioReturn();
        
        // Update display
        portfolioValueElement.textContent = 
            `$${stockPortfolioValue.toFixed(2)} | ` + 
            `Total: $${(stockPortfolioValue + balance).toFixed(2)} ` + 
            `(${returns.percentReturn >= 0 ? '+' : ''}${returns.percentReturn.toFixed(2)}%)`;
        
        // Color code based on performance
        portfolioValueElement.classList.toggle('positive', returns.percentReturn >= 0);
        portfolioValueElement.classList.toggle('negative', returns.percentReturn < 0);
    }
    
     // Update balance display
    function updateBalanceDisplay() {
        balanceElement.textContent = `$${balance.toFixed(2)}`;
    }
    
    // Modal elements to sell stocks 
    const sellModal = document.getElementById('sellModal');
    const modalStockSymbol = document.getElementById('modalStockSymbol');
    const ownedShares = document.getElementById('ownedShares');
    const sellSharesAmount = document.getElementById('sellSharesAmount');
    const confirmSellBtn = document.getElementById('confirmSellBtn');
    const cancelSellBtn = document.getElementById('cancelSellBtn');
    const closeModal = document.querySelector('.close-modal');
    // Update the portfolio table to show correct gain/loss calculations

    function updatePortfolioTable() {
        portfolioBody.innerHTML = '';
        
        for (const symbol in portfolio) {
            const stock = portfolio[symbol];
            const currentValue = stock.shares * stock.currentPrice;
            const costBasis = stock.shares * stock.avgPrice;
            
            // Calculate all required metrics
            const totalGainLoss = currentValue - costBasis;
            const totalGainLossPercent = (totalGainLoss / costBasis) * 100;
            
            // For daily change metrics (assuming we have this data)
            const prevClosePrice = stock.prevClose || stock.avgPrice; // Fallback to avgPrice if no prevClose
            const priceChange = stock.currentPrice - prevClosePrice;
            const priceChangePercent = (priceChange / prevClosePrice) * 100;
            
            // For 24h change (similar to daily change in this implementation)
            const twentyFourHourChange = priceChange; // Using same as daily change
            const twentyFourHourChangePercent = priceChangePercent;
            
            // Today's return (value change today)
            const todaysReturn = priceChange * stock.shares;
            const todaysReturnPercent = priceChangePercent; // Same as price change % for individual stock
            
            // Determine color classes
            const positiveClass = 'positive';
            const negativeClass = 'negative';
            
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${symbol}</td>
                <td>${stock.shares}</td>
                <td class="${stock.currentPrice >= stock.avgPrice ? positiveClass : negativeClass}">
                    $${stock.currentPrice.toFixed(2)}
                </td>
                <td class="${priceChange >= 0 ? positiveClass : negativeClass}">
                    $${priceChange.toFixed(2)} (${priceChangePercent.toFixed(2)}%)
                </td>
                <td>$${currentValue.toFixed(2)}</td>
                <td class="${todaysReturn >= 0 ? positiveClass : negativeClass}">
                    $${todaysReturn.toFixed(2)} (${todaysReturnPercent.toFixed(2)}%)
                </td>
                <td class="${totalGainLoss >= 0 ? positiveClass : negativeClass}">
                    $${totalGainLoss.toFixed(2)} (${totalGainLossPercent.toFixed(2)}%)
                </td>
                <td class="${twentyFourHourChange >= 0 ? positiveClass : negativeClass}">
                    ${twentyFourHourChangePercent >= 0 ? '+' : ''}${twentyFourHourChangePercent.toFixed(2)}%
                </td>
                <td>
                    <button class="btn-small sell-btn" data-symbol="${symbol}">Sell</button>
                </td>
            `;
            portfolioBody.appendChild(row);
        }
    
        // Add event listeners to sell buttons
        document.querySelectorAll('.sell-btn').forEach(button => {
            button.addEventListener('click', function() {
                const symbol = this.getAttribute('data-symbol');
                currentStock = symbol; // Set the current stock
                openSellModal(symbol);
            });
        });
    }
    
    function sellStock() {
        const sharesOwned = portfolio[currentStock]?.shares || 0;
        const sharesToSell = parseInt(sharesAmountInput.value) || 1;
    
        if (sharesToSell <= 0) {
            alert('Please enter a valid number of shares');
            return;
        }
    
        if (sharesToSell > sharesOwned) {
            alert(`You don't own enough shares of ${currentStock}. You own ${sharesOwned} shares.`);
            return;
        }
    
        // Get the current price from the portfolio (not currentStockData which might be stale)
        const currentPrice = portfolio[currentStock].currentPrice;
        const totalRevenue = currentPrice * sharesToSell;
    
        // Update balance
        balance += totalRevenue;
        localStorage.setItem('balance', balance);
        updateBalanceDisplay();
    
        // Update portfolio
        portfolio[currentStock].shares -= sharesToSell;
    
        if (portfolio[currentStock].shares === 0) {
            delete portfolio[currentStock];
            sellBtn.disabled = true; // Disable sell button if no shares left
        }
    
        localStorage.setItem('portfolio', JSON.stringify(portfolio));
    
        // Refresh all stock data to ensure prices are up-to-date
        fetchAllCurrentPrices().then(() => {
            // Update UI after prices are refreshed
            updatePortfolioTable();
            updatePortfolioValue();
            renderPortfolioChart();
    
            // Show success alert with transaction details
            alert(`✅ Successfully sold ${sharesToSell} ${sharesToSell === 1 ? 'share' : 'shares'} of ${currentStock}\n` +
                  `💰 Price per share: $${currentPrice.toFixed(2)}\n` +
                  `💵 Total received: $${totalRevenue.toFixed(2)}\n` +
                  `📊 Remaining shares: ${sharesOwned - sharesToSell}`);
        });
    }

    
    // Modal functions
    function openSellModal(symbol) {
        currentStock = symbol;
        const stock = portfolio[symbol];
        
        // Make sure we have current stock data
        if (!currentStockData) {
            fetchStockData(symbol).then(data => {
                currentStockData = data[0];
                updateModalContent(symbol, stock);
            });
        } else {
            updateModalContent(symbol, stock);
        }
    }
    
    function updateModalContent(symbol, stock) {
        modalStockSymbol.textContent = symbol;
        ownedShares.textContent = stock.shares;
        sellSharesAmount.value = '1';
        sellSharesAmount.max = stock.shares;
        sellSharesAmount.min = '1';
        
        sellModal.style.display = 'block';
    }
    
    function closeSellModal() {
        sellModal.style.display = 'none';
    }
    
    // Event listeners for modal
    closeModal.addEventListener('click', closeSellModal);
    cancelSellBtn.addEventListener('click', closeSellModal);
    
    // Clicking outside modal closes it
    window.addEventListener('click', (event) => {
        if (event.target === sellModal) {
            closeSellModal();
        }
    });
    
    confirmSellBtn.addEventListener('click', () => {
        const sharesToSell = parseInt(sellSharesAmount.value);
        const sharesOwned = portfolio[currentStock]?.shares || 0;
        
        if (isNaN(sharesToSell)) {
            alert('Please enter a valid number of shares');
            return;
        }
        
        if (sharesToSell <= 0) {
            alert('Please enter a positive number of shares');
            return;
        }
        
        if (sharesToSell > sharesOwned) {
            alert(`You don't own enough shares of ${currentStock}. You own ${sharesOwned} shares.`);
            return;
        }
        
        // Set the shares amount and trigger the sell
        sharesAmountInput.value = sharesToSell;
        sellStock();
        closeSellModal();
    });

    // Function to calculate total portfolio return
    function calculateTotalPortfolioReturn() {
        let currentStockValue = 0;
        let totalInvestedInStocks = 0;
        
        for (const symbol in portfolio) {
            const stock = portfolio[symbol];
            currentStockValue += stock.shares * stock.currentPrice;
            totalInvestedInStocks += stock.shares * stock.avgPrice; // Use average price
        }
        
        // Total invested is cash invested plus money spent on stocks
        const totalInvested = initialBalance + (totalInvestedInStocks - (initialBalance - balance));
        
        const totalCurrentValue = currentStockValue + balance;
        const dollarReturn = totalCurrentValue - totalInvested;
        const percentReturn = totalInvested > 0 ? (dollarReturn / totalInvested) * 100 : 0;
        
        return { dollarReturn, percentReturn };
    }
});

