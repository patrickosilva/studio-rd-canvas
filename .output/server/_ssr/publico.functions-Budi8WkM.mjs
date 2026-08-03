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
