# 🚀 Quick Start Guide - Stock Trading Simulation Platform

## ⚡ 5-Minute Setup

### Prerequisites
- ✓ Python 3.9+ installed
- ✓ Node.js 16+ with npm installed  
- ✓ Git (optional)

### Step 1: Install Dependencies

**Backend:**
```bash
cd Backend
pip install fastapi uvicorn pandas numpy pydantic
```

**Frontend:**
```bash
cd Frontend
npm install
```

### Step 2: Run the Application

**Terminal 1 - Start Backend:**
```bash
cd Backend
python server.py
```

Expected output:
```
✓ Services initialized with data from: ../data/stocks.csv
INFO:     Uvicorn running on http://0.0.0.0:8000
```

**Terminal 2 - Start Frontend:**
```bash
cd Frontend
npm run dev
```

Expected output:
```
  VITE v8.0.4  ready in 123 ms

  ➜  Local:   http://localhost:5173/
  ➜  press h to show help
```

### Step 3: Open in Browser

Navigate to: **http://localhost:5173**

You should see the Stock Trading Simulator dashboard!

---

## 📋 Features Overview

### Dashboard Tab
- Portfolio balance and profit/loss
- Current holdings with values
- Real-time updates every 5 seconds

### Stocks Tab
- Browse all 5 available stocks (AAPL, GOOGL, MSFT, TSLA, AMZN)
- View stock cards with current prices
- Expand cards to see detailed analysis
- Click "Trade" to move to Buy/Sell page

### Buy/Sell Tab
- Interactive stock price chart
- Real-time stock analysis and recommendations
- Buy/Sell form with quantity input
- Transaction confirmation messages

### Portfolio Tab
- Detailed holdings table
- Profit/Loss for each position
- Total investment summary

### History Tab
- Transaction log with dates and profits
- BUY/SELL indicators
- Chronological order (newest first)

---

## 🎯 Demo Usage

1. **Start with Dashboard** - See your starting $100,000 cash balance

2. **Go to Stocks** - Browse AAPL, GOOGL, MSFT, TSLA, AMZN

3. **Select a Stock** - Click "Trade" on any stock card

4. **Buy Shares** - Enter quantity, click "🟢 Buy Now"

5. **View Chart** - See the stock price trend over time

6. **Check Analysis** - View moving averages and recommendation

7. **Track Portfolio** - Go to Portfolio tab to see holdings

8. **Sell Shares** - If you own shares, sell them for profit/loss

9. **View History** - Check transaction history and P&L

---

## 🔧 Troubleshooting

### Backend won't start
```bash
# Check if port 8000 is in use
# Try running on different port:
python server.py --port 8001
```

### Frontend can't connect to backend
```bash
# Verify backend is running:
curl http://localhost:8000/api/health

# Check browser console (F12) for errors
# Make sure backend started before frontend
```

### CSS not loading properly
```bash
# Tailwind CSS processing issue:
cd Frontend
npm run build
npm run dev
```

### Module not found errors
```bash
# Reinstall all dependencies:
cd Backend && pip install --upgrade -r requirements.txt
cd Frontend && npm install
```

---

## 📊 API Endpoints Reference

All endpoints require backend to be running at `http://localhost:8000`

### GET Endpoints
```bash
# Get all stocks
curl http://localhost:8000/api/stocks

# Get stock analysis
curl http://localhost:8000/api/stocks/AAPL

# Get portfolio
curl http://localhost:8000/api/portfolio/user_demo_001

# Get history
curl http://localhost:8000/api/transactions/user_demo_001

# Health check
curl http://localhost:8000/api/health

# Swagger UI Documentation (interactive)
http://localhost:8000/docs
```

### POST Endpoints
```bash
# Buy stock (with query param user_id)
curl -X POST http://localhost:8000/api/buy?user_id=user_demo_001 \
  -H "Content-Type: application/json" \
  -d '{"symbol": "AAPL", "quantity": 10}'

# Sell stock
curl -X POST http://localhost:8000/api/sell?user_id=user_demo_001 \
  -H "Content-Type: application/json" \
  -d '{"symbol": "AAPL", "quantity": 5}'
```

---

## 📁 File Structure Explained

```
Backend/
├── server.py                 # Main FastAPI app (START HERE)
├── api/__init__.py          # API routes and endpoints
├── services/__init__.py      # Business logic (trading, analysis)
└── data_processing/__init__.py # Parallel processing functions

Frontend/
├── src/App.jsx              # Main React app
├── src/pages/               # Page components
├── src/components/          # Reusable components
├── src/services/api.js      # HTTP client (connects to backend)
└── src/charts/              # Chart components
```

---

## 🎓 Understanding the Data Flow

### 1. Stock Analysis Flow
```
User clicks stock → Frontend fetches /api/stocks/{symbol}
→ Backend loads CSV data for that symbol
→ Calculates moving averages (MA10, MA20)
→ Calculates volatility (std deviation)
→ Runs recommendation logic (BUY/SELL/HOLD)
→ Returns analysis to frontend
→ Frontend displays chart + recommendation
```

### 2. Buy Transaction Flow
```
User clicks "Buy Now" → Frontend validates inputs
→ Calls POST /api/buy with symbol & quantity
→ Backend checks:
   ├── Stock exists in data
   ├── Sufficient cash available
   └── Portfolio initialized
→ Updates portfolio:
   ├── Reduces cash balance
   ├── Adds to holdings
   └── Records transaction
→ Returns success message
→ Frontend refreshes portfolio display
```

### 3. Parallel Data Processing
```
When backend initializes (startup):
1. Loads CSV data (all 50 records × 5 symbols)
2. Groups by symbol (5 groups)
3. Spawns CPU_COUNT worker processes
4. Each worker processes one stock in parallel
5. Calculates stats for each stock
6. Aggregates results
7. Returns complete analysis
```

---

## 💡 Key Concepts

### Moving Averages
- **MA10**: Average price of last 10 days
- **MA20**: Average price of last 20 days
- **Signal**: MA10 > MA20 = Bullish, MA10 < MA20 = Bearish

### Volatility
- Standard deviation of price changes
- **High volatility** = More risky but potentially higher gains
- **Low volatility** = More stable but slower growth

### Recommendation Logic
```python
if MA10 > MA20 and price > MA10:
    recommendation = "BUY"
if MA10 < MA20 and price < MA10:
    recommendation = "SELL"
else:
    recommendation = "HOLD"
```

### Portfolio Value
```
Current Value = Sum of (quantity × current_price) for all holdings
Profit/Loss = Current Value - Total Invested
ROI % = (Profit/Loss / Total Invested) × 100
```

---

## 🔐 Customization

### Change Starting Cash
Edit [Backend/services/__init__.py](Backend/services/__init__.py#L61):
```python
'cash': 100000  # Change this value
```

### Add More Stocks to CSV
Edit [data/stocks.csv](data/stocks.csv) and add rows:
```csv
2024-01-01,Symbol,open,high,low,close,volume
```

### Modify Recommendation Sensitivity
Edit [Backend/services/__init__.py](Backend/services/__init__.py#L116):
```python
if signals >= 2:  # Change threshold from 2
    recommendation = "BUY"
```

### Change Refresh Intervals
Edit page components and use different intervals:
```javascript
const interval = setInterval(fetchData, 3000);  // 3 seconds instead of 5
```

---

## 📈 Sample Trading Sequence

1. **Initial State**: $100,000 cash, 0 holdings

2. **Buy AAPL**:
   - Price: $160
   - Quantity: 100
   - Total: $16,000
   - New Cash: $84,000
   - New Holdings: AAPL 100 @ $160

3. **Price Goes to $165**:
   - Holdings: AAPL 100 @ $160 (avg buy price)
   - Current Value: $16,500
   - Unrealized P&L: +$500 (3.1%)

4. **Sell 50 Shares at $165**:
   - Proceeds: $8,250
   - Profit on sale: $250
   - New Holdings: AAPL 50 @ $160
   - New Cash: $92,250

---

## 🚀 Next Steps

1. **Explore the code** - Check out the implementation details
2. **Modify data** - Add your own stock data to CSV
3. **Extend features** - Add technical indicators, more analysis
4. **Deploy** - Push to Heroku, Vercel, Railway, etc.
5. **Add database** - Replace in-memory with PostgreSQL

---

## 📚 Additional Resources

- **FastAPI Docs**: https://fastapi.tiangolo.com/
- **React Docs**: https://react.dev/
- **Tailwind CSS**: https://tailwindcss.com/
- **Recharts**: https://recharts.org/
- **Pandas**: https://pandas.pydata.org/docs/

---

## ✅ Verification Checklist

- [ ] Backend running at http://localhost:8000
- [ ] Frontend running at http://localhost:5173
- [ ] Can view Swagger API docs at http://localhost:8000/docs
- [ ] Can see Dashboard with $100,000 starting balance
- [ ] Can view all 5 stocks in Stocks page
- [ ] Can buy and sell stocks
- [ ] Can see portfolio updates in real-time
- [ ] Can view transaction history
- [ ] Charts display correctly

---

## 🎉 You're All Set!

Your stock trading simulation platform is ready to use. Enjoy analyzing, buying, and selling stocks with real technical indicators and recommendations!

**Questions?** Check the [README.md](README.md) for detailed documentation.
