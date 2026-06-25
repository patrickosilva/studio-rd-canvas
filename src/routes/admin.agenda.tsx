import {
  useEffect,
  useMemo,
  useState,
} from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import {
  BarChart3,
  CalendarClock,
  CheckCircle2,
  Clock,
  DollarSign,
  Scissors,
  UserRound,
} from "lucide-react";

import { PageHeader } from "@/components/dashboard/Sidebar";
import { adminListarAgenda } from "@/lib/api/agendamento.functions";

export const Route = createFileRoute("/admin/agenda")({
  component: AdminAgendaPage,
});

type AgendamentoAdmin = {
  id: string;
  inicio: string | Date;
  fim: string | Date;
  status: string;
  observacaoCliente: string | null;
  motivoRecusa: string | null;
  criadoEm: string | Date;
  atualizadoEm: string | Date;

  cliente: {
    id: string;
    nome: string;
    email: string;
    telefone: string | null;
  };

  profissional: {
    id: string;
    nome: string;
  };

  servico: {
    id: string;
    nome: string;
    duracaoMinutos: number;
    precoCentavos: number;
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
    CANCELADO_CLIENTE: "Cancelado pelo cliente",
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

function AdminAgendaPage() {
  const carregarAgenda = useServerFn(adminListarAgenda);

  const [agendamentos, setAgendamentos] = useState<AgendamentoAdmin[]>(
    [],
  );
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState("");

  async function carregarDados() {
    setCarregando(true);
    setErro("");

    try {
      const resposta = await carregarAgenda();

      setAgendamentos(resposta);
    } catch (error) {
      console.error(error);

      setErro("Não foi possível carregar a agenda administrativa.");
    } finally {
      setCarregando(false);
    }
  }

  useEffect(() => {
    void carregarDados();
  }, []);

  const resumo = useMemo(() => {
    const solicitados = agendamentos.filter(
      (agendamento) => agendamento.status === "SOLICITADO",
    );

    const confirmados = agendamentos.filter(
      (agendamento) => agendamento.status === "CONFIRMADO",
    );

    const concluidos = agendamentos.filter(
      (agendamento) => agendamento.status === "CONCLUIDO",
    );

    const receitaPrevista = agendamentos
      .filter((agendamento) =>
        ["SOLICITADO", "CONFIRMADO"].includes(agendamento.status),
      )
      .reduce(
        (total, agendamento) =>
          total + agendamento.servico.precoCentavos,
        0,
      );

    const receitaConcluida = concluidos.reduce(
      (total, agendamento) =>
        total + agendamento.servico.precoCentavos,
      0,
    );

    return {
      total: agendamentos.length,
      solicitados: solicitados.length,
      confirmados: confirmados.length,
      concluidos: concluidos.length,
      receitaPrevista,
      receitaConcluida,
    };
  }, [agendamentos]);

  return (
    <div className="max-w-7xl p-8 lg:p-12">
      <PageHeader
        title="Monitorar agenda"
        subtitle="Acompanhe solicitações, confirmações, atendimentos concluídos e valores da operação."
        actions={
          <Link
            to="/funcionario/solicitacoes"
            className="inline-flex h-10 items-center rounded-full border border-border px-5 text-sm transition hover:bg-surface-elevated"
          >
            Ir para operação
          </Link>
        }
      />

      {erro && (
        <div
          role="alert"
          className="mb-6 rounded-xl border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive"
        >
          {erro}
        </div>
      )}

      <div className="mb-8 grid gap-4 md:grid-cols-3 xl:grid-cols-6">
        <section className="rounded-2xl border border-border bg-surface p-5">
          <div className="flex items-center justify-between">
            <span className="text-xs uppercase tracking-widest text-muted-foreground">
              Total
            </span>

            <CalendarClock className="h-4 w-4 text-gold" />
          </div>

          <div className="mt-3 text-3xl font-display">
            {carregando ? "..." : resumo.total}
          </div>

          <p className="mt-1 text-xs text-muted-foreground">
            registros
          </p>
        </section>

        <section className="rounded-2xl border border-border bg-surface p-5">
          <div className="flex items-center justify-between">
            <span className="text-xs uppercase tracking-widest text-muted-foreground">
              Pendentes
            </span>

            <Clock className="h-4 w-4 text-gold" />
          </div>

          <div className="mt-3 text-3xl font-display">
            {carregando ? "..." : resumo.solicitados}
          </div>

          <p className="mt-1 text-xs text-muted-foreground">
            aguardando equipe
          </p>
        </section>

        <section className="rounded-2xl border border-border bg-surface p-5">
          <div className="flex items-center justify-between">
            <span className="text-xs uppercase tracking-widest text-muted-foreground">
              Confirmados
            </span>

            <CheckCircle2 className="h-4 w-4 text-gold" />
          </div>

          <div className="mt-3 text-3xl font-display">
            {carregando ? "..." : resumo.confirmados}
          </div>

          <p className="mt-1 text-xs text-muted-foreground">
            em aberto
          </p>
        </section>

        <section className="rounded-2xl border border-border bg-surface p-5">
          <div className="flex items-center justify-between">
            <span className="text-xs uppercase tracking-widest text-muted-foreground">
              Concluídos
            </span>

            <Scissors className="h-4 w-4 text-gold" />
          </div>

          <div className="mt-3 text-3xl font-display">
            {carregando ? "..." : resumo.concluidos}
          </div>

          <p className="mt-1 text-xs text-muted-foreground">
            finalizados
          </p>
        </section>

        <section className="rounded-2xl border border-border bg-surface p-5 xl:col-span-1">
          <div className="flex items-center justify-between">
            <span className="text-xs uppercase tracking-widest text-muted-foreground">
              Previsto
            </span>

            <BarChart3 className="h-4 w-4 text-gold" />
          </div>

          <div className="mt-3 text-2xl font-display">
            {carregando
              ? "..."
              : formatarMoeda(resumo.receitaPrevista)}
          </div>

          <p className="mt-1 text-xs text-muted-foreground">
            solicitado + confirmado
          </p>
        </section>

        <section className="rounded-2xl border border-border bg-surface p-5 xl:col-span-1">
          <div className="flex items-center justify-between">
            <span className="text-xs uppercase tracking-widest text-muted-foreground">
              Realizado
            </span>

            <DollarSign className="h-4 w-4 text-gold" />
          </div>

          <div className="mt-3 text-2xl font-display">
            {carregando
              ? "..."
              : formatarMoeda(resumo.receitaConcluida)}
          </div>

          <p className="mt-1 text-xs text-muted-foreground">
            concluído
          </p>
        </section>
      </div>

      {carregando ? (
        <section className="rounded-2xl border border-border bg-surface p-8">
          <p className="text-sm text-muted-foreground">
            Carregando agenda...
          </p>
        </section>
      ) : agendamentos.length === 0 ? (
        <section className="flex min-h-80 flex-col items-center justify-center rounded-2xl border border-border bg-surface p-8 text-center">
          <CalendarClock className="h-10 w-10 text-muted-foreground" />

          <h2 className="mt-5 text-xl font-display">
            Nenhum agendamento registrado
          </h2>

          <p className="mt-2 max-w-md text-sm text-muted-foreground">
            Quando clientes solicitarem horários, eles aparecerão aqui para
            acompanhamento administrativo.
          </p>
        </section>
      ) : (
        <section className="overflow-hidden rounded-2xl border border-border bg-surface">
          <div className="border-b border-border px-6 py-4">
            <h2 className="text-sm font-medium">
              Agenda geral
            </h2>

            <p className="mt-1 text-xs text-muted-foreground">
              Esta tela é apenas de monitoramento. A confirmação, recusa e
              conclusão ficam na área do funcionário.
            </p>
          </div>

          <div className="divide-y divide-border">
            {agendamentos.map((agendamento) => (
              <article
                key={agendamento.id}
                className="px-6 py-5"
              >
                <div className="flex flex-col gap-5 xl:flex-row xl:items-start xl:justify-between">
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

                    <div className="mt-4 grid gap-3 text-sm text-muted-foreground md:grid-cols-2 xl:grid-cols-4">
                      <p className="flex items-center gap-2">
                        <CalendarClock className="h-4 w-4 text-gold" />
                        {formatarDataHora(agendamento.inicio)}
                      </p>

                      <p className="flex items-center gap-2">
                        <Scissors className="h-4 w-4 text-gold" />
                        {agendamento.servico.duracaoMinutos} min ·{" "}
                        {formatarMoeda(
                          agendamento.servico.precoCentavos,
                        )}
                      </p>

                      <p className="flex items-center gap-2">
                        <UserRound className="h-4 w-4 text-gold" />
                        Cliente: {agendamento.cliente.nome}
                      </p>

                      <p className="flex items-center gap-2">
                        <UserRound className="h-4 w-4 text-gold" />
                        Profissional: {agendamento.profissional.nome}
                      </p>
                    </div>

                    {agendamento.observacaoCliente && (
                      <p className="mt-4 rounded-xl border border-border bg-background/40 p-4 text-sm text-muted-foreground">
                        Observação do cliente:{" "}
                        {agendamento.observacaoCliente}
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