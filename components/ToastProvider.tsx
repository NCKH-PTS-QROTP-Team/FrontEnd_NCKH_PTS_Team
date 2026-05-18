import React, { createContext, useCallback, useContext, useState } from 'react';
import { ToastContainer, ToastData, ToastType } from './Toast';

// ===================== Context =====================
interface ToastContextValue {
  showToast: (message: string, type?: ToastType, title?: string, duration?: number) => void;
}

const ToastContext = createContext<ToastContextValue>({
  showToast: () => {},
});

// ===================== Hook =====================
export function useToast() {
  return useContext(ToastContext);
}

// ===================== Provider =====================
let toastCounter = 0;
const MAX_TOASTS = 3;

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<ToastData[]>([]);

  const showToast = useCallback(
    (message: string, type: ToastType = 'success', title?: string, duration: number = 3500) => {
      const id = `toast_${++toastCounter}_${Date.now()}`;
      setToasts((prev) => {
        const next = [...prev, { id, message, title, type, duration }];
        // Giữ tối đa MAX_TOASTS, xóa cái cũ nhất
        if (next.length > MAX_TOASTS) {
          return next.slice(next.length - MAX_TOASTS);
        }
        return next;
      });
    },
    [],
  );

  const dismissToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      <ToastContainer toasts={toasts} onDismiss={dismissToast} />
    </ToastContext.Provider>
  );
}
