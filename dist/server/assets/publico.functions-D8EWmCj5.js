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
const listarDadosPublicosStudio_createServerFn_handler = createServerRpc({
  id: "9cd63a6b36763eb306ef3c07f5f0fce1990bd076bab04badd4abea1b3673e375",
  name: "listarDadosPublicosStudio",
  filename: "src/lib/api/publico.functions.ts"
}, (opts) => listarDadosPublicosStudio.__executeServer(opts));
const listarDadosPublicosStudio = createServerFn({
  method: "GET"
}).handler(listarDadosPublicosStudio_createServerFn_handler, async () => {
  const prisma = await getPrisma();
  const [servicos, planos] = await Promise.all([prisma.servico.findMany({
    where: {
      ativo: true
    },
    orderBy: {
      precoCentavos: "asc"
    },
    select: {
      id: true,
      nome: true,
      descricao: true,
      duracaoMinutos: true,
      precoCentavos: true
    }
  }), prisma.planoAssinatura.findMany({
    where: {
      ativo: true
    },
    orderBy: {
      precoCentavos: "asc"
    },
    select: {
      id: true,
      nome: true,
      descricao: true,
      precoCentavos: true,
      cortesPorCiclo: true,
      duracaoDias: true
    }
  })]);
  return {
    servicos,
    planos
  };
});
export {
  listarDadosPublicosStudio_createServerFn_handler
};
