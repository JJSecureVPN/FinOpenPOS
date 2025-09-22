"use client";

import * as React from "react";
import { X } from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface AlertModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  message: string;
  variant?: "default" | "success" | "error" | "warning";
}

export function AlertModal({
  isOpen,
  onClose,
  title,
  message,
  variant = "default"
}: AlertModalProps) {
  const getVariantStyles = () => {
    switch (variant) {
      case "success":
        return "text-green-600";
      case "error":
        return "text-red-600";
      case "warning":
        return "text-yellow-600";
      default:
        return "text-foreground";
    }
  };

  const getDefaultTitle = () => {
    switch (variant) {
      case "success":
        return "¡Éxito!";
      case "error":
        return "Error";
      case "warning":
        return "Advertencia";
      default:
        return "Información";
    }
  };

  return (
    <AlertDialog open={isOpen} onOpenChange={onClose}>
      <AlertDialogContent className="sm:max-w-[425px]">
        <AlertDialogHeader>
          <AlertDialogTitle className={getVariantStyles()}>
            {title || getDefaultTitle()}
          </AlertDialogTitle>
          <AlertDialogDescription className="text-base whitespace-pre-line">
            {message}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogAction onClick={onClose}>
            Aceptar
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

// Hook personalizado para usar AlertModal
export function useAlert() {
  const [alertState, setAlertState] = React.useState<{
    isOpen: boolean;
    title?: string;
    message: string;
    variant?: "default" | "success" | "error" | "warning";
  }>({
    isOpen: false,
    message: "",
  });

  const showAlert = React.useCallback((
    message: string,
    options?: {
      title?: string;
      variant?: "default" | "success" | "error" | "warning";
    }
  ) => {
    setAlertState({
      isOpen: true,
      message,
      title: options?.title,
      variant: options?.variant,
    });
  }, []);

  const hideAlert = React.useCallback(() => {
    setAlertState(prev => ({ ...prev, isOpen: false }));
  }, []);

  const AlertModalComponent = React.useCallback(() => (
    <AlertModal
      isOpen={alertState.isOpen}
      onClose={hideAlert}
      title={alertState.title}
      message={alertState.message}
      variant={alertState.variant}
    />
  ), [alertState, hideAlert]);

  return {
    showAlert,
    hideAlert,
    AlertModal: AlertModalComponent,
  };
}