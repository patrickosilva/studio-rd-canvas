import {
  useEffect,
  useMemo,
  useState,
} from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import {
  CalendarCheck,
  CheckCircle2,
  Clock,
  Scissors,
} from "lucide-react";

import { PageHeader } from "@/components/dashboard/Sidebar";
import { funcionarioListarSolicitacoes } from "@/lib/api/agendamento.functions";

export const Route = createFileRoute("/funcionario/")({
  component: FuncionarioDashboard,
});

type AgendamentoOperacional = {
  id: string;
  inicio: string | Date;
  fim: string | Date;
  status: string;
  observacaoCliente: string | null;
  cliente: {
    id: string;
    nome: string;
    email: string;
    telefone: string | null;
  };
  servico: {
    nome: string;
    duracaoMinutos: number;
    precoCentavos: number;
  };
  profissional: {
    id: string;
    nome: string;
  };
};

function ehMesmoDia(data: string | Date, referencia: Date): boolean {
  const dataComparada = new Date(data);

  return (
    dataComparada.getFullYear() === referencia.getFullYear() &&
    dataComparada.getMonth() === referencia.getMonth() &&
    dataComparada.getDate() === referencia.getDate()
  );
}

function formatarDataHora(valor: string | Date): string {
  const data = new Date(valor);

  return new Intl.DateTimeFormat("pt-BR", {
    weekday: "short",
    day: "2-digit",
    month: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  }).format(data);
}

function traduzirStatus(status: string): string {
  const mapa: Record<string, string> = {
    SOLICITADO: "Solicitado",
    CONFIRMADO: "Confirmado",
  };

  return mapa[status] ?? status;
}

function obterClasseStatus(status: string): string {
  if (status === "CONFIRMADO") {
    return "bg-gold-soft text-gold";
  }

  return "border border-border bg-background text-muted-foreground";
}

function FuncionarioDashboard() {
  const carregarSolicitacoes = useServerFn(
    funcionarioListarSolicitacoes,
  );

  const [agendamentos, setAgendamentos] = useState<
    AgendamentoOperacional[]
  >([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState("");

  async function carregarDados() {
    setCarregando(true);
    setErro("");

    try {
      const resposta = await carregarSolicitacoes();

      setAgendamentos(resposta);
    } catch (error) {
      console.error(error);

      setErro("Não foi possível carregar o painel operacional.");
    } finally {
      setCarregando(false);
    }
  }

  useEffect(() => {
    void carregarDados();
  }, []);

  const resumo = useMemo(() => {
    const hoje = new Date();

    const solicitados = agendamentos.filter(
      (agendamento) => agendamento.status === "SOLICITADO",
    );

    const confirmados = agendamentos.filter(
      (agendamento) => agendamento.status === "CONFIRMADO",
    );

    const confirmadosHoje = confirmados.filter((agendamento) =>
      ehMesmoDia(agendamento.inicio, hoje),
    );

    return {
      solicitados: solicitados.length,
      confirmados: confirmados.length,
      confirmadosHoje: confirmadosHoje.length,
    };
  }, [agendamentos]);

  const proximosAtendimentos = useMemo(
    () =>
      agendamentos
        .filter(
          (agendamento) =>
            agendamento.status === "SOLICITADO" ||
            agendamento.status === "CONFIRMADO",
        )
        .sort(
          (a, b) =>
            new Date(a.inicio).getTime() -
            new Date(b.inicio).getTime(),
        )
        .slice(0, 5),
    [agendamentos],
  );

  const cards = [
    {
      label: "Solicitações pendentes",
      value: String(resumo.solicitados),
      icon: CalendarCheck,
      descricao: "Pedidos aguardando confirmação ou recusa.",
    },
    {
      label: "Confirmados hoje",
      value: String(resumo.confirmadosHoje),
      icon: Scissors,
      descricao: "Atendimentos confirmados para hoje.",
    },
    {
      label: "Confirmados no total",
      value: String(resumo.confirmados),
      icon: CheckCircle2,
      descricao: "Horários aceitos e ainda não concluídos.",
    },
  ];

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
            Ver agenda
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
              {carregando ? "..." : card.value}
            </div>

            <p className="mt-2 text-xs text-muted-foreground">
              {card.descricao}
            </p>
          </section>
        ))}
      </div>

      <section className="mt-10 overflow-hidden rounded-2xl border border-border bg-surface">
        <div className="flex items-center justify-between border-b border-border px-6 py-4">
          <div>
            <h2 className="text-sm font-medium">
              Próximos movimentos da agenda
            </h2>

            <p className="mt-1 text-xs text-muted-foreground">
              Solicitações pendentes e horários confirmados.
            </p>
          </div>

          <Clock className="h-4 w-4 text-gold" />
        </div>

        {carregando ? (
          <div className="px-6 py-10">
            <p className="text-sm text-muted-foreground">
              Carregando agenda operacional...
            </p>
          </div>
        ) : proximosAtendimentos.length === 0 ? (
          <div className="flex min-h-56 flex-col items-center justify-center px-6 py-10 text-center">
            <CalendarCheck className="h-10 w-10 text-muted-foreground" />

            <h3 className="mt-4 text-lg font-display">
              Nenhum movimento pendente
            </h3>

            <p className="mt-2 max-w-md text-sm text-muted-foreground">
              Quando houver solicitações ou horários confirmados, eles
              aparecerão aqui.
            </p>
          </div>
        ) : (
          <div className="divide-y divide-border">
            {proximosAtendimentos.map((agendamento) => (
              <article
                key={agendamento.id}
                className="flex flex-col gap-4 px-6 py-5 lg:flex-row lg:items-center lg:justify-between"
              >
                <div>
                  <div className="flex flex-wrap items-center gap-3">
                    <h3 className="font-medium">
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

                  <p className="mt-2 text-sm text-muted-foreground">
                    {formatarDataHora(agendamento.inicio)} ·{" "}
                    {agendamento.profissional.nome}
                  </p>

                  <p className="mt-1 text-sm text-muted-foreground">
                    Cliente: {agendamento.cliente.nome}
                  </p>
                </div>

                <Link
                  to="/funcionario/solicitacoes"
                  className="inline-flex h-9 w-fit items-center rounded-full border border-border px-4 text-sm transition hover:bg-surface-elevated"
                >
                  Gerenciar
                </Link>
              </article>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}