import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Mail, ArrowLeft, CheckCircle2, Shield } from 'lucide-react';

export const ForgotPasswordPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
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
            <h2 className="text-lg font-bold text-[#F5F3FF]">Reset Password</h2>
          </div>
          <p className="text-xs text-[#B9AECF]">
            Enter your municipal authority email to receive recovery instructions.
          </p>
        </div>

        {submitted ? (
          <div className="p-4 rounded-xl bg-[#10B981]/15 border border-[#10B981]/30 text-xs text-[#34D399] space-y-2">
            <div className="flex items-center gap-2 font-bold text-[#34D399]">
              <CheckCircle2 className="w-4 h-4 text-[#34D399]" />
              <span>Reset instructions generated</span>
            </div>
            <p className="text-[#F5F3FF] leading-relaxed">
              If an account exists for <strong className="text-[#34D399]">{email}</strong>, recovery instructions have been queued. For immediate access, contact the Municipal IT Security Administrator.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-[#F5F3FF] mb-1">Official Municipal Email</label>
              <div className="relative">
                <Mail className="w-4 h-4 text-[#B9AECF] absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="admin@roadwatch.gov"
                  className="w-full pl-9 pr-3 py-2 text-xs border border-[#3B2D53] rounded-lg bg-[#140E22] text-[#F5F3FF] placeholder-[#B9AECF]/50 focus:outline-none focus:border-[#A78BFA] transition"
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-2.5 px-4 text-xs font-semibold rounded-lg text-white bg-[#8B5CF6] hover:bg-[#7C3AED] shadow-xs transition"
            >
              Send Password Recovery Link
            </button>
          </form>
        )}
      </div>
    </div>
  );
};
