import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

import {
  gerarHashSenha,
  verificarSenha,
} from "../auth.server";
import { prisma } from "../prisma.server";
import {
  encerrarSessaoAtual,
  encerrarTodasSessoesDoUsuario,
  obterSessaoAtual,
} from "../session.server";
import {
  registrarEventoSeguranca,
} from "../security.server";

const perfilSchema = z.object({
  nome: z
    .string()
    .trim()
    .min(3, "O nome precisa ter pelo menos 3 caracteres.")
    .max(100, "O nome é muito grande."),

  telefone: z
    .string()
    .trim()
    .max(20, "Telefone inválido.")
    .optional()
    .or(z.literal("")),
});

const emailSchema = z.object({
  novoEmail: z
    .string()
    .trim()
    .email("Informe um e-mail válido.")
    .max(254),

  senhaAtual: z
    .string()
    .min(1, "Informe sua senha atual.")
    .max(72),
});

const senhaSchema = z
  .object({
    senhaAtual: z
      .string()
      .min(1, "Informe sua senha atual.")
      .max(72),

    novaSenha: z
      .string()
      .min(8, "A nova senha deve ter pelo menos 8 caracteres.")
      .max(72, "A nova senha é muito grande."),

    confirmarNovaSenha: z
      .string()
      .min(8)
      .max(72),
  })
  .refine(
    (data) =>
      data.novaSenha === data.confirmarNovaSenha,
    {
      message: "As novas senhas não coincidem.",
      path: ["confirmarNovaSenha"],
    },
  );

const sessaoSchema = z.object({
  sessaoId: z.string().min(1).max(100),
});

async function exigirSessao() {
  const sessao = await obterSessaoAtual();

  if (!sessao) {
    return null;
  }

  return sessao;
}

export const obterMinhaConta = createServerFn({
  method: "GET",
}).handler(async () => {
  const sessao = await exigirSessao();

  if (!sessao) {
    return {
      autenticado: false as const,
    };
  }

  const usuario =
    await prisma.usuario.findUnique({
      where: {
        id: sessao.usuario.id,
      },
      select: {
        id: true,
        nome: true,
        email: true,
        telefone: true,
        papel: true,
        senhaHash: true,
      },
    });

  if (!usuario) {
    return {
      autenticado: false as const,
    };
  }

  return {
    autenticado: true as const,
    usuario: {
      id: usuario.id,
      nome: usuario.nome,
      email: usuario.email,
      telefone: usuario.telefone,
      papel: usuario.papel,
      temSenha: Boolean(usuario.senhaHash),
    },
  };
});

export const atualizarMeuPerfil = createServerFn({
  method: "POST",
})
  .validator(perfilSchema)
  .handler(async ({ data }) => {
    const sessao = await exigirSessao();

    if (!sessao) {
      return {
        sucesso: false,
        mensagem: "Sua sessão expirou. Entre novamente.",
        precisaLogin: true,
      };
    }

    const telefone =
      data.telefone?.replace(/\D/g, "") || null;

    if (
      telefone &&
      (telefone.length < 10 ||
        telefone.length > 15)
    ) {
      return {
        sucesso: false,
        mensagem: "Informe um telefone válido.",
      };
    }

    const usuario =
      await prisma.usuario.update({
        where: {
          id: sessao.usuario.id,
        },
        data: {
          nome: data.nome.trim(),
          telefone,
        },
        select: {
          nome: true,
          telefone: true,
        },
      });

    await registrarEventoSeguranca({
      tipo: "CONTA_PERFIL_ATUALIZADO",
      sucesso: true,
      rota: "/minha-conta",
    });

    return {
      sucesso: true,
      mensagem: "Dados atualizados com sucesso.",
      usuario,
    };
  });

export const alterarMeuEmail = createServerFn({
  method: "POST",
})
  .validator(emailSchema)
  .handler(async ({ data }) => {
    const sessao = await exigirSessao();

    if (!sessao) {
      return {
        sucesso: false,
        mensagem: "Sua sessão expirou. Entre novamente.",
        precisaLogin: true,
      };
    }

    const usuario =
      await prisma.usuario.findUnique({
        where: {
          id: sessao.usuario.id,
        },
        select: {
          id: true,
          email: true,
          senhaHash: true,
        },
      });

    if (!usuario) {
      return {
        sucesso: false,
        mensagem: "Conta não encontrada.",
      };
    }

    if (!usuario.senhaHash) {
      return {
        sucesso: false,
        semSenha: true,
        mensagem:
          "Sua conta ainda não possui senha local. Use a recuperação de senha para criar uma antes de alterar o e-mail.",
      };
    }

    const senhaValida = await verificarSenha(
      data.senhaAtual,
      usuario.senhaHash,
    );

    if (!senhaValida) {
      await registrarEventoSeguranca({
        tipo: "CONTA_EMAIL_SENHA_INVALIDA",
        sucesso: false,
        rota: "/minha-conta",
      });

      return {
        sucesso: false,
        mensagem: "Senha atual incorreta.",
      };
    }

    const novoEmail =
      data.novoEmail.trim().toLowerCase();

    if (novoEmail === usuario.email.toLowerCase()) {
      return {
        sucesso: false,
        mensagem:
          "O novo e-mail é igual ao e-mail atual.",
      };
    }

    const emailEmUso =
      await prisma.usuario.findFirst({
        where: {
          id: {
            not: usuario.id,
          },
          email: {
            equals: novoEmail,
            mode: "insensitive",
          },
        },
        select: {
          id: true,
        },
      });

    if (emailEmUso) {
      return {
        sucesso: false,
        mensagem:
          "Esse e-mail já está vinculado a outra conta.",
      };
    }

    await prisma.usuario.update({
      where: {
        id: usuario.id,
      },
      data: {
        email: novoEmail,
      },
    });

    await registrarEventoSeguranca({
      tipo: "CONTA_EMAIL_ALTERADO",
      sucesso: true,
      rota: "/minha-conta",
      identificador: novoEmail,
    });

    /*
     * Alterar identificador de login é ação sensível.
     * Encerramos TODAS as sessões e exigimos novo login.
     */
    await encerrarTodasSessoesDoUsuario(
      usuario.id,
    );

    await encerrarSessaoAtual();

    return {
      sucesso: true,
      mensagem:
        "E-mail alterado. Entre novamente com o novo endereço.",
      precisaLogin: true,
    };
  });

export const alterarMinhaSenha = createServerFn({
  method: "POST",
})
  .validator(senhaSchema)
  .handler(async ({ data }) => {
    const sessao = await exigirSessao();

    if (!sessao) {
      return {
        sucesso: false,
        mensagem: "Sua sessão expirou. Entre novamente.",
        precisaLogin: true,
      };
    }

    const usuario =
      await prisma.usuario.findUnique({
        where: {
          id: sessao.usuario.id,
        },
        select: {
          id: true,
          senhaHash: true,
        },
      });

    if (!usuario) {
      return {
        sucesso: false,
        mensagem: "Conta não encontrada.",
      };
    }

    if (!usuario.senhaHash) {
      return {
        sucesso: false,
        semSenha: true,
        mensagem:
          "Sua conta foi criada sem senha local. Use a recuperação de senha para definir uma senha com segurança.",
      };
    }

    const senhaValida = await verificarSenha(
      data.senhaAtual,
      usuario.senhaHash,
    );

    if (!senhaValida) {
      await registrarEventoSeguranca({
        tipo: "CONTA_SENHA_ATUAL_INVALIDA",
        sucesso: false,
        rota: "/minha-conta",
      });

      return {
        sucesso: false,
        mensagem: "Senha atual incorreta.",
      };
    }

    if (data.senhaAtual === data.novaSenha) {
      return {
        sucesso: false,
        mensagem:
          "A nova senha deve ser diferente da senha atual.",
      };
    }

    const senhaHash = await gerarHashSenha(
      data.novaSenha,
    );

    await prisma.usuario.update({
      where: {
        id: usuario.id,
      },
      data: {
        senhaHash,
      },
    });

    await registrarEventoSeguranca({
      tipo: "CONTA_SENHA_ALTERADA",
      sucesso: true,
      rota: "/minha-conta",
    });

    /*
     * A troca de senha invalida todas as sessões,
     * inclusive a atual.
     */
    await encerrarTodasSessoesDoUsuario(
      usuario.id,
    );

    await encerrarSessaoAtual();

    return {
      sucesso: true,
      mensagem:
        "Senha alterada. Entre novamente com a nova senha.",
      precisaLogin: true,
    };
  });

export const listarMinhasSessoes = createServerFn({
  method: "GET",
}).handler(async () => {
  const atual = await exigirSessao();

  if (!atual) {
    return {
      autenticado: false as const,
      sessoes: [],
    };
  }

  const sessoes = await prisma.sessao.findMany({
    where: {
      usuarioId: atual.usuario.id,
      expiraEm: {
        gt: new Date(),
      },
    },
    select: {
      id: true,
      criadoEm: true,
      ultimaAtividadeEm: true,
      expiraEm: true,
      persistente: true,
      userAgent: true,
    },
    orderBy: {
      ultimaAtividadeEm: "desc",
    },
  });

  return {
    autenticado: true as const,
    sessoes: sessoes.map((sessao) => ({
      ...sessao,
      atual: sessao.id === atual.id,
    })),
  };
});

export const encerrarMinhaSessao = createServerFn({
  method: "POST",
})
  .validator(sessaoSchema)
  .handler(async ({ data }) => {
    const atual = await exigirSessao();

    if (!atual) {
      return {
        sucesso: false,
        precisaLogin: true,
        mensagem: "Sua sessão expirou.",
      };
    }

    if (data.sessaoId === atual.id) {
      await registrarEventoSeguranca({
        tipo: "CONTA_SESSAO_ATUAL_ENCERRADA",
        sucesso: true,
        rota: "/minha-conta",
      });

      await encerrarSessaoAtual();

      return {
        sucesso: true,
        sessaoAtualEncerrada: true,
        mensagem: "Sessão encerrada.",
      };
    }

    const removida =
      await prisma.sessao.deleteMany({
        where: {
          id: data.sessaoId,
          usuarioId: atual.usuario.id,
        },
      });

    if (removida.count === 0) {
      return {
        sucesso: false,
        mensagem:
          "Essa sessão não existe mais.",
      };
    }

    await registrarEventoSeguranca({
      tipo: "CONTA_SESSAO_REMOTA_ENCERRADA",
      sucesso: true,
      rota: "/minha-conta",
    });

    return {
      sucesso: true,
      sessaoAtualEncerrada: false,
      mensagem: "Outra sessão foi encerrada.",
    };
  });

export const encerrarOutrasSessoes = createServerFn({
  method: "POST",
}).handler(async () => {
  const atual = await exigirSessao();

  if (!atual) {
    return {
      sucesso: false,
      precisaLogin: true,
      mensagem: "Sua sessão expirou.",
    };
  }

  const removidas =
    await prisma.sessao.deleteMany({
      where: {
        usuarioId: atual.usuario.id,
        id: {
          not: atual.id,
        },
      },
    });

  await registrarEventoSeguranca({
    tipo: "CONTA_OUTRAS_SESSOES_ENCERRADAS",
    sucesso: true,
    rota: "/minha-conta",
  });

  return {
    sucesso: true,
    removidas: removidas.count,
    mensagem:
      removidas.count === 0
        ? "Não havia outras sessões ativas."
        : `${removidas.count} sessão(ões) encerrada(s).`,
  };
});
