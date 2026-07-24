import React, { useState, useEffect } from "react";
import { 
  Sparkles, Clock, Wrench, ShieldAlert, CheckCircle, Phone, Mail, 
  User, Star, MapPin, TrendingUp, Compass, Award, AlertCircle, 
  ThumbsUp, Check, X, Shield, Lock, Smartphone, RefreshCw, BarChart2,
  Activity
} from "lucide-react";
import API from "../services/api";
import authService from "../services/authService";

const TechnicianDashboard = () => {
  const currentUser = authService.getCurrentUser();
  const [profile, setProfile] = useState(null);
  const [performance, setPerformance] = useState(null);
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  
  const [phoneEditOpen, setPhoneEditOpen] = useState(false);
  const [phoneValue, setPhoneValue] = useState("");

  
  const [passwordFormOpen, setPasswordFormOpen] = useState(false);
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [pwdError, setPwdError] = useState("");
  const [pwdSuccess, setPwdSuccess] = useState("");

  
  const [rejectModalOpen, setRejectModalOpen] = useState(false);
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [rejectReason, setRejectReason] = useState("");
  
  const [completeModalOpen, setCompleteModalOpen] = useState(false);
  const [completeNotes, setCompleteNotes] = useState("");

  const fetchData = async () => {
    try {
      setLoading(true);
      const [profileRes, perfRes, ticketsRes] = await Promise.all([
        API.get("/technicians/me"),
        API.get("/technicians/me/performance"),
        API.get("/tickets/my-assigned")
      ]);
      
      setProfile(profileRes.data);
      setPerformance(perfRes.data);
      setTickets(ticketsRes.data);
      setPhoneValue(profileRes.data.phone || "");

      
      if (profileRes.data.user && !profileRes.data.user.passwordChanged) {
        setPasswordFormOpen(true);
      } else {
        setPasswordFormOpen(false);
      }
      
      setError("");
    } catch (err) {
      console.error("Failed to fetch technician data", err);
      setError("Failed to load dashboard data. Please make sure the server is running.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleUpdateAvailability = async (newVal) => {
    try {
      const res = await API.put("/technicians/me", { availability: newVal });
      setProfile(res.data);
      fetchData();
    } catch (err) {
      console.error("Failed to update availability", err);
    }
  };

  const handleUpdatePhone = async () => {
    try {
      const res = await API.put("/technicians/me", { phone: phoneValue });
      setProfile(res.data);
      setPhoneEditOpen(false);
    } catch (err) {
      console.error("Failed to update phone number", err);
    }
  };

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    if (!newPassword.trim()) {
      setPwdError("Password cannot be blank.");
      return;
    }
    if (newPassword !== confirmPassword) {
      setPwdError("Passwords do not match.");
      return;
    }
    try {
      await API.put("/technicians/me", { password: newPassword });
      setPwdSuccess("Password updated successfully!");
      setPwdError("");
      
      const updatedUser = { ...currentUser, passwordChanged: true };
      localStorage.setItem("user", JSON.stringify(updatedUser));
      setTimeout(() => {
        setPasswordFormOpen(false);
        fetchData();
      }, 1500);
    } catch (err) {
      console.error("Failed to change password", err);
      setPwdError("Password change failed. Try another password.");
    }
  };

  const handleWorkflowTransition = async (ticketId, status, notes = "") => {
    try {
      await API.put(`/tickets/${ticketId}/workflow`, { status, notes });
      fetchData();
      setRejectModalOpen(false);
      setCompleteModalOpen(false);
      setRejectReason("");
      setCompleteNotes("");
    } catch (err) {
      console.error("Failed to transition ticket workflow status", err);
    }
  };

  const activeTickets = tickets.filter(t => ["ACCEPTED", "TRAVELLING", "ON_SITE", "IN_PROGRESS"].includes(t.status));
  const pendingTickets = tickets.filter(t => t.status === "ASSIGNED");
  const completedTickets = tickets.filter(t => t.status === "COMPLETED");

  const getWorkflowStepDetails = (status) => {
    return {
      ASSIGNED: { next: "Accept Job", nextStatus: "ACCEPTED" },
      ACCEPTED: { next: "Start Travelling", nextStatus: "TRAVELLING" },
      TRAVELLING: { next: "Mark On Site", nextStatus: "ON_SITE" },
      ON_SITE: { next: "Start Repair", nextStatus: "IN_PROGRESS" },
      IN_PROGRESS: { next: "Complete Repair", nextStatus: "COMPLETED" },
    }[status] || null;
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[70vh] gap-3">
        <RefreshCw className="animate-spin text-brandBlue" size={32} />
        <p className="text-slate-400 text-sm">Loading field technician portal...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 bg-red-500/10 border border-red-500/20 rounded-2xl max-w-md mx-auto mt-12 text-center space-y-4">
        <AlertCircle className="text-red-400 mx-auto" size={40} />
        <h3 className="font-outfit font-bold text-white text-lg">Connection Error</h3>
        <p className="text-slate-400 text-xs leading-relaxed">{error}</p>
        <button onClick={fetchData} className="bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold px-4 py-2.5 rounded-xl transition-all">
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6 relative pb-12">
      {}
      {passwordFormOpen && (
        <div className="fixed inset-0 z-[2000] bg-slate-950 flex items-center justify-center p-4">
          <div className="glass-panel w-full max-w-md p-6 bg-cardBg border border-brandBlue/30 shadow-2xl space-y-4 rounded-3xl text-center">
            <div className="w-12 h-12 rounded-full bg-brandBlue/10 border border-brandBlue/20 text-brandBlue flex items-center justify-center mx-auto mb-2 animate-pulse">
              <Lock size={22} />
            </div>
            <h3 className="font-outfit font-bold text-xl text-slate-100">Setup Enterprise Password</h3>
            <p className="text-xs text-slate-400 leading-relaxed max-w-xs mx-auto">
              Welcome back, <strong>{profile?.fullName}</strong>. As this is your first login, you must change your temporary password to continue.
            </p>
            
            <form onSubmit={handlePasswordChange} className="space-y-4.5 text-left pt-2">
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-slate-400 block uppercase tracking-wider">New Password</label>
                <input 
                  type="password"
                  required
                  placeholder="Enter secure password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full bg-slate-900 border border-cardBorder text-slate-200 rounded-xl px-3.5 py-3 text-xs focus:outline-none focus:border-brandBlue"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-slate-400 block uppercase tracking-wider">Confirm Password</label>
                <input 
                  type="password"
                  required
                  placeholder="Confirm password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full bg-slate-900 border border-cardBorder text-slate-200 rounded-xl px-3.5 py-3 text-xs focus:outline-none focus:border-brandBlue"
                />
              </div>

              {pwdError && <p className="text-red-400 text-xs font-semibold">{pwdError}</p>}
              {pwdSuccess && <p className="text-emerald-400 text-xs font-semibold">{pwdSuccess}</p>}

              <button 
                type="submit" 
                className="w-full bg-brandBlue hover:bg-blue-600 text-white font-bold py-3.5 rounded-xl text-xs hover:shadow-lg transition-all"
              >
                Save and Continue
              </button>
            </form>
          </div>
        </div>
      )}

      {}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="font-outfit text-3xl font-bold tracking-tight text-white">Technician Control Portal</h1>
          <p className="text-slate-400 text-sm mt-1">Manage dispatches, status workflow, and performance statistics.</p>
        </div>

        {}
        <div className="flex items-center gap-3 bg-slate-900/60 border border-cardBorder/60 p-3 rounded-2xl">
          <span className="text-xs font-bold text-slate-400">My Availability:</span>
          <select 
            value={profile?.availability || "OFFLINE"}
            onChange={(e) => handleUpdateAvailability(e.target.value)}
            className={`text-xs font-bold rounded-xl px-3 py-1.5 focus:outline-none cursor-pointer border ${
              {
                AVAILABLE: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
                BUSY: "bg-amber-500/10 text-amber-400 border-amber-500/20",
                OFFLINE: "bg-slate-800 text-slate-400 border-slate-700",
                ON_LEAVE: "bg-red-500/10 text-red-400 border-red-500/20"
              }[profile?.availability] || "bg-slate-850 text-slate-400"
            }`}
          >
            <option value="AVAILABLE" className="bg-slate-950 text-emerald-400">Available</option>
            <option value="BUSY" className="bg-slate-950 text-amber-400">Busy / Active Job</option>
            <option value="OFFLINE" className="bg-slate-950 text-slate-400">Offline</option>
            <option value="ON_LEAVE" className="bg-slate-950 text-red-400">On Leave</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {}
        <div className="space-y-6 lg:col-span-1">
          {}
          <div className="glass-panel p-5 bg-cardBg border border-cardBorder/60 rounded-3xl space-y-4.5">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl bg-brandBlue/10 border border-brandBlue/20 text-brandBlue flex items-center justify-center font-bold text-xl font-outfit uppercase">
                {profile?.fullName?.charAt(0) || "T"}
              </div>
              <div className="min-w-0">
                <h3 className="font-outfit font-bold text-slate-200 text-base truncate">{profile?.fullName}</h3>
                <span className="text-[10px] font-extrabold text-slate-500 tracking-wider uppercase block mt-0.5">
                  ID: {profile?.employeeId}
                </span>
                <span className="text-[10px] font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded inline-block mt-1">
                  ★ {profile?.rating} Rating
                </span>
              </div>
            </div>

            <div className="border-t border-cardBorder/40 pt-4 space-y-3.5 text-xs text-slate-400">
              <div className="flex items-center gap-2.5">
                <Mail size={14} className="text-slate-500" />
                <span className="text-slate-300 truncate">{profile?.user?.email || "tech@gridpulse.com"}</span>
              </div>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <Phone size={14} className="text-slate-500" />
                  {phoneEditOpen ? (
                    <input 
                      type="text" 
                      value={phoneValue}
                      onChange={(e) => setPhoneValue(e.target.value)}
                      className="bg-slate-900 border border-cardBorder text-slate-200 text-xs rounded px-2 py-1 focus:outline-none"
                    />
                  ) : (
                    <span className="text-slate-300">{profile?.phone || "Not Configured"}</span>
                  )}
                </div>
                {phoneEditOpen ? (
                  <button onClick={handleUpdatePhone} className="text-[10px] text-emerald-400 hover:underline">Save</button>
                ) : (
                  <button onClick={() => setPhoneEditOpen(true)} className="text-[10px] text-brandBlue hover:underline">Edit</button>
                )}
              </div>

              <div className="flex items-center gap-2.5">
                <Compass size={14} className="text-slate-500" />
                <span className="text-slate-300">Specialization: {profile?.specialization}</span>
              </div>

              <div className="flex items-center gap-2.5">
                <Award size={14} className="text-slate-500" />
                <span className="text-slate-300">Experience: {profile?.experience || 0} Years</span>
              </div>

              <div className="flex items-center gap-2.5">
                <MapPin size={14} className="text-slate-500" />
                <span className="text-slate-300 truncate">Coords: {profile?.currentLatitude?.toFixed(4)}, {profile?.currentLongitude?.toFixed(4)}</span>
              </div>
            </div>
          </div>

          {}
          {performance && (
            <div className="glass-panel p-5 bg-cardBg border border-cardBorder/60 rounded-3xl space-y-4">
              <h4 className="font-outfit font-bold text-slate-200 text-sm flex items-center gap-1.5">
                <BarChart2 size={16} className="text-brandBlue" />
                Performance Metrics
              </h4>

              <div className="grid grid-cols-2 gap-3 text-center">
                <div className="p-3 bg-slate-900/40 rounded-2xl border border-cardBorder/30">
                  <p className="text-slate-500 text-[10px] font-bold uppercase">Repairs Completed</p>
                  <p className="text-xl font-bold text-emerald-400 mt-1">{performance.completedRepairs}</p>
                </div>
                <div className="p-3 bg-slate-900/40 rounded-2xl border border-cardBorder/30">
                  <p className="text-slate-500 text-[10px] font-bold uppercase">Active Jobs</p>
                  <p className="text-xl font-bold text-brandBlue mt-1">{performance.activeJobs}</p>
                </div>
                <div className="p-3 bg-slate-900/40 rounded-2xl border border-cardBorder/30 col-span-2">
                  <p className="text-slate-500 text-[10px] font-bold uppercase">Avg Repair ETA</p>
                  <p className="text-lg font-bold text-slate-200 mt-1">{performance.averageRepairTime} Hours</p>
                </div>
              </div>

              <div className="space-y-2.5 pt-2 text-xs">
                <div>
                  <div className="flex justify-between text-slate-400 text-[11px] mb-1">
                    <span>Average AI Confidence Match</span>
                    <span className="font-bold text-emerald-400">{performance.averageConfidence}%</span>
                  </div>
                  <div className="w-full bg-slate-900 rounded-full h-1.5 overflow-hidden">
                    <div className="bg-emerald-500 h-full rounded-full" style={{ width: `${performance.averageConfidence}%` }} />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-slate-400 text-[11px] mb-1">
                    <span>Customer Satisfaction Rate</span>
                    <span className="font-bold text-brandBlue">{performance.customerSatisfaction} / 5.0</span>
                  </div>
                  <div className="w-full bg-slate-900 rounded-full h-1.5 overflow-hidden">
                    <div className="bg-brandBlue h-full rounded-full" style={{ width: '98%' }} />
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {}
        <div className="space-y-6 lg:col-span-2">
          
          {}
          <div className="glass-panel p-5 bg-cardBg border border-cardBorder/60 rounded-3xl space-y-4">
            <h4 className="font-outfit font-bold text-slate-200 text-sm flex items-center gap-2">
              <Activity size={16} className="text-brandBlue animate-pulse" />
              My Active Repair Jobs
            </h4>

            {activeTickets.length === 0 ? (
              <div className="text-center py-10 bg-slate-900/10 rounded-2xl border border-dashed border-cardBorder/40">
                <CheckCircle className="text-emerald-400 mx-auto mb-2.5" size={32} />
                <p className="text-slate-400 text-xs">No active repair orders. Set availability to "Available" to get dispatched.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {activeTickets.map(t => {
                  const step = getWorkflowStepDetails(t.status);
                  return (
                    <div key={t.id} className="p-4 bg-slate-900/40 border border-cardBorder rounded-2xl space-y-3.5 text-left">
                      <div className="flex items-center justify-between border-b border-cardBorder/30 pb-2.5">
                        <div>
                          <span className="text-[10px] text-slate-500 font-bold block uppercase">Ticket ID: #{t.id}</span>
                          <h5 className="font-outfit font-bold text-slate-200 text-sm mt-0.5">{t.substationName}</h5>
                        </div>
                        <span className="text-[10px] font-extrabold text-amber-400 bg-amber-500/10 px-2.5 py-1 rounded border border-amber-500/20 uppercase tracking-wide animate-pulse">
                          {(t.status || "ASSIGNED").replace(/_/g, " ")}
                        </span>
                      </div>

                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3.5 text-xs">
                        <div>
                          <p className="text-slate-500">Infrastructure Issue</p>
                          <p className="font-bold text-slate-300 mt-0.5">{t.probableFault}</p>
                        </div>
                        <div>
                          <p className="text-slate-500">AI Confidence</p>
                          <p className="font-bold text-emerald-400 mt-0.5">{t.confidenceScore}%</p>
                        </div>
                        <div>
                          <p className="text-slate-500">ETA Limit</p>
                          <p className="font-bold text-slate-300 mt-0.5">{t.etaHours} Hours</p>
                        </div>
                      </div>

                      <div className="bg-slate-950/40 p-3 rounded-xl border border-cardBorder/30 text-xs">
                        <p className="text-[9px] text-brandBlue font-bold uppercase tracking-wider flex items-center gap-1.5 mb-1">
                          <Sparkles size={11} /> AI Suggested Action Plan
                        </p>
                        <p className="text-slate-400 leading-relaxed text-[11px]">{t.recommendedRepair}</p>
                      </div>

                      {}
                      {step && (
                        <div className="pt-2 flex justify-end">
                          <button
                            onClick={() => {
                              if (step.nextStatus === "COMPLETED") {
                                setSelectedTicket(t);
                                setCompleteModalOpen(true);
                              } else {
                                handleWorkflowTransition(t.id, step.nextStatus);
                              }
                            }}
                            className="bg-brandBlue hover:bg-blue-600 text-white font-bold px-4 py-2.5 rounded-xl text-xs flex items-center gap-1 shadow-lg shadow-brandBlue/10 transition-all"
                          >
                            Proceed: {step.next}
                          </button>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {}
          <div className="glass-panel p-5 bg-cardBg border border-cardBorder/60 rounded-3xl space-y-4">
            <h4 className="font-outfit font-bold text-slate-200 text-sm flex items-center gap-2">
              <Clock size={16} className="text-amber-400" />
              Pending Dispatches / Assignments ({pendingTickets.length})
            </h4>

            {pendingTickets.length === 0 ? (
              <p className="text-slate-500 text-xs italic py-2">No pending dispatches.</p>
            ) : (
              <div className="space-y-3.5">
                {pendingTickets.map(t => (
                  <div key={t.id} className="p-4 bg-slate-900/20 border border-cardBorder/30 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-left">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="text-[9px] text-slate-500 font-bold uppercase">#{t.id}</span>
                        <span className="text-[9px] font-extrabold text-red-400 bg-red-500/10 px-1.5 py-0.5 rounded border border-red-500/20 uppercase tracking-wide">
                          {t.priority}
                        </span>
                      </div>
                      <h5 className="font-outfit font-bold text-slate-250 text-sm">{t.substationName}</h5>
                      <p className="text-slate-400 text-xs">Issue: {t.probableFault} (ETA: {t.etaHours}h)</p>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => {
                          setSelectedTicket(t);
                          setRejectModalOpen(true);
                        }}
                        className="bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20 font-bold px-3 py-2 rounded-xl text-xs transition-all"
                      >
                        Reject
                      </button>
                      <button
                        onClick={() => handleWorkflowTransition(t.id, "ACCEPTED")}
                        className="bg-brandBlue hover:bg-blue-600 text-white font-bold px-4.5 py-2 rounded-xl text-xs transition-all"
                      >
                        Accept
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {}
          {activeTickets.length > 0 && (
            <div className="p-4.5 bg-brandBlue/5 border border-brandBlue/15 rounded-3xl text-left space-y-2">
              <h5 className="text-xs font-bold text-brandBlue flex items-center gap-1.5">
                <Sparkles size={13} className="text-brandBlue animate-pulse" />
                Live AI Smart-Tips for active faults
              </h5>
              <div className="text-[11px] text-slate-400 leading-relaxed pl-1 space-y-1.5">
                {activeTickets.map(t => {
                  const fault = (t.probableFault || "").toLowerCase();
                  if (fault.includes("transformer")) {
                    return (
                      <p key={t.id}>
                        💡 <strong>For {t.substationName}</strong>: Verify the coolant temperature and oil level gauge before beginning filter replacement. Fans should auto-start if above 65°C.
                      </p>
                    );
                  }
                  if (fault.includes("cable") || fault.includes("insulation")) {
                    return (
                      <p key={t.id}>
                        💡 <strong>For {t.substationName}</strong>: Use an insulation resistance tester (Megger) to locate high impedance faults before cutting cable joints.
                      </p>
                    );
                  }
                  return (
                    <p key={t.id}>
                      💡 <strong>For {t.substationName}</strong>: Check the main circuit breakers and telemetric bus status in the command cabinet first.
                    </p>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>

      {}
      {rejectModalOpen && selectedTicket && (
        <div className="fixed inset-0 z-[2010] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="glass-panel w-full max-w-md p-6 bg-cardBg shadow-2xl space-y-4">
            <h3 className="font-outfit font-bold text-lg text-slate-100 flex items-center gap-2">
              <AlertCircle size={18} className="text-red-400" />
              Reject Dispatch Assignment
            </h3>
            
            <div className="space-y-3.5 text-xs">
              <p className="text-slate-400 leading-relaxed">
                Provide a reason for rejecting the repair dispatch for <strong>{selectedTicket.substationName}</strong>.
              </p>
              <div>
                <label className="text-slate-500 font-bold block mb-1.5" htmlFor="reject-notes">Rejection Reason:</label>
                <textarea
                  id="reject-notes"
                  required
                  placeholder="E.g., Missing specialized testing gear for high voltage breakers, or currently recovering from travel delays."
                  value={rejectReason}
                  onChange={(e) => setRejectReason(e.target.value)}
                  className="w-full bg-slate-900 border border-cardBorder text-slate-350 rounded-xl p-3 h-24 focus:outline-none focus:border-red-500"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 text-xs pt-1">
              <button
                onClick={() => {
                  setRejectModalOpen(false);
                  setRejectReason("");
                }}
                className="bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold px-4 py-2.5 rounded-xl"
              >
                Cancel
              </button>
              <button
                onClick={() => handleWorkflowTransition(selectedTicket.id, "REJECTED", rejectReason)}
                disabled={!rejectReason.trim()}
                className="bg-red-500 hover:bg-red-600 text-white font-bold px-4 py-2.5 rounded-xl disabled:opacity-50"
              >
                Confirm Reject
              </button>
            </div>
          </div>
        </div>
      )}

      {}
      {completeModalOpen && selectedTicket && (
        <div className="fixed inset-0 z-[2010] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="glass-panel w-full max-w-md p-6 bg-cardBg shadow-2xl space-y-4">
            <h3 className="font-outfit font-bold text-lg text-slate-100 flex items-center gap-2">
              <CheckCircle size={18} className="text-emerald-400" />
              Complete Repair Ticket
            </h3>
            
            <div className="space-y-3.5 text-xs">
              <p className="text-slate-400 leading-relaxed">
                Log the repair steps performed on <strong>{selectedTicket.substationName}</strong> to close the ticket and heal the grid.
              </p>
              <div>
                <label className="text-slate-500 font-bold block mb-1.5" htmlFor="complete-notes">Repair Actions & Findings:</label>
                <textarea
                  id="complete-notes"
                  required
                  placeholder="Detail actions taken (e.g. Flushed cooling fins, refilled transformer oil, calibrated relays, verified voltage levels)."
                  value={completeNotes}
                  onChange={(e) => setCompleteNotes(e.target.value)}
                  className="w-full bg-slate-900 border border-cardBorder text-slate-350 rounded-xl p-3 h-28 focus:outline-none focus:border-emerald-500"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 text-xs pt-1">
              <button
                onClick={() => {
                  setCompleteModalOpen(false);
                  setCompleteNotes("");
                }}
                className="bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold px-4 py-2.5 rounded-xl"
              >
                Cancel
              </button>
              <button
                onClick={() => handleWorkflowTransition(selectedTicket.id, "COMPLETED", completeNotes)}
                disabled={!completeNotes.trim()}
                className="bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-bold px-4 py-2.5 rounded-xl disabled:opacity-50"
              >
                Resolve & Heal Grid
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TechnicianDashboard;
