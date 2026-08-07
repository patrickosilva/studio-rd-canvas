import { c as createServerRpc } from "./createServerRpc-CwtiRIfn.js";
import { c as createServerFn } from "./server-n3LmVJQm.js";
import { z } from "zod";
import { prisma } from "./prisma.server-DGhEAvkH.js";
import { obterUsuarioAtual } from "./session.server-Dmdt7VsU.js";
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
import "dotenv/config";
import "@prisma/adapter-pg";
import "node:path";
import "node:url";
import "@prisma/client/runtime/client";
import "node:crypto";
const criarBloqueioAgendaSchema = z.object({
  profissionalId: z.string().trim().optional().or(z.literal("")),
  inicio: z.string().trim().min(1, "Informe o início do bloqueio."),
  fim: z.string().trim().min(1, "Informe o fim do bloqueio."),
  motivo: z.string().trim().max(300, "O motivo é muito grande.").optional().or(z.literal(""))
});
const removerBloqueioAgendaSchema = z.object({
  bloqueioId: z.string().trim().min(1, "Bloqueio inválido.")
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
