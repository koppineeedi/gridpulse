import React, { useState, useEffect } from "react";
import { 
  Activity, ActivityIcon, RefreshCw, Zap, Gauge, Thermometer, Radio, Sparkles, AlertCircle
} from "lucide-react";
import API from "../services/api";
import MetricCard from "../components/MetricCard";
import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer 
} from "recharts";

const LiveMonitor = () => {
  const [substations, setSubstations] = useState([]);
  const [selectedSubId, setSelectedSubId] = useState("");
  const [liveData, setLiveData] = useState(null);
  const [historyData, setHistoryData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [simulateType, setSimulateType] = useState("VOLTAGE_SAG");
  const [simulateMsg, setSimulateMsg] = useState("");

  const fetchSubstations = async () => {
    try {
      const res = await API.get("/substations");
      setSubstations(res.data);
      if (res.data.length > 0 && !selectedSubId) {
        setSelectedSubId(res.data[0].id.toString());
      }
    } catch (err) {
      console.error("Error fetching substations list", err);
    }
  };

  const fetchTelemetry = async () => {
    if (!selectedSubId) return;

    try {
      
      const liveRes = await API.get("/telemetry/live");
      const subLive = liveRes.data.find(t => t.substationId.toString() === selectedSubId);
      if (subLive) {
        setLiveData(subLive);
      }

      
      const histRes = await API.get(`/telemetry/grid/${selectedSubId}`);
      
      
      const formattedHist = histRes.data.map(h => ({
        ...h,
        time: new Date(h.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })
      }));
      setHistoryData(formattedHist);
    } catch (err) {
      console.error("Error fetching telemetry details", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSubstations();
  }, []);

  useEffect(() => {
    if (selectedSubId) {
      setLoading(true);
      fetchTelemetry();
      const interval = setInterval(fetchTelemetry, 5000);
      return () => clearInterval(interval);
    }
  }, [selectedSubId]);

  const handleSimulate = async () => {
    if (!selectedSubId) return;
    setSimulateMsg("");

    try {
      const res = await API.post(`/telemetry/simulate-anomaly/${selectedSubId}?type=${simulateType}`);
      setSimulateMsg(`Success! Injected ${simulateType.replace("_", " ")} anomaly. Watch telemetry spike in next 5s.`);
      setTimeout(() => setSimulateMsg(""), 5000);
    } catch (err) {
      console.error("Simulation trigger failed", err);
      setSimulateMsg("Failed to inject simulation anomaly.");
    }
  };

  const selectedSub = substations.find(s => s.id.toString() === selectedSubId);

  
  const getVoltageColor = (v) => v < 170 ? "text-red-400" : v > 250 ? "text-amber-400" : "text-emerald-400";
  const getCurrentColor = (c) => c > 30 ? "text-red-400" : c > 20 ? "text-amber-400" : "text-emerald-400";
  const getTempColor = (t) => t > 75 ? "text-red-400" : t > 60 ? "text-amber-400" : "text-emerald-400";

  return (
    <div className="space-y-8">
      {}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="font-outfit text-3xl font-bold tracking-tight text-white">Live Grid Telemetry</h1>
          <p className="text-slate-400 text-sm mt-1">High-frequency sub-station feed capturing electrical fluctuations.</p>
        </div>
        <div className="flex items-center gap-3">
          <label className="text-sm font-semibold text-slate-400" htmlFor="substation-select">Select Grid Node:</label>
          <select
            id="substation-select"
            value={selectedSubId}
            onChange={(e) => setSelectedSubId(e.target.value)}
            className="bg-cardBg border border-cardBorder text-sm text-slate-300 rounded-xl px-4 py-2 focus:outline-none focus:border-brandBlue cursor-pointer"
          >
            {substations.map(s => (
              <option key={s.id} value={s.id}>{s.name}</option>
            ))}
          </select>
        </div>
      </div>

      {selectedSub && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {}
          <div className="glass-panel p-6 lg:col-span-2 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <span className="text-xs text-slate-500 font-bold uppercase tracking-wider block">Grid Node Details</span>
              <h2 className="text-2xl font-bold font-outfit text-white mt-1">{selectedSub.name}</h2>
              <p className="text-sm text-slate-400 mt-1">{selectedSub.location}</p>
            </div>
            <div className="text-right">
              <span className="text-xs text-slate-500 font-bold uppercase tracking-wider block">Health Index</span>
              <span className={`inline-block text-sm font-bold mt-1.5 px-3 py-1 rounded-full uppercase ${
                selectedSub.status === "HEALTHY" ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/25" :
                selectedSub.status === "WARNING" ? "bg-amber-500/10 text-amber-400 border border-amber-500/25" :
                "bg-red-500/10 text-red-400 border border-red-500/25 animate-pulse"
              }`}>
                {selectedSub.status}
              </span>
            </div>
          </div>

          {}
          <div className="glass-panel p-6 border-dashed border-cardBorder">
            <h3 className="font-outfit text-sm font-bold text-slate-300 flex items-center gap-1.5 mb-3.5">
              <Sparkles size={16} className="text-brandAmber" />
              Manual Anomaly Injector
            </h3>
            <div className="flex gap-2">
              <select
                value={simulateType}
                onChange={(e) => setSimulateType(e.target.value)}
                className="flex-1 bg-slate-900 border border-cardBorder text-xs text-slate-300 rounded-xl px-3 py-2 focus:outline-none"
              >
                <option value="VOLTAGE_SAG">Voltage Sag (Low V)</option>
                <option value="OVERCURRENT">Overcurrent (High A)</option>
                <option value="OVERHEATING">Overheating (High T)</option>
              </select>
              <button
                onClick={handleSimulate}
                className="bg-brandAmber hover:bg-amber-600 text-slate-950 text-xs font-bold px-4 py-2.5 rounded-xl transition-all shadow-md shadow-brandAmber/10 flex items-center gap-1"
              >
                Inject
              </button>
            </div>
            {simulateMsg && (
              <p className="text-[10px] text-brandAmber mt-2.5 flex items-start gap-1 font-semibold">
                <AlertCircle size={12} className="mt-0.5" />
                <span>{simulateMsg}</span>
              </p>
            )}
          </div>
        </div>
      )}

      {liveData && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-5">
          <div className="glass-panel p-6 space-y-2">
            <span className="text-xs text-slate-400 font-semibold block">Grid Voltage</span>
            <div className="flex items-baseline gap-1">
              <span className={`text-3xl font-bold font-outfit ${getVoltageColor(liveData.voltage)}`}>{liveData.voltage}</span>
              <span className="text-xs text-slate-400">V</span>
            </div>
            <p className="text-[10px] text-slate-500">Normal Range: 220V - 240V</p>
          </div>

          <div className="glass-panel p-6 space-y-2">
            <span className="text-xs text-slate-400 font-semibold block">Feeder Current</span>
            <div className="flex items-baseline gap-1">
              <span className={`text-3xl font-bold font-outfit ${getCurrentColor(liveData.current)}`}>{liveData.current}</span>
              <span className="text-xs text-slate-400">A</span>
            </div>
            <p className="text-[10px] text-slate-500">Normal Range: 5A - 20A</p>
          </div>

          <div className="glass-panel p-6 space-y-2">
            <span className="text-xs text-slate-400 font-semibold block">Total Power Load</span>
            <div className="flex items-baseline gap-1">
              <span className="text-3xl font-bold font-outfit text-brandBlue">{liveData.power}</span>
              <span className="text-xs text-slate-400">kW</span>
            </div>
            <p className="text-[10px] text-slate-500">Peak Capacity: {selectedSub?.maxCapacityKw} kW</p>
          </div>

          <div className="glass-panel p-6 space-y-2">
            <span className="text-xs text-slate-400 font-semibold block">Core Temperature</span>
            <div className="flex items-baseline gap-1">
              <span className={`text-3xl font-bold font-outfit ${getTempColor(liveData.temperature)}`}>{liveData.temperature}</span>
              <span className="text-xs text-slate-400">°C</span>
            </div>
            <p className="text-[10px] text-slate-500">Safety Cap: 75 °C</p>
          </div>

          <div className="glass-panel p-6 space-y-2">
            <span className="text-xs text-slate-400 font-semibold block">Grid Frequency</span>
            <div className="flex items-baseline gap-1">
              <span className="text-3xl font-bold font-outfit text-slate-200">{liveData.frequency}</span>
              <span className="text-xs text-slate-400">Hz</span>
            </div>
            <p className="text-[10px] text-slate-500">Stabilised Range: 50.0 Hz</p>
          </div>
        </div>
      )}

      {}
      {historyData.length > 0 && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {}
          <div className="glass-panel p-6 lg:col-span-2 space-y-4">
            <h3 className="font-outfit text-base font-semibold text-slate-200">Voltage & Current Historical Trend</h3>
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={historyData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#222f4d" />
                  <XAxis dataKey="time" stroke="#64748b" fontSize={10} />
                  <YAxis yAxisId="left" stroke="#3b82f6" fontSize={10} label={{ value: 'Voltage (V)', angle: -90, position: 'insideLeft', style: { fill: '#3b82f6' } }} />
                  <YAxis yAxisId="right" orientation="right" stroke="#e11d48" fontSize={10} label={{ value: 'Current (A)', angle: 90, position: 'insideRight', style: { fill: '#e11d48' } }} />
                  <Tooltip contentStyle={{ backgroundColor: "#151d30", borderColor: "#222f4d", color: "#f1f5f9" }} />
                  <Legend verticalAlign="top" height={36} />
                  <Line yAxisId="left" type="monotone" dataKey="voltage" stroke="#3b82f6" strokeWidth={2} dot={false} name="Voltage (V)" />
                  <Line yAxisId="right" type="monotone" dataKey="current" stroke="#e11d48" strokeWidth={2} dot={false} name="Current (A)" />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          {}
          <div className="glass-panel p-6 space-y-4">
            <h3 className="font-outfit text-base font-semibold text-slate-200">Core Temperature Trend (°C)</h3>
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={historyData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#222f4d" />
                  <XAxis dataKey="time" stroke="#64748b" fontSize={10} />
                  <YAxis stroke="#f59e0b" fontSize={10} />
                  <Tooltip contentStyle={{ backgroundColor: "#151d30", borderColor: "#222f4d", color: "#f1f5f9" }} />
                  <Line type="monotone" dataKey="temperature" stroke="#f59e0b" strokeWidth={2} dot={false} name="Temperature" />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default LiveMonitor;
