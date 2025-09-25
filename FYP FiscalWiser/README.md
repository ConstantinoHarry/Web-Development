# FiscalWiser - Smart Asset Management Web Application

FiscalWiser is a comprehensive financial technology web application designed to enhance users' financial literacy and well-being through integrated financial planning, management, and investment simulation tools. Built with modern web technologies, it provides a unified platform for personal finance management and educational trading simulations.

![FiscalWiser](https://img.shields.io/badge/Project-FiscalWiser-blue)
![Version](https://img.shields.io/badge/Version-1.0-green)
![License](https://img.shields.io/badge/License-Educational-lightgrey)

# 🚀 Key Features

## 📊 Financial Overview Dashboard

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


### 💰 Budget Tracking & Management
- **Smart Budget Creation**: Monthly/weekly budgeting with category management
- **Progress Visualization**: Visual progress bars with spending indicators
- **Automated Expense Tracking**: Real-time budget utilization calculations
- **Modal-based Interface**: Intuitive budget creation and editing

### 💸 Transaction Management (Money Tracker)
- **Income & Expense Tracking**: Comprehensive transaction logging with categorization
- **Advanced Filtering**: Date-based filtering (current month, last month, custom ranges)
- **Financial Status Visualization**: Color-coded transaction display with trend indicators
- **Data Persistence**: localStorage integration for seamless user experience

### 🏦 Retirement Planning
- **Advanced Calculator**: Future value calculations accounting for inflation and investment returns
- **Retirement Projections**: Visual savings trajectory charts
- **Account Management**: MPF and retirement account tracking
- **Goal Monitoring**: Progress tracking towards retirement targets

### 📈 Paper Trading Simulators
#### Cryptocurrency Trading
- **Real-time Market Data**: CoinGecko API integration (10,000 monthly calls)
- **Risk-free Environment**: Simulated trading with virtual balance
- **Portfolio Management**: Holdings tracking with profit/loss calculations
- **Automated Price Updates**: Periodic portfolio revaluation

#### Stock Trading
- **Live Stock Data**: Financial Modelling Prep API integration
- **Dynamic Portfolio Charts**: Animated allocation visualizations
- **Comprehensive Tracking**: Equity, cash balance, total returns analysis
- **Search Functionality**: Symbol-based stock lookup and historical data

## 🛠️ Technology Stack

### Frontend Technologies
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
