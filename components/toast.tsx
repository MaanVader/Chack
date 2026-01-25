// components/toast.tsx

"use client";

import { useEffect, useState } from "react";
import { Check, AlertTriangle, AlertCircle, Info, X } from "lucide-react";

interface ToastProps {
  message: string;
  type: "success" | "error" | "warning" | "info";
  onClose: () => void;
  duration?: number;
}

export function Toast({ message, type, onClose, duration = 4000 }: ToastProps) {
  const [isExiting, setIsExiting] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsExiting(true);
      setTimeout(onClose, 300); // Wait for exit animation
    }, duration);

    return () => clearTimeout(timer);
  }, [duration, onClose]);

  const styles = {
    success: "border-green-200 bg-green-500/10 text-green-700 dark:border-green-800 dark:bg-green-500/20 dark:text-green-300",
    error: "border-red-200 bg-red-500/10 text-red-700 dark:border-red-800 dark:bg-red-500/20 dark:text-red-300",
    warning: "border-yellow-200 bg-yellow-500/10 text-yellow-700 dark:border-yellow-800 dark:bg-yellow-500/20 dark:text-yellow-300",
    info: "border-blue-200 bg-blue-500/10 text-blue-700 dark:border-blue-800 dark:bg-blue-500/20 dark:text-blue-300",
  };

  const icons = {
    success: <Check className="w-5 h-5" />,
    error: <AlertCircle className="w-5 h-5" />,
    warning: <AlertTriangle className="w-5 h-5" />,
    info: <Info className="w-5 h-5" />,
  };

  return (
    <div
      className={`fixed top-4 right-4 z-[100] rounded-xl border px-5 py-4 shadow-xl backdrop-blur-md transition-all duration-300 flex items-center gap-3 min-w-[300px] max-w-sm ${styles[type]
        } ${isExiting ? "opacity-0 translate-x-8" : "opacity-100 translate-x-0 animate-in slide-in-from-right-5 fade-in-0"}`}
    >
      <span className="shrink-0">{icons[type]}</span>
      <span className="text-sm font-medium flex-1">{message}</span>
      <button
        onClick={() => {
          setIsExiting(true);
          setTimeout(onClose, 300);
        }}
        className="shrink-0 opacity-50 hover:opacity-100 transition-opacity"
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  );
}

export function useToast() {
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" | "warning" | "info" } | null>(null);

  const showToast = (message: string, type: "success" | "error" | "warning" | "info" = "success") => {
    setToast({ message, type });
  };

  const success = (message: string) => showToast(message, "success");
  const error = (message: string) => showToast(message, "error");
  const warning = (message: string) => showToast(message, "warning");
  const info = (message: string) => showToast(message, "info");

  const ToastComponent = toast ? (
    <Toast
      message={toast.message}
      type={toast.type}
      onClose={() => setToast(null)}
    />
  ) : null;

  return { showToast, success, error, warning, info, ToastComponent };
}
