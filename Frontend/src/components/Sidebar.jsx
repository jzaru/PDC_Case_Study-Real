import React from 'react';

export default function Sidebar({ activeTab, setActiveTab }) {
  const tabs = [
    { id: 'dashboard', label: 'Dashboard', icon: '📊' },
    { id: 'stocks', label: 'Stocks', icon: '📈' },
    { id: 'buy-sell', label: 'Buy/Sell', icon: '💰' },
    { id: 'portfolio', label: 'Portfolio', icon: '💼' },
    { id: 'transactions', label: 'History', icon: '📋' },
  ];

  return (
    <div className="w-64 bg-gray-900 text-white min-h-screen p-6 shadow-lg">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-green-400">📱 Stock Trade</h1>
        <p className="text-gray-400 text-sm mt-2">Simulation Platform</p>
      </div>

      <nav className="space-y-2">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`w-full text-left px-4 py-3 rounded-lg transition-all ${
              activeTab === tab.id
                ? 'bg-green-500 text-white font-semibold'
                : 'text-gray-300 hover:bg-gray-800'
            }`}
          >
            <span className="mr-2">{tab.icon}</span>
            {tab.label}
          </button>
        ))}
      </nav>

      <div className="mt-12 pt-6 border-t border-gray-700">
        <p className="text-xs text-gray-500">
          © PDM Stock simulating platform.
        </p>
      </div>
    </div>
  );
}
