import { jsxs, jsx, Fragment } from "react/jsx-runtime";
import { useState, useEffect } from "react";
import { u as useServerFn } from "./useServerFn-DL2oePlL.js";
import { CalendarCheck, Clock, UserRound, Mail, Phone, Scissors, CheckCircle2, XCircle } from "lucide-react";
import { P as PageHeader } from "./Sidebar-D9rUF8JL.js";
import { B as Button } from "./button-DjOZMqFS.js";
import { f as funcionarioListarSolicitacoes, a as funcionarioConfirmarAgendamento, b as funcionarioRecusarAgendamento, c as funcionarioConcluirAgendamento, d as funcionarioCancelarAgendamento } from "./agendamento.functions-jzDVYlE5.js";
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
const formasPagamento = [{
  value: "PIX",
  label: "Pix"
}, {
  value: "DINHEIRO",
  label: "Dinheiro"
}, {
  value: "CARTAO_DEBITO",
  label: "Cartão de débito"
}, {
  value: "CARTAO_CREDITO",
  label: "Cartão de crédito"
}, {
  value: "ASSINATURA",
  label: "Assinatura RD Black"
}, {
  value: "CORTESIA",
  label: "Cortesia"
}, {
  value: "OUTRO",
  label: "Outro"
}];
function formatarMoeda(precoCentavos) {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL"
  }).format(precoCentavos / 100);
}
function formatarDataHora(valor) {
  const data = new Date(valor);
  return new Intl.DateTimeFormat("pt-BR", {
    dateStyle: "short",
    timeStyle: "short"
  }).format(data);
}
function formatarTelefone(telefone) {
  if (!telefone) {
    return "Não informado";
  }
  const numeros = telefone.replace(/\D/g, "");
  if (numeros.length === 11) {
    return numeros.replace(/(\d{2})(\d{5})(\d{4})/, "($1) $2-$3");
  }
  if (numeros.length === 10) {
    return numeros.replace(/(\d{2})(\d{4})(\d{4})/, "($1) $2-$3");
  }
  return telefone;
}
function converterPrecoParaCentavos(valor) {
  const limpo = valor.trim().replace(/\./g, "").replace(",", ".");
  const numero = Number(limpo);
  if (!Number.isFinite(numero)) {
    return 0;
  }
  return Math.round(numero * 100);
}
function traduzirStatus(status) {
  const mapa = {
    SOLICITADO: "aguardando decisão",
    CONFIRMADO: "confirmado",
    CONCLUIDO: "concluído",
    RECUSADO: "recusado"
  };
  return mapa[status] ?? status;
}
function SolicitacoesPage() {
  const carregarSolicitacoes = useServerFn(funcionarioListarSolicitacoes);
  const confirmarAgendamento = useServerFn(funcionarioConfirmarAgendamento);
  const recusarAgendamento = useServerFn(funcionarioRecusarAgendamento);
  const concluirAgendamento = useServerFn(funcionarioConcluirAgendamento);
  const cancelarAgendamento = useServerFn(funcionarioCancelarAgendamento);
  const [solicitacoes, setSolicitacoes] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [processandoId, setProcessandoId] = useState("");
  const [mensagem, setMensagem] = useState("");
  const [erro, setErro] = useState("");
  const [modalAcao, setModalAcao] = useState(null);
  const [motivoModal, setMotivoModal] = useState("");
  const [formasPagamentoPorAgendamento, setFormasPagamentoPorAgendamento] = useState({});
  const [valoresPagosPorAgendamento, setValoresPagosPorAgendamento] = useState({});
  async function carregarDados() {
    setCarregando(true);
    setErro("");
    try {
      const resposta = await carregarSolicitacoes();
      setSolicitacoes(resposta);
    } catch (error) {
      console.error(error);
      setErro("Não foi possível carregar as solicitações.");
    } finally {
      setCarregando(false);
    }
  }
  useEffect(() => {
    void carregarDados();
  }, []);
  function abrirModalRecusa(agendamentoId) {
    setMotivoModal("");
    setModalAcao({
      tipo: "RECUSAR",
      agendamentoId,
      titulo: "Recusar solicitação",
      descricao: "Informe o motivo da recusa. O cliente verá essa informação no histórico do agendamento."
    });
  }
  function abrirModalCancelamentoEquipe(agendamentoId) {
    setMotivoModal("");
    setModalAcao({
      tipo: "CANCELAR_EQUIPE",
      agendamentoId,
      titulo: "Cancelar pela equipe",
      descricao: "Informe o motivo do cancelamento. O cliente verá que o horário foi cancelado pela equipe."
    });
  }
  function fecharModalAcao() {
    setModalAcao(null);
    setMotivoModal("");
  }
  async function handleConfirmar(agendamentoId) {
    setMensagem("");
    setErro("");
    setProcessandoId(agendamentoId);
    try {
      const resultado = await confirmarAgendamento({
        data: {
          agendamentoId
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
      await handleRecusar(modalAcao.agendamentoId, motivoModal);
      return;
    }
    if (modalAcao.tipo === "CANCELAR_EQUIPE") {
      await handleCancelarAgendamento(modalAcao.agendamentoId, motivoModal);
    }
  }
  async function handleRecusar(agendamentoId, motivoRecusa) {
    setMensagem("");
    setErro("");
    setProcessandoId(agendamentoId);
    try {
      const resultado = await recusarAgendamento({
        data: {
          agendamentoId,
          motivoRecusa
        }
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
  async function handleConcluir(solicitacao) {
    setMensagem("");
    setErro("");
    setProcessandoId(solicitacao.id);
    const formaPagamento = formasPagamentoPorAgendamento[solicitacao.id] ?? "PIX";
    const valorDigitado = valoresPagosPorAgendamento[solicitacao.id] ?? String(solicitacao.servico.precoCentavos / 100).replace(".", ",");
    try {
      const resultado = await concluirAgendamento({
        data: {
          agendamentoId: solicitacao.id,
          formaPagamento,
          valorPagoCentavos: converterPrecoParaCentavos(valorDigitado),
          observacaoPagamento: ""
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
      setErro("Não foi possível concluir o atendimento.");
    } finally {
      setProcessandoId("");
    }
  }
  async function handleCancelarAgendamento(agendamentoId, motivoCancelamento) {
    setMensagem("");
    setErro("");
    setProcessandoId(agendamentoId);
    try {
      const resultado = await cancelarAgendamento({
        data: {
          agendamentoId,
          motivoCancelamento
        }
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
  return /* @__PURE__ */ jsxs("div", { className: "max-w-7xl p-8 lg:p-12", children: [
    /* @__PURE__ */ jsx(PageHeader, { title: "Solicitações", subtitle: "Confirme, recuse ou conclua atendimentos enviados pelos clientes." }),
    erro && /* @__PURE__ */ jsx("div", { role: "alert", className: "mb-6 rounded-xl border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive", children: erro }),
    mensagem && /* @__PURE__ */ jsx("div", { className: "mb-6 rounded-xl border border-gold/30 bg-gold-soft px-4 py-3 text-sm text-gold", children: mensagem }),
    carregando ? /* @__PURE__ */ jsx("section", { className: "rounded-2xl border border-border bg-surface p-8", children: /* @__PURE__ */ jsx("p", { className: "text-sm text-muted-foreground", children: "Carregando solicitações..." }) }) : solicitacoes.length === 0 ? /* @__PURE__ */ jsxs("section", { className: "flex min-h-80 flex-col items-center justify-center rounded-2xl border border-border bg-surface p-8 text-center", children: [
      /* @__PURE__ */ jsx(CalendarCheck, { className: "h-10 w-10 text-muted-foreground" }),
      /* @__PURE__ */ jsx("h2", { className: "mt-5 text-xl font-display", children: "Nenhuma solicitação pendente" }),
      /* @__PURE__ */ jsx("p", { className: "mt-2 max-w-md text-sm text-muted-foreground", children: "Quando um cliente solicitar ou tiver um horário confirmado, o pedido aparecerá aqui para ser gerenciado." })
    ] }) : /* @__PURE__ */ jsx("div", { className: "space-y-4", children: solicitacoes.map((solicitacao) => {
      const processando = processandoId === solicitacao.id;
      return /* @__PURE__ */ jsx("article", { className: "rounded-2xl border border-border bg-surface p-6", children: /* @__PURE__ */ jsxs("div", { className: "flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between", children: [
        /* @__PURE__ */ jsxs("div", { className: "space-y-5", children: [
          /* @__PURE__ */ jsxs("div", { children: [
            /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2 text-xs uppercase tracking-widest text-gold", children: [
              /* @__PURE__ */ jsx(Clock, { className: "h-4 w-4" }),
              "Horário solicitado"
            ] }),
            /* @__PURE__ */ jsx("h2", { className: "mt-2 text-xl font-display", children: formatarDataHora(solicitacao.inicio) }),
            /* @__PURE__ */ jsxs("p", { className: "mt-1 text-sm text-muted-foreground", children: [
              "Término previsto:",
              " ",
              formatarDataHora(solicitacao.fim)
            ] })
          ] }),
          /* @__PURE__ */ jsxs("div", { className: "grid gap-4 md:grid-cols-3", children: [
            /* @__PURE__ */ jsxs("div", { className: "rounded-xl border border-border bg-background/40 p-4", children: [
              /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2 text-sm font-medium", children: [
                /* @__PURE__ */ jsx(UserRound, { className: "h-4 w-4 text-gold" }),
                "Cliente"
              ] }),
              /* @__PURE__ */ jsx("p", { className: "mt-2 text-sm", children: solicitacao.cliente.nome }),
              /* @__PURE__ */ jsxs("p", { className: "mt-1 flex items-center gap-1 text-xs text-muted-foreground", children: [
                /* @__PURE__ */ jsx(Mail, { className: "h-3 w-3" }),
                solicitacao.cliente.email
              ] }),
              /* @__PURE__ */ jsxs("p", { className: "mt-1 flex items-center gap-1 text-xs text-muted-foreground", children: [
                /* @__PURE__ */ jsx(Phone, { className: "h-3 w-3" }),
                formatarTelefone(solicitacao.cliente.telefone)
              ] })
            ] }),
            /* @__PURE__ */ jsxs("div", { className: "rounded-xl border border-border bg-background/40 p-4", children: [
              /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2 text-sm font-medium", children: [
                /* @__PURE__ */ jsx(Scissors, { className: "h-4 w-4 text-gold" }),
                "Serviço"
              ] }),
              /* @__PURE__ */ jsx("p", { className: "mt-2 text-sm", children: solicitacao.servico.nome }),
              /* @__PURE__ */ jsxs("p", { className: "mt-1 text-xs text-muted-foreground", children: [
                solicitacao.servico.duracaoMinutos,
                " min ·",
                " ",
                formatarMoeda(solicitacao.servico.precoCentavos)
              ] })
            ] }),
            /* @__PURE__ */ jsxs("div", { className: "rounded-xl border border-border bg-background/40 p-4", children: [
              /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2 text-sm font-medium", children: [
                /* @__PURE__ */ jsx(UserRound, { className: "h-4 w-4 text-gold" }),
                "Profissional"
              ] }),
              /* @__PURE__ */ jsx("p", { className: "mt-2 text-sm", children: solicitacao.profissional.nome }),
              /* @__PURE__ */ jsxs("p", { className: "mt-1 text-xs text-muted-foreground", children: [
                "Status: ",
                traduzirStatus(solicitacao.status)
              ] })
            ] })
          ] }),
          solicitacao.observacaoCliente && /* @__PURE__ */ jsxs("div", { className: "rounded-xl border border-border bg-background/40 p-4", children: [
            /* @__PURE__ */ jsx("h3", { className: "text-sm font-medium", children: "Observação do cliente" }),
            /* @__PURE__ */ jsx("p", { className: "mt-2 text-sm text-muted-foreground", children: solicitacao.observacaoCliente })
          ] })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "flex shrink-0 flex-col gap-3 lg:w-56", children: [
          solicitacao.status === "SOLICITADO" && /* @__PURE__ */ jsxs(Fragment, { children: [
            /* @__PURE__ */ jsxs(Button, { type: "button", disabled: processando, onClick: () => void handleConfirmar(solicitacao.id), className: "w-full", children: [
              /* @__PURE__ */ jsx(CheckCircle2, { className: "mr-2 h-4 w-4" }),
              processando ? "Processando..." : "Confirmar"
            ] }),
            /* @__PURE__ */ jsxs(Button, { type: "button", variant: "outline", disabled: processando, onClick: () => abrirModalRecusa(solicitacao.id), className: "w-full", children: [
              /* @__PURE__ */ jsx(XCircle, { className: "mr-2 h-4 w-4" }),
              "Recusar"
            ] })
          ] }),
          solicitacao.status === "CONFIRMADO" && /* @__PURE__ */ jsxs("div", { className: "space-y-3", children: [
            /* @__PURE__ */ jsxs("div", { className: "space-y-2", children: [
              /* @__PURE__ */ jsx("label", { className: "text-xs uppercase tracking-widest text-muted-foreground", children: "Forma de pagamento" }),
              /* @__PURE__ */ jsx("select", { value: formasPagamentoPorAgendamento[solicitacao.id] ?? "PIX", onChange: (event) => setFormasPagamentoPorAgendamento((estadoAtual) => ({
                ...estadoAtual,
                [solicitacao.id]: event.target.value
              })), className: "h-10 w-full rounded-md border border-input bg-background px-3 text-sm", children: formasPagamento.map((forma) => /* @__PURE__ */ jsx("option", { value: forma.value, children: forma.label }, forma.value)) })
            ] }),
            /* @__PURE__ */ jsxs("div", { className: "space-y-2", children: [
              /* @__PURE__ */ jsx("label", { className: "text-xs uppercase tracking-widest text-muted-foreground", children: "Valor recebido" }),
              /* @__PURE__ */ jsx("input", { value: (formasPagamentoPorAgendamento[solicitacao.id] ?? "PIX") === "ASSINATURA" ? "0,00" : valoresPagosPorAgendamento[solicitacao.id] ?? String(solicitacao.servico.precoCentavos / 100).replace(".", ","), onChange: (event) => setValoresPagosPorAgendamento((estadoAtual) => ({
                ...estadoAtual,
                [solicitacao.id]: event.target.value
              })), disabled: (formasPagamentoPorAgendamento[solicitacao.id] ?? "PIX") === "ASSINATURA", inputMode: "decimal", className: "h-10 w-full rounded-md border border-input bg-background px-3 text-sm disabled:cursor-not-allowed disabled:opacity-60" })
            ] }),
            /* @__PURE__ */ jsxs(Button, { type: "button", disabled: processando, onClick: () => void handleConcluir(solicitacao), className: "w-full", children: [
              /* @__PURE__ */ jsx(CheckCircle2, { className: "mr-2 h-4 w-4" }),
              processando ? "Processando..." : "Marcar concluído"
            ] }),
            /* @__PURE__ */ jsxs(Button, { type: "button", variant: "outline", disabled: processando, onClick: () => abrirModalCancelamentoEquipe(solicitacao.id), className: "w-full border-destructive/40 text-destructive hover:bg-destructive/10", children: [
              /* @__PURE__ */ jsx(XCircle, { className: "mr-2 h-4 w-4" }),
              "Cancelar pela equipe"
            ] })
          ] })
        ] })
      ] }) }, solicitacao.id);
    }) }),
    modalAcao && /* @__PURE__ */ jsx("div", { className: "fixed inset-0 z-50 flex items-center justify-center bg-background/80 p-4 backdrop-blur-sm", children: /* @__PURE__ */ jsxs("div", { className: "w-full max-w-lg rounded-2xl border border-border bg-surface p-6 shadow-xl", children: [
      /* @__PURE__ */ jsxs("div", { className: "flex items-start justify-between gap-4", children: [
        /* @__PURE__ */ jsxs("div", { children: [
          /* @__PURE__ */ jsx("h2", { className: "text-xl font-display", children: modalAcao.titulo }),
          /* @__PURE__ */ jsx("p", { className: "mt-2 text-sm text-muted-foreground", children: modalAcao.descricao })
        ] }),
        /* @__PURE__ */ jsx("button", { type: "button", onClick: fecharModalAcao, className: "rounded-full border border-border px-3 py-1 text-sm text-muted-foreground transition hover:bg-surface-elevated", children: "Fechar" })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "mt-6 space-y-2", children: [
        /* @__PURE__ */ jsx("label", { className: "text-xs uppercase tracking-widest text-muted-foreground", children: "Motivo" }),
        /* @__PURE__ */ jsx("textarea", { value: motivoModal, onChange: (event) => setMotivoModal(event.target.value), placeholder: "Ex.: horário indisponível, ajuste interno, conflito de agenda...", className: "min-h-32 w-full rounded-md border border-input bg-background px-3 py-2 text-sm" })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end", children: [
        /* @__PURE__ */ jsx(Button, { type: "button", variant: "outline", onClick: fecharModalAcao, disabled: processandoId === modalAcao.agendamentoId, children: "Voltar" }),
        /* @__PURE__ */ jsx(Button, { type: "button", onClick: () => void handleConfirmarModalAcao(), disabled: processandoId === modalAcao.agendamentoId, className: modalAcao.tipo === "CANCELAR_EQUIPE" ? "bg-destructive text-destructive-foreground hover:bg-destructive/90" : void 0, children: processandoId === modalAcao.agendamentoId ? "Processando..." : modalAcao.tipo === "RECUSAR" ? "Confirmar recusa" : "Confirmar cancelamento" })
      ] })
    ] }) })
  ] });
}
export {
  SolicitacoesPage as component
};
