import { useEffect, useMemo, useState } from "react";
import type { FormEvent } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import {
  Ban,
  CreditCard,
  Crown,
  Plus,
  Receipt,
  Scissors,
  UserRound,
} from "lucide-react";

import { PageHeader } from "@/components/dashboard/Sidebar";
import { Button } from "@/components/ui/button";
import {
  adminAtivarAssinaturaCliente,
  adminCancelarAssinaturaCliente,
  adminCriarPlanoAssinatura,
  adminListarAssinaturas,
  adminListarClientesParaAssinatura,
  adminListarPlanosAssinatura,
} from "@/lib/api/assinatura.functions";

export const Route = createFileRoute("/admin/assinaturas")({
  component: AdminAssinaturasPage,
});

type FormaPagamento =
  | "PIX"
  | "DINHEIRO"
  | "CARTAO_DEBITO"
  | "CARTAO_CREDITO"
  | "ASSINATURA" 
  | "CORTESIA"
  | "OUTRO";

type StatusAssinatura =
  | "ATIVA"
  | "PAUSADA"
  | "CANCELADA"
  | "EXPIRADA";

type PlanoAssinatura = {
  id: string;
  nome: string;
  descricao: string | null;
  precoCentavos: number;
  cortesPorCiclo: number;
  duracaoDias: number;
  ativo: boolean;
  criadoEm: string | Date;
  atualizadoEm: string | Date;
};

type Cliente = {
  id: string;
  nome: string;
  email: string;
  telefone: string | null;
};

type AssinaturaCliente = {
  id: string;
  status: StatusAssinatura;
  inicio: string | Date;
  vigenciaInicio: string | Date;
  vigenciaFim: string | Date;
  saldoCortes: number;
  renovaAutomaticamente: boolean;
  observacao: string | null;
  criadoEm: string | Date;
  atualizadoEm: string | Date;

  cliente: Cliente;

  plano: {
    id: string;
    nome: string;
    precoCentavos: number;
    cortesPorCiclo: number;
    duracaoDias: number;
  };

  pagamentos: {
    id: string;
    formaPagamento: FormaPagamento;
    valorCentavos: number;
    pagoEm: string | Date;
    observacao: string | null;
  }[];

  usos: {
    id: string;
    quantidadeCortes: number;
    criadoEm: string | Date;
    agendamento: {
      id: string;
      inicio: string | Date;
      status: string;
      servico: {
        nome: string;
      };
    };
  }[];
};

function formatarDinheiro(centavos: number): string {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(centavos / 100);
}

function formatarData(valor: string | Date): string {
  return new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(new Date(valor));
}

function dinheiroParaCentavos(valor: string): number {
  const numero = Number(
    valor.trim().replace(/\./g, "").replace(",", "."),
  );

  if (Number.isNaN(numero)) {
    return 0;
  }

  return Math.round(numero * 100);
}

function statusClasse(status: StatusAssinatura): string {
  if (status === "ATIVA") {
    return "border-emerald-500/30 bg-emerald-500/10 text-emerald-400";
  }

  if (status === "CANCELADA") {
    return "border-destructive/30 bg-destructive/10 text-destructive";
  }

  return "border-border bg-background text-muted-foreground";
}

function formaPagamentoLabel(forma: FormaPagamento): string {
  const labels: Record<FormaPagamento, string> = {
    PIX: "Pix",
    DINHEIRO: "Dinheiro",
    CARTAO_DEBITO: "Cartão de débito",
    CARTAO_CREDITO: "Cartão de crédito",
    ASSINATURA: "Assinatura",
    CORTESIA: "Cortesia",
    OUTRO: "Outro",
  };

  return labels[forma];
}

function AdminAssinaturasPage() {
  const listarPlanos = useServerFn(adminListarPlanosAssinatura);
  const criarPlano = useServerFn(adminCriarPlanoAssinatura);
  const listarClientes = useServerFn(
    adminListarClientesParaAssinatura,
  );
  const listarAssinaturas = useServerFn(adminListarAssinaturas);
  const ativarAssinatura = useServerFn(
    adminAtivarAssinaturaCliente,
  );
  const cancelarAssinatura = useServerFn(
    adminCancelarAssinaturaCliente,
  );

  const [planos, setPlanos] = useState<PlanoAssinatura[]>([]);
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [assinaturas, setAssinaturas] = useState<
    AssinaturaCliente[]
  >([]);

  const [nomePlano, setNomePlano] = useState("RD Black Mensal");
  const [descricaoPlano, setDescricaoPlano] = useState(
    "Plano mensal com cortes inclusos e benefícios exclusivos.",
  );
  const [precoPlano, setPrecoPlano] = useState("99,90");
  const [cortesPorCiclo, setCortesPorCiclo] = useState("2");
  const [duracaoDias, setDuracaoDias] = useState("30");

  const [clienteId, setClienteId] = useState("");
  const [planoId, setPlanoId] = useState("");
  const [vigenciaInicio, setVigenciaInicio] = useState("");
  const [formaPagamento, setFormaPagamento] =
    useState<"" | FormaPagamento>("PIX");
  const [valorPago, setValorPago] = useState("");
  const [observacaoAssinatura, setObservacaoAssinatura] =
    useState("");

  const [assinaturaCancelamentoId, setAssinaturaCancelamentoId] =
    useState("");
  const [observacaoCancelamento, setObservacaoCancelamento] =
    useState("");

  const [carregando, setCarregando] = useState(true);
  const [salvandoPlano, setSalvandoPlano] = useState(false);
  const [ativando, setAtivando] = useState(false);
  const [cancelandoId, setCancelandoId] = useState("");
  const [mensagem, setMensagem] = useState("");
  const [erro, setErro] = useState("");

  async function carregarDados() {
    setCarregando(true);
    setErro("");

    try {
      const [
        planosResposta,
        clientesResposta,
        assinaturasResposta,
      ] = await Promise.all([
        listarPlanos(),
        listarClientes(),
        listarAssinaturas(),
      ]);

      setPlanos(planosResposta);
      setClientes(clientesResposta);
      setAssinaturas(assinaturasResposta);
    } catch (error) {
      console.error(error);
      setErro("Não foi possível carregar assinaturas.");
    } finally {
      setCarregando(false);
    }
  }

  useEffect(() => {
    void carregarDados();
  }, []);

  const resumo = useMemo(() => {
    const ativas = assinaturas.filter(
      (assinatura) => assinatura.status === "ATIVA",
    );

    const canceladas = assinaturas.filter(
      (assinatura) => assinatura.status === "CANCELADA",
    );

    const saldoTotal = ativas.reduce(
      (total, assinatura) => total + assinatura.saldoCortes,
      0,
    );

    const receitaTotal = assinaturas.reduce(
      (total, assinatura) => {
        const pagamentos = assinatura.pagamentos.reduce(
          (subtotal, pagamento) =>
            subtotal + pagamento.valorCentavos,
          0,
        );

        return total + pagamentos;
      },
      0,
    );

    return {
      ativas: ativas.length,
      canceladas: canceladas.length,
      saldoTotal,
      receitaTotal,
    };
  }, [assinaturas]);

  const planoSelecionado = planos.find(
    (plano) => plano.id === planoId,
  );

  useEffect(() => {
    if (!planoSelecionado) {
      return;
    }

    setValorPago(
      (planoSelecionado.precoCentavos / 100)
        .toFixed(2)
        .replace(".", ","),
    );
  }, [planoSelecionado]);

  async function handleCriarPlano(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setMensagem("");
    setErro("");
    setSalvandoPlano(true);

    try {
      const resultado = await criarPlano({
        data: {
          nome: nomePlano,
          descricao: descricaoPlano,
          precoCentavos: dinheiroParaCentavos(precoPlano),
          cortesPorCiclo: Number(cortesPorCiclo),
          duracaoDias: Number(duracaoDias),
          ativo: true,
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
      setErro("Não foi possível criar o plano.");
    } finally {
      setSalvandoPlano(false);
    }
  }

  async function handleAtivarAssinatura(
    event: FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();

    setMensagem("");
    setErro("");
    setAtivando(true);

    try {
      const resultado = await ativarAssinatura({
        data: {
          clienteId,
          planoId,
          vigenciaInicio,
          formaPagamento: formaPagamento || undefined,
          valorPagoCentavos: valorPago
            ? dinheiroParaCentavos(valorPago)
            : undefined,
          observacao: observacaoAssinatura,
        },
      });

      if (!resultado.sucesso) {
        setErro(resultado.mensagem);
        return;
      }

      setMensagem(resultado.mensagem);

      setClienteId("");
      setPlanoId("");
      setVigenciaInicio("");
      setFormaPagamento("PIX");
      setValorPago("");
      setObservacaoAssinatura("");

      await carregarDados();
    } catch (error) {
      console.error(error);
      setErro("Não foi possível ativar a assinatura.");
    } finally {
      setAtivando(false);
    }
  }

  function abrirModalCancelamento(assinaturaId: string) {
    setAssinaturaCancelamentoId(assinaturaId);
    setObservacaoCancelamento("");
  }

  function fecharModalCancelamento() {
    setAssinaturaCancelamentoId("");
    setObservacaoCancelamento("");
  }

  async function handleCancelarAssinatura() {
    if (!assinaturaCancelamentoId) {
      return;
    }

    setMensagem("");
    setErro("");
    setCancelandoId(assinaturaCancelamentoId);

    try {
      const resultado = await cancelarAssinatura({
        data: {
          assinaturaId: assinaturaCancelamentoId,
          observacao: observacaoCancelamento,
        },
      });

      if (!resultado.sucesso) {
        setErro(resultado.mensagem);
        return;
      }

      setMensagem(resultado.mensagem);
      fecharModalCancelamento();

      await carregarDados();
    } catch (error) {
      console.error(error);
      setErro("Não foi possível cancelar a assinatura.");
    } finally {
      setCancelandoId("");
    }
  }

  return (
    <div className="max-w-7xl p-8 lg:p-12">
      <PageHeader
        title="Assinaturas"
        subtitle="Gerencie planos, clientes assinantes, pagamentos e saldo de cortes."
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

      <div className="mb-8 grid gap-4 md:grid-cols-4">
        <section className="rounded-2xl border border-border bg-surface p-5">
          <div className="flex items-center justify-between">
            <span className="text-xs uppercase tracking-widest text-muted-foreground">
              Ativas
            </span>
            <Crown className="h-4 w-4 text-gold" />
          </div>

          <div className="mt-3 text-3xl font-display">
            {carregando ? "..." : resumo.ativas}
          </div>

          <p className="mt-1 text-xs text-muted-foreground">
            assinaturas ativas
          </p>
        </section>

        <section className="rounded-2xl border border-border bg-surface p-5">
          <div className="flex items-center justify-between">
            <span className="text-xs uppercase tracking-widest text-muted-foreground">
              Saldo
            </span>
            <Scissors className="h-4 w-4 text-gold" />
          </div>

          <div className="mt-3 text-3xl font-display">
            {carregando ? "..." : resumo.saldoTotal}
          </div>

          <p className="mt-1 text-xs text-muted-foreground">
            cortes disponíveis
          </p>
        </section>

        <section className="rounded-2xl border border-border bg-surface p-5">
          <div className="flex items-center justify-between">
            <span className="text-xs uppercase tracking-widest text-muted-foreground">
              Receita
            </span>
            <Receipt className="h-4 w-4 text-gold" />
          </div>

          <div className="mt-3 text-2xl font-display">
            {carregando
              ? "..."
              : formatarDinheiro(resumo.receitaTotal)}
          </div>

          <p className="mt-1 text-xs text-muted-foreground">
            pagos em assinaturas
          </p>
        </section>

        <section className="rounded-2xl border border-border bg-surface p-5">
          <div className="flex items-center justify-between">
            <span className="text-xs uppercase tracking-widest text-muted-foreground">
              Canceladas
            </span>
            <Ban className="h-4 w-4 text-gold" />
          </div>

          <div className="mt-3 text-3xl font-display">
            {carregando ? "..." : resumo.canceladas}
          </div>

          <p className="mt-1 text-xs text-muted-foreground">
            histórico cancelado
          </p>
        </section>
      </div>

      <div className="grid gap-6 xl:grid-cols-2">
        <section className="rounded-2xl border border-border bg-surface p-6">
          <div className="mb-6 flex items-center gap-3">
            <Plus className="h-5 w-5 text-gold" />
            <div>
              <h2 className="text-sm font-medium">
                Criar plano
              </h2>
              <p className="mt-1 text-xs text-muted-foreground">
                Exemplo: RD Black Mensal, R$ 99,90, 2 cortes por mês.
              </p>
            </div>
          </div>

          <form onSubmit={handleCriarPlano} className="space-y-4">
            <div className="space-y-2">
              <label className="text-xs uppercase tracking-widest text-muted-foreground">
                Nome
              </label>

              <input
                value={nomePlano}
                onChange={(event) =>
                  setNomePlano(event.target.value)
                }
                className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
                required
              />
            </div>

            <div className="space-y-2">
              <label className="text-xs uppercase tracking-widest text-muted-foreground">
                Descrição
              </label>

              <textarea
                value={descricaoPlano}
                onChange={(event) =>
                  setDescricaoPlano(event.target.value)
                }
                className="min-h-24 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              />
            </div>

            <div className="grid gap-4 md:grid-cols-3">
              <div className="space-y-2">
                <label className="text-xs uppercase tracking-widest text-muted-foreground">
                  Preço
                </label>

                <input
                  value={precoPlano}
                  onChange={(event) =>
                    setPrecoPlano(event.target.value)
                  }
                  placeholder="99,90"
                  className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
                  required
                />
              </div>

              <div className="space-y-2">
                <label className="text-xs uppercase tracking-widest text-muted-foreground">
                  Cortes
                </label>

                <input
                  type="number"
                  min={1}
                  value={cortesPorCiclo}
                  onChange={(event) =>
                    setCortesPorCiclo(event.target.value)
                  }
                  className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
                  required
                />
              </div>

              <div className="space-y-2">
                <label className="text-xs uppercase tracking-widest text-muted-foreground">
                  Dias
                </label>

                <input
                  type="number"
                  min={1}
                  value={duracaoDias}
                  onChange={(event) =>
                    setDuracaoDias(event.target.value)
                  }
                  className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
                  required
                />
              </div>
            </div>

            <Button
              type="submit"
              disabled={salvandoPlano}
              className="w-full"
            >
              {salvandoPlano ? "Criando..." : "Criar plano"}
            </Button>
          </form>

          <div className="mt-6 space-y-3">
            <h3 className="text-sm font-medium">
              Planos cadastrados
            </h3>

            {planos.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                Nenhum plano cadastrado.
              </p>
            ) : (
              planos.map((plano) => (
                <div
                  key={plano.id}
                  className="rounded-xl border border-border bg-background/40 p-4"
                >
                  <div className="flex items-center justify-between gap-4">
                    <div>
                      <h4 className="font-medium">{plano.nome}</h4>
                      <p className="mt-1 text-xs text-muted-foreground">
                        {plano.cortesPorCiclo} cortes a cada{" "}
                        {plano.duracaoDias} dias
                      </p>
                    </div>

                    <span className="text-sm font-medium text-gold">
                      {formatarDinheiro(plano.precoCentavos)}
                    </span>
                  </div>

                  {plano.descricao && (
                    <p className="mt-3 text-sm text-muted-foreground">
                      {plano.descricao}
                    </p>
                  )}
                </div>
              ))
            )}
          </div>
        </section>

        <section className="rounded-2xl border border-border bg-surface p-6">
          <div className="mb-6 flex items-center gap-3">
            <UserRound className="h-5 w-5 text-gold" />
            <div>
              <h2 className="text-sm font-medium">
                Ativar assinatura
              </h2>
              <p className="mt-1 text-xs text-muted-foreground">
                Escolha o cliente, o plano e registre o pagamento.
              </p>
            </div>
          </div>

          <form
            onSubmit={handleAtivarAssinatura}
            className="space-y-4"
          >
            <div className="space-y-2">
              <label className="text-xs uppercase tracking-widest text-muted-foreground">
                Cliente
              </label>

              <select
                value={clienteId}
                onChange={(event) =>
                  setClienteId(event.target.value)
                }
                className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
                required
              >
                <option value="">Selecione um cliente</option>

                {clientes.map((cliente) => (
                  <option key={cliente.id} value={cliente.id}>
                    {cliente.nome} — {cliente.email}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-xs uppercase tracking-widest text-muted-foreground">
                Plano
              </label>

              <select
                value={planoId}
                onChange={(event) =>
                  setPlanoId(event.target.value)
                }
                className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
                required
              >
                <option value="">Selecione um plano</option>

                {planos
                  .filter((plano) => plano.ativo)
                  .map((plano) => (
                    <option key={plano.id} value={plano.id}>
                      {plano.nome} —{" "}
                      {formatarDinheiro(plano.precoCentavos)}
                    </option>
                  ))}
              </select>
            </div>

            <div className="grid gap-4 md:grid-cols-3">
              <div className="space-y-2">
                <label className="text-xs uppercase tracking-widest text-muted-foreground">
                  Início
                </label>

                <input
                  type="datetime-local"
                  value={vigenciaInicio}
                  onChange={(event) =>
                    setVigenciaInicio(event.target.value)
                  }
                  className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
                />
              </div>

              <div className="space-y-2">
                <label className="text-xs uppercase tracking-widest text-muted-foreground">
                  Pagamento
                </label>

                <select
                  value={formaPagamento}
                  onChange={(event) =>
                    setFormaPagamento(
                      event.target.value as "" | FormaPagamento,
                    )
                  }
                  className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
                >
                  <option value="">Não registrar</option>
                  <option value="PIX">Pix</option>
                  <option value="DINHEIRO">Dinheiro</option>
                  <option value="CARTAO_DEBITO">
                    Cartão de débito
                  </option>
                  <option value="CARTAO_CREDITO">
                    Cartão de crédito
                  </option>
                  <option value="CORTESIA">Cortesia</option>
                  <option value="OUTRO">Outro</option>
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-xs uppercase tracking-widest text-muted-foreground">
                  Valor
                </label>

                <input
                  value={valorPago}
                  onChange={(event) =>
                    setValorPago(event.target.value)
                  }
                  placeholder="99,90"
                  className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs uppercase tracking-widest text-muted-foreground">
                Observação
              </label>

              <textarea
                value={observacaoAssinatura}
                onChange={(event) =>
                  setObservacaoAssinatura(event.target.value)
                }
                className="min-h-24 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              />
            </div>

            <Button
              type="submit"
              disabled={ativando}
              className="w-full"
            >
              <CreditCard className="mr-2 h-4 w-4" />
              {ativando ? "Ativando..." : "Ativar assinatura"}
            </Button>
          </form>
        </section>
      </div>

      <section className="mt-8 overflow-hidden rounded-2xl border border-border bg-surface">
        <div className="border-b border-border px-6 py-4">
          <h2 className="text-sm font-medium">
            Assinaturas dos clientes
          </h2>
          <p className="mt-1 text-xs text-muted-foreground">
            Acompanhe status, vigência, saldo e pagamentos.
          </p>
        </div>

        {carregando ? (
          <div className="px-6 py-10 text-sm text-muted-foreground">
            Carregando assinaturas...
          </div>
        ) : assinaturas.length === 0 ? (
          <div className="px-6 py-10 text-sm text-muted-foreground">
            Nenhuma assinatura criada ainda.
          </div>
        ) : (
          <div className="divide-y divide-border">
            {assinaturas.map((assinatura) => {
              const totalPago = assinatura.pagamentos.reduce(
                (total, pagamento) =>
                  total + pagamento.valorCentavos,
                0,
              );

              return (
                <article
                  key={assinatura.id}
                  className="px-6 py-5"
                >
                  <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                    <div>
                      <div className="flex flex-wrap items-center gap-3">
                        <h3 className="font-medium">
                          {assinatura.cliente.nome}
                        </h3>

                        <span
                          className={`rounded-full border px-3 py-1 text-xs ${statusClasse(
                            assinatura.status,
                          )}`}
                        >
                          {assinatura.status}
                        </span>

                        <span className="rounded-full border border-border bg-background px-3 py-1 text-xs text-muted-foreground">
                          {assinatura.plano.nome}
                        </span>
                      </div>

                      <div className="mt-3 grid gap-2 text-sm text-muted-foreground md:grid-cols-2">
                        <p>
                          Vigência:{" "}
                          {formatarData(assinatura.vigenciaInicio)} até{" "}
                          {formatarData(assinatura.vigenciaFim)}
                        </p>

                        <p>
                          Saldo:{" "}
                          <span className="text-foreground">
                            {assinatura.saldoCortes}
                          </span>{" "}
                          cortes
                        </p>

                        <p>
                          Pago:{" "}
                          <span className="text-foreground">
                            {formatarDinheiro(totalPago)}
                          </span>
                        </p>

                        <p>
                          Cliente: {assinatura.cliente.email}
                        </p>
                      </div>

                      {assinatura.pagamentos.length > 0 && (
                        <div className="mt-3 space-y-1 text-sm text-muted-foreground">
                          {assinatura.pagamentos.map((pagamento) => (
                            <p key={pagamento.id}>
                              Pagamento:{" "}
                              {formaPagamentoLabel(
                                pagamento.formaPagamento,
                              )}{" "}
                              —{" "}
                              {formatarDinheiro(
                                pagamento.valorCentavos,
                              )}
                            </p>
                          ))}
                        </div>
                      )}

                      {assinatura.observacao && (
                        <p className="mt-3 rounded-xl border border-border bg-background/40 p-3 text-sm text-muted-foreground">
                          {assinatura.observacao}
                        </p>
                      )}
                    </div>

                    {assinatura.status === "ATIVA" && (
                      <Button
                        type="button"
                        variant="outline"
                        disabled={cancelandoId === assinatura.id}
                        onClick={() =>
                          abrirModalCancelamento(assinatura.id)
                        }
                        className="border-destructive/40 text-destructive hover:bg-destructive/10"
                      >
                        <Ban className="mr-2 h-4 w-4" />
                        {cancelandoId === assinatura.id
                          ? "Cancelando..."
                          : "Cancelar"}
                      </Button>
                    )}
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </section>

      {assinaturaCancelamentoId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 p-4 backdrop-blur-sm">
          <div className="w-full max-w-lg rounded-2xl border border-border bg-surface p-6 shadow-xl">
            <h2 className="text-xl font-display">
              Cancelar assinatura
            </h2>

            <p className="mt-2 text-sm text-muted-foreground">
              Informe uma observação para registrar o cancelamento.
            </p>

            <textarea
              value={observacaoCancelamento}
              onChange={(event) =>
                setObservacaoCancelamento(event.target.value)
              }
              placeholder="Ex.: cliente pediu cancelamento..."
              className="mt-6 min-h-32 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
            />

            <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
              <button
                type="button"
                onClick={fecharModalCancelamento}
                disabled={Boolean(cancelandoId)}
                className="inline-flex h-10 items-center justify-center rounded-full border border-border px-5 text-sm transition hover:bg-surface-elevated disabled:cursor-not-allowed disabled:opacity-60"
              >
                Voltar
              </button>

              <button
                type="button"
                onClick={() => void handleCancelarAssinatura()}
                disabled={Boolean(cancelandoId)}
                className="inline-flex h-10 items-center justify-center rounded-full bg-destructive px-5 text-sm text-destructive-foreground transition hover:bg-destructive/90 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {cancelandoId
                  ? "Cancelando..."
                  : "Confirmar cancelamento"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}