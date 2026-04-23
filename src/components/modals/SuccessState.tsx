'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Check, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface SuccessStateProps {
  onClose: () => void;
}

export function SuccessState({ onClose }: SuccessStateProps) {
  return (
    <div className="flex flex-col items-center text-center py-8">
      {/* Animated Success Icon */}
      <motion.div
        initial={{ scale: 0, rotate: -180 }}
        animate={{ scale: 1, rotate: 0 }}
        transition={{
          type: 'spring',
          stiffness: 200,
          damping: 15,
          duration: 0.6,
        }}
        className="relative mb-6"
      >
        <div className="w-24 h-24 rounded-full bg-primary/10 flex items-center justify-center">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
            className="w-20 h-20 rounded-full bg-primary flex items-center justify-center"
          >
            <Check size={48} className="text-white" strokeWidth={3} />
          </motion.div>
        </div>
        
        {/* Sparkles Animation */}
        <motion.div
          initial={{ opacity: 0, scale: 0 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.4, duration: 0.3 }}
          className="absolute -top-2 -right-2"
        >
          <Sparkles size={24} className="text-primary" />
        </motion.div>
        <motion.div
          initial={{ opacity: 0, scale: 0 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.5, duration: 0.3 }}
          className="absolute -bottom-2 -left-2"
        >
          <Sparkles size={20} className="text-primary" />
        </motion.div>
      </motion.div>

      {/* Success Message */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3, duration: 0.5 }}
      >
        <h2 className="text-3xl font-bold text-gray-900 mb-3">
          Welcome to TableXport Pro! 🎉
        </h2>
        <p className="text-gray-600 mb-6 max-w-sm mx-auto">
          Your lifetime Pro access is now active. Enjoy unlimited exports, custom PDF branding, and Google Drive integration.
        </p>
      </motion.div>

      {/* Feature Highlights */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5, duration: 0.5 }}
        className="w-full bg-primary/5 rounded-xl p-6 mb-6"
      >
        <div className="space-y-3 text-left">
          {[
            'PDF Export with Custom Branding',
            'Google Drive & Sheets Integration',
            'Unlimited Batch Processing',
            'Priority Support',
          ].map((feature, index) => (
            <motion.div
              key={feature}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.6 + index * 0.1, duration: 0.4 }}
              className="flex items-center gap-3"
            >
              <div className="w-5 h-5 rounded-full bg-primary flex items-center justify-center flex-shrink-0">
                <Check size={14} className="text-white" strokeWidth={3} />
              </div>
              <span className="text-gray-700 text-sm font-medium">{feature}</span>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* Return Button */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.9, duration: 0.5 }}
        className="w-full"
      >
        <Button
          onClick={onClose}
          className="w-full bg-primary text-white font-semibold py-6 rounded-xl shadow-primary-btn transition-all duration-200 ease-out hover:-translate-y-px hover:bg-primary/90 hover:shadow-primary-btn-hover"
        >
          Return to TableXport
        </Button>
      </motion.div>
    </div>
  );
}
