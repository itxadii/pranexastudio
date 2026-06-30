import React, { useEffect } from "react";

interface DialogProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  description?: string;
  children: React.ReactNode;
}

export const Dialog: React.FC<DialogProps> = ({
  isOpen,
  onClose,
  title,
  description,
  children
}) => {
  // Prevent body scroll when open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop overlay */}
      <div 
        className="fixed inset-0 bg-black/40 backdrop-blur-xs transition-opacity duration-300 animate-fadeIn" 
        onClick={onClose}
      />
      
      {/* Dialog content box */}
      <div className="relative z-10 w-full max-w-lg bg-white rounded-2xl border border-cream-dark p-6 sm:p-8 text-text-dark shadow-2xl animate-scaleUp max-h-[90vh] overflow-y-auto">
        
        {/* Close Button */}
        <button 
          onClick={onClose}
          className="absolute right-4 top-4 p-1.5 text-text-muted hover:text-text-dark hover:bg-cream-dark/50 rounded-full transition-all duration-200"
          aria-label="Close dialog"
        >
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2.5" stroke="currentColor" className="w-5 h-5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
          </svg>
        </button>

        {/* Header */}
        <div className="mb-6">
          <h2 className="font-serif text-2xl sm:text-3xl font-bold text-deep-teal leading-tight">
            {title}
          </h2>
          {description && (
            <p className="mt-2 text-sm text-text-muted">
              {description}
            </p>
          )}
        </div>

        {/* Main Body */}
        <div className="text-sm leading-relaxed">
          {children}
        </div>

      </div>
    </div>
  );
};

interface ConfirmationDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  isDestructive?: boolean;
  isLoading?: boolean;
}

export const ConfirmationDialog: React.FC<ConfirmationDialogProps> = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = "Confirm",
  cancelText = "Cancel",
  isDestructive = false,
  isLoading = false
}) => {
  return (
    <Dialog isOpen={isOpen} onClose={onClose} title={title}>
      <div className="space-y-6">
        <p className="text-text-muted text-[15px] leading-relaxed">{message}</p>
        
        <div className="flex justify-end gap-3 pt-2">
          <button
            type="button"
            onClick={onClose}
            disabled={isLoading}
            className="px-5 py-2.5 rounded-full border border-text-dark/20 text-text-dark hover:bg-cream-dark/50 font-semibold text-sm transition-colors disabled:opacity-50"
          >
            {cancelText}
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={isLoading}
            className={`px-5 py-2.5 rounded-full text-white font-semibold text-sm transition-colors shadow-sm disabled:opacity-50 ${
              isDestructive 
                ? "bg-red-600 hover:bg-red-700" 
                : "bg-deep-teal hover:bg-teal-dark"
            }`}
          >
            {isLoading ? "Processing..." : confirmText}
          </button>
        </div>
      </div>
    </Dialog>
  );
};
