import { jsxs, jsx } from "react/jsx-runtime";
import { useState, useEffect, useMemo } from "react";
import { u as useServerFn } from "./useServerFn-DL2oePlL.js";
import { Crown, Scissors, Receipt, Ban, Plus, Trash2, UserRound, CreditCard } from "lucide-react";
import { P as PageHeader } from "./Sidebar-D9rUF8JL.js";
import { B as Button } from "./button-DjOZMqFS.js";
import { b as adminListarPlanosAssinatura, c as adminCriarPlanoAssinatura, d as adminDesativarPlanoAssinatura, e as adminListarClientesParaAssinatura, f as adminListarAssinaturas, g as adminAtivarAssinaturaCliente, h as adminCancelarAssinaturaCliente } from "./assinatura.functions-IMPsAmw2.js";
import "@tanstack/react-router";
import "@radix-ui/react-slot";
import "class-variance-authority";
import "clsx";
import "tailwind-merge";
import "./router-CUHN8dl0.js";
import "@tanstack/react-query";
import "./server-n3LmVJQm.js";
import "node:async_hooks";
import "h3-v2";
import "@tanstack/router-core";
import "seroval";
import "@tanstack/history";
import "@tanstack/router-core/ssr/client";
import "@tanstack/router-core/ssr/server";
import "@tanstack/react-router/ssr/server";
import "zod";
function formatarDinheiro(centavos) {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL"
  }).format(centavos / 100);
}
function formatarData(valor) {
  return new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric"
  }).format(new Date(valor));
}
function dinheiroParaCentavos(valor) {
  const numero = Number(valor.trim().replace(/\./g, "").replace(",", "."));
  if (Number.isNaN(numero)) {
    return 0;
  }
  return Math.round(numero * 100);
}
function statusClasse(status) {
  if (status === "ATIVA") {
    return "border-emerald-500/30 bg-emerald-500/10 text-emerald-400";
  }
  if (status === "CANCELADA") {
    return "border-destructive/30 bg-destructive/10 text-destructive";
  }
  return "border-border bg-background text-muted-foreground";
}
function formaPagamentoLabel(forma) {
  const labels = {
    PIX: "Pix",
    DINHEIRO: "Dinheiro",
    CARTAO_DEBITO: "Cartão de débito",
    CARTAO_CREDITO: "Cartão de crédito",
    ASSINATURA: "Assinatura",
    CORTESIA: "Cortesia",
    OUTRO: "Outro"
  };
  return labels[forma];
}
function AdminAssinaturasPage() {
  const listarPlanos = useServerFn(adminListarPlanosAssinatura);
  const criarPlano = useServerFn(adminCriarPlanoAssinatura);
  const desativarPlano = useServerFn(adminDesativarPlanoAssinatura);
  const listarClientes = useServerFn(adminListarClientesParaAssinatura);
  const listarAssinaturas = useServerFn(adminListarAssinaturas);
  const ativarAssinatura = useServerFn(adminAtivarAssinaturaCliente);
  const cancelarAssinatura = useServerFn(adminCancelarAssinaturaCliente);
  const [planos, setPlanos] = useState([]);
  const [clientes, setClientes] = useState([]);
  const [assinaturas, setAssinaturas] = useState([]);
  const [nomePlano, setNomePlano] = useState("RD Black Mensal");
  const [descricaoPlano, setDescricaoPlano] = useState("Plano mensal com cortes inclusos e benefícios exclusivos.");
  const [precoPlano, setPrecoPlano] = useState("99,90");
  const [cortesPorCiclo, setCortesPorCiclo] = useState("2");
  const [duracaoDias, setDuracaoDias] = useState("30");
  const [clienteId, setClienteId] = useState("");
  const [planoId, setPlanoId] = useState("");
  const [vigenciaInicio, setVigenciaInicio] = useState("");
  const [formaPagamento, setFormaPagamento] = useState("PIX");
  const [valorPago, setValorPago] = useState("");
  const [observacaoAssinatura, setObservacaoAssinatura] = useState("");
  const [assinaturaCancelamentoId, setAssinaturaCancelamentoId] = useState("");
  const [observacaoCancelamento, setObservacaoCancelamento] = useState("");
  const [carregando, setCarregando] = useState(true);
  const [salvandoPlano, setSalvandoPlano] = useState(false);
  const [ativando, setAtivando] = useState(false);
  const [cancelandoId, setCancelandoId] = useState("");
  const [removendoPlanoId, setRemovendoPlanoId] = useState("");
  const [mensagem, setMensagem] = useState("");
  const [erro, setErro] = useState("");
  async function carregarDados() {
    setCarregando(true);
    setErro("");
    try {
      const [planosResposta, clientesResposta, assinaturasResposta] = await Promise.all([listarPlanos(), listarClientes(), listarAssinaturas()]);
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
    const ativas = assinaturas.filter((assinatura) => assinatura.status === "ATIVA");
    const canceladas = assinaturas.filter((assinatura) => assinatura.status === "CANCELADA");
    const saldoTotal = ativas.reduce((total, assinatura) => total + assinatura.saldoCortes, 0);
    const receitaTotal = assinaturas.reduce((total, assinatura) => {
      const pagamentos = assinatura.pagamentos.reduce((subtotal, pagamento) => subtotal + pagamento.valorCentavos, 0);
      return total + pagamentos;
    }, 0);
    return {
      ativas: ativas.length,
      canceladas: canceladas.length,
      saldoTotal,
      receitaTotal
    };
  }, [assinaturas]);
  const planoSelecionado = planos.find((plano) => plano.id === planoId);
  useEffect(() => {
    if (!planoSelecionado) {
      return;
    }
    setValorPago((planoSelecionado.precoCentavos / 100).toFixed(2).replace(".", ","));
  }, [planoSelecionado]);
  async function handleCriarPlano(event) {
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
          ativo: true
        }
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
  async function handleDesativarPlano(plano) {
    const confirmar = window.confirm(`Tem certeza que deseja excluir o plano "${plano.nome}"? Ele ficará indisponível para novas assinaturas.`);
    if (!confirmar) {
      return;
    }
    setMensagem("");
    setErro("");
    setRemovendoPlanoId(plano.id);
    try {
      const resultado = await desativarPlano({
        data: {
          planoId: plano.id
        }
      });
      if (!resultado.sucesso) {
        setErro(resultado.mensagem);
        return;
      }
      setMensagem(resultado.mensagem);
      await carregarDados();
    } catch (error) {
      console.error(error);
      setErro("Não foi possível excluir o plano.");
    } finally {
      setRemovendoPlanoId("");
    }
  }
  async function handleAtivarAssinatura(event) {
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
          formaPagamento: formaPagamento || void 0,
          valorPagoCentavos: valorPago ? dinheiroParaCentavos(valorPago) : void 0,
          observacao: observacaoAssinatura
        }
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
  function abrirModalCancelamento(assinaturaId) {
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
          observacao: observacaoCancelamento
        }
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
  return /* @__PURE__ */ jsxs("div", { className: "max-w-7xl p-8 lg:p-12", children: [
    /* @__PURE__ */ jsx(PageHeader, { title: "Assinaturas", subtitle: "Gerencie planos, clientes assinantes, pagamentos e saldo de cortes." }),
    erro && /* @__PURE__ */ jsx("div", { role: "alert", className: "mb-6 rounded-xl border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive", children: erro }),
    mensagem && /* @__PURE__ */ jsx("div", { className: "mb-6 rounded-xl border border-gold/30 bg-gold-soft px-4 py-3 text-sm text-gold", children: mensagem }),
    /* @__PURE__ */ jsxs("div", { className: "mb-8 grid gap-4 md:grid-cols-4", children: [
      /* @__PURE__ */ jsxs("section", { className: "rounded-2xl border border-border bg-surface p-5", children: [
        /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between", children: [
          /* @__PURE__ */ jsx("span", { className: "text-xs uppercase tracking-widest text-muted-foreground", children: "Ativas" }),
          /* @__PURE__ */ jsx(Crown, { className: "h-4 w-4 text-gold" })
        ] }),
        /* @__PURE__ */ jsx("div", { className: "mt-3 text-3xl font-display", children: carregando ? "..." : resumo.ativas }),
        /* @__PURE__ */ jsx("p", { className: "mt-1 text-xs text-muted-foreground", children: "assinaturas ativas" })
      ] }),
      /* @__PURE__ */ jsxs("section", { className: "rounded-2xl border border-border bg-surface p-5", children: [
        /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between", children: [
          /* @__PURE__ */ jsx("span", { className: "text-xs uppercase tracking-widest text-muted-foreground", children: "Saldo" }),
          /* @__PURE__ */ jsx(Scissors, { className: "h-4 w-4 text-gold" })
        ] }),
        /* @__PURE__ */ jsx("div", { className: "mt-3 text-3xl font-display", children: carregando ? "..." : resumo.saldoTotal }),
        /* @__PURE__ */ jsx("p", { className: "mt-1 text-xs text-muted-foreground", children: "cortes disponíveis" })
      ] }),
      /* @__PURE__ */ jsxs("section", { className: "rounded-2xl border border-border bg-surface p-5", children: [
        /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between", children: [
          /* @__PURE__ */ jsx("span", { className: "text-xs uppercase tracking-widest text-muted-foreground", children: "Receita" }),
          /* @__PURE__ */ jsx(Receipt, { className: "h-4 w-4 text-gold" })
        ] }),
        /* @__PURE__ */ jsx("div", { className: "mt-3 text-2xl font-display", children: carregando ? "..." : formatarDinheiro(resumo.receitaTotal) }),
        /* @__PURE__ */ jsx("p", { className: "mt-1 text-xs text-muted-foreground", children: "pagos em assinaturas" })
      ] }),
      /* @__PURE__ */ jsxs("section", { className: "rounded-2xl border border-border bg-surface p-5", children: [
        /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between", children: [
          /* @__PURE__ */ jsx("span", { className: "text-xs uppercase tracking-widest text-muted-foreground", children: "Canceladas" }),
          /* @__PURE__ */ jsx(Ban, { className: "h-4 w-4 text-gold" })
        ] }),
        /* @__PURE__ */ jsx("div", { className: "mt-3 text-3xl font-display", children: carregando ? "..." : resumo.canceladas }),
        /* @__PURE__ */ jsx("p", { className: "mt-1 text-xs text-muted-foreground", children: "histórico cancelado" })
      ] })
    ] }),
    /* @__PURE__ */ jsxs("div", { className: "grid gap-6 xl:grid-cols-2", children: [
      /* @__PURE__ */ jsxs("section", { className: "rounded-2xl border border-border bg-surface p-6", children: [
        /* @__PURE__ */ jsxs("div", { className: "mb-6 flex items-center gap-3", children: [
          /* @__PURE__ */ jsx(Plus, { className: "h-5 w-5 text-gold" }),
          /* @__PURE__ */ jsxs("div", { children: [
            /* @__PURE__ */ jsx("h2", { className: "text-sm font-medium", children: "Criar plano" }),
            /* @__PURE__ */ jsx("p", { className: "mt-1 text-xs text-muted-foreground", children: "Exemplo: RD Black Mensal, R$ 99,90, 2 cortes por mês." })
          ] })
        ] }),
        /* @__PURE__ */ jsxs("form", { onSubmit: handleCriarPlano, className: "space-y-4", children: [
          /* @__PURE__ */ jsxs("div", { className: "space-y-2", children: [
            /* @__PURE__ */ jsx("label", { className: "text-xs uppercase tracking-widest text-muted-foreground", children: "Nome" }),
            /* @__PURE__ */ jsx("input", { value: nomePlano, onChange: (event) => setNomePlano(event.target.value), className: "h-10 w-full rounded-md border border-input bg-background px-3 text-sm", required: true })
          ] }),
          /* @__PURE__ */ jsxs("div", { className: "space-y-2", children: [
            /* @__PURE__ */ jsx("label", { className: "text-xs uppercase tracking-widest text-muted-foreground", children: "Descrição" }),
            /* @__PURE__ */ jsx("textarea", { value: descricaoPlano, onChange: (event) => setDescricaoPlano(event.target.value), className: "min-h-24 w-full rounded-md border border-input bg-background px-3 py-2 text-sm" })
          ] }),
          /* @__PURE__ */ jsxs("div", { className: "grid gap-4 md:grid-cols-3", children: [
            /* @__PURE__ */ jsxs("div", { className: "space-y-2", children: [
              /* @__PURE__ */ jsx("label", { className: "text-xs uppercase tracking-widest text-muted-foreground", children: "Preço" }),
              /* @__PURE__ */ jsx("input", { value: precoPlano, onChange: (event) => setPrecoPlano(event.target.value), placeholder: "99,90", className: "h-10 w-full rounded-md border border-input bg-background px-3 text-sm", required: true })
            ] }),
            /* @__PURE__ */ jsxs("div", { className: "space-y-2", children: [
              /* @__PURE__ */ jsx("label", { className: "text-xs uppercase tracking-widest text-muted-foreground", children: "Cortes" }),
              /* @__PURE__ */ jsx("input", { type: "number", min: 1, value: cortesPorCiclo, onChange: (event) => setCortesPorCiclo(event.target.value), className: "h-10 w-full rounded-md border border-input bg-background px-3 text-sm", required: true })
            ] }),
            /* @__PURE__ */ jsxs("div", { className: "space-y-2", children: [
              /* @__PURE__ */ jsx("label", { className: "text-xs uppercase tracking-widest text-muted-foreground", children: "Dias" }),
              /* @__PURE__ */ jsx("input", { type: "number", min: 1, value: duracaoDias, onChange: (event) => setDuracaoDias(event.target.value), className: "h-10 w-full rounded-md border border-input bg-background px-3 text-sm", required: true })
            ] })
          ] }),
          /* @__PURE__ */ jsx(Button, { type: "submit", disabled: salvandoPlano, className: "w-full", children: salvandoPlano ? "Criando..." : "Criar plano" })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "mt-6 space-y-3", children: [
          /* @__PURE__ */ jsx("h3", { className: "text-sm font-medium", children: "Planos cadastrados" }),
          planos.length === 0 ? /* @__PURE__ */ jsx("p", { className: "text-sm text-muted-foreground", children: "Nenhum plano cadastrado." }) : planos.map((plano) => /* @__PURE__ */ jsxs("div", { className: "flex items-start justify-between gap-4", children: [
            /* @__PURE__ */ jsxs("div", { children: [
              /* @__PURE__ */ jsx("h4", { className: "font-medium", children: plano.nome }),
              /* @__PURE__ */ jsxs("p", { className: "mt-1 text-xs text-muted-foreground", children: [
                plano.cortesPorCiclo,
                " cortes a cada",
                " ",
                plano.duracaoDias,
                " dias"
              ] })
            ] }),
            /* @__PURE__ */ jsxs("div", { className: "flex flex-col items-end gap-2", children: [
              /* @__PURE__ */ jsx("span", { className: "text-sm font-medium text-gold", children: formatarDinheiro(plano.precoCentavos) }),
              /* @__PURE__ */ jsxs(Button, { type: "button", variant: "outline", size: "sm", disabled: removendoPlanoId === plano.id, onClick: () => void handleDesativarPlano(plano), className: "border-destructive/40 text-destructive hover:bg-destructive/10", children: [
                /* @__PURE__ */ jsx(Trash2, { className: "mr-2 h-4 w-4" }),
                removendoPlanoId === plano.id ? "Excluindo..." : "Excluir"
              ] })
            ] }),
            plano.descricao && /* @__PURE__ */ jsx("p", { className: "mt-3 text-sm text-muted-foreground", children: plano.descricao })
          ] }))
        ] })
      ] }),
      /* @__PURE__ */ jsxs("section", { className: "rounded-2xl border border-border bg-surface p-6", children: [
        /* @__PURE__ */ jsxs("div", { className: "mb-6 flex items-center gap-3", children: [
          /* @__PURE__ */ jsx(UserRound, { className: "h-5 w-5 text-gold" }),
          /* @__PURE__ */ jsxs("div", { children: [
            /* @__PURE__ */ jsx("h2", { className: "text-sm font-medium", children: "Ativar assinatura" }),
            /* @__PURE__ */ jsx("p", { className: "mt-1 text-xs text-muted-foreground", children: "Escolha o cliente, o plano e registre o pagamento." })
          ] })
        ] }),
        /* @__PURE__ */ jsxs("form", { onSubmit: handleAtivarAssinatura, className: "space-y-4", children: [
          /* @__PURE__ */ jsxs("div", { className: "space-y-2", children: [
            /* @__PURE__ */ jsx("label", { className: "text-xs uppercase tracking-widest text-muted-foreground", children: "Cliente" }),
            /* @__PURE__ */ jsxs("select", { value: clienteId, onChange: (event) => setClienteId(event.target.value), className: "h-10 w-full rounded-md border border-input bg-background px-3 text-sm", required: true, children: [
              /* @__PURE__ */ jsx("option", { value: "", children: "Selecione um cliente" }),
              clientes.map((cliente) => /* @__PURE__ */ jsxs("option", { value: cliente.id, children: [
                cliente.nome,
                " — ",
                cliente.email
              ] }, cliente.id))
            ] })
          ] }),
          /* @__PURE__ */ jsxs("div", { className: "space-y-2", children: [
            /* @__PURE__ */ jsx("label", { className: "text-xs uppercase tracking-widest text-muted-foreground", children: "Plano" }),
            /* @__PURE__ */ jsxs("select", { value: planoId, onChange: (event) => setPlanoId(event.target.value), className: "h-10 w-full rounded-md border border-input bg-background px-3 text-sm", required: true, children: [
              /* @__PURE__ */ jsx("option", { value: "", children: "Selecione um plano" }),
              planos.filter((plano) => plano.ativo).map((plano) => /* @__PURE__ */ jsxs("option", { value: plano.id, children: [
                plano.nome,
                " —",
                " ",
                formatarDinheiro(plano.precoCentavos)
              ] }, plano.id))
            ] })
          ] }),
          /* @__PURE__ */ jsxs("div", { className: "grid gap-4 md:grid-cols-3", children: [
            /* @__PURE__ */ jsxs("div", { className: "space-y-2", children: [
              /* @__PURE__ */ jsx("label", { className: "text-xs uppercase tracking-widest text-muted-foreground", children: "Início" }),
              /* @__PURE__ */ jsx("input", { type: "datetime-local", value: vigenciaInicio, onChange: (event) => setVigenciaInicio(event.target.value), className: "h-10 w-full rounded-md border border-input bg-background px-3 text-sm" })
            ] }),
            /* @__PURE__ */ jsxs("div", { className: "space-y-2", children: [
              /* @__PURE__ */ jsx("label", { className: "text-xs uppercase tracking-widest text-muted-foreground", children: "Pagamento" }),
              /* @__PURE__ */ jsxs("select", { value: formaPagamento, onChange: (event) => setFormaPagamento(event.target.value), className: "h-10 w-full rounded-md border border-input bg-background px-3 text-sm", children: [
                /* @__PURE__ */ jsx("option", { value: "", children: "Não registrar" }),
                /* @__PURE__ */ jsx("option", { value: "PIX", children: "Pix" }),
                /* @__PURE__ */ jsx("option", { value: "DINHEIRO", children: "Dinheiro" }),
                /* @__PURE__ */ jsx("option", { value: "CARTAO_DEBITO", children: "Cartão de débito" }),
                /* @__PURE__ */ jsx("option", { value: "CARTAO_CREDITO", children: "Cartão de crédito" }),
                /* @__PURE__ */ jsx("option", { value: "CORTESIA", children: "Cortesia" }),
                /* @__PURE__ */ jsx("option", { value: "OUTRO", children: "Outro" })
              ] })
            ] }),
            /* @__PURE__ */ jsxs("div", { className: "space-y-2", children: [
              /* @__PURE__ */ jsx("label", { className: "text-xs uppercase tracking-widest text-muted-foreground", children: "Valor" }),
              /* @__PURE__ */ jsx("input", { value: valorPago, onChange: (event) => setValorPago(event.target.value), placeholder: "99,90", className: "h-10 w-full rounded-md border border-input bg-background px-3 text-sm" })
            ] })
          ] }),
          /* @__PURE__ */ jsxs("div", { className: "space-y-2", children: [
            /* @__PURE__ */ jsx("label", { className: "text-xs uppercase tracking-widest text-muted-foreground", children: "Observação" }),
            /* @__PURE__ */ jsx("textarea", { value: observacaoAssinatura, onChange: (event) => setObservacaoAssinatura(event.target.value), className: "min-h-24 w-full rounded-md border border-input bg-background px-3 py-2 text-sm" })
          ] }),
          /* @__PURE__ */ jsxs(Button, { type: "submit", disabled: ativando, className: "w-full", children: [
            /* @__PURE__ */ jsx(CreditCard, { className: "mr-2 h-4 w-4" }),
            ativando ? "Ativando..." : "Ativar assinatura"
          ] })
        ] })
      ] })
    ] }),
    /* @__PURE__ */ jsxs("section", { className: "mt-8 overflow-hidden rounded-2xl border border-border bg-surface", children: [
      /* @__PURE__ */ jsxs("div", { className: "border-b border-border px-6 py-4", children: [
        /* @__PURE__ */ jsx("h2", { className: "text-sm font-medium", children: "Assinaturas dos clientes" }),
        /* @__PURE__ */ jsx("p", { className: "mt-1 text-xs text-muted-foreground", children: "Acompanhe status, vigência, saldo e pagamentos." })
      ] }),
      carregando ? /* @__PURE__ */ jsx("div", { className: "px-6 py-10 text-sm text-muted-foreground", children: "Carregando assinaturas..." }) : assinaturas.length === 0 ? /* @__PURE__ */ jsx("div", { className: "px-6 py-10 text-sm text-muted-foreground", children: "Nenhuma assinatura criada ainda." }) : /* @__PURE__ */ jsx("div", { className: "divide-y divide-border", children: assinaturas.map((assinatura) => {
        const totalPago = assinatura.pagamentos.reduce((total, pagamento) => total + pagamento.valorCentavos, 0);
        return /* @__PURE__ */ jsx("article", { className: "px-6 py-5", children: /* @__PURE__ */ jsxs("div", { className: "flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between", children: [
          /* @__PURE__ */ jsxs("div", { children: [
            /* @__PURE__ */ jsxs("div", { className: "flex flex-wrap items-center gap-3", children: [
              /* @__PURE__ */ jsx("h3", { className: "font-medium", children: assinatura.cliente.nome }),
              /* @__PURE__ */ jsx("span", { className: `rounded-full border px-3 py-1 text-xs ${statusClasse(assinatura.status)}`, children: assinatura.status }),
              /* @__PURE__ */ jsx("span", { className: "rounded-full border border-border bg-background px-3 py-1 text-xs text-muted-foreground", children: assinatura.plano.nome })
            ] }),
            /* @__PURE__ */ jsxs("div", { className: "mt-3 grid gap-2 text-sm text-muted-foreground md:grid-cols-2", children: [
              /* @__PURE__ */ jsxs("p", { children: [
                "Vigência:",
                " ",
                formatarData(assinatura.vigenciaInicio),
                " até",
                " ",
                formatarData(assinatura.vigenciaFim)
              ] }),
              /* @__PURE__ */ jsxs("p", { children: [
                "Saldo:",
                " ",
                /* @__PURE__ */ jsx("span", { className: "text-foreground", children: assinatura.saldoCortes }),
                " ",
                "cortes"
              ] }),
              /* @__PURE__ */ jsxs("p", { children: [
                "Pago:",
                " ",
                /* @__PURE__ */ jsx("span", { className: "text-foreground", children: formatarDinheiro(totalPago) })
              ] }),
              /* @__PURE__ */ jsxs("p", { children: [
                "Cliente: ",
                assinatura.cliente.email
              ] })
            ] }),
            assinatura.pagamentos.length > 0 && /* @__PURE__ */ jsx("div", { className: "mt-3 space-y-1 text-sm text-muted-foreground", children: assinatura.pagamentos.map((pagamento) => /* @__PURE__ */ jsxs("p", { children: [
              "Pagamento:",
              " ",
              formaPagamentoLabel(pagamento.formaPagamento),
              " ",
              "—",
              " ",
              formatarDinheiro(pagamento.valorCentavos)
            ] }, pagamento.id)) }),
            assinatura.observacao && /* @__PURE__ */ jsx("p", { className: "mt-3 rounded-xl border border-border bg-background/40 p-3 text-sm text-muted-foreground", children: assinatura.observacao })
          ] }),
          assinatura.status === "ATIVA" && /* @__PURE__ */ jsxs(Button, { type: "button", variant: "outline", disabled: cancelandoId === assinatura.id, onClick: () => abrirModalCancelamento(assinatura.id), className: "border-destructive/40 text-destructive hover:bg-destructive/10", children: [
            /* @__PURE__ */ jsx(Ban, { className: "mr-2 h-4 w-4" }),
            cancelandoId === assinatura.id ? "Cancelando..." : "Cancelar"
          ] })
        ] }) }, assinatura.id);
      }) })
    ] }),
    assinaturaCancelamentoId && /* @__PURE__ */ jsx("div", { className: "fixed inset-0 z-50 flex items-center justify-center bg-background/80 p-4 backdrop-blur-sm", children: /* @__PURE__ */ jsxs("div", { className: "w-full max-w-lg rounded-2xl border border-border bg-surface p-6 shadow-xl", children: [
      /* @__PURE__ */ jsx("h2", { className: "text-xl font-display", children: "Cancelar assinatura" }),
      /* @__PURE__ */ jsx("p", { className: "mt-2 text-sm text-muted-foreground", children: "Informe uma observação para registrar o cancelamento." }),
      /* @__PURE__ */ jsx("textarea", { value: observacaoCancelamento, onChange: (event) => setObservacaoCancelamento(event.target.value), placeholder: "Ex.: cliente pediu cancelamento...", className: "mt-6 min-h-32 w-full rounded-md border border-input bg-background px-3 py-2 text-sm" }),
      /* @__PURE__ */ jsxs("div", { className: "mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end", children: [
        /* @__PURE__ */ jsx("button", { type: "button", onClick: fecharModalCancelamento, disabled: Boolean(cancelandoId), className: "inline-flex h-10 items-center justify-center rounded-full border border-border px-5 text-sm transition hover:bg-surface-elevated disabled:cursor-not-allowed disabled:opacity-60", children: "Voltar" }),
        /* @__PURE__ */ jsx("button", { type: "button", onClick: () => void handleCancelarAssinatura(), disabled: Boolean(cancelandoId), className: "inline-flex h-10 items-center justify-center rounded-full bg-destructive px-5 text-sm text-destructive-foreground transition hover:bg-destructive/90 disabled:cursor-not-allowed disabled:opacity-60", children: cancelandoId ? "Cancelando..." : "Confirmar cancelamento" })
      ] })
    ] }) })
  ] });
}
export {
  AdminAssinaturasPage as component
};
