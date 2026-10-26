import React, { ReactNode } from 'react';
import { AlertTriangle, X } from 'lucide-react';

interface ConfirmationDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  isDestructive?: boolean;
  children?: ReactNode;
}

export const ConfirmationDialog: React.FC<ConfirmationDialogProps> = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmLabel = 'Confirm Action',
  cancelLabel = 'Cancel',
  isDestructive = false,
  children,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0">
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs transition-opacity" onClick={onClose} />

        <div className="relative transform overflow-hidden rounded-xl bg-white text-left shadow-2xl transition-all sm:my-8 sm:w-full sm:max-w-lg border border-[#E2E8F0]">
          <div className="p-6">
            <div className="flex items-start gap-4">
              <div
                className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full ${
                  isDestructive ? 'bg-red-100 text-red-600' : 'bg-blue-100 text-blue-600'
                }`}
              >
                <AlertTriangle className="h-5 w-5" />
              </div>
              <div className="flex-1">
                <h3 className="text-base font-bold text-[#172033]">{title}</h3>
                <p className="mt-2 text-xs text-[#64748B] leading-relaxed">{message}</p>
                {children && <div className="mt-4">{children}</div>}
              </div>
              <button
                onClick={onClose}
                className="text-[#94A3B8] hover:text-[#172033] p-1 rounded hover:bg-slate-100"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          <div className="bg-slate-50 px-6 py-3.5 flex flex-row-reverse gap-2 border-t border-[#E2E8F0]">
            <button
              type="button"
              onClick={() => {
                onConfirm();
                onClose();
              }}
              className={`inline-flex justify-center rounded-lg px-3.5 py-1.5 text-xs font-semibold text-white shadow-xs focus:outline-none ${
                isDestructive
                  ? 'bg-red-600 hover:bg-red-700'
                  : 'bg-blue-600 hover:bg-blue-700'
              }`}
            >
              {confirmLabel}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="inline-flex justify-center rounded-lg border border-[#E2E8F0] bg-white px-3.5 py-1.5 text-xs font-semibold text-[#172033] shadow-xs hover:bg-slate-50"
            >
              {cancelLabel}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
