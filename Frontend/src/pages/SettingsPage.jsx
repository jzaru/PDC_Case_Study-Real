import React, { useEffect, useState } from 'react';
import { balanceApi, simulationApi } from '../services/api';

export default function SettingsPage() {
  const [balance, setBalance] = useState(0);
  const [addAmount, setAddAmount] = useState('');
  const [subtractAmount, setSubtractAmount] = useState('');
  const [simulationRunning, setSimulationRunning] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

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
  // BALANCE FIXED
  // ========================

  const handleAddFunds = async () => {
    const amount = parseFloat(addAmount);

    if (isNaN(amount) || amount <= 0) {
      setError('Enter valid amount');
      return;
    }

    try {
      const result = await balanceApi.addBalance(amount);

      if (result.success) {
        setBalance(result.balance); // 🔥 FIXED
        setAddAmount('');
        setError(null);
      } else {
        setError(result.message || 'Failed to add funds');
      }
    } catch (err) {
      console.error(err);
      setError(err?.response?.data?.detail || 'Failed to add funds');
    }
  };

  const handleSubtractFunds = async () => {
    const amount = parseFloat(subtractAmount);

    if (isNaN(amount) || amount <= 0) {
      setError('Enter valid amount');
      return;
    }

    if (amount > balance) {
      setError('Insufficient balance');
      return;
    }

    try {
      const result = await balanceApi.subtractBalance(amount);

      if (result.success) {
        setBalance(result.balance); // 🔥 FIXED
        setSubtractAmount('');
        setError(null);
      } else {
        setError(result.message || 'Failed to subtract funds');
      }
    } catch (err) {
      console.error(err);
      setError(err?.response?.data?.detail || 'Failed to subtract funds');
    }
  };

  // ========================
  // SIMULATION FIXED
  // ========================

  const toggleSimulation = async () => {
    try {
      if (simulationRunning) {
        await simulationApi.stopSimulation();
      } else {
        await simulationApi.startSimulation();
      }

      // 🔥 ALWAYS REFRESH REAL STATE
      const updated = await simulationApi.getSimulationStatus();
      setSimulationRunning(updated.running);

    } catch (err) {
      console.error(err);
      setError(err?.response?.data?.detail || 'Simulation error');
    }
  };

  if (loading) {
    return <div className="p-6 text-white">Loading...</div>;
  }

  return (
    <div className="max-w-xl mx-auto p-6">
      <h1 className="text-3xl font-bold text-white mb-8 text-center">⚙️ Settings</h1>

      {/* BALANCE */}
      <div className="bg-slate-800 text-white rounded-xl p-6 mb-6">
        <h2 className="text-xl mb-4">💰 Balance</h2>

        <p className="text-3xl text-green-400 mb-6">
          ${balance.toFixed(2)}
        </p>

        {/* ADD */}
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

        {/* SUBTRACT */}
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

        {error && (
          <div className="mt-4 text-red-400">{error}</div>
        )}
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
  );
}