import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Mail, ArrowLeft, CheckCircle2 } from 'lucide-react';

export const ForgotPasswordPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
  };

  return (
    <div className="min-h-screen bg-[#F5F7FA] flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md bg-white p-8 rounded-2xl shadow-xl border border-[#E2E8F0]">
        <div className="mb-6">
          <Link to="/login" className="inline-flex items-center text-xs text-blue-600 hover:underline mb-4 gap-1">
            <ArrowLeft className="w-3.5 h-3.5" /> Back to Sign In
          </Link>
          <h2 className="text-xl font-bold text-[#172033]">Reset Password</h2>
          <p className="text-xs text-[#64748B] mt-1">
            Enter your municipal directory email to receive a password reset link
          </p>
        </div>

        {submitted ? (
          <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-800 space-y-2">
            <div className="flex items-center gap-2 font-bold">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>Reset link dispatched</span>
            </div>
            <p>
              An automated reset link has been dispatched to <strong>{email}</strong>. Please check your inbox within 15 minutes.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-[#172033] mb-1">Official Email Address</label>
              <div className="relative">
                <Mail className="w-4 h-4 text-[#94A3B8] absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="name@roadwatch.gov"
                  className="w-full pl-9 pr-3 py-2 text-xs border border-[#E2E8F0] rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 transition"
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-2.5 px-4 text-xs font-semibold rounded-lg text-white bg-blue-600 hover:bg-blue-700 shadow-xs transition"
            >
              Send Password Reset Link
            </button>
          </form>
        )}
      </div>
    </div>
  );
};
