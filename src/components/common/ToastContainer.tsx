import React from 'react';
import { useAuth, ToastItem } from '../../context/AuthContext';
import { CheckCircle2, AlertCircle, Info, Zap, X } from 'lucide-react';

export const ToastContainer: React.FC = () => {
  const { toasts, dismissToast } = useAuth();

  if (!toasts || toasts.length === 0) return null;

  const getToastIcon = (type: ToastItem['type']) => {
    switch (type) {
      case 'success':
        return <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0" />;
      case 'error':
        return <AlertCircle className="w-5 h-5 text-rose-500 shrink-0" />;
      case 'realtime':
        return <Zap className="w-5 h-5 text-amber-500 shrink-0" />;
      case 'info':
      default:
        return <Info className="w-5 h-5 text-blue-500 shrink-0" />;
    }
  };

  const getToastStyle = (type: ToastItem['type']) => {
    switch (type) {
      case 'success':
        return 'border-emerald-200 shadow-emerald-500/10';
      case 'error':
        return 'border-rose-200 shadow-rose-500/10';
      case 'realtime':
        return 'border-amber-300 ring-1 ring-amber-400/20 shadow-amber-500/10';
      case 'info':
      default:
        return 'border-slate-200 shadow-slate-500/10';
    }
  };

  return (
    <div 
      className="fixed bottom-5 right-5 z-50 flex flex-col gap-2.5 max-w-sm w-full pointer-events-none px-4 sm:px-0"
      aria-live="polite"
      aria-atomic="true"
    >
      {toasts.map(toast => (
        <div
          key={toast.id}
          className={`pointer-events-auto flex items-start gap-3 p-3.5 rounded-2xl bg-white border shadow-xl transition-all animate-in slide-in-from-bottom-4 fade-in duration-200 ${getToastStyle(
            toast.type
          )}`}
        >
          {getToastIcon(toast.type)}

          <div className="flex-1 min-w-0">
            {toast.title && (
              <div className="text-xs font-bold text-slate-900 leading-tight mb-0.5">
                {toast.title}
              </div>
            )}
            <div className="text-xs text-slate-600 leading-relaxed break-words">
              {toast.text}
            </div>
            {toast.timestamp && (
              <div className="text-[10px] mt-1 text-slate-400">
                {toast.timestamp}
              </div>
            )}
          </div>

          <button
            type="button"
            onClick={() => dismissToast(toast.id)}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors shrink-0 cursor-pointer"
            aria-label="Dismiss notification"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      ))}
    </div>
  );
};
