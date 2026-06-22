import { createFileRoute, Link } from "@tanstack/react-router";
import {
  CalendarCheck,
  Clock,
  Scissors,
} from "lucide-react";

import { PageHeader } from "@/components/dashboard/Sidebar";

export const Route = createFileRoute("/funcionario/")({
  component: FuncionarioDashboard,
});

const cards = [
  {
    label: "Solicitações pendentes",
    value: "0",
    icon: CalendarCheck,
  },
  {
    label: "Atendimentos de hoje",
    value: "0",
    icon: Scissors,
  },
  {
    label: "Horários em análise",
    value: "0",
    icon: Clock,
  },
];

function FuncionarioDashboard() {
  return (
    <div className="max-w-7xl p-8 lg:p-12">
      <PageHeader
        title="Painel do funcionário"
        subtitle="Acompanhe as solicitações e atendimentos operacionais do Studio RD."
        actions={
          <Link
            to="/funcionario/solicitacoes"
            className="inline-flex h-10 items-center rounded-full bg-gold px-5 text-sm font-medium text-gold-foreground transition hover:opacity-90"
          >
            Ver solicitações
          </Link>
        }
      />

      <div className="grid gap-5 lg:grid-cols-3">
        {cards.map((card) => (
          <section
            key={card.label}
            className="rounded-2xl border border-border bg-surface p-6"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs uppercase tracking-widest text-muted-foreground">
                {card.label}
              </span>

              <card.icon className="h-4 w-4 text-gold" />
            </div>

            <div className="mt-3 text-3xl font-display">
              {card.value}
            </div>

            <p className="mt-2 text-xs text-muted-foreground">
              Ainda não há registros reais conectados ao banco.
            </p>
          </section>
        ))}
      </div>

      <section className="mt-10 rounded-2xl border border-border bg-surface p-8">
        <div className="flex items-center gap-3">
          <CalendarCheck className="h-5 w-5 text-gold" />

          <h2 className="text-lg font-display">
            Operação de agendamentos
          </h2>
        </div>

        <p className="mt-3 max-w-2xl text-sm text-muted-foreground">
          Esta área será usada para o funcionário confirmar, recusar e
          acompanhar solicitações de agendamento. Por enquanto, ela está
          preparada visualmente, mas ainda não possui dados reais de
          agendamentos.
        </p>
      </section>
    </div>
  );
}