import { c as createServerRpc } from "./createServerRpc-CwtiRIfn.js";
import { c as createServerFn } from "./server-n3LmVJQm.js";
import "node:async_hooks";
import "h3-v2";
import "@tanstack/router-core";
import "seroval";
import "@tanstack/history";
import "@tanstack/router-core/ssr/client";
import "@tanstack/router-core/ssr/server";
import "react";
import "@tanstack/react-router";
import "react/jsx-runtime";
import "@tanstack/react-router/ssr/server";
async function getPrisma() {
  const {
    prisma
  } = await import("./prisma.server-DGhEAvkH.js");
  return prisma;
}
async function exigirUsuarioLogado() {
  const {
    obterUsuarioAtual
  } = await import("./session.server-Dmdt7VsU.js");
  const usuario = await obterUsuarioAtual();
  if (!usuario) {
    throw new Error("Você precisa estar logado.");
  }
  return usuario;
}
function calcularPontos(valorCentavos) {
  return Math.floor(valorCentavos / 100);
}
const recompensas = [{
  id: "barba-gratis",
  nome: "Barba grátis",
  pontosNecessarios: 800,
  descricao: "Use seus pontos para ganhar uma barba gratuita."
}, {
  id: "corte-gratis",
  nome: "Corte grátis",
  pontosNecessarios: 1500,
  descricao: "Use seus pontos para ganhar um corte gratuito."
}, {
  id: "produto-premium",
  nome: "Produto premium",
  pontosNecessarios: 2500,
  descricao: "Troque seus pontos por um produto premium selecionado."
}];
const clienteBuscarFidelidade_createServerFn_handler = createServerRpc({
  id: "d3b8c3b283e09f4f72bc3de1764fb1e6962584e1134b64a345e821d0a1380012",
  name: "clienteBuscarFidelidade",
  filename: "src/lib/api/fidelidade.functions.ts"
}, (opts) => clienteBuscarFidelidade.__executeServer(opts));
const clienteBuscarFidelidade = createServerFn({
  method: "GET"
}).handler(clienteBuscarFidelidade_createServerFn_handler, async () => {
  const usuario = await exigirUsuarioLogado();
  const prisma = await getPrisma();
  const [agendamentosConcluidos, pagamentosAssinatura] = await Promise.all([prisma.agendamento.findMany({
    where: {
      clienteId: usuario.id,
      status: "CONCLUIDO"
    },
    orderBy: {
      inicio: "desc"
    },
    select: {
      id: true,
      inicio: true,
      valorPagoCentavos: true,
      formaPagamento: true,
      servico: {
        select: {
          nome: true,
          precoCentavos: true
        }
      },
      profissional: {
        select: {
          nome: true
        }
      }
    }
  }), prisma.pagamentoAssinatura.findMany({
    where: {
      assinatura: {
        clienteId: usuario.id
      }
    },
    orderBy: {
      pagoEm: "desc"
    },
    select: {
      id: true,
      pagoEm: true,
      valorCentavos: true,
      formaPagamento: true,
      assinatura: {
        select: {
          plano: {
            select: {
              nome: true
            }
          }
        }
      }
    }
  })]);
  const eventosAtendimentos = agendamentosConcluidos.map((agendamento) => {
    const valorCentavos = agendamento.valorPagoCentavos ?? agendamento.servico.precoCentavos;
    return {
      id: `agendamento-${agendamento.id}`,
      tipo: "ATENDIMENTO",
      titulo: agendamento.servico.nome,
      descricao: `Atendimento com ${agendamento.profissional.nome}`,
      data: agendamento.inicio,
      valorCentavos,
      pontos: calcularPontos(valorCentavos)
    };
  });
  const eventosAssinaturas = pagamentosAssinatura.map((pagamento) => {
    return {
      id: `assinatura-${pagamento.id}`,
      tipo: "ASSINATURA",
      titulo: pagamento.assinatura.plano.nome,
      descricao: "Pagamento de assinatura RD Black",
      data: pagamento.pagoEm,
      valorCentavos: pagamento.valorCentavos,
      pontos: calcularPontos(pagamento.valorCentavos)
    };
  });
  const eventos = [...eventosAtendimentos, ...eventosAssinaturas].sort((a, b) => new Date(b.data).getTime() - new Date(a.data).getTime());
  const pontosTotais = eventos.reduce((total, evento) => total + evento.pontos, 0);
  const proximaRecompensa = recompensas.find((recompensa) => recompensa.pontosNecessarios > pontosTotais) ?? null;
  const pontosParaProximaRecompensa = proximaRecompensa ? proximaRecompensa.pontosNecessarios - pontosTotais : 0;
  const metaAtual = proximaRecompensa?.pontosNecessarios ?? recompensas[recompensas.length - 1].pontosNecessarios;
  const progresso = Math.min(100, Math.round(pontosTotais / metaAtual * 100));
  return {
    pontosTotais,
    pontosParaProximaRecompensa,
    progresso,
    proximaRecompensa,
    recompensas: recompensas.map((recompensa) => ({
      ...recompensa,
      disponivel: pontosTotais >= recompensa.pontosNecessarios
    })),
    eventos: eventos.slice(0, 10)
  };
});
export {
  clienteBuscarFidelidade_createServerFn_handler
};
