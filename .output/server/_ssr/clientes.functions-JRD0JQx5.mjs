import { c as createServerRpc } from "./createServerRpc-BaohzIh1.mjs";
import { c as createServerFn } from "./server-BeKYjhVv.mjs";
import "../_libs/seroval.mjs";
import "../_libs/react.mjs";
import "node:async_hooks";
import "../_libs/h3-v2.mjs";
import "../_libs/rou3.mjs";
import "../_libs/srvx.mjs";
import "node:http";
import "node:stream";
import "node:stream/promises";
import "node:https";
import "node:http2";
import "../_libs/tanstack__router-core.mjs";
import "../_libs/tanstack__history.mjs";
import "../_libs/cookie-es.mjs";
import "../_libs/seroval-plugins.mjs";
import "node:stream/web";
import "../_libs/tanstack__react-router.mjs";
import "../_libs/react-dom.mjs";
import "util";
import "async_hooks";
import "stream";
import "crypto";
import "../_libs/isbot.mjs";
async function getPrisma() {
  const {
    prisma
  } = await import("./prisma.server-DGhEAvkH.mjs");
  return prisma;
}
async function exigirDonoClientes() {
  const {
    obterUsuarioAtual
  } = await import("./session.server-DqLwM1tR.mjs");
  const usuario = await obterUsuarioAtual();
  if (!usuario) {
    throw new Error("Você precisa estar logado.");
  }
  if (usuario.papel !== "DONO") {
    throw new Error("Acesso negado.");
  }
  return usuario;
}
const adminListarClientesResumo_createServerFn_handler = createServerRpc({
  id: "075a97a93b670f199dfcd8bbf8c998ba49134c483dc4e44607f6510a0c160344",
  name: "adminListarClientesResumo",
  filename: "src/lib/api/clientes.functions.ts"
}, (opts) => adminListarClientesResumo.__executeServer(opts));
const adminListarClientesResumo = createServerFn({
  method: "GET"
}).handler(adminListarClientesResumo_createServerFn_handler, async () => {
  await exigirDonoClientes();
  const prisma = await getPrisma();
  const agora = /* @__PURE__ */ new Date();
  const clientes = await prisma.usuario.findMany({
    where: {
      papel: "CLIENTE"
    },
    orderBy: {
      criadoEm: "desc"
    },
    select: {
      id: true,
      nome: true,
      email: true,
      telefone: true,
      criadoEm: true,
      agendamentos: {
        orderBy: {
          inicio: "desc"
        },
        select: {
          id: true,
          inicio: true,
          status: true,
          valorPagoCentavos: true,
          servico: {
            select: {
              nome: true,
              precoCentavos: true
            }
          }
        }
      },
      assinaturas: {
        orderBy: {
          criadoEm: "desc"
        },
        select: {
          id: true,
          status: true,
          vigenciaFim: true,
          saldoCortes: true,
          plano: {
            select: {
              nome: true
            }
          }
        }
      }
    }
  });
  return clientes.map((cliente) => {
    const agendamentosConcluidos = cliente.agendamentos.filter((agendamento) => agendamento.status === "CONCLUIDO");
    const totalGastoCentavos = agendamentosConcluidos.reduce((total, agendamento) => total + (agendamento.valorPagoCentavos ?? agendamento.servico.precoCentavos), 0);
    const assinaturaAtiva = cliente.assinaturas.find((assinatura) => assinatura.status === "ATIVA" && assinatura.vigenciaFim >= agora);
    const ultimoAgendamento = cliente.agendamentos[0] ?? null;
    return {
      id: cliente.id,
      nome: cliente.nome,
      email: cliente.email,
      telefone: cliente.telefone,
      criadoEm: cliente.criadoEm,
      totalAgendamentos: cliente.agendamentos.length,
      totalConcluidos: agendamentosConcluidos.length,
      totalGastoCentavos,
      ultimoAgendamento,
      assinaturaAtiva: assinaturaAtiva ? {
        id: assinaturaAtiva.id,
        status: assinaturaAtiva.status,
        vigenciaFim: assinaturaAtiva.vigenciaFim,
        saldoCortes: assinaturaAtiva.saldoCortes,
        planoNome: assinaturaAtiva.plano.nome
      } : null
    };
  });
});
export {
  adminListarClientesResumo_createServerFn_handler
};
