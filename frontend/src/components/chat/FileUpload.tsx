'use client';

import React, { useState, useRef, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'framer-motion';
import {
  PhotoIcon,
  DocumentIcon,
  XMarkIcon,
  PaperAirplaneIcon,
  ArrowPathIcon,
} from '@heroicons/react/24/outline';

interface FileUploadProps {
  onSendFiles: (files: File[], message?: string) => void;
  onCancel: () => void;
  isOpen: boolean;
  maxFileSize?: number; // in MB
  allowedTypes?: string[];
}

interface FileWithPreview {
  file: File;
  preview?: string;
  id: string;
}

export const FileUpload: React.FC<FileUploadProps> = ({
  onSendFiles,
  onCancel,
  isOpen,
  maxFileSize = 10,
  allowedTypes = ['image/*', 'application/pdf', 'text/*', 'video/*', 'audio/*'],
}) => {
  const { t } = useTranslation();
  const [files, setFiles] = useState<FileWithPreview[]>([]);
  const [message, setMessage] = useState('');
  const [dragOver, setDragOver] = useState(false);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const generatePreview = useCallback(async (file: File): Promise<string | undefined> => {
    if (file.type.startsWith('image/')) {
      return new Promise((resolve) => {
        const reader = new FileReader();
        reader.onload = (e) => resolve(e.target?.result as string);
        reader.readAsDataURL(file);
      });
    }
    return undefined;
  }, []);

  const addFiles = useCallback(async (newFiles: FileList | File[]) => {
    const fileArray = Array.from(newFiles);
    const validFiles: FileWithPreview[] = [];

    for (const file of fileArray) {
      // Check file size
      if (file.size > maxFileSize * 1024 * 1024) {
        alert(`File ${file.name} is too large. Maximum size is ${maxFileSize}MB.`);
        continue;
      }

      // Check file type
      const isValidType = allowedTypes.some(type => {
        if (type.endsWith('/*')) {
          const baseType = type.slice(0, -2);
          return file.type.startsWith(baseType);
        }
        return file.type === type;
      });

      if (!isValidType) {
        alert(`File ${file.name} is not supported.`);
        continue;
      }

      const preview = await generatePreview(file);
      validFiles.push({
        file,
        preview,
        id: Math.random().toString(36).substr(2, 9),
      });
    }

    setFiles(prev => [...prev, ...validFiles]);
  }, [maxFileSize, allowedTypes, generatePreview]);

  const removeFile = (id: string) => {
    setFiles(prev => prev.filter(f => f.id !== id));
  };

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const droppedFiles = e.dataTransfer.files;
    addFiles(droppedFiles);
  }, [addFiles]);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
  }, []);

  const handleFileInput = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = e.target.files;
    if (selectedFiles) {
      addFiles(selectedFiles);
    }
  }, [addFiles]);

  const handleSend = async () => {
    if (files.length === 0) return;

    setUploading(true);
    try {
      await onSendFiles(files.map(f => f.file), message.trim() || undefined);
      handleCancel();
    } catch (error) {
      console.error('Error sending files:', error);
    } finally {
      setUploading(false);
    }
  };

  const handleCancel = () => {
    setFiles([]);
    setMessage('');
    setDragOver(false);
    setUploading(false);
    onCancel();
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getFileIcon = (fileType: string) => {
    if (fileType.startsWith('image/')) {
      return <PhotoIcon className="w-8 h-8 text-blue-500" />;
    }
    return <DocumentIcon className="w-8 h-8 text-gray-500" />;
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 20 }}
          className="absolute bottom-full left-0 right-0 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg p-4 mb-2"
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-medium text-gray-900 dark:text-white">
              {t('chat.sendFiles') || 'Send Files'}
            </h3>
            <button
              onClick={handleCancel}
              className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
              disabled={uploading}
            >
              <XMarkIcon className="w-4 h-4" />
            </button>
          </div>

          {/* Drop Zone */}
          <div
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors ${
                dragOver
                  ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-900/10'
                  : 'border-gray-300 dark:border-gray-600'
            }`}
          >
            <div className="space-y-2">
              <PhotoIcon className="w-12 h-12 text-gray-400 mx-auto" />
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {t('chat.dropFiles') || 'Drop files here or click to browse'}
              </p>
              <button
                onClick={() => fileInputRef.current?.click()}
                className="text-sm text-emerald-600 hover:text-emerald-700 dark:text-emerald-400 dark:hover:text-emerald-300"
                disabled={uploading}
              >
                {t('chat.chooseFiles') || 'Choose Files'}
              </button>
            </div>
          </div>

          <input
            ref={fileInputRef}
            type="file"
            multiple
            onChange={handleFileInput}
            className="hidden"
            accept={allowedTypes.join(',')}
            disabled={uploading}
          />

          {/* File List */}
          {files.length > 0 && (
            <div className="mt-4 space-y-2 max-h-48 overflow-y-auto">
              {files.map((fileWithPreview) => (
                <motion.div
                  key={fileWithPreview.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  className="flex items-center space-x-3 p-2 bg-gray-50 dark:bg-gray-700 rounded-lg"
                >
                  {fileWithPreview.preview ? (
                    <img
                      src={fileWithPreview.preview}
                      alt={fileWithPreview.file.name}
                      className="w-12 h-12 object-cover rounded-lg"
                    />
                  ) : (
                    <div className="w-12 h-12 flex items-center justify-center bg-gray-200 dark:bg-gray-600 rounded-lg">
                      {getFileIcon(fileWithPreview.file.type)}
                    </div>
                  )}
                  
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                      {fileWithPreview.file.name}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {formatFileSize(fileWithPreview.file.size)}
                    </p>
                  </div>

                  <button
                    onClick={() => removeFile(fileWithPreview.id)}
                    className="text-gray-400 hover:text-red-500 dark:hover:text-red-400"
                    disabled={uploading}
                  >
                    <XMarkIcon className="w-4 h-4" />
                  </button>
                </motion.div>
              ))}
            </div>
          )}

          {/* Message Input */}
          {files.length > 0 && (
            <div className="mt-4">
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder={t('chat.addCaption') || 'Add a caption (optional)...'}
                className="w-full p-2 border border-gray-200 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 resize-none"
                rows={2}
                disabled={uploading}
              />
            </div>
          )}

          {/* Action Buttons */}
          {files.length > 0 && (
            <div className="mt-4 flex items-center justify-end space-x-2">
              <button
                onClick={handleCancel}
                className="px-4 py-2 text-sm text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200"
                disabled={uploading}
              >
                {t('common.cancel') || 'Cancel'}
              </button>
              <motion.button
                whileHover={{ scale: uploading ? 1 : 1.05 }}
                whileTap={{ scale: uploading ? 1 : 0.95 }}
                onClick={handleSend}
                disabled={uploading}
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 disabled:bg-gray-400 text-white text-sm rounded-lg flex items-center space-x-2 transition-colors"
              >
                {uploading ? (
                  <>
                    <ArrowPathIcon className="w-4 h-4 animate-spin" />
                    <span>{t('chat.uploading') || 'Uploading...'}</span>
                  </>
                ) : (
                  <>
                    <PaperAirplaneIcon className="w-4 h-4" />
                    <span>{t('chat.send') || 'Send'}</span>
                  </>
                )}
              </motion.button>
            </div>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );
};
