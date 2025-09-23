"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calculator, Receipt } from "lucide-react";
import { Typography } from "@/components/ui/typography";

interface PaymentSectionProps {
  showPayment: boolean;
  onShowPayment: (show: boolean) => void;
  onProcessSale: () => void;
  paymentReceived: string;
  onPaymentReceivedChange: (value: string) => void;
  selectedPaymentMethod: string;
  onPaymentMethodChange: (method: string) => void;
  availablePaymentMethods: any[];
  calculateChange: () => number;
}

export default function PaymentSection({
  showPayment,
  onShowPayment,
  onProcessSale,
  paymentReceived,
  onPaymentReceivedChange,
  selectedPaymentMethod,
  onPaymentMethodChange,
  availablePaymentMethods,
  calculateChange
}: PaymentSectionProps) {
  if (!showPayment) {
    return (
      <Button 
        onClick={() => onShowPayment(true)} 
        className="w-full"
        size="lg"
      >
        <Calculator className="h-4 w-4 mr-2" />
        <Typography variant="body">Procesar Pago</Typography>
      </Button>
    );
  }

  return (
    <div className="space-y-3">
      <div className="space-y-2">
        <Typography variant="body-sm" weight="medium">Método de Pago:</Typography>
        <Select value={selectedPaymentMethod} onValueChange={onPaymentMethodChange}>
          <SelectTrigger>
            <SelectValue placeholder="Seleccionar método" />
          </SelectTrigger>
          <SelectContent>
            {availablePaymentMethods.map((method) => (
              <SelectItem key={method.id} value={method.id}>
                {method.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {selectedPaymentMethod === 'cash' && (
        <div className="space-y-2">
          <Typography variant="body-sm" weight="medium">Monto Recibido:</Typography>
          <Input
            type="number"
            step="0.01"
            placeholder="0.00"
            value={paymentReceived}
            onChange={(e) => onPaymentReceivedChange(e.target.value)}
          />
          {paymentReceived && (
            <Typography 
              variant="body-sm"
              className={calculateChange() >= 0 ? "text-green-600" : "text-red-600"}
            >
              Cambio: ${calculateChange().toFixed(2)}
            </Typography>
          )}
        </div>
      )}

      <div className="flex gap-2">
        <Button 
          variant="outline" 
          onClick={() => onShowPayment(false)}
          className="flex-1"
        >
          <Typography variant="body-sm">Cancelar</Typography>
        </Button>
        <Button 
          onClick={onProcessSale} 
          className="flex-1"
          disabled={selectedPaymentMethod === 'cash' && (!paymentReceived || calculateChange() < 0)}
        >
          <Receipt className="h-3 w-3 mr-1" />
          <Typography variant="body-sm">Finalizar</Typography>
        </Button>
      </div>
    </div>
  );
}