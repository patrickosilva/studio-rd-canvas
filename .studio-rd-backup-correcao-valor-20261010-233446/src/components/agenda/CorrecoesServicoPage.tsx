import { useEffect, useMemo, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import {
  AlertTriangle,
  CheckCircle2,
  Clock3,
  History,
  Loader2,
  RefreshCw,
  Scissors,
  Search,
  UserRound,
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
  operacionalCorrigirServicoConcluido,
  operacionalListarAtendimentosCorrigiveis,
} from "@/lib/api/agendamento.functions";
import { listarServicosAtivos } from "@/lib/api/catalogo.functions";

type AtendimentoCorrigivel = {
  id: string;
  inicio: string | Date;
  fim: string | Date;
  status: string;
  formaPagamento: string | null;
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

type Servico = {
  id: string;
  nome: string;
  descricao: string | null;
  duracaoMinutos: number;
  precoCentavos: number;
  ativo: boolean;
};

const JANELA_CORRECAO_MS = 7 * 24 * 60 * 60 * 1000;

function formatarData(valor: string | Date): string {
  return new Intl.DateTimeFormat("pt-BR", {
    weekday: "short",
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(new Date(valor));
}

function formatarHora(valor: string | Date): string {
  return new Intl.DateTimeFormat("pt-BR", {
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(valor));
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

function traduzirFormaPagamento(valor: string | null): string {
  const mapa: Record<string, string> = {
    PIX: "PIX",
    DINHEIRO: "Dinheiro",
    CARTAO_DEBITO: "Cartão de débito",
    CARTAO_CREDITO: "Cartão de crédito",
    ASSINATURA: "Assinatura",
    CORTESIA: "Cortesia",
    OUTRO: "Outro",
  };

  if (!valor) {
    return "Não informado";
  }

  return mapa[valor] ?? valor;
}

function obterPrazoRestante(inicio: string | Date): string {
  const expiraEm = new Date(inicio).getTime() + JANELA_CORRECAO_MS;
  const restante = expiraEm - Date.now();

  if (restante <= 0) {
    return "Prazo encerrado";
  }

  const horas = Math.ceil(restante / (60 * 60 * 1000));

  if (horas <= 24) {
    return `${horas}h restantes`;
  }

  const dias = Math.ceil(horas / 24);
  return `${dias} dias restantes`;
}

export function CorrecoesServicoPage() {
  const listarAtendimentos = useServerFn(
    operacionalListarAtendimentosCorrigiveis,
  );
  const corrigirServico = useServerFn(
    operacionalCorrigirServicoConcluido,
  );
  const carregarServicos = useServerFn(listarServicosAtivos);

  const [atendimentos, setAtendimentos] = useState<
    AtendimentoCorrigivel[]
  >([]);
  const [servicos, setServicos] = useState<Servico[]>([]);
  const [busca, setBusca] = useState("");
  const [selecionado, setSelecionado] =
    useState<AtendimentoCorrigivel | null>(null);
  const [novoServicoId, setNovoServicoId] = useState("");
  const [motivo, setMotivo] = useState("");
  const [carregando, setCarregando] = useState(true);
  const [salvando, setSalvando] = useState(false);
  const [erro, setErro] = useState("");
  const [mensagem, setMensagem] = useState("");

  async function carregarDados() {
    setCarregando(true);
    setErro("");

    try {
      const [atendimentosResposta, servicosResposta] =
        await Promise.all([
          listarAtendimentos(),
          carregarServicos(),
        ]);

      setAtendimentos(
        atendimentosResposta as AtendimentoCorrigivel[],
      );
      setServicos(servicosResposta as Servico[]);
    } catch (error) {
      console.error(error);
      setErro(
        "Não foi possível carregar os atendimentos disponíveis para correção.",
      );
    } finally {
      setCarregando(false);
    }
  }

  useEffect(() => {
    void carregarDados();
  }, []);

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

  const novoServico = useMemo(
    () =>
      servicos.find((servico) => servico.id === novoServicoId) ??
      null,
    [servicos, novoServicoId],
  );

  function abrirCorrecao(atendimento: AtendimentoCorrigivel) {
    setSelecionado(atendimento);
    setNovoServicoId("");
    setMotivo("");
    setErro("");
    setMensagem("");
  }

  function fecharCorrecao() {
    if (salvando) {
      return;
    }

    setSelecionado(null);
    setNovoServicoId("");
    setMotivo("");
  }

  async function confirmarCorrecao() {
    if (!selecionado) {
      return;
    }

    if (!novoServicoId) {
      setErro("Escolha o serviço correto.");
      return;
    }

    if (novoServicoId === selecionado.servico.id) {
      setErro("Escolha um serviço diferente do atual.");
      return;
    }

    if (motivo.trim().length < 3) {
      setErro("Informe o motivo da correção.");
      return;
    }

    setSalvando(true);
    setErro("");
    setMensagem("");

    try {
      const resultado = await corrigirServico({
        data: {
          agendamentoId: selecionado.id,
          servicoId: novoServicoId,
          motivo: motivo.trim(),
        },
      });

      if (!resultado.sucesso) {
        setErro(resultado.mensagem);
        return;
      }

      setSelecionado(null);
      setNovoServicoId("");
      setMotivo("");
      setMensagem(resultado.mensagem);
      await carregarDados();
    } catch (error) {
      console.error(error);
      setErro("Não foi possível corrigir o serviço.");
    } finally {
      setSalvando(false);
    }
  }

  return (
    <div className="max-w-7xl p-4 sm:p-6 lg:p-12">
      <PageHeader
        title="Correções de atendimento"
        subtitle="Corrija o serviço de atendimentos concluídos nos últimos 7 dias sem alterar o horário nem o pagamento registrado."
        actions={
          <Button
            type="button"
            variant="outline"
            onClick={() => void carregarDados()}
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
        }
      />

      {erro && !selecionado && (
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
              Janela de correção: 7 dias
            </h2>
            <p className="mt-1 max-w-3xl text-sm leading-6 text-muted-foreground">
              A correção troca somente o serviço vinculado ao
              atendimento. Data, horário, valor recebido, forma de
              pagamento e uso de assinatura permanecem exatamente como
              foram registrados na conclusão.
            </p>
          </div>
        </div>
      </section>

      <section className="overflow-hidden rounded-3xl border border-border bg-surface">
        <div className="border-b border-border/70 p-4 sm:p-5">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="font-medium">
                Atendimentos corrigíveis
              </h2>
              <p className="mt-1 text-sm text-muted-foreground">
                {carregando
                  ? "Carregando..."
                  : `${atendimentosFiltrados.length} atendimento${atendimentosFiltrados.length === 1 ? "" : "s"} encontrado${atendimentosFiltrados.length === 1 ? "" : "s"}.`}
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
            <Scissors className="h-10 w-10 text-muted-foreground" />
            <h3 className="mt-4 text-lg font-display">
              Nenhum atendimento disponível
            </h3>
            <p className="mt-2 max-w-md text-sm leading-6 text-muted-foreground">
              Somente atendimentos concluídos dentro da janela de 7 dias
              aparecem nesta área.
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
                      <span className="rounded-full border border-border bg-background px-3 py-1 text-xs text-muted-foreground">
                        {obterPrazoRestante(atendimento.inicio)}
                      </span>
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
                        <Clock3 className="h-4 w-4 shrink-0 text-gold" />
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
                    onClick={() => abrirCorrecao(atendimento)}
                    className="h-11 w-full rounded-xl lg:w-auto"
                  >
                    <History className="mr-2 h-4 w-4" />
                    Corrigir serviço
                  </Button>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>

      <Dialog
        open={Boolean(selecionado)}
        onOpenChange={(aberto) => {
          if (!aberto) {
            fecharCorrecao();
          }
        }}
      >
        <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-xl">
          <DialogHeader>
            <DialogTitle>Corrigir serviço realizado</DialogTitle>
            <DialogDescription>
              Esta ação não remarca o atendimento e não recalcula o
              pagamento.
            </DialogDescription>
          </DialogHeader>

          {selecionado && (
            <div className="space-y-5">
              {erro && (
                <div
                  role="alert"
                  className="rounded-2xl border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive"
                >
                  {erro}
                </div>
              )}

              <div className="rounded-2xl border border-border bg-background/50 p-4">
                <p className="text-xs uppercase tracking-widest text-muted-foreground">
                  Atendimento original
                </p>

                <div className="mt-3 space-y-2 text-sm">
                  <p>
                    <strong>Cliente:</strong>{" "}
                    {selecionado.cliente.nome}
                  </p>
                  <p>
                    <strong>Profissional:</strong>{" "}
                    {selecionado.profissional.nome}
                  </p>
                  <p>
                    <strong>Data:</strong>{" "}
                    {formatarData(selecionado.inicio)}
                  </p>
                  <p>
                    <strong>Horário:</strong>{" "}
                    {formatarHora(selecionado.inicio)}–{formatarHora(selecionado.fim)}
                  </p>
                  <p>
                    <strong>Serviço atual:</strong>{" "}
                    {selecionado.servico.nome}
                  </p>
                  <p>
                    <strong>Pagamento:</strong>{" "}
                    {traduzirFormaPagamento(
                      selecionado.formaPagamento,
                    )}{" "}
                    ·{" "}
                    {formatarMoeda(
                      selecionado.valorPagoCentavos,
                    )}
                  </p>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs uppercase tracking-widest text-muted-foreground">
                  Serviço correto
                </label>

                <select
                  value={novoServicoId}
                  onChange={(event) => {
                    setNovoServicoId(event.target.value);
                    setErro("");
                  }}
                  className="h-11 w-full rounded-xl border border-input bg-background px-3 text-sm outline-none transition focus:border-gold"
                >
                  <option value="">Escolha o serviço correto</option>
                  {servicos.map((servico) => (
                    <option
                      key={servico.id}
                      value={servico.id}
                      disabled={servico.id === selecionado.servico.id}
                    >
                      {servico.nome} · {servico.duracaoMinutos} min ·{" "}
                      {formatarMoeda(servico.precoCentavos)}
                      {servico.id === selecionado.servico.id
                        ? " (atual)"
                        : ""}
                    </option>
                  ))}
                </select>

                {novoServico && (
                  <p className="text-xs leading-5 text-muted-foreground">
                    O serviço cadastrado possui duração padrão de{" "}
                    {novoServico.duracaoMinutos} min e preço de{" "}
                    {formatarMoeda(novoServico.precoCentavos)}. Esses
                    valores não alterarão o horário nem o pagamento já
                    registrado neste atendimento.
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <label className="text-xs uppercase tracking-widest text-muted-foreground">
                  Motivo da correção
                </label>

                <textarea
                  value={motivo}
                  onChange={(event) => {
                    setMotivo(event.target.value);
                    setErro("");
                  }}
                  maxLength={500}
                  rows={3}
                  placeholder="Ex.: serviço lançado incorretamente no fechamento."
                  className="w-full resize-none rounded-xl border border-input bg-background px-3 py-3 text-sm outline-none transition focus:border-gold"
                />

                <p className="text-right text-xs text-muted-foreground">
                  {motivo.length}/500
                </p>
              </div>

              <div className="flex gap-3 rounded-2xl border border-amber-500/25 bg-amber-500/10 p-4">
                <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-amber-600" />
                <p className="text-xs leading-5 text-muted-foreground">
                  O sistema registrará quem realizou a correção, o
                  serviço anterior, o novo serviço e o motivo. Horário
                  e dados financeiros serão preservados.
                </p>
              </div>

              <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
                <Button
                  type="button"
                  variant="outline"
                  onClick={fecharCorrecao}
                  disabled={salvando}
                  className="rounded-xl"
                >
                  Cancelar
                </Button>

                <Button
                  type="button"
                  onClick={() => void confirmarCorrecao()}
                  disabled={
                    salvando ||
                    !novoServicoId ||
                    novoServicoId === selecionado.servico.id ||
                    motivo.trim().length < 3
                  }
                  className="rounded-xl"
                >
                  {salvando ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <CheckCircle2 className="mr-2 h-4 w-4" />
                  )}
                  {salvando
                    ? "Salvando..."
                    : "Confirmar correção"}
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
