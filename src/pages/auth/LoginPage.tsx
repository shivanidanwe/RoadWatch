import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import { apiService } from '../../services/api';
import { Shield, Eye, EyeOff, Lock, Mail, ArrowRight, CheckCircle2 } from 'lucide-react';

export const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const { addToast, refreshData } = useApp();

  const [email, setEmail] = useState('admin@roadwatch.gov');
  const [password, setPassword] = useState('Admin@RoadWatch2026!');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMsg('');

    try {
      await apiService.login(email.trim(), password);
      await refreshData();
      addToast('success', 'Authenticated', 'Welcome to RoadWatch Municipal Authority Admin Portal.');
      navigate('/dashboard');
    } catch (err: any) {
      setErrorMsg(err.message || 'Authentication failed. Please verify credentials.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#100B1D] flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8 text-[#F5F3FF]">
      <div className="mx-auto w-full max-w-4xl bg-[#211735] rounded-2xl shadow-2xl border border-[#3B2D53] overflow-hidden grid grid-cols-1 md:grid-cols-2">
        {/* Left: Product & Civic Intelligence Info */}
        <div className="bg-[#140E22] p-8 sm:p-10 text-white flex flex-col justify-between relative overflow-hidden border-b md:border-b-0 md:border-r border-[#3B2D53]">
          <div className="space-y-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-[#8B5CF6]/20 border border-[#8B5CF6]/40 flex items-center justify-center text-[#A78BFA] shadow-inner">
                <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M4 19L12 3l8 16" />
                  <path d="M12 9v4" />
                  <path d="M12 17h.01" />
                </svg>
              </div>
              <div>
                <h1 className="font-bold text-lg text-[#F5F3FF]">RoadWatch</h1>
                <p className="text-xs text-[#A78BFA]">Predictive Infrastructure Intelligence</p>
              </div>
            </div>

            <div className="space-y-3 pt-2">
              <h2 className="text-xl sm:text-2xl font-bold leading-snug text-[#F5F3FF]">
                Municipal Road Distress &amp; Maintenance Prediction
              </h2>
              <p className="text-xs text-[#B9AECF] leading-relaxed">
                Connects continuous pavement telemetry, citizen reports, traffic intensity, and weather exposure to forecast road deterioration before structural failure occurs.
              </p>
            </div>

            <div className="space-y-2.5 pt-2 text-xs text-[#B9AECF]">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-[#34D399] shrink-0" />
                <span>Explainable 0–100 risk scoring framework</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-[#34D399] shrink-0" />
                <span>Geospatial corridors &amp; ward tracking</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-[#34D399] shrink-0" />
                <span>Field inspection &amp; work order dispatch</span>
              </div>
            </div>
          </div>

          <div className="pt-8 border-t border-[#3B2D53] flex items-center justify-between text-[11px] text-[#B9AECF]">
            <span>RoadWatch Platform v2.4</span>
            <span className="flex items-center gap-1">
              <Shield className="w-3.5 h-3.5 text-[#A78BFA]" />
              Municipal Officer Portal
            </span>
          </div>
        </div>

        {/* Right: Login Form */}
        <div className="p-8 sm:p-10 flex flex-col justify-between bg-[#211735]">
          <div>
            <div className="mb-6">
              <h2 className="text-xl font-bold text-[#F5F3FF]">Officer Sign In</h2>
              <p className="text-xs text-[#B9AECF] mt-1">
                Enter your authorized credentials to access platform modules
              </p>
            </div>

            {errorMsg && (
              <div className="mb-4 p-3 rounded-lg bg-[#FB7185]/15 border border-[#FB7185]/40 text-[#FB7185] text-xs">
                {errorMsg}
              </div>
            )}

            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-[#B9AECF] mb-1">Official Email Address</label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-[#B9AECF]/50 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 text-xs border border-[#3B2D53] rounded-lg bg-[#140E22] text-[#F5F3FF] focus:outline-none focus:border-[#A78BFA] transition"
                    placeholder="officer@roadwatch.gov"
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-xs font-semibold text-[#B9AECF]">Password</label>
                  <Link to="/forgot-password" className="text-xs text-[#A78BFA] font-medium hover:underline">
                    Forgot password?
                  </Link>
                </div>
                <div className="relative">
                  <Lock className="w-4 h-4 text-[#B9AECF]/50 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    className="w-full pl-9 pr-9 py-2 text-xs border border-[#3B2D53] rounded-lg bg-[#140E22] text-[#F5F3FF] focus:outline-none focus:border-[#A78BFA] transition"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-[#B9AECF] hover:text-[#F5F3FF]"
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
                  className="h-3.5 w-3.5 rounded border-[#3B2D53] bg-[#140E22] text-[#8B5CF6] focus:ring-[#8B5CF6]"
                />
                <label htmlFor="remember-me" className="ml-2 block text-xs text-[#B9AECF]">
                  Remember this device (Demo Session)
                </label>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full flex items-center justify-center gap-2 py-2.5 px-4 text-xs font-semibold rounded-lg text-white bg-[#8B5CF6] hover:bg-[#7C3AED] shadow-xs transition disabled:opacity-50"
              >
                {isLoading ? 'Authenticating...' : 'Sign In as Municipal Authority Admin'}
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>

            {/* Public Citizen Reporting Access (Prompt Section 3 & 4) */}
            <div className="mt-6 pt-5 border-t border-[#3B2D53]">
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#A78BFA] block mb-2">
                Public Civic Services:
              </span>
              <Link
                to="/report"
                className="flex items-center justify-between p-3 border border-[#8B5CF6]/40 rounded-xl bg-[#8B5CF6]/10 hover:bg-[#8B5CF6]/20 transition group"
              >
                <div>
                  <strong className="block text-[#F5F3FF] text-xs font-semibold">Citizen Road Damage Report</strong>
                  <span className="text-[11px] text-[#B9AECF]">Report potholes, cracks, or surface failures without login</span>
                </div>
                <div className="w-7 h-7 rounded-lg bg-[#8B5CF6] text-white flex items-center justify-center shrink-0 group-hover:translate-x-0.5 transition-transform">
                  <ArrowRight className="w-4 h-4" />
                </div>
              </Link>
            </div>
          </div>

          <div className="mt-4 text-center">
            <span className="text-[10px] text-[#B9AECF]/60">
              Only authorized Municipal Authority Admin users may access dashboard operations.
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
