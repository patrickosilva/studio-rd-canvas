import { useEffect, useMemo, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import {
  AlertTriangle,
  CalendarDays,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Clock3,
  History,
  Loader2,
  Pencil,
  Plus,
  RefreshCw,
  Scissors,
  Search,
  UserRound,
  WalletCards,
} from "lucide-react";

import { PageHeader } from "@/components/dashboard/Sidebar";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  funcionarioListarDadosParaAgendarCliente,
  operacionalAtualizarAtendimentoConcluido,
  operacionalCriarAtendimentoRetroativo,
  operacionalListarAtendimentosCorrigiveis,
} from "@/lib/api/agendamento.functions";

type AtendimentoAjustavel = {
  id: string;
  inicio: string | Date;
  fim: string | Date;
  status: string;
  formaPagamento: FormaPagamento | null;
  valorPagoCentavos: number | null;
  pagoEm: string | Date | null;
  observacaoInterna: string | null;
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

type Cliente = {
  id: string;
  nome: string;
  email: string;
  telefone: string | null;
};

type Profissional = {
  id: string;
  nome: string;
};

type Servico = {
  id: string;
  nome: string;
  duracaoMinutos: number;
  precoCentavos: number;
};

type DadosFormulario = {
  clientes: Cliente[];
  profissionais: Profissional[];
  servicos: Servico[];
};

type FormaPagamento =
  | "PIX"
  | "DINHEIRO"
  | "CARTAO_DEBITO"
  | "CARTAO_CREDITO"
  | "ASSINATURA"
  | "CORTESIA"
  | "OUTRO";

type ModoFormulario = "criar" | "editar";
type EtapaFormulario = 1 | 2 | 3 | 4;

const formasPagamento: Array<{
  value: FormaPagamento;
  label: string;
}> = [
  { value: "PIX", label: "PIX" },
  { value: "DINHEIRO", label: "Dinheiro" },
  { value: "CARTAO_DEBITO", label: "Cartão de débito" },
  { value: "CARTAO_CREDITO", label: "Cartão de crédito" },
  { value: "ASSINATURA", label: "Assinatura RD Black" },
  { value: "CORTESIA", label: "Cortesia" },
  { value: "OUTRO", label: "Outro" },
];

const TIMEZONE = "America/Sao_Paulo";

function normalizarBusca(valor: string): string {
  return valor
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLocaleLowerCase("pt-BR")
    .trim();
}
function formatarMoeda(valorCentavos: number | null): string {
  if (valorCentavos === null) {
    return "Não informado";
  }

  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(valorCentavos / 100);
}

function formatarData(valor: string | Date): string {
  return new Intl.DateTimeFormat("pt-BR", {
    weekday: "short",
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    timeZone: TIMEZONE,
  }).format(new Date(valor));
}

function formatarHora(valor: string | Date): string {
  return new Intl.DateTimeFormat("pt-BR", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
    timeZone: TIMEZONE,
  }).format(new Date(valor));
}

function formatarDataInput(valor: string | Date): string {
  const partes = new Intl.DateTimeFormat("pt-BR", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    timeZone: TIMEZONE,
  }).formatToParts(new Date(valor));

  const mapa = Object.fromEntries(
    partes.map((parte) => [parte.type, parte.value]),
  );

  return `${mapa.year}-${mapa.month}-${mapa.day}`;
}

function formatarHoraInput(valor: string | Date): string {
  const partes = new Intl.DateTimeFormat("pt-BR", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
    timeZone: TIMEZONE,
  }).formatToParts(new Date(valor));

  const mapa = Object.fromEntries(
    partes.map((parte) => [parte.type, parte.value]),
  );

  return `${mapa.hour}:${mapa.minute}`;
}

function formatarDataHojeInput(): string {
  const agora = new Date();

  return formatarDataInput(agora);
}

function formatarDataMinimaInput(): string {
  const limite = new Date();

  limite.setDate(limite.getDate() - 7);

  return formatarDataInput(limite);
}

function converterReaisParaCentavos(valor: string): number | null {
  const limpo = valor
    .trim()
    .replace(/\s/g, "")
    .replace(/\./g, "")
    .replace(",", ".");

  if (!limpo) {
    return null;
  }

  const numero = Number(limpo);

  if (!Number.isFinite(numero) || numero < 0) {
    return null;
  }

  return Math.round(numero * 100);
}

function formatarValorInput(valorCentavos: number | null): string {
  if (valorCentavos === null) {
    return "";
  }

  return (valorCentavos / 100).toFixed(2).replace(".", ",");
}

function traduzirFormaPagamento(valor: FormaPagamento | null): string {
  return (
    formasPagamento.find((forma) => forma.value === valor)?.label ??
    "Não informado"
  );
}

function minutosDaHora(hora: string): number | null {
  const [horas, minutos] = hora.split(":").map(Number);

  if (
    !Number.isInteger(horas) ||
    !Number.isInteger(minutos) ||
    horas < 0 ||
    horas > 23 ||
    minutos < 0 ||
    minutos > 59
  ) {
    return null;
  }

  return horas * 60 + minutos;
}

function horaDeMinutos(total: number): string {
  const normalizado = Math.max(0, Math.min(total, 23 * 60 + 59));
  const horas = Math.floor(normalizado / 60);
  const minutos = normalizado % 60;

  return `${String(horas).padStart(2, "0")}:${String(minutos).padStart(2, "0")}`;
}

function IndicadorEtapa({
  numero,
  atual,
  titulo,
}: {
  numero: EtapaFormulario;
  atual: EtapaFormulario;
  titulo: string;
}) {
  const ativa = numero === atual;
  const concluida = numero < atual;

  return (
    <div className="flex min-w-0 items-center gap-2">
      <div
        className={`grid h-7 w-7 shrink-0 place-items-center rounded-full border text-xs font-medium ${
          ativa || concluida
            ? "border-gold bg-gold-soft text-gold"
            : "border-border text-muted-foreground"
        }`}
      >
        {concluida ? <CheckCircle2 className="h-4 w-4" /> : numero}
      </div>
      <span
        className={`truncate text-xs ${
          ativa ? "font-medium text-foreground" : "text-muted-foreground"
        }`}
      >
        {titulo}
      </span>
    </div>
  );
}

export function CorrecoesServicoPage() {
  const listarAtendimentos = useServerFn(
    operacionalListarAtendimentosCorrigiveis,
  );
  const carregarDadosFormulario = useServerFn(
    funcionarioListarDadosParaAgendarCliente,
  );
  const criarRetroativo = useServerFn(
    operacionalCriarAtendimentoRetroativo,
  );
  const atualizarAtendimento = useServerFn(
    operacionalAtualizarAtendimentoConcluido,
  );

  const [atendimentos, setAtendimentos] = useState<
    AtendimentoAjustavel[]
  >([]);
  const [dados, setDados] = useState<DadosFormulario>({
    clientes: [],
    profissionais: [],
    servicos: [],
  });

  const [busca, setBusca] = useState("");
  const [carregando, setCarregando] = useState(true);
  const [salvando, setSalvando] = useState(false);
  const [erro, setErro] = useState("");
  const [mensagem, setMensagem] = useState("");

  const [dialogAberto, setDialogAberto] = useState(false);
  const [modo, setModo] = useState<ModoFormulario>("criar");
  const [etapa, setEtapa] = useState<EtapaFormulario>(1);
  const [atendimentoEditado, setAtendimentoEditado] =
    useState<AtendimentoAjustavel | null>(null);

  const [clienteId, setClienteId] = useState("");
  const [clienteBusca, setClienteBusca] = useState("");
  const [clienteBuscaAberta, setClienteBuscaAberta] =
    useState(false);
  const [profissionalId, setProfissionalId] = useState("");
  const [servicoId, setServicoId] = useState("");
  const [data, setData] = useState(formatarDataHojeInput());
  const [horaInicio, setHoraInicio] = useState("");
  const [horaFim, setHoraFim] = useState("");
  const [formaPagamento, setFormaPagamento] =
    useState<FormaPagamento>("PIX");
  const [valor, setValor] = useState("");
  const [motivo, setMotivo] = useState("");

  async function carregarTudo() {
    setCarregando(true);
    setErro("");

    try {
      const [lista, dadosResposta] = await Promise.all([
        listarAtendimentos(),
        carregarDadosFormulario(),
      ]);

      setAtendimentos(lista as AtendimentoAjustavel[]);
      setDados(dadosResposta as DadosFormulario);
    } catch (error) {
      console.error(error);
      setErro("Não foi possível carregar a área de ajustes.");
    } finally {
      setCarregando(false);
    }
  }

  useEffect(() => {
    void carregarTudo();
  }, []);

  const servicoSelecionado = useMemo(
    () => dados.servicos.find((item) => item.id === servicoId) ?? null,
    [dados.servicos, servicoId],
  );

  const clienteSelecionado = useMemo(
    () => dados.clientes.find((item) => item.id === clienteId) ?? null,
    [dados.clientes, clienteId],
  );

  const profissionalSelecionado = useMemo(
    () =>
      dados.profissionais.find((item) => item.id === profissionalId) ??
      null,
    [dados.profissionais, profissionalId],
  );
  const clientesFiltrados = useMemo(() => {
    const termo = normalizarBusca(clienteBusca);

    if (termo.length < 2) {
      return [];
    }

    return dados.clientes
      .filter((cliente) => {
        const nome = normalizarBusca(cliente.nome);
        const telefone = normalizarBusca(cliente.telefone ?? "");
        const email = normalizarBusca(cliente.email);

        return (
          nome.includes(termo) ||
          telefone.includes(termo) ||
          email.includes(termo)
        );
      })
      .slice(0, 8);
  }, [clienteBusca, dados.clientes]);

  const atendimentosFiltrados = useMemo(() => {
    const termo = busca.trim().toLocaleLowerCase("pt-BR");

    if (!termo) {
      return atendimentos;
    }

    return atendimentos.filter((atendimento) => {
      const texto = [
        atendimento.cliente.nome,
        atendimento.profissional.nome,
        atendimento.servico.nome,
        traduzirFormaPagamento(atendimento.formaPagamento),
        formatarData(atendimento.inicio),
      ]
        .join(" ")
        .toLocaleLowerCase("pt-BR");

      return texto.includes(termo);
    });
  }, [atendimentos, busca]);

  function limparFormulario() {
    setEtapa(1);
    setAtendimentoEditado(null);
    setClienteId("");
    setClienteBusca("");
    setClienteBuscaAberta(false);
    setProfissionalId("");
    setServicoId("");
    setData(formatarDataHojeInput());
    setHoraInicio("");
    setHoraFim("");
    setFormaPagamento("PIX");
    setValor("");
    setMotivo("");
  }

  function abrirNovo() {
    limparFormulario();
    setModo("criar");
    setErro("");
    setMensagem("");
    setDialogAberto(true);
  }

  function abrirEdicao(atendimento: AtendimentoAjustavel) {
    setModo("editar");
    setEtapa(1);
    setAtendimentoEditado(atendimento);
    setClienteId(atendimento.cliente.id);
    setClienteBusca(
      `${atendimento.cliente.nome} · ${
        atendimento.cliente.telefone || atendimento.cliente.email
      }`,
    );
    setClienteBuscaAberta(false);
    setProfissionalId(atendimento.profissional.id);
    setServicoId(atendimento.servico.id);
    setData(formatarDataInput(atendimento.inicio));
    setHoraInicio(formatarHoraInput(atendimento.inicio));
    setHoraFim(formatarHoraInput(atendimento.fim));
    setFormaPagamento(atendimento.formaPagamento ?? "PIX");
    setValor(
      atendimento.formaPagamento === "ASSINATURA"
        ? "0,00"
        : formatarValorInput(atendimento.valorPagoCentavos),
    );
    setMotivo("");
    setErro("");
    setMensagem("");
    setDialogAberto(true);
  }

  function fecharDialog() {
    if (salvando) {
      return;
    }

    setDialogAberto(false);
    limparFormulario();
    setErro("");
  }

  function selecionarServico(novoServicoId: string) {
    setServicoId(novoServicoId);
    setErro("");

    const novoServico =
      dados.servicos.find((item) => item.id === novoServicoId) ?? null;

    if (modo === "criar" && novoServico && formaPagamento !== "ASSINATURA") {
      setValor(formatarValorInput(novoServico.precoCentavos));
    }
  }

  function usarDuracaoPadrao() {
    if (!servicoSelecionado || !horaInicio) {
      return;
    }

    const inicioMinutos = minutosDaHora(horaInicio);

    if (inicioMinutos === null) {
      return;
    }

    setHoraFim(
      horaDeMinutos(inicioMinutos + servicoSelecionado.duracaoMinutos),
    );
  }

  function usarPrecoServico() {
    if (!servicoSelecionado || formaPagamento === "ASSINATURA") {
      return;
    }

    setValor(formatarValorInput(servicoSelecionado.precoCentavos));
  }

  function mudarFormaPagamento(novaForma: FormaPagamento) {
    setFormaPagamento(novaForma);
    setErro("");

    if (novaForma === "ASSINATURA") {
      setValor("0,00");
      return;
    }

    if (formaPagamento === "ASSINATURA" && servicoSelecionado) {
      setValor(formatarValorInput(servicoSelecionado.precoCentavos));
    }
  }

  function validarEtapaAtual(): boolean {
    setErro("");

    if (etapa === 1) {
      if (!clienteId || !profissionalId || !servicoId) {
        setErro("Escolha cliente, profissional e serviço.");
        return false;
      }
    }

    if (etapa === 2) {
      if (!data || !horaInicio || !horaFim) {
        setErro("Informe data, horário de início e horário de término.");
        return false;
      }

      const inicioMinutos = minutosDaHora(horaInicio);
      const fimMinutos = minutosDaHora(horaFim);

      if (
        inicioMinutos === null ||
        fimMinutos === null ||
        fimMinutos <= inicioMinutos
      ) {
        setErro("O horário de término precisa ser depois do início.");
        return false;
      }
    }

    if (etapa === 3) {
      const valorCentavos =
        formaPagamento === "ASSINATURA"
          ? 0
          : converterReaisParaCentavos(valor);

      if (valorCentavos === null) {
        setErro("Informe um valor recebido válido.");
        return false;
      }
    }

    if (etapa === 4 && motivo.trim().length < 3) {
      setErro("Informe o motivo do lançamento ou ajuste.");
      return false;
    }

    return true;
  }

  function avancar() {
    if (!validarEtapaAtual()) {
      return;
    }

    setEtapa((atual) => Math.min(4, atual + 1) as EtapaFormulario);
  }

  function voltar() {
    setErro("");
    setEtapa((atual) => Math.max(1, atual - 1) as EtapaFormulario);
  }

  async function salvar() {
    if (etapa !== 4 || !validarEtapaAtual()) {
      return;
    }

    const valorPagoCentavos =
      formaPagamento === "ASSINATURA"
        ? 0
        : converterReaisParaCentavos(valor);

    if (valorPagoCentavos === null) {
      setErro("Informe um valor recebido válido.");
      return;
    }

    setSalvando(true);
    setErro("");
    setMensagem("");

    const payloadBase = {
      clienteId,
      profissionalId,
      servicoId,
      inicio: `${data}T${horaInicio}:00`,
      fim: `${data}T${horaFim}:00`,
      formaPagamento,
      valorPagoCentavos,
      motivo: motivo.trim(),
    };

    try {
      const resultado =
        modo === "criar"
          ? await criarRetroativo({
              data: payloadBase,
            })
          : await atualizarAtendimento({
              data: {
                ...payloadBase,
                agendamentoId: atendimentoEditado?.id ?? "",
              },
            });

      if (!resultado.sucesso) {
        setErro(resultado.mensagem);
        return;
      }

      setDialogAberto(false);
      limparFormulario();
      setMensagem(resultado.mensagem);
      await carregarTudo();
    } catch (error) {
      console.error(error);
      setErro(
        modo === "criar"
          ? "Não foi possível registrar o atendimento passado."
          : "Não foi possível atualizar o atendimento.",
      );
    } finally {
      setSalvando(false);
    }
  }

  return (
    <div className="max-w-7xl p-4 sm:p-6 lg:p-12">
      <PageHeader
        title="Ajustes dos últimos 7 dias"
        subtitle="Registre atendimentos que ficaram de fora e corrija atendimentos concluídos recentes sem depender da disponibilidade histórica da agenda."
        actions={
          <div className="flex flex-col gap-2 sm:flex-row">
            <Button
              type="button"
              variant="outline"
              onClick={() => void carregarTudo()}
              disabled={carregando}
              className="rounded-xl"
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
              onClick={abrirNovo}
              className="rounded-xl"
            >
              <Plus className="mr-2 h-4 w-4" />
              Registrar atendimento passado
            </Button>
          </div>
        }
      />

      {erro && !dialogAberto && (
        <div
          role="alert"
          className="mb-5 rounded-2xl border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive"
        >
          {erro}
        </div>
      )}

      {mensagem && (
        <div className="mb-5 flex items-start gap-3 rounded-2xl border border-gold/30 bg-gold-soft px-4 py-3 text-sm text-gold">
          <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0" />
          <span>{mensagem}</span>
        </div>
      )}

      <section className="mb-5 rounded-3xl border border-gold/25 bg-gold-soft/40 p-5">
        <div className="flex items-start gap-3">
          <History className="mt-0.5 h-5 w-5 shrink-0 text-gold" />
          <div>
            <h2 className="font-medium">
              Janela operacional de 7 dias
            </h2>
            <p className="mt-1 max-w-4xl text-sm leading-6 text-muted-foreground">
              Dentro dessa janela a equipe pode registrar o que realmente
              aconteceu e corrigir cliente, profissional, serviço, data,
              horário, pagamento e valor. Conflitos, bloqueios e duração
              padrão do serviço não impedem o acerto histórico.
            </p>
          </div>
        </div>
      </section>

      <section className="overflow-hidden rounded-3xl border border-border bg-surface">
        <div className="border-b border-border/70 p-4 sm:p-5">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="font-medium">
                Atendimentos manipuláveis
              </h2>
              <p className="mt-1 text-sm text-muted-foreground">
                {carregando
                  ? "Carregando..."
                  : `${atendimentosFiltrados.length} atendimento${atendimentosFiltrados.length === 1 ? "" : "s"} concluído${atendimentosFiltrados.length === 1 ? "" : "s"} na janela.`}
              </p>
            </div>

            <div className="relative w-full sm:max-w-sm">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <input
                type="search"
                value={busca}
                onChange={(event) => setBusca(event.target.value)}
                placeholder="Cliente, profissional ou serviço..."
                className="h-11 w-full rounded-xl border border-input bg-background pl-10 pr-3 text-sm outline-none transition focus:border-gold"
              />
            </div>
          </div>
        </div>

        {carregando ? (
          <div className="flex min-h-64 flex-col items-center justify-center gap-3 p-8">
            <Loader2 className="h-8 w-8 animate-spin text-gold" />
            <p className="text-sm text-muted-foreground">
              Carregando atendimentos...
            </p>
          </div>
        ) : atendimentosFiltrados.length === 0 ? (
          <div className="flex min-h-64 flex-col items-center justify-center p-8 text-center">
            <History className="h-10 w-10 text-muted-foreground" />
            <h3 className="mt-4 text-lg font-display">
              Nenhum atendimento concluído na janela
            </h3>
            <p className="mt-2 max-w-md text-sm leading-6 text-muted-foreground">
              Você ainda pode registrar um atendimento passado usando o
              botão acima.
            </p>
          </div>
        ) : (
          <div className="divide-y divide-border">
            {atendimentosFiltrados.map((atendimento) => (
              <article
                key={atendimento.id}
                className="p-4 sm:p-5"
              >
                <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                  <div className="min-w-0 space-y-3">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="rounded-full border border-gold/30 bg-gold-soft px-3 py-1 text-xs font-medium text-gold">
                        Concluído
                      </span>
                      {atendimento.observacaoInterna?.includes(
                        "[LANÇAMENTO RETROATIVO",
                      ) && (
                        <span className="rounded-full border border-border bg-background px-3 py-1 text-xs text-muted-foreground">
                          Lançado retroativamente
                        </span>
                      )}
                    </div>

                    <div>
                      <h3 className="text-base font-medium">
                        {atendimento.cliente.nome}
                      </h3>
                      <p className="mt-1 text-sm text-muted-foreground">
                        {formatarData(atendimento.inicio)} ·{" "}
                        {formatarHora(atendimento.inicio)}–{formatarHora(atendimento.fim)}
                      </p>
                    </div>

                    <div className="grid gap-2 text-sm sm:grid-cols-3">
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <Scissors className="h-4 w-4 shrink-0 text-gold" />
                        <span className="truncate">
                          {atendimento.servico.nome}
                        </span>
                      </div>

                      <div className="flex items-center gap-2 text-muted-foreground">
                        <UserRound className="h-4 w-4 shrink-0 text-gold" />
                        <span className="truncate">
                          {atendimento.profissional.nome}
                        </span>
                      </div>

                      <div className="flex items-center gap-2 text-muted-foreground">
                        <WalletCards className="h-4 w-4 shrink-0 text-gold" />
                        <span>
                          {traduzirFormaPagamento(
                            atendimento.formaPagamento,
                          )}{" "}
                          ·{" "}
                          {formatarMoeda(
                            atendimento.valorPagoCentavos,
                          )}
                        </span>
                      </div>
                    </div>
                  </div>

                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => abrirEdicao(atendimento)}
                    className="h-11 w-full rounded-xl lg:w-auto"
                  >
                    <Pencil className="mr-2 h-4 w-4" />
                    Editar atendimento
                  </Button>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>

      <Dialog
        open={dialogAberto}
        onOpenChange={(aberto) => {
          if (!aberto) {
            fecharDialog();
          }
        }}
      >
        <DialogContent className="max-h-[92vh] overflow-y-auto sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              {modo === "criar"
                ? "Registrar atendimento passado"
                : "Editar atendimento concluído"}
            </DialogTitle>
            <DialogDescription>
              {modo === "criar"
                ? "Preencha o que realmente aconteceu. A agenda histórica não bloqueará o lançamento."
                : "Ajuste o registro dentro da janela de 7 dias. O histórico da alteração será preservado internamente."}
            </DialogDescription>
          </DialogHeader>

          <div className="grid grid-cols-2 gap-3 rounded-2xl border border-border bg-background/40 p-3 sm:grid-cols-4">
            <IndicadorEtapa numero={1} atual={etapa} titulo="Atendimento" />
            <IndicadorEtapa numero={2} atual={etapa} titulo="Quando" />
            <IndicadorEtapa numero={3} atual={etapa} titulo="Pagamento" />
            <IndicadorEtapa numero={4} atual={etapa} titulo="Confirmar" />
          </div>

          {erro && (
            <div
              role="alert"
              className="rounded-2xl border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive"
            >
              {erro}
            </div>
          )}

          {etapa === 1 && (
            <div className="space-y-4">              <div className="space-y-2">
                <label className="text-xs uppercase tracking-widest text-muted-foreground">
                  Cliente
                </label>

                <div className="relative">
                  <Search className="absolute left-3 top-1/2 z-10 h-4 w-4 -translate-y-1/2 text-muted-foreground" />

                  <input
                    type="search"
                    value={clienteBusca}
                    onFocus={() => setClienteBuscaAberta(true)}
                    onChange={(event) => {
                      setClienteBusca(event.target.value);
                      setClienteId("");
                      setClienteBuscaAberta(true);
                      setErro("");
                    }}
                    placeholder="Digite nome, telefone ou e-mail..."
                    autoComplete="off"
                    className="h-11 w-full rounded-xl border border-input bg-background pl-10 pr-3 text-sm outline-none transition focus:border-gold"
                  />

                  {clienteBuscaAberta &&
                    normalizarBusca(clienteBusca).length >= 2 && (
                      <div className="absolute left-0 right-0 top-[calc(100%+8px)] z-[80] max-h-64 overflow-y-auto rounded-2xl border border-border bg-surface p-2 shadow-xl">
                        {clientesFiltrados.length === 0 ? (
                          <div className="px-3 py-4 text-center text-sm text-muted-foreground">
                            Nenhum cliente encontrado.
                          </div>
                        ) : (
                          clientesFiltrados.map((cliente) => (
                            <button
                              key={cliente.id}
                              type="button"
                              onClick={() => {
                                setClienteId(cliente.id);
                                setClienteBusca(
                                  `${cliente.nome} · ${
                                    cliente.telefone || cliente.email
                                  }`,
                                );
                                setClienteBuscaAberta(false);
                                setErro("");
                              }}
                              className="flex w-full items-start justify-between gap-3 rounded-xl px-3 py-3 text-left transition hover:bg-surface-elevated"
                            >
                              <div className="min-w-0">
                                <p className="truncate text-sm font-medium">
                                  {cliente.nome}
                                </p>
                                <p className="mt-1 truncate text-xs text-muted-foreground">
                                  {cliente.telefone || "Sem telefone"}
                                </p>
                              </div>

                              <span className="max-w-[45%] truncate text-xs text-muted-foreground">
                                {cliente.email}
                              </span>
                            </button>
                          ))
                        )}
                      </div>
                    )}
                </div>

                {clienteId && clienteSelecionado && (
                  <div className="flex items-center gap-2 rounded-xl border border-gold/25 bg-gold-soft px-3 py-2 text-xs text-gold">
                    <CheckCircle2 className="h-4 w-4 shrink-0" />
                    <span className="truncate">
                      Selecionado: {clienteSelecionado.nome}
                    </span>
                  </div>
                )}

                {!clienteId &&
                  normalizarBusca(clienteBusca).length < 2 && (
                    <p className="text-xs text-muted-foreground">
                      Digite pelo menos 2 caracteres para pesquisar.
                    </p>
                  )}
              </div>

              <div className="space-y-2">
                <label className="text-xs uppercase tracking-widest text-muted-foreground">
                  Profissional
                </label>
                <select
                  value={profissionalId}
                  onChange={(event) => {
                    setProfissionalId(event.target.value);
                    setErro("");
                  }}
                  className="h-11 w-full rounded-xl border border-input bg-background px-3 text-sm outline-none transition focus:border-gold"
                >
                  <option value="">Escolha o profissional</option>
                  {dados.profissionais.map((profissional) => (
                    <option key={profissional.id} value={profissional.id}>
                      {profissional.nome}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-xs uppercase tracking-widest text-muted-foreground">
                  Serviço
                </label>
                <select
                  value={servicoId}
                  onChange={(event) =>
                    selecionarServico(event.target.value)
                  }
                  className="h-11 w-full rounded-xl border border-input bg-background px-3 text-sm outline-none transition focus:border-gold"
                >
                  <option value="">Escolha o serviço</option>
                  {dados.servicos.map((servico) => (
                    <option key={servico.id} value={servico.id}>
                      {servico.nome} · {servico.duracaoMinutos} min ·{" "}
                      {formatarMoeda(servico.precoCentavos)}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          )}

          {etapa === 2 && (
            <div className="space-y-5">
              <div className="space-y-2">
                <label className="text-xs uppercase tracking-widest text-muted-foreground">
                  Data do atendimento
                </label>
                <input
                  type="date"
                  min={formatarDataMinimaInput()}
                  max={formatarDataHojeInput()}
                  value={data}
                  onChange={(event) => {
                    setData(event.target.value);
                    setErro("");
                  }}
                  className="h-11 w-full rounded-xl border border-input bg-background px-3 text-sm outline-none transition focus:border-gold"
                />
                <p className="text-xs leading-5 text-muted-foreground">
                  O backend valida a janela exata de 7 dias. Não é
                  necessário que a data estivesse livre na agenda.
                </p>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <label className="text-xs uppercase tracking-widest text-muted-foreground">
                    Início real
                  </label>
                  <input
                    type="time"
                    step={300}
                    value={horaInicio}
                    onChange={(event) => {
                      setHoraInicio(event.target.value);
                      setErro("");
                    }}
                    className="h-11 w-full rounded-xl border border-input bg-background px-3 text-sm outline-none transition focus:border-gold"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-xs uppercase tracking-widest text-muted-foreground">
                    Término real
                  </label>
                  <input
                    type="time"
                    step={300}
                    value={horaFim}
                    onChange={(event) => {
                      setHoraFim(event.target.value);
                      setErro("");
                    }}
                    className="h-11 w-full rounded-xl border border-input bg-background px-3 text-sm outline-none transition focus:border-gold"
                  />
                </div>
              </div>

              {servicoSelecionado && (
                <div className="flex flex-col gap-3 rounded-2xl border border-border bg-background/50 p-4 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <p className="text-sm font-medium">
                      Duração cadastrada:{" "}
                      {servicoSelecionado.duracaoMinutos} min
                    </p>
                    <p className="mt-1 text-xs leading-5 text-muted-foreground">
                      É apenas uma referência. O histórico usará o início e
                      término que você informar.
                    </p>
                  </div>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={usarDuracaoPadrao}
                    disabled={!horaInicio}
                    className="rounded-xl"
                  >
                    Usar duração padrão
                  </Button>
                </div>
              )}

              <div className="flex gap-3 rounded-2xl border border-amber-500/25 bg-amber-500/10 p-4">
                <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-amber-600" />
                <p className="text-xs leading-5 text-muted-foreground">
                  Neste fluxo não há checagem de conflito, bloqueio, almoço
                  ou disponibilidade. É um acerto do que já aconteceu.
                </p>
              </div>
            </div>
          )}

          {etapa === 3 && (
            <div className="space-y-5">
              <div className="space-y-2">
                <label className="text-xs uppercase tracking-widest text-muted-foreground">
                  Forma de pagamento
                </label>
                <select
                  value={formaPagamento}
                  onChange={(event) =>
                    mudarFormaPagamento(
                      event.target.value as FormaPagamento,
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
                <div className="flex items-center justify-between gap-3">
                  <label className="text-xs uppercase tracking-widest text-muted-foreground">
                    Valor recebido
                  </label>

                  {servicoSelecionado &&
                    formaPagamento !== "ASSINATURA" && (
                      <button
                        type="button"
                        onClick={usarPrecoServico}
                        className="text-xs font-medium text-gold transition hover:opacity-80"
                      >
                        Usar preço do serviço
                      </button>
                    )}
                </div>

                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">
                    R$
                  </span>
                  <input
                    value={valor}
                    onChange={(event) => {
                      setValor(event.target.value);
                      setErro("");
                    }}
                    disabled={formaPagamento === "ASSINATURA"}
                    inputMode="decimal"
                    placeholder="0,00"
                    className="h-11 w-full rounded-xl border border-input bg-background pl-10 pr-3 text-sm outline-none transition focus:border-gold disabled:cursor-not-allowed disabled:opacity-60"
                  />
                </div>
              </div>

              {formaPagamento === "ASSINATURA" && (
                <div className="rounded-2xl border border-gold/25 bg-gold-soft/40 p-4">
                  <p className="text-sm font-medium text-gold">
                    Uso de assinatura
                  </p>
                  <p className="mt-1 text-xs leading-5 text-muted-foreground">
                    O sistema procurará um ciclo de assinatura do cliente
                    válido na data informada e descontará 1 corte. O valor do
                    atendimento fica em R$ 0,00.
                  </p>
                </div>
              )}
            </div>
          )}

          {etapa === 4 && (
            <div className="space-y-5">
              <div className="grid gap-3 rounded-2xl border border-border bg-background/50 p-4 text-sm sm:grid-cols-2">
                <div>
                  <p className="text-xs uppercase tracking-widest text-muted-foreground">
                    Cliente
                  </p>
                  <p className="mt-1 font-medium">
                    {clienteSelecionado?.nome || "—"}
                  </p>
                </div>
                <div>
                  <p className="text-xs uppercase tracking-widest text-muted-foreground">
                    Profissional
                  </p>
                  <p className="mt-1 font-medium">
                    {profissionalSelecionado?.nome || "—"}
                  </p>
                </div>
                <div>
                  <p className="text-xs uppercase tracking-widest text-muted-foreground">
                    Serviço
                  </p>
                  <p className="mt-1 font-medium">
                    {servicoSelecionado?.nome || "—"}
                  </p>
                </div>
                <div>
                  <p className="text-xs uppercase tracking-widest text-muted-foreground">
                    Quando
                  </p>
                  <p className="mt-1 font-medium">
                    {data} · {horaInicio}–{horaFim}
                  </p>
                </div>
                <div>
                  <p className="text-xs uppercase tracking-widest text-muted-foreground">
                    Pagamento
                  </p>
                  <p className="mt-1 font-medium">
                    {traduzirFormaPagamento(formaPagamento)}
                  </p>
                </div>
                <div>
                  <p className="text-xs uppercase tracking-widest text-muted-foreground">
                    Valor
                  </p>
                  <p className="mt-1 font-medium">
                    {formaPagamento === "ASSINATURA"
                      ? "R$ 0,00"
                      : formatarMoeda(
                          converterReaisParaCentavos(valor),
                        )}
                  </p>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs uppercase tracking-widest text-muted-foreground">
                  Motivo do {modo === "criar" ? "lançamento" : "ajuste"}
                </label>
                <textarea
                  value={motivo}
                  onChange={(event) => {
                    setMotivo(event.target.value);
                    setErro("");
                  }}
                  maxLength={500}
                  rows={3}
                  placeholder={
                    modo === "criar"
                      ? "Ex.: atendimento realizado e não registrado no sistema."
                      : "Ex.: horário e valor lançados incorretamente."
                  }
                  className="w-full resize-none rounded-xl border border-input bg-background px-3 py-3 text-sm outline-none transition focus:border-gold"
                />
                <p className="text-right text-xs text-muted-foreground">
                  {motivo.length}/500
                </p>
              </div>
            </div>
          )}

          <div className="flex flex-col-reverse gap-2 border-t border-border pt-4 sm:flex-row sm:justify-between">
            <Button
              type="button"
              variant="outline"
              onClick={etapa === 1 ? fecharDialog : voltar}
              disabled={salvando}
              className="rounded-xl"
            >
              {etapa > 1 && <ChevronLeft className="mr-2 h-4 w-4" />}
              {etapa === 1 ? "Cancelar" : "Voltar"}
            </Button>

            {etapa < 4 ? (
              <Button
                type="button"
                onClick={avancar}
                disabled={salvando}
                className="rounded-xl"
              >
                Continuar
                <ChevronRight className="ml-2 h-4 w-4" />
              </Button>
            ) : (
              <Button
                type="button"
                onClick={() => void salvar()}
                disabled={salvando || motivo.trim().length < 3}
                className="rounded-xl"
              >
                {salvando ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : modo === "criar" ? (
                  <Plus className="mr-2 h-4 w-4" />
                ) : (
                  <CheckCircle2 className="mr-2 h-4 w-4" />
                )}
                {salvando
                  ? "Salvando..."
                  : modo === "criar"
                    ? "Registrar atendimento"
                    : "Salvar ajustes"}
              </Button>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
