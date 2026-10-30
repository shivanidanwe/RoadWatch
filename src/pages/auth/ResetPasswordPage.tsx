import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Lock, ArrowLeft, CheckCircle2, Shield } from 'lucide-react';

export const ResetPasswordPage: React.FC = () => {
  const navigate = useNavigate();
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      setErrorMsg('Passwords do not match');
      return;
    }
    if (password.length < 8) {
      setErrorMsg('Password must be at least 8 characters long');
      return;
    }
    setErrorMsg('');
    setSubmitted(true);
    setTimeout(() => navigate('/login'), 2000);
  };

  return (
    <div className="min-h-screen bg-[#100B1D] flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8 text-[#F5F3FF]">
      <div className="mx-auto w-full max-w-md bg-[#211735] p-8 rounded-2xl shadow-2xl border border-[#3B2D53]">
        <div className="mb-6">
          <Link
            to="/login"
            className="inline-flex items-center text-xs text-[#A78BFA] font-medium hover:underline mb-4 gap-1"
          >
            <ArrowLeft className="w-3.5 h-3.5" /> Back to Sign In
          </Link>
          <div className="flex items-center gap-2 mb-2">
            <div className="w-8 h-8 rounded-lg bg-[#8B5CF6]/20 border border-[#8B5CF6]/40 flex items-center justify-center text-[#A78BFA]">
              <Shield className="w-4 h-4" />
            </div>
            <h2 className="text-lg font-bold text-[#F5F3FF]">Choose New Password</h2>
          </div>
          <p className="text-xs text-[#B9AECF]">
            Set a secure password for your Municipal Authority Admin account.
          </p>
        </div>

        {errorMsg && (
          <div className="p-3 mb-4 rounded-lg bg-[#FB7185]/15 border border-[#FB7185]/30 text-xs text-[#FB7185]">
            {errorMsg}
          </div>
        )}

        {submitted ? (
          <div className="p-4 rounded-xl bg-[#10B981]/15 border border-[#10B981]/30 text-xs text-[#34D399] space-y-2 text-center">
            <CheckCircle2 className="w-6 h-6 text-[#34D399] mx-auto" />
            <h4 className="font-bold text-[#F5F3FF]">Password Updated Successfully</h4>
            <p className="text-[#B9AECF]">Redirecting to admin login portal...</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-[#F5F3FF] mb-1">New Admin Password</label>
              <div className="relative">
                <Lock className="w-4 h-4 text-[#B9AECF] absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="w-full pl-9 pr-3 py-2 text-xs border border-[#3B2D53] rounded-lg bg-[#140E22] text-[#F5F3FF] focus:outline-none focus:border-[#A78BFA] transition"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#F5F3FF] mb-1">Confirm New Password</label>
              <div className="relative">
                <Lock className="w-4 h-4 text-[#B9AECF] absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="password"
                  required
                  value={confirmPassword}
                  onChange={e => setConfirmPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="w-full pl-9 pr-3 py-2 text-xs border border-[#3B2D53] rounded-lg bg-[#140E22] text-[#F5F3FF] focus:outline-none focus:border-[#A78BFA] transition"
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-2.5 px-4 text-xs font-semibold rounded-lg text-white bg-[#8B5CF6] hover:bg-[#7C3AED] shadow-xs transition"
            >
              Update Password
            </button>
          </form>
        )}
      </div>
    </div>
  );
};
