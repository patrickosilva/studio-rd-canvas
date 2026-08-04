import { c as createServerRpc } from "./createServerRpc-CwtiRIfn.js";
import { c as createServerFn } from "./server-n3LmVJQm.js";
import { z } from "zod";
import { hash, compare } from "bcryptjs";
import { prisma } from "./prisma.server-DGhEAvkH.js";
import { obterUsuarioAtual, encerrarSessaoAtual, criarSessao } from "./session.server-Dmdt7VsU.js";
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
const PASSWORD_ROUNDS = 12;
function gerarHashSenha(senha) {
  return hash(senha, PASSWORD_ROUNDS);
}
function verificarSenha(senhaInformada, senhaHash) {
  return compare(senhaInformada, senhaHash);
}
const obterUsuarioAtualFn_createServerFn_handler = createServerRpc({
  id: "4c6b1543dbabcab4e515645ae9b990b60d036f7f649a8bca2ea9ef94d45c622e",
  name: "obterUsuarioAtualFn",
  filename: "src/lib/api/auth.functions.ts"
}, (opts) => obterUsuarioAtualFn.__executeServer(opts));
const obterUsuarioAtualFn = createServerFn({
  method: "GET"
}).handler(obterUsuarioAtualFn_createServerFn_handler, async () => {
  const usuario = await obterUsuarioAtual();
  if (!usuario) {
    return null;
  }
  return {
    id: usuario.id,
    nome: usuario.nome,
    email: usuario.email,
    telefone: usuario.telefone,
    papel: usuario.papel
  };
});
const sair_createServerFn_handler = createServerRpc({
  id: "21b8f98a86e4a15e2c4cef88a3485cf31d5d08d6fa5e45f668e001907171a63c",
  name: "sair",
  filename: "src/lib/api/auth.functions.ts"
}, (opts) => sair.__executeServer(opts));
const sair = createServerFn({
  method: "POST"
}).handler(sair_createServerFn_handler, async () => {
  await encerrarSessaoAtual();
  return {
    sucesso: true
  };
});
const cadastroSchema = z.object({
  nome: z.string().trim().min(3, "O nome precisa ter pelo menos 3 caracteres.").max(100, "O nome é muito grande."),
  email: z.string().trim().email("Informe um e-mail válido."),
  telefone: z.string().trim().max(20, "Telefone inválido.").optional().or(z.literal("")),
  senha: z.string().min(8, "A senha precisa ter pelo menos 8 caracteres.").max(72, "A senha é muito grande.")
});
const loginSchema = z.object({
  email: z.string().trim().email("Informe um e-mail válido."),
  senha: z.string().min(1, "Informe sua senha.").max(72, "A senha é muito grande."),
  manterConectado: z.boolean().default(false),
  redirect: z.string().trim().max(300).optional()
});
function obterRotaInicial(papel) {
  switch (papel) {
    case "CLIENTE":
      return "/cliente";
    case "FUNCIONARIO":
      return "/funcionario";
    case "DONO":
      return "/admin";
  }
}
function redirectPermitido(redirect, papel) {
  if (!redirect) {
    return false;
  }
  if (!redirect.startsWith("/") || redirect.startsWith("//")) {
    return false;
  }
  switch (papel) {
    case "CLIENTE":
      return redirect === "/cliente" || redirect.startsWith("/cliente/");
    case "FUNCIONARIO":
      return redirect === "/funcionario" || redirect.startsWith("/funcionario/");
    case "DONO":
      return redirect === "/admin" || redirect.startsWith("/admin/");
  }
}
function obterDestinoDepoisDoLogin(papel, redirect) {
  if (redirectPermitido(redirect, papel)) {
    return redirect;
  }
  return obterRotaInicial(papel);
}
const cadastrarCliente_createServerFn_handler = createServerRpc({
  id: "437c2945790358e3468a44542ba4f1129f341a958f13be44b51f368deda7d05c",
  name: "cadastrarCliente",
  filename: "src/lib/api/auth.functions.ts"
}, (opts) => cadastrarCliente.__executeServer(opts));
const cadastrarCliente = createServerFn({
  method: "POST"
}).validator(cadastroSchema).handler(cadastrarCliente_createServerFn_handler, async ({
  data
}) => {
  const email = data.email.trim().toLowerCase();
  const telefoneNormalizado = data.telefone?.replace(/\D/g, "") || null;
  const usuarioExistente = await prisma.usuario.findFirst({
    where: {
      OR: [{
        email
      }, ...telefoneNormalizado ? [{
        telefone: telefoneNormalizado
      }] : []]
    },
    select: {
      email: true,
      telefone: true
    }
  });
  if (usuarioExistente) {
    return {
      sucesso: false,
      mensagem: usuarioExistente.email === email ? "Já existe uma conta com esse e-mail." : "Já existe uma conta com esse telefone."
    };
  }
  const senhaHash = await gerarHashSenha(data.senha);
  const usuario = await prisma.usuario.create({
    data: {
      nome: data.nome.trim(),
      email,
      telefone: telefoneNormalizado,
      senhaHash
      // O Prisma aplica automaticamente CLIENTE,
      // conforme o valor padrão definido no schema.
    },
    select: {
      id: true,
      nome: true,
      email: true,
      telefone: true,
      papel: true,
      criadoEm: true
    }
  });
  return {
    sucesso: true,
    mensagem: "Cadastro realizado com sucesso.",
    usuario
  };
});
const entrar_createServerFn_handler = createServerRpc({
  id: "ed4e1a4c2eaabdff9e752241bec55f15eb6e22cf1e8a0c5d9abd5df93735fabf",
  name: "entrar",
  filename: "src/lib/api/auth.functions.ts"
}, (opts) => entrar.__executeServer(opts));
const entrar = createServerFn({
  method: "POST"
}).validator(loginSchema).handler(entrar_createServerFn_handler, async ({
  data
}) => {
  const email = data.email.trim().toLowerCase();
  const usuario = await prisma.usuario.findUnique({
    where: {
      email
    },
    select: {
      id: true,
      nome: true,
      email: true,
      senhaHash: true,
      papel: true,
      ativo: true
    }
  });
  if (!usuario || !usuario.ativo) {
    return {
      sucesso: false,
      mensagem: "E-mail ou senha inválidos."
    };
  }
  const senhaValida = await verificarSenha(data.senha, usuario.senhaHash);
  if (!senhaValida) {
    return {
      sucesso: false,
      mensagem: "E-mail ou senha inválidos."
    };
  }
  await criarSessao(usuario.id, data.manterConectado);
  const destino = obterDestinoDepoisDoLogin(usuario.papel, data.redirect);
  return {
    sucesso: true,
    mensagem: "Login realizado com sucesso.",
    destino,
    usuario: {
      id: usuario.id,
      nome: usuario.nome,
      email: usuario.email,
      papel: usuario.papel
    }
  };
});
export {
  cadastrarCliente_createServerFn_handler,
  entrar_createServerFn_handler,
  obterUsuarioAtualFn_createServerFn_handler,
  sair_createServerFn_handler
};
