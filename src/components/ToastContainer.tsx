import React from 'react';
import { useRestaurant } from '../context/RestaurantContext';
import { AlertTriangle, CheckCircle, Info, XCircle, X } from 'lucide-react';

export const ToastContainer: React.FC = () => {
  const { toasts, removeToast } = useRestaurant();

  if (toasts.length === 0) return null;

  return (
    <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2 max-w-sm w-full pointer-events-none px-2 sm:px-0">
      {toasts.map((toast) => {
        let bgColor = 'bg-stone-900 text-white border-stone-800';
        let Icon = Info;
        let iconColor = 'text-blue-400';

        if (toast.type === 'success') {
          bgColor = 'bg-stone-900 text-white border-emerald-500/50';
          Icon = CheckCircle;
          iconColor = 'text-emerald-400';
        } else if (toast.type === 'warning') {
          bgColor = 'bg-stone-950 text-white border-amber-500/80 shadow-amber-500/10';
          Icon = AlertTriangle;
          iconColor = 'text-amber-400';
        } else if (toast.type === 'error') {
          bgColor = 'bg-stone-950 text-white border-rose-500/80 shadow-rose-500/10';
          Icon = XCircle;
          iconColor = 'text-rose-400';
        }

        return (
          <div
            key={toast.id}
            className={`pointer-events-auto p-3.5 rounded-2xl border shadow-xl flex items-start justify-between gap-3 animate-in fade-in slide-in-from-bottom-2 duration-200 ${bgColor}`}
          >
            <div className="flex items-start gap-2.5">
              <Icon className={`w-5 h-5 shrink-0 mt-0.5 ${iconColor}`} />
              <div>
                <h4 className="text-xs font-bold text-white leading-tight">
                  {toast.title}
                </h4>
                <p className="text-[11px] text-stone-300 mt-0.5 leading-relaxed">
                  {toast.message}
                </p>
              </div>
            </div>

            <button
              onClick={() => removeToast(toast.id)}
              className="text-stone-400 hover:text-white p-0.5 rounded transition-colors shrink-0"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        );
      })}
    </div>
  );
};
