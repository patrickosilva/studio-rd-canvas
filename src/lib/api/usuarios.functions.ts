import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

import { prisma } from "@/lib/prisma.server";
import { obterUsuarioAtual } from "@/lib/session.server";
import type { PapelUsuario } from "../../generated/prisma/client";

const alterarPapelUsuarioSchema = z.object({
  usuarioId: z
    .string()
    .trim()
    .min(1, "Usuário inválido."),

  papel: z.enum(["CLIENTE", "FUNCIONARIO", "DONO"]),
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

export const adminListarUsuarios = createServerFn({
  method: "GET",
}).handler(async () => {
  await exigirDono();

  return prisma.usuario.findMany({
    orderBy: {
      criadoEm: "desc",
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
          ativo: true,
        },
      },
    },
  });
});

export const adminAlterarPapelUsuario = createServerFn({
  method: "POST",
})
  .validator(alterarPapelUsuarioSchema)
  .handler(async ({ data }) => {
    const donoAtual = await exigirDono();

    if (data.usuarioId === donoAtual.id) {
      return {
        sucesso: false,
        mensagem:
          "Por segurança, você não pode alterar o papel da sua própria conta.",
      };
    }

    const usuario = await prisma.usuario.findUnique({
      where: {
        id: data.usuarioId,
      },
      select: {
        id: true,
        nome: true,
        papel: true,
      },
    });

    if (!usuario) {
      return {
        sucesso: false,
        mensagem: "Usuário não encontrado.",
      };
    }

    const papel = data.papel as PapelUsuario;

    const usuarioAtualizado = await prisma.usuario.update({
      where: {
        id: usuario.id,
      },
      data: {
        papel,
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
            ativo: true,
          },
        },
      },
    });

    return {
      sucesso: true,
      mensagem: `Papel de ${usuarioAtualizado.nome} atualizado para ${usuarioAtualizado.papel}.`,
      usuario: usuarioAtualizado,
    };
  });