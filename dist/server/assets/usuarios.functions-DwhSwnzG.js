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
const alterarPapelUsuarioSchema = z.object({
  usuarioId: z.string().trim().min(1, "Usuário inválido."),
  papel: z.enum(["CLIENTE", "FUNCIONARIO", "DONO"])
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
