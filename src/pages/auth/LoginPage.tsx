import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import { apiService } from '../../services/api';
import { Shield, Eye, EyeOff, Lock, Mail, ArrowRight, CheckCircle2 } from 'lucide-react';

export const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const { addToast, refreshData } = useApp();

  const [email, setEmail] = useState('anand.rao@roadwatch.gov');
  const [password, setPassword] = useState('••••••••••••');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMsg('');

    try {
      await apiService.login(email, password);
      await refreshData();
      addToast('success', 'Authenticated', 'Welcome back to RoadWatch intelligence portal.');
      navigate('/dashboard');
    } catch (err: any) {
      setErrorMsg(err.message || 'Authentication failed. Please verify credentials.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleQuickDemoUser = (userEmail: string) => {
    setEmail(userEmail);
    setPassword('demo-municipal-access');
  };

  return (
    <div className="min-h-screen bg-[#F5F7FA] flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-4xl bg-white rounded-2xl shadow-xl border border-[#E2E8F0] overflow-hidden grid grid-cols-1 md:grid-cols-2">
        {/* Left: Product & Civic Intelligence Info */}
        <div className="bg-[#1A237E] p-8 sm:p-10 text-white flex flex-col justify-between relative overflow-hidden">
          <div className="absolute inset-0 opacity-10 pointer-events-none">
            <svg width="100%" height="100%">
              <defs>
                <pattern id="grid" width="30" height="30" patternUnits="userSpaceOnUse">
                  <path d="M 30 0 L 0 0 0 30" fill="none" stroke="white" strokeWidth="0.5" />
                </pattern>
              </defs>
              <rect width="100%" height="100%" fill="url(#grid)" />
            </svg>
          </div>

          <div className="relative z-10 space-y-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-blue-500/20 border border-blue-400/30 flex items-center justify-center text-blue-300 shadow-inner">
                <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M4 19L12 3l8 16" />
                  <path d="M12 9v4" />
                  <path d="M12 17h.01" />
                </svg>
              </div>
              <div>
                <h1 className="font-bold text-lg text-white">RoadWatch</h1>
                <p className="text-xs text-blue-200">Predictive Infrastructure Intelligence</p>
              </div>
            </div>

            <div className="space-y-4 pt-4">
              <h2 className="text-xl sm:text-2xl font-bold leading-snug">
                Municipal Road Distress & Maintenance Prediction
              </h2>
              <p className="text-xs text-blue-100/80 leading-relaxed">
                Connects continuous pavement condition telemetry, citizen distress reports, heavy axle freight data, and hydrological weather models to forecast road degradation before failure occurs.
              </p>
            </div>

            <div className="space-y-2.5 pt-2 text-xs text-blue-100">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>Explainable 0–100 risk scoring framework</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>PostGIS geospatial routing & ward tracking</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>Field inspection & work order dispatch</span>
              </div>
            </div>
          </div>

          <div className="relative z-10 pt-8 border-t border-indigo-900/60 flex items-center justify-between text-[11px] text-blue-300/70">
            <span>RoadWatch Platform v2.4</span>
            <span className="flex items-center gap-1">
              <Shield className="w-3.5 h-3.5 text-blue-400" />
              Gov Infrastructure Portal
            </span>
          </div>
        </div>

        {/* Right: Login Form */}
        <div className="p-8 sm:p-10 flex flex-col justify-between">
          <div>
            <div className="mb-6">
              <h2 className="text-xl font-bold text-[#172033]">Municipal Officer Sign In</h2>
              <p className="text-xs text-[#64748B] mt-1">
                Enter your authorized credentials to access platform modules
              </p>
            </div>

            {errorMsg && (
              <div className="mb-4 p-3 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 text-xs">
                {errorMsg}
              </div>
            )}

            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-[#172033] mb-1">Official Email Address</label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-[#94A3B8] absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 text-xs border border-[#E2E8F0] rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 transition"
                    placeholder="officer@roadwatch.gov"
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-xs font-semibold text-[#172033]">Password</label>
                  <Link to="/forgot-password" className="text-[11px] text-blue-600 hover:underline">
                    Forgot password?
                  </Link>
                </div>
                <div className="relative">
                  <Lock className="w-4 h-4 text-[#94A3B8] absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    className="w-full pl-9 pr-9 py-2 text-xs border border-[#E2E8F0] rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 transition"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-[#94A3B8] hover:text-[#172033]"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div className="flex items-center">
                <input
                  id="remember-me"
                  type="checkbox"
                  checked={rememberMe}
                  onChange={e => setRememberMe(e.target.checked)}
                  className="h-3.5 w-3.5 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                />
                <label htmlFor="remember-me" className="ml-2 block text-xs text-[#64748B]">
                  Remember this device (Demo Session)
                </label>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full flex items-center justify-center gap-2 py-2.5 px-4 text-xs font-semibold rounded-lg text-white bg-blue-600 hover:bg-blue-700 shadow-xs transition disabled:opacity-50"
              >
                {isLoading ? 'Authenticating...' : 'Sign In to RoadWatch'}
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>

            {/* Quick Demo Sign In Roles */}
            <div className="mt-6 pt-5 border-t border-[#E2E8F0]">
              <span className="text-[11px] font-bold uppercase tracking-wider text-[#64748B] block mb-2">
                Quick Demo Role Selector:
              </span>
              <div className="grid grid-cols-2 gap-1.5 text-xs">
                <button
                  type="button"
                  onClick={() => handleQuickDemoUser('anand.rao@roadwatch.gov')}
                  className="p-1.5 text-left border border-slate-200 rounded-md hover:bg-slate-50 text-[11px]"
                >
                  <strong className="block text-[#172033]">Dr. Anand Rao</strong>
                  <span className="text-[#64748B] text-[10px]">Chief Road Engineer</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleQuickDemoUser('rajesh.verma@roadwatch.gov')}
                  className="p-1.5 text-left border border-slate-200 rounded-md hover:bg-slate-50 text-[11px]"
                >
                  <strong className="block text-[#172033]">Er. Rajesh Verma</strong>
                  <span className="text-[#64748B] text-[10px]">Senior Field Inspector</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleQuickDemoUser('sunita.patel@roadwatch.gov')}
                  className="p-1.5 text-left border border-slate-200 rounded-md hover:bg-slate-50 text-[11px]"
                >
                  <strong className="block text-[#172033]">Dr. Sunita Patel</strong>
                  <span className="text-[#64748B] text-[10px]">Data Science Lead</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleQuickDemoUser('vikram.roy@roadwatch.gov')}
                  className="p-1.5 text-left border border-slate-200 rounded-md hover:bg-slate-50 text-[11px]"
                >
                  <strong className="block text-[#172033]">Vikramaditya Roy</strong>
                  <span className="text-[#64748B] text-[10px]">Municipal Admin</span>
                </button>
              </div>
            </div>
          </div>

          <div className="mt-4 text-center">
            <span className="text-[10px] text-[#94A3B8]">
              Authorized municipal government access only. All actions are logged.
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
