'use client';

import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';
import { useGoogleAuth } from '@/hooks/useGoogleAuth';

interface GoogleAuthPopupProps {
  onClose?: () => void;
  trigger?: boolean;
}

export const GoogleAuthPopup: React.FC<GoogleAuthPopupProps> = ({ onClose, trigger = false }) => {
  const [isVisible, setIsVisible] = useState(false);
  const { signIn, loading, isAuthenticated, hasRequiredScopes } = useGoogleAuth();

  useEffect(() => {
    // Show popup when explicitly triggered and not authenticated
    if (trigger && (!isAuthenticated || !hasRequiredScopes)) {
      setIsVisible(true);
    }
  }, [trigger, isAuthenticated, hasRequiredScopes]);

  useEffect(() => {
    // Hide popup when authenticated
    if (isAuthenticated && hasRequiredScopes) {
      setIsVisible(false);
    }
  }, [isAuthenticated, hasRequiredScopes]);

  const handleClose = () => {
    setIsVisible(false);
    try {
      localStorage.setItem('tx_google_auth_popup_dismissed', 'true');
    } catch {
      // ignore
    }
    onClose?.();
  };

  const handleSignIn = async () => {
    try {
      await signIn();
    } catch (error) {
      console.error('Sign in error:', error);
    }
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, y: 20, x: 20 }}
          animate={{ opacity: 1, y: 0, x: 0 }}
          exit={{ opacity: 0, y: 20, x: 20 }}
          transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
          style={{
            position: 'fixed',
            bottom: '16px',
            right: '16px',
            zIndex: 50,
            maxWidth: '380px',
            width: 'calc(100vw - 32px)',
          }}
        >
          <div
            style={{
              background: '#F8F9FA',
              border: '1px solid #CDD2D0',
              borderRadius: '10px',
              padding: '20px',
              position: 'relative',
            }}
          >
            {/* Close button */}
            <button
              onClick={handleClose}
              style={{
                position: 'absolute',
                top: '12px',
                right: '12px',
                background: 'transparent',
                border: 'none',
                cursor: 'pointer',
                padding: '4px',
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
              <X size={16} />
            </button>

            <div style={{ textAlign: 'center' }}>
              <h3
                style={{
                  fontSize: '14px',
                  fontWeight: '600',
                  color: '#062013',
                  margin: '0 0 12px 0',
                }}
              >
                Sign in to TableXport
              </h3>
              <p
                style={{
                  fontSize: '12px',
                  fontWeight: 'normal',
                  color: '#062013',
                  margin: '0 0 20px 0',
                  lineHeight: '1.5',
                  whiteSpace: 'pre-line',
                }}
              >
                {`Connect your Google account to:
• Export tables to Google Drive
• Create Google Sheets directly
• Unlock all supported export formats: Excel, CSV, DOCX, PDF, Google Sheets`}
              </p>

              <button
                onClick={handleSignIn}
                disabled={loading}
                style={{
                  width: '100%',
                  background: 'white',
                  border: '1.5px solid #CDD2D0',
                  color: '#062013',
                  padding: '12px 20px',
                  borderRadius: '8px',
                  fontSize: '12px',
                  fontWeight: '600',
                  cursor: loading ? 'not-allowed' : 'pointer',
                  transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  opacity: loading ? 0.6 : 1,
                }}
                onMouseEnter={(e) => {
                  if (!loading) {
                    e.currentTarget.style.opacity = '0.5';
                  }
                }}
                onMouseLeave={(e) => {
                  if (!loading) {
                    e.currentTarget.style.opacity = '1';
                  }
                }}
              >
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                  style={{ width: '16px', height: '16px' }}
                >
                  <g clipPath="url(#clip0_192_42)">
                    <mask
                      id="mask0_192_42"
                      style={{ maskType: 'luminance' }}
                      maskUnits="userSpaceOnUse"
                      x="0"
                      y="0"
                      width="24"
                      height="24"
                    >
                      <path
                        d="M23.0404 9.897H12.2629V14.3657H18.4665C17.8882 17.2047 15.4698 18.8344 12.2629 18.8344C8.4776 18.8344 5.42836 15.7852 5.42836 11.9999C5.42836 8.21466 8.4776 5.16542 12.2629 5.16542C13.8926 5.16542 15.3647 5.74374 16.5213 6.69005L19.886 3.32536C17.8356 1.53787 15.207 0.433838 12.2629 0.433838C5.84894 0.433838 0.696777 5.586 0.696777 11.9999C0.696777 18.4138 5.84894 23.566 12.2629 23.566C18.0459 23.566 23.3032 19.3602 23.3032 11.9999C23.3032 11.3165 23.1981 10.5805 23.0404 9.897Z"
                        fill="white"
                      />
                    </mask>
                    <g mask="url(#mask0_192_42)">
                      <path
                        d="M-0.354736 18.8343V5.16528L8.5827 11.9998L-0.354736 18.8343Z"
                        fill="#FBBC05"
                      />
                    </g>
                    <mask
                      id="mask1_192_42"
                      style={{ maskType: 'luminance' }}
                      maskUnits="userSpaceOnUse"
                      x="0"
                      y="0"
                      width="24"
                      height="24"
                    >
                      <path
                        d="M23.0404 9.897H12.2629V14.3657H18.4665C17.8882 17.2047 15.4698 18.8344 12.2629 18.8344C8.4776 18.8344 5.42836 15.7852 5.42836 11.9999C5.42836 8.21466 8.4776 5.16542 12.2629 5.16542C13.8926 5.16542 15.3647 5.74374 16.5213 6.69005L19.886 3.32536C17.8356 1.53787 15.207 0.433838 12.2629 0.433838C5.84894 0.433838 0.696777 5.586 0.696777 11.9999C0.696777 18.4138 5.84894 23.566 12.2629 23.566C18.0459 23.566 23.3032 19.3602 23.3032 11.9999C23.3032 11.3165 23.1981 10.5805 23.0404 9.897Z"
                        fill="white"
                      />
                    </mask>
                    <g mask="url(#mask1_192_42)">
                      <path
                        d="M-0.354736 5.16528L8.5827 11.9998L12.2629 8.68274L24.4086 6.74323V-0.617676H-0.354736V5.16528Z"
                        fill="#EA4335"
                      />
                    </g>
                    <mask
                      id="mask2_192_42"
                      style={{ maskType: 'luminance' }}
                      maskUnits="userSpaceOnUse"
                      x="0"
                      y="0"
                      width="24"
                      height="24"
                    >
                      <path
                        d="M23.0404 9.897H12.2629V14.3657H18.4665C17.8882 17.2047 15.4698 18.8344 12.2629 18.8344C8.4776 18.8344 5.42836 15.7852 5.42836 11.9999C5.42836 8.21466 8.4776 5.16542 12.2629 5.16542C13.8926 5.16542 15.3647 5.74374 16.5213 6.69005L19.886 3.32536C17.8356 1.53787 15.207 0.433838 12.2629 0.433838C5.84894 0.433838 0.696777 5.586 0.696777 11.9999C0.696777 18.4138 5.84894 23.566 12.2629 23.566C18.0459 23.566 23.3032 19.3602 23.3032 11.9999C23.3032 11.3165 23.1981 10.5805 23.0404 9.897Z"
                        fill="white"
                      />
                    </mask>
                    <g mask="url(#mask2_192_42)">
                      <path
                        d="M-0.354736 18.8343L15.4698 6.74323L19.7281 7.21795L24.4086 -0.617676V24.6171H-0.354736V18.8343Z"
                        fill="#34A853"
                      />
                    </g>
                    <mask
                      id="mask3_192_42"
                      style={{ maskType: 'luminance' }}
                      maskUnits="userSpaceOnUse"
                      x="0"
                      y="0"
                      width="24"
                      height="24"
                    >
                      <path
                        d="M23.0404 9.897H12.2629V14.3657H18.4665C17.8882 17.2047 15.4698 18.8344 12.2629 18.8344C8.4776 18.8344 5.42836 15.7852 5.42836 11.9999C5.42836 8.21466 8.4776 5.16542 12.2629 5.16542C13.8926 5.16542 15.3647 5.74374 16.5213 6.69005L19.886 3.32536C17.8356 1.53787 15.207 0.433838 12.2629 0.433838C5.84894 0.433838 0.696777 5.586 0.696777 11.9999C0.696777 18.4138 5.84894 23.566 12.2629 23.566C18.0459 23.566 23.3032 19.3602 23.3032 11.9999C23.3032 11.3165 23.1981 10.5805 23.0404 9.897Z"
                        fill="white"
                      />
                    </mask>
                    <g mask="url(#mask3_192_42)">
                      <path
                        d="M24.4086 24.6171L8.5827 11.9998L6.74316 10.5278L24.4086 5.16528V24.6171Z"
                        fill="#4285F4"
                      />
                    </g>
                  </g>
                  <defs>
                    <clipPath id="clip0_192_42">
                      <rect width="24" height="24" fill="white" />
                    </clipPath>
                  </defs>
                </svg>
                {loading ? 'Signing in...' : 'Continue with Google'}
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
