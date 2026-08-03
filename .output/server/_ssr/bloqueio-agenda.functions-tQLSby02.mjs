import { c as createServerRpc } from "./createServerRpc-BaohzIh1.mjs";
import { c as createServerFn } from "./server-BeKYjhVv.mjs";
import { prisma } from "./prisma.server-DGhEAvkH.mjs";
import { obterUsuarioAtual } from "./session.server-DqLwM1tR.mjs";
import "../_libs/seroval.mjs";
import "../_libs/react.mjs";
import "../_libs/dotenv.mjs";
import { o as objectType, s as stringType, l as literalType } from "../_libs/zod.mjs";
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
import "../_libs/prisma__adapter-pg.mjs";
import "../_libs/prisma__driver-adapter-utils.mjs";
import "../_libs/prisma__debug.mjs";
import "../_libs/pg.mjs";
import "events";
import "util/types";
import "dns";
import "net";
import "tls";
import "../_libs/pg-types.mjs";
import "../_libs/postgres-array.mjs";
import "../_libs/postgres-date.mjs";
import "../_libs/postgres-interval.mjs";
import "../_libs/xtend.mjs";
import "../_libs/postgres-bytea.mjs";
import "../_libs/pg-int8.mjs";
import "../_libs/pg-connection-string.mjs";
import "fs";
import "../_libs/pg-protocol.mjs";
import "../_libs/pg-cloudflare.mjs";
import "../_libs/pgpass.mjs";
import "path";
import "../_libs/split2.mjs";
import "string_decoder";
import "../_libs/pg-pool.mjs";
import "node:path";
import "node:url";
import "@prisma/client/runtime/client";
import "node:crypto";
import "os";
const criarBloqueioAgendaSchema = objectType({
  profissionalId: stringType().trim().optional().or(literalType("")),
  inicio: stringType().trim().min(1, "Informe o início do bloqueio."),
  fim: stringType().trim().min(1, "Informe o fim do bloqueio."),
  motivo: stringType().trim().max(300, "O motivo é muito grande.").optional().or(literalType(""))
});
const removerBloqueioAgendaSchema = objectType({
  bloqueioId: stringType().trim().min(1, "Bloqueio inválido.")
});
async function exigirOperacional() {
  const usuario = await obterUsuarioAtual();
  if (!usuario) {
    throw new Error("Você precisa estar logado.");
  }
  if (usuario.papel !== "FUNCIONARIO" && usuario.papel !== "DONO") {
    throw new Error("Acesso negado.");
  }
  return usuario;
}
const listarBloqueiosAgenda_createServerFn_handler = createServerRpc({
  id: "62ec7a62ad5b0a23623c54b791e76ee0b9c65ea1b11c15279f051df7e50ed8d2",
  name: "listarBloqueiosAgenda",
  filename: "src/lib/api/bloqueio-agenda.functions.ts"
}, (opts) => listarBloqueiosAgenda.__executeServer(opts));
const listarBloqueiosAgenda = createServerFn({
  method: "GET"
}).handler(listarBloqueiosAgenda_createServerFn_handler, async () => {
  await exigirOperacional();
  return prisma.bloqueioAgenda.findMany({
    where: {
      ativo: true
    },
    orderBy: {
      inicio: "desc"
    },
    select: {
      id: true,
      profissionalId: true,
      inicio: true,
      fim: true,
      motivo: true,
      ativo: true,
      criadoEm: true,
      atualizadoEm: true,
      profissional: {
        select: {
          id: true,
          nome: true
        }
      }
    }
  });
});
const criarBloqueioAgenda_createServerFn_handler = createServerRpc({
  id: "0e0e5c7f84714efb2203feb27040c7bf66eec94c4ddb5db99e9b37bfdf0bc108",
  name: "criarBloqueioAgenda",
  filename: "src/lib/api/bloqueio-agenda.functions.ts"
}, (opts) => criarBloqueioAgenda.__executeServer(opts));
const criarBloqueioAgenda = createServerFn({
  method: "POST"
}).validator(criarBloqueioAgendaSchema).handler(criarBloqueioAgenda_createServerFn_handler, async ({
  data
}) => {
  await exigirOperacional();
  const inicio = new Date(data.inicio);
  const fim = new Date(data.fim);
  if (Number.isNaN(inicio.getTime()) || Number.isNaN(fim.getTime())) {
    return {
      sucesso: false,
      mensagem: "Data inválida."
    };
  }
  if (fim <= inicio) {
    return {
      sucesso: false,
      mensagem: "O fim do bloqueio precisa ser depois do início."
    };
  }
  const profissionalId = data.profissionalId?.trim() || null;
  if (profissionalId) {
    const profissional = await prisma.profissional.findFirst({
      where: {
        id: profissionalId,
        ativo: true
      },
      select: {
        id: true
      }
    });
    if (!profissional) {
      return {
        sucesso: false,
        mensagem: "Profissional não encontrado ou inativo."
      };
    }
  }
  const bloqueio = await prisma.bloqueioAgenda.create({
    data: {
      profissionalId,
      inicio,
      fim,
      motivo: data.motivo?.trim() || null
    },
    select: {
      id: true,
      profissionalId: true,
      inicio: true,
      fim: true,
      motivo: true,
      ativo: true,
      profissional: {
        select: {
          id: true,
          nome: true
        }
      }
    }
  });
  return {
    sucesso: true,
    mensagem: "Bloqueio criado com sucesso.",
    bloqueio
  };
});
const removerBloqueioAgenda_createServerFn_handler = createServerRpc({
  id: "cfff6113b35a8d60b7c007076a06359311bcb6bf4cf667927839816a4400a0cf",
  name: "removerBloqueioAgenda",
  filename: "src/lib/api/bloqueio-agenda.functions.ts"
}, (opts) => removerBloqueioAgenda.__executeServer(opts));
const removerBloqueioAgenda = createServerFn({
  method: "POST"
}).validator(removerBloqueioAgendaSchema).handler(removerBloqueioAgenda_createServerFn_handler, async ({
  data
}) => {
  await exigirOperacional();
  const bloqueio = await prisma.bloqueioAgenda.findUnique({
    where: {
      id: data.bloqueioId
    },
    select: {
      id: true
    }
  });
  if (!bloqueio) {
    return {
      sucesso: false,
      mensagem: "Bloqueio não encontrado."
    };
  }
  await prisma.bloqueioAgenda.update({
    where: {
      id: bloqueio.id
    },
    data: {
      ativo: false
    }
  });
  return {
    sucesso: true,
    mensagem: "Bloqueio removido com sucesso."
  };
});
export {
  criarBloqueioAgenda_createServerFn_handler,
  listarBloqueiosAgenda_createServerFn_handler,
  removerBloqueioAgenda_createServerFn_handler
};
