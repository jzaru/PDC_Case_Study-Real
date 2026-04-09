# ✅ Startup Checklist & Verification Guide

## Pre-Launch Verification

Use this checklist to verify everything is installed and configured correctly before running the application.

---

## 🔧 System Requirements

- [ ] Python 3.9 or higher installed
  ```bash
  python --version
  ```

- [ ] Node.js 16+ installed
  ```bash
  node --version
  npm --version
  ```

- [ ] Git installed (optional)
  ```bash
  git --version
  ```

---

## 📦 Backend Setup Verification

### Dependencies Installed
```bash
cd Backend
pip show fastapi
pip show uvicorn
pip show pandas
pip show numpy
pip show pydantic
```

**All should show "Location:" indicating they're installed**

- [ ] FastAPI
- [ ] Uvicorn
- [ ] Pandas
- [ ] NumPy
- [ ] Pydantic

### File Structure
```bash
cd Backend
ls -la
```

Should show:
- [ ] `server.py` ✓
- [ ] `api/` folder ✓
- [ ] `services/` folder ✓
- [ ] `data_processing/` folder ✓
- [ ] `models/` folder ✓
- [ ] `utils/` folder ✓
- [ ] `requirements.txt` ✓

### Import Check
```bash
cd Backend
python -c "from api import router; from services import StockAnalysisService, PortfolioService; from data_processing import batch_process_analysis; print('✓ All imports successful')"
```

- [ ] No import errors

### Data File Exists
```bash
cd ..
ls -la data/stocks.csv
```

- [ ] `stocks.csv` exists
- [ ] File size > 0 bytes

---

## 🎨 Frontend Setup Verification

### Dependencies Installed
```bash
cd Frontend
npm list react
npm list recharts
npm list axios
npm list tailwindcss
```

Should show version numbers:
- [ ] React 19+
- [ ] Recharts 2+
- [ ] Axios 1+
- [ ] Tailwind CSS 3+

### File Structure
```bash
cd Frontend/src
ls -la
```

Should show:
- [ ] `App.jsx` ✓
- [ ] `main.jsx` ✓
- [ ] `index.css` ✓
- [ ] `App.css` ✓
- [ ] `pages/` folder ✓
- [ ] `components/` folder ✓
- [ ] `services/` folder ✓
- [ ] `charts/` folder ✓

### Pages Check
```bash
ls -la Frontend/src/pages/
```

Should contain:
- [ ] `DashboardPage.jsx`
- [ ] `StocksPage.jsx`
- [ ] `BuySellPage.jsx`
- [ ] `PortfolioPage.jsx`
- [ ] `TransactionsPage.jsx`

### Components Check
```bash
ls -la Frontend/src/components/
```

Should contain:
- [ ] `Sidebar.jsx`
- [ ] `StockCard.jsx`

---

## 🚀 Launch Sequence

### Step 1: Start Backend

```bash
cd Backend
python server.py
```

**Expected output**:
```
✓ Services initialized with data from: ../data/stocks.csv
INFO:     Uvicorn running on http://0.0.0.0:8000
```

Checklist:
- [ ] No Python errors
- [ ] No import errors
- [ ] CSV data loaded successfully
- [ ] Server running on port 8000

**Keep this terminal running!**

### Step 2: Test Backend API

**In a new terminal** (don't close the backend terminal):

```bash
# Test health check
curl http://localhost:8000/api/health

# Test stocks endpoint
curl http://localhost:8000/api/stocks

# Test analysis endpoint
curl http://localhost:8000/api/stocks/AAPL
```

- [ ] Health check returns `{"status": "healthy", ...}`
- [ ] Stocks endpoint returns array of stocks
- [ ] AAPL analysis returns recommendation

**Common issues**:
- "Connection refused" → Backend not running
- "Module not found" → Missing Python dependency
- "CSV not found" → Data file missing

### Step 3: Start Frontend

**In another new terminal** (keep backend running):

```bash
cd Frontend
npm run dev
```

**Expected output**:
```
  VITE v8.0.4  ready in 123 ms

  ➜  Local:   http://localhost:5173/
  ➜  press h to show help
```

Checklist:
- [ ] No Node errors
- [ ] No dependency errors
- [ ] Vite dev server started
- [ ] Running on port 5173

---

## 🌐 Browser Launch

### Open Application

**In your browser**, navigate to:
```
http://localhost:5173
```

Checklist:
- [ ] Page loads without errors
- [ ] No CORS errors in console
- [ ] Sidebar visible on left
- [ ] Dashboard content loads

### Check Browser Console (F12)

```
Press: Ctrl+Shift+J (Windows) or Cmd+Option+J (Mac)
```

- [ ] No red errors
- [ ] May see some warnings (OK)
- [ ] Should see "Health check" message

---

## ✅ Functionality Tests

### 1. Dashboard Page
- [ ] Shows "📊 Dashboard"
- [ ] Displays $100,000 starting balance
- [ ] Shows "Current Holdings" section
- [ ] Says "No active holdings"

### 2. Stocks Page
Click "Stocks" in sidebar:
- [ ] Shows list of stock cards
- [ ] See 5 stocks: AAPL, GOOGL, MSFT, TSLA, AMZN
- [ ] Each card shows symbol and price
- [ ] Can click "View Analysis"
- [ ] Analysis expands showing metrics

### 3. Buy/Sell Page
Click any "Trade" button:
- [ ] Stock chart displays
- [ ] Chart shows price trends
- [ ] Analysis panel on right shows recommendation
- [ ] Can enter quantity (default 1)
- [ ] Can click "🟢 Buy Now"
- [ ] Should see success message

### 4. After Buy Transaction
- [ ] Success message appears
- [ ] Quantity input resets
- [ ] Can now click "🔴 Sell Now"

### 5. Portfolio Page
Click "Portfolio":
- [ ] Shows holdings table
- [ ] See purchased stock
- [ ] Shows buy price and quantity
- [ ] Shows profit/loss calculation

### 6. History Page
Click "History":
- [ ] Shows transaction log
- [ ] See BUY transaction most recent
- [ ] Shows date, symbol, quantity, price

### 7. Sell Transaction
Go back to Buy/Sell, sell some shares:
- [ ] Can sell successfully
- [ ] See profit/loss in transaction history
- [ ] Portfolio updates

---

## 📊 API Verification

### Check Swagger Documentation

Visit: `http://localhost:8000/docs`

Should show:
- [ ] All endpoints listed
- [ ] Green "Try it out" buttons
- [ ] Documentation for each endpoint
- [ ] Example request/response

---

## ⚠️ Common Issues & Fixes

### Issue: "Cannot GET /api/stocks"
**Solution**: Backend not running
```bash
cd Backend
python server.py
```

### Issue: CORS Error in Browser
**Solution**: Backend not accepting requests
- Check backend is running on :8000
- Verify CORSMiddleware is set up
- Check firewall settings

### Issue: "Module not found" (Python)
**Solution**: Dependencies not installed
```bash
cd Backend
pip install fastapi uvicorn pandas numpy pydantic
```

### Issue: "Cannot find module 'react'" (Node)
**Solution**: Frontend dependencies not installed
```bash
cd Frontend
npm install
```

### Issue: "Cannot GET / " on localhost:5173
**Solution**: Frontend didn't start properly
```bash
cd Frontend
npm run dev
```

### Issue: Chart not displaying
**Solution**: Recharts not installed
```bash
cd Frontend
npm install recharts
```

### Issue: Tailwind CSS not working
**Solution**: CSS not built
```bash
cd Frontend
npm run build
npm run dev
```

---

## 🔍 Debug Mode

### Enable Verbose Backend Logging
Edit `Backend/server.py` and add:
```python
import logging
logging.basicConfig(level=logging.DEBUG)
```

### Check Network Requests
**In Browser Console (F12)**:
1. Click "Network" tab
2. Perform action (buy stock)
3. See API calls and responses
4. Check for 200 OK status
5. Click request to see full response

### Check Backend Logs
Look for these messages in backend terminal:
```
✓ Services initialized
GET /api/stocks
POST /api/buy  
{'success': true}
```

---

## 📈 Performance Verification

### Backend Response Time
```bash
# Time a request
time curl http://localhost:8000/api/stocks
```

Should be < 500ms

### Frontend Load Time
1. Open DevTools (F12)
2. Click "Performance" tab
3. Refresh page
4. See flame chart (should load in < 2s)

---

## ✨ Final Verification Checklist

Before considering setup complete:

- [ ] Backend running without errors
- [ ] Frontend running without errors
- [ ] Can see dashboard with $100k balance
- [ ] Can view all 5 stocks
- [ ] Can see stock analysis/recommendations
- [ ] Can buy stock successfully
- [ ] Can see profit/loss change in real-time
- [ ] Can sell stock successfully
- [ ] Can view transaction history
- [ ] Can view complete portfolio
- [ ] No red errors in browser console
- [ ] No Python errors in backend terminal

---

## 🎉 Ready to Go!

If all checkboxes are marked, your Stock Trading Simulation Platform is:

✅ **Fully Operational**
✅ **Ready for Use**
✅ **Ready for Customization**
✅ **Ready for Deployment**

---

## 📞 Troubleshooting Support

1. Check **QUICKSTART.md** for setup instructions
2. Check **README.md** for detailed documentation
3. Check **PARALLEL_COMPUTING.md** for technical details
4. Review browser console (F12) for error messages
5. Review backend terminal for error messages

---

### 🚀 You're All Set!

Your stock trading simulation platform is ready to use. Start trading! 📈💰
