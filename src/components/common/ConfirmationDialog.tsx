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
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity" onClick={onClose} />

        <div className="relative transform overflow-hidden rounded-xl bg-[#211735] text-left shadow-2xl transition-all sm:my-8 sm:w-full sm:max-w-lg border border-[#3B2D53] text-[#F5F3FF]">
          <div className="p-6">
            <div className="flex items-start gap-4">
              <div
                className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full ${
                  isDestructive ? 'bg-[#FB7185]/20 text-[#FB7185]' : 'bg-[#8B5CF6]/20 text-[#A78BFA]'
                }`}
              >
                <AlertTriangle className="h-5 w-5" />
              </div>
              <div className="flex-1">
                <h3 className="text-base font-bold text-[#F5F3FF]">{title}</h3>
                <p className="mt-2 text-xs text-[#B9AECF] leading-relaxed">{message}</p>
                {children && <div className="mt-4">{children}</div>}
              </div>
              <button
                onClick={onClose}
                className="text-[#B9AECF] hover:text-[#F5F3FF] p-1 rounded hover:bg-[#2B2042]"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          <div className="bg-[#140E22] px-6 py-3.5 flex flex-row-reverse gap-2 border-t border-[#3B2D53]">
            <button
              type="button"
              onClick={() => {
                onConfirm();
                onClose();
              }}
              className={`inline-flex justify-center rounded-lg px-3.5 py-1.5 text-xs font-semibold text-white shadow-xs focus:outline-none transition ${
                isDestructive
                  ? 'bg-[#FB7185] hover:bg-rose-600'
                  : 'bg-[#8B5CF6] hover:bg-[#7C3AED]'
              }`}
            >
              {confirmLabel}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="inline-flex justify-center rounded-lg border border-[#3B2D53] bg-[#2B2042] px-3.5 py-1.5 text-xs font-semibold text-[#F5F3FF] shadow-xs hover:bg-[#3B2D53] transition"
            >
              {cancelLabel}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
