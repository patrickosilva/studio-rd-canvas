import { r as reactExports, j as jsxRuntimeExports } from "../_libs/react.mjs";
import { u as useServerFn } from "./useServerFn-DL2oePlL.mjs";
import { P as PageHeader } from "./Sidebar-D9rUF8JL.mjs";
import { B as Button } from "./button-DjOZMqFS.mjs";
import { f as funcionarioListarSolicitacoes, a as funcionarioConfirmarAgendamento, b as funcionarioConcluirAgendamento, c as funcionarioRecusarAgendamento, d as funcionarioCancelarAgendamento } from "./agendamento.functions-B1KNQbhE.mjs";
import "../_libs/seroval.mjs";
import { c as CalendarCheck, p as Clock, q as UserRound, M as Mail, v as Phone, i as Scissors, o as CircleCheck, w as CircleX } from "../_libs/lucide-react.mjs";
import "../_libs/tanstack__react-router.mjs";
import "../_libs/tanstack__router-core.mjs";
import "../_libs/tanstack__history.mjs";
import "../_libs/cookie-es.mjs";
import "../_libs/seroval-plugins.mjs";
import "node:stream/web";
import "node:stream";
import "../_libs/react-dom.mjs";
import "util";
import "async_hooks";
import "stream";
import "crypto";
import "../_libs/isbot.mjs";
import "../_libs/radix-ui__react-slot.mjs";
import "../_libs/radix-ui__react-compose-refs.mjs";
import "../_libs/class-variance-authority.mjs";
import "../_libs/clsx.mjs";
import "../_libs/tailwind-merge.mjs";
import "./router-oC4Qe4sf.mjs";
import "../_libs/tanstack__query-core.mjs";
import "../_libs/tanstack__react-query.mjs";
import "./server-BeKYjhVv.mjs";
import "node:async_hooks";
import "../_libs/h3-v2.mjs";
import "../_libs/rou3.mjs";
import "../_libs/srvx.mjs";
import "node:http";
import "node:stream/promises";
import "node:https";
import "node:http2";
import "../_libs/zod.mjs";
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
  const [solicitacoes, setSolicitacoes] = reactExports.useState([]);
  const [carregando, setCarregando] = reactExports.useState(true);
  const [processandoId, setProcessandoId] = reactExports.useState("");
  const [mensagem, setMensagem] = reactExports.useState("");
  const [erro, setErro] = reactExports.useState("");
  const [modalAcao, setModalAcao] = reactExports.useState(null);
  const [motivoModal, setMotivoModal] = reactExports.useState("");
  const [formasPagamentoPorAgendamento, setFormasPagamentoPorAgendamento] = reactExports.useState({});
  const [valoresPagosPorAgendamento, setValoresPagosPorAgendamento] = reactExports.useState({});
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
  reactExports.useEffect(() => {
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
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "max-w-7xl p-8 lg:p-12", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(PageHeader, { title: "Solicitações", subtitle: "Confirme, recuse ou conclua atendimentos enviados pelos clientes." }),
    erro && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { role: "alert", className: "mb-6 rounded-xl border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive", children: erro }),
    mensagem && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mb-6 rounded-xl border border-gold/30 bg-gold-soft px-4 py-3 text-sm text-gold", children: mensagem }),
    carregando ? /* @__PURE__ */ jsxRuntimeExports.jsx("section", { className: "rounded-2xl border border-border bg-surface p-8", children: /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-muted-foreground", children: "Carregando solicitações..." }) }) : solicitacoes.length === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsxs("section", { className: "flex min-h-80 flex-col items-center justify-center rounded-2xl border border-border bg-surface p-8 text-center", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(CalendarCheck, { className: "h-10 w-10 text-muted-foreground" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "mt-5 text-xl font-display", children: "Nenhuma solicitação pendente" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-2 max-w-md text-sm text-muted-foreground", children: "Quando um cliente solicitar ou tiver um horário confirmado, o pedido aparecerá aqui para ser gerenciado." })
    ] }) : /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "space-y-4", children: solicitacoes.map((solicitacao) => {
      const processando = processandoId === solicitacao.id;
      return /* @__PURE__ */ jsxRuntimeExports.jsx("article", { className: "rounded-2xl border border-border bg-surface p-6", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-5", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2 text-xs uppercase tracking-widest text-gold", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Clock, { className: "h-4 w-4" }),
              "Horário solicitado"
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "mt-2 text-xl font-display", children: formatarDataHora(solicitacao.inicio) }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "mt-1 text-sm text-muted-foreground", children: [
              "Término previsto:",
              " ",
              formatarDataHora(solicitacao.fim)
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid gap-4 md:grid-cols-3", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-xl border border-border bg-background/40 p-4", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2 text-sm font-medium", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(UserRound, { className: "h-4 w-4 text-gold" }),
                "Cliente"
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-2 text-sm", children: solicitacao.cliente.nome }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "mt-1 flex items-center gap-1 text-xs text-muted-foreground", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(Mail, { className: "h-3 w-3" }),
                solicitacao.cliente.email
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "mt-1 flex items-center gap-1 text-xs text-muted-foreground", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(Phone, { className: "h-3 w-3" }),
                formatarTelefone(solicitacao.cliente.telefone)
              ] })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-xl border border-border bg-background/40 p-4", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2 text-sm font-medium", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(Scissors, { className: "h-4 w-4 text-gold" }),
                "Serviço"
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-2 text-sm", children: solicitacao.servico.nome }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "mt-1 text-xs text-muted-foreground", children: [
                solicitacao.servico.duracaoMinutos,
                " min ·",
                " ",
                formatarMoeda(solicitacao.servico.precoCentavos)
              ] })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-xl border border-border bg-background/40 p-4", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2 text-sm font-medium", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(UserRound, { className: "h-4 w-4 text-gold" }),
                "Profissional"
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-2 text-sm", children: solicitacao.profissional.nome }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "mt-1 text-xs text-muted-foreground", children: [
                "Status: ",
                traduzirStatus(solicitacao.status)
              ] })
            ] })
          ] }),
          solicitacao.observacaoCliente && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-xl border border-border bg-background/40 p-4", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "text-sm font-medium", children: "Observação do cliente" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-2 text-sm text-muted-foreground", children: solicitacao.observacaoCliente })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex shrink-0 flex-col gap-3 lg:w-56", children: [
          solicitacao.status === "SOLICITADO" && /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { type: "button", disabled: processando, onClick: () => void handleConfirmar(solicitacao.id), className: "w-full", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(CircleCheck, { className: "mr-2 h-4 w-4" }),
              processando ? "Processando..." : "Confirmar"
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { type: "button", variant: "outline", disabled: processando, onClick: () => abrirModalRecusa(solicitacao.id), className: "w-full", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(CircleX, { className: "mr-2 h-4 w-4" }),
              "Recusar"
            ] })
          ] }),
          solicitacao.status === "CONFIRMADO" && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-3", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-2", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("label", { className: "text-xs uppercase tracking-widest text-muted-foreground", children: "Forma de pagamento" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("select", { value: formasPagamentoPorAgendamento[solicitacao.id] ?? "PIX", onChange: (event) => setFormasPagamentoPorAgendamento((estadoAtual) => ({
                ...estadoAtual,
                [solicitacao.id]: event.target.value
              })), className: "h-10 w-full rounded-md border border-input bg-background px-3 text-sm", children: formasPagamento.map((forma) => /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: forma.value, children: forma.label }, forma.value)) })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-2", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("label", { className: "text-xs uppercase tracking-widest text-muted-foreground", children: "Valor recebido" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("input", { value: (formasPagamentoPorAgendamento[solicitacao.id] ?? "PIX") === "ASSINATURA" ? "0,00" : valoresPagosPorAgendamento[solicitacao.id] ?? String(solicitacao.servico.precoCentavos / 100).replace(".", ","), onChange: (event) => setValoresPagosPorAgendamento((estadoAtual) => ({
                ...estadoAtual,
                [solicitacao.id]: event.target.value
              })), disabled: (formasPagamentoPorAgendamento[solicitacao.id] ?? "PIX") === "ASSINATURA", inputMode: "decimal", className: "h-10 w-full rounded-md border border-input bg-background px-3 text-sm disabled:cursor-not-allowed disabled:opacity-60" })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { type: "button", disabled: processando, onClick: () => void handleConcluir(solicitacao), className: "w-full", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(CircleCheck, { className: "mr-2 h-4 w-4" }),
              processando ? "Processando..." : "Marcar concluído"
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { type: "button", variant: "outline", disabled: processando, onClick: () => abrirModalCancelamentoEquipe(solicitacao.id), className: "w-full border-destructive/40 text-destructive hover:bg-destructive/10", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(CircleX, { className: "mr-2 h-4 w-4" }),
              "Cancelar pela equipe"
            ] })
          ] })
        ] })
      ] }) }, solicitacao.id);
    }) }),
    modalAcao && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "fixed inset-0 z-50 flex items-center justify-center bg-background/80 p-4 backdrop-blur-sm", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "w-full max-w-lg rounded-2xl border border-border bg-surface p-6 shadow-xl", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-start justify-between gap-4", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "text-xl font-display", children: modalAcao.titulo }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-2 text-sm text-muted-foreground", children: modalAcao.descricao })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("button", { type: "button", onClick: fecharModalAcao, className: "rounded-full border border-border px-3 py-1 text-sm text-muted-foreground transition hover:bg-surface-elevated", children: "Fechar" })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-6 space-y-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("label", { className: "text-xs uppercase tracking-widest text-muted-foreground", children: "Motivo" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("textarea", { value: motivoModal, onChange: (event) => setMotivoModal(event.target.value), placeholder: "Ex.: horário indisponível, ajuste interno, conflito de agenda...", className: "min-h-32 w-full rounded-md border border-input bg-background px-3 py-2 text-sm" })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { type: "button", variant: "outline", onClick: fecharModalAcao, disabled: processandoId === modalAcao.agendamentoId, children: "Voltar" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { type: "button", onClick: () => void handleConfirmarModalAcao(), disabled: processandoId === modalAcao.agendamentoId, className: modalAcao.tipo === "CANCELAR_EQUIPE" ? "bg-destructive text-destructive-foreground hover:bg-destructive/90" : void 0, children: processandoId === modalAcao.agendamentoId ? "Processando..." : modalAcao.tipo === "RECUSAR" ? "Confirmar recusa" : "Confirmar cancelamento" })
      ] })
    ] }) })
  ] });
}
export {
  SolicitacoesPage as component
};
