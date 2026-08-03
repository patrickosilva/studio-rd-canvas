import { c as createServerRpc } from "./createServerRpc-BaohzIh1.mjs";
import { c as createServerFn } from "./server-BeKYjhVv.mjs";
import { prisma } from "./prisma.server-DGhEAvkH.mjs";
import { obterUsuarioAtual } from "./session.server-DqLwM1tR.mjs";
import "../_libs/seroval.mjs";
import "../_libs/react.mjs";
import "../_libs/dotenv.mjs";
import { o as objectType, e as enumType, s as stringType } from "../_libs/zod.mjs";
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
const alterarPapelUsuarioSchema = objectType({
  usuarioId: stringType().trim().min(1, "Usuário inválido."),
  papel: enumType(["CLIENTE", "FUNCIONARIO", "DONO"])
});
async function exigirDono() {
  const usuario = await obterUsuarioAtual();
  if (!usuario) {
    throw new Error("Você precisa estar logado.");
  }
  if (usuario.papel !== "DONO") {
    throw new Error("Acesso negado.");
  }
  return usuario;
}
const adminListarUsuarios_createServerFn_handler = createServerRpc({
  id: "14c1f1f502d9b45c4c1f95c69ee13f62b91e97e3042d0b77bad547bd52097f67",
  name: "adminListarUsuarios",
  filename: "src/lib/api/usuarios.functions.ts"
}, (opts) => adminListarUsuarios.__executeServer(opts));
const adminListarUsuarios = createServerFn({
  method: "GET"
}).handler(adminListarUsuarios_createServerFn_handler, async () => {
  await exigirDono();
  return prisma.usuario.findMany({
    orderBy: {
      criadoEm: "desc"
    },
    select: {
      id: true,
      nome: true,
      email: true,
      telefone: true,
      papel: true,
      ativo: true,
      criadoEm: true,
      atualizadoEm: true,
      profissional: {
        select: {
          id: true,
          nome: true,
          ativo: true
        }
      }
    }
  });
});
const adminAlterarPapelUsuario_createServerFn_handler = createServerRpc({
  id: "915c6d12c35421f6816af466b04c222ad68755a10f10a5d83a52ac9f23d05aa1",
  name: "adminAlterarPapelUsuario",
  filename: "src/lib/api/usuarios.functions.ts"
}, (opts) => adminAlterarPapelUsuario.__executeServer(opts));
const adminAlterarPapelUsuario = createServerFn({
  method: "POST"
}).validator(alterarPapelUsuarioSchema).handler(adminAlterarPapelUsuario_createServerFn_handler, async ({
  data
}) => {
  const donoAtual = await exigirDono();
  if (data.usuarioId === donoAtual.id) {
    return {
      sucesso: false,
      mensagem: "Por segurança, você não pode alterar o papel da sua própria conta."
    };
  }
  const usuario = await prisma.usuario.findUnique({
    where: {
      id: data.usuarioId
    },
    select: {
      id: true,
      nome: true,
      papel: true
    }
  });
  if (!usuario) {
    return {
      sucesso: false,
      mensagem: "Usuário não encontrado."
    };
  }
  const papel = data.papel;
  const usuarioAtualizado = await prisma.usuario.update({
    where: {
      id: usuario.id
    },
    data: {
      papel
    },
    select: {
      id: true,
      nome: true,
      email: true,
      telefone: true,
      papel: true,
      ativo: true,
      criadoEm: true,
      atualizadoEm: true,
      profissional: {
        select: {
          id: true,
          nome: true,
          ativo: true
        }
      }
    }
  });
  return {
    sucesso: true,
    mensagem: `Papel de ${usuarioAtualizado.nome} atualizado para ${usuarioAtualizado.papel}.`,
    usuario: usuarioAtualizado
  };
});
export {
  adminAlterarPapelUsuario_createServerFn_handler,
  adminListarUsuarios_createServerFn_handler
};
