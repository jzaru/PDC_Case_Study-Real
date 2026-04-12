import React, { useEffect, useState } from 'react';
import { balanceApi, simulationApi, stockApi } from '../services/api';

export default function SettingsPage() {
  const [balance, setBalance] = useState(0);
  const [addAmount, setAddAmount] = useState('');
  const [subtractAmount, setSubtractAmount] = useState('');
  const [simulationRunning, setSimulationRunning] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // 🔥 PERFORMANCE STATES
  const [performanceRunning, setPerformanceRunning] = useState(false);
  const [avgConfidence, setAvgConfidence] = useState(0);
  const [computationTime, setComputationTime] = useState(0);
  const [stocksProcessed, setStocksProcessed] = useState(0);

  useEffect(() => {
    fetchAll();
  }, []);

  const fetchAll = async () => {
    setLoading(true);
    try {
      const [balanceData, simData] = await Promise.all([
        balanceApi.getBalance(),
        simulationApi.getSimulationStatus()
      ]);

      setBalance(balanceData.balance ?? 0);
      setSimulationRunning(simData.running ?? false);
      setError(null);
    } catch (err) {
      console.error(err);
      setError('Failed to load settings');
    } finally {
      setLoading(false);
    }
  };

  // ========================
  // PERFORMANCE SIMULATION
  // ========================

  const runPerformanceTest = async () => {
    try {
      const start = performance.now();

      const data = await stockApi.getAllStocks();

      const end = performance.now();

      const avg =
        data.reduce((sum, s) => sum + (s.confidence || 0), 0) /
        data.length;

      setAvgConfidence(avg.toFixed(2));
      setComputationTime((end - start).toFixed(2));
      setStocksProcessed(data.length);
    } catch (err) {
      console.error(err);
    }
  };

  const togglePerformance = () => {
    if (performanceRunning) {
      setPerformanceRunning(false);
    } else {
      setPerformanceRunning(true);
      runPerformanceTest();
    }
  };

  // ========================
  // BALANCE
  // ========================

  const handleAddFunds = async () => {
    const amount = parseFloat(addAmount);
    if (isNaN(amount) || amount <= 0) return setError('Enter valid amount');

    try {
      const result = await balanceApi.addBalance(amount);
      if (result.success) {
        setBalance(result.balance);
        setAddAmount('');
        setError(null);
      }
    } catch (err) {
      setError('Failed to add funds');
    }
  };

  const handleSubtractFunds = async () => {
    const amount = parseFloat(subtractAmount);
    if (isNaN(amount) || amount <= 0) return setError('Enter valid amount');
    if (amount > balance) return setError('Insufficient balance');

    try {
      const result = await balanceApi.subtractBalance(amount);
      if (result.success) {
        setBalance(result.balance);
        setSubtractAmount('');
        setError(null);
      }
    } catch (err) {
      setError('Failed to subtract funds');
    }
  };

  // ========================
  // SIMULATION
  // ========================

  const toggleSimulation = async () => {
    try {
      if (simulationRunning) {
        await simulationApi.stopSimulation();
      } else {
        await simulationApi.startSimulation();
      }

      const updated = await simulationApi.getSimulationStatus();
      setSimulationRunning(updated.running);
    } catch (err) {
      setError('Simulation error');
    }
  };

  if (loading) {
    return <div className="p-6 text-white">Loading...</div>;
  }

  return (
    <div className="max-w-6xl mx-auto p-6">
      <h1 className="text-3xl font-bold text-white mb-8 text-center">⚙️ Settings</h1>

      {/* 🔥 TWO COLUMN LAYOUT */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        {/* LEFT COLUMN */}
        <div>

          {/* BALANCE */}
          <div className="bg-slate-800 text-white rounded-xl p-6 mb-6">
            <h2 className="text-xl mb-4">💰 Balance</h2>

            <p className="text-3xl text-green-400 mb-6">
              ${balance.toFixed(2)}
            </p>

            <div className="flex gap-2 mb-4">
              <input
                type="number"
                value={addAmount}
                onChange={(e) => setAddAmount(e.target.value)}
                className="flex-1 p-2 bg-gray-700 text-white"
                placeholder="Add amount"
              />
              <button onClick={handleAddFunds} className="bg-green-500 px-4">
                Add
              </button>
            </div>

            <div className="flex gap-2">
              <input
                type="number"
                value={subtractAmount}
                onChange={(e) => setSubtractAmount(e.target.value)}
                className="flex-1 p-2 bg-gray-700 text-white"
                placeholder="Subtract amount"
              />
              <button onClick={handleSubtractFunds} className="bg-red-500 px-4">
                Subtract
              </button>
            </div>

            {error && <div className="mt-4 text-red-400">{error}</div>}
          </div>

          {/* SIMULATION */}
          <div className="bg-slate-800 text-white rounded-xl p-6">
            <h2 className="text-xl mb-4">🎯 Simulation</h2>

            <p className="mb-4">
              Status: <span className={simulationRunning ? 'text-green-400' : 'text-red-400'}>
                {simulationRunning ? 'Running' : 'Stopped'}
              </span>
            </p>

            <button
              onClick={toggleSimulation}
              className={`px-6 py-2 ${
                simulationRunning ? 'bg-red-500' : 'bg-green-500'
              }`}
            >
              {simulationRunning ? 'Stop' : 'Start'}
            </button>
          </div>

        </div>

        {/* RIGHT COLUMN — 🔥 PDC PERFORMANCE */}
        <div className="bg-slate-800 text-white rounded-xl p-6">
          <h2 className="text-xl mb-4">⚡ Parallel Performance</h2>

          <p className="mb-2">
            Status:{' '}
            <span className={performanceRunning ? 'text-green-400' : 'text-red-400'}>
              {performanceRunning ? 'Running' : 'Stopped'}
            </span>
          </p>

          <div className="space-y-2 text-sm">
            <p>📊 Avg Confidence: <span className="text-green-400">{avgConfidence}%</span></p>
            <p>⏱ Computation Time: <span className="text-blue-400">{computationTime} ms</span></p>
            <p>📈 Stocks Processed: <span className="text-yellow-400">{stocksProcessed}</span></p>
          </div>

          <button
            onClick={togglePerformance}
            className={`mt-6 px-6 py-2 w-full ${
              performanceRunning ? 'bg-red-500' : 'bg-green-500'
            }`}
          >
            {performanceRunning ? 'Stop' : 'Start'}
          </button>
        </div>

      </div>
    </div>
  );
}