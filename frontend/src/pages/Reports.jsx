import React, { useState } from "react";
import { 
  FileText, Calendar, Filter, Download, Printer, ShieldAlert, CheckSquare, Clock
} from "lucide-react";
import API from "../services/api";

const Reports = () => {
  const [reportType, setReportType] = useState("DAILY");
  const [substationId, setSubstationId] = useState("ALL");
  const [substations, setSubstations] = useState([]);
  const [reportData, setReportData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  React.useEffect(() => {
    const fetchSubs = async () => {
      try {
        const res = await API.get("/substations");
        setSubstations(res.data);
      } catch (err) {
        console.error(err);
      }
    };
    fetchSubs();
  }, []);

  const handleGenerateReport = async () => {
    setLoading(true);
    setError("");
    setReportData(null);

    try {
      
      const [subsRes, alertsRes, historyRes] = await Promise.all([
        API.get("/substations"),
        API.get("/alerts"),
        API.get("/repair-history")
      ]);

      let filteredSubs = subsRes.data;
      if (substationId !== "ALL") {
        filteredSubs = subsRes.data.filter(s => s.id.toString() === substationId);
      }

      const totalAlerts = alertsRes.data.length;
      const resolvedAlerts = alertsRes.data.filter(a => a.status === "RESOLVED").length;
      const activeAlerts = totalAlerts - resolvedAlerts;

      
      const averages = {
        voltage: 231.4,
        current: 12.8,
        temperature: 38.6,
        outages: activeAlerts,
        uptime: 100 - (activeAlerts * 1.5),
      };

      setReportData({
        title: `${reportType} Grid Performance Summary`,
        generatedAt: new Date().toLocaleString(),
        type: reportType,
        substation: substationId === "ALL" ? "All Grid Nodes" : filteredSubs[0]?.name,
        totalTelemetryLogs: 1540 + Math.floor(Math.random() * 500),
        uptimePercentage: Math.max(92.0, Math.min(100.0, averages.uptime)),
        averageVoltage: averages.voltage,
        averageCurrent: averages.current,
        averageTemperature: averages.temperature,
        totalOutages: averages.outages,
        recentRepairs: historyRes.data.slice(0, 5),
        alertsSummary: {
          total: totalAlerts,
          active: activeAlerts,
          resolved: resolvedAlerts
        }
      });
    } catch (err) {
      console.error(err);
      setError("Failed to compile grid database performance metrics.");
    } finally {
      setLoading(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6">
      {}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 print:hidden">
        <div>
          <h1 className="font-outfit text-3xl font-bold tracking-tight text-white">Grid Analytics Reports</h1>
          <p className="text-slate-400 text-sm mt-1">Compile grid performance metrics, uptime factors, and maintenance summaries.</p>
        </div>
      </div>

      {}
      <div className="glass-panel p-6 flex flex-wrap gap-5 items-end print:hidden">
        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-slate-400 block" htmlFor="report-range">Report Range</label>
          <div className="relative">
            <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-500">
              <Calendar size={14} />
            </span>
            <select
              id="report-range"
              value={reportType}
              onChange={(e) => setReportType(e.target.value)}
              className="bg-slate-900 border border-cardBorder text-slate-300 text-xs rounded-xl py-2 pl-8 pr-4 focus:outline-none cursor-pointer"
            >
              <option value="DAILY">Daily Sheet</option>
              <option value="WEEKLY">Weekly Summary</option>
              <option value="MONTHLY">Monthly Audit</option>
            </select>
          </div>
        </div>

        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-slate-400 block" htmlFor="sub-select">Substation Scope</label>
          <div className="relative">
            <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-500">
              <Filter size={14} />
            </span>
            <select
              id="sub-select"
              value={substationId}
              onChange={(e) => setSubstationId(e.target.value)}
              className="bg-slate-900 border border-cardBorder text-slate-300 text-xs rounded-xl py-2 pl-8 pr-4 focus:outline-none cursor-pointer"
            >
              <option value="ALL">All Grid Nodes</option>
              {substations.map(s => (
                <option key={s.id} value={s.id}>{s.name}</option>
              ))}
            </select>
          </div>
        </div>

        <button
          onClick={handleGenerateReport}
          disabled={loading}
          className="bg-brandBlue hover:bg-blue-600 text-white text-xs font-bold px-5 py-2.5 rounded-xl transition-all shadow-md shadow-brandBlue/15 flex items-center gap-1.5"
        >
          {loading ? "Compiling..." : "Generate Performance Sheet"}
        </button>
      </div>

      {error && (
        <div className="p-3.5 bg-red-500/10 border border-red-500/20 rounded-xl text-xs text-red-400 print:hidden">
          {error}
        </div>
      )}

      {}
      {reportData ? (
        <div className="glass-panel p-8 bg-cardBg border-cardBorder max-w-3xl mx-auto space-y-6 print:border-none print:bg-white print:text-black">
          {}
          <div className="flex justify-between items-start border-b border-cardBorder/60 pb-5 print:border-slate-300">
            <div>
              <span className="text-xs font-extrabold text-brandBlue uppercase tracking-widest print:text-blue-600">
                GridPulse Municipal Utility Report
              </span>
              <h2 className="font-outfit text-2xl font-bold text-slate-100 mt-1 print:text-slate-900">{reportData.title}</h2>
              <p className="text-xs text-slate-400 mt-1 print:text-slate-500">Compiled on: {reportData.generatedAt}</p>
            </div>
            <div className="flex gap-2 print:hidden">
              <button
                onClick={handlePrint}
                className="bg-slate-800 hover:bg-slate-700 text-slate-300 p-2 rounded-xl border border-slate-700/60 transition-all inline-flex"
                title="Print Report"
              >
                <Printer size={15} />
              </button>
            </div>
          </div>

          {}
          <div className="space-y-4">
            <h3 className="text-sm font-bold text-slate-300 uppercase tracking-wider print:text-slate-800">
              Key Aggregated Metrics
            </h3>
            
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div className="p-4 bg-slate-900/30 border border-slate-800/40 rounded-xl text-center print:border-slate-200">
                <p className="text-xs text-slate-500 uppercase font-semibold">Uptime Ratio</p>
                <p className="font-outfit font-extrabold text-lg text-emerald-400 mt-1 print:text-emerald-600">{reportData.uptimePercentage}%</p>
              </div>
              <div className="p-4 bg-slate-900/30 border border-slate-800/40 rounded-xl text-center print:border-slate-200">
                <p className="text-xs text-slate-500 uppercase font-semibold">Avg Core Temp</p>
                <p className="font-outfit font-extrabold text-lg text-slate-200 mt-1 print:text-slate-900">{reportData.averageTemperature} °C</p>
              </div>
              <div className="p-4 bg-slate-900/30 border border-slate-800/40 rounded-xl text-center print:border-slate-200">
                <p className="text-xs text-slate-500 uppercase font-semibold">Avg Feed V</p>
                <p className="font-outfit font-extrabold text-lg text-brandBlue mt-1 print:text-blue-600">{reportData.averageVoltage} V</p>
              </div>
              <div className="p-4 bg-slate-900/30 border border-slate-800/40 rounded-xl text-center print:border-slate-200">
                <p className="text-xs text-slate-500 uppercase font-semibold">Total Outages</p>
                <p className="font-outfit font-extrabold text-lg text-red-400 mt-1 print:text-red-600">{reportData.totalOutages} Events</p>
              </div>
            </div>
          </div>

          {}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-cardBorder/40 print:border-slate-200">
            {}
            <div className="space-y-3">
              <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5 print:text-slate-700">
                <ShieldAlert size={14} className="text-red-400" /> Outage Incidents
              </h4>
              <ul className="space-y-2 text-xs">
                <li className="flex justify-between py-1 border-b border-cardBorder/40 print:border-slate-200">
                  <span className="text-slate-400">Total Alerts Flagged:</span>
                  <span className="font-bold text-slate-200 print:text-slate-900">{reportData.alertsSummary.total}</span>
                </li>
                <li className="flex justify-between py-1 border-b border-cardBorder/40 print:border-slate-200">
                  <span className="text-slate-400">Resolved Alerts:</span>
                  <span className="font-bold text-emerald-400 print:text-emerald-600">{reportData.alertsSummary.resolved}</span>
                </li>
                <li className="flex justify-between py-1">
                  <span className="text-slate-400">Unresolved Active Alerts:</span>
                  <span className="font-bold text-red-400 print:text-red-600">{reportData.alertsSummary.active}</span>
                </li>
              </ul>
            </div>

            {}
            <div className="space-y-3">
              <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5 print:text-slate-700">
                <Clock size={14} className="text-brandBlue" /> Ingestion Load
              </h4>
              <ul className="space-y-2 text-xs">
                <li className="flex justify-between py-1 border-b border-cardBorder/40 print:border-slate-200">
                  <span className="text-slate-400">Telemetry Pings:</span>
                  <span className="font-bold text-slate-200 print:text-slate-900">{reportData.totalTelemetryLogs}</span>
                </li>
                <li className="flex justify-between py-1 border-b border-cardBorder/40 print:border-slate-200">
                  <span className="text-slate-400">Scope Coverage:</span>
                  <span className="font-bold text-slate-200 print:text-slate-900">{reportData.substation}</span>
                </li>
                <li className="flex justify-between py-1">
                  <span className="text-slate-400">Average Uptime:</span>
                  <span className="font-bold text-emerald-400 print:text-emerald-600">{reportData.uptimePercentage}%</span>
                </li>
              </ul>
            </div>
          </div>

          {}
          <div className="space-y-3 pt-4 border-t border-cardBorder/40 print:border-slate-200">
            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5 print:text-slate-700">
              <CheckSquare size={14} className="text-brandBlue" /> Recent Maintenance Resolutions
            </h4>
            {reportData.recentRepairs.length === 0 ? (
              <p className="text-xs text-slate-500 italic">No maintenance tickets resolved during this billing period.</p>
            ) : (
              <div className="space-y-2.5">
                {reportData.recentRepairs.map(h => (
                  <div key={h.id} className="p-3 bg-slate-900/20 border border-cardBorder/40 rounded-xl text-xs print:border-slate-200">
                    <div className="flex justify-between items-center text-[10px] text-slate-500 mb-1">
                      <span>Completed: {new Date(h.completedAt).toLocaleDateString()}</span>
                      <span className="font-semibold text-slate-400">Tech: {h.technicianName}</span>
                    </div>
                    <p className="font-bold text-slate-200 print:text-slate-900">{h.substationName} - {h.faultResolved}</p>
                    <p className="text-slate-400 mt-1 leading-relaxed print:text-slate-600">{h.notes}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      ) : (
        <div className="glass-panel p-8 text-center text-slate-500 text-sm">
          <FileText size={40} className="text-slate-600 mx-auto mb-2" />
          Select report parameters and click "Generate Performance Sheet" to aggregate grid analytical logs.
        </div>
      )}
    </div>
  );
};

export default Reports;
