import React, { useState, useEffect, useRef } from "react";
import { Link, Outlet, useLocation, useNavigate } from "react-router-dom";
import { 
  LayoutDashboard, Activity, Map, AlertTriangle, 
  Wrench, Users, UserCheck, BarChart3, LogOut, Menu, X, BatteryCharging,
  Bell, MessageSquare, Send, Sparkles, Trash2, Check
} from "lucide-react";
import authService from "../services/authService";
import API from "../services/api";

const DashboardLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const user = authService.getCurrentUser();

  
  const [notifications, setNotifications] = useState(() => {
    const saved = localStorage.getItem("gp_notifications");
    return saved ? JSON.parse(saved) : [];
  });
  const [notifDropdownOpen, setNotifDropdownOpen] = useState(false);

  
  const [chatOpen, setChatOpen] = useState(false);
  const [chatInput, setChatInput] = useState("");
  const [chatMessages, setChatMessages] = useState([
    { sender: "assistant", text: "Hello! I am your GridPulse control assistant. Ask me anything about current faults, free technicians, or grid uptime status." }
  ]);
  const [chatLoading, setChatLoading] = useState(false);
  const chatEndRef = useRef(null);

  const handleLogout = () => {
    authService.logout();
    navigate("/login");
  };

  const cleanRole = user?.role ? user.role.replace("ROLE_", "") : "";

  const navItems = [
    { name: "Dashboard", path: "/", icon: LayoutDashboard, roles: ["ADMIN", "OPERATOR"] },
    { name: "Technician Dashboard", path: "/tech-dashboard", icon: LayoutDashboard, roles: ["TECHNICIAN"] },
    { name: "Live Monitoring", path: "/monitoring", icon: Activity, roles: ["ADMIN", "OPERATOR"] },
    { name: "Grid Heatmap", path: "/heatmap", icon: Map, roles: ["ADMIN", "OPERATOR"] },
    { name: "Active Alerts", path: "/alerts", icon: AlertTriangle, roles: ["ADMIN", "OPERATOR"] },
    { name: "Repair Tickets", path: "/tickets", icon: Wrench, roles: ["ADMIN", "OPERATOR"] },
    { name: "Technician Management", path: "/technicians", icon: UserCheck, roles: ["ADMIN"] },
    { name: "Customers", path: "/customers", icon: Users, roles: ["ADMIN", "OPERATOR"] },
    { name: "Reports", path: "/reports", icon: BarChart3, roles: ["ADMIN", "OPERATOR"] },
  ];

  const filteredNavItems = navItems.filter(item => item.roles.includes(cleanRole));

  const roleColors = {
    ADMIN: "bg-red-500/10 text-red-400 border border-red-500/20",
    OPERATOR: "bg-blue-500/10 text-blue-400 border border-blue-500/20",
    TECHNICIAN: "bg-green-500/10 text-green-400 border border-green-500/20",
  };

  
  const playAlertTone = () => {
    try {
      const ctx = new (window.AudioContext || window.webkitAudioContext)();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = "sine";
      osc.frequency.setValueAtTime(880, ctx.currentTime); 
      gain.gain.setValueAtTime(0.08, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.3);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.3);
    } catch (e) {
      console.warn("AudioContext not allowed or supported by browser policy", e);
    }
  };

  
  useEffect(() => {
    const wsUrl = `ws://${window.location.hostname}:8080/ws-notifications`;
    let ws = new WebSocket(wsUrl);

    ws.onopen = () => {
      console.log("WebSocket client successfully connected to GridPulse server");
    };

    ws.onmessage = (event) => {
      try {
        const payload = JSON.parse(event.data);
        const newNotif = {
          id: Date.now(),
          type: payload.type,
          message: payload.message,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          read: false
        };

        setNotifications(prev => {
          const updated = [newNotif, ...prev].slice(0, 30); 
          localStorage.setItem("gp_notifications", JSON.stringify(updated));
          return updated;
        });

        
        playAlertTone();
      } catch (err) {
        console.error("Error parsing WebSocket JSON package", err);
      }
    };

    ws.onerror = (err) => {
      console.error("WebSocket connection encountered an error:", err);
    };

    ws.onclose = () => {
      console.warn("WebSocket closed. Attempting reconnect in 5 seconds...");
      setTimeout(() => {
        
      }, 5000);
    };

    return () => {
      ws.close();
    };
  }, []);

  
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chatMessages, chatLoading]);

  
  const sendChatMessage = async (msgText) => {
    if (!msgText.trim()) return;

    
    const userMsg = { sender: "user", text: msgText };
    setChatMessages(prev => [...prev, userMsg]);
    setChatInput("");
    setChatLoading(true);

    try {
      const res = await API.post("/ai/chat", { message: msgText });
      setChatMessages(prev => [...prev, { sender: "assistant", text: res.data.response }]);
    } catch (err) {
      console.error("Error in AI Chat:", err);
      setChatMessages(prev => [...prev, { sender: "assistant", text: "I'm having trouble connecting to the grid controller. Please try again." }]);
    } finally {
      setChatLoading(false);
    }
  };

  const handleClearNotifications = () => {
    setNotifications([]);
    localStorage.removeItem("gp_notifications");
  };

  const handleMarkAsRead = () => {
    setNotifications(prev => {
      const updated = prev.map(n => ({ ...n, read: true }));
      localStorage.setItem("gp_notifications", JSON.stringify(updated));
      return updated;
    });
  };

  const unreadNotifCount = notifications.filter(n => !n.read).length;

  const quickPrompts = [
    "Why did East State Grid fail?",
    "Summarize today's faults.",
    "Show critical substations.",
    "Which technician is free?",
    "Generate today's report."
  ];

  return (
    <div className="min-h-screen bg-darkBg text-slate-100 flex relative">
      {}
      <aside className={`fixed inset-y-0 left-0 z-50 w-64 bg-cardBg/90 backdrop-blur-md border-r border-cardBorder/60 p-5 flex flex-col transform transition-transform duration-300 md:translate-x-0 md:static md:h-screen ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <div className="bg-brandBlue/10 p-2 rounded-xl border border-brandBlue/20 text-brandBlue animate-pulse">
              <BatteryCharging size={24} />
            </div>
            <span className="font-outfit text-xl font-bold tracking-wide bg-gradient-to-r from-blue-400 via-indigo-400 to-emerald-400 bg-clip-text text-transparent">
              GridPulse
            </span>
          </div>
          <button className="md:hidden text-slate-400 hover:text-white" onClick={() => setSidebarOpen(false)}>
            <X size={20} />
          </button>
        </div>

        <nav className="flex-1 space-y-1.5 overflow-y-auto pr-1">
          {filteredNavItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.name}
                to={item.path}
                onClick={() => setSidebarOpen(false)}
                className={`flex items-center gap-3.5 px-4 py-3 rounded-xl transition-all duration-200 ${
                  isActive 
                    ? "bg-brandBlue text-white font-medium shadow-md shadow-brandBlue/10" 
                    : "text-slate-400 hover:bg-slate-800/40 hover:text-slate-100"
                }`}
              >
                <Icon size={18} />
                <span className="text-sm">{item.name}</span>
              </Link>
            );
          })}
        </nav>

        <div className="mt-auto border-t border-cardBorder/60 pt-4 flex flex-col gap-3">
          <div className="flex items-center gap-3 px-2">
            <div className="w-10 h-10 rounded-full bg-slate-800 border border-slate-700/80 flex items-center justify-center font-bold text-slate-300 font-outfit uppercase">
              {user?.fullName?.charAt(0) || "U"}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold truncate text-slate-200">{user?.fullName}</p>
              <span className={`inline-block text-[10px] px-2 py-0.5 mt-0.5 rounded-full font-bold uppercase ${roleColors[cleanRole] || "bg-slate-800 text-slate-400"}`}>
                {cleanRole}
              </span>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-2.5 px-4 py-3 rounded-xl border border-red-500/20 bg-red-500/5 hover:bg-red-500/10 text-red-400 text-sm font-semibold transition-all duration-200"
          >
            <LogOut size={16} />
            Logout
          </button>
        </div>
      </aside>

      {}
      <div className="flex-1 flex flex-col min-w-0 h-screen overflow-hidden">
        {}
        <header className="bg-cardBg/50 backdrop-blur-md border-b border-cardBorder/40 px-6 py-4 flex items-center justify-between gap-4">
          <button className="md:hidden text-slate-400 hover:text-white" onClick={() => setSidebarOpen(true)}>
            <Menu size={24} />
          </button>
          
          <div className="flex-1 flex items-center justify-end gap-6 relative">
            <div className="text-right hidden md:block">
              <p className="text-xs text-slate-400">Current Grid Monitor</p>
              <p className="text-sm font-semibold text-brandBlue font-outfit">Active Status: Monitoring</p>
            </div>

            {}
            <div className="relative">
              <button 
                onClick={() => {
                  setNotifDropdownOpen(!notifDropdownOpen);
                  if (!notifDropdownOpen && unreadNotifCount > 0) {
                    handleMarkAsRead();
                  }
                }}
                className="relative p-2.5 text-slate-400 hover:text-slate-100 hover:bg-slate-800/40 rounded-xl transition-all"
              >
                <Bell size={18} />
                {unreadNotifCount > 0 && (
                  <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full animate-ping" />
                )}
                {unreadNotifCount > 0 && (
                  <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full" />
                )}
              </button>

              {notifDropdownOpen && (
                <div className="absolute right-0 mt-3.5 w-80 bg-slate-900/95 backdrop-blur-md border border-cardBorder/80 rounded-2xl p-4 shadow-2xl z-[1100] flex flex-col max-h-[380px] overflow-hidden">
                  <div className="flex items-center justify-between border-b border-cardBorder/40 pb-2 mb-2 text-xs">
                    <span className="font-bold text-slate-300">Live Grid Notifications</span>
                    {notifications.length > 0 && (
                      <button 
                        onClick={handleClearNotifications}
                        className="text-[10px] text-red-400 hover:underline flex items-center gap-0.5"
                      >
                        <Trash2 size={10} /> Clear
                      </button>
                    )}
                  </div>
                  
                  <div className="flex-1 overflow-y-auto space-y-2 pr-1">
                    {notifications.length === 0 ? (
                      <p className="text-xs text-slate-500 italic text-center py-8">No notifications received.</p>
                    ) : (
                      notifications.map(n => {
                        const notifColor = {
                          NEW_FAULT: "border-l-red-500 bg-red-500/5",
                          AI_DIAGNOSIS_COMPLETED: "border-l-indigo-500 bg-indigo-500/5",
                          TICKET_ASSIGNED: "border-l-blue-500 bg-blue-500/5",
                          TECHNICIAN_ACCEPTED: "border-l-amber-500 bg-amber-500/5",
                          REPAIR_COMPLETED: "border-l-emerald-500 bg-emerald-500/5",
                        }[n.type] || "border-l-slate-500 bg-slate-500/5";

                        return (
                          <div key={n.id} className={`p-2.5 rounded-lg border-l-2 ${notifColor} border border-y-cardBorder/30 border-r-cardBorder/30 text-left`}>
                            <div className="flex items-center justify-between text-[9px] text-slate-500 mb-0.5">
                              <span className="font-bold tracking-wide uppercase text-[8px]">
                                {n.type.replace(/_/g, " ")}
                              </span>
                              <span>{n.timestamp}</span>
                            </div>
                            <p className="text-xs text-slate-300 leading-tight font-medium">{n.message}</p>
                          </div>
                        );
                      })
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </header>

        {}
        <main className="flex-1 overflow-y-auto p-6 md:p-8">
          <Outlet />
        </main>
      </div>

      {}
      <button 
        onClick={() => setChatOpen(!chatOpen)}
        className="fixed bottom-6 right-6 z-[1002] bg-brandBlue hover:bg-blue-600 text-white p-4 rounded-full shadow-2xl flex items-center justify-center transition-all animate-bounce"
        style={{ animationDuration: '3s' }}
      >
        <MessageSquare size={24} />
      </button>

      {}
      <div className={`fixed inset-y-0 right-0 z-[1005] w-full sm:w-96 bg-slate-950/95 backdrop-blur-md border-l border-cardBorder/80 p-5 flex flex-col shadow-2xl transition-transform duration-300 transform ${
        chatOpen ? "translate-x-0" : "translate-x-full"
      }`}>
        <div className="flex items-center justify-between border-b border-cardBorder/40 pb-3 mb-4">
          <div className="flex items-center gap-2">
            <div className="bg-brandBlue/10 p-1.5 rounded-lg border border-brandBlue/20 text-brandBlue">
              <Sparkles size={16} />
            </div>
            <h3 className="font-outfit font-bold text-slate-200 text-base">GridPulse Assistant</h3>
          </div>
          <button 
            onClick={() => setChatOpen(false)}
            className="text-slate-400 hover:text-white p-1 hover:bg-slate-800 rounded-lg"
          >
            <X size={18} />
          </button>
        </div>

        {}
        <div className="flex-1 overflow-y-auto space-y-4 pr-1 min-h-0 text-xs">
          {chatMessages.map((msg, idx) => (
            <div key={idx} className={`flex ${msg.sender === "user" ? "justify-end" : "justify-start"}`}>
              <div className={`max-w-[85%] rounded-2xl p-3.5 leading-relaxed border ${
                msg.sender === "user" 
                  ? "bg-brandBlue text-white border-blue-600 rounded-tr-none" 
                  : "bg-slate-900/60 text-slate-300 border-cardBorder rounded-tl-none"
              }`}>
                <p className="whitespace-pre-line">{msg.text}</p>
              </div>
            </div>
          ))}
          {chatLoading && (
            <div className="flex justify-start">
              <div className="bg-slate-900/60 text-slate-500 border border-cardBorder rounded-2xl rounded-tl-none p-3.5 flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-slate-500 animate-bounce" style={{ animationDelay: '0ms' }} />
                <span className="w-1.5 h-1.5 rounded-full bg-slate-500 animate-bounce" style={{ animationDelay: '150ms' }} />
                <span className="w-1.5 h-1.5 rounded-full bg-slate-500 animate-bounce" style={{ animationDelay: '300ms' }} />
              </div>
            </div>
          )}
          <div ref={chatEndRef} />
        </div>

        {}
        <div className="py-3 border-t border-cardBorder/20 mt-3 flex flex-wrap gap-1.5">
          {quickPrompts.map(p => (
            <button
              key={p}
              onClick={() => sendChatMessage(p)}
              className="text-[10px] text-slate-400 bg-slate-900 hover:bg-slate-850 hover:text-white px-2.5 py-1.5 rounded-lg border border-cardBorder/40 transition-all text-left truncate max-w-full"
            >
              {p}
            </button>
          ))}
        </div>

        {}
        <form 
          onSubmit={(e) => {
            e.preventDefault();
            sendChatMessage(chatInput);
          }}
          className="flex gap-2 pt-3 border-t border-cardBorder/40"
        >
          <input 
            type="text"
            placeholder="Ask a question..."
            value={chatInput}
            onChange={(e) => setChatInput(e.target.value)}
            className="flex-1 bg-slate-900/60 border border-cardBorder rounded-xl px-3.5 py-2.5 text-xs text-slate-200 placeholder-slate-600 focus:outline-none focus:border-brandBlue focus:ring-1 focus:ring-brandBlue/30 transition-all"
          />
          <button 
            type="submit"
            className="bg-brandBlue hover:bg-blue-600 text-white p-2.5 rounded-xl shadow-lg shadow-brandBlue/20 transition-all flex items-center justify-center"
          >
            <Send size={14} />
          </button>
        </form>
      </div>
    </div>
  );
};

export default DashboardLayout;

