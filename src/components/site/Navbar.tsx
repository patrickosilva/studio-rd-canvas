import { useEffect, useState } from "react";
import { getRouteApi, Link } from "@tanstack/react-router";
import { LogIn, LogOut, Menu, UserRound, X } from "lucide-react";

import { cn } from "@/lib/utils";

const rootRoute = getRouteApi("__root__");

const navLinks = [
  { href: "/#servicos", label: "Serviços" },
  { href: "/#ritual", label: "Ritual" },
  { href: "/#ambiente", label: "Ambiente" },
  { href: "/#assinatura", label: "RD Black" },
];

export function Navbar() {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  const { usuario } = rootRoute.useRouteContext();

  const primeiroNome = usuario?.nome.trim().split(/\s+/)[0] ?? "";

  useEffect(() => {
    function onScroll() {
      setScrolled(window.scrollY > 24);
    }

    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });

    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  function fecharMenu() {
    setOpen(false);
  }

  return (
    <header
      className={cn(
        "fixed inset-x-0 top-0 z-50 transition-[background-color,backdrop-filter,border-color] duration-300",
        scrolled || open
          ? "border-b border-border bg-background/85 backdrop-blur-xl"
          : "border-b border-transparent bg-transparent",
      )}
    >
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6 lg:h-20 lg:px-10">
        <Link to="/" className="flex items-center gap-3" onClick={fecharMenu}>
          <span className="font-display-landing grid h-9 w-9 shrink-0 place-items-center rounded-full border border-gold/50 text-[13px] tracking-wide text-gold">
            RD
          </span>

          <span className="flex flex-col leading-none">
            <span className="font-display-landing text-[15px] tracking-[0.01em] text-foreground">
              Studio RD
            </span>
            <span className="mt-1 text-[10px] uppercase tracking-[0.28em] text-muted-foreground">
              Barbearia
            </span>
          </span>
        </Link>

        <nav className="hidden items-center gap-9 text-[13px] uppercase tracking-[0.12em] text-muted-foreground lg:flex">
          {navLinks.map((link) => (
            <a key={link.href} href={link.href} className="transition hover:text-gold">
              {link.label}
            </a>
          ))}
        </nav>

        <div className="flex items-center gap-3">
          {!usuario ? (
            <>
              <Link
                to="/login"
                search={{ redirect: undefined }}
                className="hidden items-center gap-2 text-[13px] text-muted-foreground transition hover:text-foreground lg:inline-flex"
              >
                <LogIn className="h-4 w-4" aria-hidden="true" />
                Entrar
              </Link>

              <Link
                to="/login"
                search={{ redirect: "/cliente/agendamentos" }}
                className="hidden h-10 items-center rounded-full bg-gold px-5 text-[13px] font-medium text-gold-foreground transition hover:opacity-90 lg:inline-flex"
              >
                Agendar
              </Link>
            </>
          ) : usuario.papel === "DONO" ? (
            <Link
              to="/admin"
              className="hidden h-10 items-center gap-2 rounded-full border border-border px-5 text-[13px] font-medium transition hover:bg-surface lg:inline-flex"
            >
              <UserRound className="h-4 w-4 text-gold" aria-hidden="true" />
              {primeiroNome}
            </Link>
          ) : usuario.papel === "CLIENTE" ? (
            <>
              <Link
                to="/cliente"
                className="hidden items-center gap-2 text-[13px] text-muted-foreground transition hover:text-foreground lg:inline-flex"
              >
                <UserRound className="h-4 w-4 text-gold" aria-hidden="true" />
                {primeiroNome}
              </Link>

              <Link
                to="/cliente/agendamentos"
                className="hidden h-10 items-center rounded-full bg-gold px-5 text-[13px] font-medium text-gold-foreground transition hover:opacity-90 lg:inline-flex"
              >
                Agendar
              </Link>
            </>
          ) : (
            <Link
              to="/funcionario"
              className="hidden h-10 items-center gap-2 rounded-full border border-border px-5 text-[13px] font-medium transition hover:bg-surface lg:inline-flex"
            >
              <UserRound className="h-4 w-4 text-gold" aria-hidden="true" />
              {primeiroNome}
            </Link>
          )}

          {usuario && (
            <Link
              to="/logout"
              className="hidden h-10 items-center gap-2 rounded-full border border-border px-5 text-[13px] text-muted-foreground transition hover:bg-surface hover:text-foreground lg:inline-flex"
            >
              <LogOut className="h-4 w-4" aria-hidden="true" />
              Sair
            </Link>
          )}

          <button
            type="button"
            onClick={() => setOpen((estadoAtual) => !estadoAtual)}
            className="grid h-11 w-11 place-items-center text-foreground lg:hidden"
            aria-label={open ? "Fechar menu" : "Abrir menu"}
            aria-expanded={open}
            aria-controls="landing-mobile-menu"
          >
            {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {open && (
        <div
          id="landing-mobile-menu"
          className="border-t border-border bg-background/95 backdrop-blur-xl lg:hidden"
        >
          <div className="flex flex-col gap-1 px-6 py-4 text-base">
            {navLinks.map((link) => (
              <a
                key={link.href}
                href={link.href}
                onClick={fecharMenu}
                className="rounded-lg px-2 py-3 text-foreground/90 transition hover:bg-surface"
              >
                {link.label}
              </a>
            ))}

            <div className="my-3 hairline" />

            {!usuario ? (
              <>
                <Link
                  to="/login"
                  search={{ redirect: undefined }}
                  onClick={fecharMenu}
                  className="flex items-center gap-2 rounded-lg px-2 py-3"
                >
                  <LogIn className="h-4 w-4 text-gold" aria-hidden="true" />
                  Entrar
                </Link>

                <Link
                  to="/login"
                  search={{ redirect: "/cliente/agendamentos" }}
                  onClick={fecharMenu}
                  className="mt-2 inline-flex h-12 items-center justify-center rounded-full bg-gold px-4 font-medium text-gold-foreground"
                >
                  Agendar
                </Link>
              </>
            ) : usuario.papel === "DONO" ? (
              <Link
                to="/admin"
                onClick={fecharMenu}
                className="flex items-center gap-2 rounded-lg px-2 py-3"
              >
                <UserRound className="h-4 w-4 text-gold" aria-hidden="true" />
                Minha área — {primeiroNome}
              </Link>
            ) : usuario.papel === "CLIENTE" ? (
              <>
                <Link
                  to="/cliente"
                  onClick={fecharMenu}
                  className="flex items-center gap-2 rounded-lg px-2 py-3"
                >
                  <UserRound className="h-4 w-4 text-gold" aria-hidden="true" />
                  Minha área — {primeiroNome}
                </Link>

                <Link
                  to="/cliente/agendamentos"
                  onClick={fecharMenu}
                  className="mt-2 inline-flex h-12 items-center justify-center rounded-full bg-gold px-4 font-medium text-gold-foreground"
                >
                  Agendar
                </Link>
              </>
            ) : (
              <Link
                to="/funcionario"
                onClick={fecharMenu}
                className="flex items-center gap-2 rounded-lg px-2 py-3"
              >
                <UserRound className="h-4 w-4 text-gold" aria-hidden="true" />
                Minha área — {primeiroNome}
              </Link>
            )}

            {usuario && (
              <Link
                to="/logout"
                onClick={fecharMenu}
                className="mt-2 flex items-center gap-2 rounded-xl border border-border px-4 py-3 text-sm text-muted-foreground"
              >
                <LogOut className="h-4 w-4" aria-hidden="true" />
                Sair
              </Link>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
