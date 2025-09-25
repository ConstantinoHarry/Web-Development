# FiscalWiser - Smart Asset Management Web Application

FiscalWiser is a comprehensive financial technology web application designed to enhance users' financial literacy and well-being through integrated financial planning, management, and investment simulation tools. Built with modern web technologies, it provides a unified platform for personal finance management and educational trading simulations.

![FiscalWiser](https://img.shields.io/badge/Project-FiscalWiser-blue)
![Version](https://img.shields.io/badge/Version-1.0-green)
![License](https://img.shields.io/badge/License-Educational-lightgrey)

## 🚀 Key Features

### 📊 Financial Overview Dashboard
- **Real-time Performance Metrics**: Monthly income, expenses, savings rate with comparative analysis
- **Cash Flow Analysis**: Interactive charts with timeline filtering (1 month, 6 months, 1 year, all)
- **Portfolio Tracking**: Stock and cryptocurrency portfolio values with profit/loss indicators
- **Automated Updates**: Real-time data synchronization with localStorage persistence

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
- **HTML5**: Semantic structure and accessibility
- **CSS3**: Responsive design with modern styling
- **JavaScript ES6+**: Vanilla JS for component functionality
- **Chart.js**: Financial charts and data visualization

### APIs & External Services
- **CoinGecko API**: Cryptocurrency market data
- **Financial Modelling Prep API**: Real-time stock information
- **localStorage**: Client-side data persistence

### Development Environment
- **VS Code**: Primary IDE with Live Server extension
- **Node.js**: Backend framework for retirement calculations
- **Git**: Version control and project management

## 📁 Project Architecture

FiscalWiser/
├── public/
│ ├── index.html # Main application entry point
│ └── assets/ # Static resources
├── src/private/components/
│ ├── app.js # Application initializer
│ ├── navBar-styles.css # Navigation styling
│ ├── dashboard/
│ │ ├── dashboard.html
│ │ ├── dashboardBudget.js # Budget tracking logic
│ │ ├── dashboardCashFlowAnalysis.js # Cash flow charts
│ │ ├── dashboardCryptoPortfolio.js # Crypto portfolio metrics
│ │ └── dashboardStockPortfolio.js # Stock portfolio metrics
│ ├── paperTrading/
│ │ ├── crypto/
│ │ │ ├── crypto_paper_trading_simulator.html
│ │ │ ├── cryptoPaperTradingSimulator.js # Core trading logic
│ │ │ ├── cryptoChartModule.js # Chart rendering
│ │ │ └── crypto-paper-trade-styles.css
│ │ └── stocks/
│ │ ├── stock-ticker.html
│ │ └── stock-ticker.js # Stock trading logic
│ ├── retirement/
│ │ ├── calculator/
│ │ │ ├── retirementCalculator.js # Retirement calculations
│ │ │ └── retirement-styles.css
│ │ └── overview/
│ │ ├── retirementOverview.js # Retirement tracking
│ │ └── retirement-overview-styles.css
│ └── transactions/
│ ├── incomeExpenseTracking.js # Money tracker
│ └── transaction-styles.css
└── README.md


## 🏁 Getting Started

### Prerequisites
- Modern web browser (Chrome, Firefox, Safari, Edge)
- Local static server recommended for development

### Installation & Setup

1. **Clone the Repository**
   ```bash
   git clone https://github.com/ConstantinoHarry/FiscalWiser.git
   cd FiscalWiser

## 2 Run with local Server 

# Using Python 3
python3 -m http.server 8000

# Using Node.js http-server
npx http-server -p 8000

# Using VS Code Live Server extension
# Right-click on index.html → "Open with Live Server"

## 3. Access Application 

Open browser and navigate to: http://localhost:8000/public/index.html
Or directly open HTML files for specific components
API Configuration (Optional)

For enhanced functionality, add API keys in respective modules:

CoinGecko API: Free tier (10,000 requests/month)
Financial Modelling Prep API: Developer account required

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