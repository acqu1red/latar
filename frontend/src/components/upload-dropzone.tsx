"use client"

import React, { useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { cn } from '@/lib/utils';

interface UploadDropzoneProps {
  onFilesAccepted: (files: File[]) => void;
  className?: string;
  disabled?: boolean;
}

export function UploadDropzone({
  onFilesAccepted,
  className,
  disabled = false,
}: UploadDropzoneProps) {
  const onDrop = useCallback(
    (acceptedFiles: File[]) => {
      onFilesAccepted(acceptedFiles);
    },
    [onFilesAccepted]
  );

  const { getRootProps, getInputProps, isDragActive, isDragReject } = useDropzone({
    onDrop,
    disabled,
    accept: {
      'image/*': ['.jpeg', '.png', '.gif', '.svg'],
      'application/pdf': ['.pdf'],
    },
    multiple: false, // Пока только один файл
  });

  const dropzoneClasses = cn(
    "flex flex-col items-center justify-center p-6 border-2 border-dashed rounded-lg text-center transition-colors duration-200",
    "focus:outline-none",
    disabled
      ? "cursor-not-allowed bg-gray-100 text-gray-400 border-gray-200"
      : "cursor-pointer bg-white hover:bg-gray-50 text-gray-600 border-gray-300",
    isDragActive && "border-blue-500 bg-blue-50 text-blue-700",
    isDragReject && "border-red-500 bg-red-50 text-red-700",
    className
  );

  return (
    <div {...getRootProps({ className: dropzoneClasses })}>
      <input {...getInputProps()} />
      {
        isDragActive ? (
          isDragReject ? (
            <p>Неверный тип файла!</p>
          ) : (
            <p>Перетащите файл сюда...</p>
          )
        ) : (
          <p>Перетащите файл сюда или нажмите, чтобы выбрать файл</p>
        )
      }
      <em className="text-sm text-gray-500 mt-2">Только .jpeg, .png, .gif, .svg, .pdf</em>
    </div>
  );
}
