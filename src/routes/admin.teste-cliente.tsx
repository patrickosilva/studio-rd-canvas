import { useEffect, useMemo, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { Check, Copy, Loader2, RefreshCw } from "lucide-react";

import { PageHeader } from "@/components/dashboard/Sidebar";
import { Button } from "@/components/ui/button";
import { adminListarPlanosAssinatura } from "@/lib/api/assinatura.functions";
import {
  adminListarCupons,
  adminListarServicosParaCupom,
} from "@/lib/api/cupons.functions";
import {
  adminConsultarCobrancaPixTesteInter,
  adminCriarCobrancaPixTesteInter,
  adminListarIntegracoes,
} from "@/lib/api/integracoes.functions";

export const Route = createFileRoute("/admin/teste-cliente")({
  component: AdminTesteClientePage,
});

type Plano = {
  id: string;
  nome: string;
  descricao: string | null;
  precoCentavos: number;
  cortesPorCiclo: number;
  duracaoDias: number;
  ativo: boolean;
};

type Servico = {
  id: string;
  nome: string;
  precoCentavos: number;
};

type Cupom = {
  id: string;
  codigo: string;
  descricao: string | null;
  campanha: string | null;
  tipo: "PERCENTUAL" | "VALOR_FIXO";
  percentualDesconto: number | null;
  valorDescontoCentavos: number | null;
  limiteDescontoCentavos: number | null;
  valorMinimoCentavos: number | null;
  inicioEm: Date | string | null;
  fimEm: Date | string | null;
  limiteUsos: number | null;
  publico:
    | "TODOS"
    | "PRIMEIRO_ATENDIMENTO"
    | "ATE_X_ATENDIMENTOS"
    | "MINIMO_X_ATENDIMENTOS"
    | "SEM_ATENDIMENTO_HA_X_DIAS"
    | "ASSINANTE_ATIVO";
  aplicaTodosServicos: boolean;
  ativo: boolean;
  servicos: Array<{
    servico: {
      id: string;
      nome: string;
      ativo: boolean;
    };
  }>;
  _count: {
    usos: number;
  };
};

type Integracao = {
  provedor: "INTER" | "META";
  status: "DESCONECTADA" | "CONFIGURANDO" | "CONECTADA" | "ERRO";
  configuracaoPublica: unknown;
};

type CobrancaTeste = {
  txid: string;
  status: string;
  pixCopiaECola: string | null;
  location: string | null;
  valorOriginal: string | null;
  expiracaoSegundos: number | null;
  revisao: number | null;
};

type Etapa = "ESCOLHA" | "PAGAMENTO" | "CONFIRMACAO";
type TipoTeste = "ASSINATURA" | "SERVICO";

type CupomAplicado = {
  id: string;
  codigo: string;
  descontoCentavos: number;
};

function formatarDinheiro(centavos: number): string {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(centavos / 100);
}

function lerAmbiente(configuracao: unknown): "SANDBOX" | "PRODUCAO" {
  if (
    configuracao &&
    typeof configuracao === "object" &&
    !Array.isArray(configuracao) &&
    (configuracao as Record<string, unknown>).ambiente === "PRODUCAO"
  ) {
    return "PRODUCAO";
  }

  return "SANDBOX";
}

function statusConcluido(status: string): boolean {
  const normalizado = status.toUpperCase();

  return (
    normalizado.includes("CONCLUID") ||
    normalizado.includes("PAGO") ||
    normalizado.includes("LIQUID")
  );
}

function dataValida(valor: Date | string | null): Date | null {
  if (!valor) {
    return null;
  }

  const data = valor instanceof Date ? valor : new Date(valor);

  return Number.isNaN(data.getTime()) ? null : data;
}

function calcularDescontoCupom(
  cupom: Cupom,
  valorCentavos: number,
): number {
  if (cupom.tipo === "VALOR_FIXO") {
    return Math.min(
      valorCentavos,
      cupom.valorDescontoCentavos ?? 0,
    );
  }

  let desconto = Math.floor(
    (valorCentavos * (cupom.percentualDesconto ?? 0)) / 100,
  );

  if (cupom.limiteDescontoCentavos !== null) {
    desconto = Math.min(
      desconto,
      cupom.limiteDescontoCentavos,
    );
  }

  return Math.min(valorCentavos, desconto);
}

function AdminTesteClientePage() {
  const listarIntegracoes = useServerFn(adminListarIntegracoes);
  const listarPlanos = useServerFn(adminListarPlanosAssinatura);
  const listarServicos = useServerFn(adminListarServicosParaCupom);
  const listarCupons = useServerFn(adminListarCupons);
  const criarCobranca = useServerFn(adminCriarCobrancaPixTesteInter);
  const consultarCobranca = useServerFn(
    adminConsultarCobrancaPixTesteInter,
  );

  const [integracoes, setIntegracoes] = useState<Integracao[]>([]);
  const [planos, setPlanos] = useState<Plano[]>([]);
  const [servicos, setServicos] = useState<Servico[]>([]);
  const [cupons, setCupons] = useState<Cupom[]>([]);

  const [tipoTeste, setTipoTeste] =
    useState<TipoTeste>("ASSINATURA");
  const [planoId, setPlanoId] = useState("");
  const [servicoId, setServicoId] = useState("");

  const [clienteNome, setClienteNome] = useState(
    "Cliente Teste Studio RD",
  );
  const [clienteEmail, setClienteEmail] = useState(
    "cliente.teste@studio-rd.local",
  );

  const [cupomDigitado, setCupomDigitado] = useState("");
  const [cupomAplicado, setCupomAplicado] =
    useState<CupomAplicado | null>(null);

  const [etapa, setEtapa] = useState<Etapa>("ESCOLHA");
  const [cobranca, setCobranca] =
    useState<CobrancaTeste | null>(null);

  const [autoAtualizar, setAutoAtualizar] = useState(true);
  const [simulacaoAprovada, setSimulacaoAprovada] =
    useState(false);

  const [carregando, setCarregando] = useState(true);
  const [processando, setProcessando] = useState("");
  const [erro, setErro] = useState("");
  const [mensagem, setMensagem] = useState("");

  async function carregar() {
    setCarregando(true);
    setErro("");

    try {
      const [
        integracoesResposta,
        planosResposta,
        servicosResposta,
        cuponsResposta,
      ] = await Promise.all([
        listarIntegracoes(),
        listarPlanos(),
        listarServicos(),
        listarCupons(),
      ]);

      setIntegracoes(integracoesResposta as Integracao[]);

      const planosAtivos = (planosResposta as Plano[]).filter(
        (item) => item.ativo,
      );

      const servicosAtivos = servicosResposta as Servico[];
      const listaCupons = cuponsResposta as Cupom[];

      setPlanos(planosAtivos);
      setServicos(servicosAtivos);
      setCupons(listaCupons);

      if (!planoId && planosAtivos[0]) {
        setPlanoId(planosAtivos[0].id);
      }

      if (!servicoId && servicosAtivos[0]) {
        setServicoId(servicosAtivos[0].id);
      }
    } catch (error) {
      console.error(error);
      setErro(
        "Não foi possível preparar o ambiente de teste.",
      );
    } finally {
      setCarregando(false);
    }
  }

  useEffect(() => {
    void carregar();
  }, []);

  const inter = useMemo(
    () =>
      integracoes.find(
        (item) => item.provedor === "INTER",
      ) ?? null,
    [integracoes],
  );

  const plano = useMemo(
    () =>
      planos.find((item) => item.id === planoId) ?? null,
    [planos, planoId],
  );

  const servico = useMemo(
    () =>
      servicos.find((item) => item.id === servicoId) ?? null,
    [servicos, servicoId],
  );

  const itemSelecionado =
    tipoTeste === "ASSINATURA" ? plano : servico;

  const valorBaseCentavos =
    itemSelecionado?.precoCentavos ?? 0;

  const descontoCentavos =
    tipoTeste === "SERVICO"
      ? cupomAplicado?.descontoCentavos ?? 0
      : 0;

  const valorFinalCentavos = Math.max(
    0,
    valorBaseCentavos - descontoCentavos,
  );

  const sandboxPronto =
    inter?.status === "CONECTADA" &&
    lerAmbiente(inter.configuracaoPublica) === "SANDBOX";

  const pagamentoConfirmadoInter =
    cobranca ? statusConcluido(cobranca.status) : false;

  const pagamentoVisualConcluido =
    pagamentoConfirmadoInter || simulacaoAprovada;

  function trocarTipo(novoTipo: TipoTeste) {
    setTipoTeste(novoTipo);
    setCupomDigitado("");
    setCupomAplicado(null);
    setErro("");
    setMensagem("");
  }

  function aplicarCupom() {
    if (tipoTeste !== "SERVICO" || !servico) {
      setErro(
        "Nesta versão, o cupom é testado no pagamento de serviço avulso.",
      );
      return;
    }

    const codigo = cupomDigitado
      .trim()
      .toUpperCase()
      .replace(/\s+/g, "");

    if (!codigo) {
      setErro("Digite um código de cupom.");
      return;
    }

    const cupom = cupons.find(
      (item) => item.codigo.toUpperCase() === codigo,
    );

    if (!cupom) {
      setErro("Cupom não encontrado.");
      return;
    }

    if (!cupom.ativo) {
      setErro("Este cupom está desativado.");
      return;
    }

    const agora = new Date();
    const inicio = dataValida(cupom.inicioEm);
    const fim = dataValida(cupom.fimEm);

    if (inicio && inicio.getTime() > agora.getTime()) {
      setErro("Este cupom ainda não começou.");
      return;
    }

    if (fim && fim.getTime() < agora.getTime()) {
      setErro("Este cupom já expirou.");
      return;
    }

    if (
      cupom.limiteUsos !== null &&
      cupom._count.usos >= cupom.limiteUsos
    ) {
      setErro("O limite total deste cupom já foi atingido.");
      return;
    }

    if (
      cupom.valorMinimoCentavos !== null &&
      servico.precoCentavos < cupom.valorMinimoCentavos
    ) {
      setErro(
        `Este cupom exige valor mínimo de ${formatarDinheiro(
          cupom.valorMinimoCentavos,
        )}.`,
      );
      return;
    }

    if (
      !cupom.aplicaTodosServicos &&
      !cupom.servicos.some(
        (relacao) =>
          relacao.servico.id === servico.id &&
          relacao.servico.ativo,
      )
    ) {
      setErro("Este cupom não é válido para o serviço selecionado.");
      return;
    }

    if (cupom.publico !== "TODOS") {
      setErro(
        "Este cupom depende do histórico/perfil do cliente. Ele será validado por completo quando criarmos a conta de teste persistente.",
      );
      return;
    }

    const desconto = calcularDescontoCupom(
      cupom,
      servico.precoCentavos,
    );

    if (desconto <= 0) {
      setErro("Este cupom não gerou desconto para este cenário.");
      return;
    }

    setCupomAplicado({
      id: cupom.id,
      codigo: cupom.codigo,
      descontoCentavos: desconto,
    });
    setErro("");
    setMensagem(
      `Cupom ${cupom.codigo} aplicado apenas nesta simulação.`,
    );
  }

  function removerCupom() {
    setCupomAplicado(null);
    setCupomDigitado("");
    setMensagem("");
    setErro("");
  }

  async function gerarPix() {
    if (!itemSelecionado) {
      setErro("Selecione o que deseja testar.");
      return;
    }

    if (valorFinalCentavos <= 0) {
      setErro(
        "O valor final precisa ser maior que zero para gerar um Pix de teste.",
      );
      return;
    }

    setErro("");
    setMensagem("");
    setProcessando("COBRAR");
    setSimulacaoAprovada(false);

    const descricao =
      tipoTeste === "ASSINATURA"
        ? `Teste cliente - assinatura ${itemSelecionado.nome}`
        : `Teste cliente - servico ${itemSelecionado.nome}`;

    try {
      const resultado = await criarCobranca({
        data: {
          valorCentavos: valorFinalCentavos,
          descricao: descricao.slice(0, 140),
        },
      });

      if (!resultado.sucesso) {
        setErro(resultado.mensagem);
        return;
      }

      setCobranca(resultado.cobranca);
      setEtapa("CONFIRMACAO");
      setMensagem(
        "Cobrança criada no Sandbox. A tela agora representa a etapa de pagamento do cliente.",
      );
    } catch (error) {
      console.error(error);
      setErro("Não foi possível gerar o Pix de teste.");
    } finally {
      setProcessando("");
    }
  }

  async function atualizarStatus(silencioso = false) {
    if (!cobranca || simulacaoAprovada) {
      return;
    }

    if (!silencioso) {
      setErro("");
      setMensagem("");
      setProcessando("CONSULTAR");
    }

    try {
      const resultado = await consultarCobranca({
        data: {
          txid: cobranca.txid,
        },
      });

      if (!resultado.sucesso) {
        if (!silencioso) {
          setErro(resultado.mensagem);
        }
        return;
      }

      setCobranca(resultado.cobranca);

      if (
        statusConcluido(resultado.cobranca.status)
      ) {
        setMensagem(
          "O Sandbox do Inter confirmou a cobrança.",
        );
      } else if (!silencioso) {
        setMensagem(
          "Status consultado diretamente no Sandbox.",
        );
      }
    } catch (error) {
      console.error(error);

      if (!silencioso) {
        setErro("Não foi possível consultar a cobrança.");
      }
    } finally {
      if (!silencioso) {
        setProcessando("");
      }
    }
  }

  useEffect(() => {
    if (
      !cobranca ||
      !autoAtualizar ||
      simulacaoAprovada ||
      statusConcluido(cobranca.status)
    ) {
      return;
    }

    const intervalo = window.setInterval(() => {
      void atualizarStatus(true);
    }, 10000);

    return () => {
      window.clearInterval(intervalo);
    };
  }, [
    cobranca?.txid,
    cobranca?.status,
    autoAtualizar,
    simulacaoAprovada,
  ]);

  async function copiarPix() {
    if (!cobranca?.pixCopiaECola) {
      return;
    }

    await navigator.clipboard.writeText(
      cobranca.pixCopiaECola,
    );
    setMensagem("Pix copia e cola copiado.");
  }

  function simularAprovacaoVisual() {
    setSimulacaoAprovada(true);
    setAutoAtualizar(false);
    setErro("");
    setMensagem(
      "Aprovação visual simulada localmente. O Banco Inter não confirmou este pagamento.",
    );
  }

  function reiniciar() {
    setEtapa("ESCOLHA");
    setCobranca(null);
    setCupomDigitado("");
    setCupomAplicado(null);
    setSimulacaoAprovada(false);
    setAutoAtualizar(true);
    setErro("");
    setMensagem("");
  }

  if (carregando) {
    return (
      <div className="max-w-5xl p-6 lg:p-10">
        <PageHeader
          title="Ambiente de teste"
          subtitle="Preparando a simulação do cliente."
        />
        <div className="border border-border bg-surface p-6 text-sm text-muted-foreground">
          Carregando...
        </div>
      </div>
    );
  }

  if (!sandboxPronto) {
    return (
      <div className="max-w-5xl p-6 lg:p-10">
        <PageHeader
          title="Ambiente de teste"
          subtitle="Este ambiente só pode ser usado com o Banco Inter conectado ao Sandbox."
        />

        <section className="border border-border bg-surface p-6">
          <p className="text-sm font-medium">
            Sandbox indisponível
          </p>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">
            Volte para Conexões, selecione “Sandbox (área de testes)”,
            salve as credenciais e valide a autenticação antes de abrir
            a experiência do cliente.
          </p>

          <a
            href="/admin/conexoes"
            className="mt-5 inline-flex h-10 items-center justify-center rounded-md border border-border bg-background px-4 text-sm font-medium transition hover:border-gold"
          >
            Voltar para Conexões
          </a>
        </section>
      </div>
    );
  }

  return (
    <div className="max-w-5xl p-6 lg:p-10">
      <PageHeader
        title="Ambiente de teste do cliente"
        subtitle="Simule pagamentos no Sandbox sem criar cliente, assinatura, agendamento ou receita real."
        actions={
          <a
            href="/admin/conexoes"
            className="inline-flex h-10 items-center justify-center rounded-md border border-border bg-background px-4 text-sm font-medium transition hover:border-gold"
          >
            Voltar para Conexões
          </a>
        }
      />

      <div className="mb-6 border-l-2 border-gold bg-gold-soft/40 px-4 py-3">
        <p className="text-sm font-medium">
          Sandbox (área de testes)
        </p>
        <p className="mt-1 text-sm leading-6 text-muted-foreground">
          Você pode testar uma assinatura ou uma cobrança de serviço
          avulso. Nada desta tela altera faturamento, relatórios,
          agenda ou assinatura real.
        </p>
      </div>

      {mensagem && (
        <div className="mb-5 border-l-2 border-emerald-500 bg-emerald-500/5 px-4 py-3 text-sm text-emerald-400">
          {mensagem}
        </div>
      )}

      {erro && (
        <div className="mb-5 border-l-2 border-destructive bg-destructive/5 px-4 py-3 text-sm text-destructive">
          {erro}
        </div>
      )}

      <div className="mb-7 grid grid-cols-3 border-y border-border py-3 text-xs">
        {[
          ["ESCOLHA", "01", "Cenário"],
          ["PAGAMENTO", "02", "Pagamento"],
          ["CONFIRMACAO", "03", "Confirmação"],
        ].map(([valor, numero, label]) => {
          const ativo =
            etapa === valor ||
            (valor === "ESCOLHA" &&
              etapa !== "ESCOLHA") ||
            (valor === "PAGAMENTO" &&
              etapa === "CONFIRMACAO");

          return (
            <div
              key={valor}
              className={
                ativo
                  ? "text-foreground"
                  : "text-muted-foreground/60"
              }
            >
              <span className="mr-2 font-mono text-gold">
                {numero}
              </span>
              {label}
            </div>
          );
        })}
      </div>

      {etapa === "ESCOLHA" && (
        <section className="grid gap-8 lg:grid-cols-[1fr_320px]">
          <div>
            <p className="text-xs font-medium uppercase tracking-[0.16em] text-gold">
              Visão do cliente
            </p>
            <h2 className="mt-2 text-xl font-semibold">
              O que deseja testar?
            </h2>

            <div className="mt-5 grid gap-3 sm:grid-cols-2">
              <button
                type="button"
                onClick={() => trocarTipo("ASSINATURA")}
                className={`border p-4 text-left transition ${
                  tipoTeste === "ASSINATURA"
                    ? "border-gold bg-gold-soft/30"
                    : "border-border hover:border-gold/50"
                }`}
              >
                <p className="font-medium">Assinatura</p>
                <p className="mt-1 text-sm leading-6 text-muted-foreground">
                  Simula a compra de um plano pelo cliente.
                </p>
              </button>

              <button
                type="button"
                onClick={() => trocarTipo("SERVICO")}
                className={`border p-4 text-left transition ${
                  tipoTeste === "SERVICO"
                    ? "border-gold bg-gold-soft/30"
                    : "border-border hover:border-gold/50"
                }`}
              >
                <p className="font-medium">Serviço avulso</p>
                <p className="mt-1 text-sm leading-6 text-muted-foreground">
                  Prévia do pagamento comum que será ligado ao
                  agendamento.
                </p>
              </button>
            </div>

            <div className="mt-7">
              <p className="text-sm font-medium">
                {tipoTeste === "ASSINATURA"
                  ? "Escolha um plano"
                  : "Escolha um serviço"}
              </p>

              <div className="mt-3 space-y-3">
                {tipoTeste === "ASSINATURA" ? (
                  planos.length === 0 ? (
                    <div className="border border-border p-4 text-sm text-muted-foreground">
                      Nenhum plano ativo encontrado.
                    </div>
                  ) : (
                    planos.map((item) => (
                      <button
                        key={item.id}
                        type="button"
                        onClick={() => setPlanoId(item.id)}
                        className={`w-full border p-4 text-left transition ${
                          planoId === item.id
                            ? "border-gold bg-gold-soft/30"
                            : "border-border bg-surface hover:border-gold/50"
                        }`}
                      >
                        <div className="flex items-start justify-between gap-4">
                          <div>
                            <p className="font-medium">
                              {item.nome}
                            </p>
                            {item.descricao && (
                              <p className="mt-1 text-sm leading-6 text-muted-foreground">
                                {item.descricao}
                              </p>
                            )}
                            <p className="mt-3 text-xs text-muted-foreground">
                              {item.cortesPorCiclo} cortes · ciclo de{" "}
                              {item.duracaoDias} dias
                            </p>
                          </div>

                          <p className="shrink-0 text-sm font-semibold">
                            {formatarDinheiro(
                              item.precoCentavos,
                            )}
                          </p>
                        </div>
                      </button>
                    ))
                  )
                ) : servicos.length === 0 ? (
                  <div className="border border-border p-4 text-sm text-muted-foreground">
                    Nenhum serviço ativo encontrado.
                  </div>
                ) : (
                  servicos.map((item) => (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => {
                        setServicoId(item.id);
                        removerCupom();
                      }}
                      className={`w-full border p-4 text-left transition ${
                        servicoId === item.id
                          ? "border-gold bg-gold-soft/30"
                          : "border-border bg-surface hover:border-gold/50"
                      }`}
                    >
                      <div className="flex items-center justify-between gap-4">
                        <p className="font-medium">
                          {item.nome}
                        </p>
                        <p className="text-sm font-semibold">
                          {formatarDinheiro(
                            item.precoCentavos,
                          )}
                        </p>
                      </div>
                    </button>
                  ))
                )}
              </div>
            </div>

            {tipoTeste === "SERVICO" && servico && (
              <div className="mt-7 border-t border-border pt-5">
                <p className="text-sm font-medium">
                  Cupom
                </p>
                <p className="mt-1 text-xs leading-5 text-muted-foreground">
                  Cupons gerais podem ser validados agora. Regras
                  dependentes do histórico do cliente serão testadas
                  quando criarmos a conta de teste persistente.
                </p>

                <div className="mt-3 flex flex-col gap-2 sm:flex-row">
                  <input
                    value={cupomDigitado}
                    disabled={Boolean(cupomAplicado)}
                    onChange={(event) =>
                      setCupomDigitado(event.target.value)
                    }
                    placeholder="Ex.: BLACK10"
                    className="h-10 flex-1 rounded-md border border-input bg-background px-3 text-sm uppercase"
                  />

                  {cupomAplicado ? (
                    <Button
                      type="button"
                      variant="outline"
                      onClick={removerCupom}
                    >
                      Remover
                    </Button>
                  ) : (
                    <Button
                      type="button"
                      variant="outline"
                      onClick={aplicarCupom}
                    >
                      Aplicar
                    </Button>
                  )}
                </div>

                {cupomAplicado && (
                  <p className="mt-2 text-xs text-emerald-400">
                    {cupomAplicado.codigo}: -{" "}
                    {formatarDinheiro(
                      cupomAplicado.descontoCentavos,
                    )}
                  </p>
                )}
              </div>
            )}

            <Button
              type="button"
              className="mt-7"
              disabled={!itemSelecionado}
              onClick={() => setEtapa("PAGAMENTO")}
            >
              Continuar
            </Button>
          </div>

          <aside className="border-l border-border pl-6">
            <p className="text-xs font-medium uppercase tracking-[0.16em] text-muted-foreground">
              Cliente de teste
            </p>

            <label className="mt-4 block text-xs font-medium">
              Nome
            </label>
            <input
              value={clienteNome}
              onChange={(event) =>
                setClienteNome(event.target.value)
              }
              className="mt-2 h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
            />

            <label className="mt-4 block text-xs font-medium">
              E-mail
            </label>
            <input
              value={clienteEmail}
              onChange={(event) =>
                setClienteEmail(event.target.value)
              }
              className="mt-2 h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
            />

            <p className="mt-4 text-xs leading-5 text-muted-foreground">
              Estes dados existem apenas nesta simulação. Não é criado
              um usuário no banco.
            </p>
          </aside>
        </section>
      )}

      {etapa === "PAGAMENTO" && itemSelecionado && (
        <section className="grid gap-8 lg:grid-cols-[1fr_320px]">
          <div>
            <p className="text-xs font-medium uppercase tracking-[0.16em] text-gold">
              Visão do cliente
            </p>
            <h2 className="mt-2 text-xl font-semibold">
              Como deseja pagar?
            </h2>

            <button
              type="button"
              className="mt-6 w-full border border-gold bg-gold-soft/30 p-4 text-left"
            >
              <p className="font-medium">Pix pelo site</p>
              <p className="mt-1 text-sm leading-6 text-muted-foreground">
                Gera uma cobrança real dentro da API Sandbox do Banco
                Inter.
              </p>
            </button>

            <div className="mt-3 grid gap-3 sm:grid-cols-2">
              <div className="border border-border p-4 opacity-60">
                <p className="text-sm font-medium">
                  Cartão online
                </p>
                <p className="mt-1 text-xs text-muted-foreground">
                  Em breve
                </p>
              </div>

              <div className="border border-border p-4 opacity-60">
                <p className="text-sm font-medium">
                  Pagar no estabelecimento
                </p>
                <p className="mt-1 text-xs text-muted-foreground">
                  Será conectado à maquininha/agendamento
                </p>
              </div>
            </div>

            <div className="mt-6 flex flex-col gap-3 sm:flex-row">
              <Button
                type="button"
                variant="outline"
                onClick={() => setEtapa("ESCOLHA")}
              >
                Voltar
              </Button>

              <Button
                type="button"
                disabled={processando !== ""}
                onClick={() => void gerarPix()}
              >
                {processando === "COBRAR" && (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                )}
                Gerar Pix de teste
              </Button>
            </div>
          </div>

          <aside className="border-l border-border pl-6">
            <p className="text-xs font-medium uppercase tracking-[0.16em] text-muted-foreground">
              Resumo
            </p>

            <p className="mt-4 text-sm">
              {clienteNome || "Cliente Teste"}
            </p>
            <p className="mt-1 text-xs text-muted-foreground">
              {clienteEmail}
            </p>

            <div className="my-4 border-t border-border" />

            <p className="text-sm font-medium">
              {itemSelecionado.nome}
            </p>
            <p className="mt-1 text-xs text-muted-foreground">
              {tipoTeste === "ASSINATURA"
                ? "Assinatura"
                : "Serviço avulso"}
            </p>

            <div className="my-4 border-t border-border" />

            <div className="space-y-2 text-sm">
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">
                  Subtotal
                </span>
                <span>
                  {formatarDinheiro(valorBaseCentavos)}
                </span>
              </div>

              {descontoCentavos > 0 && (
                <div className="flex items-center justify-between text-emerald-400">
                  <span>
                    Cupom {cupomAplicado?.codigo}
                  </span>
                  <span>
                    - {formatarDinheiro(descontoCentavos)}
                  </span>
                </div>
              )}

              <div className="flex items-center justify-between border-t border-border pt-2">
                <strong>Total</strong>
                <strong>
                  {formatarDinheiro(valorFinalCentavos)}
                </strong>
              </div>
            </div>
          </aside>
        </section>
      )}

      {etapa === "CONFIRMACAO" &&
        cobranca &&
        itemSelecionado && (
          <section className="grid gap-8 lg:grid-cols-[1fr_320px]">
            <div>
              <p className="text-xs font-medium uppercase tracking-[0.16em] text-gold">
                Visão do cliente
              </p>
              <h2 className="mt-2 text-xl font-semibold">
                {pagamentoVisualConcluido
                  ? "Pagamento aprovado"
                  : "Aguardando pagamento"}
              </h2>

              {pagamentoVisualConcluido ? (
                <div
                  className={`mt-6 border-l-2 px-4 py-4 ${
                    pagamentoConfirmadoInter
                      ? "border-emerald-500 bg-emerald-500/5"
                      : "border-amber-500 bg-amber-500/5"
                  }`}
                >
                  <p
                    className={`flex items-center gap-2 font-medium ${
                      pagamentoConfirmadoInter
                        ? "text-emerald-400"
                        : "text-amber-400"
                    }`}
                  >
                    <Check className="h-4 w-4" />
                    {pagamentoConfirmadoInter
                      ? "Confirmado pelo Sandbox do Inter"
                      : "Aprovação visual simulada"}
                  </p>

                  <p className="mt-2 text-sm leading-6 text-muted-foreground">
                    {pagamentoConfirmadoInter
                      ? "A cobrança foi reconhecida pelo Banco Inter."
                      : "Esta aprovação existe apenas nesta tela para o barbeiro validar a experiência final. O Inter não confirmou o pagamento."}
                  </p>
                </div>
              ) : (
                <>
                  <p className="mt-2 text-sm leading-6 text-muted-foreground">
                    Use o Pix abaixo como um cliente faria. O Studio RD
                    consulta automaticamente o Sandbox a cada 10
                    segundos enquanto esta tela estiver aberta.
                  </p>

                  {cobranca.pixCopiaECola ? (
                    <div className="mt-6">
                      <label className="text-xs font-medium text-muted-foreground">
                        Pix copia e cola
                      </label>
                      <textarea
                        readOnly
                        value={cobranca.pixCopiaECola}
                        className="mt-2 min-h-28 w-full rounded-md border border-input bg-background p-3 font-mono text-xs"
                      />

                      <Button
                        type="button"
                        variant="outline"
                        className="mt-3"
                        onClick={() => void copiarPix()}
                      >
                        <Copy className="mr-2 h-4 w-4" />
                        Copiar Pix
                      </Button>
                    </div>
                  ) : (
                    <p className="mt-6 border-l-2 border-amber-500 pl-3 text-sm text-muted-foreground">
                      A cobrança foi criada, mas a resposta do Sandbox
                      não retornou o Pix copia e cola.
                    </p>
                  )}
                </>
              )}

              {!pagamentoConfirmadoInter &&
                !simulacaoAprovada && (
                  <div className="mt-6 border-t border-border pt-5">
                    <div className="flex flex-wrap items-center gap-3">
                      <Button
                        type="button"
                        disabled={processando !== ""}
                        onClick={() =>
                          void atualizarStatus(false)
                        }
                      >
                        {processando === "CONSULTAR" ? (
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        ) : (
                          <RefreshCw className="mr-2 h-4 w-4" />
                        )}
                        Consultar agora
                      </Button>

                      <label className="flex items-center gap-2 text-xs text-muted-foreground">
                        <input
                          type="checkbox"
                          checked={autoAtualizar}
                          onChange={(event) =>
                            setAutoAtualizar(
                              event.target.checked,
                            )
                          }
                        />
                        atualizar automaticamente
                      </label>
                    </div>

                    <button
                      type="button"
                      onClick={simularAprovacaoVisual}
                      className="mt-5 text-xs text-muted-foreground underline underline-offset-4 transition hover:text-foreground"
                    >
                      Simular somente a tela de pagamento aprovado
                    </button>
                    <p className="mt-1 text-xs leading-5 text-muted-foreground/80">
                      Não altera a cobrança e não registra pagamento.
                    </p>
                  </div>
                )}

              {pagamentoVisualConcluido && (
                <div className="mt-6 border-t border-border pt-5">
                  <p className="text-xs font-medium uppercase tracking-[0.16em] text-muted-foreground">
                    No fluxo real, o Studio RD faria
                  </p>

                  <div className="mt-3 space-y-2 text-sm text-muted-foreground">
                    <p>01 · registrar o pagamento vinculado ao cliente;</p>
                    {tipoTeste === "ASSINATURA" ? (
                      <p>02 · ativar ou renovar a assinatura;</p>
                    ) : (
                      <p>02 · vincular o pagamento ao agendamento;</p>
                    )}
                    <p>03 · atualizar financeiro e histórico;</p>
                    <p>04 · mostrar a confirmação ao cliente e ao barbeiro.</p>
                  </div>

                  <p className="mt-4 text-xs leading-5 text-muted-foreground">
                    Essas ações permanecem desligadas nesta versão do
                    Sandbox para não contaminar dados reais.
                  </p>
                </div>
              )}

              <Button
                type="button"
                variant="outline"
                className="mt-6"
                onClick={reiniciar}
              >
                Reiniciar teste
              </Button>
            </div>

            <aside className="border-l border-border pl-6">
              <p className="text-xs font-medium uppercase tracking-[0.16em] text-muted-foreground">
                Diagnóstico do teste
              </p>

              <dl className="mt-4 space-y-4 text-sm">
                <div>
                  <dt className="text-xs text-muted-foreground">
                    Ambiente
                  </dt>
                  <dd className="mt-1">
                    Sandbox (área de testes)
                  </dd>
                </div>

                <div>
                  <dt className="text-xs text-muted-foreground">
                    Cenário
                  </dt>
                  <dd className="mt-1">
                    {tipoTeste === "ASSINATURA"
                      ? "Assinatura"
                      : "Serviço avulso"}
                  </dd>
                </div>

                <div>
                  <dt className="text-xs text-muted-foreground">
                    Item
                  </dt>
                  <dd className="mt-1">
                    {itemSelecionado.nome}
                  </dd>
                </div>

                <div>
                  <dt className="text-xs text-muted-foreground">
                    Valor enviado ao Inter
                  </dt>
                  <dd className="mt-1">
                    {cobranca.valorOriginal
                      ? `R$ ${cobranca.valorOriginal}`
                      : formatarDinheiro(
                          valorFinalCentavos,
                        )}
                  </dd>
                </div>

                {cupomAplicado && (
                  <div>
                    <dt className="text-xs text-muted-foreground">
                      Cupom
                    </dt>
                    <dd className="mt-1">
                      {cupomAplicado.codigo}
                    </dd>
                  </div>
                )}

                <div>
                  <dt className="text-xs text-muted-foreground">
                    Status Inter
                  </dt>
                  <dd className="mt-1 font-medium">
                    {cobranca.status}
                  </dd>
                </div>

                <div>
                  <dt className="text-xs text-muted-foreground">
                    Exibição
                  </dt>
                  <dd className="mt-1">
                    {simulacaoAprovada &&
                    !pagamentoConfirmadoInter
                      ? "Aprovado apenas visualmente"
                      : pagamentoConfirmadoInter
                        ? "Confirmado pelo Inter"
                        : "Aguardando"}
                  </dd>
                </div>

                <div>
                  <dt className="text-xs text-muted-foreground">
                    TXID
                  </dt>
                  <dd className="mt-1 break-all font-mono text-xs">
                    {cobranca.txid}
                  </dd>
                </div>
              </dl>
            </aside>
          </section>
        )}
    </div>
  );
}
