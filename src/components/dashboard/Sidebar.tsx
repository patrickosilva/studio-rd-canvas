import { Link, useRouterState } from "@tanstack/react-router";
import {
  LogOut,
  Menu,
  Scissors,
  X,
  type LucideIcon,
} from "lucide-react";
import {
  type ReactNode,
  useEffect,
  useMemo,
  useState,
} from "react";

export type SidebarItem = {
  label: string;
  to: string;
  icon: LucideIcon;
};

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
  const [menuAberto, setMenuAberto] = useState(false);

  const inicialUsuario = useMemo(() => {
    return user.name?.trim()?.[0]?.toUpperCase() || "U";
  }, [user.name]);

  useEffect(() => {
    setMenuAberto(false);
  }, [location.pathname]);

  function isActive(to: string) {
    return location.pathname === to;
  }

  return (
    <div className="min-h-screen bg-background lg:flex">
      <header className="sticky top-0 z-40 flex h-16 items-center justify-between border-b border-sidebar-border bg-sidebar/95 px-4 backdrop-blur lg:hidden">
        <div className="flex min-w-0 items-center gap-3">
          <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-gradient-gold">
            <Scissors className="h-4 w-4 text-primary-foreground" />
          </span>

          <div className="min-w-0">
            <p className="truncate font-display text-sm">
              Studio <span className="text-gold">RD</span>
            </p>
            <p className="truncate text-[10px] uppercase tracking-widest text-muted-foreground">
              {title}
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={() => setMenuAberto(true)}
          className="grid h-10 w-10 place-items-center rounded-xl border border-sidebar-border text-sidebar-foreground transition hover:bg-sidebar-accent"
          aria-label="Abrir menu"
        >
          <Menu className="h-5 w-5" />
        </button>
      </header>

      {menuAberto && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <button
            type="button"
            className="absolute inset-0 bg-black/70"
            onClick={() => setMenuAberto(false)}
            aria-label="Fechar menu"
          />

          <aside className="absolute left-0 top-0 flex h-full w-[82vw] max-w-80 flex-col border-r border-sidebar-border bg-sidebar shadow-2xl">
            <div className="flex h-16 items-center gap-3 border-b border-sidebar-border px-4">
              <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-gradient-gold">
                <Scissors className="h-4 w-4 text-primary-foreground" />
              </span>

              <div className="min-w-0">
                <p className="truncate font-display text-sm">
                  Studio <span className="text-gold">RD</span>
                </p>
                <p className="truncate text-[10px] uppercase tracking-widest text-muted-foreground">
                  {title}
                </p>
              </div>

              <button
                type="button"
                onClick={() => setMenuAberto(false)}
                className="ml-auto grid h-10 w-10 place-items-center rounded-xl border border-sidebar-border text-sidebar-foreground transition hover:bg-sidebar-accent"
                aria-label="Fechar menu"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <nav className="flex-1 space-y-1 overflow-y-auto px-3 py-4">
              {items.map((item) => {
                const active = isActive(item.to);
                const Icon = item.icon;

                return (
                  <Link
                    key={item.to}
                    to={item.to}
                    className={`flex min-h-12 items-center gap-3 rounded-xl px-3 py-3 text-sm font-medium transition ${
                      active
                        ? "bg-gold-soft text-gold"
                        : "text-sidebar-foreground hover:bg-sidebar-accent"
                    }`}
                  >
                    <Icon className="h-5 w-5 shrink-0" />
                    <span className="truncate">{item.label}</span>
                  </Link>
                );
              })}
            </nav>

            <div className="border-t border-sidebar-border p-4">
              <div className="flex items-center gap-3 rounded-2xl bg-sidebar-accent/40 p-3">
                <div className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-gradient-gold text-sm font-semibold text-primary-foreground">
                  {inicialUsuario}
                </div>

                <div className="min-w-0 flex-1">
                  <div className="truncate text-sm font-medium">
                    {user.name}
                  </div>
                  <div className="truncate text-xs text-muted-foreground">
                    {user.role}
                  </div>
                </div>
              </div>

              <Link
                to="/logout"
                className="mt-3 flex h-11 items-center justify-center gap-2 rounded-xl border border-sidebar-border text-sm text-muted-foreground transition hover:bg-sidebar-accent hover:text-sidebar-foreground"
              >
                <LogOut className="h-4 w-4" />
                Sair
              </Link>
            </div>
          </aside>
        </div>
      )}

      <aside className="hidden w-64 flex-col border-r border-sidebar-border bg-sidebar lg:flex">
        <div className="flex h-16 items-center gap-2 border-b border-sidebar-border px-6">
          <span className="grid h-8 w-8 place-items-center rounded-md bg-gradient-gold">
            <Scissors className="h-4 w-4 text-primary-foreground" />
          </span>

          <span className="font-display text-sm">
            Studio <span className="text-gold">RD</span>
          </span>

          <span className="ml-auto text-[10px] uppercase tracking-widest text-muted-foreground">
            {title}
          </span>
        </div>

        <nav className="flex-1 space-y-1 px-3 py-6">
          {items.map((item) => {
            const active = isActive(item.to);
            const Icon = item.icon;

            return (
              <Link
                key={item.to}
                to={item.to}
                className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition ${
                  active
                    ? "bg-gold-soft text-gold"
                    : "text-sidebar-foreground hover:bg-sidebar-accent"
                }`}
              >
                <Icon className="h-4 w-4" />
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="border-t border-sidebar-border p-4">
          <div className="flex items-center gap-3">
            <div className="grid h-9 w-9 place-items-center rounded-full bg-gradient-gold text-sm font-medium text-primary-foreground">
              {inicialUsuario}
            </div>

            <div className="min-w-0 flex-1">
              <div className="truncate text-sm">{user.name}</div>
              <div className="text-xs text-muted-foreground">
                {user.role}
              </div>
            </div>
          </div>

          <Link
            to="/logout"
            className="mt-4 flex h-10 items-center justify-center gap-2 rounded-lg border border-sidebar-border text-sm text-muted-foreground transition hover:bg-sidebar-accent hover:text-sidebar-foreground"
          >
            <LogOut className="h-4 w-4" />
            Sair
          </Link>
        </div>
      </aside>

      <main className="min-w-0 flex-1 overflow-x-hidden">
        {children}
      </main>
    </div>
  );
}

export function PageHeader({
  title,
  subtitle,
  actions,
}: {
  title: string;
  subtitle?: string;
  actions?: ReactNode;
}) {
  return (
    <div className="mb-6 flex flex-col gap-4 sm:mb-8 sm:flex-row sm:items-end sm:justify-between">
      <div className="min-w-0">
        <h1 className="text-2xl font-display tracking-tight sm:text-3xl">
          {title}
        </h1>

        {subtitle && (
          <p className="mt-1 max-w-2xl text-sm text-muted-foreground">
            {subtitle}
          </p>
        )}
      </div>

      {actions && (
        <div className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row sm:items-center">
          {actions}
        </div>
      )}
    </div>
  );
}