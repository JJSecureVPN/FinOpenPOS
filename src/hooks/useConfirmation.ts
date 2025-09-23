"use client";

import { useState } from "react";

interface UseConfirmationProps {
  title: string;
  description: string;
  confirmText?: string;
  cancelText?: string;
  variant?: "default" | "destructive";
}

export function useConfirmation() {
  const [isOpen, setIsOpen] = useState(false);
  const [config, setConfig] = useState<UseConfirmationProps | null>(null);
  const [onConfirmCallback, setOnConfirmCallback] = useState<(() => void | Promise<void>) | null>(null);

  const showConfirmation = (
    options: UseConfirmationProps,
    onConfirm: () => void | Promise<void>
  ) => {
    setConfig(options);
    setOnConfirmCallback(() => onConfirm);
    setIsOpen(true);
  };

  const handleConfirm = async () => {
    if (onConfirmCallback) {
      await onConfirmCallback();
    }
    setIsOpen(false);
    setConfig(null);
    setOnConfirmCallback(null);
  };

  const handleCancel = () => {
    setIsOpen(false);
    setConfig(null);
    setOnConfirmCallback(null);
  };

  return {
    isOpen,
    config,
    showConfirmation,
    handleConfirm,
    handleCancel,
  };
}

// Hook para confirmaciones simples sin componente visual
export function useSimpleConfirmation() {
  const confirm = (
    title: string,
    description: string,
    onConfirm: () => void | Promise<void>,
    options?: {
      confirmText?: string;
      cancelText?: string;
      variant?: "default" | "destructive";
    }
  ) => {
    // Para mantener compatibilidad, pero se recomienda usar ConfirmationModal
    console.warn('useSimpleConfirmation está deprecated, usa ConfirmationModal para mejor UX');
    
    // Fallback silencioso - mejor usar ConfirmationModal directamente
    onConfirm();
  };

  return { confirm };
}