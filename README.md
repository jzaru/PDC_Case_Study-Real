# Stock Trading Simulation Platform

A full-stack stock trading simulation website with real-time analysis, portfolio management, and parallel data processing.

## Project Overview

This application demonstrates a modern web platform for simulating stock trading with the following features:
- **Real-time stock data** from CSV processing
- **AI-powered buy/sell recommendations** based on technical analysis
- **Portfolio management** with profit/loss tracking
- **Parallel computing** for batch data analysis using Python multiprocessing
- **Interactive charts** for price trend visualization
- **Responsive dark-themed UI** built with React and Tailwind CSS

---

## 🏗️ Project Structure

```
PDC_Case_Study-Real/
├── Backend/
│   ├── api/                 # FastAPI route handlers
│   │   └── __init__.py     # API endpoints
│   ├── services/            # Business logic
│   │   └── __init__.py     # StockAnalysisService, PortfolioService
│   ├── data_processing/     # Parallel data processing
│   │   └── __init__.py     # Multiprocessing functions
│   ├── models/              # Pydantic data models
│   │   └── __init__.py
│   ├── utils/               # Helper utilities
│   │   └── __init__.py
│   ├── requirements.txt      # Python dependencies
│   └── server.py           # FastAPI application entry point
│
├── Frontend/
│   ├── src/
│   │   ├── components/       # Reusable React components
│   │   │   ├── Sidebar.jsx
│   │   │   └── StockCard.jsx
│   │   ├── pages/            # Page components
│   │   │   ├── DashboardPage.jsx
│   │   │   ├── StocksPage.jsx
│   │   │   ├── BuySellPage.jsx
│   │   │   ├── PortfolioPage.jsx
│   │   │   └── TransactionsPage.jsx
│   │   ├── services/         # API service layer
│   │   │   └── api.js       # Axios HTTP client
│   │   ├── charts/           # Chart components
│   │   │   └── StockChart.jsx
│   │   ├── App.jsx          # Main application component
│   │   ├── main.jsx         # React entry point
│   │   ├── index.css        # Global styles (Tailwind)
│   │   └── App.css          # App-specific styles
│   ├── package.json
│   ├── vite.config.js
│   ├── tailwind.config.js
│   └── postcss.config.js
│
└── data/
    └── stocks.csv          # Sample stock market data
```

---

## 📊 Technology Stack

### Backend
- **Framework**: FastAPI (Python web framework)
- **Async**: Uvicorn ASGI server
- **Data Processing**: Pandas, NumPy
- **Database**: In-memory (expandable to SQL DB)
- **Parallel Computing**: Python `multiprocessing`
- **API**: RESTful with JSON responses

### Frontend
- **Framework**: React 19
- **Build Tool**: Vite
- **Styling**: Tailwind CSS
- **Charts**: Recharts
- **HTTP Client**: Axios
- **UI Theme**: Dark mode (trading platform style)

### Data
- **Format**: CSV (tab-separated)
- **Symbols**: AAPL, GOOGL, MSFT, TSLA, AMZN
- **Data Points**: Date, OHLC, Volume

---

## 🚀 Getting Started

### Prerequisites
- Python 3.9+
- Node.js 16+ with npm
- Git

### Backend Setup

1. **Install Python dependencies**
```bash
cd Backend
pip install -r requirements.txt
```

2. **Run the FastAPI server**
```bash
python server.py
```

The server will start at `http://localhost:8000`

**API Documentation**: Visit `http://localhost:8000/docs` (Swagger UI)

### Frontend Setup

1. **Install Node dependencies**
```bash
cd Frontend
npm install
```

2. **Start the development server**
```bash
npm run dev
```

The frontend will start at `http://localhost:5173`

### Access the Application

1. Ensure the **backend is running** (`http://localhost:8000`)
2. Open `http://localhost:5173` in your browser
3. Use the sidebar to navigate between pages
4. Default User ID: `user_demo_001` (can be changed in App.jsx)

---

## 🔑 Core Features

### 1. Stock Analysis & Recommendations
- **Technical Indicators**:
  - 10-day & 20-day Moving Averages (MA10, MA20)
  - Volatility (Standard Deviation)
  - Price Momentum

- **Recommendation Engine**:
  - **BUY**: When MA10 > MA20 and price trending upward
  - **SELL**: When MA10 < MA20 and price trending downward
  - **HOLD**: Neutral signals
  - Confidence scores based on volatility

- **Example Logic**:
```python
if ma_10 > ma_20 and price > ma_10:
    recommendation = "BUY"
    confidence = 0.8  # 80%
```

### 2. Portfolio Management
- **Buy/Sell Transactions**:
  - Real-time profit/loss calculation
  - Average cost basis tracking
  - Transaction history

- **Portfolio Tracking**:
  - Home value updates every 5 seconds
  - Holdings overview
  - Performance metrics (ROI %)

### 3. Parallel Data Processing
- **Multiprocessing Implementation**:
  - Each stock symbol processed in parallel
  - Uses Python's `multiprocessing.Pool`
  - Scales to CPU count

- **Process Flow**:
```
CSV Data
    ↓
[Split by Symbol]
    ↓
[Process Pool]
    ├── Worker 1: AAPL Analysis
    ├── Worker 2: GOOGL Analysis
    ├── Worker 3: MSFT Analysis
    └── ... (parallel execution)
    ↓
[Aggregate Results]
    ↓
API Response
```

### 4. Real-time Charts
- **Recharts Integration**:
  - Line chart for price trends
  - Open vs Close price visualization
  - Interactive tooltips
  - Responsive design

---

## 📡 API Endpoints

### Stocks
- `GET /api/stocks` - Get all stocks with current prices
- `GET /api/stocks/{symbol}` - Get stock analysis & recommendation
- `GET /api/stocks/{symbol}/history` - Get historical price data
- `GET /api/analysis/all` - Get analysis for all stocks

### Portfolio
- `GET /api/portfolio/{user_id}` - Get portfolio overview
- `POST /api/buy` - Buy stocks (params: user_id, body: symbol, quantity)
- `POST /api/sell` - Sell stocks (params: user_id, body: symbol, quantity)
- `GET /api/transactions/{user_id}` - Get transaction history

### System
- `GET /api/health` - Health check
- `GET /` - API documentation

---

## 📈 Data Flow

### Stock Analysis Flow
```
1. User selects stock
2. Frontend calls GET /api/stocks/{symbol}
3. Backend loads CSV data
4. Calculates technical indicators
5. Runs recommendation logic
6. Returns analysis with recommendation
7. Frontend displays trend chart
```

### Buy/Sell Flow
```
1. User enters quantity
2. Frontend calls POST /api/buy or /api/sell
3. Backend validates:
   - Stock exists
   - Sufficient funds (for buy)
   - Sufficient shares (for sell)
4. Updates portfolio:
   - Adjusts cash balance
   - Updates holdings
   - Records transaction
5. Returns transaction status
6. Frontend refreshes portfolio
```

### Parallel Processing Flow
```
1. User visits Dashboard
2. Backend loads CSV
3. Groups data by symbol
4. Spawns worker processes (Pool)
5. Each worker:
   - Calculates statistics
   - Computes moving averages
   - Determines volatility
6. Aggregates results
7. Caches for quick access
```

---

## 🎨 UI/UX Design

### Pages
1. **Dashboard**: Portfolio overview, holdings, P&L
2. **Stocks**: Browse available stocks with analysis
3. **Buy/Sell**: Trade page with chart and recommendation
4. **Portfolio**: Detailed holdings table with metrics
5. **History**: Transaction log with profits/losses

### Design System
- **Color Scheme**: Dark gray (#111827-#374151)
- **Accent Colors**:
  - Green (#10b981): Buy, Positive
  - Red (#ef4444): Sell, Negative
  - Blue (#3b82f6): Actions
  - Yellow (#facc15): Hold, Warnings

- **Components**:
  - Card-based layout for stocks
  - Tables for detailed data
  - Charts for visualization
  - Modal-like trade panel

---

## 📊 Sample Data Format

**stocks.csv**:
```csv
timestamp,symbol,open,high,low,close,volume
2024-01-01,AAPL,150.00,152.50,149.50,151.00,2500000
2024-01-02,AAPL,151.00,153.00,150.50,152.50,2300000
...
```

---

## ⚙️ Configuration

### Backend Configuration
- **Port**: `8000` (configurable in server.py)
- **CSV Path**: `../data/stocks.csv` (relative to Backend/)
- **CORS**: Enabled for frontend (localhost:5173, localhost:3000)
- **Data Cache**: In-memory (can add Redis)

### Frontend Configuration
- **API Base URL**: `http://localhost:8000/api`
- **Port**: `5173` (Vite default)
- **User ID**: `user_demo_001` (changeable)
- **Refresh Intervals**:
  - Portfolio: 5 seconds
  - Stocks: 10 seconds
  - Transactions: 3 seconds

---

## 🔧 Customization

### Add New Stock
1. Add rows to `data/stocks.csv`
2. Restart backend (auto-reloads on startup)

### Modify Recommendation Logic
Edit `Backend/services/__init__.py` → `_generate_signal()` method

### Change Starting Capital
Modify `Backend/services/__init__.py` → `PortfolioService.create_portfolio()` → `'cash': 100000`

### Add Database
Replace in-memory portfolio storage with SQLAlchemy + PostgreSQL

---

## 🐛 Troubleshooting

### Backend Won't Start
```bash
# Check Python version
python --version  # Should be 3.9+

# Reinstall requirements
pip install --upgrade -r requirements.txt

# Run with verbose output
python -u server.py
```

### Frontend Can't Connect to Backend
```bash
# Check if backend is running
curl http://localhost:8000/api/health

# Check CORS headers
curl -i http://localhost:8000/api/stocks

# Clear browser cache and reload
```

### No CSV Data
```bash
# Verify CSV exists
ls ../data/stocks.csv

# Check CSV path in server.py
# Line: csv_path = os.path.join(os.path.dirname(__file__), "..", "data", "stocks.csv")
```

---

## 📈 Performance Notes

- **Parallel Processing**: Uses `multiprocessing.cpu_count()` workers
- **Data Caching**: Last 100 transactions cached per user
- **Chart Rendering**: History limited to 20 data points (configurable)
- **Refresh Rates**: User can modify intervals in page components

---

## 🚀 Deployment

### Backend (Heroku, Railway, AWS)
```bash
# Create requirements.txt
pip freeze > requirements.txt

# Deploy
heroku create
heroku config:set PORT=8000
git push heroku main
```

### Frontend (Vercel, Netlify)
```bash
# Build
npm run build

# Deploy to Vercel
vercel deploy
```

---

## 📝 Key Concepts Demonstrated

1. **Parallel/Distributed Computing**: Multiprocessing for batch analysis
2. **RESTful API Design**: Clean separation of concerns
3. **Real-time Updates**: WebSocket-ready architecture  
4. **Data Visualization**: Interactive charts with Recharts
5. **State Management**: React hooks for local state
6. **Technical Analysis**: Moving averages, volatility, momentum
7. **Portfolio Management**: FIFO transaction tracking
8. **Error Handling**: Graceful API error responses
9. **Responsive Design**: Mobile-friendly Tailwind CSS

---

## 📄 License

This project is open source and available under the MIT License.

---

## 🤝 Contributing

Contributions are welcome! Please:
1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

---

## 📞 Support

For issues or questions:
1. Check the troubleshooting section
2. Review the API documentation at `http://localhost:8000/docs`
3. Check browser console for frontend errors
4. Check terminal output for backend errors

---

## 🎓 Learning Resources

- **FastAPI**: https://fastapi.tiangolo.com/
- **React**: https://react.dev/
- **Tailwind CSS**: https://tailwindcss.com/
- **Recharts**: https://recharts.org/
- **Python Multiprocessing**: https://docs.python.org/3/library/multiprocessing.html

---

**Happy Trading! 📈💰**
