import React, { useState, useEffect } from "react";
import { 
  AlertTriangle, CheckCircle, Eye, EyeOff, Filter, RefreshCw
} from "lucide-react";
import API from "../services/api";
import StatusIndicator from "../components/StatusIndicator";

const AlertsPage = () => {
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [severityFilter, setSeverityFilter] = useState("ALL");
  const [actionMsg, setActionMsg] = useState("");

  const fetchAlerts = async () => {
    try {
      const res = await API.get("/alerts");
      setAlerts(res.data);
    } catch (err) {
      console.error("Error fetching alerts log:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAlerts();
    const interval = setInterval(fetchAlerts, 10000); 
    return () => clearInterval(interval);
  }, []);

  const handleUpdateStatus = async (alertId, newStatus) => {
    try {
      await API.put(`/alerts/${alertId}`, { status: newStatus });
      setActionMsg(`Alert status updated to ${newStatus}.`);
      fetchAlerts();
      setTimeout(() => setActionMsg(""), 4000);
    } catch (err) {
      console.error("Error updating alert status", err);
      setActionMsg("Failed to update status.");
    }
  };

  const filteredAlerts = alerts.filter(alert => {
    const matchStatus = statusFilter === "ALL" || alert.status === statusFilter;
    const matchSeverity = severityFilter === "ALL" || alert.severity === severityFilter;
    return matchStatus && matchSeverity;
  });

  const getSeverityBadge = (sev) => {
    return sev === "CRITICAL" 
      ? "bg-red-500/10 text-red-400 border border-red-500/25"
      : "bg-amber-500/10 text-amber-400 border border-amber-500/25";
  };

  return (
    <div className="space-y-6">
      {}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-outfit text-3xl font-bold tracking-tight text-white">Active Grid Alerts</h1>
          <p className="text-slate-400 text-sm mt-1">Manage, acknowledge, and resolve active grid telemetry threshold alerts.</p>
        </div>
        <button 
          onClick={fetchAlerts}
          className="self-start bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold px-3 py-2 rounded-xl border border-slate-700/60 flex items-center gap-1.5 transition-all"
        >
          <RefreshCw size={14} /> Refresh
        </button>
      </div>

      {actionMsg && (
        <div className="p-3 bg-brandBlue/10 border border-brandBlue/20 rounded-xl text-xs text-brandBlue font-semibold">
          {actionMsg}
        </div>
      )}

      {}
      <div className="glass-panel p-4 flex flex-wrap gap-4 items-center">
        <div className="flex items-center gap-2 text-slate-400 text-xs font-bold uppercase">
          <Filter size={14} /> Filters:
        </div>
        
        <div className="flex items-center gap-2">
          <label className="text-xs text-slate-400 font-semibold" htmlFor="status-filter">Status:</label>
          <select
            id="status-filter"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-slate-900 border border-cardBorder text-xs text-slate-300 rounded-lg px-3 py-1.5 focus:outline-none"
          >
            <option value="ALL">All Statuses</option>
            <option value="ACTIVE">Active</option>
            <option value="ACKNOWLEDGED">Acknowledged</option>
            <option value="RESOLVED">Resolved</option>
          </select>
        </div>

        <div className="flex items-center gap-2">
          <label className="text-xs text-slate-400 font-semibold" htmlFor="severity-filter">Severity:</label>
          <select
            id="severity-filter"
            value={severityFilter}
            onChange={(e) => setSeverityFilter(e.target.value)}
            className="bg-slate-900 border border-cardBorder text-xs text-slate-300 rounded-lg px-3 py-1.5 focus:outline-none"
          >
            <option value="ALL">All Severities</option>
            <option value="CRITICAL">Critical Only</option>
            <option value="WARNING">Warning Only</option>
          </select>
        </div>
      </div>

      {}
      <div className="glass-panel p-6">
        {loading ? (
          <div className="text-center py-10 text-slate-500">Loading alerts logs...</div>
        ) : filteredAlerts.length === 0 ? (
          <div className="text-center py-12 text-slate-500">No alerts found matching the selected filters.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-300">
              <thead>
                <tr className="border-b border-cardBorder text-slate-400 text-xs uppercase font-semibold">
                  <th className="py-3 px-4">Alert ID</th>
                  <th className="py-3 px-4">Substation</th>
                  <th className="py-3 px-4">Telemetry Metrics</th>
                  <th className="py-3 px-4">Severity</th>
                  <th className="py-3 px-4">Timestamp</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-cardBorder/50">
                {filteredAlerts.map(alert => (
                  <tr key={alert.id} className="hover:bg-slate-800/10 transition-all">
                    <td className="py-4 px-4 font-semibold font-outfit text-slate-400">#ALT-{alert.id}</td>
                    <td className="py-4 px-4 font-bold text-slate-200">{alert.substationName}</td>
                    <td className="py-4 px-4 text-xs text-slate-300 space-y-0.5">
                      <p className="line-clamp-1">{alert.message}</p>
                      <p className="text-[10px] text-slate-500 font-semibold">
                        V: {alert.voltage}V | I: {alert.current}A | T: {alert.temperature}°C | F: {alert.frequency}Hz
                      </p>
                    </td>
                    <td className="py-4 px-4">
                      <span className={`inline-block text-[10px] font-extrabold px-2.5 py-0.5 rounded-full uppercase ${getSeverityBadge(alert.severity)}`}>
                        {alert.severity}
                      </span>
                    </td>
                    <td className="py-4 px-4 text-xs text-slate-400 font-medium">
                      {new Date(alert.timestamp).toLocaleString()}
                    </td>
                    <td className="py-4 px-4">
                      <span className={`inline-block text-[10px] font-bold px-2 py-0.5 rounded-full uppercase ${
                        alert.status === "ACTIVE" ? "bg-red-500/10 text-red-400 border border-red-500/20 animate-pulse" :
                        alert.status === "ACKNOWLEDGED" ? "bg-amber-500/10 text-amber-400 border border-amber-500/20" :
                        "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                      }`}>
                        {alert.status}
                      </span>
                    </td>
                    <td className="py-4 px-4 text-right space-x-2">
                      {alert.status === "ACTIVE" && (
                        <button
                          onClick={() => handleUpdateStatus(alert.id, "ACKNOWLEDGED")}
                          className="bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 border border-amber-500/20 text-xs font-bold px-2.5 py-1.5 rounded-xl transition-all"
                        >
                          Acknowledge
                        </button>
                      )}
                      {alert.status !== "RESOLVED" && (
                        <button
                          onClick={() => handleUpdateStatus(alert.id, "RESOLVED")}
                          className="bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/20 text-xs font-bold px-2.5 py-1.5 rounded-xl transition-all"
                        >
                          Resolve
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default AlertsPage;
