import {
  type FormEvent,
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
  Edit3,
  Loader2,
  Scissors,
  UserRound,
} from "lucide-react";

import { PageHeader } from "@/components/dashboard/Sidebar";
import {
  adminListarAgenda,
  listarIndisponibilidadesAgenda,
  operacionalRemarcarAgendamento,
} from "@/lib/api/agendamento.functions";

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

type IndisponibilidadeAgenda = {
  id: string;
  tipo: "AGENDAMENTO" | "BLOQUEIO";
  inicio: string | Date;
  fim: string | Date;
  motivo: string | null;
};

const INTERVALO_INICIO_MINUTOS = 10;

const funcionamentoPorDia: Record<
  number,
  {
    abre: string;
    fecha: string;
  }
> = {
  2: {
    abre: "09:30",
    fecha: "19:30",
  },
  3: {
    abre: "09:30",
    fecha: "19:30",
  },
  4: {
    abre: "09:00",
    fecha: "19:30",
  },
  5: {
    abre: "08:00",
    fecha: "21:00",
  },
  6: {
    abre: "08:30",
    fecha: "19:00",
  },
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
    timeZone: "America/Sao_Paulo",
  }).format(data);
}

function formatarDataInput(data: Date): string {
  const ano = data.getFullYear();
  const mes = String(data.getMonth() + 1).padStart(2, "0");
  const dia = String(data.getDate()).padStart(2, "0");

  return `${ano}-${mes}-${dia}`;
}

function formatarDataInputSaoPaulo(valor: string | Date): string {
  const data = new Date(valor);

  const partes = new Intl.DateTimeFormat("pt-BR", {
    timeZone: "America/Sao_Paulo",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(data);

  const mapa = Object.fromEntries(
    partes.map((parte) => [parte.type, parte.value]),
  );

  return `${mapa.year}-${mapa.month}-${mapa.day}`;
}

function criarDataLocal(dataInput: string): Date {
  const [ano, mes, dia] = dataInput.split("-").map(Number);

  return new Date(ano, mes - 1, dia);
}

function obterNomeDia(dataInput: string): string {
  const data = criarDataLocal(dataInput);

  return new Intl.DateTimeFormat("pt-BR", {
    weekday: "short",
    day: "2-digit",
    month: "2-digit",
  }).format(data);
}

function obterProximosDiasFuncionamento(
  quantidadeDias = 30,
): string[] {
  const dias: string[] = [];
  const hoje = new Date();

  hoje.setHours(0, 0, 0, 0);

  for (let indice = 0; indice < quantidadeDias; indice += 1) {
    const data = new Date(hoje);

    data.setDate(hoje.getDate() + indice);

    const diaSemana = data.getDay();

    if (funcionamentoPorDia[diaSemana]) {
      dias.push(formatarDataInput(data));
    }
  }

  return dias;
}

function converterHoraParaMinutos(hora: string): number {
  const [horas, minutos] = hora.split(":").map(Number);

  return horas * 60 + minutos;
}

function formatarMinutosComoHora(totalMinutos: number): string {
  const horas = Math.floor(totalMinutos / 60);
  const minutos = totalMinutos % 60;

  return `${String(horas).padStart(2, "0")}:${String(minutos).padStart(2, "0")}`;
}

function gerarHorariosDisponiveis(
  dataInput: string,
  duracaoMinutos: number,
): string[] {
  const data = criarDataLocal(dataInput);
  const regra = funcionamentoPorDia[data.getDay()];

  if (!regra) {
    return [];
  }

  const abertura = converterHoraParaMinutos(regra.abre);
  const fechamento = converterHoraParaMinutos(regra.fecha);
  const horarios: string[] = [];

  for (
    let horario = abertura;
    horario + duracaoMinutos <= fechamento;
    horario += INTERVALO_INICIO_MINUTOS
  ) {
    horarios.push(formatarMinutosComoHora(horario));
  }

  return horarios;
}

function criarInicioIsoLocal(
  dataInput: string,
  horario: string,
): string {
  return `${dataInput}T${horario}`;
}

function horarioJaPassou(dataInput: string, horario: string): boolean {
  const inicio = new Date(criarInicioIsoLocal(dataInput, horario));

  return inicio.getTime() <= new Date().getTime();
}

function existeConflitoComIndisponibilidade({
  inicioHorario,
  fimHorario,
  indisponibilidades,
  ignorarAgendamentoId,
}: {
  inicioHorario: Date;
  fimHorario: Date;
  indisponibilidades: IndisponibilidadeAgenda[];
  ignorarAgendamentoId?: string;
}): boolean {
  return indisponibilidades.some((indisponibilidade) => {
    if (
      ignorarAgendamentoId &&
      indisponibilidade.tipo === "AGENDAMENTO" &&
      indisponibilidade.id === ignorarAgendamentoId
    ) {
      return false;
    }

    const inicioIndisponivel = new Date(indisponibilidade.inicio);
    const fimIndisponivel = new Date(indisponibilidade.fim);

    return (
      inicioIndisponivel < fimHorario &&
      fimIndisponivel > inicioHorario
    );
  });
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

function podeRemarcarAgendamento(agendamento: AgendamentoAdmin): boolean {
  return ["SOLICITADO", "CONFIRMADO"].includes(agendamento.status);
}

function AdminAgendaPage() {
  const carregarAgenda = useServerFn(adminListarAgenda);
  const buscarIndisponibilidades = useServerFn(
    listarIndisponibilidadesAgenda,
  );
  const remarcarAgendamento = useServerFn(
    operacionalRemarcarAgendamento,
  );

  const [agendamentos, setAgendamentos] = useState<AgendamentoAdmin[]>(
    [],
  );
  const [carregando, setCarregando] = useState(true);
  const [processandoRemarcacao, setProcessandoRemarcacao] =
    useState(false);
  const [erro, setErro] = useState("");
  const [mensagem, setMensagem] = useState("");

  const [agendamentoParaRemarcar, setAgendamentoParaRemarcar] =
    useState<AgendamentoAdmin | null>(null);
  const [dataRemarcacao, setDataRemarcacao] = useState("");
  const [horarioRemarcacao, setHorarioRemarcacao] = useState("");
  const [indisponibilidadesRemarcacao, setIndisponibilidadesRemarcacao] =
    useState<IndisponibilidadeAgenda[]>([]);

  const proximosDiasRemarcacao = useMemo(
    () => obterProximosDiasFuncionamento(),
    [],
  );

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

  const horariosDisponiveisRemarcacao = useMemo(() => {
    if (!agendamentoParaRemarcar || !dataRemarcacao) {
      return [];
    }

    return gerarHorariosDisponiveis(
      dataRemarcacao,
      agendamentoParaRemarcar.servico.duracaoMinutos,
    );
  }, [agendamentoParaRemarcar, dataRemarcacao]);

  const horariosFiltradosRemarcacao = useMemo(() => {
    if (!agendamentoParaRemarcar || !dataRemarcacao) {
      return [];
    }

    return horariosDisponiveisRemarcacao.filter((horario) => {
      if (horarioJaPassou(dataRemarcacao, horario)) {
        return false;
      }

      const inicioHorario = new Date(
        criarInicioIsoLocal(dataRemarcacao, horario),
      );

      const fimHorario = new Date(
        inicioHorario.getTime() +
          agendamentoParaRemarcar.servico.duracaoMinutos * 60 * 1000,
      );

      return !existeConflitoComIndisponibilidade({
        inicioHorario,
        fimHorario,
        indisponibilidades: indisponibilidadesRemarcacao,
        ignorarAgendamentoId: agendamentoParaRemarcar.id,
      });
    });
  }, [
    agendamentoParaRemarcar,
    dataRemarcacao,
    horariosDisponiveisRemarcacao,
    indisponibilidadesRemarcacao,
  ]);

  async function carregarIndisponibilidadesRemarcacao(
    agendamento: AgendamentoAdmin,
    dataSelecionada: string,
  ) {
    if (!dataSelecionada) {
      setIndisponibilidadesRemarcacao([]);
      return;
    }

    try {
      const resultado = await buscarIndisponibilidades({
        data: {
          profissionalId: agendamento.profissional.id,
          data: dataSelecionada,
        },
      });

      if (!resultado.sucesso) {
        setIndisponibilidadesRemarcacao([]);
        return;
      }

      setIndisponibilidadesRemarcacao(resultado.intervalos);
    } catch (error) {
      console.error(error);
      setIndisponibilidadesRemarcacao([]);
    }
  }

  function abrirModalRemarcacao(agendamento: AgendamentoAdmin) {
    const dataAtualAgendamento = formatarDataInputSaoPaulo(
      agendamento.inicio,
    );

    const dataInicial = proximosDiasRemarcacao.includes(
      dataAtualAgendamento,
    )
      ? dataAtualAgendamento
      : proximosDiasRemarcacao[0] ?? "";

    setMensagem("");
    setErro("");
    setAgendamentoParaRemarcar(agendamento);
    setDataRemarcacao(dataInicial);
    setHorarioRemarcacao("");
    setIndisponibilidadesRemarcacao([]);
  }

  function fecharModalRemarcacao() {
    setAgendamentoParaRemarcar(null);
    setDataRemarcacao("");
    setHorarioRemarcacao("");
    setIndisponibilidadesRemarcacao([]);
    setProcessandoRemarcacao(false);
  }

  useEffect(() => {
    if (!agendamentoParaRemarcar || !dataRemarcacao) {
      setIndisponibilidadesRemarcacao([]);
      return;
    }

    void carregarIndisponibilidadesRemarcacao(
      agendamentoParaRemarcar,
      dataRemarcacao,
    );
  }, [agendamentoParaRemarcar, dataRemarcacao]);

  useEffect(() => {
    if (
      horariosFiltradosRemarcacao.length > 0 &&
      !horariosFiltradosRemarcacao.includes(horarioRemarcacao)
    ) {
      setHorarioRemarcacao(horariosFiltradosRemarcacao[0]);
      return;
    }

    if (horariosFiltradosRemarcacao.length === 0) {
      setHorarioRemarcacao("");
    }
  }, [horariosFiltradosRemarcacao, horarioRemarcacao]);

  async function handleRemarcar(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!agendamentoParaRemarcar) {
      return;
    }

    setMensagem("");
    setErro("");

    if (!dataRemarcacao || !horarioRemarcacao) {
      setErro("Escolha um novo dia e horário para remarcar.");
      return;
    }

    setProcessandoRemarcacao(true);

    try {
      const resultado = await remarcarAgendamento({
        data: {
          agendamentoId: agendamentoParaRemarcar.id,
          inicio: criarInicioIsoLocal(dataRemarcacao, horarioRemarcacao),
        },
      });

      if (!resultado.sucesso) {
        setErro(resultado.mensagem);
        return;
      }

      setMensagem(resultado.mensagem);
      fecharModalRemarcacao();

      await carregarDados();
    } catch (error) {
      console.error(error);
      setErro("Não foi possível remarcar o agendamento.");
    } finally {
      setProcessandoRemarcacao(false);
    }
  }

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

      {mensagem && (
        <div className="mb-6 rounded-xl border border-gold/30 bg-gold-soft px-4 py-3 text-sm text-gold">
          {mensagem}
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
              Esta tela também permite que o administrador remarque horários
              sem digitar horário livre manualmente.
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

                  {podeRemarcarAgendamento(agendamento) && (
                    <button
                      type="button"
                      onClick={() => abrirModalRemarcacao(agendamento)}
                      className="inline-flex h-10 shrink-0 items-center justify-center rounded-full border border-gold/40 px-5 text-sm text-gold transition hover:bg-gold-soft"
                    >
                      <Edit3 className="mr-2 h-4 w-4" />
                      Remarcar
                    </button>
                  )}
                </div>
              </article>
            ))}
          </div>
        </section>
      )}

      {agendamentoParaRemarcar && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-background/80 p-4 backdrop-blur-sm sm:items-center">
          <div className="max-h-[90vh] w-full max-w-3xl overflow-y-auto rounded-3xl border border-border bg-surface p-5 shadow-xl sm:p-6">
            <div className="flex flex-col gap-4 border-b border-border pb-5 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <p className="text-xs uppercase tracking-widest text-muted-foreground">
                  Remarcar agendamento
                </p>

                <h2 className="mt-2 text-2xl font-display">
                  {agendamentoParaRemarcar.cliente.nome}
                </h2>

                <p className="mt-2 text-sm leading-6 text-muted-foreground">
                  Horário atual:{" "}
                  {formatarDataHora(agendamentoParaRemarcar.inicio)}
                </p>
              </div>

              <button
                type="button"
                onClick={fecharModalRemarcacao}
                disabled={processandoRemarcacao}
                className="inline-flex h-10 items-center justify-center rounded-full border border-border px-5 text-sm transition hover:bg-surface-elevated disabled:cursor-not-allowed disabled:opacity-60"
              >
                Fechar
              </button>
            </div>

            <form
              className="mt-5 space-y-6"
              onSubmit={(event) => void handleRemarcar(event)}
            >
              <div className="grid gap-3 rounded-2xl border border-border bg-background/40 p-4 text-sm text-muted-foreground md:grid-cols-3">
                <p>
                  <span className="block text-xs uppercase tracking-widest">
                    Serviço
                  </span>
                  <strong className="mt-1 block text-foreground">
                    {agendamentoParaRemarcar.servico.nome}
                  </strong>
                </p>

                <p>
                  <span className="block text-xs uppercase tracking-widest">
                    Duração
                  </span>
                  <strong className="mt-1 block text-foreground">
                    {agendamentoParaRemarcar.servico.duracaoMinutos} min
                  </strong>
                </p>

                <p>
                  <span className="block text-xs uppercase tracking-widest">
                    Profissional
                  </span>
                  <strong className="mt-1 block text-foreground">
                    {agendamentoParaRemarcar.profissional.nome}
                  </strong>
                </p>
              </div>

              <div>
                <label className="text-xs uppercase tracking-widest text-muted-foreground">
                  Novo dia
                </label>

                <div className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                  {proximosDiasRemarcacao.map((dia) => {
                    const ativo = dia === dataRemarcacao;
                    const regra =
                      funcionamentoPorDia[criarDataLocal(dia).getDay()];

                    return (
                      <button
                        key={dia}
                        type="button"
                        onClick={() => {
                          setDataRemarcacao(dia);
                          setHorarioRemarcacao("");
                        }}
                        className={`rounded-xl border px-4 py-3 text-left text-sm transition ${
                          ativo
                            ? "border-gold bg-gold-soft text-gold"
                            : "border-border bg-background/40 hover:bg-surface-elevated"
                        }`}
                      >
                        <span className="block font-medium capitalize">
                          {obterNomeDia(dia)}
                        </span>

                        <span className="mt-1 block text-xs text-muted-foreground">
                          {regra.abre} às {regra.fecha}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div>
                <label className="text-xs uppercase tracking-widest text-muted-foreground">
                  Novo horário
                </label>

                {horariosFiltradosRemarcacao.length === 0 ? (
                  <div className="mt-3 rounded-xl border border-border bg-background/40 p-4 text-sm text-muted-foreground">
                    Nenhum horário disponível para este dia, serviço e
                    profissional.
                  </div>
                ) : (
                  <div className="mt-3 grid grid-cols-3 gap-3 sm:grid-cols-4 lg:grid-cols-6">
                    {horariosFiltradosRemarcacao.map((horario) => {
                      const ativo = horario === horarioRemarcacao;

                      return (
                        <button
                          key={horario}
                          type="button"
                          onClick={() => setHorarioRemarcacao(horario)}
                          className={`rounded-xl border px-3 py-2 text-sm transition ${
                            ativo
                              ? "border-gold bg-gold-soft text-gold"
                              : "border-border bg-background/40 hover:bg-surface-elevated"
                          }`}
                        >
                          {horario}
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>

              <div className="flex flex-col-reverse gap-3 border-t border-border pt-5 sm:flex-row sm:justify-end">
                <button
                  type="button"
                  onClick={fecharModalRemarcacao}
                  disabled={processandoRemarcacao}
                  className="inline-flex h-11 items-center justify-center rounded-full border border-border px-5 text-sm transition hover:bg-surface-elevated disabled:cursor-not-allowed disabled:opacity-60"
                >
                  Cancelar
                </button>

                <button
                  type="submit"
                  disabled={
                    processandoRemarcacao ||
                    !dataRemarcacao ||
                    !horarioRemarcacao
                  }
                  className="inline-flex h-11 items-center justify-center rounded-full bg-gold px-5 text-sm font-medium text-gold-foreground transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {processandoRemarcacao ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Remarcando...
                    </>
                  ) : (
                    <>
                      <CheckCircle2 className="mr-2 h-4 w-4" />
                      Confirmar remarcação
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
