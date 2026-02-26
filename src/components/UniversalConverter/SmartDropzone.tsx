'use client';

import React, { useState, useCallback, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { SparklesIcon } from '@/components/icons/FormatIcons';

interface SmartDropzoneProps {
  onDataReceived: (data: string) => void;
  isProcessing?: boolean;
  errorMessage?: string | null;
}

export const SmartDropzone: React.FC<SmartDropzoneProps> = ({ 
  onDataReceived, 
  isProcessing = false,
  errorMessage = null,
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const [isFocused, setIsFocused] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const dragDepthRef = useRef(0);

  const handleDragEnter = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    dragDepthRef.current += 1;
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    dragDepthRef.current = Math.max(0, dragDepthRef.current - 1);
    if (dragDepthRef.current === 0) setIsDragging(false);
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  const handleDrop = useCallback(
    async (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      dragDepthRef.current = 0;
      setIsDragging(false);

      const files = Array.from(e.dataTransfer.files);
      const htmlData = e.dataTransfer.getData('text/html');
      const textData = e.dataTransfer.getData('text/plain');

      if (htmlData) {
        onDataReceived(htmlData);
        return;
      }

      if (textData) {
        onDataReceived(textData);
        return;
      }

      if (files.length > 0) {
        const file = files[0];
        try {
          const text = await file.text();
          onDataReceived(text);
        } catch (error) {
          console.error('Failed to read file:', error);
        }
      }
    },
    [onDataReceived]
  );

  const handlePaste = useCallback(
    (e: React.ClipboardEvent<HTMLTextAreaElement>) => {
      const pastedText = e.clipboardData.getData('text/plain');
      if (pastedText) {
        onDataReceived(pastedText);
      }
    },
    [onDataReceived]
  );

  const handleTextChange = useCallback(
    (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      const text = e.target.value;
      if (text.trim()) {
        onDataReceived(text);
      }
    },
    [onDataReceived]
  );

  useEffect(() => {
    if (!isProcessing && !errorMessage && textareaRef.current) {
      textareaRef.current.value = '';
    }
  }, [errorMessage, isProcessing]);

  return (
    <motion.div
      className="relative w-full max-w-3xl mx-auto"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div
        className={`
          relative rounded-2xl border-2 border-dashed transition-all duration-300
          ${isDragging 
            ? 'border-primary bg-primary-light/30 scale-105' 
            : isFocused
            ? 'border-primary bg-primary-light/10'
            : 'border-primary-light bg-white hover:border-primary hover:bg-primary-light/5'
          }
          ${isProcessing ? 'opacity-50 pointer-events-none' : ''}
        `}
        onDragEnter={handleDragEnter}
        onDragLeave={handleDragLeave}
        onDragOver={handleDragOver}
        onDrop={handleDrop}
      >
        <div className="p-8">
          <div className="flex flex-col items-center justify-center gap-4 mb-6">
            <motion.div
              animate={isDragging ? { scale: 1.2, rotate: 180 } : { scale: 1, rotate: 0 }}
              transition={{ duration: 0.3 }}
              className="text-primary"
            >
              <SparklesIcon size={48} />
            </motion.div>

            <div className="text-center">
              <h3 className="text-2xl font-bold text-secondary mb-2">
                {isDragging ? 'Drop your table here!' : 'Smart Table Dropzone'}
              </h3>
              <p className="text-base text-secondary/70">
                Paste, drag & drop, or type your table data
              </p>
              <p className="text-sm text-secondary/50 mt-1">
                Supports: HTML, Markdown, CSV, TSV
              </p>
            </div>
          </div>

          <textarea
            ref={textareaRef}
            className="w-full min-h-[200px] p-4 rounded-xl border-2 border-primary-light 
                     focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20
                     resize-none font-mono text-sm transition-all duration-200
                     placeholder:text-secondary/40"
            placeholder="Paste your table here or drag & drop a file..."
            onPaste={handlePaste}
            onChange={handleTextChange}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            disabled={isProcessing}
          />

          {errorMessage && (
            <div className="mt-3 rounded-xl border border-destructive/30 bg-destructive/5 px-4 py-3 text-sm text-destructive">
              {errorMessage}
            </div>
          )}

          <AnimatePresence>
            {isDragging && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="absolute inset-0 flex items-center justify-center 
                         bg-primary-light/20 backdrop-blur-sm rounded-2xl pointer-events-none"
              >
                <div className="text-center">
                  <SparklesIcon size={64} className="text-primary mx-auto mb-4" />
                  <p className="text-xl font-bold text-primary">
                    Release to process
                  </p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {isProcessing && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="absolute inset-0 flex items-center justify-center 
                   bg-white/80 backdrop-blur-sm rounded-2xl"
        >
          <div className="flex items-center gap-3">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
            >
              <SparklesIcon size={32} className="text-primary" />
            </motion.div>
            <p className="text-lg font-semibold text-secondary">
              Processing your table...
            </p>
          </div>
        </motion.div>
      )}
    </motion.div>
  );
};
