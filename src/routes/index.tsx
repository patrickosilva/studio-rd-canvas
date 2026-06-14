import {
  createFileRoute,
  getRouteApi,
  Link,
} from "@tanstack/react-router";
import {
  ArrowRight,
  Calendar,
  Crown,
  Scissors,
  Star,
} from "lucide-react";

import { PageHeader } from "@/components/dashboard/Sidebar";

export const Route = createFileRoute("/")({
  component: ClientDashboard,
});

const rootRoute = getRouteApi("__root__");

const indicadores = [
  {
    label: "Pontos de fidelidade",
    value: "0",
    icon: Star,
  },
  {
    label: "Atendimentos realizados",
    value: "0",
    icon: Scissors,
  },
  {
    label: "Economia RD Black",
    value: "R$ 0,00",
    icon: Crown,
  },
];

function ClientDashboard() {
  const { usuario } = rootRoute.useRouteContext();

  const primeiroNome =
    usuario?.nome.trim().split(/\s+/)[0] ?? "Cliente";

  return (
    <div className="max-w-7xl p-8 lg:p-12">
      <PageHeader
        title={`Olá, ${primeiroNome}.`}
        subtitle="Acompanhe seus agendamentos, benefícios e histórico no Studio RD."
        actions={
          <Link
            to="/cliente/agendamentos"
            className="inline-flex h-10 items-center rounded-full bg-gold px-5 text-sm font-medium text-gold-foreground transition hover:opacity-90"
          >
            Novo agendamento
          </Link>
        }
      />

      <div className="grid gap-5 lg:grid-cols-3">
        {/* Próximo agendamento */}
        <section className="relative overflow-hidden rounded-2xl border border-gold/20 bg-gradient-dark p-7 shadow-premium lg:col-span-2">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,oklch(0.78_0.13_85/0.15),transparent_60%)]" />

          <div className="relative">
            <div className="flex items-center gap-2 text-xs uppercase tracking-widest text-gold">
              <Calendar className="h-4 w-4" />
              Próximo agendamento
            </div>

            <div className="mt-6">
              <h2 className="text-2xl font-display">
                Nenhum agendamento confirmado
              </h2>

              <p className="mt-2 max-w-xl text-sm text-muted-foreground">
                Quando uma solicitação for confirmada pela equipe do Studio RD,
                os dados do atendimento aparecerão aqui.
              </p>

              <Link
                to="/cliente/agendamentos"
                className="mt-6 inline-flex h-10 items-center rounded-full border border-border px-4 text-sm transition hover:bg-surface-elevated"
              >
                Solicitar um horário
              </Link>
            </div>
          </div>
        </section>

        {/* Assinatura */}
        <section className="rounded-2xl border border-border bg-surface p-7">
          <div className="flex items-center justify-between">
            <span className="text-xs uppercase tracking-widest text-muted-foreground">
              Assinatura
            </span>

            <Crown className="h-4 w-4 text-gold" />
          </div>

          <h2 className="mt-4 text-2xl font-display">
            Nenhuma assinatura ativa
          </h2>

          <p className="mt-2 text-sm text-muted-foreground">
            Seus dados do plano RD Black aparecerão aqui após a ativação.
          </p>

          <div className="mt-5 hairline" />

          <Link
            to="/cliente/beneficios"
            className="mt-5 inline-flex items-center gap-1 text-sm text-gold hover:underline"
          >
            Conhecer benefícios
            <ArrowRight className="h-4 w-4" />
          </Link>
        </section>

        {/* Indicadores */}
        {indicadores.map((indicador) => (
          <section
            key={indicador.label}
            className="rounded-2xl border border-border bg-surface p-6"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs uppercase tracking-widest text-muted-foreground">
                {indicador.label}
              </span>

              <indicador.icon className="h-4 w-4 text-gold" />
            </div>

            <div className="mt-3 text-3xl font-display">
              {indicador.value}
            </div>

            <p className="mt-2 text-xs text-muted-foreground">
              Ainda não há registros disponíveis.
            </p>
          </section>
        ))}
      </div>

      {/* Histórico */}
      <section className="mt-10 overflow-hidden rounded-2xl border border-border bg-surface">
        <div className="flex items-center justify-between border-b border-border px-6 py-4">
          <h2 className="text-sm font-medium">
            Histórico recente
          </h2>

          <Link
            to="/cliente/historico"
            className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground"
          >
            Ver tudo
            <ArrowRight className="h-3 w-3" />
          </Link>
        </div>

        <div className="flex min-h-48 flex-col items-center justify-center px-6 py-10 text-center">
          <Scissors className="h-8 w-8 text-muted-foreground" />

          <h3 className="mt-4 text-base font-medium">
            Nenhum atendimento registrado
          </h3>

          <p className="mt-2 max-w-md text-sm text-muted-foreground">
            Depois que um atendimento for concluído, ele aparecerá no seu
            histórico.
          </p>
        </div>
      </section>
    </div>
  );
}