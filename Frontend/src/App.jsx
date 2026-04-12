import { useState, useEffect } from 'react';
import './App.css';
import Sidebar from './components/Sidebar';
import DashboardPage from './pages/DashboardPage';
import StocksPage from './pages/StocksPage';
import BuySellPage from './pages/BuySellPage';
import PortfolioPage from './pages/PortfolioPage';
import TransactionsPage from './pages/TransactionsPage';
import SettingsPage from './pages/SettingsPage';
import { healthCheck } from './services/api';

function App() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [selectedCompany, setSelectedCompany] = useState('AAPL');
  const [connected, setConnected] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Check if backend is available
    const checkConnection = async () => {
      console.log('Checking backend connection...');
      try {
        await healthCheck();
        console.log('Backend connection successful');
        setConnected(true);
        setError(null);
      } catch (error) {
        console.error('Backend not available:', error);
        setConnected(false);
        setError('Backend connection failed');
      } finally {
        setLoading(false);
      }
    };

    checkConnection();
    const interval = setInterval(checkConnection, 10000);
    return () => clearInterval(interval);
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-900">
        <div className="text-center">
          <div className="mb-4 text-4xl">📱</div>
          <p className="text-white text-xl">Loading Stock Trading Simulator...</p>
        </div>
      </div>
    );
  }

  if (error && !connected) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-900">
        <div className="text-center bg-red-900 p-8 rounded-lg max-w-md">
          <p className="text-red-300 text-lg mb-2">⚠️ Backend Connection Failed</p>
          <p className="text-red-200 text-sm mb-4">
            Could not connect to the backend API at http://localhost:8000
          </p>
          <p className="text-red-400 text-xs">
            Error: {error}
          </p>
          <p className="text-red-400 text-xs mt-4">
            Please ensure the Python backend is running
          </p>
        </div>
      </div>
    );
  }

  const renderContent = () => {
    try {
      switch (activeTab) {
        case 'dashboard':
          return <DashboardPage />;
        case 'stocks':
          return <StocksPage onSelectStock={(company) => {
            setSelectedCompany(company);
            setActiveTab('buy-sell');
          }} />;
        case 'buy-sell':
          return <BuySellPage selectedCompany={selectedCompany} onCompanyChange={setSelectedCompany} />;
        case 'portfolio':
          return <PortfolioPage />;
        case 'transactions':
          return <TransactionsPage />;
        case 'settings':
          return <SettingsPage />;
        default:
          return <DashboardPage />;
      }
    } catch (err) {
      console.error('Error rendering content:', err);
      return (
        <div className="p-8">
          <div className="bg-red-900 p-6 rounded-lg">
            <h2 className="text-red-300 text-xl mb-2">⚠️ Rendering Error</h2>
            <p className="text-red-200">Failed to render {activeTab} page</p>
            <p className="text-red-400 text-sm mt-2">{err.message}</p>
          </div>
        </div>
      );
    }
  };

  return (
    <div className="flex min-h-screen w-full bg-gray-900">
      <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />
      <div className="flex-1 w-full overflow-auto">
        {renderContent()}
      </div>
    </div>
  );
}

export default App;
