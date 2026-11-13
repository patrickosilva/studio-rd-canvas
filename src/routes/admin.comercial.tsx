import {
  useEffect,
  useMemo,
  useState,
  type FormEvent,
} from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import {
  CalendarClock,
  CheckCircle2,
  Eye,
  EyeOff,
  Pencil,
  Plus,
  Power,
  Sparkles,
  Tag,
  TicketPercent,
} from "lucide-react";

import { PageHeader } from "@/components/dashboard/Sidebar";
import { Button } from "@/components/ui/button";
import {
  adminAlterarStatusCupom,
  adminAtualizarCupom,
  adminCriarCupom,
  adminListarCupons,
  adminListarServicosParaCupom,
} from "@/lib/api/cupons.functions";

export const Route = createFileRoute("/admin/comercial")({
  component: AdminComercialPage,
});

type TipoDesconto = "PERCENTUAL" | "VALOR_FIXO";

type PublicoCupom =
  | "TODOS"
  | "PRIMEIRO_ATENDIMENTO"
  | "ATE_X_ATENDIMENTOS"
  | "MINIMO_X_ATENDIMENTOS"
  | "SEM_ATENDIMENTO_HA_X_DIAS"
  | "ASSINANTE_ATIVO";

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
  tipo: TipoDesconto;
  percentualDesconto: number | null;
  valorDescontoCentavos: number | null;
  limiteDescontoCentavos: number | null;
  valorMinimoCentavos: number | null;
  inicioEm: string | Date | null;
  fimEm: string | Date | null;
  limiteUsos: number | null;
  limitePorCliente: number | null;
  publico: PublicoCupom;
  quantidadeAtendimentos: number | null;
  diasSemAtendimento: number | null;
  aplicaTodosServicos: boolean;
  visivelParaClientes: boolean;
  destaque: boolean;
  combinavelComAssinatura: boolean;
  ativo: boolean;
  criadoEm: string | Date;
  atualizadoEm: string | Date;
  servicos: {
    servico: {
      id: string;
      nome: string;
      ativo: boolean;
    };
  }[];
  _count: {
    usos: number;
  };
};

const opcoesPublico: {
  value: PublicoCupom;
  label: string;
  descricao: string;
}[] = [
  {
    value: "TODOS",
    label: "Todos os clientes",
    descricao: "Qualquer cliente pode usar se cumprir as demais regras.",
  },
  {
    value: "PRIMEIRO_ATENDIMENTO",
    label: "Primeiro atendimento",
    descricao: "Cliente que ainda não possui atendimento concluído.",
  },
  {
    value: "ATE_X_ATENDIMENTOS",
    label: "Clientes novos até X cortes",
    descricao: "Ex.: clientes com no máximo 3 atendimentos concluídos.",
  },
  {
    value: "MINIMO_X_ATENDIMENTOS",
    label: "Clientes fiéis a partir de X cortes",
    descricao: "Ex.: libera após 5 atendimentos concluídos.",
  },
  {
    value: "SEM_ATENDIMENTO_HA_X_DIAS",
    label: "Reativação após X dias",
    descricao: "Para clientes que já vieram, mas estão há um período sem voltar.",
  },
  {
    value: "ASSINANTE_ATIVO",
    label: "Assinantes ativos",
    descricao: "Exclusivo para clientes com assinatura RD ativa.",
  },
];

function formatarDinheiro(centavos: number): string {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(centavos / 100);
}

function dinheiroParaCentavos(
  valor: string,
): number | undefined {
  const limpo = valor.trim();

  if (!limpo) {
    return undefined;
  }

  const numero = Number(
    limpo.replace(/\./g, "").replace(",", "."),
  );

  if (Number.isNaN(numero)) {
    return undefined;
  }

  return Math.round(numero * 100);
}

function centavosParaInput(
  valor: number | null,
): string {
  if (valor === null) {
    return "";
  }

  return (valor / 100)
    .toFixed(2)
    .replace(".", ",");
}

function formatarData(
  valor: string | Date | null,
): string {
  if (!valor) {
    return "Sem limite";
  }

  return new Intl.DateTimeFormat("pt-BR", {
    dateStyle: "short",
    timeStyle: "short",
  }).format(new Date(valor));
}

function paraDateTimeLocal(
  valor: string | Date | null,
): string {
  if (!valor) {
    return "";
  }

  const data = new Date(valor);
  const local = new Date(
    data.getTime() - data.getTimezoneOffset() * 60_000,
  );

  return local.toISOString().slice(0, 16);
}

function paraIsoOpcional(
  valor: string,
): string {
  if (!valor) {
    return "";
  }

  return new Date(valor).toISOString();
}

function obterAgoraLocalInput(): string {
  const agora = new Date();

  const local = new Date(
    agora.getTime() - agora.getTimezoneOffset() * 60_000,
  );

  return local.toISOString().slice(0, 16);
}

function descricaoPublico(
  publico: PublicoCupom,
  quantidade: number | null,
  dias: number | null,
): string {
  switch (publico) {
    case "TODOS":
      return "Todos os clientes";
    case "PRIMEIRO_ATENDIMENTO":
      return "Antes do primeiro atendimento";
    case "ATE_X_ATENDIMENTOS":
      return `Até ${quantidade ?? 0} atendimento(s)`;
    case "MINIMO_X_ATENDIMENTOS":
      return `A partir de ${quantidade ?? 0} atendimento(s)`;
    case "SEM_ATENDIMENTO_HA_X_DIAS":
      return `Sem atendimento há ${dias ?? 0} dia(s)`;
    case "ASSINANTE_ATIVO":
      return "Assinantes ativos";
  }
}

function obterStatusCupom(cupom: Cupom): {
  label: string;
  classe: string;
} {
  if (!cupom.ativo) {
    return {
      label: "Inativo",
      classe:
        "border-border bg-background text-muted-foreground",
    };
  }

  const agora = Date.now();

  if (
    cupom.inicioEm &&
    new Date(cupom.inicioEm).getTime() > agora
  ) {
    return {
      label: "Agendado",
      classe:
        "border-blue-500/30 bg-blue-500/10 text-blue-400",
    };
  }

  if (
    cupom.fimEm &&
    new Date(cupom.fimEm).getTime() < agora
  ) {
    return {
      label: "Expirado",
      classe:
        "border-destructive/30 bg-destructive/10 text-destructive",
    };
  }

  return {
    label: "Ativo",
    classe:
      "border-emerald-500/30 bg-emerald-500/10 text-emerald-400",
  };
}

function descricaoDesconto(cupom: Cupom): string {
  if (
    cupom.tipo === "PERCENTUAL" &&
    cupom.percentualDesconto
  ) {
    const teto = cupom.limiteDescontoCentavos
      ? ` · máximo ${formatarDinheiro(
          cupom.limiteDescontoCentavos,
        )}`
      : "";

    return `${cupom.percentualDesconto}% de desconto${teto}`;
  }

  if (
    cupom.tipo === "VALOR_FIXO" &&
    cupom.valorDescontoCentavos
  ) {
    return `${formatarDinheiro(
      cupom.valorDescontoCentavos,
    )} de desconto`;
  }

  return "Desconto não configurado";
}

function AdminComercialPage() {
  const listarCupons = useServerFn(adminListarCupons);
  const listarServicos = useServerFn(
    adminListarServicosParaCupom,
  );
  const criarCupom = useServerFn(adminCriarCupom);
  const atualizarCupom = useServerFn(adminAtualizarCupom);
  const alterarStatus = useServerFn(adminAlterarStatusCupom);

  const [cupons, setCupons] = useState<Cupom[]>([]);
  const [servicos, setServicos] = useState<Servico[]>([]);

  const [editandoId, setEditandoId] = useState("");
  const [codigo, setCodigo] = useState("");
  const [descricao, setDescricao] = useState("");
  const [campanha, setCampanha] = useState("");
  const [tipo, setTipo] =
    useState<TipoDesconto>("PERCENTUAL");
  const [percentual, setPercentual] = useState("10");
  const [valorDesconto, setValorDesconto] = useState("");
  const [limiteDesconto, setLimiteDesconto] = useState("");
  const [valorMinimo, setValorMinimo] = useState("");
  const [inicioEm, setInicioEm] = useState("");
  const [inicioImediato, setInicioImediato] = useState(true);
  const [fimEm, setFimEm] = useState("");
  const [limiteUsos, setLimiteUsos] = useState("");
  const [limitePorCliente, setLimitePorCliente] =
    useState("1");
  const [publico, setPublico] =
    useState<PublicoCupom>("TODOS");
  const [
    quantidadeAtendimentos,
    setQuantidadeAtendimentos,
  ] = useState("");
  const [diasSemAtendimento, setDiasSemAtendimento] =
    useState("");
  const [aplicaTodosServicos, setAplicaTodosServicos] =
    useState(true);
  const [servicoIds, setServicoIds] = useState<string[]>([]);
  const [visivelParaClientes, setVisivelParaClientes] =
    useState(true);
  const [destaque, setDestaque] = useState(false);
  const [
    combinavelComAssinatura,
    setCombinavelComAssinatura,
  ] = useState(false);
  const [ativo, setAtivo] = useState(true);

  const [carregando, setCarregando] = useState(true);
  const [salvando, setSalvando] = useState(false);
  const [alterandoStatusId, setAlterandoStatusId] =
    useState("");
  const [mensagem, setMensagem] = useState("");
  const [erro, setErro] = useState("");

  async function carregarDados() {
    setCarregando(true);
    setErro("");

    try {
      const [cuponsResposta, servicosResposta] =
        await Promise.all([
          listarCupons(),
          listarServicos(),
        ]);

      setCupons(cuponsResposta);
      setServicos(servicosResposta);
    } catch (error) {
      console.error(error);
      setErro("Não foi possível carregar a área comercial.");
    } finally {
      setCarregando(false);
    }
  }

  useEffect(() => {
    void carregarDados();
  }, []);

  const resumo = useMemo(() => {
    const status = cupons.map(obterStatusCupom);

    return {
      total: cupons.length,
      ativos: status.filter(
        (item) => item.label === "Ativo",
      ).length,
      agendados: status.filter(
        (item) => item.label === "Agendado",
      ).length,
      usos: cupons.reduce(
        (total, cupom) => total + cupom._count.usos,
        0,
      ),
    };
  }, [cupons]);

  const publicoSelecionado = opcoesPublico.find(
    (opcao) => opcao.value === publico,
  );

  function limparFormulario() {
    setEditandoId("");
    setCodigo("");
    setDescricao("");
    setCampanha("");
    setTipo("PERCENTUAL");
    setPercentual("10");
    setValorDesconto("");
    setLimiteDesconto("");
    setValorMinimo("");
    setInicioEm("");
    setInicioImediato(true);
    setFimEm("");
    setLimiteUsos("");
    setLimitePorCliente("1");
    setPublico("TODOS");
    setQuantidadeAtendimentos("");
    setDiasSemAtendimento("");
    setAplicaTodosServicos(true);
    setServicoIds([]);
    setVisivelParaClientes(true);
    setDestaque(false);
    setCombinavelComAssinatura(false);
    setAtivo(true);
  }

  function editarCupom(cupom: Cupom) {
    setEditandoId(cupom.id);
    setCodigo(cupom.codigo);
    setDescricao(cupom.descricao ?? "");
    setCampanha(cupom.campanha ?? "");
    setTipo(cupom.tipo);
    setPercentual(
      cupom.percentualDesconto
        ? String(cupom.percentualDesconto)
        : "",
    );
    setValorDesconto(
      centavosParaInput(cupom.valorDescontoCentavos),
    );
    setLimiteDesconto(
      centavosParaInput(cupom.limiteDescontoCentavos),
    );
    setValorMinimo(
      centavosParaInput(cupom.valorMinimoCentavos),
    );
    setInicioEm(paraDateTimeLocal(cupom.inicioEm));
    setInicioImediato(false);
    setFimEm(paraDateTimeLocal(cupom.fimEm));
    setLimiteUsos(
      cupom.limiteUsos
        ? String(cupom.limiteUsos)
        : "",
    );
    setLimitePorCliente(
      cupom.limitePorCliente
        ? String(cupom.limitePorCliente)
        : "",
    );
    setPublico(cupom.publico);
    setQuantidadeAtendimentos(
      cupom.quantidadeAtendimentos === null
        ? ""
        : String(cupom.quantidadeAtendimentos),
    );
    setDiasSemAtendimento(
      cupom.diasSemAtendimento === null
        ? ""
        : String(cupom.diasSemAtendimento),
    );
    setAplicaTodosServicos(
      cupom.aplicaTodosServicos,
    );
    setServicoIds(
      cupom.servicos.map(
        (relacao) => relacao.servico.id,
      ),
    );
    setVisivelParaClientes(cupom.visivelParaClientes);
    setDestaque(cupom.destaque);
    setCombinavelComAssinatura(
      cupom.combinavelComAssinatura,
    );
    setAtivo(cupom.ativo);

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  }

  function alternarServico(servicoId: string) {
    setServicoIds((atuais) =>
      atuais.includes(servicoId)
        ? atuais.filter((id) => id !== servicoId)
        : [...atuais, servicoId],
    );
  }

  async function handleSalvar(
    event: FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();
    setMensagem("");
    setErro("");
    setSalvando(true);

    try {
      const base = {
        codigo,
        descricao,
        campanha,
        tipo,
        percentualDesconto:
          tipo === "PERCENTUAL"
            ? Number(percentual)
            : undefined,
        valorDescontoCentavos:
          tipo === "VALOR_FIXO"
            ? dinheiroParaCentavos(valorDesconto)
            : undefined,
        limiteDescontoCentavos:
          tipo === "PERCENTUAL"
            ? dinheiroParaCentavos(limiteDesconto)
            : undefined,
        valorMinimoCentavos:
          dinheiroParaCentavos(valorMinimo),
        inicioEm: inicioImediato
          ? new Date().toISOString()
          : paraIsoOpcional(inicioEm),
        inicioImediato,
        fimEm: paraIsoOpcional(fimEm),
        limiteUsos: limiteUsos
          ? Number(limiteUsos)
          : undefined,
        limitePorCliente: limitePorCliente
          ? Number(limitePorCliente)
          : undefined,
        publico,
        quantidadeAtendimentos:
          quantidadeAtendimentos
            ? Number(quantidadeAtendimentos)
            : undefined,
        diasSemAtendimento:
          diasSemAtendimento
            ? Number(diasSemAtendimento)
            : undefined,
        aplicaTodosServicos,
        servicoIds: aplicaTodosServicos
          ? []
          : servicoIds,
        visivelParaClientes,
        destaque:
          visivelParaClientes && destaque,
        combinavelComAssinatura,
        ativo,
      };

      const resultado = editandoId
        ? await atualizarCupom({
            data: {
              cupomId: editandoId,
              ...base,
            },
          })
        : await criarCupom({
            data: base,
          });

      if (!resultado.sucesso) {
        setErro(resultado.mensagem);
        return;
      }

      setMensagem(resultado.mensagem);
      limparFormulario();
      await carregarDados();
    } catch (error) {
      console.error(error);
      setErro("Não foi possível salvar o cupom.");
    } finally {
      setSalvando(false);
    }
  }

  async function handleAlterarStatus(
    cupom: Cupom,
  ) {
    setMensagem("");
    setErro("");
    setAlterandoStatusId(cupom.id);

    try {
      const resultado = await alterarStatus({
        data: {
          cupomId: cupom.id,
          ativo: !cupom.ativo,
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
      setErro("Não foi possível alterar o cupom.");
    } finally {
      setAlterandoStatusId("");
    }
  }

  return (
    <div className="max-w-7xl p-4 sm:p-8 lg:p-12">
      <PageHeader
        title="Comercial"
        subtitle="Crie campanhas, defina quem pode usar cada cupom e controle sua exposição para os clientes."
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

      <div className="mb-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {[
          {
            label: "Cupons",
            valor: resumo.total,
            icon: TicketPercent,
          },
          {
            label: "Ativos",
            valor: resumo.ativos,
            icon: CheckCircle2,
          },
          {
            label: "Agendados",
            valor: resumo.agendados,
            icon: CalendarClock,
          },
          {
            label: "Usos",
            valor: resumo.usos,
            icon: Sparkles,
          },
        ].map((card) => (
          <section
            key={card.label}
            className="rounded-2xl border border-border bg-surface p-5"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs uppercase tracking-widest text-muted-foreground">
                {card.label}
              </span>
              <card.icon className="h-4 w-4 text-gold" />
            </div>
            <div className="mt-3 text-3xl font-display">
              {carregando ? "..." : card.valor}
            </div>
          </section>
        ))}
      </div>

      <div className="grid gap-6 xl:grid-cols-[0.9fr_1.1fr]">
        <section className="self-start rounded-3xl border border-border bg-surface p-5 sm:p-6 xl:sticky xl:top-6">
          <div className="mb-5">
            <h2 className="text-lg font-display">
              {editandoId
                ? "Editar cupom"
                : "Novo cupom"}
            </h2>
            <p className="mt-1 text-sm text-muted-foreground">
              O próximo passo conectará essas regras diretamente ao agendamento.
            </p>
          </div>

          <form
            className="space-y-5"
            onSubmit={handleSalvar}
          >
            <div className="grid gap-2">
              <label
                htmlFor="codigo"
                className="text-sm font-medium"
              >
                Código
              </label>
              <input
                id="codigo"
                value={codigo}
                onChange={(event) =>
                  setCodigo(
                    event.target.value
                      .toUpperCase()
                      .replace(/\s+/g, ""),
                  )
                }
                placeholder="EX.: HALLOWEEN20"
                maxLength={30}
                className="h-11 rounded-xl border border-input bg-background px-3 text-sm uppercase outline-none transition focus:border-gold"
                required
              />
            </div>

            <div className="grid gap-2">
              <label
                htmlFor="campanha"
                className="text-sm font-medium"
              >
                Campanha / evento
              </label>
              <input
                id="campanha"
                value={campanha}
                onChange={(event) =>
                  setCampanha(event.target.value)
                }
                placeholder="Ex.: Halloween 2026, Black Friday, Dia dos Pais"
                maxLength={80}
                className="h-11 rounded-xl border border-input bg-background px-3 text-sm"
              />
            </div>

            <div className="grid gap-2">
              <label
                htmlFor="descricao"
                className="text-sm font-medium"
              >
                Descrição
              </label>
              <input
                id="descricao"
                value={descricao}
                onChange={(event) =>
                  setDescricao(event.target.value)
                }
                placeholder="Ex.: 20% para a campanha de Halloween."
                maxLength={300}
                className="h-11 rounded-xl border border-input bg-background px-3 text-sm"
              />
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              <div className="grid gap-2">
                <label className="text-sm font-medium">
                  Tipo de desconto
                </label>
                <select
                  value={tipo}
                  onChange={(event) =>
                    setTipo(
                      event.target.value as TipoDesconto,
                    )
                  }
                  className="h-11 rounded-xl border border-input bg-background px-3 text-sm"
                >
                  <option value="PERCENTUAL">
                    Percentual
                  </option>
                  <option value="VALOR_FIXO">
                    Valor fixo
                  </option>
                </select>
              </div>

              {tipo === "PERCENTUAL" ? (
                <div className="grid gap-2">
                  <label
                    htmlFor="percentual"
                    className="text-sm font-medium"
                  >
                    Desconto (%)
                  </label>
                  <input
                    id="percentual"
                    type="number"
                    min={1}
                    max={100}
                    value={percentual}
                    onChange={(event) =>
                      setPercentual(event.target.value)
                    }
                    className="h-11 rounded-xl border border-input bg-background px-3 text-sm"
                    required
                  />
                </div>
              ) : (
                <div className="grid gap-2">
                  <label
                    htmlFor="valorDesconto"
                    className="text-sm font-medium"
                  >
                    Desconto (R$)
                  </label>
                  <input
                    id="valorDesconto"
                    inputMode="decimal"
                    value={valorDesconto}
                    onChange={(event) =>
                      setValorDesconto(
                        event.target.value,
                      )
                    }
                    placeholder="10,00"
                    className="h-11 rounded-xl border border-input bg-background px-3 text-sm"
                    required
                  />
                </div>
              )}
            </div>

            {tipo === "PERCENTUAL" && (
              <div className="grid gap-2">
                <label
                  htmlFor="limiteDesconto"
                  className="text-sm font-medium"
                >
                  Teto do desconto (opcional)
                </label>
                <input
                  id="limiteDesconto"
                  inputMode="decimal"
                  value={limiteDesconto}
                  onChange={(event) =>
                    setLimiteDesconto(event.target.value)
                  }
                  placeholder="Ex.: máximo R$ 20,00"
                  className="h-11 rounded-xl border border-input bg-background px-3 text-sm"
                />
              </div>
            )}

            <div className="grid gap-2">
              <label
                htmlFor="valorMinimo"
                className="text-sm font-medium"
              >
                Valor mínimo do serviço (opcional)
              </label>
              <input
                id="valorMinimo"
                inputMode="decimal"
                value={valorMinimo}
                onChange={(event) =>
                  setValorMinimo(event.target.value)
                }
                placeholder="Ex.: 50,00"
                className="h-11 rounded-xl border border-input bg-background px-3 text-sm"
              />
            </div>

            <div className="rounded-2xl border border-border bg-background/40 p-4">
              <label className="flex cursor-pointer items-center justify-between gap-4">
                <span>
                  <span className="block text-sm font-medium">
                    Começar agora
                  </span>
                  <span className="mt-1 block text-xs text-muted-foreground">
                    Usa o horário atual do dispositivo ao salvar.
                  </span>
                </span>
                <input
                  type="checkbox"
                  checked={inicioImediato}
                  onChange={(event) => {
                    const checked = event.target.checked;
                    setInicioImediato(checked);

                    if (checked) {
                      setInicioEm(obterAgoraLocalInput());
                    }
                  }}
                  className="h-5 w-5 accent-primary"
                />
              </label>

              {!inicioImediato && (
                <div className="mt-4 grid gap-2">
                  <label
                    htmlFor="inicioEm"
                    className="text-sm font-medium"
                  >
                    Início programado
                  </label>
                  <input
                    id="inicioEm"
                    type="datetime-local"
                    value={inicioEm}
                    onChange={(event) =>
                      setInicioEm(event.target.value)
                    }
                    className="h-11 rounded-xl border border-input bg-background px-3 text-sm"
                  />
                </div>
              )}
            </div>

            <div className="grid gap-2">
              <label
                htmlFor="fimEm"
                className="text-sm font-medium"
              >
                Validade final (opcional)
              </label>
              <input
                id="fimEm"
                type="datetime-local"
                value={fimEm}
                onChange={(event) =>
                  setFimEm(event.target.value)
                }
                className="h-11 rounded-xl border border-input bg-background px-3 text-sm"
              />
            </div>

            <div className="rounded-2xl border border-gold/20 bg-gold-soft/40 p-4">
              <label className="text-sm font-medium">
                Quem pode usar?
              </label>

              <select
                value={publico}
                onChange={(event) => {
                  setPublico(
                    event.target.value as PublicoCupom,
                  );
                  setQuantidadeAtendimentos("");
                  setDiasSemAtendimento("");
                }}
                className="mt-3 h-11 w-full rounded-xl border border-input bg-background px-3 text-sm"
              >
                {opcoesPublico.map((opcao) => (
                  <option
                    key={opcao.value}
                    value={opcao.value}
                  >
                    {opcao.label}
                  </option>
                ))}
              </select>

              <p className="mt-2 text-xs leading-5 text-muted-foreground">
                {publicoSelecionado?.descricao}
              </p>

              {(publico === "ATE_X_ATENDIMENTOS" ||
                publico === "MINIMO_X_ATENDIMENTOS") && (
                <div className="mt-3 grid gap-2">
                  <label
                    htmlFor="quantidadeAtendimentos"
                    className="text-sm font-medium"
                  >
                    Quantidade de atendimentos
                  </label>
                  <input
                    id="quantidadeAtendimentos"
                    type="number"
                    min={0}
                    value={quantidadeAtendimentos}
                    onChange={(event) =>
                      setQuantidadeAtendimentos(
                        event.target.value,
                      )
                    }
                    className="h-11 rounded-xl border border-input bg-background px-3 text-sm"
                    required
                  />
                </div>
              )}

              {publico ===
                "SEM_ATENDIMENTO_HA_X_DIAS" && (
                <div className="mt-3 grid gap-2">
                  <label
                    htmlFor="diasSemAtendimento"
                    className="text-sm font-medium"
                  >
                    Dias sem atendimento
                  </label>
                  <input
                    id="diasSemAtendimento"
                    type="number"
                    min={1}
                    value={diasSemAtendimento}
                    onChange={(event) =>
                      setDiasSemAtendimento(
                        event.target.value,
                      )
                    }
                    className="h-11 rounded-xl border border-input bg-background px-3 text-sm"
                    required
                  />
                </div>
              )}
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              <div className="grid gap-2">
                <label
                  htmlFor="limiteUsos"
                  className="text-sm font-medium"
                >
                  Limite total (opcional)
                </label>
                <input
                  id="limiteUsos"
                  type="number"
                  min={1}
                  value={limiteUsos}
                  onChange={(event) =>
                    setLimiteUsos(event.target.value)
                  }
                  placeholder="Ex.: 100"
                  className="h-11 rounded-xl border border-input bg-background px-3 text-sm"
                />
              </div>

              <div className="grid gap-2">
                <label
                  htmlFor="limitePorCliente"
                  className="text-sm font-medium"
                >
                  Por cliente (opcional)
                </label>
                <input
                  id="limitePorCliente"
                  type="number"
                  min={1}
                  value={limitePorCliente}
                  onChange={(event) =>
                    setLimitePorCliente(
                      event.target.value,
                    )
                  }
                  placeholder="Ex.: 1"
                  className="h-11 rounded-xl border border-input bg-background px-3 text-sm"
                />
              </div>
            </div>

            <label className="flex cursor-pointer items-center gap-3 rounded-xl border border-border bg-background/40 p-3 text-sm">
              <input
                type="checkbox"
                checked={aplicaTodosServicos}
                onChange={(event) => {
                  setAplicaTodosServicos(
                    event.target.checked,
                  );

                  if (event.target.checked) {
                    setServicoIds([]);
                  }
                }}
                className="h-4 w-4 accent-primary"
              />
              Aplicar a todos os serviços
            </label>

            {!aplicaTodosServicos && (
              <div className="max-h-64 overflow-y-auto rounded-xl border border-border bg-background/40 p-3">
                <p className="mb-3 text-sm font-medium">
                  Serviços participantes
                </p>

                <div className="space-y-2">
                  {servicos.map((servico) => (
                    <label
                      key={servico.id}
                      className="flex cursor-pointer items-center justify-between gap-3 rounded-lg border border-border px-3 py-2 text-sm"
                    >
                      <span>
                        {servico.nome}
                        <span className="ml-2 text-xs text-muted-foreground">
                          {formatarDinheiro(
                            servico.precoCentavos,
                          )}
                        </span>
                      </span>
                      <input
                        type="checkbox"
                        checked={servicoIds.includes(
                          servico.id,
                        )}
                        onChange={() =>
                          alternarServico(servico.id)
                        }
                        className="h-4 w-4 accent-primary"
                      />
                    </label>
                  ))}
                </div>
              </div>
            )}

            <div className="space-y-2">
              <label className="flex cursor-pointer items-center justify-between gap-4 rounded-xl border border-border bg-background/40 p-3">
                <span className="flex items-center gap-3 text-sm">
                  {visivelParaClientes ? (
                    <Eye className="h-4 w-4 text-gold" />
                  ) : (
                    <EyeOff className="h-4 w-4 text-muted-foreground" />
                  )}
                  Visível na aba Cupons do cliente
                </span>
                <input
                  type="checkbox"
                  checked={visivelParaClientes}
                  onChange={(event) => {
                    setVisivelParaClientes(
                      event.target.checked,
                    );

                    if (!event.target.checked) {
                      setDestaque(false);
                    }
                  }}
                  className="h-4 w-4 accent-primary"
                />
              </label>

              {visivelParaClientes && (
                <label className="flex cursor-pointer items-center justify-between gap-4 rounded-xl border border-border bg-background/40 p-3 text-sm">
                  Destacar este cupom para o cliente
                  <input
                    type="checkbox"
                    checked={destaque}
                    onChange={(event) =>
                      setDestaque(event.target.checked)
                    }
                    className="h-4 w-4 accent-primary"
                  />
                </label>
              )}

              <label className="flex cursor-pointer items-center justify-between gap-4 rounded-xl border border-border bg-background/40 p-3 text-sm">
                Permitir junto com assinatura
                <input
                  type="checkbox"
                  checked={combinavelComAssinatura}
                  onChange={(event) =>
                    setCombinavelComAssinatura(
                      event.target.checked,
                    )
                  }
                  className="h-4 w-4 accent-primary"
                />
              </label>

              <label className="flex cursor-pointer items-center justify-between gap-4 rounded-xl border border-border bg-background/40 p-3 text-sm">
                Cupom ativo
                <input
                  type="checkbox"
                  checked={ativo}
                  onChange={(event) =>
                    setAtivo(event.target.checked)
                  }
                  className="h-4 w-4 accent-primary"
                />
              </label>
            </div>

            <div className="flex flex-col gap-2 sm:flex-row">
              <Button
                type="submit"
                disabled={salvando}
                className="h-11 flex-1 rounded-xl"
              >
                {editandoId ? (
                  <Pencil className="mr-2 h-4 w-4" />
                ) : (
                  <Plus className="mr-2 h-4 w-4" />
                )}
                {salvando
                  ? "Salvando..."
                  : editandoId
                    ? "Salvar alterações"
                    : "Criar cupom"}
              </Button>

              {editandoId && (
                <Button
                  type="button"
                  variant="outline"
                  onClick={limparFormulario}
                  className="h-11 rounded-xl"
                >
                  Cancelar edição
                </Button>
              )}
            </div>
          </form>
        </section>

        <section className="rounded-3xl border border-border bg-surface p-5 sm:p-6">
          <div className="mb-5 flex items-center justify-between gap-3">
            <div>
              <h2 className="text-lg font-display">
                Cupons cadastrados
              </h2>
              <p className="mt-1 text-sm text-muted-foreground">
                Desative sem apagar para preservar o histórico comercial.
              </p>
            </div>
            <TicketPercent className="h-5 w-5 text-gold" />
          </div>

          {carregando ? (
            <p className="text-sm text-muted-foreground">
              Carregando cupons...
            </p>
          ) : cupons.length === 0 ? (
            <div className="flex min-h-56 flex-col items-center justify-center rounded-2xl border border-border bg-background/40 p-6 text-center">
              <TicketPercent className="h-10 w-10 text-muted-foreground" />
              <h3 className="mt-4 font-medium">
                Nenhum cupom criado
              </h3>
            </div>
          ) : (
            <div className="space-y-3">
              {cupons.map((cupom) => {
                const status = obterStatusCupom(cupom);

                return (
                  <article
                    key={cupom.id}
                    className={`rounded-2xl border bg-background/40 p-4 ${
                      cupom.destaque
                        ? "border-gold/50"
                        : "border-border"
                    }`}
                  >
                    <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                      <div className="min-w-0">
                        <div className="flex flex-wrap items-center gap-2">
                          <strong className="font-mono text-base text-gold">
                            {cupom.codigo}
                          </strong>

                          <span
                            className={`rounded-full border px-2.5 py-1 text-xs ${status.classe}`}
                          >
                            {status.label}
                          </span>

                          {cupom.campanha && (
                            <span className="rounded-full border border-gold/30 bg-gold-soft px-2.5 py-1 text-xs text-gold">
                              {cupom.campanha}
                            </span>
                          )}

                          {!cupom.visivelParaClientes && (
                            <span className="rounded-full border border-border px-2.5 py-1 text-xs text-muted-foreground">
                              Privado
                            </span>
                          )}
                        </div>

                        <p className="mt-2 font-medium">
                          {descricaoDesconto(cupom)}
                        </p>

                        {cupom.descricao && (
                          <p className="mt-1 text-sm text-muted-foreground">
                            {cupom.descricao}
                          </p>
                        )}

                        <div className="mt-3 grid gap-1 text-xs text-muted-foreground">
                          <span>
                            Público:{" "}
                            {descricaoPublico(
                              cupom.publico,
                              cupom.quantidadeAtendimentos,
                              cupom.diasSemAtendimento,
                            )}
                          </span>
                          <span>
                            Período: {formatarData(cupom.inicioEm)} →{" "}
                            {formatarData(cupom.fimEm)}
                          </span>
                          <span>
                            Uso: {cupom._count.usos}
                            {cupom.limiteUsos
                              ? ` / ${cupom.limiteUsos}`
                              : " / sem limite"}
                            {" · "}
                            {cupom.limitePorCliente
                              ? `${cupom.limitePorCliente} por cliente`
                              : "sem limite por cliente"}
                          </span>
                          <span>
                            Serviços:{" "}
                            {cupom.aplicaTodosServicos
                              ? "todos"
                              : cupom.servicos
                                  .map(
                                    (relacao) =>
                                      relacao.servico.nome,
                                  )
                                  .join(", ")}
                          </span>
                        </div>
                      </div>

                      <div className="flex shrink-0 gap-2">
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => editarCupom(cupom)}
                        >
                          <Pencil className="mr-2 h-4 w-4" />
                          Editar
                        </Button>

                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          disabled={
                            alterandoStatusId === cupom.id
                          }
                          onClick={() =>
                            void handleAlterarStatus(cupom)
                          }
                          className={
                            cupom.ativo
                              ? "border-destructive/40 text-destructive hover:bg-destructive/10"
                              : "border-emerald-500/40 text-emerald-400 hover:bg-emerald-500/10"
                          }
                        >
                          <Power className="mr-2 h-4 w-4" />
                          {alterandoStatusId === cupom.id
                            ? "Alterando..."
                            : cupom.ativo
                              ? "Desativar"
                              : "Ativar"}
                        </Button>
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}