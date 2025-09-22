"use client";

import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { 
  Building2, 
  Printer, 
  CreditCard, 
  Database, 
  Bell,
  Save,
  RefreshCw
} from "lucide-react";
import { configService } from "@/lib/config";
import type { CompanyConfig, PaymentConfig, PrinterConfig } from "@/lib/config";

export default function SettingsPage() {
  const [companySettings, setCompanySettings] = useState<CompanyConfig>(configService.getCompanyConfig());
  const [printerSettings, setPrinterSettings] = useState<PrinterConfig>(configService.getPrinterConfig());
  const [paymentSettings, setPaymentSettings] = useState<PaymentConfig>(configService.getPaymentConfig());
  const [isSaving, setIsSaving] = useState(false);

  // Cargar configuración al montar el componente
  useEffect(() => {
    setCompanySettings(configService.getCompanyConfig());
    setPrinterSettings(configService.getPrinterConfig());
    setPaymentSettings(configService.getPaymentConfig());
  }, []);

  const handleSaveCompanySettings = async () => {
    setIsSaving(true);
    try {
      configService.saveCompanyConfig(companySettings);
      alert("✅ Configuración de empresa guardada exitosamente");
    } catch (error) {
      alert("❌ Error al guardar la configuración");
    } finally {
      setIsSaving(false);
    }
  };

  const handleSavePrinterSettings = async () => {
    setIsSaving(true);
    try {
      configService.savePrinterConfig(printerSettings);
      alert("✅ Configuración de impresoras guardada exitosamente");
    } catch (error) {
      alert("❌ Error al guardar la configuración de impresoras");
    } finally {
      setIsSaving(false);
    }
  };

  const handleSavePaymentSettings = async () => {
    setIsSaving(true);
    try {
      configService.savePaymentConfig(paymentSettings);
      alert("✅ Configuración de pagos guardada exitosamente\n\nLos métodos de pago se han actualizado en el sistema de ventas.");
    } catch (error) {
      alert("❌ Error al guardar la configuración de pagos");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="container mx-auto p-6 max-w-4xl">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold">Configuración del Sistema</h1>
          <p className="text-muted-foreground">Administra la configuración de tu POS</p>
        </div>
      </div>

      <Tabs defaultValue="company" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="company" className="flex items-center gap-2">
            <Building2 className="h-4 w-4" />
            Empresa
          </TabsTrigger>
          <TabsTrigger value="printers" className="flex items-center gap-2">
            <Printer className="h-4 w-4" />
            Impresoras
          </TabsTrigger>
          <TabsTrigger value="payments" className="flex items-center gap-2">
            <CreditCard className="h-4 w-4" />
            Pagos
          </TabsTrigger>
          <TabsTrigger value="system" className="flex items-center gap-2">
            <Database className="h-4 w-4" />
            Sistema
          </TabsTrigger>
        </TabsList>

        {/* Configuración de Empresa */}
        <TabsContent value="company" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Building2 className="h-5 w-5" />
                Información de la Empresa
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="companyName">Nombre de la Empresa</Label>
                  <Input
                    id="companyName"
                    value={companySettings.name}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setCompanySettings({...companySettings, name: e.target.value})}
                  />
                </div>
                <div>
                  <Label htmlFor="taxId">NIT/RUC</Label>
                  <Input
                    id="taxId"
                    value={companySettings.taxId}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setCompanySettings({...companySettings, taxId: e.target.value})}
                  />
                </div>
              </div>
              
              <div>
                <Label htmlFor="address">Dirección</Label>
                <Textarea
                  id="address"
                  value={companySettings.address}
                  onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setCompanySettings({...companySettings, address: e.target.value})}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="phone">Teléfono</Label>
                  <Input
                    id="phone"
                    value={companySettings.phone}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setCompanySettings({...companySettings, phone: e.target.value})}
                  />
                </div>
                <div>
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={companySettings.email}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setCompanySettings({...companySettings, email: e.target.value})}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="currency">Moneda</Label>
                  <Select
                    value={companySettings.currency}
                    onValueChange={(value) => setCompanySettings({...companySettings, currency: value})}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="USD">USD - Dólar Americano</SelectItem>
                      <SelectItem value="EUR">EUR - Euro</SelectItem>
                      <SelectItem value="MXN">MXN - Peso Mexicano</SelectItem>
                      <SelectItem value="COP">COP - Peso Colombiano</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="timezone">Zona Horaria</Label>
                  <Select
                    value={companySettings.timezone}
                    onValueChange={(value) => setCompanySettings({...companySettings, timezone: value})}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="America/New_York">América/Nueva York</SelectItem>
                      <SelectItem value="America/Mexico_City">América/Ciudad de México</SelectItem>
                      <SelectItem value="America/Bogota">América/Bogotá</SelectItem>
                      <SelectItem value="Europe/Madrid">Europa/Madrid</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <Button onClick={handleSaveCompanySettings} disabled={isSaving}>
                {isSaving ? (
                  <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <Save className="h-4 w-4 mr-2" />
                )}
                Guardar Configuración de Empresa
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Configuración de Impresoras */}
        <TabsContent value="printers" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Printer className="h-5 w-5" />
                Configuración de Impresoras
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="receiptPrinter">Impresora de Recibos</Label>
                  <Select
                    value={printerSettings.receiptPrinter}
                    onValueChange={(value) => setPrinterSettings({...printerSettings, receiptPrinter: value})}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="default">Impresora Predeterminada</SelectItem>
                      <SelectItem value="thermal">Impresora Térmica</SelectItem>
                      <SelectItem value="laser">Impresora Láser</SelectItem>
                      <SelectItem value="none">Sin Impresora</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="receiptWidth">Ancho de Recibo</Label>
                  <Select
                    value={printerSettings.receiptWidth}
                    onValueChange={(value) => setPrinterSettings({...printerSettings, receiptWidth: value})}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="58mm">58mm</SelectItem>
                      <SelectItem value="80mm">80mm</SelectItem>
                      <SelectItem value="letter">Carta (8.5&quot;)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="printLogo">Imprimir Logo en Recibos</Label>
                    <p className="text-sm text-muted-foreground">Incluir el logo de la empresa en los recibos</p>
                  </div>
                  <Switch
                    id="printLogo"
                    checked={printerSettings.printLogo}
                    onCheckedChange={(checked) => setPrinterSettings({...printerSettings, printLogo: checked})}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="autoprint">Impresión Automática</Label>
                    <p className="text-sm text-muted-foreground">Imprimir recibos automáticamente al finalizar venta</p>
                  </div>
                  <Switch
                    id="autoprint"
                    checked={printerSettings.autoprint}
                    onCheckedChange={(checked) => setPrinterSettings({...printerSettings, autoprint: checked})}
                  />
                </div>
              </div>

              <Button onClick={handleSavePrinterSettings} disabled={isSaving}>
                {isSaving ? (
                  <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <Save className="h-4 w-4 mr-2" />
                )}
                Guardar Configuración de Impresoras
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Configuración de Pagos */}
        <TabsContent value="payments" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CreditCard className="h-5 w-5" />
                Métodos de Pago
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Efectivo</Label>
                    <p className="text-sm text-muted-foreground">Permitir pagos en efectivo</p>
                  </div>
                  <Switch
                    checked={paymentSettings.enableCash}
                    onCheckedChange={(checked) => setPaymentSettings({...paymentSettings, enableCash: checked})}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label>Tarjetas</Label>
                    <p className="text-sm text-muted-foreground">Permitir pagos con tarjeta de crédito/débito</p>
                  </div>
                  <Switch
                    checked={paymentSettings.enableCard}
                    onCheckedChange={(checked) => setPaymentSettings({...paymentSettings, enableCard: checked})}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label>Transferencias</Label>
                    <p className="text-sm text-muted-foreground">Permitir pagos por transferencia bancaria</p>
                  </div>
                  <Switch
                    checked={paymentSettings.enableTransfer}
                    onCheckedChange={(checked) => setPaymentSettings({...paymentSettings, enableTransfer: checked})}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="taxRate">Tasa de Impuesto (%)</Label>
                  <Input
                    id="taxRate"
                    type="number"
                    step="0.01"
                    value={paymentSettings.taxRate * 100}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setPaymentSettings({...paymentSettings, taxRate: parseFloat(e.target.value) / 100})}
                  />
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Habilitar Descuentos</Label>
                    <p className="text-sm text-muted-foreground">Permitir aplicar descuentos en las ventas</p>
                  </div>
                  <Switch
                    checked={paymentSettings.discountEnabled}
                    onCheckedChange={(checked) => setPaymentSettings({...paymentSettings, discountEnabled: checked})}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label>Habilitar Propinas</Label>
                    <p className="text-sm text-muted-foreground">Permitir agregar propinas a las ventas</p>
                  </div>
                  <Switch
                    checked={paymentSettings.tipEnabled}
                    onCheckedChange={(checked) => setPaymentSettings({...paymentSettings, tipEnabled: checked})}
                  />
                </div>
              </div>

              <Button onClick={handleSavePaymentSettings} disabled={isSaving}>
                {isSaving ? (
                  <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <Save className="h-4 w-4 mr-2" />
                )}
                Guardar Configuración de Pagos
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Configuración del Sistema */}
        <TabsContent value="system" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Database className="h-5 w-5" />
                Configuración del Sistema
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-4">
                <div>
                  <Label className="text-base">Base de Datos</Label>
                  <p className="text-sm text-muted-foreground mb-2">Gestión de la base de datos</p>
                  <div className="flex gap-2">
                    <Button variant="outline">Respaldar Base de Datos</Button>
                    <Button variant="outline">Restaurar Respaldo</Button>
                  </div>
                </div>

                <div>
                  <Label className="text-base">Cache del Sistema</Label>
                  <p className="text-sm text-muted-foreground mb-2">Limpiar cache para mejorar rendimiento</p>
                  <Button variant="outline">Limpiar Cache</Button>
                </div>

                <div>
                  <Label className="text-base">Registros del Sistema</Label>
                  <p className="text-sm text-muted-foreground mb-2">Gestión de logs y registros</p>
                  <div className="flex gap-2">
                    <Button variant="outline">Ver Registros</Button>
                    <Button variant="outline">Limpiar Registros</Button>
                  </div>
                </div>

                <div>
                  <Label className="text-base">Actualizaciones</Label>
                  <p className="text-sm text-muted-foreground mb-2">Verificar actualizaciones del sistema</p>
                  <Button variant="outline">Buscar Actualizaciones</Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}