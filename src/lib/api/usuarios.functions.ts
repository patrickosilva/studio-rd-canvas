import { createServerFn } from "@tanstack/react-start";

import { prisma } from "@/lib/prisma.server";
import { obterUsuarioAtual } from "@/lib/session.server";

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