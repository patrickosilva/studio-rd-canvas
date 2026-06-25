import {
  useEffect,
  useMemo,
  useState,
} from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import {
  CalendarClock,
  Clock,
  Scissors,
  UserRound,
} from "lucide-react";

import { PageHeader } from "@/components/dashboard/Sidebar";
import { listarMeusAgendamentos } from "@/lib/api/agendamento.functions";

export const Route = createFileRoute("/cliente/historico")({
  component: HistoricoPage,
});

type Agendamento = {
  id: string;
  inicio: string | Date;
  fim: string | Date;
  status: string;
  observacaoCliente: string | null;
  motivoRecusa: string | null;
  servico: {
    nome: string;
    duracaoMinutos: number;
    precoCentavos: number;
  };
  profissional: {
    nome: string;
  };
};

function formatarMoeda(precoCentavos: number): string {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(precoCentavos / 100);
}

function formatarDataHora(valor: string | Date): string {
  const data = new Date(valor);

  return new Intl.DateTimeFormat("pt-BR", {
    weekday: "short",
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(data);
}

function traduzirStatus(status: string): string {
  const mapa: Record<string, string> = {
    SOLICITADO: "Solicitado",
    CONFIRMADO: "Confirmado",
    RECUSADO: "Recusado",
    CANCELADO_CLIENTE: "Cancelado por você",
    CANCELADO_FUNCIONARIO: "Cancelado pela equipe",
    CONCLUIDO: "Concluído",
    FALTOU: "Não compareceu",
  };

  return mapa[status] ?? status;
}

function obterClasseStatus(status: string): string {
  if (status === "CONFIRMADO") {
    return "bg-gold-soft text-gold";
  }

  if (status === "SOLICITADO") {
    return "border border-border bg-background text-muted-foreground";
  }

  if (status === "CONCLUIDO") {
    return "bg-emerald-500/10 text-emerald-400";
  }

  if (
    status === "RECUSADO" ||
    status === "CANCELADO_CLIENTE" ||
    status === "CANCELADO_FUNCIONARIO" ||
    status === "FALTOU"
  ) {
    return "bg-destructive/10 text-destructive";
  }

  return "bg-surface-elevated text-muted-foreground";
}

function HistoricoPage() {
  const carregarMeusAgendamentos = useServerFn(
    listarMeusAgendamentos,
  );

  const [agendamentos, setAgendamentos] = useState<Agendamento[]>(
    [],
  );
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState("");

  async function carregarDados() {
    setCarregando(true);
    setErro("");

    try {
      const resposta = await carregarMeusAgendamentos();

      setAgendamentos(resposta);
    } catch (error) {
      console.error(error);

      setErro("Não foi possível carregar seu histórico.");
    } finally {
      setCarregando(false);
    }
  }

  useEffect(() => {
    void carregarDados();
  }, []);

  const resumo = useMemo(() => {
    const total = agendamentos.length;

    const solicitados = agendamentos.filter(
      (agendamento) => agendamento.status === "SOLICITADO",
    ).length;

    const confirmados = agendamentos.filter(
      (agendamento) => agendamento.status === "CONFIRMADO",
    ).length;

    const concluidos = agendamentos.filter(
      (agendamento) => agendamento.status === "CONCLUIDO",
    ).length;

    return {
      total,
      solicitados,
      confirmados,
      concluidos,
    };
  }, [agendamentos]);

  return (
    <div className="max-w-7xl p-8 lg:p-12">
      <PageHeader
        title="Histórico"
        subtitle="Acompanhe todos os seus pedidos e atendimentos no Studio RD."
      />

      {erro && (
        <div
          role="alert"
          className="mb-6 rounded-xl border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive"
        >
          {erro}
        </div>
      )}

      <div className="mb-8 grid gap-4 md:grid-cols-4">
        <section className="rounded-2xl border border-border bg-surface p-5">
          <span className="text-xs uppercase tracking-widest text-muted-foreground">
            Total
          </span>

          <div className="mt-3 text-3xl font-display">
            {resumo.total}
          </div>

          <p className="mt-1 text-xs text-muted-foreground">
            pedidos registrados
          </p>
        </section>

        <section className="rounded-2xl border border-border bg-surface p-5">
          <span className="text-xs uppercase tracking-widest text-muted-foreground">
            Solicitados
          </span>

          <div className="mt-3 text-3xl font-display">
            {resumo.solicitados}
          </div>

          <p className="mt-1 text-xs text-muted-foreground">
            aguardando decisão
          </p>
        </section>

        <section className="rounded-2xl border border-border bg-surface p-5">
          <span className="text-xs uppercase tracking-widest text-muted-foreground">
            Confirmados
          </span>

          <div className="mt-3 text-3xl font-display">
            {resumo.confirmados}
          </div>

          <p className="mt-1 text-xs text-muted-foreground">
            horários aceitos
          </p>
        </section>

        <section className="rounded-2xl border border-border bg-surface p-5">
          <span className="text-xs uppercase tracking-widest text-muted-foreground">
            Concluídos
          </span>

          <div className="mt-3 text-3xl font-display">
            {resumo.concluidos}
          </div>

          <p className="mt-1 text-xs text-muted-foreground">
            atendimentos finalizados
          </p>
        </section>
      </div>

      {carregando ? (
        <section className="rounded-2xl border border-border bg-surface p-8">
          <p className="text-sm text-muted-foreground">
            Carregando histórico...
          </p>
        </section>
      ) : agendamentos.length === 0 ? (
        <section className="flex min-h-80 flex-col items-center justify-center rounded-2xl border border-border bg-surface p-8 text-center">
          <Scissors className="h-10 w-10 text-muted-foreground" />

          <h2 className="mt-5 text-xl font-display">
            Nenhum agendamento registrado
          </h2>

          <p className="mt-2 max-w-md text-sm text-muted-foreground">
            Quando você solicitar um horário, ele aparecerá aqui com o status
            atualizado.
          </p>
        </section>
      ) : (
        <section className="overflow-hidden rounded-2xl border border-border bg-surface">
          <div className="border-b border-border px-6 py-4">
            <h2 className="text-sm font-medium">
              Registros encontrados
            </h2>
          </div>

          <div className="divide-y divide-border">
            {agendamentos.map((agendamento) => (
              <article
                key={agendamento.id}
                className="px-6 py-5"
              >
                <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
                  <div>
                    <div className="flex flex-wrap items-center gap-3">
                      <h3 className="text-lg font-display">
                        {agendamento.servico.nome}
                      </h3>

                      <span
                        className={`rounded-full px-3 py-1 text-xs ${obterClasseStatus(
                          agendamento.status,
                        )}`}
                      >
                        {traduzirStatus(agendamento.status)}
                      </span>
                    </div>

                    <div className="mt-4 grid gap-3 text-sm text-muted-foreground md:grid-cols-3">
                      <p className="flex items-center gap-2">
                        <CalendarClock className="h-4 w-4 text-gold" />
                        {formatarDataHora(agendamento.inicio)}
                      </p>

                      <p className="flex items-center gap-2">
                        <Clock className="h-4 w-4 text-gold" />
                        {agendamento.servico.duracaoMinutos} min ·{" "}
                        {formatarMoeda(
                          agendamento.servico.precoCentavos,
                        )}
                      </p>

                      <p className="flex items-center gap-2">
                        <UserRound className="h-4 w-4 text-gold" />
                        {agendamento.profissional.nome}
                      </p>
                    </div>

                    {agendamento.observacaoCliente && (
                      <p className="mt-4 rounded-xl border border-border bg-background/40 p-4 text-sm text-muted-foreground">
                        Observação: {agendamento.observacaoCliente}
                      </p>
                    )}

                    {agendamento.motivoRecusa && (
                      <p className="mt-4 rounded-xl border border-destructive/30 bg-destructive/10 p-4 text-sm text-destructive">
                        Motivo da recusa: {agendamento.motivoRecusa}
                      </p>
                    )}
                  </div>
                </div>
              </article>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}