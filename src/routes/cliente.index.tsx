import {
  useEffect,
  useMemo,
  useState,
} from "react";
import {
  createFileRoute,
  getRouteApi,
  Link,
} from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import {
  ArrowRight,
  Calendar,
  Crown,
  Scissors,
  Star,
  UserRound,
} from "lucide-react";

import { PageHeader } from "@/components/dashboard/Sidebar";
import { listarMeusAgendamentos } from "@/lib/api/agendamento.functions";

export const Route = createFileRoute("/cliente/")({
  component: ClientDashboard,
});

const rootRoute = getRouteApi("__root__");

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
    return "bg-background text-muted-foreground border border-border";
  }

  if (status === "RECUSADO" || status.includes("CANCELADO")) {
    return "bg-destructive/10 text-destructive";
  }

  return "bg-surface-elevated text-muted-foreground";
}

function ClientDashboard() {
  const { usuario } = rootRoute.useRouteContext();

  const carregarMeusAgendamentos = useServerFn(
    listarMeusAgendamentos,
  );

  const [agendamentos, setAgendamentos] = useState<Agendamento[]>(
    [],
  );
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState("");

  const primeiroNome =
    usuario?.nome.trim().split(/\s+/)[0] ?? "Cliente";

  async function carregarDados() {
    setCarregando(true);
    setErro("");

    try {
      const resposta = await carregarMeusAgendamentos();

      setAgendamentos(resposta);
    } catch (error) {
      console.error(error);

      setErro(
        "Não foi possível carregar seus agendamentos agora.",
      );
    } finally {
      setCarregando(false);
    }
  }

  useEffect(() => {
    void carregarDados();
  }, []);

  const proximoAgendamento = useMemo(() => {
    const agora = Date.now();

    return agendamentos
      .filter((agendamento) =>
        ["SOLICITADO", "CONFIRMADO"].includes(
          agendamento.status,
        ),
      )
      .filter(
        (agendamento) =>
          new Date(agendamento.inicio).getTime() >= agora,
      )
      .sort(
        (a, b) =>
          new Date(a.inicio).getTime() -
          new Date(b.inicio).getTime(),
      )[0];
  }, [agendamentos]);

  const atendimentosConcluidos = useMemo(
    () =>
      agendamentos.filter(
        (agendamento) => agendamento.status === "CONCLUIDO",
      ).length,
    [agendamentos],
  );

  const historicoRecente = useMemo(
    () => agendamentos.slice(0, 4),
    [agendamentos],
  );

  const indicadores = [
    {
      label: "Pontos de fidelidade",
      value: "0",
      icon: Star,
      descricao: "Ainda não há pontuação registrada.",
    },
    {
      label: "Atendimentos realizados",
      value: String(atendimentosConcluidos),
      icon: Scissors,
      descricao:
        atendimentosConcluidos === 1
          ? "1 atendimento concluído."
          : `${atendimentosConcluidos} atendimentos concluídos.`,
    },
    {
      label: "Economia RD Black",
      value: "R$ 0,00",
      icon: Crown,
      descricao: "Economia será calculada quando os planos forem ativados.",
    },
  ];

  return (
    <div className="flex flex-col gap-10">

      {erro && (
        <div
          role="alert"
          className="mb-6 rounded-xl border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive"
        >
          {erro}
        </div>
      )}

      <div className="grid gap-5 lg:grid-cols-3">
        <section className="relative overflow-hidden rounded-2xl border border-gold/20 bg-gradient-dark p-7 shadow-premium lg:col-span-2">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,oklch(0.78_0.13_85/0.15),transparent_60%)]" />

          <div className="relative">
            <div className="flex items-center gap-2 text-xs uppercase tracking-widest text-gold">
              <Calendar className="h-4 w-4" />
              Próximo agendamento
            </div>

            {carregando ? (
              <p className="mt-6 text-sm text-muted-foreground">
                Carregando seu próximo horário...
              </p>
            ) : proximoAgendamento ? (
              <div className="mt-6">
                <div className="flex flex-wrap items-center gap-3">
                  <h2 className="text-2xl font-display">
                    {proximoAgendamento.servico.nome}
                  </h2>

                  <span
                    className={`rounded-full px-3 py-1 text-xs ${obterClasseStatus(
                      proximoAgendamento.status,
                    )}`}
                  >
                    {traduzirStatus(proximoAgendamento.status)}
                  </span>
                </div>

                <p className="mt-2 text-sm text-muted-foreground">
                  {formatarDataHora(proximoAgendamento.inicio)}
                </p>

                <p className="mt-2 flex items-center gap-2 text-sm text-muted-foreground">
                  <UserRound className="h-4 w-4" />
                  {proximoAgendamento.profissional.nome}
                </p>

                {proximoAgendamento.status === "SOLICITADO" && (
                  <p className="mt-4 max-w-xl text-sm text-muted-foreground">
                    Sua solicitação foi enviada e está aguardando confirmação
                    da equipe.
                  </p>
                )}

                {proximoAgendamento.status === "CONFIRMADO" && (
                  <p className="mt-4 max-w-xl text-sm text-muted-foreground">
                    Seu horário já foi confirmado pela equipe do Studio RD.
                  </p>
                )}

                <Link
                  to="/cliente/agendamentos"
                  className="mt-6 inline-flex h-10 items-center rounded-full border border-border px-4 text-sm transition hover:bg-surface-elevated"
                >
                  Ver meus pedidos
                </Link>
              </div>
            ) : (
              <div className="mt-6">
                <h2 className="text-2xl font-display">
                  Nenhum agendamento futuro
                </h2>

                <p className="mt-2 max-w-xl text-sm text-muted-foreground">
                  Quando uma solicitação for enviada ou confirmada, os dados
                  do atendimento aparecerão aqui.
                </p>

                <Link
                  to="/cliente/agendamentos"
                  className="mt-6 inline-flex h-10 items-center rounded-full border border-border px-4 text-sm transition hover:bg-surface-elevated"
                >
                  Solicitar um horário
                </Link>
              </div>
            )}
          </div>
        </section>

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
              {indicador.descricao}
            </p>
          </section>
        ))}
      </div>

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

        {carregando ? (
          <div className="px-6 py-10">
            <p className="text-sm text-muted-foreground">
              Carregando histórico...
            </p>
          </div>
        ) : historicoRecente.length === 0 ? (
          <div className="flex min-h-48 flex-col items-center justify-center px-6 py-10 text-center">
            <Scissors className="h-8 w-8 text-muted-foreground" />

            <h3 className="mt-4 text-base font-medium">
              Nenhum atendimento registrado
            </h3>

            <p className="mt-2 max-w-md text-sm text-muted-foreground">
              Depois que você solicitar ou concluir um atendimento, ele
              aparecerá aqui.
            </p>
          </div>
        ) : (
          <div className="divide-y divide-border">
            {historicoRecente.map((agendamento) => (
              <article
                key={agendamento.id}
                className="flex flex-col gap-3 px-6 py-4 md:flex-row md:items-center md:justify-between"
              >
                <div>
                  <h3 className="font-medium">
                    {agendamento.servico.nome}
                  </h3>

                  <p className="mt-1 text-sm text-muted-foreground">
                    {formatarDataHora(agendamento.inicio)} ·{" "}
                    {agendamento.profissional.nome}
                  </p>

                  {agendamento.motivoRecusa && (
                    <p className="mt-1 text-sm text-destructive">
                      Motivo da recusa: {agendamento.motivoRecusa}
                    </p>
                  )}
                </div>

                <span
                  className={`w-fit rounded-full px-3 py-1 text-xs ${obterClasseStatus(
                    agendamento.status,
                  )}`}
                >
                  {traduzirStatus(agendamento.status)}
                </span>
              </article>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}