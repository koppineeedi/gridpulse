import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { BatteryCharging, Lock, User, AlertCircle, Mail, Key, CheckCircle, RefreshCw } from "lucide-react";
import authService from "../services/authService";
import API from "../services/api";

const Login = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  
  const [forgotMode, setForgotMode] = useState(false);
  const [forgotStep, setForgotStep] = useState(1); 
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [resetPassword, setResetPassword] = useState("");
  const [forgotMsg, setForgotMsg] = useState("");
  const [forgotError, setForgotError] = useState("");
  const [forgotLoading, setForgotLoading] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      await authService.login(username, password);
      navigate("/");
    } catch (err) {
      setError(err.response?.data?.message || "Invalid credentials. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleSendOtp = async (e) => {
    e.preventDefault();
    setForgotError("");
    setForgotMsg("");
    setForgotLoading(true);

    try {
      await API.post("/auth/forgot-password", { email });
      setForgotMsg("Verification OTP successfully generated and sent to your email. Check server console logs.");
      setForgotStep(2);
    } catch (err) {
      setForgotError(err.response?.data?.message || "Failed to request OTP. Please verify email is correct.");
    } finally {
      setForgotLoading(false);
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    setForgotError("");
    setForgotMsg("");
    setForgotLoading(true);

    try {
      await API.post("/auth/reset-password", { email, otp, password: resetPassword });
      setForgotMsg("Your password has been successfully reset. Redirecting to login...");
      setTimeout(() => {
        setForgotMode(false);
        setForgotStep(1);
        setEmail("");
        setOtp("");
        setResetPassword("");
        setForgotMsg("");
      }, 2000);
    } catch (err) {
      setForgotError(err.response?.data?.message || "Failed to reset password. OTP code may be invalid or expired.");
    } finally {
      setForgotLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-darkBg flex flex-col justify-center items-center px-4 relative overflow-hidden">
      {}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-brandBlue/5 rounded-full filter blur-[100px] pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-emerald-500/5 rounded-full filter blur-[100px] pointer-events-none" />

      <div className="w-full max-w-md space-y-8 z-10">
        <div className="text-center">
          <div className="inline-flex bg-brandBlue/10 p-3.5 rounded-2xl border border-brandBlue/20 text-brandBlue mb-4 shadow-lg shadow-brandBlue/10 animate-bounce" style={{ animationDuration: '3s' }}>
            <BatteryCharging size={36} />
          </div>
          <h1 className="font-outfit text-3xl font-extrabold tracking-tight bg-gradient-to-r from-blue-400 via-indigo-400 to-emerald-400 bg-clip-text text-transparent">
            GridPulse Portal
          </h1>
          <p className="text-slate-400 text-sm mt-2">Smart Municipal Grid Monitoring Console</p>
        </div>

        <div className="glass-panel p-8 shadow-2xl border-cardBorder/80">
          {!forgotMode ? (
            
            <>
              <h2 className="text-xl font-bold font-outfit text-slate-200 mb-6 text-center">Login to Console</h2>
              
              {error && (
                <div className="flex items-center gap-2.5 p-3.5 bg-red-500/10 border border-red-500/20 text-red-400 rounded-xl text-xs mb-5">
                  <AlertCircle size={16} />
                  <span>{error}</span>
                </div>
              )}

              <form onSubmit={handleLogin} className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-400" htmlFor="username">Username</label>
                  <div className="relative">
                    <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-500">
                      <User size={16} />
                    </span>
                    <input
                      id="username"
                      type="text"
                      required
                      placeholder="Enter username"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      className="w-full bg-slate-950/60 border border-cardBorder rounded-xl py-3 pl-10 pr-4 text-sm text-slate-200 placeholder-slate-600 focus:outline-none focus:border-brandBlue focus:ring-1 focus:ring-brandBlue/30 transition-all"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <div className="flex justify-between items-center">
                    <label className="text-xs font-semibold text-slate-400" htmlFor="password">Password</label>
                    <button 
                      type="button"
                      onClick={() => setForgotMode(true)}
                      className="text-xs font-semibold text-brandBlue hover:underline"
                    >
                      Forgot Password?
                    </button>
                  </div>
                  <div className="relative">
                    <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-500">
                      <Lock size={16} />
                    </span>
                    <input
                      id="password"
                      type="password"
                      required
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full bg-slate-950/60 border border-cardBorder rounded-xl py-3 pl-10 pr-4 text-sm text-slate-200 placeholder-slate-600 focus:outline-none focus:border-brandBlue focus:ring-1 focus:ring-brandBlue/30 transition-all"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-brandBlue hover:bg-blue-600 text-white font-semibold py-3 px-4 rounded-xl shadow-lg shadow-brandBlue/20 transition-all flex items-center justify-center gap-2 mt-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? <RefreshCw className="animate-spin" size={16} /> : "Login"}
                </button>
              </form>
            </>
          ) : (
            
            <>
              <h2 className="text-xl font-bold font-outfit text-slate-200 mb-6 text-center">Reset Password</h2>
              
              {forgotError && (
                <div className="flex items-center gap-2.5 p-3.5 bg-red-500/10 border border-red-500/20 text-red-400 rounded-xl text-xs mb-5">
                  <AlertCircle size={16} />
                  <span>{forgotError}</span>
                </div>
              )}
              {forgotMsg && (
                <div className="flex items-center gap-2.5 p-3.5 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-xl text-xs mb-5">
                  <CheckCircle size={16} />
                  <span>{forgotMsg}</span>
                </div>
              )}

              {forgotStep === 1 ? (
                <form onSubmit={handleSendOtp} className="space-y-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-slate-400" htmlFor="forgot-email">Registered Email Address</label>
                    <div className="relative">
                      <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-500">
                        <Mail size={16} />
                      </span>
                      <input
                        id="forgot-email"
                        type="email"
                        required
                        placeholder="E.g., tech@gridpulse.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full bg-slate-950/60 border border-cardBorder rounded-xl py-3 pl-10 pr-4 text-sm text-slate-200 focus:outline-none focus:border-brandBlue transition-all"
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={forgotLoading}
                    className="w-full bg-brandBlue hover:bg-blue-600 text-white font-semibold py-3 px-4 rounded-xl shadow-lg transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                  >
                    {forgotLoading ? <RefreshCw className="animate-spin" size={16} /> : "Request Reset OTP"}
                  </button>
                  <button 
                    type="button"
                    onClick={() => setForgotMode(false)}
                    className="w-full text-xs text-slate-500 hover:text-slate-350 font-bold py-1.5 mt-1"
                  >
                    Back to Login
                  </button>
                </form>
              ) : (
                <form onSubmit={handleResetPassword} className="space-y-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-slate-400" htmlFor="otp">Enter 6-Digit OTP</label>
                    <div className="relative">
                      <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-500">
                        <Key size={16} />
                      </span>
                      <input
                        id="otp"
                        type="text"
                        required
                        placeholder="Check console logs/email"
                        value={otp}
                        onChange={(e) => setOtp(e.target.value)}
                        className="w-full bg-slate-950/60 border border-cardBorder rounded-xl py-3 pl-10 pr-4 text-sm text-slate-200 focus:outline-none focus:border-brandBlue transition-all font-mono"
                      />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-slate-400" htmlFor="new-password">New Password</label>
                    <div className="relative">
                      <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-500">
                        <Lock size={16} />
                      </span>
                      <input
                        id="new-password"
                        type="password"
                        required
                        placeholder="••••••••"
                        value={resetPassword}
                        onChange={(e) => setResetPassword(e.target.value)}
                        className="w-full bg-slate-950/60 border border-cardBorder rounded-xl py-3 pl-10 pr-4 text-sm text-slate-200 focus:outline-none focus:border-brandBlue transition-all"
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={forgotLoading}
                    className="w-full bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-bold py-3 px-4 rounded-xl shadow-lg transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                  >
                    {forgotLoading ? <RefreshCw className="animate-spin" size={16} /> : "Update Password"}
                  </button>
                  <button 
                    type="button"
                    onClick={() => { setForgotStep(1); setForgotMsg(""); }}
                    className="w-full text-xs text-slate-550 hover:text-slate-350 font-bold py-1.5 mt-1"
                  >
                    Re-request OTP
                  </button>
                </form>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default Login;
