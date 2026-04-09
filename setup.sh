#!/bin/bash
# Setup script for Stock Trading Simulation Platform

echo "🚀 Stock Trading Simulation - Setup Script"
echo "==========================================="

# Backend setup
echo ""
echo "📦 Setting up Backend..."
cd Backend
echo "  Installing Python dependencies..."
pip install -r requirements.txt

if [ $? -eq 0 ]; then
    echo "  ✓ Backend dependencies installed"
else
    echo "  ✗ Failed to install backend dependencies"
    exit 1
fi

cd ..

# Frontend setup
echo ""
echo "📦 Setting up Frontend..."
cd Frontend
echo "  Installing Node dependencies..."
npm install

if [ $? -eq 0 ]; then
    echo "  ✓ Frontend dependencies installed"
else
    echo "  ✗ Failed to install frontend dependencies"
    exit 1
fi

cd ..

echo ""
echo "✅ Setup Complete!"
echo ""
echo "🚀 To run the application:"
echo ""
echo "  Backend:"
echo "    cd Backend"
echo "    python server.py"
echo ""
echo "  Frontend (in a new terminal):"
echo "    cd Frontend"
echo "    npm run dev"
echo ""
echo "  Then visit: http://localhost:5173"
