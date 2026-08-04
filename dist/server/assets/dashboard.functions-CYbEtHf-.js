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
async function exigirDonoDashboard() {
  const {
    obterUsuarioAtual
  } = await import("./session.server-Dmdt7VsU.js");
  const usuario = await obterUsuarioAtual();
  if (!usuario) {
    throw new Error("Você precisa estar logado.");
  }
  if (usuario.papel !== "DONO") {
    throw new Error("Acesso negado.");
  }
  return usuario;
}
function inicioDoDia(data) {
  const novaData = new Date(data);
  novaData.setHours(0, 0, 0, 0);
  return novaData;
}
function fimDoDia(data) {
  const novaData = new Date(data);
  novaData.setHours(23, 59, 59, 999);
  return novaData;
}
function inicioDoMes(data) {
  return new Date(data.getFullYear(), data.getMonth(), 1);
}
function fimDoMes(data) {
  return new Date(data.getFullYear(), data.getMonth() + 1, 0, 23, 59, 59, 999);
}
const adminBuscarResumoDashboard_createServerFn_handler = createServerRpc({
  id: "f5abc866ae5a914d2d5aceb398a60224c2596520d17963d0ee679d7c2f26a64c",
  name: "adminBuscarResumoDashboard",
  filename: "src/lib/api/dashboard.functions.ts"
}, (opts) => adminBuscarResumoDashboard.__executeServer(opts));
const adminBuscarResumoDashboard = createServerFn({
  method: "GET"
}).handler(adminBuscarResumoDashboard_createServerFn_handler, async () => {
  await exigirDonoDashboard();
  const prisma = await getPrisma();
  const agora = /* @__PURE__ */ new Date();
  const hojeInicio = inicioDoDia(agora);
  const hojeFim = fimDoDia(agora);
  const mesInicio = inicioDoMes(agora);
  const mesFim = fimDoMes(agora);
  const [agendamentosHoje, solicitacoesPendentes, agendamentosConcluidosHoje, agendamentosConcluidosMes, pagamentosAssinaturaHoje, pagamentosAssinaturaMes, assinaturasAtivas, proximosAgendamentos] = await Promise.all([prisma.agendamento.findMany({
    where: {
      inicio: {
        gte: hojeInicio,
        lte: hojeFim
      },
      status: {
        in: ["SOLICITADO", "CONFIRMADO", "CONCLUIDO"]
      }
    },
    select: {
      id: true,
      inicio: true,
      fim: true,
      status: true,
      valorPagoCentavos: true,
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
      },
      cliente: {
        select: {
          nome: true,
          telefone: true
        }
      }
    },
    orderBy: {
      inicio: "asc"
    }
  }), prisma.agendamento.count({
    where: {
      status: "SOLICITADO"
    }
  }), prisma.agendamento.findMany({
    where: {
      status: "CONCLUIDO",
      pagoEm: {
        gte: hojeInicio,
        lte: hojeFim
      }
    },
    select: {
      valorPagoCentavos: true,
      servico: {
        select: {
          precoCentavos: true
        }
      }
    }
  }), prisma.agendamento.findMany({
    where: {
      status: "CONCLUIDO",
      pagoEm: {
        gte: mesInicio,
        lte: mesFim
      }
    },
    select: {
      valorPagoCentavos: true,
      servico: {
        select: {
          precoCentavos: true
        }
      }
    }
  }), prisma.pagamentoAssinatura.findMany({
    where: {
      pagoEm: {
        gte: hojeInicio,
        lte: hojeFim
      }
    },
    select: {
      valorCentavos: true
    }
  }), prisma.pagamentoAssinatura.findMany({
    where: {
      pagoEm: {
        gte: mesInicio,
        lte: mesFim
      }
    },
    select: {
      valorCentavos: true
    }
  }), prisma.assinaturaCliente.count({
    where: {
      status: "ATIVA",
      vigenciaFim: {
        gte: agora
      }
    }
  }), prisma.agendamento.findMany({
    where: {
      inicio: {
        gte: agora
      },
      status: {
        in: ["SOLICITADO", "CONFIRMADO"]
      }
    },
    take: 6,
    orderBy: {
      inicio: "asc"
    },
    select: {
      id: true,
      inicio: true,
      fim: true,
      status: true,
      cliente: {
        select: {
          nome: true,
          telefone: true
        }
      },
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
  })]);
  const receitaAtendimentosHoje = agendamentosConcluidosHoje.reduce((total, agendamento) => total + (agendamento.valorPagoCentavos ?? agendamento.servico.precoCentavos), 0);
  const receitaAtendimentosMes = agendamentosConcluidosMes.reduce((total, agendamento) => total + (agendamento.valorPagoCentavos ?? agendamento.servico.precoCentavos), 0);
  const receitaAssinaturasHoje = pagamentosAssinaturaHoje.reduce((total, pagamento) => total + pagamento.valorCentavos, 0);
  const receitaAssinaturasMes = pagamentosAssinaturaMes.reduce((total, pagamento) => total + pagamento.valorCentavos, 0);
  const receitaPrevistaHoje = agendamentosHoje.filter((agendamento) => ["SOLICITADO", "CONFIRMADO"].includes(agendamento.status)).reduce((total, agendamento) => total + agendamento.servico.precoCentavos, 0);
  return {
    cards: {
      agendamentosHoje: agendamentosHoje.length,
      solicitacoesPendentes,
      receitaHoje: receitaAtendimentosHoje + receitaAssinaturasHoje,
      receitaMes: receitaAtendimentosMes + receitaAssinaturasMes,
      receitaPrevistaHoje,
      assinaturasAtivas
    },
    agendamentosHoje,
    proximosAgendamentos
  };
});
export {
  adminBuscarResumoDashboard_createServerFn_handler
};
