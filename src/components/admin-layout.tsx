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
} from "lucide-react";
import { useUserRole } from "@/hooks/useUserRole";
import { createClient } from "@/lib/supabase/client";

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

  const navigationItems = [
    { href: "/admin", icon: LayoutDashboardIcon, label: "Panel Principal" },
    { href: "/admin/cashier", icon: DollarSignIcon, label: "Cajero" },
    { href: "/admin/products", icon: PackageIcon, label: "Productos" },
    { href: "/admin/customers", icon: UsersIcon, label: "Clientes" },
    { href: "/admin/credit-sales", icon: CreditCardIcon, label: "Ventas al Fiado" },
    { href: "/admin/pos", icon: ShoppingCartIcon, label: "Punto de Venta" },
  ];

  // Agregar gestión de usuarios solo para admins (después de cargar)
  const allNavigationItems = [
    ...navigationItems,
    ...(isAdmin ? [{ href: "/admin/users", icon: Users2Icon, label: "Gestión de Usuarios" }] : []),
  ];

  const handleConfiguration = () => {
    window.location.href = "/admin/settings";
  };

  const handleSupport = () => {
    window.location.href = "/admin/support";
  };

  const handleLogout = async () => {
    if (confirm("¿Estás seguro de que deseas cerrar sesión?")) {
      try {
        // Hacer logout en Supabase
        const supabase = createClient();
        const { error } = await supabase.auth.signOut();
        
        if (error) {
          console.error('Error al cerrar sesión:', error);
          alert('Error al cerrar sesión. Inténtalo de nuevo.');
          return;
        }
        
        // Limpiar storage local si existe
        localStorage.removeItem('supabase.auth.token');
        sessionStorage.clear();
        
        // Redirigir a login con refresh completo
        window.location.replace("/login");
      } catch (error) {
        console.error('Error al cerrar sesión:', error);
        alert('Error al cerrar sesión. Inténtalo de nuevo.');
      }
    }
  };

  return (
    <div className="flex min-h-screen w-full flex-col bg-muted/40">
      <header className="sticky top-0 z-30 flex h-14 items-center gap-4 border-b bg-background px-4 pl-14">
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
            <DropdownMenuItem onClick={handleConfiguration} className="cursor-pointer">
              Configuración
            </DropdownMenuItem>
            <DropdownMenuItem onClick={handleSupport} className="cursor-pointer">
              Soporte
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={handleLogout} className="cursor-pointer">
              Cerrar Sesión
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </header>
      <div className="flex flex-col gap-4 py-4 pl-14">
        <aside className="fixed mt-[56px] inset-y-0 left-0 z-10 w-14 flex-col border-r bg-background flex">
          <nav className="flex flex-col items-center gap-4 px-2 py-5">
            <TooltipProvider>
              {allNavigationItems.map((item) => (
                <Tooltip key={item.href}>
                  <TooltipTrigger asChild>
                    <Link
                      href={item.href}
                      className={`flex h-9 w-9 items-center justify-center rounded-lg ${
                        pathname === item.href
                          ? "bg-accent text-accent-foreground"
                          : "text-muted-foreground"
                      } transition-colors hover:text-foreground`}
                    >
                      <item.icon className="h-5 w-5" />
                      <span className="sr-only">{item.label}</span>
                    </Link>
                  </TooltipTrigger>
                  <TooltipContent side="right">{item.label}</TooltipContent>
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
    </div>
  );
}
