import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { 
  Subtitles, AlertTriangle, ShieldCheck, Hammer, Activity, Wrench, ArrowUpRight
} from "lucide-react";
import API from "../services/api";
import MetricCard from "../components/MetricCard";
import StatusIndicator from "../components/StatusIndicator";
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  AreaChart, Area 
} from "recharts";

const Dashboard = () => {
  const [substations, setSubstations] = useState([]);
  const [alerts, setAlerts] = useState([]);
  const [tickets, setTickets] = useState([]);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchData = async () => {
    try {
      const [subsRes, alertsRes, ticketsRes, historyRes] = await Promise.all([
        API.get("/substations"),
        API.get("/alerts"),
        API.get("/tickets"),
        API.get("/repair-history"),
      ]);

      setSubstations(subsRes.data);
      setAlerts(alertsRes.data);
      setTickets(ticketsRes.data);
      setHistory(historyRes.data);
      setError("");
    } catch (err) {
      console.error("Error fetching dashboard statistics:", err);
      setError("Failed to fetch live grid metrics.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    
    const interval = setInterval(fetchData, 5000);
    return () => clearInterval(interval);
  }, []);

  
  const totalGrids = substations.length;
  const healthyGrids = substations.filter(s => s.status === "HEALTHY").length;
  const warningGrids = substations.filter(s => s.status === "WARNING").length;
  const faultyGrids = substations.filter(s => s.status === "FAULT").length;

  const activeAlertsCount = alerts.filter(a => a.status === "ACTIVE").length;
  const openTicketsCount = tickets.filter(t => t.status !== "COMPLETED").length;
  const completedRepairsCount = history.length;

  
  const capacityChartData = substations.map(s => ({
    name: s.name.replace(" Substation", "").replace(" Grid", ""),
    Capacity: s.maxCapacityKw,
    Health: s.status === "HEALTHY" ? 100 : s.status === "WARNING" ? 50 : 10,
  }));

  
  
  const repairChartData = [
    { month: "Jan", Repairs: 1 },
    { month: "Feb", Repairs: 2 },
    { month: "Mar", Repairs: 1 },
    { month: "Apr", Repairs: 3 },
    { month: "May", Repairs: 2 },
    { month: "Jun", Repairs: 4 },
    { month: "Jul", Repairs: completedRepairsCount || 3 },
  ];

  if (loading && substations.length === 0) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-10 w-48 bg-slate-800 rounded-lg" />
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-5">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="h-28 bg-slate-800 rounded-2xl" />
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="h-80 bg-slate-800 rounded-2xl" />
          <div className="h-80 bg-slate-800 rounded-2xl" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="font-outfit text-3xl font-bold tracking-tight text-white">Smart Grid Operations</h1>
          <p className="text-slate-400 text-sm mt-1">Live municipal distribution telemetry, anomaly logs, and AI diagnoses.</p>
        </div>
        <div className="flex items-center gap-3">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping" />
          <span className="text-xs font-semibold text-emerald-400 uppercase tracking-widest">
            Live Stream Feed Active
          </span>
        </div>
      </div>

      {error && (
        <div className="p-4 bg-red-500/10 border border-red-500/25 rounded-2xl text-sm text-red-400">
          {error}
        </div>
      )}

      {}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-5">
        <MetricCard 
          title="Total Grids" 
          value={totalGrids} 
          icon={Activity} 
          description="Monitored Nodes" 
        />
        <MetricCard 
          title="Healthy Grids" 
          value={healthyGrids} 
          icon={ShieldCheck} 
          description="Operating Nominal" 
          trendType="up"
        />
        <MetricCard 
          title="Faulty Grids" 
          value={faultyGrids + warningGrids} 
          icon={AlertTriangle} 
          description="Offlines & Faults" 
          trend={faultyGrids > 0 ? `${faultyGrids} Fault` : ""}
          trendType={faultyGrids > 0 ? "down" : "neutral"}
        />
        <MetricCard 
          title="Active Alerts" 
          value={activeAlertsCount} 
          icon={AlertTriangle} 
          description="Requires Review" 
          trendType={activeAlertsCount > 0 ? "down" : "neutral"}
        />
        <MetricCard 
          title="Open Tickets" 
          value={openTicketsCount} 
          icon={Wrench} 
          description="Repair Dispatch" 
        />
        <MetricCard 
          title="Completed Repairs" 
          value={completedRepairsCount} 
          icon={Hammer} 
          description="Lifetime Resolved" 
          trendType="up"
        />
      </div>

      {}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {}
        <div className="glass-panel p-6">
          <h2 className="font-outfit text-lg font-semibold text-slate-200 mb-5">Substation Grid Capacities (kW)</h2>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={capacityChartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#222f4d" />
                <XAxis dataKey="name" stroke="#64748b" fontSize={11} />
                <YAxis stroke="#64748b" fontSize={11} />
                <Tooltip 
                  contentStyle={{ backgroundColor: "#151d30", borderColor: "#222f4d", color: "#f1f5f9" }}
                />
                <Bar dataKey="Capacity" fill="#3b82f6" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {}
        <div className="glass-panel p-6">
          <h2 className="font-outfit text-lg font-semibold text-slate-200 mb-5">Monthly Repair Completions Trend</h2>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={repairChartData}>
                <defs>
                  <linearGradient id="colorRepairs" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#222f4d" />
                <XAxis dataKey="month" stroke="#64748b" fontSize={11} />
                <YAxis stroke="#64748b" fontSize={11} />
                <Tooltip 
                  contentStyle={{ backgroundColor: "#151d30", borderColor: "#222f4d", color: "#f1f5f9" }}
                />
                <Area type="monotone" dataKey="Repairs" stroke="#10b981" fillOpacity={1} fill="url(#colorRepairs)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {}
        <div className="glass-panel p-6 xl:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="font-outfit text-lg font-semibold text-slate-200">Grid Substation Status</h2>
            <Link to="/heatmap" className="text-brandBlue hover:text-blue-400 text-xs font-semibold flex items-center gap-1">
              View Heatmap <ArrowUpRight size={14} />
            </Link>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-300">
              <thead>
                <tr className="border-b border-cardBorder text-slate-400 text-xs uppercase font-semibold">
                  <th className="py-3 px-4">Substation</th>
                  <th className="py-3 px-4">Location</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Max Capacity</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-cardBorder/50">
                {substations.map(sub => (
                  <tr key={sub.id} className="hover:bg-slate-800/20 transition-all">
                    <td className="py-3 px-4 font-semibold text-slate-100">{sub.name}</td>
                    <td className="py-3 px-4 text-xs text-slate-400 truncate max-w-[200px]">{sub.location}</td>
                    <td className="py-3 px-4">
                      <StatusIndicator status={sub.status} />
                    </td>
                    <td className="py-3 px-4 text-right font-outfit font-medium">{sub.maxCapacityKw} kW</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {}
        <div className="glass-panel p-6 space-y-4">
          <h2 className="font-outfit text-lg font-semibold text-slate-200">Active Alert Log</h2>
          <div className="space-y-3.5 max-h-[300px] overflow-y-auto pr-1">
            {alerts.filter(a => a.status === "ACTIVE").length === 0 ? (
              <div className="text-center py-10 text-slate-500 text-sm">
                No active grid alerts detected. All systems operating within thresholds.
              </div>
            ) : (
              alerts.filter(a => a.status === "ACTIVE").map(alert => (
                <div key={alert.id} className="p-3.5 rounded-xl border border-red-500/10 bg-red-500/5 flex items-start gap-3">
                  <div className="bg-red-500/10 p-2 rounded-lg text-red-400 mt-0.5">
                    <AlertTriangle size={15} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-semibold text-xs text-slate-200 truncate">{alert.substationName}</span>
                      <span className="text-[10px] font-bold text-red-400 bg-red-500/10 px-2 py-0.5 rounded-full uppercase">
                        {alert.severity}
                      </span>
                    </div>
                    <p className="text-xs text-slate-400 mt-1 line-clamp-2">{alert.message}</p>
                    <span className="text-[10px] text-slate-500 block mt-1.5">
                      {new Date(alert.timestamp).toLocaleTimeString()}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
