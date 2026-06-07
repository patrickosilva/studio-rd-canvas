import { Link, useRouterState } from "@tanstack/react-router";
import { Scissors, type LucideIcon } from "lucide-react";
import type { ReactNode } from "react";

export type SidebarItem = { label: string; to: string; icon: LucideIcon };

export function DashboardShell({
  items,
  title,
  user,
  children,
}: {
  items: SidebarItem[];
  title: string;
  user: { name: string; role: string };
  children: ReactNode;
}) {
  const { location } = useRouterState();
  return (
    <div className="min-h-screen bg-background flex">
      <aside className="hidden lg:flex w-64 flex-col bg-sidebar border-r border-sidebar-border">
        <div className="h-16 flex items-center gap-2 px-6 border-b border-sidebar-border">
          <span className="w-8 h-8 rounded-md bg-gradient-gold grid place-items-center">
            <Scissors className="w-4 h-4 text-primary-foreground" />
          </span>
          <span className="font-display text-sm">Studio <span className="text-gold">RD</span></span>
          <span className="ml-auto text-[10px] uppercase tracking-widest text-muted-foreground">{title}</span>
        </div>
        <nav className="flex-1 px-3 py-6 space-y-1">
          {items.map((item) => {
            const active = location.pathname === item.to;
            const Icon = item.icon;
            return (
              <Link
                key={item.to}
                to={item.to}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition ${
                  active
                    ? "bg-gold-soft text-gold"
                    : "text-sidebar-foreground hover:bg-sidebar-accent"
                }`}
              >
                <Icon className="w-4 h-4" />
                {item.label}
              </Link>
            );
          })}
        </nav>
        <div className="p-4 border-t border-sidebar-border">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-gradient-gold grid place-items-center text-sm font-medium text-primary-foreground">
              {user.name[0]}
            </div>
            <div className="min-w-0">
              <div className="text-sm truncate">{user.name}</div>
              <div className="text-xs text-muted-foreground">{user.role}</div>
            </div>
          </div>
        </div>
      </aside>
      <main className="flex-1 min-w-0">{children}</main>
    </div>
  );
}

export function PageHeader({ title, subtitle, actions }: { title: string; subtitle?: string; actions?: ReactNode }) {
  return (
    <div className="flex flex-wrap items-end justify-between gap-4 mb-8">
      <div>
        <h1 className="text-2xl font-display tracking-tight">{title}</h1>
        {subtitle && <p className="text-sm text-muted-foreground mt-1">{subtitle}</p>}
      </div>
      {actions && <div className="flex items-center gap-2">{actions}</div>}
    </div>
  );
}
