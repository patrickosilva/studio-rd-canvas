import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

import { prisma } from "../prisma.server";
import { obterUsuarioAtual } from "../session.server";

const perfilProfissionalSchema = z.object({
  descricao: z
    .string()
    .trim()
    .max(500, "A descrição profissional é muito grande.")
    .optional()
    .or(z.literal("")),

  fotoUrl: z
    .string()
    .max(700_000, "A imagem ficou muito grande.")
    .refine(
      (valor) =>
        valor === "" ||
        /^data:image\/(webp|jpeg|png);base64,/i.test(valor),
      "Formato de imagem inválido.",
    ),
});

async function exigirProfissionalDaConta() {
  const usuario = await obterUsuarioAtual();

  if (!usuario) {
    throw new Error("Você precisa estar logado.");
  }

  if (
    usuario.papel !== "FUNCIONARIO" &&
    usuario.papel !== "DONO"
  ) {
    throw new Error("Acesso negado.");
  }

  const profissional = await prisma.profissional.findUnique({
    where: {
      usuarioId: usuario.id,
    },
    select: {
      id: true,
      usuarioId: true,
      nome: true,
      telefone: true,
      descricao: true,
      fotoUrl: true,
      ativo: true,
    },
  });

  if (!profissional) {
    throw new Error(
      "Sua conta ainda não está vinculada a um perfil profissional.",
    );
  }

  return {
    usuario,
    profissional,
  };
}

export const obterMeuPerfilProfissional = createServerFn({
  method: "GET",
}).handler(async () => {
  try {
    const { profissional } =
      await exigirProfissionalDaConta();

    return {
      encontrado: true as const,
      profissional,
    };
  } catch (error) {
    return {
      encontrado: false as const,
      mensagem:
        error instanceof Error
          ? error.message
          : "Perfil profissional não encontrado.",
    };
  }
});

export const atualizarMeuPerfilProfissional = createServerFn({
  method: "POST",
})
  .validator(perfilProfissionalSchema)
  .handler(async ({ data }) => {
    const { usuario, profissional } =
      await exigirProfissionalDaConta();

    const atualizado = await prisma.profissional.update({
      where: {
        id: profissional.id,
      },
      data: {
        nome: usuario.nome,
        telefone: usuario.telefone,
        descricao: data.descricao?.trim() || null,
        fotoUrl: data.fotoUrl || null,
      },
      select: {
        id: true,
        nome: true,
        telefone: true,
        descricao: true,
        fotoUrl: true,
        ativo: true,
      },
    });

    return {
      sucesso: true,
      mensagem:
        "Perfil profissional atualizado. A foto já pode aparecer no agendamento.",
      profissional: atualizado,
    };
  });