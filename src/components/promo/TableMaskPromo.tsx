'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';

const TABLEMASK_URL = 'https://tablemask.syntaxlabsapp.com/';

interface TableMaskPromoProps {
  isVisible: boolean;
  onClose: () => void;
}

export const TableMaskPromo: React.FC<TableMaskPromoProps> = ({ isVisible, onClose }) => {
  return (
    <AnimatePresence>
      {isVisible && (
        <motion.aside
          role="complementary"
          aria-label="TableMask promotion"
          initial={{ opacity: 0, y: 48 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 48 }}
          transition={{ duration: 0.4, ease: [0.4, 0, 0.2, 1] }}
          className="fixed bottom-4 right-4 z-[55] w-[calc(100vw-2rem)] max-w-[380px]"
        >
          <div className="relative rounded-xl border-2 border-primary-light bg-white p-5 shadow-[0_8px_32px_rgba(6,32,19,0.12),0_0_0_1px_rgba(27,147,88,0.08)]">
            <button
              type="button"
              onClick={onClose}
              className="absolute top-3 right-3 rounded-full p-1.5 text-secondary/40 transition-colors hover:bg-primary-light/40 hover:text-secondary cursor-pointer"
              aria-label="Close"
            >
              <X size={16} />
            </button>

            <h3 className="pr-8 text-base font-semibold text-secondary leading-snug">
              🔒 Exported Sensitive Data?
            </h3>

            <p className="mt-2.5 text-sm leading-relaxed text-secondary/70">
              Sharing this spreadsheet with ChatGPT, clients, or remote teams? Make sure to mask PII
              (emails, names, revenue) first. TableMask anonymizes your data 100% locally with zero
              data leaks.
            </p>

            <a
              href={TABLEMASK_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-4 inline-flex w-full items-center justify-center rounded-lg bg-primary px-4 py-2.5 text-sm font-semibold text-white shadow-primary-btn transition-all duration-200 hover:-translate-y-px hover:bg-primary/90 hover:shadow-primary-btn-hover"
            >
              Try TableMask
            </a>
          </div>
        </motion.aside>
      )}
    </AnimatePresence>
  );
};
