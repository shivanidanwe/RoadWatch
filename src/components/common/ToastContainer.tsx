import React from 'react';
import { useApp } from '../../context/AppContext';
import { CheckCircle2, AlertCircle, Info, AlertTriangle, X } from 'lucide-react';

export const ToastContainer: React.FC = () => {
  const { toasts, removeToast } = useApp();

  if (toasts.length === 0) return null;

  return (
    <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2 max-w-sm w-full pointer-events-none">
      {toasts.map(toast => {
        const icon = {
          success: <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />,
          error: <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />,
          warning: <AlertTriangle className="w-5 h-5 text-amber-500 shrink-0" />,
          info: <Info className="w-5 h-5 text-blue-600 shrink-0" />,
        }[toast.type];

        const borderColor = {
          success: 'border-emerald-200 bg-white text-[#1E1B2E]',
          error: 'border-rose-200 bg-white text-[#1E1B2E]',
          warning: 'border-amber-200 bg-white text-[#1E1B2E]',
          info: 'border-blue-200 bg-white text-[#1E1B2E]',
        }[toast.type];

        return (
          <div
            key={toast.id}
            className={`pointer-events-auto p-3.5 rounded-xl border shadow-xl flex items-start justify-between gap-3 animate-in fade-in slide-in-from-bottom-2 duration-150 ${borderColor}`}
          >
            <div className="flex items-start gap-2.5">
              {icon}
              <div>
                <h4 className="text-xs font-bold text-[#1E1B2E]">{toast.title}</h4>
                <p className="text-xs text-[#64748B] mt-0.5 leading-snug">{toast.message}</p>
              </div>
            </div>
            <button
              onClick={() => removeToast(toast.id)}
              className="text-[#94A3B8] hover:text-[#1E1B2E] p-0.5 rounded transition"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        );
      })}
    </div>
  );
};
