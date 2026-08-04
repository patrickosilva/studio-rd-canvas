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
async function exigirDonoClientes() {
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
