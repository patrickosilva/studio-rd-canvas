import { useState } from "react";
import {
  getRouteApi,
  Link,
} from "@tanstack/react-router";
import {
  LogIn,
  LogOut,
  Menu,
  Scissors,
  UserRound,
  X,
} from "lucide-react";

const rootRoute = getRouteApi("__root__");

export function Navbar() {
  const [open, setOpen] = useState(false);

  const { usuario } = rootRoute.useRouteContext();

  const primeiroNome =
    usuario?.nome.trim().split(/\s+/)[0] ?? "";

  function fecharMenu() {
    setOpen(false);
  }

  return (
    <header className="fixed inset-x-0 top-0 z-50 border-b border-border bg-background/70 backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6">
        <Link
          to="/"
          className="flex items-center gap-2"
          onClick={fecharMenu}
        >
          <span className="grid h-8 w-8 place-items-center rounded-md bg-gradient-gold">
            <Scissors className="h-4 w-4 text-primary-foreground" />
          </span>

          <span className="font-display text-base tracking-tight">
            Studio <span className="text-gold">RD</span>
          </span>
        </Link>

        <nav className="hidden items-center gap-8 text-sm text-muted-foreground md:flex">
          <a
            href="/#servicos"
            className="transition hover:text-foreground"
          >
            Serviços
          </a>

          <a
            href="/#black"
            className="transition hover:text-foreground"
          >
            RD Black
          </a>

          <a
            href="/#depoimentos"
            className="transition hover:text-foreground"
          >
            Depoimentos
          </a>
        </nav>

        <div className="flex items-center gap-3">
          {!usuario ? (
            <>
              <Link
                to="/login"
                search={{
                  redirect: undefined,
                }}
                className="hidden items-center gap-2 text-sm text-muted-foreground transition hover:text-foreground md:inline-flex"
              >
                <LogIn className="h-4 w-4" />
                Conecte-se agora
              </Link>

              <Link
                to="/login"
                search={{
                  redirect: "/cliente/agendamentos",
                }}
                className="hidden h-9 items-center rounded-full bg-gold px-4 text-sm font-medium text-gold-foreground transition hover:opacity-90 md:inline-flex"
              >
                Agendar
              </Link>
            </>
          ) : usuario.papel === "DONO" ? (
            <Link
              to="/admin"
              className="hidden h-9 items-center gap-2 rounded-full border border-border px-4 text-sm font-medium transition hover:bg-surface md:inline-flex"
            >
              <UserRound className="h-4 w-4 text-gold" />
              {primeiroNome}
            </Link>
          ) : usuario.papel === "CLIENTE" ? (
            <>
              <Link
                to="/cliente"
                className="hidden items-center gap-2 text-sm text-muted-foreground transition hover:text-foreground md:inline-flex"
              >
                <UserRound className="h-4 w-4 text-gold" />
                {primeiroNome}
              </Link>

              <Link
                to="/cliente/agendamentos"
                className="hidden h-9 items-center rounded-full bg-gold px-4 text-sm font-medium text-gold-foreground transition hover:opacity-90 md:inline-flex"
              >
                Agendar
              </Link>
            </>
          ) : (
            <Link
        to="/funcionario"
        className="hidden h-9 items-center gap-2 rounded-full border border-border px-4 text-sm font-medium transition hover:bg-surface md:inline-flex"
  >
    <UserRound className="h-4 w-4 text-gold" />
    {primeiroNome}
  </Link>
          )}

          {usuario && (
            <Link
              to="/logout"
              className="hidden h-9 items-center gap-2 rounded-full border border-border px-4 text-sm text-muted-foreground transition hover:bg-surface hover:text-foreground md:inline-flex"
            >
              <LogOut className="h-4 w-4" />
              Sair
            </Link>
          )}

          <button
            type="button"
            onClick={() => setOpen((estadoAtual) => !estadoAtual)}
            className="p-2 md:hidden"
            aria-label={
              open
                ? "Fechar menu"
                : "Abrir menu"
            }
            aria-expanded={open}
          >
            {open ? (
              <X className="h-5 w-5" />
            ) : (
              <Menu className="h-5 w-5" />
            )}
          </button>
        </div>
      </div>

      {open && (
        <div className="border-t border-border bg-background/95 md:hidden">
          <div className="flex flex-col gap-4 px-6 py-5 text-sm">
            <a
              href="/#servicos"
              onClick={fecharMenu}
            >
              Serviços
            </a>

            <a
              href="/#black"
              onClick={fecharMenu}
            >
              RD Black
            </a>

            <a
              href="/#depoimentos"
              onClick={fecharMenu}
            >
              Depoimentos
            </a>

            <div className="h-px bg-border" />

            {!usuario ? (
              <>
                <Link
                  to="/login"
                  search={{
                    redirect: undefined,
                  }}
                  onClick={fecharMenu}
                  className="flex items-center gap-2"
                >
                  <LogIn className="h-4 w-4 text-gold" />
                  Conecte-se agora
                </Link>

                <Link
                  to="/login"
                  search={{
                    redirect: "/cliente/agendamentos",
                  }}
                  onClick={fecharMenu}
                  className="inline-flex h-10 items-center justify-center rounded-full bg-gold px-4 font-medium text-gold-foreground"
                >
                  Agendar
                </Link>
              </>
            ) : usuario.papel === "DONO" ? (
              <Link
                to="/admin"
                onClick={fecharMenu}
                className="flex items-center gap-2"
              >
                <UserRound className="h-4 w-4 text-gold" />
                Minha área — {primeiroNome}
              </Link>
            ) : usuario.papel === "CLIENTE" ? (
              <>
                <Link
                  to="/cliente"
                  onClick={fecharMenu}
                  className="flex items-center gap-2"
                >
                  <UserRound className="h-4 w-4 text-gold" />
                  Minha área — {primeiroNome}
                </Link>

                <Link
                  to="/cliente/agendamentos"
                  onClick={fecharMenu}
                  className="inline-flex h-10 items-center justify-center rounded-full bg-gold px-4 font-medium text-gold-foreground"
                >
                  Agendar
                </Link>
              </>
            ) : (
               <Link
    to="/funcionario"
    onClick={fecharMenu}
    className="flex items-center gap-2"
  >
    <UserRound className="h-4 w-4 text-gold" />
    Minha área — {primeiroNome}
  </Link>
            )}

            {usuario && (
              <Link
                to="/logout"
                onClick={fecharMenu}
                className="flex items-center gap-2 rounded-xl border border-border px-4 py-3 text-sm text-muted-foreground"
              >
                <LogOut className="h-4 w-4" />
                Sair
              </Link>
            )}
          </div>
        </div>
      )}
    </header>
  );
}