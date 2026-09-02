import {
  type FormEvent,
  useEffect,
  useMemo,
  useState,
} from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import {
  CalendarCheck,
  CalendarClock,
  CalendarPlus,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Clock,
  Loader2,
  Mail,
  Phone,
  RefreshCw,
  Scissors,
  UserRound,
  XCircle,
  type LucideIcon,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer";
import { useIsMobile } from "@/hooks/use-mobile";
import {
  funcionarioCancelarAgendamento,
  funcionarioConfirmarAgendamento,
  funcionarioConcluirAgendamento,
  funcionarioListarSolicitacoes,
  funcionarioRecusarAgendamento,
  listarIndisponibilidadesAgenda,
  operacionalRemarcarAgendamento,
} from "@/lib/api/agendamento.functions";

export const Route = createFileRoute("/funcionario/solicitacoes")({
  component: SolicitacoesPage,

  head: () => ({
    meta: [
      {
        title: "Agenda · Funcionário · Studio RD",
      },
    ],
  }),
});

type Solicitacao = {
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

type IndisponibilidadeAgenda = {
  id: string;
  tipo: "AGENDAMENTO" | "BLOQUEIO";
  inicio: string | Date;
  fim: string | Date;
  motivo: string | null;
};

const formasPagamento = [
  {
    value: "PIX",
    label: "Pix",
  },
  {
    value: "DINHEIRO",
    label: "Dinheiro",
  },
  {
    value: "CARTAO_DEBITO",
    label: "Cartão de débito",
  },
  {
    value: "CARTAO_CREDITO",
    label: "Cartão de crédito",
  },
  {
    value: "ASSINATURA",
    label: "Assinatura RD Black",
  },
  {
    value: "CORTESIA",
    label: "Cortesia",
  },
  {
    value: "OUTRO",
    label: "Outro",
  },
] as const;

type FormaPagamentoValor =
  (typeof formasPagamento)[number]["value"];

const TIMEZONE_PADRAO = "America/Sao_Paulo";
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

function SolicitacoesPage() {
  const carregarSolicitacoes = useServerFn(
    funcionarioListarSolicitacoes,
  );
  const confirmarAgendamento = useServerFn(
    funcionarioConfirmarAgendamento,
  );
  const recusarAgendamento = useServerFn(
    funcionarioRecusarAgendamento,
  );
  const concluirAgendamento = useServerFn(
    funcionarioConcluirAgendamento,
  );
  
  const cancelarAgendamento = useServerFn(
    funcionarioCancelarAgendamento,
  );
  const remarcarAgendamento = useServerFn(
    operacionalRemarcarAgendamento,
  );
  const buscarIndisponibilidades = useServerFn(
    listarIndisponibilidadesAgenda,
  );

  const isMobile = useIsMobile();

  const [solicitacoes, setSolicitacoes] = useState<Solicitacao[]>(
    [],
  );
  const [carregando, setCarregando] = useState(true);
  const [processandoId, setProcessandoId] = useState("");
  const [mensagem, setMensagem] = useState("");
  const [erro, setErro] = useState("");

  const [dataSelecionada, setDataSelecionada] = useState<Date>(
    () => obterInicioDoDia(new Date()),
  );

  const [agendamentoAbertoId, setAgendamentoAbertoId] = useState<
    string | null
  >(null);

  const [modalAcao, setModalAcao] = useState<{
    tipo: "RECUSAR" | "CANCELAR_EQUIPE";
    agendamentoId: string;
    titulo: string;
    descricao: string;
  } | null>(null);

  const [motivoModal, setMotivoModal] = useState("");

  const [agendamentoRemarcacao, setAgendamentoRemarcacao] =
    useState<Solicitacao | null>(null);
  const [dataRemarcacao, setDataRemarcacao] = useState("");
  const [horarioRemarcacao, setHorarioRemarcacao] = useState("");
  const [indisponibilidadesRemarcacao, setIndisponibilidadesRemarcacao] =
    useState<IndisponibilidadeAgenda[]>([]);

  const [
    formasPagamentoPorAgendamento,
    setFormasPagamentoPorAgendamento,
  ] = useState<Record<string, FormaPagamentoValor>>({});

  const [
    valoresPagosPorAgendamento,
    setValoresPagosPorAgendamento,
  ] = useState<Record<string, string>>({});

  async function carregarDados() {
    setCarregando(true);
    setErro("");

    try {
      const resposta = await carregarSolicitacoes();

      setSolicitacoes(resposta);
    } catch (error) {
      console.error(error);

      setErro("Não foi possível carregar a agenda.");
    } finally {
      setCarregando(false);
    }
  }

  useEffect(() => {
    void carregarDados();
  }, []);

  const inicioSemana = useMemo(
    () => obterInicioDaSemana(dataSelecionada),
    [dataSelecionada],
  );

  const diasDaSemana = useMemo(
    () =>
      Array.from({ length: 7 }, (_, indice) =>
        adicionarDias(inicioSemana, indice),
      ),
    [inicioSemana],
  );

  const diasComAgendamento = useMemo(() => {
    const conjunto = new Set<string>();

    solicitacoes.forEach((solicitacao) => {
      conjunto.add(chaveDia(new Date(solicitacao.inicio)));
    });

    return conjunto;
  }, [solicitacoes]);

  const agendamentosDoDia = useMemo(
    () =>
      solicitacoes
        .filter((solicitacao) =>
          mesmoDia(new Date(solicitacao.inicio), dataSelecionada),
        )
        .sort(
          (a, b) =>
            new Date(a.inicio).getTime() -
            new Date(b.inicio).getTime(),
        ),
    [solicitacoes, dataSelecionada],
  );

  const resumoDia = useMemo(() => {
    const solicitados = agendamentosDoDia.filter(
      (item) => item.status === "SOLICITADO",
    ).length;

    const confirmados = agendamentosDoDia.filter(
      (item) => item.status === "CONFIRMADO",
    ).length;

    return {
      total: agendamentosDoDia.length,
      solicitados,
      confirmados,
    };
  }, [agendamentosDoDia]);

  const agendamentoSelecionado = useMemo(
    () =>
      solicitacoes.find(
        (solicitacao) => solicitacao.id === agendamentoAbertoId,
      ) ?? null,
    [solicitacoes, agendamentoAbertoId],
  );

  const proximosDiasFuncionamento = useMemo(
    () => obterProximosDiasFuncionamento(),
    [],
  );

  const horariosRemarcacaoDisponiveis = useMemo(() => {
    if (!agendamentoRemarcacao || !dataRemarcacao) {
      return [];
    }

    return gerarHorariosDisponiveis(
      dataRemarcacao,
      agendamentoRemarcacao.servico.duracaoMinutos,
    );
  }, [agendamentoRemarcacao, dataRemarcacao]);

  const horariosRemarcacaoFiltrados = useMemo(() => {
    if (!agendamentoRemarcacao || !dataRemarcacao) {
      return [];
    }

    return horariosRemarcacaoDisponiveis.filter((horario) => {
      const inicioHorario = criarDataHoraLocal(
        dataRemarcacao,
        horario,
      );

      const fimHorario = new Date(
        inicioHorario.getTime() +
          agendamentoRemarcacao.servico.duracaoMinutos * 60 * 1000,
      );

      return !existeConflitoComIndisponibilidade({
        inicioHorario,
        fimHorario,
        indisponibilidades: indisponibilidadesRemarcacao,
        ignorarAgendamentoId: agendamentoRemarcacao.id,
      });
    });
  }, [
    agendamentoRemarcacao,
    dataRemarcacao,
    horariosRemarcacaoDisponiveis,
    indisponibilidadesRemarcacao,
  ]);

  const formaPagamentoSelecionada: FormaPagamentoValor =
    agendamentoSelecionado
      ? formasPagamentoPorAgendamento[agendamentoSelecionado.id] ??
        "PIX"
      : "PIX";

  const valorSelecionado = agendamentoSelecionado
    ? formaPagamentoSelecionada === "ASSINATURA"
      ? "0,00"
      : valoresPagosPorAgendamento[agendamentoSelecionado.id] ??
        String(
          agendamentoSelecionado.servico.precoCentavos / 100,
        ).replace(".", ",")
    : "";

  function selecionarDia(dia: Date) {
    setDataSelecionada(obterInicioDoDia(dia));
  }

  function irParaSemanaAnterior() {
    setDataSelecionada((atual) => adicionarDias(atual, -7));
  }

  function irParaProximaSemana() {
    setDataSelecionada((atual) => adicionarDias(atual, 7));
  }

  function irParaHoje() {
    setDataSelecionada(obterInicioDoDia(new Date()));
  }

  function abrirDetalhes(agendamentoId: string) {
    setAgendamentoAbertoId(agendamentoId);
  }

  function fecharDetalhes() {
    setAgendamentoAbertoId(null);
  }

  function abrirModalRecusa(agendamentoId: string) {
  limparFocoEFecharDetalhes();

  window.setTimeout(() => {
    setMotivoModal("");
    setModalAcao({
      tipo: "RECUSAR",
      agendamentoId,
      titulo: "Recusar solicitação",
      descricao:
        "Informe o motivo da recusa. O cliente verá essa informação no histórico do agendamento.",
    });
  }, 50);
}

  function abrirModalCancelamentoEquipe(agendamentoId: string) {
  limparFocoEFecharDetalhes();

  window.setTimeout(() => {
    setMotivoModal("");
    setModalAcao({
      tipo: "CANCELAR_EQUIPE",
      agendamentoId,
      titulo: "Cancelar pela equipe",
      descricao:
        "Informe o motivo do cancelamento. O cliente verá que o horário foi cancelado pela equipe.",
    });
  }, 50);
}

  function limparFocoEFecharDetalhes() {
  const elementoAtivo = document.activeElement;

  if (elementoAtivo instanceof HTMLElement) {
    elementoAtivo.blur();
  }

  setAgendamentoAbertoId(null);
}

  function fecharModalAcao() {
    setModalAcao(null);
    setMotivoModal("");
  }

  function abrirModalRemarcacao(agendamento: Solicitacao) {
    limparFocoEFecharDetalhes();
    setMensagem("");
    setErro("");
    setAgendamentoAbertoId(null);
    setAgendamentoRemarcacao(agendamento);
    setDataRemarcacao(formatarDataInputSaoPaulo(agendamento.inicio));
    setHorarioRemarcacao("");
    setIndisponibilidadesRemarcacao([]);
  }

  function fecharModalRemarcacao() {
    setAgendamentoRemarcacao(null);
    setDataRemarcacao("");
    setHorarioRemarcacao("");
    setIndisponibilidadesRemarcacao([]);
  }

  async function carregarIndisponibilidadesRemarcacao(
    profissionalId: string,
    data: string,
  ) {
    if (!profissionalId || !data) {
      setIndisponibilidadesRemarcacao([]);
      return;
    }

    try {
      const resultado = await buscarIndisponibilidades({
        data: {
          profissionalId,
          data,
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

  useEffect(() => {
    if (!agendamentoRemarcacao || !dataRemarcacao) {
      return;
    }

    void carregarIndisponibilidadesRemarcacao(
      agendamentoRemarcacao.profissional.id,
      dataRemarcacao,
    );
  }, [agendamentoRemarcacao, dataRemarcacao]);

  useEffect(() => {
    if (!agendamentoRemarcacao) {
      return;
    }

    if (
      horariosRemarcacaoFiltrados.length > 0 &&
      !horariosRemarcacaoFiltrados.includes(horarioRemarcacao)
    ) {
      setHorarioRemarcacao(horariosRemarcacaoFiltrados[0]);
    }

    if (horariosRemarcacaoFiltrados.length === 0) {
      setHorarioRemarcacao("");
    }
  }, [
    agendamentoRemarcacao,
    horariosRemarcacaoFiltrados,
    horarioRemarcacao,
  ]);

  async function handleConfirmar(agendamentoId: string) {
    setMensagem("");
    setErro("");
    setProcessandoId(agendamentoId);

    try {
      const resultado = await confirmarAgendamento({
        data: {
          agendamentoId,
        },
      });

      if (!resultado.sucesso) {
        setErro(resultado.mensagem);
        return;
      }

      setMensagem(resultado.mensagem);

      await carregarDados();
    } catch (error) {
      console.error(error);

      setErro("Não foi possível confirmar o agendamento.");
    } finally {
      setProcessandoId("");
    }
  }

  async function handleConfirmarModalAcao() {
    if (!modalAcao) {
      return;
    }

    if (modalAcao.tipo === "RECUSAR") {
      await handleRecusar(
        modalAcao.agendamentoId,
        motivoModal,
      );

      return;
    }

    if (modalAcao.tipo === "CANCELAR_EQUIPE") {
      await handleCancelarAgendamento(
        modalAcao.agendamentoId,
        motivoModal,
      );
    }
  }

  async function handleRecusar(
    agendamentoId: string,
    motivoRecusa: string,
  ) {
    setMensagem("");
    setErro("");
    setProcessandoId(agendamentoId);

    try {
      const resultado = await recusarAgendamento({
        data: {
          agendamentoId,
          motivoRecusa,
        },
      });

      if (!resultado.sucesso) {
        setErro(resultado.mensagem);
        return;
      }

      setMensagem(resultado.mensagem);
      fecharModalAcao();

      await carregarDados();
    } catch (error) {
      console.error(error);

      setErro("Não foi possível recusar a solicitação.");
    } finally {
      setProcessandoId("");
    }
  }

  async function handleSalvarRemarcacao() {
    if (
      !agendamentoRemarcacao ||
      !dataRemarcacao ||
      !horarioRemarcacao
    ) {
      setErro("Escolha o novo dia e horário para remarcar.");
      return;
    }

    setMensagem("");
    setErro("");
    setProcessandoId(agendamentoRemarcacao.id);

    try {
      const resultado = await remarcarAgendamento({
        data: {
          agendamentoId: agendamentoRemarcacao.id,
          inicio: criarInicioIsoLocal(
            dataRemarcacao,
            horarioRemarcacao,
          ),
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
      setProcessandoId("");
    }
  }

  async function handleConcluir(solicitacao: Solicitacao) {
    setMensagem("");
    setErro("");
    setProcessandoId(solicitacao.id);

    const formaPagamento =
      formasPagamentoPorAgendamento[solicitacao.id] ?? "PIX";

    const valorDigitado =
      valoresPagosPorAgendamento[solicitacao.id] ??
      String(solicitacao.servico.precoCentavos / 100).replace(
        ".",
        ",",
      );

    try {
      const resultado = await concluirAgendamento({
        data: {
          agendamentoId: solicitacao.id,
          formaPagamento,
          valorPagoCentavos:
            formaPagamento === "ASSINATURA"
              ? undefined
              : converterPrecoParaCentavos(valorDigitado),
          observacaoPagamento:
            formaPagamento === "ASSINATURA"
              ? "Pagamento realizado com saldo de assinatura RD Black."
              : "",
        },
      });

      if (!resultado.sucesso) {
        setErro(resultado.mensagem);
        return;
      }

      setMensagem(resultado.mensagem);

      await carregarDados();
    } catch (error) {
      console.error(error);

      setErro("Não foi possível concluir o atendimento.");
    } finally {
      setProcessandoId("");
    }
  }

  async function handleCancelarAgendamento(
    agendamentoId: string,
    motivoCancelamento: string,
  ) {
    setMensagem("");
    setErro("");
    setProcessandoId(agendamentoId);

    try {
      const resultado = await cancelarAgendamento({
        data: {
          agendamentoId,
          motivoCancelamento,
        },
      });

      if (!resultado.sucesso) {
        setErro(resultado.mensagem);
        return;
      }

      setMensagem(resultado.mensagem);
      fecharModalAcao();

      await carregarDados();
    } catch (error) {
      console.error(error);

      setErro("Não foi possível cancelar o agendamento.");
    } finally {
      setProcessandoId("");
    }
  }

  return (
    <div className="min-h-screen bg-background px-4 py-4 sm:px-6 lg:px-8 lg:py-8">
      <div className="mx-auto flex max-w-5xl flex-col gap-5 pb-24 lg:pb-8">
        <header className="space-y-4">
          <Badge className="border-gold/40 bg-gold-soft text-gold">
            Área operacional
          </Badge>

          <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">
                Agenda
              </h1>

              <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">
                Navegue pelos dias, confirme pedidos e conclua
                atendimentos direto pelo celular.
              </p>
            </div>

            <div className="flex flex-col gap-2 sm:flex-row">
              <Button
                type="button"
                variant="outline"
                onClick={() => void carregarDados()}
                disabled={carregando}
                className="h-11 w-full rounded-xl sm:w-auto"
              >
                {carregando ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <RefreshCw className="mr-2 h-4 w-4" />
                )}
                Atualizar
              </Button>

              <Button
                type="button"
                asChild
                className="h-11 w-full rounded-xl sm:w-auto"
              >
                <Link to="/funcionario/agendar-cliente">
                  <CalendarPlus className="mr-2 h-4 w-4" />
                  Novo agendamento
                </Link>
              </Button>
            </div>
          </div>
        </header>

        {erro && (
          <div
            role="alert"
            className="rounded-2xl border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive"
          >
            {erro}
          </div>
        )}

        {mensagem && (
          <div className="rounded-2xl border border-gold/30 bg-gold-soft px-4 py-3 text-sm text-gold">
            {mensagem}
          </div>
        )}

        <SeletorDeDias
          dias={diasDaSemana}
          dataSelecionada={dataSelecionada}
          diasComAgendamento={diasComAgendamento}
          onSelecionar={selecionarDia}
          onSemanaAnterior={irParaSemanaAnterior}
          onProximaSemana={irParaProximaSemana}
          onHoje={irParaHoje}
        />

        <section className="overflow-hidden rounded-3xl border border-border bg-surface">
          <div className="flex items-center justify-between gap-3 border-b border-border/70 px-4 py-4 sm:px-5">
            <div>
              <h2 className="text-sm font-medium">
                Agenda do dia
              </h2>

              <p className="mt-1 text-xs text-muted-foreground">
                {formatarDataCompleta(dataSelecionada)}
                {!carregando &&
                  ` · ${resumoDia.total} agendamento${
                    resumoDia.total === 1 ? "" : "s"
                  }${
                    resumoDia.solicitados > 0
                      ? ` · ${resumoDia.solicitados} pendente${
                          resumoDia.solicitados === 1 ? "" : "s"
                        }`
                      : ""
                  }`}
              </p>
            </div>

            <Clock className="h-4 w-4 shrink-0 text-gold" />
          </div>

          {carregando ? (
            <div className="flex min-h-56 flex-col items-center justify-center gap-3 px-6 py-10 text-center">
              <Loader2 className="h-8 w-8 animate-spin text-gold" />

              <p className="text-sm text-muted-foreground">
                Carregando agenda...
              </p>
            </div>
          ) : agendamentosDoDia.length === 0 ? (
            <div className="flex min-h-56 flex-col items-center justify-center px-6 py-10 text-center">
              <CalendarCheck className="h-10 w-10 text-muted-foreground" />

              <h3 className="mt-4 text-lg font-display">
                Nenhum agendamento para este dia
              </h3>

              <p className="mt-2 max-w-md text-sm leading-6 text-muted-foreground">
                Selecione outro dia ou crie um novo agendamento
                para este cliente.
              </p>
            </div>
          ) : (
            <div className="space-y-3 p-4 sm:p-5">
              {agendamentosDoDia.map((solicitacao) => (
                <CartaoAgendamento
                  key={solicitacao.id}
                  agendamento={solicitacao}
                  onClick={() => abrirDetalhes(solicitacao.id)}
                />
              ))}
            </div>
          )}
        </section>
      </div>

      <Link
        to="/funcionario/agendar-cliente"
        aria-label="Novo agendamento"
        className="fixed bottom-5 right-5 z-40 grid h-14 w-14 place-items-center rounded-full bg-gold text-gold-foreground shadow-premium transition hover:opacity-90 lg:hidden"
      >
        <CalendarPlus className="h-6 w-6" />
      </Link>

      <PainelDetalhes
        agendamento={agendamentoSelecionado}
        isMobile={isMobile}
        processandoId={processandoId}
        formaPagamentoAtual={formaPagamentoSelecionada}
        valorAtual={valorSelecionado}
        onFechar={fecharDetalhes}
        onFormaPagamentoChange={(valor) => {
          if (!agendamentoSelecionado) {
            return;
          }

          setFormasPagamentoPorAgendamento((estadoAtual) => ({
            ...estadoAtual,
            [agendamentoSelecionado.id]: valor,
          }));
        }}
        onValorChange={(valor) => {
          if (!agendamentoSelecionado) {
            return;
          }

          setValoresPagosPorAgendamento((estadoAtual) => ({
            ...estadoAtual,
            [agendamentoSelecionado.id]: valor,
          }));
        }}
        onConfirmar={() => {
          if (agendamentoSelecionado) {
            void handleConfirmar(agendamentoSelecionado.id);
          }
        }}
        onAbrirRecusa={() => {
          if (agendamentoSelecionado) {
            abrirModalRecusa(agendamentoSelecionado.id);
          }
        }}
        onAbrirRemarcacao={() => {
          if (agendamentoSelecionado) {
            abrirModalRemarcacao(agendamentoSelecionado);
          }
        }}
        onConcluir={() => {
          if (agendamentoSelecionado) {
            void handleConcluir(agendamentoSelecionado);
          }
        }}
        onAbrirCancelamento={() => {
          if (agendamentoSelecionado) {
            abrirModalCancelamentoEquipe(agendamentoSelecionado.id);
          }
        }}
      />

      {modalAcao && (
        <div className="fixed inset-0 z-[999] flex items-end justify-center bg-background/80 p-3 backdrop-blur-sm sm:items-center sm:p-4">
          <div className="w-full max-w-lg rounded-3xl border border-border bg-surface p-5 shadow-xl sm:p-6">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h2 className="text-xl font-display">
                  {modalAcao.titulo}
                </h2>

                <p className="mt-2 text-sm leading-6 text-muted-foreground">
                  {modalAcao.descricao}
                </p>
              </div>

              <button
                type="button"
                onClick={fecharModalAcao}
                className="rounded-full border border-border px-3 py-1 text-sm text-muted-foreground transition hover:bg-surface-elevated"
              >
                Fechar
              </button>
            </div>

            <form
              className="mt-6"
              onSubmit={(event: FormEvent<HTMLFormElement>) => {
                event.preventDefault();
                void handleConfirmarModalAcao();
              }}
            >
              <div className="space-y-2">
                <label className="text-xs uppercase tracking-widest text-muted-foreground">
                  Motivo
                </label>

                <textarea
                  value={motivoModal}
                  onChange={(event) =>
                    setMotivoModal(event.target.value)
                  }
                  placeholder="Ex.: horário indisponível, ajuste interno, conflito de agenda..."
                  className="min-h-32 w-full rounded-xl border border-input bg-background px-3 py-3 text-sm outline-none transition focus:border-gold"
                />
              </div>

              <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
                <Button
                  type="button"
                  variant="outline"
                  onClick={fecharModalAcao}
                  disabled={processandoId === modalAcao.agendamentoId}
                  className="h-11 rounded-xl"
                >
                  Voltar
                </Button>

                <Button
                  type="submit"
                  disabled={processandoId === modalAcao.agendamentoId}
                  className={
                    modalAcao.tipo === "CANCELAR_EQUIPE"
                      ? "h-11 rounded-xl bg-destructive text-destructive-foreground hover:bg-destructive/90"
                      : "h-11 rounded-xl"
                  }
                >
                  {processandoId === modalAcao.agendamentoId ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Processando...
                    </>
                  ) : modalAcao.tipo === "RECUSAR" ? (
                    "Confirmar recusa"
                  ) : (
                    "Confirmar cancelamento"
                  )}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {agendamentoRemarcacao && (
        <div className="fixed inset-0 z-[70] flex items-end justify-center bg-background/80 p-3 backdrop-blur-sm sm:items-center sm:p-4">
          <div className="max-h-[92vh] w-full max-w-3xl overflow-y-auto rounded-3xl border border-border bg-surface p-5 shadow-xl sm:p-6">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h2 className="text-xl font-display">
                  Remarcar horário
                </h2>

                <p className="mt-2 text-sm leading-6 text-muted-foreground">
                  Escolha um novo dia e horário disponível conforme a
                  duração real do serviço.
                </p>
              </div>

              <button
                type="button"
                onClick={fecharModalRemarcacao}
                className="rounded-full border border-border px-3 py-1 text-sm text-muted-foreground transition hover:bg-surface-elevated"
              >
                Fechar
              </button>
            </div>

            <div className="mt-5 grid gap-3 rounded-2xl border border-border bg-background/40 p-4 text-sm sm:grid-cols-2">
              <div>
                <p className="text-xs uppercase tracking-widest text-muted-foreground">
                  Cliente
                </p>
                <p className="mt-1 font-medium">
                  {agendamentoRemarcacao.cliente.nome}
                </p>
              </div>

              <div>
                <p className="text-xs uppercase tracking-widest text-muted-foreground">
                  Serviço
                </p>
                <p className="mt-1 font-medium">
                  {agendamentoRemarcacao.servico.nome} ·{" "}
                  {agendamentoRemarcacao.servico.duracaoMinutos} min
                </p>
              </div>

              <div>
                <p className="text-xs uppercase tracking-widest text-muted-foreground">
                  Profissional
                </p>
                <p className="mt-1 font-medium">
                  {agendamentoRemarcacao.profissional.nome}
                </p>
              </div>

              <div>
                <p className="text-xs uppercase tracking-widest text-muted-foreground">
                  Horário atual
                </p>
                <p className="mt-1 font-medium">
                  {formatarDataCompleta(agendamentoRemarcacao.inicio)} ·{" "}
                  {formatarHora(agendamentoRemarcacao.inicio)} –{" "}
                  {formatarHora(agendamentoRemarcacao.fim)}
                </p>
              </div>
            </div>

            <div className="mt-6 space-y-5">
              <div>
                <label className="text-xs uppercase tracking-widest text-muted-foreground">
                  Novo dia
                </label>

                <div className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                  {proximosDiasFuncionamento.map((dia) => {
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

                {horariosRemarcacaoFiltrados.length === 0 ? (
                  <div className="mt-3 rounded-xl border border-border bg-background/40 p-4 text-sm text-muted-foreground">
                    Nenhum horário disponível para este dia e
                    profissional.
                  </div>
                ) : (
                  <div className="mt-3 grid grid-cols-3 gap-3 sm:grid-cols-4 lg:grid-cols-5">
                    {horariosRemarcacaoFiltrados.map((horario) => {
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
            </div>

            <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
              <Button
                type="button"
                variant="outline"
                onClick={fecharModalRemarcacao}
                disabled={processandoId === agendamentoRemarcacao.id}
                className="h-11 rounded-xl"
              >
                Voltar
              </Button>

              <Button
                type="button"
                onClick={() => void handleSalvarRemarcacao()}
                disabled={
                  processandoId === agendamentoRemarcacao.id ||
                  !dataRemarcacao ||
                  !horarioRemarcacao
                }
                className="h-11 rounded-xl"
              >
                {processandoId === agendamentoRemarcacao.id ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Salvando...
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="mr-2 h-4 w-4" />
                    Salvar novo horário
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function SeletorDeDias({
  dias,
  dataSelecionada,
  diasComAgendamento,
  onSelecionar,
  onSemanaAnterior,
  onProximaSemana,
  onHoje,
}: {
  dias: Date[];
  dataSelecionada: Date;
  diasComAgendamento: Set<string>;
  onSelecionar: (dia: Date) => void;
  onSemanaAnterior: () => void;
  onProximaSemana: () => void;
  onHoje: () => void;
}) {
  return (
    <section className="rounded-3xl border border-border bg-surface p-3 sm:p-4">
      <div className="mb-3 flex items-center justify-between gap-2 px-1">
        <p className="truncate text-sm font-medium capitalize">
          {formatarMesAno(dataSelecionada)}
        </p>

        <div className="flex shrink-0 items-center gap-1.5">
          <button
            type="button"
            onClick={onHoje}
            className="rounded-full border border-border px-3 py-1.5 text-xs text-muted-foreground transition hover:bg-surface-elevated"
          >
            Hoje
          </button>

          <button
            type="button"
            onClick={onSemanaAnterior}
            aria-label="Semana anterior"
            className="grid h-8 w-8 place-items-center rounded-full border border-border transition hover:bg-surface-elevated"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>

          <button
            type="button"
            onClick={onProximaSemana}
            aria-label="Próxima semana"
            className="grid h-8 w-8 place-items-center rounded-full border border-border transition hover:bg-surface-elevated"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-7 gap-1.5 sm:gap-2">
        {dias.map((dia) => {
          const selecionado = mesmoDia(dia, dataSelecionada);
          const temAgendamento = diasComAgendamento.has(
            chaveDia(dia),
          );

          return (
            <button
              key={dia.toISOString()}
              type="button"
              onClick={() => onSelecionar(dia)}
              aria-pressed={selecionado}
              aria-label={formatarDataCompleta(dia)}
              className={`flex min-h-16 flex-col items-center justify-center gap-1 rounded-xl border px-1 py-2 text-center transition ${
                selecionado
                  ? "border-gold bg-gold text-gold-foreground"
                  : "border-border bg-background/40 text-foreground hover:bg-surface-elevated"
              }`}
            >
              <span
                className={`text-[10px] uppercase tracking-wide ${
                  selecionado
                    ? "text-gold-foreground/80"
                    : "text-muted-foreground"
                }`}
              >
                {formatarDiaSemanaCurto(dia)}
              </span>

              <span className="text-base font-semibold">
                {dia.getDate()}
              </span>

              <span
                className={`h-1.5 w-1.5 rounded-full ${
                  temAgendamento
                    ? selecionado
                      ? "bg-gold-foreground"
                      : "bg-gold"
                    : "bg-transparent"
                }`}
              />
            </button>
          );
        })}
      </div>
    </section>
  );
}

function CartaoAgendamento({
  agendamento,
  onClick,
}: {
  agendamento: Solicitacao;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex w-full items-center gap-4 rounded-2xl border border-border bg-background/40 p-4 text-left transition hover:border-gold/40 hover:bg-surface-elevated"
    >
      <div className="flex w-14 shrink-0 flex-col items-center">
        <span className="text-sm font-semibold text-gold">
          {formatarHora(agendamento.inicio)}
        </span>
        <span className="text-[10px] text-muted-foreground">
          {formatarHora(agendamento.fim)}
        </span>
      </div>

      <div className="h-10 w-px shrink-0 bg-border" />

      <div className="min-w-0 flex-1">
        <p className="truncate font-medium">
          {agendamento.cliente.nome}
        </p>
        <p className="truncate text-sm text-muted-foreground">
          {agendamento.servico.nome}
        </p>
      </div>

      <StatusBadge status={agendamento.status} />
    </button>
  );
}

function PainelDetalhes({
  agendamento,
  isMobile,
  processandoId,
  formaPagamentoAtual,
  valorAtual,
  onFechar,
  onFormaPagamentoChange,
  onValorChange,
  onConfirmar,
  onAbrirRecusa,
  onAbrirRemarcacao,
  onConcluir,
  onAbrirCancelamento,
}: {
  agendamento: Solicitacao | null;
  isMobile: boolean;
  processandoId: string;
  formaPagamentoAtual: FormaPagamentoValor;
  valorAtual: string;
  onFechar: () => void;
  onFormaPagamentoChange: (valor: FormaPagamentoValor) => void;
  onValorChange: (valor: string) => void;
  onConfirmar: () => void;
  onAbrirRecusa: () => void;
  onAbrirRemarcacao: () => void;
  onConcluir: () => void;
  onAbrirCancelamento: () => void;
}) {
  const aberto = agendamento !== null;

  if (isMobile) {
    return (
      <Drawer
        open={aberto}
        onOpenChange={(proximoEstado) => {
          if (!proximoEstado) {
            onFechar();
          }
        }}
      >
        <DrawerContent className="border-border bg-surface">
          {agendamento && (
            <>
              <DrawerHeader className="text-left">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <DrawerTitle className="truncate font-display text-xl">
                      {agendamento.cliente.nome}
                    </DrawerTitle>
                    <DrawerDescription>
                      {formatarDataCompleta(agendamento.inicio)} ·{" "}
                      {formatarHora(agendamento.inicio)} –{" "}
                      {formatarHora(agendamento.fim)}
                    </DrawerDescription>
                  </div>

                  <DrawerClose asChild>
                    <button
                      type="button"
                      aria-label="Fechar"
                      className="grid h-9 w-9 shrink-0 place-items-center rounded-full border border-border text-muted-foreground transition hover:bg-surface-elevated"
                    >
                      <XCircle className="h-4 w-4" />
                    </button>
                  </DrawerClose>
                </div>
              </DrawerHeader>

              <div className="max-h-[70vh] overflow-y-auto px-4 pb-6">
                <ConteudoDetalhes
                  agendamento={agendamento}
                  processandoId={processandoId}
                  formaPagamentoAtual={formaPagamentoAtual}
                  valorAtual={valorAtual}
                  onFormaPagamentoChange={onFormaPagamentoChange}
                  onValorChange={onValorChange}
                  onConfirmar={onConfirmar}
                  onAbrirRecusa={onAbrirRecusa}
                  onAbrirRemarcacao={onAbrirRemarcacao}
                  onConcluir={onConcluir}
                  onAbrirCancelamento={onAbrirCancelamento}
                />
              </div>
            </>
          )}
        </DrawerContent>
      </Drawer>
    );
  }

  return (
    <Dialog
      open={aberto}
      onOpenChange={(proximoEstado) => {
        if (!proximoEstado) {
          onFechar();
        }
      }}
    >
      <DialogContent className="max-h-[85vh] max-w-lg overflow-y-auto border-border bg-surface">
        {agendamento && (
          <>
            <DialogHeader>
              <DialogTitle className="font-display text-xl">
                {agendamento.cliente.nome}
              </DialogTitle>
              <DialogDescription>
                {formatarDataCompleta(agendamento.inicio)} ·{" "}
                {formatarHora(agendamento.inicio)} –{" "}
                {formatarHora(agendamento.fim)}
              </DialogDescription>
            </DialogHeader>

            <ConteudoDetalhes
              agendamento={agendamento}
              processandoId={processandoId}
              formaPagamentoAtual={formaPagamentoAtual}
              valorAtual={valorAtual}
              onFormaPagamentoChange={onFormaPagamentoChange}
              onValorChange={onValorChange}
              onConfirmar={onConfirmar}
              onAbrirRecusa={onAbrirRecusa}
              onAbrirRemarcacao={onAbrirRemarcacao}
              onConcluir={onConcluir}
              onAbrirCancelamento={onAbrirCancelamento}
            />
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}

function ConteudoDetalhes({
  agendamento,
  processandoId,
  formaPagamentoAtual,
  valorAtual,
  onFormaPagamentoChange,
  onValorChange,
  onConfirmar,
  onAbrirRecusa,
  onAbrirRemarcacao,
  onConcluir,
  onAbrirCancelamento,
}: {
  agendamento: Solicitacao;
  processandoId: string;
  formaPagamentoAtual: FormaPagamentoValor;
  valorAtual: string;
  onFormaPagamentoChange: (valor: FormaPagamentoValor) => void;
  onValorChange: (valor: string) => void;
  onConfirmar: () => void;
  onAbrirRecusa: () => void;
  onAbrirRemarcacao: () => void;
  onConcluir: () => void;
  onAbrirCancelamento: () => void;
}) {
  const processando = processandoId === agendamento.id;
  const podeRemarcar =
    agendamento.status === "SOLICITADO" ||
    agendamento.status === "CONFIRMADO";

  return (
    <div className="space-y-4 pt-2">
      <div className="flex flex-wrap items-center gap-2">
        <StatusBadge status={agendamento.status} />
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        <InfoBox
          icon={Scissors}
          title="Serviço"
          lines={[
            agendamento.servico.nome,
            `${agendamento.servico.duracaoMinutos} min`,
            formatarMoeda(agendamento.servico.precoCentavos),
          ]}
        />

        <InfoBox
          icon={UserRound}
          title="Profissional"
          lines={[
            agendamento.profissional.nome,
            `Status: ${traduzirStatus(agendamento.status)}`,
          ]}
        />
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        <ContatoLinha
          icon={Mail}
          label="E-mail"
          value={agendamento.cliente.email}
        />

        <ContatoLinha
          icon={Phone}
          label="Telefone"
          value={formatarTelefone(agendamento.cliente.telefone)}
        />
      </div>

      {agendamento.observacaoCliente && (
        <div className="rounded-2xl border border-border bg-background/40 p-4">
          <h3 className="text-sm font-medium">
            Observação do cliente
          </h3>

          <p className="mt-2 text-sm leading-6 text-muted-foreground">
            {agendamento.observacaoCliente}
          </p>
        </div>
      )}

      {podeRemarcar && (
        <div className="rounded-2xl border border-border bg-background/40 p-3">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="flex items-center gap-2 text-sm font-medium">
                <CalendarClock className="h-4 w-4 text-gold" />
                Editar horário
              </p>

              <p className="mt-1 text-xs leading-5 text-muted-foreground">
                Remarque este atendimento usando os horários
                disponíveis conforme a duração do serviço.
              </p>
            </div>

            <Button
              type="button"
              variant="outline"
              disabled={processando}
              onClick={onAbrirRemarcacao}
              className="h-11 w-full rounded-xl sm:w-auto"
            >
              <CalendarClock className="mr-2 h-4 w-4" />
              Remarcar horário
            </Button>
          </div>
        </div>
      )}

      {agendamento.status === "SOLICITADO" && (
        <div className="rounded-2xl border border-border bg-background/40 p-3">
          <p className="mb-3 text-sm font-medium">
            Decisão da equipe
          </p>

          <div className="grid gap-2">
            <Button
              type="button"
              disabled={processando}
              onClick={onConfirmar}
              className="h-11 w-full rounded-xl"
            >
              {processando ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <CheckCircle2 className="mr-2 h-4 w-4" />
              )}
              {processando ? "Processando..." : "Confirmar"}
            </Button>

            <Button
              type="button"
              variant="outline"
              disabled={processando}
              onClick={onAbrirRecusa}
              className="h-11 w-full rounded-xl"
            >
              <XCircle className="mr-2 h-4 w-4" />
              Recusar
            </Button>
          </div>
        </div>
      )}

      {agendamento.status === "CONFIRMADO" && (
        <div className="rounded-2xl border border-border bg-background/40 p-3">
          <p className="mb-3 text-sm font-medium">
            Concluir atendimento
          </p>

          <div className="space-y-3">
            <div className="space-y-2">
              <label className="text-xs uppercase tracking-widest text-muted-foreground">
                Forma de pagamento
              </label>

              <select
                value={formaPagamentoAtual}
                onChange={(event) =>
                  onFormaPagamentoChange(
                    event.target.value as FormaPagamentoValor,
                  )
                }
                className="h-11 w-full rounded-xl border border-input bg-background px-3 text-sm outline-none transition focus:border-gold"
              >
                {formasPagamento.map((forma) => (
                  <option key={forma.value} value={forma.value}>
                    {forma.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-xs uppercase tracking-widest text-muted-foreground">
                Valor recebido
              </label>

              <input
                value={valorAtual}
                onChange={(event) =>
                  onValorChange(event.target.value)
                }
                disabled={formaPagamentoAtual === "ASSINATURA"}
                inputMode="decimal"
                className="h-11 w-full rounded-xl border border-input bg-background px-3 text-sm outline-none transition focus:border-gold disabled:cursor-not-allowed disabled:opacity-60"
              />

              {formaPagamentoAtual === "ASSINATURA" && (
                <p className="text-xs leading-5 text-muted-foreground">
                  O valor fica zerado e o sistema tenta descontar 1
                  corte da assinatura ativa do cliente.
                </p>
              )}
            </div>

            <Button
              type="button"
              disabled={processando}
              onClick={onConcluir}
              className="h-11 w-full rounded-xl"
            >
              {processando ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <CheckCircle2 className="mr-2 h-4 w-4" />
              )}
              {processando ? "Processando..." : "Marcar concluído"}
            </Button>

            <Button
              type="button"
              variant="outline"
              disabled={processando}
              onClick={onAbrirCancelamento}
              className="h-11 w-full rounded-xl border-destructive/40 text-destructive hover:bg-destructive/10"
            >
              <XCircle className="mr-2 h-4 w-4" />
              Cancelar pela equipe
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const estilos: Record<string, string> = {
    SOLICITADO: "border-amber-500/40 bg-amber-500/10 text-amber-600",
    CONFIRMADO: "border-emerald-500/40 bg-emerald-500/10 text-emerald-600",
    CONCLUIDO: "border-gold/40 bg-gold-soft text-gold",
    RECUSADO: "border-destructive/40 bg-destructive/10 text-destructive",
  };

  return (
    <span
      className={`inline-flex shrink-0 rounded-full border px-3 py-1 text-xs font-medium ${
        estilos[status] ??
        "border-border bg-background text-muted-foreground"
      }`}
    >
      {traduzirStatus(status)}
    </span>
  );
}

function InfoBox({
  icon: Icon,
  title,
  lines,
}: {
  icon: LucideIcon;
  title: string;
  lines: string[];
}) {
  return (
    <div className="rounded-2xl border border-border bg-background/40 p-4">
      <div className="flex items-center gap-2 text-sm font-medium">
        <Icon className="h-4 w-4 text-gold" />
        {title}
      </div>

      <div className="mt-3 space-y-1">
        {lines.map((line, index) => (
          <p
            key={`${title}-${line}-${index}`}
            className={
              index === 0
                ? "break-words text-sm"
                : "break-words text-xs text-muted-foreground"
            }
          >
            {line}
          </p>
        ))}
      </div>
    </div>
  );
}

function ContatoLinha({
  icon: Icon,
  label,
  value,
}: {
  icon: LucideIcon;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-center gap-3 rounded-2xl border border-border bg-background/40 p-3">
      <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-gold-soft text-gold">
        <Icon className="h-4 w-4" />
      </span>

      <div className="min-w-0">
        <p className="text-xs text-muted-foreground">{label}</p>
        <p className="break-words text-sm">{value}</p>
      </div>
    </div>
  );
}

function formatarMoeda(precoCentavos: number): string {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(precoCentavos / 100);
}

function formatarHora(valor: string | Date): string {
  return new Intl.DateTimeFormat("pt-BR", {
    hour: "2-digit",
    minute: "2-digit",
    timeZone: TIMEZONE_PADRAO,
  }).format(new Date(valor));
}

function formatarDataCompleta(valor: string | Date): string {
  return new Intl.DateTimeFormat("pt-BR", {
    weekday: "short",
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    timeZone: TIMEZONE_PADRAO,
  }).format(new Date(valor));
}

function formatarDiaSemanaCurto(data: Date): string {
  const texto = new Intl.DateTimeFormat("pt-BR", {
    weekday: "short",
  })
    .format(data)
    .replace(".", "");

  return texto.charAt(0).toUpperCase() + texto.slice(1);
}

function formatarMesAno(data: Date): string {
  const texto = new Intl.DateTimeFormat("pt-BR", {
    month: "long",
    year: "numeric",
  }).format(data);

  return texto.charAt(0).toUpperCase() + texto.slice(1);
}

function obterInicioDoDia(data: Date): Date {
  return new Date(
    data.getFullYear(),
    data.getMonth(),
    data.getDate(),
  );
}

function adicionarDias(data: Date, dias: number): Date {
  const resultado = obterInicioDoDia(data);
  resultado.setDate(resultado.getDate() + dias);
  return resultado;
}

function obterInicioDaSemana(data: Date): Date {
  const diaSemana = (data.getDay() + 6) % 7;
  return adicionarDias(data, -diaSemana);
}

function mesmoDia(a: Date, b: Date): boolean {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

function chaveDia(data: Date): string {
  return `${data.getFullYear()}-${data.getMonth()}-${data.getDate()}`;
}

function formatarTelefone(telefone: string | null): string {
  if (!telefone) {
    return "Não informado";
  }

  const numeros = telefone.replace(/\D/g, "");

  if (numeros.length === 11) {
    return numeros.replace(
      /(\d{2})(\d{5})(\d{4})/,
      "($1) $2-$3",
    );
  }

  if (numeros.length === 10) {
    return numeros.replace(
      /(\d{2})(\d{4})(\d{4})/,
      "($1) $2-$3",
    );
  }

  return telefone;
}

function converterPrecoParaCentavos(valor: string): number {
  const limpo = valor
    .trim()
    .replace(/\./g, "")
    .replace(",", ".");

  const numero = Number(limpo);

  if (!Number.isFinite(numero)) {
    return 0;
  }

  return Math.round(numero * 100);
}

function traduzirStatus(status: string): string {
  const mapa: Record<string, string> = {
    SOLICITADO: "aguardando decisão",
    CONFIRMADO: "confirmado",
    CONCLUIDO: "concluído",
    RECUSADO: "recusado",
    CANCELADO_CLIENTE: "cancelado pelo cliente",
    CANCELADO_FUNCIONARIO: "cancelado pela equipe",
    FALTOU: "não compareceu",
  };

  return mapa[status] ?? status;
}

function formatarDataInput(data: Date): string {
  const ano = data.getFullYear();
  const mes = String(data.getMonth() + 1).padStart(2, "0");
  const dia = String(data.getDate()).padStart(2, "0");

  return `${ano}-${mes}-${dia}`;
}

function formatarDataInputSaoPaulo(valor: string | Date): string {
  const partes = new Intl.DateTimeFormat("pt-BR", {
    timeZone: TIMEZONE_PADRAO,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(new Date(valor));

  const mapa = Object.fromEntries(
    partes.map((parte) => [parte.type, parte.value]),
  );

  return `${mapa.year}-${mapa.month}-${mapa.day}`;
}

function criarDataLocal(dataInput: string): Date {
  const [ano, mes, dia] = dataInput.split("-").map(Number);

  return new Date(ano, mes - 1, dia);
}

function criarDataHoraLocal(
  dataInput: string,
  horario: string,
): Date {
  const [ano, mes, dia] = dataInput.split("-").map(Number);
  const [hora, minuto] = horario.split(":").map(Number);

  return new Date(ano, mes - 1, dia, hora, minuto, 0, 0);
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
  quantidadeDias = 21,
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
    const horarioFormatado = formatarMinutosComoHora(horario);
    const inicioHorario = criarDataHoraLocal(
      dataInput,
      horarioFormatado,
    );

    if (inicioHorario.getTime() <= new Date().getTime()) {
      continue;
    }

    horarios.push(horarioFormatado);
  }

  return horarios;
}

function criarInicioIsoLocal(
  dataInput: string,
  horario: string,
): string {
  return `${dataInput}T${horario}`;
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
