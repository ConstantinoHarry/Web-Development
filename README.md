# FiscalWiser - Smart Asset Management Web Application

FiscalWiser is a comprehensive financial technology web application designed to enhance users' financial literacy and well-being through integrated financial planning, management, and investment simulation tools. Built with modern web technologies, it provides a unified platform for personal finance management and educational trading simulations.

![FiscalWiser](https://img.shields.io/badge/Project-FiscalWiser-blue)
![Version](https://img.shields.io/badge/Version-1.0-green)
![License](https://img.shields.io/badge/License-Educational-lightgrey)

# 🚀 Key Features

# 📊 Financial Overview Dashboard

A comprehensive real-time dashboard providing complete financial visibility with advanced analytics and interactive visualizations.

#### 🔄 Real-time Performance Metrics
- **Smart Income/Expense Tracking**: Automated calculation from transaction data with month-over-month comparisons
- **Dynamic Savings Analysis**: Real-time savings rate calculation with trend indicators (↑/↓ arrows)
- **Comparative Analytics**: Side-by-side current vs. previous month performance with percentage changes
- **Live Data Updates**: Automatic refresh every 30 seconds with localStorage synchronization

#### 📈 Advanced Cash Flow Analysis
```javascript
// Intelligent period filtering with smooth animations
renderCashFlowChart(monthlyData, period = '1m') // 1 month, 6 months, 1 year, all
```
- **Interactive Timeline Filters**: 1M, 6M, 1Y, ALL with smooth chart transitions
- **Multi-dataset Visualization**: Income bars, expense bars, and savings line chart overlay
- **Professional Chart.js Integration**: Responsive design with custom tooltips and animations
- **Data Validation**: Robust error handling for missing or incomplete transaction data

#### 💼 Portfolio Tracking Systems
**Stock Portfolio:**
```javascript
// Real-time equity calculation from portfolio holdings
equityValue += stock.shares * (stock.currentPrice || stock.avgPrice)
```
- **Live Equity Valuation**: Automatic price updates with fallback to average cost
- **Mini Performance Charts**: 30-day historical trend visualization
- **Profit/Loss Analytics**: Percentage change calculations with color-coded indicators
- **Cash Balance Integration**: Total value = equity + available cash

**Cryptocurrency Portfolio:**
```javascript
// Syncs with main crypto trading simulator data
portfolioValue = Object.keys(portfolioData.portfolio).reduce((total, cryptoId) => {
    const holding = portfolioData.portfolio[cryptoId];
    return total + (holding.amount * (holding.lastKnownPrice || holding.avgBuyPrice));
}, 0);
```
- **Cross-platform Data Sync**: Direct integration with crypto paper trading simulator
- **Real-time Price Updates**: Fetches latest cryptocurrency valuations
- **Historical Performance**: Mini-chart with 5-point trend analysis
- **Error Resilience**: Graceful fallbacks for missing API data

#### 🚀 Automated Data Management
- **localStorage Persistence**: 
  ```javascript
  const budgetKey = `budgets_${currentYear}_${currentMonth + 1}`;
  localStorage.setItem(budgetKey, JSON.stringify(budgets));
  ```
- **Intelligent Data Processing**: Automated categorization and monthly aggregation
- **Real-time Synchronization**: Window storage event listeners for instant updates
- **Data Validation**: Comprehensive error handling for corrupted or missing data

#### 🎯 Key Technical Features
- **Responsive Design**: Mobile-first CSS with flexible grid layouts
- **Smooth Animations**: Chart.js with 2000ms ease-out transitions
- **Modular Architecture**: Separated concerns between metrics, charts, and portfolio components
- **Cross-browser Compatibility**: Vanilla JavaScript with progressive enhancement

#### 📊 Sample Dashboard Metrics Display
```
Monthly Income: $24,000.00 ↗ +15.2% vs $20,832.00 last month
Monthly Expenses: $7,000.00 ↘ -8.3% vs $7,637.00 last month  
Savings Rate: 70.83% ↗ +12.5% vs 63.1% last month
Stock Portfolio: $10,126.91 ↗ +5.2% (Equity: $10,115.87 | Cash: $11.03)
Crypto Portfolio: $10,421.82 ↗ +8.22% (+$821.82)
```

#### 🔧 Integration Points
- **Transaction System**: Direct link to income/expense tracking module
- **Budget Management**: Real-time budget utilization metrics
- **Trading Simulators**: Live portfolio data from stock and crypto platforms
- **Retirement Planning**: Savings rate feeds into retirement projections


## 💰 Budget Tracking & Management
- **Smart Budget Creation**: Monthly/weekly budgeting with category management
- **Progress Visualization**: Visual progress bars with spending indicators
- **Automated Expense Tracking**: Real-time budget utilization calculations
- **Modal-based Interface**: Intuitive budget creation and editing





# 💸 Transaction Management (Money Tracker)

A sophisticated financial tracking system with advanced filtering, real-time analytics, and seamless data management.

#### 🔄 Real-time Transaction Processing
```javascript
// Automated transaction lifecycle management
const transactions = JSON.parse(localStorage.getItem('transactions')) || [];
const newTransaction = {
    id: Date.now(), // Unique timestamp-based ID
    type: 'income' | 'expense',
    amount: parseFloat(amount),
    description: string,
    category: string,
    date: ISO date string
};
```
- **Smart Transaction ID Generation**: Timestamp-based unique identifiers
- **Data Validation**: Automatic type conversion and error handling
- **Real-time Storage**: Immediate localStorage synchronization

#### 🎯 Advanced Filtering & Analytics
**Multi-dimensional Filtering:**
```javascript
// Complex filtering with multiple criteria
const filteredTransactions = transactions.filter(t => {
    // Category filtering
    if (categoryFilter !== 'all' && t.category !== categoryFilter) return false;
    
    // Time period filtering
    const transactionDate = new Date(t.date);
    if (timePeriod === 'current-month') {
        return transactionDate.getMonth() === currentDate.getMonth();
    }
    // Supports: current-month, last-month, current-year, custom ranges
});
```

**Filter Capabilities:**
- **Temporal Filters**: Current month, last month, current year, all time
- **Custom Date Ranges**: Flexible start/end date selection
- **Category-based Filtering**: Income/expense specific categorization
- **Real-time Updates**: Instant filter application with live results

#### 📊 Intelligent Financial Visualization
**Dynamic UI Components:**
```javascript
// Color-coded transaction display with icons
function getCategoryIcon(category, type) {
    const icons = {
        income: { salary: 'fa-money-bill-wave', freelance: 'fa-laptop-code' },
        expense: { housing: 'fa-home', food: 'fa-utensils' }
    };
    return icons[type][category] || 'fa-coins';
}
```

**Visual Features:**
- **Category-specific Icons**: 10+ FontAwesome icons for different transaction types
- **Color-coded Amounts**: Green for income (↑), red for expenses (↓)
- **Trend Indicators**: Real-time balance trends with directional arrows
- **Responsive Design**: Mobile-optimized transaction cards

#### 💾 Robust Data Persistence System
**Storage Architecture:**
```javascript
// Comprehensive data management
function saveTransactions() {
    localStorage.setItem('transactions', JSON.stringify(transactions));
    updateTotals(); // Real-time metric updates
    displayTransactions(); // UI refresh
    displayRecentTransactions(); // Sidebar updates
}
```

**Data Management Features:**
- **Atomic Operations**: All-or-nothing transaction updates
- **Cross-component Sync**: Automatic dashboard integration
- **Error Recovery**: Graceful handling of corrupted data
- **Backward Compatibility**: Safe data migration handling

#### ⚡ Advanced User Experience
**Tabbed Interface:**
- **Overview Tab**: Financial summary with charts and metrics
- **Income Tab**: Dedicated income transaction management
- **Expenses Tab**: Comprehensive expense tracking

**Interactive Elements:**
- **Inline Editing**: Click-to-edit transaction details
- **Bulk Operations**: Multi-select and batch actions
- **Search & Sort**: Advanced transaction discovery
- **Export Capabilities**: Data export for external analysis

#### 🛡️ Enterprise-grade Features
**Transaction Lifecycle:**
```javascript
// Full CRUD operations with validation
function editTransaction(id) {
    const transaction = transactions.find(t => t.id === id);
    // Modal-based editing with form validation
}

function deleteTransaction(id) {
    if (confirm('Are you sure?')) {
        transactions = transactions.filter(t => t.id !== id);
        saveTransactions();
    }
}
```

**Professional Capabilities:**
- **Audit Trail**: Complete transaction history
- **Data Integrity**: Checksums and validation rules
- **Performance Optimization**: Efficient large dataset handling
- **Accessibility**: WCAG-compliant interface design

#### 📈 Real-time Financial Metrics
**Live Calculations:**
```
Current Balance: $17,000.00 ↗ +12% from last month
Total Income: $24,000.00 (Salary: $20,000, Freelance: $4,000)
Total Expenses: $7,000.00 (Housing: $3,000, Food: $1,500)
Savings Rate: 70.83% ↗ Excellent financial health
```

**Analytical Insights:**
- **Monthly Comparisons**: YoY and MoM growth analysis
- **Category Breakdown**: Spending patterns and trends
- **Forecasting**: Predictive financial modeling
- **Alert System**: Unusual activity notifications

#### 🔧 Technical Integration
**Dashboard Connectivity:**
- **Real-time Data Flow**: Instant updates to financial overview
- **Budget Synchronization**: Automatic budget tracking integration
- **Portfolio Linking**: Investment transaction correlation
- **API Ready**: RESTful endpoints for external integration

**Sample Transaction Flow:**
1. **Capture**: Form-based transaction entry with validation
2. **Categorize**: Intelligent category assignment
3. **Store**: Secure localStorage persistence
4. **Analyze**: Real-time metric calculations
5. **Visualize**: Dynamic UI updates across all components


# 🏦 Retirement Planning System

A sophisticated retirement planning platform featuring advanced calculations, interactive visualizations, and comprehensive account management for long-term financial security.

#### 📊 Advanced Retirement Calculator
**Intelligent Future Value Calculations:**
```javascript
// Multi-factor retirement modeling with inflation adjustments
const retirementEngine = {
    calculateFutureExpenses: (currentExpenses, inflationRate, years) => {
        const safeInflationRate = Math.min(inflationRate, 0.1); // Cap at 10% for realistic projections
        return currentExpenses * Math.pow(1 + safeInflationRate, years);
    },
    
    calculateRequiredSavings: (futureMonthlyExpenses, investmentReturn) => {
        const safeWithdrawalRate = Math.max(0.01, Math.min(investmentReturn, 0.1));
        return (futureMonthlyExpenses * 12) / safeWithdrawalRate;
    }
};
```

**Calculation Features:**
- **Inflation-Adjusted Projections**: Real purchasing power calculations
- **Safe Withdrawal Rates**: 4% rule implementation with dynamic adjustments
- **Compound Growth Modeling**: Monthly compounding with realistic returns
- **Age Validation**: Smart age boundary checks (18-100 years)

#### 📈 Interactive Retirement Projections
**Dynamic Savings Trajectory Visualization:**
```javascript
// Real-time chart generation with phase-based coloring
const generateRetirementChart = (currentAge, retirementAge, currentSavings, targetSavings) => {
    const chartData = {
        accumulationPhase: {
            borderColor: '#4bc0c0',
            backgroundColor: 'rgba(75, 192, 192, 0.2)'
        },
        withdrawalPhase: {
            borderColor: '#ff6384',
            backgroundColor: 'rgba(255, 99, 132, 0.1)'
        }
    };
    
    return new Chart(ctx, {
        type: 'line',
        data: generatePhaseBasedData(currentAge, retirementAge, 85), // 85-year life expectancy
        options: createInteractiveChartOptions()
    });
};
```

**Visualization Capabilities:**
- **Phase-Based Coloring**: Accumulation (green) vs. withdrawal (red) phases
- **Interactive Tooltips**: Age-specific financial insights
- **Milestone Annotations**: Retirement age and life expectancy markers
- **Real-time Updates**: Dynamic chart regeneration on input changes

#### 💼 Comprehensive Account Management
**Multi-Account Retirement Portfolio:**
```javascript
// Unified account management system
class RetirementAccountManager {
    constructor() {
        this.accounts = {
            mpf: { employerMatch: 0.05, contributionLimit: 150000 }, // HK MPF specifics
            ira: { contributionLimit: 7000 },
            '401k': { contributionLimit: 22500 },
            custom: { flexibleLimits: true }
        };
    }
    
    calculateTotalProjection(accounts, yearsToRetirement) {
        return accounts.reduce((total, account) => {
            const projectedValue = this.calculateAccountProjection(account, yearsToRetirement);
            return total + projectedValue;
        }, 0);
    }
}
```

**Account Management Features:**
- **MPF Integration**: Hong Kong Mandatory Provident Fund support with 5% employer match
- **Multi-Currency Support**: HKD-focused with international account compatibility
- **Contribution Tracking**: Real-time monitoring against regulatory limits
- **Employer Matching**: Automatic calculation of employer contributions

#### 🎯 Advanced Goal Monitoring & Progress Tracking
**Intelligent Progress Analytics:**
```javascript
// Real-time goal achievement monitoring
const goalMonitor = {
    calculateProgress: (currentProjection, targetSavings) => {
        const percentage = (currentProjection / targetSavings) * 100;
        return {
            percentage: Math.min(percentage, 100),
            status: percentage >= 100 ? 'On Track' : 'Needs Attention',
            shortfall: Math.max(0, targetSavings - currentProjection)
        };
    },
    
    generateRecommendations: (progressData, yearsToRetirement) => {
        if (progressData.percentage < 75) {
            return `Increase monthly contributions by $${(progressData.shortfall / (yearsToRetirement * 12)).toFixed(2)}`;
        }
        return 'Retirement goals are achievable with current plan';
    }
};
```

**Progress Tracking Features:**
- **Visual Progress Bars**: Color-coded achievement indicators (red → yellow → green)
- **Smart Notifications**: Proactive adjustment recommendations
- **Milestone Tracking**: Year-over-year progress comparison
- **Scenario Analysis**: "What-if" modeling for different contribution levels

#### 🔄 Real-time Data Persistence & Sync
**Enterprise-grade Data Management:**
```javascript
// Multi-layer data persistence system
const retirementDataManager = {
    saveRetirementPlan: (planData) => {
        const plans = JSON.parse(localStorage.getItem('retirementPlans')) || [];
        plans.push({
            ...planData,
            timestamp: new Date().toISOString(),
            version: '1.0'
        });
        localStorage.setItem('retirementPlans', JSON.stringify(plans));
    },
    
    syncAcrossComponents: () => {
        // Update dashboard, charts, and projections simultaneously
        updateRetirementOverview();
        refreshProjectionCharts();
        recalculateProgressMetrics();
    }
};
```

**Data Management Capabilities:**
- **Local Storage Integration**: Offline-capable data persistence
- **Cross-Component Synchronization**: Real-time updates across all retirement modules
- **Version Control**: Future-proof data structure for enhancements
- **Error Recovery**: Graceful handling of corrupted data scenarios

#### 📱 Professional User Experience
**Advanced Interface Features:**
- **Tabbed Navigation**: Seamless switching between calculator, accounts, and projections
- **Responsive Design**: Mobile-optimized retirement planning interface
- **Accessibility Compliance**: WCAG 2.1 AA standards implementation
- **Print-Ready Reports**: Exportable retirement plan summaries


#### 🔧 Technical Integration Points
**System Architecture:**
```javascript
// Modular retirement planning ecosystem
const retirementModule = {
    calculator: RetirementCalculatorEngine,
    visualizations: ChartingService,
    accounts: AccountManager,
    analytics: ProgressMonitor,
    persistence: DataStorageLayer
};
```

**Integration Features:**
- **Dashboard Connectivity**: Real-time retirement metrics on main dashboard
- **API Readiness**: RESTful endpoints for future mobile app integration
- **Export Capabilities**: CSV/PDF retirement plan exports
- **Multi-Language Support**: Foundation for internationalization

---

### 🚀 Sample Retirement Planning Workflow

1. **Input Capture**: User enters current age (30), retirement goals (65), and financial data
2. **Smart Calculation**: System computes inflation-adjusted savings requirements
3. **Account Setup**: User adds MPF account with employer matching details
4. **Visualization**: Interactive chart shows accumulation and withdrawal phases
5. **Progress Monitoring**: Real-time tracking against retirement targets
6. **Adjustment Recommendations**: AI-powered suggestions for optimization
7. **Plan Persistence**: Automatic saving for ongoing progress tracking


# 📈 Paper Trading Simulators

# 💰 Cryptocurrency Paper Trading Platform

A sophisticated simulated trading environment featuring real-time market data, advanced portfolio analytics, and professional-grade trading tools for risk-free cryptocurrency market experience.

#### 📊 Real-time Market Data Integration
**CoinGecko API Enterprise Integration:**
```javascript
// Advanced API management with intelligent rate limiting
const marketDataEngine = {
    apiConfig: {
        baseURL: 'https://api.coingecko.com/api/v3',
        apiKey: 'API-KEY',
        rateLimit: 10000, // Monthly call quota
        intelligentThrottling: true
    },
    
    fetchMarketData: async function() {
        const url = `${this.apiConfig.baseURL}/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=100&page=1&sparkline=false&price_change_percentage=24h`;
        
        return await fetch(url, {
            headers: { 'x-cg-demo-api-key': this.apiConfig.apiKey },
            cache: 'no-cache' // Ensure fresh data
        });
    }
};
```

**Data Features:**
- **100+ Cryptocurrencies**: Comprehensive market coverage including Bitcoin, Ethereum, and major altcoins
- **Multi-timeframe Data**: 24h, 7d, 30d, 1y historical price data with OHLC support
- **Real-time Metrics**: Market cap, 24h volume, price changes, and circulating supply
- **Intelligent Caching**: Smart data caching to optimize API usage within 10,000 monthly call limit

#### 🛡️ Advanced Risk-free Trading Environment
**Professional Trading Simulation:**
```javascript
// Realistic trading engine with market dynamics
class TradingSimulator {
    constructor(initialBalance = 10000) {
        this.balance = initialBalance;
        this.portfolio = new Map();
        this.tradeHistory = [];
        this.marketConditions = {
            slippage: 0.001, // 0.1% simulated slippage
            fees: 0.00, // Zero fees for educational environment
            priceFluctuation: true
        };
    }
    
    executeTrade(assetId, type, amount, currentPrice) {
        const quantity = this.calculateQuantity(amount, currentPrice);
        const executedPrice = this.applySlippage(currentPrice, type);
        
        return {
            executedPrice,
            quantity,
            total: amount,
            timestamp: new Date().toISOString()
        };
    }
}
```

**Safety Features:**
- **Virtual $10,000 Balance**: Realistic starting capital without financial risk
- **Simulated Market Conditions**: Price slippage and execution dynamics
- **Zero Financial Risk**: Complete separation from real markets
- **Educational Focus**: Ideal for learning trading strategies and market analysis

#### 📈 Comprehensive Portfolio Management System
**Advanced Holdings Tracking:**
```javascript
// Professional portfolio analytics engine
class PortfolioManager {
    constructor() {
        this.holdings = new Map();
        this.performanceMetrics = {
            totalReturn: 0,
            dailyPnL: 0,
            allocation: {},
            riskMetrics: {}
        };
    }
    
    calculateProfitLoss(holding, currentPrice) {
        const avgCost = holding.avgBuyPrice;
        const quantity = holding.amount;
        const marketValue = quantity * currentPrice;
        const costBasis = quantity * avgCost;
        
        return {
            absolutePnL: marketValue - costBasis,
            percentagePnL: ((marketValue - costBasis) / costBasis) * 100,
            currentValue: marketValue
        };
    }
    
    generatePortfolioReport() {
        return {
            summary: this.calculatePortfolioSummary(),
            holdings: this.getDetailedHoldings(),
            performance: this.calculatePerformanceMetrics()
        };
    }
}
```

**Portfolio Features:**
- **Real-time P&L Tracking**: Dollar and percentage profit/loss calculations
- **Cost Basis Analysis**: Average buy price tracking with DCA support
- **Asset Allocation**: Visual breakdown of portfolio composition
- **Performance Analytics**: Time-weighted returns and benchmark comparisons

#### 🔄 Automated Portfolio Revaluation System
**Intelligent Price Updates:**
```javascript
// Automated valuation and alert system
class PortfolioValuationEngine {
    constructor() {
        this.updateInterval = 30000; // 30-second updates
        this.priceAlerts = new Set();
        this.performanceThresholds = {
            significantGain: 0.05, // 5%
            significantLoss: -0.03 // -3%
        };
    }
    
    async updatePortfolioValuation() {
        const currentPrices = await this.fetchCurrentPrices();
        this.revalueHoldings(currentPrices);
        this.checkPerformanceAlerts();
        this.updateLocalStorage();
    }
    
    revalueHoldings(prices) {
        Object.keys(this.portfolio).forEach(assetId => {
            const holding = this.portfolio[assetId];
            const currentPrice = prices[assetId];
            
            if (currentPrice) {
                holding.lastKnownPrice = currentPrice;
                holding.lastUpdated = new Date().toISOString();
            }
        });
    }
}
```

**Automation Features:**
- **30-second Price Updates**: Near real-time portfolio valuation
- **Performance Alerts**: Automated notifications for significant gains/losses
- **Data Persistence**: Automatic saving to localStorage with recovery
- **Multi-asset Support**: Simultaneous valuation across entire portfolio

#### 📊 Professional Trading Interface
**Advanced Charting Capabilities:**
```javascript
// Multi-timeframe technical analysis
const chartingModule = {
    supportedTimeframes: ['1h', '24h', '7d', '30d', '1y'],
    chartTypes: {
        line: 'Price trend analysis',
        candlestick: 'OHLC professional charts',
        volume: 'Trade volume overlay'
    },
    
    renderProfessionalChart: function(canvasId, data, config) {
        return new Chart(document.getElementById(canvasId), {
            type: config.type,
            data: this.formatChartData(data),
            options: this.getChartOptions(config)
        });
    }
};
```

**Interface Features:**
- **Interactive Charts**: Zoom, pan, and timeframe selection
- **Technical Indicators**: Support for SMA, EMA, and volume analysis
- **Responsive Design**: Mobile-optimized trading interface
- **Order Management**: Buy/sell preview with confirmation workflow

#### 🔧 Advanced Trading Tools
**Smart Order Management:**
```javascript
// Intelligent trade execution system
class TradeExecutor {
    constructor() {
        this.orderTypes = {
            market: 'Instant execution at current price',
            limit: 'Price-contingent execution',
            percentage: 'Quick size-based orders'
        };
    }
    
    calculateOrderDetails(assetId, type, amount) {
        const currentPrice = this.getCurrentPrice(assetId);
        const quantity = amount / currentPrice;
        const maxAvailable = type === 'buy' ? this.balance : this.getHoldingQuantity(assetId);
        
        return {
            feasible: amount <= maxAvailable,
            estimatedQuantity: quantity,
            currentPrice,
            maxAmount: maxAvailable
        };
    }
}
```

**Trading Tools:**
- **Quick Order Sizing**: 25%, 50%, 75%, 100% position sizing
- **Real-time Validation**: Balance and holding checks
- **Trade Previews**: Detailed order summary before execution
- **Transaction History**: Complete audit trail of all trades

#### 📱 Enterprise-grade User Experience
**Professional Workflow:**
```javascript
// Seamless user experience management
class TradingWorkflow {
    constructor() {
        this.tabs = ['market', 'trade', 'portfolio'];
        this.activeTab = 'market';
        this.userPreferences = {
            defaultOrderSize: 100,
            preferredChartType: 'candlestick',
            alertPreferences: {}
        };
    }
    
    switchTab(targetTab) {
        this.activeTab = targetTab;
        this.updateUI();
        this.loadTabSpecificData();
    }
}
```

**UX Features:**
- **Tab-based Navigation**: Market data, trading, portfolio management
- **Persistent Settings**: User preferences across sessions
- **Responsive Notifications**: Trade confirmations and system alerts
- **Accessibility**: WCAG-compliant interface design

#### 🚀 Sample Trading Workflow

1. **Market Analysis**: Browse 100+ cryptocurrencies with real-time data
2. **Asset Selection**: Choose from comprehensive cryptocurrency list
3. **Order Planning**: Use percentage-based quick sizing or custom amounts
4. **Trade Preview**: Review order details with estimated quantities
5. **Execution**: Confirm trade with simulated market conditions
6. **Portfolio Update**: Automatic revaluation and P&L calculation
7. **Performance Tracking**: Real-time monitoring of investment performance

---

### 🔄 System Architecture Integration

**Modular Design:**
```javascript
const CryptoTradingPlatform = {
    data: MarketDataService,
    trading: TradingEngine,
    portfolio: PortfolioManager,
    charts: ChartingModule,
    storage: DataPersistence,
    ui: InterfaceController
};
```

**Technical Capabilities:**
- **RESTful API Integration**: Seamless CoinGecko connectivity
- **Local Data Persistence**: Offline-capable with sync recovery
- **Real-time Updates**: WebSocket-ready architecture
- **Mobile Responsive**: Progressive Web App compatibility


# 📈 Stock Trading Platform

A professional-grade simulated trading environment featuring real-time equity data, advanced portfolio analytics, and institutional-level trading tools for risk-free stock market experience.

#### 📊 Real-time Market Data Integration
**Financial Modeling Prep API Enterprise Integration:**
```javascript
// Advanced API management with intelligent data handling
const stockDataEngine = {
    apiConfig: {
        baseURL: 'https://financialmodelingprep.com/api/v3',
        apiKey: 'API-key',
        rateLimit: 250, // Daily request limit
        intelligentCaching: true
    },
    
    fetchRealTimeQuote: async function(symbol) {
        const url = `${this.apiConfig.baseURL}/quote/${symbol}?apikey=${this.apiConfig.apiKey}`;
        
        return await fetch(url, {
            headers: { 'Cache-Control': 'max-age=60' }, // 1-minute cache
            mode: 'cors'
        });
    },
    
    fetchHistoricalData: async function(symbol, timeframe = '6m') {
        const url = `${this.apiConfig.baseURL}/historical-price-full/${symbol}?apikey=${this.apiConfig.apiKey}`;
        return await fetch(url);
    }
};
```

**Data Features:**
- **Real-time Quotes**: Live price data with 15-minute delayed market data
- **Comprehensive Fundamentals**: P/E ratios, market cap, volume, and key metrics
- **Historical Data**: Daily OHLC prices with adjustable timeframes (1D, 1W, 1M, 1Y, 5Y)
- **Technical Indicators**: 50-day and 200-day moving averages with volume analysis
- **Multi-asset Support**: Stocks, ETFs, and major indices coverage

#### 🛡️ Advanced Risk-free Trading Environment
**Professional Stock Trading Simulation:**
```javascript
// Realistic equity trading engine with market dynamics
class StockTradingSimulator {
    constructor(initialBalance = 10000) {
        this.balance = initialBalance;
        this.portfolio = new Map();
        this.tradeHistory = [];
        this.marketConditions = {
            marketHours: true, // Simulate market hours restrictions
            priceImprovement: 0.001, // Simulated price improvement
            commissionFree: true, // Zero-commission environment
            realTimeSettlement: false // T+2 settlement simulation
        };
    }
    
    executeStockTrade(symbol, action, shares, currentPrice) {
        const totalValue = shares * currentPrice;
        const executedPrice = this.applyMarketConditions(currentPrice, action);
        
        return {
            symbol,
            action,
            shares,
            executedPrice,
            totalValue,
            timestamp: new Date().toISOString(),
            settlementDate: this.calculateSettlementDate()
        };
    }
}
```

**Safety Features:**
- **Virtual $10,000 Balance**: Realistic starting capital without financial risk
- **Market Hours Simulation**: Real-world trading session constraints
- **Regulatory Compliance**: Simulated SEC/FINRA rules environment
- **Educational Focus**: Perfect for learning equity trading strategies

#### 📊 Comprehensive Portfolio Management System
**Advanced Equity Portfolio Analytics:**
```javascript
// Professional portfolio management engine
class StockPortfolioManager {
    constructor() {
        this.holdings = new Map();
        this.performanceMetrics = {
            totalReturn: 0,
            dailyGainLoss: 0,
            sectorAllocation: {},
            dividendYield: 0,
            betaWeighting: 1.0
        };
    }
    
    calculatePositionMetrics(holding, currentPrice) {
        const costBasis = holding.shares * holding.averageCost;
        const marketValue = holding.shares * currentPrice;
        const unrealizedPnL = marketValue - costBasis;
        
        return {
            symbol: holding.symbol,
            shares: holding.shares,
            averageCost: holding.averageCost,
            currentPrice,
            marketValue,
            unrealizedPnL,
            unrealizedPnLPercent: (unrealizedPnL / costBasis) * 100,
            weight: (marketValue / this.totalPortfolioValue) * 100
        };
    }
    
    generatePortfolioReport() {
        return {
            summary: this.calculatePortfolioSummary(),
            holdings: this.getDetailedPositions(),
            performance: this.calculateTimeWeightedReturn(),
            riskMetrics: this.calculatePortfolioRisk()
        };
    }
}
```

**Portfolio Features:**
- **Real-time P&L Tracking**: Per-position and total portfolio performance
- **Cost Basis Tracking**: FIFO accounting with average cost calculations
- **Sector Diversification**: Visual breakdown by industry sectors
- **Dividend Tracking**: Simulated dividend payments and yield calculations
- **Risk Metrics**: Beta, volatility, and drawdown analysis

#### 🔄 Automated Portfolio Revaluation System
**Intelligent Equity Price Updates:**
```javascript
// Professional portfolio valuation engine
class StockValuationEngine {
    constructor() {
        this.updateInterval = 10000; // 10-second price updates
        this.priceAlerts = new Map();
        this.performanceThresholds = {
            significantGain: 0.05, // 5% gain alert
            significantLoss: -0.03, // 3% loss alert
            volumeSpike: 2.0 // 200% volume increase
        };
    }
    
    async updatePortfolioValuation() {
        const symbols = Array.from(this.portfolio.keys());
        const currentPrices = await this.fetchBatchQuotes(symbols);
        
        this.revaluePortfolio(currentPrices);
        this.checkTradingAlerts();
        this.updatePerformanceDashboard();
    }
    
    revaluePortfolio(prices) {
        this.portfolio.forEach((holding, symbol) => {
            if (prices[symbol]) {
                holding.currentPrice = prices[symbol];
                holding.lastUpdated = new Date().toISOString();
                holding.intradayChange = this.calculateIntradayChange(holding);
            }
        });
    }
}
```

**Automation Features:**
- **10-second Price Updates**: Near real-time equity valuation
- **Batch Quote Processing**: Efficient multi-stock price updates
- **Performance Alerts**: Automated notifications for price movements
- **Data Persistence**: Robust localStorage with recovery mechanisms

#### 📈 Professional Trading Interface
**Advanced Stock Charting Capabilities:**
```javascript
// Institutional-grade charting system
const stockChartingModule = {
    supportedTimeframes: ['1D', '1W', '1M', '3M', '6M', '1Y', '5Y'],
    technicalIndicators: {
        movingAverages: [50, 200],
        volumeProfile: true,
        supportResistance: true,
        trendLines: true
    },
    
    renderProfessionalChart: function(canvasId, symbol, data, config) {
        return new Chart(document.getElementById(canvasId), {
            type: 'candlestick',
            data: this.formatOHLCData(data),
            options: {
                ...this.getChartOptions(config),
                plugins: {
                    title: {
                        display: true,
                        text: `${symbol} - Professional Chart`
                    }
                }
            }
        });
    }
};
```

**Interface Features:**
- **Interactive OHLC Charts**: Candlestick patterns with volume bars
- **Technical Analysis**: Moving averages, RSI, and MACD indicators
- **Drawing Tools**: Trend lines, Fibonacci retracements, and annotations
- **Multi-chart Layout**: Comparison charts and portfolio overview

#### 🔧 Advanced Trading Tools
**Smart Equity Order Management:**
```javascript
// Professional order management system
class StockOrderExecutor {
    constructor() {
        this.orderTypes = {
            market: 'Current market price execution',
            limit: 'Price-contingent order placement',
            percentage: 'Portfolio-weighted position sizing'
        };
        this.positionSizing = {
            conservative: 0.05, // 5% of portfolio
            moderate: 0.10,    // 10% of portfolio  
            aggressive: 0.15    // 15% of portfolio
        };
    }
    
    calculateOrderParameters(symbol, orderType, amount) {
        const currentPrice = this.getCurrentPrice(symbol);
        const shares = Math.floor(amount / currentPrice);
        const maxAffordable = Math.floor(this.balance / currentPrice);
        const existingPosition = this.getPosition(symbol);
        
        return {
            symbol,
            orderType,
            requestedShares: shares,
            currentPrice,
            estimatedCost: shares * currentPrice,
            maxPossibleShares: maxAffordable,
            existingPosition,
            marginCheck: this.checkMarginRequirements(amount)
        };
    }
}
```

**Trading Tools:**
- **Smart Order Sizing**: Portfolio percentage-based position sizing
- **Real-time Validation**: Balance and margin requirements checking
- **Trade Simulation**: Realistic order execution with price improvement
- **Transaction History**: Complete audit trail with tax lot tracking

#### 💼 Portfolio Analytics Dashboard
**Comprehensive Performance Reporting:**
```javascript
// Advanced analytics and reporting engine
class PortfolioAnalytics {
    constructor() {
        this.metrics = {
            sharpeRatio: 0,
            alpha: 0,
            beta: 0,
            maxDrawdown: 0,
            volatility: 0
        };
    }
    
    generatePerformanceReport() {
        return {
            summary: this.calculateSummaryMetrics(),
            holdings: this.analyzeIndividualPositions(),
            benchmarks: this.compareToBenchmarks(),
            riskAnalysis: this.calculateRiskMetrics(),
            taxImplications: this.calculateTaxLots()
        };
    }
    
    calculateBenchmarkComparison() {
        const benchmarks = {
            spy: 'S&P 500',
            qqq: 'NASDAQ 100',
            dia: 'Dow Jones Industrial Average'
        };
        
        return Object.keys(benchmarks).map(benchmark => ({
            benchmark: benchmarks[benchmark],
            performance: this.compareToBenchmark(benchmark),
            correlation: this.calculateCorrelation(benchmark)
        }));
    }
}
```

**Analytics Features:**
- **Performance Benchmarking**: S&P 500, NASDAQ, and custom benchmark comparisons
- **Risk-Adjusted Returns**: Sharpe ratio, Sortino ratio, and alpha generation
- **Sector Analysis**: Industry exposure and concentration risk
- **Tax Lot Accounting**: FIFO/LIFO accounting method support

#### 📱 Enterprise-grade User Experience
**Professional Trading Workflow:**
```javascript
// Institutional trading workflow management
class StockTradingWorkflow {
    constructor() {
        this.workflowStages = ['research', 'analysis', 'execution', 'monitoring'];
        this.currentStage = 'research';
        this.userPreferences = {
            defaultOrderSize: 'percentage',
            chartPreferences: 'technical',
            alertPreferences: {
                priceAlerts: true,
                volumeAlerts: false,
                newsAlerts: true
            }
        };
    }
    
    executeTradingWorkflow(symbol) {
        this.loadCompanyResearch(symbol);
        this.analyzeTechnicals(symbol);
        this.prepareOrder(symbol);
        this.monitorPosition(symbol);
    }
}
```

**UX Features:**
- **Multi-tab Interface**: Research, charts, trading, and portfolio management
- **Customizable Layout**: Drag-and-drop widget organization
- **Advanced Filtering**: Sector, market cap, and fundamental screening
- **Mobile Optimization**: Responsive design for all devices

#### 🚀 Sample Trading Workflow

1. **Company Research**: Access real-time fundamentals and analyst ratings
2. **Technical Analysis**: Review charts with professional indicators
3. **Position Sizing**: Use smart sizing tools based on risk tolerance
4. **Order Placement**: Preview trade with realistic execution estimates
5. **Portfolio Integration**: Automatic position tracking and rebalancing
6. **Performance Monitoring**: Real-time P&L and benchmark comparisons
7. **Risk Management**: Stop-loss and position sizing adjustments

---

### 🔄 System Architecture Integration

**Modular Design:**
```javascript
const StockTradingPlatform = {
    marketData: StockDataService,
    trading: EquityTradingEngine,
    portfolio: StockPortfolioManager,
    analytics: PerformanceAnalytics,
    charts: ProfessionalCharting,
    research: FundamentalAnalysis,
    storage: EnterpriseDataPersistence
};
```

**Technical Capabilities:**
- **RESTful API Integration**: Seamless Financial Modeling Prep connectivity
- **Real-time Data Streaming**: WebSocket-ready for live market data
- **Advanced Charting Library**: Custom-built with technical indicators
- **Offline Capability**: Robust data caching and synchronization
- **Security**: Encrypted localStorage and data validation

The enhanced stock trading platform provides an institutional-grade simulated environment that mirrors real-world equity trading conditions while maintaining complete financial safety for educational and strategic development purposes.

# 🛠️ Technology Stack

## Frontend Technologies
<div align="left">
  <img src="https://img.shields.io/badge/HTML5-E34F26?style=for-the-badge&logo=html5&logoColor=white" alt="HTML5">
  <img src="https://img.shields.io/badge/CSS3-1572B6?style=for-the-badge&logo=css3&logoColor=white" alt="CSS3">
  <img src="https://img.shields.io/badge/JavaScript-F7DF1E?style=for-the-badge&logo=javascript&logoColor=black" alt="JavaScript">
  <img src="https://img.shields.io/badge/Chart.js-FF6384?style=for-the-badge&logo=chart.js&logoColor=white" alt="Chart.js">
</div>

- **HTML5**: Semantic structure and accessibility
- **CSS3**: Responsive design with modern styling
- **JavaScript ES6+**: Vanilla JS for component functionality
- **Chart.js**: Financial charts and data visualization

### APIs & External Services

| Service | Type | Usage | Rate Limits |
|---------|------|-------|-------------|
| 🪙 **CoinGecko API** | External API | Cryptocurrency market data | 10,000 req/month |
| 📈 **Financial Modelling Prep API** | External API | Real-time stock information | Varies by plan |
| 💾 **localStorage** | Browser API | Client-side data persistence | ~5-10MB per domain |

### Development Environment
<div align="left">
  <img src="https://img.shields.io/badge/VS_Code-007ACC?style=flat-square&logo=visualstudiocode&logoColor=white" alt="VS Code">
  <img src="https://img.shields.io/badge/Node.js-339933?style=flat-square&logo=nodedotjs&logoColor=white" alt="Node.js">
  <img src="https://img.shields.io/badge/Git-F05032?style=flat-square&logo=git&logoColor=white" alt="Git">
</div>

- **VS Code**: Primary IDE with Live Server extension for development
- **Node.js**: JavaScript runtime for backend calculations and APIs
- **Git**: Distributed version control with GitHub integration

## 📁 Project Architecture

```
FiscalWiser/
├── public/
│   ├── index.html              # Main application entry point
│   └── assets/                 # Static resources
├── src/private/components/
│   ├── app.js                  # Application initializer
│   ├── navBar-styles.css       # Navigation styling
│   ├── dashboard/
│   │   ├── dashboard.html
│   │   ├── dashboardBudget.js              # Budget tracking logic
│   │   ├── dashboardCashFlowAnalysis.js    # Cash flow charts
│   │   ├── dashboardCryptoPortfolio.js     # Crypto portfolio metrics
│   │   └── dashboardStockPortfolio.js      # Stock portfolio metrics
│   ├── paperTrading/
│   │   ├── crypto/
│   │   │   ├── crypto_paper_trading_simulator.html
│   │   │   ├── cryptoPaperTradingSimulator.js  # Core trading logic
│   │   │   ├── cryptoChartModule.js           # Chart rendering
│   │   │   └── crypto-paper-trade-styles.css
│   │   └── stocks/
│   │       ├── stock-ticker.html
│   │       └── stock-ticker.js               # Stock trading logic
│   ├── retirement/
│   │   ├── calculator/
│   │   │   ├── retirementCalculator.js       # Retirement calculations
│   │   │   └── retirement-styles.css
│   │   └── overview/
│   │       ├── retirementOverview.js         # Retirement tracking
│   │       └── retirement-overview-styles.css
│   └── transactions/
│       ├── incomeExpenseTracking.js          # Money tracker
│       └── transaction-styles.css
└── README.md
```


## 🏁 Getting Started

### Prerequisites
- Modern web browser (Chrome, Firefox, Safari, Edge)
- Local static server recommended for development

### Installation & Setup

1. **Clone the Repository**
   ```bash
   git clone https://github.com/ConstantinoHarry/FiscalWiser.git
   cd FiscalWiser

Here's the fixed formatting for that section:

```markdown
## 🏁 Getting Started

### Prerequisites
- Modern web browser (Chrome, Firefox, Safari, Edge)
- Local static server recommended for development

### Installation & Setup

1. **Clone the Repository**
   ```bash
   git clone https://github.com/ConstantinoHarry/FiscalWiser.git
   cd FiscalWiser
   ```

2. **Run with Local Server**
   
   **Using Python 3:**
   ```bash
   python3 -m http.server 8000
   ```
   
   **Using Node.js http-server:**
   ```bash
   npx http-server -p 8000
   ```
   
   **Using VS Code Live Server extension:**
   - Install "Live Server" extension in VS Code
   - Right-click on `index.html` → "Open with Live Server"

3. **Access Application**
   - Open browser and navigate to: `http://localhost:8000/public/index.html`
   - Or directly open HTML files for specific components

### API Configuration (Optional)
For enhanced functionality, add API keys in respective modules:
- **CoinGecko API**: Free tier (10,000 requests/month)
- **Financial Modelling Prep API**: Developer account required


## Data Persistence

// Budget storage example
const budgetKey = `budgets_${currentYear}_${currentMonth + 1}`;
localStorage.setItem(budgetKey, JSON.stringify(budgets));

## Real time updates 

// Automated portfolio updates
setInterval(() => {
    updatePortfolioValues();
    refreshCharts();
}, 30000); // Every 30 seconds

## Responsive Design 

Mobile-first CSS approach
Flexible grid layouts
Touch-friendly interface elements

## 🎯 Eductational Value 

FiscalWiser addresses financial literacy gaps identified in research by:
- Lusardi (2019): Bridging global financial literacy gaps through practical tools
- Alsuwaidi & Mertzanis (2024): Enabling users to navigate digital finance complexities
- Providing risk-free environments for investment education

## 🤝 Contributing

We welcome contributions to enhance FiscalWiser:

1. Fork the repository
2. Create a feature branch (git checkout -b feature/AmazingFeature)
3. Commit changes (git commit -m 'Add some AmazingFeature')
4. Push to branch (git push origin feature/AmazingFeature)
5. Open a Pull Request


## Development Guidelines

- Follow existing code style and architecture
- Add comments for complex logic
- Test across different browsers
- Ensure mobile responsiveness
- Maintain accessibility standard

## Future Enhancement 

Based on project limitations identified:

- Enhanced security protocols for data protection
- Mobile application development
- Financial institution integrations
- AI-powered financial recommendations
- Multi-language support
- Advanced analytics and reporting

## 📝 Academic Reference

This project was developed as part of the FINT2103 Financial Technology Project at Hong Kong Baptist University 

Author: Constantino Harry Alexander (23632739)
Instructor: Joseph Chan
Date: May 2025

## 📄 License

This project is developed for educational purposes as part of academic coursework. Not intended for production financial advice.

## 🙏 Acknowledgments

- CoinGecko: Comprehensive cryptocurrency API
- Financial Modelling Prep: Real-time stock data
- Chart.js: Powerful charting library
- Academic Research: Foundation in financial literacy studies

Disclaimer: This application is for educational and simulation purposes only. Not intended for real financial trading or advice.
