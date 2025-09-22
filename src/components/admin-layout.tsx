"use client";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import {
  TooltipProvider,
  Tooltip,
  TooltipTrigger,
  TooltipContent,
} from "@/components/ui/tooltip";
import { usePathname } from "next/navigation";
import Image from "next/image";
import {
  Package2Icon,
  SearchIcon,
  LayoutDashboardIcon,
  DollarSignIcon,
  PackageIcon,
  ShoppingCartIcon,
  UsersIcon,
  CreditCardIcon,
  Users2Icon,
  LogOutIcon,
  SettingsIcon,
  HelpCircleIcon,
} from "lucide-react";
import { useUserRole } from "@/hooks/useUserRole";
import { createClient } from "@/lib/supabase/client";
import { ConfirmationModal } from "@/components/ui/confirmation-modal";
import { useAlert } from "@/components/ui/alert-modal";

const pageNames: { [key: string]: string } = {
  "/admin": "Panel Principal",
  "/admin/customers": "Clientes",
  "/admin/products": "Productos",
  "/admin/pos": "Punto de Venta",
  "/admin/cashier": "Cajero",
  "/admin/credit-sales": "Ventas al Fiado",
  "/admin/users": "Gestión de Usuarios",
  "/admin/settings": "Configuración",
  "/admin/support": "Soporte Técnico",
};

export function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { isAdmin, loading } = useUserRole();
  const { showAlert, AlertModal } = useAlert();

  const navigationItems = [
    { href: "/admin", icon: LayoutDashboardIcon, label: "Panel Principal" },
    { href: "/admin/cashier", icon: DollarSignIcon, label: "Cajero" },
    { href: "/admin/products", icon: PackageIcon, label: "Productos" },
    { href: "/admin/customers", icon: UsersIcon, label: "Clientes" },
    { href: "/admin/credit-sales", icon: CreditCardIcon, label: "Ventas al Fiado" },
    { href: "/admin/pos", icon: ShoppingCartIcon, label: "Punto de Venta" },
  ];

  // Agregar gestión de usuarios solo para admins y páginas comunes al final
  const allNavigationItems = [
    ...navigationItems,
    ...(isAdmin ? [{ href: "/admin/users", icon: Users2Icon, label: "Gestión de Usuarios" }] : []),
    { href: "/admin/settings", icon: SettingsIcon, label: "Configuración" },
    { href: "/admin/support", icon: HelpCircleIcon, label: "Soporte" },
  ];

  const handleLogout = async () => {
    try {
      // Hacer logout en Supabase
      const supabase = createClient();
      const { error } = await supabase.auth.signOut();
      
      if (error) {
        console.error('Error al cerrar sesión:', error);
        showAlert('Error al cerrar sesión. Inténtalo de nuevo.', { variant: 'error' });
        return;
      }
      
      // Limpiar storage local si existe
      localStorage.removeItem('supabase.auth.token');
      sessionStorage.clear();
      
      // Redirigir a login con refresh completo
      window.location.replace("/login");
    } catch (error) {
      console.error('Error al cerrar sesión:', error);
      showAlert('Error al cerrar sesión. Inténtalo de nuevo.', { variant: 'error' });
    }
  };

  return (
    <div className="flex min-h-screen w-full flex-col bg-muted/40">
      <header className="sticky top-0 z-30 flex h-14 items-center gap-4 border-b bg-background px-4 pl-16">
        <Link
          href="/admin"
          className="flex items-center gap-2 text-lg font-semibold"
        >
          <Package2Icon className="h-6 w-6" />
          <span className="sr-only">Panel de Administración</span>
        </Link>
        <h1 className="text-xl font-bold">{pageNames[pathname]}</h1>
        <div className="relative ml-auto flex-1 md:grow-0">
          <SearchIcon className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Buscar..."
            className="w-full rounded-lg bg-background pl-8 md:w-[200px] lg:w-[336px]"
          />
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="outline"
              size="icon"
              className="overflow-hidden rounded-full"
            >
              <Image
                src="/placeholder-user.jpg"
                width={36}
                height={36}
                alt="Avatar"
                className="overflow-hidden rounded-full"
              />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>Mi Cuenta</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <ConfirmationModal
              title="Cerrar Sesión"
              description="¿Estás seguro de que deseas cerrar sesión? Serás redirigido a la página de login."
              confirmText="Cerrar Sesión"
              cancelText="Cancelar"
              onConfirm={handleLogout}
              variant="destructive"
              icon={<LogOutIcon className="w-4 h-4" />}
            >
              <DropdownMenuItem 
                onSelect={(e) => e.preventDefault()} 
                className="cursor-pointer text-red-600 focus:text-red-600"
              >
                <LogOutIcon className="w-4 h-4 mr-2" />
                Cerrar Sesión
              </DropdownMenuItem>
            </ConfirmationModal>
          </DropdownMenuContent>
        </DropdownMenu>
      </header>
      <div className="flex flex-col gap-4 py-4 pl-16">
        <aside className="fixed mt-[56px] inset-y-0 left-0 z-10 w-16 flex-col border-r bg-background flex shadow-sm">
          <nav className="flex flex-col items-center gap-3 px-2 py-6">
            <TooltipProvider>
              {allNavigationItems.map((item) => (
                <Tooltip key={item.href}>
                  <TooltipTrigger asChild>
                    <Link
                      href={item.href}
                      className={`relative flex h-9 w-9 items-center justify-center rounded-lg transition-all duration-200 ${
                        pathname === item.href
                          ? "bg-primary text-primary-foreground shadow-md scale-105"
                          : "text-muted-foreground hover:text-foreground hover:bg-accent"
                      }`}
                    >
                      {/* Indicador activo más visible */}
                      {pathname === item.href && (
                        <div className="absolute -left-1 top-1/2 h-6 w-1 bg-primary-foreground rounded-r-full transform -translate-y-1/2" />
                      )}
                      <item.icon className={`h-5 w-5 ${pathname === item.href ? 'drop-shadow-sm' : ''}`} />
                      <span className="sr-only">{item.label}</span>
                    </Link>
                  </TooltipTrigger>
                  <TooltipContent side="right" className="font-medium">
                    {item.label}
                    {pathname === item.href && (
                      <span className="ml-1 text-xs opacity-75">• Activo</span>
                    )}
                  </TooltipContent>
                </Tooltip>
              ))}
              {/* Debug: Mostrar indicador de carga de roles */}
              {loading && (
                <div className="h-2 w-2 bg-yellow-400 rounded-full animate-pulse" title="Cargando roles..." />
              )}
            </TooltipProvider>
          </nav>
        </aside>
        <main className="flex-1 p-4 px-6 py-0">{children}</main>
      </div>
      <AlertModal />
    </div>
  );
}
