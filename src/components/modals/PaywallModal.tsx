'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Lock } from 'lucide-react';

interface PaywallModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function PaywallModal({ isOpen, onClose }: PaywallModalProps) {
  const handleViewPlans = () => {
    onClose();
    setTimeout(() => {
      const section = document.getElementById('pricing');
      section?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 150);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50"
            onClick={onClose}
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ type: 'spring', duration: 0.45 }}
            className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-md z-50 rounded-2xl overflow-hidden"
            style={{
              background: 'linear-gradient(150deg, #0D1117 0%, #0c1a10 100%)',
              border: '1px solid rgba(27,147,88,0.22)',
              boxShadow: '0 24px 64px rgba(0,0,0,0.55), 0 0 0 1px rgba(27,147,88,0.12)',
            }}
          >
            <button
              onClick={onClose}
              className="absolute top-4 right-4 p-2 rounded-full transition-colors cursor-pointer hover:bg-white/10"
              aria-label="Close"
            >
              <X size={18} style={{ color: 'rgba(255,255,255,0.5)' }} />
            </button>

            <div className="p-8 flex flex-col items-center text-center">
              <div
                className="w-16 h-16 rounded-2xl flex items-center justify-center mb-5"
                style={{
                  background: 'rgba(27,147,88,0.12)',
                  border: '1px solid rgba(27,147,88,0.28)',
                  boxShadow: '0 0 32px rgba(27,147,88,0.20)',
                }}
              >
                <Lock size={28} style={{ color: '#1B9358' }} />
              </div>

              <h2 className="text-xl font-bold text-white mb-3">Pro Feature</h2>

              <p
                className="text-sm leading-relaxed mb-4"
                style={{ color: 'rgba(255,255,255,0.60)' }}
              >
                To export your cleaned and structured data, please unlock a premium plan.
              </p>

              <div
                className="w-full text-xs mb-8 px-4 py-2.5 rounded-xl"
                style={{
                  color: 'rgba(52,211,130,0.90)',
                  background: 'rgba(27,147,88,0.09)',
                  border: '1px solid rgba(27,147,88,0.18)',
                }}
              >
                Your privacy is our priority — all processing happens locally.
              </div>

              <button
                onClick={handleViewPlans}
                className="w-full py-3.5 rounded-xl font-semibold text-sm text-white transition-all duration-200 hover:brightness-110 hover:-translate-y-px cursor-pointer"
                style={{
                  background: 'linear-gradient(135deg, #1B9358 0%, #16a34a 100%)',
                  boxShadow: '0 4px 20px rgba(27,147,88,0.38)',
                }}
              >
                View Plans
              </button>

              <button
                onClick={onClose}
                className="mt-3 w-full py-3 rounded-xl text-sm font-medium transition-colors cursor-pointer hover:text-white/60"
                style={{ color: 'rgba(255,255,255,0.35)' }}
              >
                Maybe later
              </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
