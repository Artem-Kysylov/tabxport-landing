'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Share, Plus } from 'lucide-react';
import Image from 'next/image';

interface IOSInstallSheetProps {
  isOpen: boolean;
  onClose: () => void;
}

export const IOSInstallSheet: React.FC<IOSInstallSheetProps> = ({ isOpen, onClose }) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={onClose}
            style={{
              position: 'fixed',
              inset: 0,
              backgroundColor: 'rgba(0, 0, 0, 0.5)',
              zIndex: 9998,
            }}
          />

          {/* Bottom Sheet */}
          <motion.div
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 30, stiffness: 300 }}
            style={{
              position: 'fixed',
              bottom: 0,
              left: 0,
              right: 0,
              zIndex: 9999,
              maxWidth: '600px',
              margin: '0 auto',
            }}
          >
            <div
              style={{
                background: '#FFFFFF',
                borderTopLeftRadius: '24px',
                borderTopRightRadius: '24px',
                padding: '24px',
                boxShadow: '0 -4px 20px rgba(0, 0, 0, 0.1)',
              }}
            >
              {/* Close button */}
              <button
                onClick={onClose}
                style={{
                  position: 'absolute',
                  top: '16px',
                  right: '16px',
                  background: 'transparent',
                  border: 'none',
                  cursor: 'pointer',
                  padding: '8px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#062013',
                  opacity: 0.6,
                  transition: 'opacity 0.2s',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.opacity = '1';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.opacity = '0.6';
                }}
                aria-label="Close"
              >
                <X size={24} />
              </button>

              {/* Content */}
              <div style={{ textAlign: 'center', paddingTop: '8px' }}>
                {/* Logo */}
                <div style={{ marginBottom: '20px', display: 'flex', justifyContent: 'center' }}>
                  <Image
                    src="/logo-dark.svg"
                    alt="TableXport"
                    width={120}
                    height={49}
                    style={{ height: 'auto' }}
                  />
                </div>

                {/* Title */}
                <h3
                  style={{
                    fontSize: '20px',
                    fontWeight: '600',
                    color: '#062013',
                    margin: '0 0 8px 0',
                  }}
                >
                  Install TableXport
                </h3>

                {/* Subtitle */}
                <p
                  style={{
                    fontSize: '14px',
                    fontWeight: 'normal',
                    color: '#062013',
                    opacity: 0.7,
                    margin: '0 0 32px 0',
                    lineHeight: '1.5',
                  }}
                >
                  Get instant access from your home screen
                </p>

                {/* Steps */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', marginBottom: '32px' }}>
                  {/* Step 1 */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '16px', textAlign: 'left' }}>
                    <div
                      style={{
                        width: '48px',
                        height: '48px',
                        borderRadius: '12px',
                        background: '#F8F9FA',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexShrink: 0,
                      }}
                    >
                      <Share size={24} color="#1B9358" />
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: '16px', fontWeight: '600', color: '#062013', marginBottom: '4px' }}>
                        1. Tap the Share button
                      </div>
                      <div style={{ fontSize: '14px', color: '#062013', opacity: 0.6 }}>
                        Located at the bottom of Safari
                      </div>
                    </div>
                  </div>

                  {/* Step 2 */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '16px', textAlign: 'left' }}>
                    <div
                      style={{
                        width: '48px',
                        height: '48px',
                        borderRadius: '12px',
                        background: '#F8F9FA',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexShrink: 0,
                      }}
                    >
                      <Plus size={24} color="#1B9358" />
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: '16px', fontWeight: '600', color: '#062013', marginBottom: '4px' }}>
                        2. Add to Home Screen
                      </div>
                      <div style={{ fontSize: '14px', color: '#062013', opacity: 0.6 }}>
                        Scroll down and tap the option
                      </div>
                    </div>
                  </div>
                </div>

                {/* Got it button */}
                <button
                  onClick={onClose}
                  style={{
                    width: '100%',
                    background: '#1B9358',
                    border: 'none',
                    color: '#FFFFFF',
                    padding: '16px 24px',
                    borderRadius: '12px',
                    fontSize: '16px',
                    fontWeight: '600',
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.opacity = '0.9';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.opacity = '1';
                  }}
                >
                  Got it
                </button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};
