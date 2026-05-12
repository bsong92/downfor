"use client";

import { createContext, useContext, useMemo, useState } from "react";

type ToastTone = "success" | "error" | "info";

type Toast = {
  id: number;
  title: string;
  tone: ToastTone;
};

type ToastInput = {
  title: string;
  tone?: ToastTone;
};

type ToastContextValue = {
  pushToast: (toast: ToastInput) => void;
};

const ToastContext = createContext<ToastContextValue | null>(null);

function toneStyles(tone: ToastTone) {
  if (tone === "error") return "border-rose-200 bg-rose-50 text-rose-800";
  if (tone === "info") return "border-slate-200 bg-slate-50 text-slate-800";
  return "border-emerald-200 bg-emerald-50 text-emerald-800";
}

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const value = useMemo<ToastContextValue>(
    () => ({
      pushToast: ({ title, tone = "success" }) => {
        const id = Date.now() + Math.random();
        setToasts((current) => [...current, { id, title, tone }]);
        window.setTimeout(() => {
          setToasts((current) => current.filter((toast) => toast.id !== id));
        }, 2400);
      },
    }),
    []
  );

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div className="pointer-events-none fixed right-4 top-20 z-50 flex w-[min(92vw,20rem)] flex-col gap-2">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className={`pointer-events-auto rounded-2xl border px-4 py-3 text-sm font-semibold shadow-[0_18px_50px_rgba(15,23,42,0.10)] ${toneStyles(toast.tone)}`}
          >
            {toast.title}
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const value = useContext(ToastContext);
  if (!value) {
    throw new Error("useToast must be used within ToastProvider");
  }
  return value;
}
