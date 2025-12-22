
'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { X, AlertTriangle } from 'lucide-react';
import { useEffect } from 'react';

interface ConfirmationToastProps {
  isOpen: boolean;
  title: string;
  description: string;
  onConfirm: () => void;
  onCancel: () => void;
  duration?: number;
}

export function ConfirmationToast({
  isOpen,
  title,
  description,
  onConfirm,
  onCancel,
  duration = 7000,
}: ConfirmationToastProps) {
    
  useEffect(() => {
    if (isOpen) {
      const timer = setTimeout(() => {
        onCancel();
      }, duration);
      return () => clearTimeout(timer);
    }
  }, [isOpen, duration, onCancel]);
    
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0, x: '100%' }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: '100%' }}
          transition={{ duration: 0.3, ease: 'easeInOut' }}
          className="fixed top-24 right-4 z-[100] w-full max-w-sm rounded-lg border bg-card p-4 shadow-lg"
        >
          <div className="flex items-start gap-4">
            <div className="mt-1">
                <AlertTriangle className="h-5 w-5 text-destructive" />
            </div>
            <div className="flex-grow">
              <h3 className="font-semibold">{title}</h3>
              <p className="text-sm text-muted-foreground">{description}</p>
              <div className="mt-4 flex gap-2">
                <Button
                  size="sm"
                  variant="destructive"
                  onClick={onConfirm}
                  className="flex-1"
                >
                  Confirm Delete
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={onCancel}
                  className="flex-1"
                >
                  Cancel
                </Button>
              </div>
            </div>
            <Button variant="ghost" size="icon" className="h-7 w-7 shrink-0" onClick={onCancel}>
                <X className="h-4 w-4" />
            </Button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
