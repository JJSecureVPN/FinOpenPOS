import React from 'react';

// Store para configuración del sistema
type PaymentConfig = {
  enableCash: boolean;
  enableCard: boolean;
  enableTransfer: boolean;
  taxRate: number;
  discountEnabled: boolean;
  tipEnabled: boolean;
};

type CompanyConfig = {
  name: string;
  address: string;
  phone: string;
  email: string;
  taxId: string;
  currency: string;
  timezone: string;
};

type PrinterConfig = {
  receiptPrinter: string;
  kitchenPrinter: string;
  receiptWidth: string;
  printLogo: boolean;
  autoprint: boolean;
};

type SystemConfig = {
  company: CompanyConfig;
  payment: PaymentConfig;
  printer: PrinterConfig;
};

// Tipo para los métodos de pago habilitados
export type PaymentMethod = {
  id: 'cash' | 'credit-card' | 'debit-card' | 'transfer';
  name: string;
  type: 'cash' | 'card' | 'transfer';
};

// Configuración por defecto
const defaultConfig: SystemConfig = {
  company: {
    name: "FinOpenPOS",
    address: "123 Calle Principal, Ciudad",
    phone: "+1 (555) 123-4567",
    email: "info@finopenpos.com",
    taxId: "12345678-9",
    currency: "USD",
    timezone: "America/New_York"
  },
  payment: {
    enableCash: true,
    enableCard: true,
    enableTransfer: false,
    taxRate: 0.16,
    discountEnabled: true,
    tipEnabled: false
  },
  printer: {
    receiptPrinter: "default",
    kitchenPrinter: "none",
    receiptWidth: "80mm",
    printLogo: true,
    autoprint: false
  }
};

// Funciones para gestionar la configuración
export const configService = {
  // Obtener configuración actual
  getConfig: (): SystemConfig => {
    if (typeof window === 'undefined') return defaultConfig;
    
    const stored = localStorage.getItem('finopenpos_config');
    if (stored) {
      try {
        return { ...defaultConfig, ...JSON.parse(stored) };
      } catch (error) {
        console.error('Error parsing config:', error);
        return defaultConfig;
      }
    }
    return defaultConfig;
  },

  // Guardar configuración completa
  saveConfig: (config: Partial<SystemConfig>): void => {
    if (typeof window === 'undefined') return;
    
    const currentConfig = configService.getConfig();
    const newConfig = { ...currentConfig, ...config };
    localStorage.setItem('finopenpos_config', JSON.stringify(newConfig));
    
    // Disparar evento personalizado para notificar cambios
    window.dispatchEvent(new CustomEvent('configChanged', { detail: newConfig }));
  },

  // Funciones específicas para cada tipo de configuración
  getPaymentConfig: (): PaymentConfig => {
    return configService.getConfig().payment;
  },

  savePaymentConfig: (paymentConfig: Partial<PaymentConfig>): void => {
    const currentConfig = configService.getConfig();
    const newConfig = {
      ...currentConfig,
      payment: { ...currentConfig.payment, ...paymentConfig }
    };
    configService.saveConfig(newConfig);
  },

  getCompanyConfig: (): CompanyConfig => {
    return configService.getConfig().company;
  },

  saveCompanyConfig: (companyConfig: Partial<CompanyConfig>): void => {
    const currentConfig = configService.getConfig();
    const newConfig = {
      ...currentConfig,
      company: { ...currentConfig.company, ...companyConfig }
    };
    configService.saveConfig(newConfig);
  },

  getPrinterConfig: (): PrinterConfig => {
    return configService.getConfig().printer;
  },

  savePrinterConfig: (printerConfig: Partial<PrinterConfig>): void => {
    const currentConfig = configService.getConfig();
    const newConfig = {
      ...currentConfig,
      printer: { ...currentConfig.printer, ...printerConfig }
    };
    configService.saveConfig(newConfig);
  },

  // Función para obtener métodos de pago habilitados
  getEnabledPaymentMethods: (): PaymentMethod[] => {
    const config = configService.getPaymentConfig();
    const methods: PaymentMethod[] = [];
    
    if (config.enableCash) {
      methods.push({ id: 'cash', name: 'Efectivo', type: 'cash' });
    }
    
    if (config.enableCard) {
      methods.push(
        { id: 'credit-card', name: 'Tarjeta de Crédito', type: 'card' },
        { id: 'debit-card', name: 'Tarjeta de Débito', type: 'card' }
      );
    }
    
    if (config.enableTransfer) {
      methods.push({ id: 'transfer', name: 'Transferencia Bancaria', type: 'transfer' });
    }
    
    return methods;
  }
};

// Hook para usar en componentes React
export const useConfig = () => {
  const [config, setConfig] = React.useState<SystemConfig>(defaultConfig);

  React.useEffect(() => {
    // Cargar configuración inicial
    setConfig(configService.getConfig());

    // Escuchar cambios de configuración
    const handleConfigChange = (event: CustomEvent) => {
      setConfig(event.detail);
    };

    window.addEventListener('configChanged', handleConfigChange as EventListener);
    
    return () => {
      window.removeEventListener('configChanged', handleConfigChange as EventListener);
    };
  }, []);

  return {
    config,
    updatePaymentConfig: configService.savePaymentConfig,
    updateCompanyConfig: configService.saveCompanyConfig,
    updatePrinterConfig: configService.savePrinterConfig,
    getEnabledPaymentMethods: configService.getEnabledPaymentMethods
  };
};

// Función independiente para obtener métodos de pago habilitados
export const getEnabledPaymentMethods = (): PaymentMethod[] => {
  return configService.getEnabledPaymentMethods();
};

export type { SystemConfig, PaymentConfig, CompanyConfig, PrinterConfig };