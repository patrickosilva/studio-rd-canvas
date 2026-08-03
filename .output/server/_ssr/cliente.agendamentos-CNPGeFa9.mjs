import { r as reactExports, j as jsxRuntimeExports } from "../_libs/react.mjs";
import { u as useServerFn } from "./useServerFn-DL2oePlL.mjs";
import { P as PageHeader } from "./Sidebar-D9rUF8JL.mjs";
import { B as Button } from "./button-DjOZMqFS.mjs";
import { I as Input } from "./input-D_U8fI25.mjs";
import { L as Label } from "./label-C8WJLhmR.mjs";
import { a as listarServicosAtivos, l as listarProfissionaisAtivos } from "./catalogo.functions-CvTABOgz.mjs";
import { e as listarIndisponibilidadesAgenda, l as listarMeusAgendamentos, s as solicitarAgendamento, g as clienteCancelarAgendamento } from "./agendamento.functions-B1KNQbhE.mjs";
import "../_libs/seroval.mjs";
import { e as Calendar, o as CircleCheck, p as Clock, i as Scissors, q as UserRound } from "../_libs/lucide-react.mjs";
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
import "../_libs/radix-ui__react-label.mjs";
import "../_libs/radix-ui__react-primitive.mjs";
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
const funcionamentoPorDia = {
  // 0 = domingo
  // 1 = segunda
  2: {
    abre: "09:30",
    fecha: "19:30"
  },
  3: {
    abre: "09:30",
    fecha: "19:30"
  },
  4: {
    abre: "09:00",
    fecha: "19:30"
  },
  5: {
    abre: "08:00",
    fecha: "21:00"
  },
  6: {
    abre: "08:30",
    fecha: "19:00"
  }
};
function formatarMoeda(precoCentavos) {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL"
  }).format(precoCentavos / 100);
}
function formatarDataInput(data) {
  const ano = data.getFullYear();
  const mes = String(data.getMonth() + 1).padStart(2, "0");
  const dia = String(data.getDate()).padStart(2, "0");
  return `${ano}-${mes}-${dia}`;
}
function criarDataLocal(dataInput) {
  const [ano, mes, dia] = dataInput.split("-").map(Number);
  return new Date(ano, mes - 1, dia);
}
function obterNomeDia(dataInput) {
  const data = criarDataLocal(dataInput);
  return new Intl.DateTimeFormat("pt-BR", {
    weekday: "short",
    day: "2-digit",
    month: "2-digit"
  }).format(data);
}
function obterProximosDiasFuncionamento(quantidadeDias = 21) {
  const dias = [];
  const hoje = /* @__PURE__ */ new Date();
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
function converterHoraParaMinutos(hora) {
  const [horas, minutos] = hora.split(":").map(Number);
  return horas * 60 + minutos;
}
function formatarMinutosComoHora(totalMinutos) {
  const horas = Math.floor(totalMinutos / 60);
  const minutos = totalMinutos % 60;
  return `${String(horas).padStart(2, "0")}:${String(minutos).padStart(2, "0")}`;
}
function gerarHorariosDisponiveis(dataInput, duracaoMinutos) {
  const data = criarDataLocal(dataInput);
  const regra = funcionamentoPorDia[data.getDay()];
  if (!regra) {
    return [];
  }
  const abertura = converterHoraParaMinutos(regra.abre);
  const fechamento = converterHoraParaMinutos(regra.fecha);
  const horarios = [];
  for (let horario = abertura; horario + duracaoMinutos <= fechamento; horario += 30) {
    horarios.push(formatarMinutosComoHora(horario));
  }
  return horarios;
}
function criarInicioIsoLocal(dataInput, horario) {
  return `${dataInput}T${horario}`;
}
function formatarDataHora(valor) {
  const data = new Date(valor);
  return new Intl.DateTimeFormat("pt-BR", {
    dateStyle: "short",
    timeStyle: "short"
  }).format(data);
}
function traduzirStatus(status) {
  const mapa = {
    SOLICITADO: "Solicitado",
    CONFIRMADO: "Confirmado",
    RECUSADO: "Recusado",
    CANCELADO_CLIENTE: "Cancelado por você",
    CANCELADO_FUNCIONARIO: "Cancelado pela equipe",
    CONCLUIDO: "Concluído",
    FALTOU: "Não compareceu"
  };
  return mapa[status] ?? status;
}
function AgendamentosPage() {
  const carregarServicos = useServerFn(listarServicosAtivos);
  const carregarProfissionais = useServerFn(listarProfissionaisAtivos);
  const carregarMeusAgendamentos = useServerFn(listarMeusAgendamentos);
  const enviarSolicitacao = useServerFn(solicitarAgendamento);
  const cancelarAgendamento = useServerFn(clienteCancelarAgendamento);
  const [agendamentoCancelamentoId, setAgendamentoCancelamentoId] = reactExports.useState("");
  const [motivoCancelamentoModal, setMotivoCancelamentoModal] = reactExports.useState("");
  const buscarIndisponibilidades = useServerFn(listarIndisponibilidadesAgenda);
  const [servicos, setServicos] = reactExports.useState([]);
  const [profissionais, setProfissionais] = reactExports.useState([]);
  const [agendamentos, setAgendamentos] = reactExports.useState([]);
  const [indisponibilidades, setIndisponibilidades] = reactExports.useState([]);
  const [servicoId, setServicoId] = reactExports.useState("");
  const [profissionalId, setProfissionalId] = reactExports.useState("");
  const [dataSelecionada, setDataSelecionada] = reactExports.useState("");
  const [horarioSelecionado, setHorarioSelecionado] = reactExports.useState("");
  const [observacao, setObservacao] = reactExports.useState("");
  const [carregando, setCarregando] = reactExports.useState(true);
  const [enviando, setEnviando] = reactExports.useState(false);
  const [cancelandoId, setCancelandoId] = reactExports.useState("");
  const [mensagem, setMensagem] = reactExports.useState("");
  const [erro, setErro] = reactExports.useState("");
  const proximosDias = reactExports.useMemo(() => obterProximosDiasFuncionamento(), []);
  const servicoSelecionado = servicos.find((servico) => servico.id === servicoId);
  const horariosDisponiveis = reactExports.useMemo(() => {
    if (!dataSelecionada || !servicoSelecionado) {
      return [];
    }
    return gerarHorariosDisponiveis(dataSelecionada, servicoSelecionado.duracaoMinutos);
  }, [dataSelecionada, servicoSelecionado]);
  reactExports.useMemo(() => {
    return horariosDisponiveis.filter((horario) => {
      if (!servicoSelecionado || !dataSelecionada) {
        return false;
      }
      const inicioHorario = /* @__PURE__ */ new Date(`${dataSelecionada}T${horario}`);
      const fimHorario = new Date(inicioHorario.getTime() + servicoSelecionado.duracaoMinutos * 60 * 1e3);
      return !existeConflitoComIndisponibilidade(inicioHorario, fimHorario, indisponibilidades);
    });
  }, [horariosDisponiveis, servicoSelecionado, dataSelecionada, indisponibilidades]);
  function abrirModalCancelamento(agendamentoId) {
    setMotivoCancelamentoModal("");
    setAgendamentoCancelamentoId(agendamentoId);
  }
  function fecharModalCancelamento() {
    setAgendamentoCancelamentoId("");
    setMotivoCancelamentoModal("");
  }
  function existeConflitoComIndisponibilidade(inicioHorario, fimHorario, indisponibilidades2) {
    return indisponibilidades2.some((indisponibilidade) => {
      const inicioIndisponivel = new Date(indisponibilidade.inicio);
      const fimIndisponivel = new Date(indisponibilidade.fim);
      return inicioIndisponivel < fimHorario && fimIndisponivel > inicioHorario;
    });
  }
  async function carregarDados() {
    setCarregando(true);
    setErro("");
    try {
      const [servicosResposta, profissionaisResposta, agendamentosResposta] = await Promise.all([carregarServicos(), carregarProfissionais(), carregarMeusAgendamentos()]);
      setServicos(servicosResposta);
      setProfissionais(profissionaisResposta);
      setAgendamentos(agendamentosResposta);
      if (!servicoId && servicosResposta[0]) {
        setServicoId(servicosResposta[0].id);
      }
      if (!profissionalId && profissionaisResposta[0]) {
        setProfissionalId(profissionaisResposta[0].id);
      }
      if (!dataSelecionada && proximosDias[0]) {
        setDataSelecionada(proximosDias[0]);
      }
    } catch (error) {
      console.error(error);
      setErro("Não foi possível carregar seus agendamentos.");
    } finally {
      setCarregando(false);
    }
  }
  reactExports.useEffect(() => {
    void carregarDados();
  }, []);
  reactExports.useEffect(() => {
    void carregarIndisponibilidades(profissionalId, dataSelecionada);
  }, [profissionalId, dataSelecionada]);
  reactExports.useEffect(() => {
    if (horariosDisponiveis.length > 0 && !horariosDisponiveis.includes(horarioSelecionado)) {
      setHorarioSelecionado(horariosDisponiveis[0]);
    }
  }, [horariosDisponiveis, horarioSelecionado]);
  async function carregarIndisponibilidades(profissionalIdSelecionado, dataSelecionadaValor) {
    if (!profissionalIdSelecionado || !dataSelecionadaValor) {
      setIndisponibilidades([]);
      return;
    }
    try {
      const resultado = await buscarIndisponibilidades({
        data: {
          profissionalId: profissionalIdSelecionado,
          data: dataSelecionadaValor
        }
      });
      if (!resultado.sucesso) {
        setIndisponibilidades([]);
        return;
      }
      setIndisponibilidades(resultado.intervalos);
    } catch (error) {
      console.error(error);
      setIndisponibilidades([]);
    }
  }
  async function handleSubmit(event) {
    event.preventDefault();
    setMensagem("");
    setErro("");
    if (!servicoId || !profissionalId || !dataSelecionada || !horarioSelecionado) {
      setErro("Escolha serviço, profissional, dia e horário.");
      return;
    }
    setEnviando(true);
    try {
      const resultado = await enviarSolicitacao({
        data: {
          servicoId,
          profissionalId,
          inicio: criarInicioIsoLocal(dataSelecionada, horarioSelecionado),
          observacaoCliente: observacao
        }
      });
      if (!resultado.sucesso) {
        setErro(resultado.mensagem);
        return;
      }
      setMensagem(resultado.mensagem);
      setObservacao("");
      await carregarDados();
    } catch (error) {
      console.error(error);
      setErro("Não foi possível enviar a solicitação.");
    } finally {
      setEnviando(false);
    }
  }
  async function handleCancelarAgendamento(agendamentoId, motivoCancelamento) {
    setMensagem("");
    setErro("");
    setCancelandoId(agendamentoId);
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
      fecharModalCancelamento();
      await carregarDados();
    } catch (error) {
      console.error(error);
      setErro("Não foi possível cancelar o agendamento.");
    } finally {
      setCancelandoId("");
    }
  }
  async function handleConfirmarCancelamentoModal() {
    if (!agendamentoCancelamentoId) {
      return;
    }
    await handleCancelarAgendamento(agendamentoCancelamentoId, motivoCancelamentoModal);
  }
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "max-w-7xl p-8 lg:p-12", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(PageHeader, { title: "Agendamentos", subtitle: "Solicite um horário e acompanhe o status dos seus pedidos." }),
    erro && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { role: "alert", className: "mb-6 rounded-xl border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive", children: erro }),
    mensagem && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mb-6 rounded-xl border border-gold/30 bg-gold-soft px-4 py-3 text-sm text-gold", children: mensagem }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid gap-6 xl:grid-cols-[1.1fr_0.9fr]", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("section", { className: "rounded-2xl border border-border bg-surface p-6", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mb-6 flex items-center gap-3", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "grid h-10 w-10 place-items-center rounded-full bg-gold-soft", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Calendar, { className: "h-5 w-5 text-gold" }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "font-display text-lg", children: "Solicitar horário" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-muted-foreground", children: "Escolha o serviço, profissional, dia e horário." })
          ] })
        ] }),
        carregando ? /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-muted-foreground", children: "Carregando opções..." }) : servicos.length === 0 || profissionais.length === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "rounded-xl border border-border bg-background/40 p-5 text-sm text-muted-foreground", children: "Ainda é necessário cadastrar ao menos um serviço e um profissional ativo nas configurações do admin." }) : /* @__PURE__ */ jsxRuntimeExports.jsxs("form", { className: "space-y-6", onSubmit: handleSubmit, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid gap-4 md:grid-cols-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-2", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { htmlFor: "servico", children: "Serviço" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("select", { id: "servico", value: servicoId, onChange: (event) => {
                setServicoId(event.target.value);
                setHorarioSelecionado("");
              }, className: "h-10 w-full rounded-md border border-input bg-background px-3 text-sm", children: servicos.map((servico) => /* @__PURE__ */ jsxRuntimeExports.jsxs("option", { value: servico.id, children: [
                servico.nome,
                " · ",
                servico.duracaoMinutos,
                " min ·",
                " ",
                formatarMoeda(servico.precoCentavos)
              ] }, servico.id)) })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-2", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { htmlFor: "profissional", children: "Profissional" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("select", { id: "profissional", value: profissionalId, onChange: (event) => setProfissionalId(event.target.value), className: "h-10 w-full rounded-md border border-input bg-background px-3 text-sm", children: profissionais.map((profissional) => /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: profissional.id, children: profissional.nome }, profissional.id)) })
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Dia" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-3", children: proximosDias.map((dia) => {
              const ativo = dia === dataSelecionada;
              return /* @__PURE__ */ jsxRuntimeExports.jsxs("button", { type: "button", onClick: () => {
                setDataSelecionada(dia);
                setHorarioSelecionado("");
              }, className: `rounded-xl border px-4 py-3 text-left text-sm transition ${ativo ? "border-gold bg-gold-soft text-gold" : "border-border bg-background/40 hover:bg-surface-elevated"}`, children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "block font-medium capitalize", children: obterNomeDia(dia) }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "mt-1 block text-xs text-muted-foreground", children: [
                  funcionamentoPorDia[criarDataLocal(dia).getDay()].abre,
                  " às ",
                  funcionamentoPorDia[criarDataLocal(dia).getDay()].fecha
                ] })
              ] }, dia);
            }) })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Horário" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mt-3 grid grid-cols-3 gap-3 sm:grid-cols-4 lg:grid-cols-5", children: horariosDisponiveis.map((horario) => {
              const ativo = horario === horarioSelecionado;
              return /* @__PURE__ */ jsxRuntimeExports.jsx("button", { type: "button", onClick: () => setHorarioSelecionado(horario), className: `rounded-xl border px-3 py-2 text-sm transition ${ativo ? "border-gold bg-gold-soft text-gold" : "border-border bg-background/40 hover:bg-surface-elevated"}`, children: horario }, horario);
            }) })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { htmlFor: "observacao", children: "Observação para a equipe" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { id: "observacao", value: observacao, onChange: (event) => setObservacao(event.target.value), placeholder: "Ex: preferência de corte, atraso previsto, detalhe importante..." })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { type: "submit", disabled: enviando, className: "w-full", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(CircleCheck, { className: "mr-2 h-4 w-4" }),
            enviando ? "Enviando solicitação..." : "Enviar solicitação"
          ] })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("section", { className: "rounded-2xl border border-border bg-surface p-6", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mb-6 flex items-center gap-3", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "grid h-10 w-10 place-items-center rounded-full bg-gold-soft", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Clock, { className: "h-5 w-5 text-gold" }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "font-display text-lg", children: "Meus pedidos" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-muted-foreground", children: "Acompanhe solicitações e confirmações." })
          ] })
        ] }),
        carregando ? /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-muted-foreground", children: "Carregando pedidos..." }) : agendamentos.length === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex min-h-56 flex-col items-center justify-center rounded-xl border border-border bg-background/40 p-6 text-center", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Scissors, { className: "h-8 w-8 text-muted-foreground" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "mt-4 font-medium", children: "Nenhum agendamento solicitado" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-2 text-sm text-muted-foreground", children: "Quando você enviar uma solicitação, ela aparecerá aqui." })
        ] }) : /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "space-y-3", children: agendamentos.map((agendamento) => /* @__PURE__ */ jsxRuntimeExports.jsxs("article", { className: "rounded-xl border border-border bg-background/40 p-4", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-start justify-between gap-4", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "font-medium", children: agendamento.servico.nome }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-1 text-sm text-muted-foreground", children: formatarDataHora(agendamento.inicio) }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "mt-1 flex items-center gap-1 text-sm text-muted-foreground", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(UserRound, { className: "h-4 w-4" }),
                agendamento.profissional.nome
              ] })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "rounded-full bg-gold-soft px-3 py-1 text-xs text-gold", children: traduzirStatus(agendamento.status) })
          ] }),
          agendamento.observacaoCliente && /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "mt-3 text-sm text-muted-foreground", children: [
            "Observação: ",
            agendamento.observacaoCliente
          ] }),
          agendamento.motivoRecusa && /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "mt-3 text-sm text-destructive", children: [
            "Motivo da recusa: ",
            agendamento.motivoRecusa
          ] }),
          agendamento.motivoCancelamento && /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "mt-3 text-sm text-destructive", children: [
            "Motivo do cancelamento:",
            " ",
            agendamento.motivoCancelamento
          ] }),
          ["SOLICITADO", "CONFIRMADO"].includes(agendamento.status) && /* @__PURE__ */ jsxRuntimeExports.jsx("button", { type: "button", disabled: cancelandoId === agendamento.id, onClick: () => abrirModalCancelamento(agendamento.id), className: "mt-4 inline-flex h-9 items-center rounded-full border border-destructive/40 px-4 text-sm text-destructive transition hover:bg-destructive/10 disabled:cursor-not-allowed disabled:opacity-60", children: cancelandoId === agendamento.id ? "Cancelando..." : "Cancelar agendamento" })
        ] }, agendamento.id)) })
      ] }),
      agendamentoCancelamentoId && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "fixed inset-0 z-50 flex items-center justify-center bg-background/80 p-4 backdrop-blur-sm", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "w-full max-w-lg rounded-2xl border border-border bg-surface p-6 shadow-xl", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-start justify-between gap-4", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "text-xl font-display", children: "Cancelar agendamento" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-2 text-sm text-muted-foreground", children: "Informe o motivo do cancelamento, se quiser. Esse registro ficará salvo no histórico do seu agendamento." })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("button", { type: "button", onClick: fecharModalCancelamento, className: "rounded-full border border-border px-3 py-1 text-sm text-muted-foreground transition hover:bg-surface-elevated", children: "Fechar" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-6 space-y-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("label", { className: "text-xs uppercase tracking-widest text-muted-foreground", children: "Motivo do cancelamento" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("textarea", { value: motivoCancelamentoModal, onChange: (event) => setMotivoCancelamentoModal(event.target.value), placeholder: "Ex.: não poderei comparecer, surgiu um imprevisto...", className: "min-h-32 w-full rounded-md border border-input bg-background px-3 py-2 text-sm" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("button", { type: "button", onClick: fecharModalCancelamento, disabled: cancelandoId === agendamentoCancelamentoId, className: "inline-flex h-10 items-center justify-center rounded-full border border-border px-5 text-sm transition hover:bg-surface-elevated disabled:cursor-not-allowed disabled:opacity-60", children: "Voltar" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("button", { type: "button", onClick: () => void handleConfirmarCancelamentoModal(), disabled: cancelandoId === agendamentoCancelamentoId, className: "inline-flex h-10 items-center justify-center rounded-full bg-destructive px-5 text-sm text-destructive-foreground transition hover:bg-destructive/90 disabled:cursor-not-allowed disabled:opacity-60", children: cancelandoId === agendamentoCancelamentoId ? "Cancelando..." : "Confirmar cancelamento" })
        ] })
      ] }) })
    ] })
  ] });
}
export {
  AgendamentosPage as component
};
