import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

import type { PapelUsuario } from "../../generated/prisma/client";
import { gerarHashSenha, verificarSenha } from "../auth.server";
import { prisma } from "../prisma.server";
import {
  criarSessao,
  encerrarSessaoAtual,
  obterUsuarioAtual as obterUsuarioAtualDaSessao,
} from "../session.server";

export const obterUsuarioAtualFn = createServerFn({
  method: "GET",
}).handler(async () => {
  const usuario = await obterUsuarioAtualDaSessao();

  if (!usuario) {
    return null;
  }

  return {
    id: usuario.id,
    nome: usuario.nome,
    email: usuario.email,
    telefone: usuario.telefone,
    papel: usuario.papel,
  };
});

export const sair = createServerFn({
  method: "POST",
}).handler(async () => {
  await encerrarSessaoAtual();

  return {
    sucesso: true,
  };
});

const cadastroSchema = z.object({
  nome: z
    .string()
    .trim()
    .min(3, "O nome precisa ter pelo menos 3 caracteres.")
    .max(100, "O nome é muito grande."),

  email: z
    .string()
    .trim()
    .email("Informe um e-mail válido."),

  telefone: z
    .string()
    .trim()
    .max(20, "Telefone inválido.")
    .optional()
    .or(z.literal("")),

  senha: z
    .string()
    .min(8, "A senha precisa ter pelo menos 8 caracteres.")
    .max(72, "A senha é muito grande."),
});

const loginSchema = z.object({
  email: z
    .string()
    .trim()
    .email("Informe um e-mail válido."),

  senha: z
    .string()
    .min(1, "Informe sua senha.")
    .max(72, "A senha é muito grande."),

  manterConectado: z.boolean().default(false),

  redirect: z
    .string()
    .trim()
    .max(300)
    .optional(),
});

function obterRotaInicial(papel: PapelUsuario): string {
  switch (papel) {
    case "CLIENTE":
      return "/cliente";

    case "FUNCIONARIO":
      return "/funcionario";

    case "DONO":
      return "/admin";
  }
}

function redirectPermitido(
  redirect: string | undefined,
  papel: PapelUsuario,
): boolean {
  if (!redirect) {
    return false;
  }

  /*
   * Aceitamos somente caminhos internos.
   *
   * Exemplos permitidos:
   * /cliente
   * /cliente/agendamentos
   *
   * Exemplos bloqueados:
   * https://outro-site.com
   * //outro-site.com
   */
  if (!redirect.startsWith("/") || redirect.startsWith("//")) {
    return false;
  }

  switch (papel) {
    case "CLIENTE":
      return (
        redirect === "/cliente" ||
        redirect.startsWith("/cliente/")
      );

    case "FUNCIONARIO":
      return (
        redirect === "/funcionario" ||
        redirect.startsWith("/funcionario/")
      );

    case "DONO":
      return (
        redirect === "/admin" ||
        redirect.startsWith("/admin/")
      );
  }
}

function obterDestinoDepoisDoLogin(
  papel: PapelUsuario,
  redirect?: string,
): string {
  if (redirectPermitido(redirect, papel)) {
    return redirect as string;
  }

  return obterRotaInicial(papel);
}

export const cadastrarCliente = createServerFn({
  method: "POST",
})
  .validator(cadastroSchema)
  .handler(async ({ data }) => {
    const email = data.email.trim().toLowerCase();

    const telefoneNormalizado =
      data.telefone?.replace(/\D/g, "") || null;

    const usuarioExistente = await prisma.usuario.findFirst({
      where: {
        OR: [
          {
            email,
          },
          ...(telefoneNormalizado
            ? [
                {
                  telefone: telefoneNormalizado,
                },
              ]
            : []),
        ],
      },
      select: {
        email: true,
        telefone: true,
      },
    });

    if (usuarioExistente) {
      return {
        sucesso: false,
        mensagem:
          usuarioExistente.email === email
            ? "Já existe uma conta com esse e-mail."
            : "Já existe uma conta com esse telefone.",
      };
    }

    const senhaHash = await gerarHashSenha(data.senha);

    const usuario = await prisma.usuario.create({
      data: {
        nome: data.nome.trim(),
        email,
        telefone: telefoneNormalizado,
        senhaHash,

        // O Prisma aplica automaticamente CLIENTE,
        // conforme o valor padrão definido no schema.
      },
      select: {
        id: true,
        nome: true,
        email: true,
        telefone: true,
        papel: true,
        criadoEm: true,
      },
    });

    return {
      sucesso: true,
      mensagem: "Cadastro realizado com sucesso.",
      usuario,
    };
  });

export const entrar = createServerFn({
  method: "POST",
})
  .validator(loginSchema)
  .handler(async ({ data }) => {
    const email = data.email.trim().toLowerCase();

    const usuario = await prisma.usuario.findUnique({
      where: {
        email,
      },
      select: {
        id: true,
        nome: true,
        email: true,
        senhaHash: true,
        papel: true,
        ativo: true,
      },
    });

    /*
     * Usamos a mesma mensagem para usuário inexistente,
     * senha incorreta e conta inativa.
     *
     * Assim, o formulário não revela quais e-mails
     * estão cadastrados no sistema.
     */
    if (!usuario || !usuario.ativo) {
      return {
        sucesso: false,
        mensagem: "E-mail ou senha inválidos.",
      };
    }

    const senhaValida = await verificarSenha(
      data.senha,
      usuario.senhaHash,
    );

    if (!senhaValida) {
      return {
        sucesso: false,
        mensagem: "E-mail ou senha inválidos.",
      };
    }

    await criarSessao(
      usuario.id,
      data.manterConectado,
    );

    const destino = obterDestinoDepoisDoLogin(
      usuario.papel,
      data.redirect,
    );

    return {
      sucesso: true,
      mensagem: "Login realizado com sucesso.",
      destino,
      usuario: {
        id: usuario.id,
        nome: usuario.nome,
        email: usuario.email,
        papel: usuario.papel,
      },
    };
  });