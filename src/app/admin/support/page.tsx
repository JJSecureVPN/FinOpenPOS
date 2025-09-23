"use client";

import React, { useState } from "react";
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
import { Badge } from "@/components/ui/badge";
import { useAlert } from "@/components/ui/alert-modal";
import { 
  Phone, 
  Mail, 
  MessageCircle, 
  HelpCircle,
  Send,
  ExternalLink,
  BookOpen,
  Video,
  FileText,
  Bug,
  Lightbulb,
  AlertCircle
} from "lucide-react";

type TicketPriority = "low" | "normal" | "high" | "urgent";
type TicketCategory = "technical" | "billing" | "feature" | "bug" | "other";

export default function SupportPage() {
  const [ticketForm, setTicketForm] = useState({
    subject: "",
    category: "technical" as TicketCategory,
    priority: "normal" as TicketPriority,
    description: "",
    email: "",
    phone: ""
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const { showAlert, AlertModal } = useAlert();

  const handleSubmitTicket = async () => {
    setIsSubmitting(true);
    try {
      // Simular envío de ticket
      await new Promise(resolve => setTimeout(resolve, 2000));
      const ticketNumber = Math.floor(Math.random() * 10000);
      showAlert(`Ticket de soporte enviado exitosamente!\n\nNúmero de ticket: #${ticketNumber}\n\nRecibirás una respuesta en tu email dentro de 24 horas.`, { variant: 'success', title: '🎫 Ticket Creado' });
      setTicketForm({
        subject: "",
        category: "technical",
        priority: "normal",
        description: "",
        email: "",
        phone: ""
      });
    } catch (error) {
      showAlert("Error al enviar el ticket. Intenta nuevamente.", { variant: 'error' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const faqItems = [
    {
      question: "¿Cómo agrego un nuevo producto al inventario?",
      answer: "Ve a la sección 'Productos' en el menú lateral, haz clic en 'Agregar Producto' y completa la información requerida como nombre, precio, categoría y stock inicial."
    },
    {
      question: "¿Cómo proceso una venta al fiado?",
      answer: "En la sección 'Ventas al Fiado', selecciona el cliente, agrega los productos, y el sistema automáticamente registrará la deuda del cliente."
    },
    {
      question: "¿Cómo genero reportes de ventas?",
      answer: "Ve al Panel Principal donde encontrarás gráficos y estadísticas. Para reportes detallados, usa las secciones de Cajero y Ventas."
    },
    {
      question: "¿Puedo cambiar la configuración de impresoras?",
      answer: "Sí, ve a Configuración > Impresoras donde puedes configurar impresoras de recibos, anchos de papel y opciones de impresión automática."
    },
    {
      question: "¿Cómo respaldo mi información?",
      answer: "Ve a Configuración > Sistema donde encontrarás opciones para respaldar y restaurar tu base de datos."
    }
  ];

  const getPriorityColor = (priority: TicketPriority) => {
    switch (priority) {
      case "low": return "bg-green-100 text-green-800";
      case "normal": return "bg-blue-100 text-blue-800";
      case "high": return "bg-orange-100 text-orange-800";
      case "urgent": return "bg-red-100 text-red-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <div className="container mx-auto p-6 max-w-6xl">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold">Centro de Soporte</h1>
          <p className="text-muted-foreground">Obtén ayuda y soporte técnico para FinOpenPOS</p>
        </div>
      </div>

      <Tabs defaultValue="contact" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="contact" className="flex items-center gap-2">
            <Phone className="h-4 w-4" />
            Contacto
          </TabsTrigger>
          <TabsTrigger value="ticket" className="flex items-center gap-2">
            <MessageCircle className="h-4 w-4" />
            Crear Ticket
          </TabsTrigger>
          <TabsTrigger value="faq" className="flex items-center gap-2">
            <HelpCircle className="h-4 w-4" />
            FAQ
          </TabsTrigger>
          <TabsTrigger value="resources" className="flex items-center gap-2">
            <BookOpen className="h-4 w-4" />
            Recursos
          </TabsTrigger>
        </TabsList>

        {/* Información de Contacto */}
        <TabsContent value="contact" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card>
              <CardHeader className="text-center">
                <Phone className="h-12 w-12 mx-auto text-blue-600 mb-2" />
                <CardTitle>Soporte Telefónico</CardTitle>
              </CardHeader>
              <CardContent className="text-center space-y-2">
                <p className="text-2xl font-bold">+1 (555) 123-4567</p>
                <p className="text-sm text-muted-foreground">Lunes a Viernes</p>
                <p className="text-sm text-muted-foreground">9:00 AM - 6:00 PM EST</p>
                <Button className="w-full mt-4">
                  <Phone className="h-4 w-4 mr-2" />
                  Llamar Ahora
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="text-center">
                <Mail className="h-12 w-12 mx-auto text-green-600 mb-2" />
                <CardTitle>Email de Soporte</CardTitle>
              </CardHeader>
              <CardContent className="text-center space-y-2">
                <p className="text-lg font-semibold">soporte@finopenpos.com</p>
                <p className="text-sm text-muted-foreground">Respuesta en 24 horas</p>
                <p className="text-sm text-muted-foreground">Incluye capturas de pantalla</p>
                <Button className="w-full mt-4">
                  <Mail className="h-4 w-4 mr-2" />
                  Enviar Email
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="text-center">
                <MessageCircle className="h-12 w-12 mx-auto text-purple-600 mb-2" />
                <CardTitle>Chat en Vivo</CardTitle>
              </CardHeader>
              <CardContent className="text-center space-y-2">
                <p className="text-lg font-semibold">Chat Disponible</p>
                <p className="text-sm text-muted-foreground">Lunes a Viernes</p>
                <p className="text-sm text-muted-foreground">9:00 AM - 5:00 PM EST</p>
                <Button className="w-full mt-4">
                  <MessageCircle className="h-4 w-4 mr-2" />
                  Iniciar Chat
                </Button>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Información del Sistema</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                <div>
                  <Label className="font-semibold">Versión del Sistema</Label>
                  <p>FinOpenPOS v2.1.0</p>
                </div>
                <div>
                  <Label className="font-semibold">Base de Datos</Label>
                  <p>Supabase PostgreSQL</p>
                </div>
                <div>
                  <Label className="font-semibold">Framework</Label>
                  <p>Next.js 14.2.5</p>
                </div>
                <div>
                  <Label className="font-semibold">Estado del Sistema</Label>
                  <Badge className="bg-green-100 text-green-800">Operativo</Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Crear Ticket de Soporte */}
        <TabsContent value="ticket" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MessageCircle className="h-5 w-5" />
                Crear Ticket de Soporte
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="email">Email de Contacto *</Label>
                  <Input
                    id="email"
                    type="email"
                    value={ticketForm.email}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setTicketForm({...ticketForm, email: e.target.value})}
                    placeholder="tu@email.com"
                  />
                </div>
                <div>
                  <Label htmlFor="phone">Teléfono (Opcional)</Label>
                  <Input
                    id="phone"
                    value={ticketForm.phone}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setTicketForm({...ticketForm, phone: e.target.value})}
                    placeholder="+1 (555) 123-4567"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="subject">Asunto *</Label>
                <Input
                  id="subject"
                  value={ticketForm.subject}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setTicketForm({...ticketForm, subject: e.target.value})}
                  placeholder="Describe brevemente tu problema"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Categoría</Label>
                  <Select
                    value={ticketForm.category}
                    onValueChange={(value: TicketCategory) => setTicketForm({...ticketForm, category: value})}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="technical">Problema Técnico</SelectItem>
                      <SelectItem value="billing">Facturación</SelectItem>
                      <SelectItem value="feature">Solicitud de Función</SelectItem>
                      <SelectItem value="bug">Reporte de Error</SelectItem>
                      <SelectItem value="other">Otro</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Prioridad</Label>
                  <Select
                    value={ticketForm.priority}
                    onValueChange={(value: TicketPriority) => setTicketForm({...ticketForm, priority: value})}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="low">Baja</SelectItem>
                      <SelectItem value="normal">Normal</SelectItem>
                      <SelectItem value="high">Alta</SelectItem>
                      <SelectItem value="urgent">Urgente</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <Label htmlFor="description">Descripción Detallada *</Label>
                <Textarea
                  id="description"
                  rows={6}
                  value={ticketForm.description}
                  onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setTicketForm({...ticketForm, description: e.target.value})}
                  placeholder="Describe tu problema en detalle. Incluye pasos para reproducir el error, mensajes de error, y cualquier información relevante."
                />
              </div>

              <div className="flex items-center gap-2">
                <Badge className={getPriorityColor(ticketForm.priority)}>
                  Prioridad: {ticketForm.priority.charAt(0).toUpperCase() + ticketForm.priority.slice(1)}
                </Badge>
                <Badge variant="outline">
                  Categoría: {ticketForm.category}
                </Badge>
              </div>

              <Button 
                onClick={handleSubmitTicket} 
                disabled={isSubmitting || !ticketForm.email || !ticketForm.subject || !ticketForm.description}
                className="w-full"
              >
                {isSubmitting ? (
                  "Enviando..."
                ) : (
                  <>
                    <Send className="h-4 w-4 mr-2" />
                    Enviar Ticket de Soporte
                  </>
                )}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* FAQ */}
        <TabsContent value="faq" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <HelpCircle className="h-5 w-5" />
                Preguntas Frecuentes
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {faqItems.map((item, index) => (
                <div key={index} className="border-b pb-4 last:border-b-0">
                  <h3 className="font-semibold text-lg mb-2 flex items-start gap-2">
                    <HelpCircle className="h-5 w-5 mt-0.5 text-blue-600 flex-shrink-0" />
                    {item.question}
                  </h3>
                  <p className="text-muted-foreground ml-7">{item.answer}</p>
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Recursos */}
        <TabsContent value="resources" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BookOpen className="h-5 w-5" />
                  Documentación
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button variant="outline" className="w-full justify-start">
                  <FileText className="h-4 w-4 mr-2" />
                  Manual de Usuario
                  <ExternalLink className="h-4 w-4 ml-auto" />
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  <BookOpen className="h-4 w-4 mr-2" />
                  Guía de Instalación
                  <ExternalLink className="h-4 w-4 ml-auto" />
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  <Bug className="h-4 w-4 mr-2" />
                  Solución de Problemas
                  <ExternalLink className="h-4 w-4 ml-auto" />
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Video className="h-5 w-5" />
                  Videos Tutoriales
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button variant="outline" className="w-full justify-start">
                  <Video className="h-4 w-4 mr-2" />
                  Primeros Pasos
                  <ExternalLink className="h-4 w-4 ml-auto" />
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  <Video className="h-4 w-4 mr-2" />
                  Gestión de Inventario
                  <ExternalLink className="h-4 w-4 ml-auto" />
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  <Video className="h-4 w-4 mr-2" />
                  Reportes y Análisis
                  <ExternalLink className="h-4 w-4 ml-auto" />
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Lightbulb className="h-5 w-5" />
                  Consejos y Trucos
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="text-sm space-y-2">
                  <p><strong>Atajos de Teclado:</strong> Usa F1 para búsqueda rápida de productos</p>
                  <p><strong>Backup Automático:</strong> Configura respaldos diarios en horarios de baja actividad</p>
                  <p><strong>Reportes:</strong> Exporta reportes en Excel para análisis detallados</p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <AlertCircle className="h-5 w-5" />
                  Estado del Servicio
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm">API Principal</span>
                    <Badge className="bg-green-100 text-green-800">Operativo</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Base de Datos</span>
                    <Badge className="bg-green-100 text-green-800">Operativo</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Sincronización</span>
                    <Badge className="bg-green-100 text-green-800">Operativo</Badge>
                  </div>
                </div>
                <Button variant="outline" className="w-full">
                  Ver Estado Completo
                  <ExternalLink className="h-4 w-4 ml-2" />
                </Button>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
      
      <AlertModal />
    </div>
  );
}