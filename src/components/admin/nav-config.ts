import type { ComponentType } from "react";
import {
  Calendar, Coffee, LayoutDashboard, FileText, Megaphone, ShieldAlert,
  AlertTriangle, LayoutTemplate, Images, Star, UtensilsCrossed, Wine, Settings,
} from "lucide-react";

export type NavSubItem = { name: string; href: string; icon: ComponentType<{ size?: number }> };
export type NavItem = {
  name: string; href: string; icon: ComponentType<{ size?: number }>;
  badge?: boolean; subItems?: NavSubItem[];
};

// Fuente única de la navegación del admin. Sidebar y BottomNav la consumen.
export const ADMIN_NAV: NavItem[] = [
  { name: "Dashboard", href: "/admin", icon: LayoutDashboard },
  { name: "Contenido", href: "/admin/contenido", icon: LayoutTemplate },
  { name: "Shows", href: "/admin/shows", icon: Calendar },
  { name: "Menús", href: "/admin/menus", icon: FileText },
  {
    name: "Pub", href: "/admin/pub", icon: Coffee,
    subItems: [
      { name: "Nuestro espacio", href: "/admin/pub/espacio", icon: Images },
      { name: "Destacado home", href: "/admin/pub/destacados", icon: Star },
      { name: "Gastronomía", href: "/admin/pub/gastronomia", icon: UtensilsCrossed },
      { name: "Whiskies", href: "/admin/pub/whiskies", icon: Wine },
    ],
  },
  { name: "Promociones", href: "/admin/promociones", icon: Megaphone },
  { name: "Auditoría", href: "/admin/logs", icon: ShieldAlert },
  { name: "Errores", href: "/admin/errores", icon: AlertTriangle, badge: true },
  { name: "Configuración", href: "/admin/config", icon: Settings },
];

// Los 4 que van fijos en la barra inferior. El resto entra por "Más".
export const BOTTOM_PRIMARY_HREFS = ["/admin", "/admin/shows", "/admin/pub", "/admin/promociones"];
export const BOTTOM_SHORT: Record<string, string> = {
  "/admin": "Inicio", "/admin/shows": "Shows", "/admin/pub": "Pub", "/admin/promociones": "Promos",
};