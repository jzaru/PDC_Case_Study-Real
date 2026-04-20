import React, { useEffect, useState } from 'react';
import { balanceApi, simulationApi, stockApi, performanceApi } from '../services/api';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';

export default function SettingsPage() {
  const [balance, setBalance] = useState(0);
  const [addAmount, setAddAmount] = useState('');
  const [subtractAmount, setSubtractAmount] = useState('');
  const [simulationRunning, setSimulationRunning] = useState(false);
  const [loading, setLoading] = useState(true);

  const [performanceRunning, setPerformanceRunning] = useState(false);
  const [avgConfidence, setAvgConfidence] = useState(0);
  const [computationTime, setComputationTime] = useState(0);
  const [stocksProcessed, setStocksProcessed] = useState(0);

  const [workers, setWorkers] = useState(8);
  const [graphData, setGraphData] = useState([]);

  const [showPopup, setShowPopup] = useState(false);

  // 🔥 NEW
  const [trainingTime, setTrainingTime] = useState(0);
  const [trainingMode, setTrainingMode] = useState("FAST");
  // 🔥 NEW: Training Loading State
  const [trainingLoading, setTrainingLoading] = useState(false);

  useEffect(() => {
    fetchAll();
    fetchWorkers();
    fetchMLStats();
    fetchTrainingMode(); // 🔥 NEW
  }, []);

  const fetchAll = async () => {
    const [balanceData, simData] = await Promise.all([
      balanceApi.getBalance(),
      simulationApi.getSimulationStatus()
    ]);

    setBalance(balanceData.balance ?? 0);
    setSimulationRunning(simData.running ?? false);
    setLoading(false);
  };

  const fetchWorkers = async () => {
    const data = await performanceApi.getWorkers();
    setWorkers(data.workers);
  };

  // 🔥 NEW FUNCTION
  const fetchMLStats = async () => {
      try {
        const data = await performanceApi.getMLStats();
        setTrainingTime(data.training_time ?? 0);
      } catch (err) {
        console.error('ML stats error:', err);
      }
    };

    const fetchTrainingMode = async () => {
    try {
      const data = await performanceApi.getTrainingMode();
      setTrainingMode(data.mode);
      setTrainingTime(data.training_time);
    } catch (err) {
      console.error('Training mode error:', err);
    }
  };

  // 🔥 NEW: Training mode handler with loading state
  const setMode = async (mode) => {
    setTrainingLoading(true);
    try {
      const res = await performanceApi.setTrainingMode(mode);

      setTrainingMode(res.mode);
      setTrainingTime(res.training_time);

      setShowPopup(true);
      setTimeout(() => setShowPopup(false), 2000);
    } catch (err) {
      console.error('Training mode error:', err);
    } finally {
      setTrainingLoading(false);
    }
  };


  // ========================
  // PERFORMANCE
  // ========================
  const runPerformanceTest = async () => {
    const start = performance.now();
    const data = await stockApi.getAllStocks();
    const end = performance.now();

    const avg = data.reduce((s, x) => s + (x.confidence || 0), 0) / data.length;

    setAvgConfidence(avg.toFixed(2));
    setComputationTime((end - start).toFixed(2));
    setStocksProcessed(data.length);
  };

  const togglePerformance = async () => {
    setPerformanceRunning(!performanceRunning);
    await runPerformanceTest();
  };

  const runWorkerBenchmark = async () => {
    const testWorkers = [1, 2, 4, 6, 8];
    const results = [];

    for (let w of testWorkers) {
      await performanceApi.setWorkers(w);

      const start = performance.now();
      await stockApi.getAllStocks();
      const end = performance.now();

      results.push({
        workers: w,
        time: Number((end - start).toFixed(2))
      });
    }

    setGraphData(results);
  };

  const applyWorkers = async () => {
    await performanceApi.setWorkers(Number(workers));
    await runPerformanceTest();

    setShowPopup(true);

    setTimeout(() => {
      setShowPopup(false);
    }, 2000);
  };

  // ========================
  // BALANCE
  // ========================
  const handleAddFunds = async () => {
    const result = await balanceApi.addBalance(parseFloat(addAmount));
    setBalance(result.balance);
    setAddAmount('');
  };

  const handleSubtractFunds = async () => {
    const result = await balanceApi.subtractBalance(parseFloat(subtractAmount));
    setBalance(result.balance);
    setSubtractAmount('');
  };

  // ========================
  // SIMULATION
  // ========================
  const toggleSimulation = async () => {
    if (simulationRunning) await simulationApi.stopSimulation();
    else await simulationApi.startSimulation();

    const updated = await simulationApi.getSimulationStatus();
    setSimulationRunning(updated.running);
  };

  if (loading) return <div className="p-6 text-white">Loading...</div>;

  return (
    <div className="max-w-6xl mx-auto p-6 text-white">
      <h1 className="text-4xl font-bold text-center mb-10 tracking-wide">
        ⚙️ Settings Dashboard
      </h1>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        {/* LEFT */}
        <div className="space-y-6">

          {/* BALANCE CARD */}
          <div className="bg-gradient-to-br from-slate-800 to-slate-900 p-6 rounded-2xl shadow-xl hover:scale-[1.02] transition">
            <h2 className="text-xl mb-4">💰 Balance</h2>

            <p className="text-4xl text-green-400 mb-6 font-bold animate-pulse">
              ${balance.toFixed(2)}
            </p>

            <div className="flex gap-2 mb-4">
              <input
                type="number"
                inputMode="numeric"
                pattern="[0-9]*"
                value={addAmount}
                onChange={(e) => setAddAmount(e.target.value)}
                className="flex-1 p-2 bg-gray-700"
                placeholder="Amount"
              />
              <button
                onClick={handleAddFunds}
                className="bg-green-500 px-4 rounded-lg hover:scale-110 active:scale-95 transition"
              >
                Add
              </button>
            </div>

            <div className="flex gap-2">
              <input
                type="number"
                inputMode="numeric"
                pattern="[0-9]*"
                value={subtractAmount}
                onChange={(e) => setSubtractAmount(e.target.value)}
                className="flex-1 p-2 bg-gray-700 rounded-lg focus:ring-2 focus:ring-red-500"
                placeholder="Amount"
              />
              <button
                onClick={handleSubtractFunds}
                className="bg-red-500 px-4 rounded-lg hover:scale-110 active:scale-95 transition"
              >
                Subtract
              </button>
            </div>
          </div>

          {/* SIMULATION CARD */}
          <div className="bg-gradient-to-br from-slate-800 to-slate-900 p-6 rounded-2xl shadow-xl hover:scale-[1.02] transition">
            <h2 className="text-xl mb-4">🎯 Simulation</h2>

            <button
              onClick={toggleSimulation}
              className={`px-6 py-2 rounded-lg transition transform active:scale-95 hover:scale-105 ${
                simulationRunning ? 'bg-red-500' : 'bg-green-500'
              }`}
            >
              {simulationRunning ? 'Stop Simulation' : 'Start Simulation'}
            </button>
          </div>

        </div>

        {/* RIGHT */}
        <div className="bg-gradient-to-br from-slate-800 to-slate-900 p-6 rounded-2xl shadow-xl hover:scale-[1.02] transition">

          <h2 className="text-xl mb-4">⚡ Parallel Performance</h2>


          {/* 🔥 TRAINING MODE */}
          <div className="mb-4">
            <p className="mb-2">🧠 Training Mode</p>

            <div className="flex gap-2">
              <button
                onClick={() => setMode("FAST")}
                disabled={trainingLoading}
                className={`px-4 py-2 rounded-lg transition ${
                  trainingMode === "FAST"
                    ? "bg-green-500 scale-105"
                    : "bg-gray-600 hover:scale-105"
                } ${
                  trainingLoading ? "opacity-50 cursor-not-allowed" : ""
                }`}
              >
                {trainingLoading && trainingMode === "FAST" ? "Training..." : "FAST ⚡"}
              </button>

              <button
                onClick={() => setMode("FULL")}
                disabled={trainingLoading}
                className={`px-4 py-2 rounded-lg transition ${
                  trainingMode === "FULL"
                    ? "bg-purple-500 scale-105"
                    : "bg-gray-600 hover:scale-105"
                } ${
                  trainingLoading ? "opacity-50 cursor-not-allowed" : ""
                }`}
              >
                {trainingLoading && trainingMode === "FULL" ? "Training..." : "FULL 🧠"}
              </button>
            </div>

            {/* 🔥 NEW: Training Loading Feedback */}
            {trainingLoading && (
              <div className="mt-3 flex items-center gap-2 text-blue-400 animate-pulse">
                <div className="w-4 h-4 border-2 border-blue-400 border-t-transparent rounded-full animate-spin"></div>
                <span>⚙️ Training model... please wait</span>
              </div>
            )}
          </div>      

          {/* WORKER CONTROL UI */}
          <div className="mb-4">

            <div className="flex items-center justify-between bg-gray-800 p-3 rounded-xl">

              <button
                onClick={() => setWorkers(prev => Math.max(1, Number(prev) - 1))}
                className="bg-gray-700 px-3 py-1 rounded-lg hover:scale-110 active:scale-95 transition"
              >
                ◀
              </button>

              <div className="flex items-center justify-center w-12 h-12 rounded-full bg-blue-500 text-white font-bold text-lg shadow-lg">
                {workers}
              </div>

              <button
                onClick={() => setWorkers(prev => Number(prev) + 1)}
                className="bg-gray-700 px-3 py-1 rounded-lg hover:scale-110 active:scale-95 transition"
              >
                ▶
              </button>

            </div>

            <button
              onClick={applyWorkers}
              disabled={trainingLoading}
              className={`mt-3 bg-blue-500 w-full py-2 rounded-lg hover:scale-105 active:scale-95 transition ${
                trainingLoading ? "opacity-50 cursor-not-allowed" : ""
              }`}
            >
              Apply Workers
            </button>

          </div>

          {/* STATS */}
          <div className="mt-4 space-y-2 text-sm">
            <p>📊 Confidence: <span className="text-green-400">{avgConfidence}%</span></p>
            <p>⏱ Time: <span className="text-blue-400">{computationTime} ms</span></p>
            <p>📈 Stocks: <span className="text-yellow-400">{stocksProcessed}</span></p>

            {/* 🔥 NEW LINE */}
            <p>🧠 Training Time: <span className="text-purple-400">{trainingTime}s</span></p>
            <p>⚙ Mode: <span className="text-blue-400">{trainingMode}</span></p>
          </div>

          <button
            onClick={togglePerformance}
            disabled={trainingLoading}
            className={`bg-green-500 w-full py-2 rounded-lg mt-4 hover:scale-105 active:scale-95 transition ${
              trainingLoading ? "opacity-50 cursor-not-allowed" : ""
            }`}
          >
            Run Live Test
          </button>

          <button
            onClick={runWorkerBenchmark}
            disabled={trainingLoading}
            className={`bg-purple-500 w-full py-2 rounded-lg mt-2 hover:scale-105 active:scale-95 transition ${
              trainingLoading ? "opacity-50 cursor-not-allowed" : ""
            }`}
          >
            Run Benchmark
          </button>

          {/* GRAPH */}
          {graphData.length > 0 && (
            <div className="mt-6">
              <ResponsiveContainer width="100%" height={250}>
                <LineChart data={graphData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="workers" />
                  <YAxis />
                  <Tooltip />
                  <Line type="monotone" dataKey="time" stroke="#22c55e" strokeWidth={3} dot />
                </LineChart>
              </ResponsiveContainer>
            </div>
          )}

        </div>

      </div>

      {/* POPUP */}
      {showPopup && (
        <div className="fixed bottom-6 right-6 bg-green-500 text-white px-6 py-3 rounded-xl shadow-lg animate-bounce">
          ✅ {workers} Workers Applied
        </div>
      )}

    </div>
  );
}