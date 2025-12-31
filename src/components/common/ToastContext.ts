import { createContext } from 'react';
import type { ToastType } from './Toast';

export interface ToastContextType {
  addToast: (message: string, type: ToastType, duration?: number) => void;
}

export const ToastContext = createContext<ToastContextType | undefined>(undefined);
