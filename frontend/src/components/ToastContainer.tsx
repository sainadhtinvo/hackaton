import React from 'react';
import Toast from './Toast';
import { type ToastMessage } from '../hooks/useToast';

interface ToastContainerProps {
  toasts: ToastMessage[];
  onRemoveToast: (id: string) => void;
}

const ToastContainer: React.FC<ToastContainerProps> = ({ toasts, onRemoveToast }) => {
  return (
    <div className="toast-container">
      {toasts.map((toast, index) => (
        <Toast
          key={toast.id}
          message={toast.message}
          type={toast.type}
          isVisible={true}
          onClose={() => onRemoveToast(toast.id)}
          duration={0} // Duration is handled by useToast hook
        />
      ))}
    </div>
  );
};

export default ToastContainer;
