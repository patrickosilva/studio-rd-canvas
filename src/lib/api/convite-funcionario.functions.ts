import { createHash, randomBytes } from "node:crypto";

import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

import { gerarHashSenha } from "../auth.server";
import { TERMOS_USO_VERSAO } from "../legal.constants";
import { prisma } from "../prisma.server";
import { obterUsuarioAtual } from "../session.server";

const conviteSchema = z.object({
  email: z.string().trim().email("Informe um e-mail válido.").max(254),
});

const tokenSchema = z.object({
  token: z.string().trim().min(20).max(200),
});

const cadastroSchema = z.object({
  token: z.string().trim().min(20).max(200),
  nome: z.string().trim().max(100).optional().or(z.literal("")),
  telefone: z
    .string()
    .trim()
    .min(10, "Informe seu número de celular.")
    .max(20, "Telefone inválido."),
  descricao: z
    .string()
    .trim()
    .max(500, "A descrição profissional é muito grande.")
    .optional()
    .or(z.literal("")),
  senha: z
    .string()
    .max(72)
    .optional()
    .or(z.literal("")),
  aceitarTermos: z.boolean().refine(Boolean, {
    message: "Você precisa aceitar os Termos de Uso.",
  }),
});

function hashToken(token: string) {
  return createHash("sha256").update(token).digest("hex");
}

async function exigirDono() {
  const usuario = await obterUsuarioAtual();

  if (!usuario || usuario.papel !== "DONO") {
    throw new Error("Acesso negado.");
  }

  return usuario;
}

async function buscarContaPorEmail(email: string) {
  return prisma.usuario.findFirst({
    where: {
      email: {
        equals: email,
        mode: "insensitive",
      },
    },
    select: {
      id: true,
      nome: true,
      email: true,
      telefone: true,
      senhaHash: true,
      papel: true,
      ativo: true,
      profissional: {
        select: {
          id: true,
          ativo: true,
          descricao: true,
        },
      },
    },
  });
}

async function enviarEmailConvite(
  email: string,
  token: string,
  contaExistente: boolean,
) {
  const apiKey = process.env.RESEND_API_KEY?.trim();
  const from =
    process.env.RESEND_FROM_EMAIL?.trim() ||
    process.env.EMAIL_FROM?.trim();

  if (!apiKey || !from) {
    return false;
  }

  const baseUrl =
    process.env.APP_URL?.trim() ||
    process.env.PUBLIC_APP_URL?.trim() ||
    "https://studiordbarber.com";

  const link = `${baseUrl.replace(/\/$/, "")}/cadastro-funcionario/${encodeURIComponent(token)}`;

  const resposta = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from,
      to: [email],
      subject: contaExistente
        ? "Ative seu acesso à equipe do Studio RD"
        : "Convite para a equipe do Studio RD",
      text: contaExistente
        ? [
            "Sua conta de cliente foi convidada para integrar a equipe operacional do Studio RD.",
            "",
            "Seu e-mail e sua senha atuais serão preservados.",
            "Use o link abaixo para confirmar seu celular, aceitar os termos e ativar seu perfil profissional:",
            link,
            "",
            "O convite é pessoal, de uso único e expira em 48 horas.",
          ].join("\n")
        : [
            "Você foi convidado para integrar a equipe operacional do Studio RD.",
            "",
            "Crie sua conta de funcionário pelo link abaixo:",
            link,
            "",
            "O convite é pessoal, de uso único e expira em 48 horas.",
          ].join("\n"),
    }),
  });

  return resposta.ok;
}

export const adminConvidarFuncionario = createServerFn({
  method: "POST",
})
  .validator(conviteSchema)
  .handler(async ({ data }) => {
    const dono = await exigirDono();
    const email = data.email.trim().toLowerCase();
    const conta = await buscarContaPorEmail(email);

    if (conta && !conta.ativo) {
      return {
        sucesso: false,
        mensagem:
          "Já existe uma conta inativa com esse e-mail. Reative a conta antes de conceder acesso operacional.",
      };
    }

    if (conta?.papel === "DONO") {
      return {
        sucesso: false,
        mensagem: "Essa conta já possui acesso administrativo.",
      };
    }

    if (
      conta?.papel === "FUNCIONARIO" &&
      conta.profissional?.ativo
    ) {
      return {
        sucesso: false,
        mensagem: "Essa conta já possui acesso operacional ativo.",
      };
    }

    await prisma.conviteFuncionario.deleteMany({
      where: {
        email: {
          equals: email,
          mode: "insensitive",
        },
        usadoEm: null,
      },
    });

    const token = randomBytes(32).toString("base64url");
    const tokenHash = hashToken(token);
    const expiraEm = new Date(Date.now() + 48 * 60 * 60 * 1000);

    const convite = await prisma.conviteFuncionario.create({
      data: {
        email,
        tokenHash,
        expiraEm,
        criadoPorUsuarioId: dono.id,
      },
      select: {
        id: true,
      },
    });

    let enviado = false;

    try {
      enviado = await enviarEmailConvite(
        email,
        token,
        Boolean(conta),
      );
    } catch (error) {
      console.error("Erro ao enviar convite de funcionário:", error);
    }

    if (!enviado) {
      await prisma.conviteFuncionario.deleteMany({
        where: {
          id: convite.id,
        },
      });

      return {
        sucesso: false,
        mensagem:
          "Não foi possível enviar o convite por e-mail. Verifique a configuração do Resend.",
      };
    }

    return {
      sucesso: true,
      contaExistente: Boolean(conta),
      mensagem: conta
        ? `Convite de acesso operacional enviado para a conta existente ${email}.`
        : `Convite de cadastro enviado para ${email}.`,
    };
  });

export const adminListarConvitesFuncionarios = createServerFn({
  method: "GET",
}).handler(async () => {
  await exigirDono();

  return prisma.conviteFuncionario.findMany({
    orderBy: {
      criadoEm: "desc",
    },
    take: 20,
    select: {
      id: true,
      email: true,
      expiraEm: true,
      usadoEm: true,
      criadoEm: true,
    },
  });
});

export const obterConviteFuncionario = createServerFn({
  method: "GET",
})
  .validator(tokenSchema)
  .handler(async ({ data }) => {
    const convite = await prisma.conviteFuncionario.findUnique({
      where: {
        tokenHash: hashToken(data.token),
      },
      select: {
        email: true,
        expiraEm: true,
        usadoEm: true,
      },
    });

    if (!convite) {
      return {
        valido: false as const,
        mensagem: "Convite inválido.",
      };
    }

    if (convite.usadoEm) {
      return {
        valido: false as const,
        mensagem: "Este convite já foi utilizado.",
      };
    }

    if (convite.expiraEm <= new Date()) {
      return {
        valido: false as const,
        mensagem:
          "Este convite expirou. Solicite um novo convite ao administrador.",
      };
    }

    const conta = await buscarContaPorEmail(convite.email);

    if (conta?.papel === "DONO") {
      return {
        valido: false as const,
        mensagem: "Esta conta já possui acesso administrativo.",
      };
    }

    if (
      conta?.papel === "FUNCIONARIO" &&
      conta.profissional?.ativo
    ) {
      return {
        valido: false as const,
        mensagem: "Esta conta já possui acesso operacional ativo.",
      };
    }

    if (conta && !conta.ativo) {
      return {
        valido: false as const,
        mensagem: "Esta conta está inativa. Fale com o administrador.",
      };
    }

    return {
      valido: true as const,
      modo: conta
        ? ("CONTA_EXISTENTE" as const)
        : ("NOVA_CONTA" as const),
      email: convite.email,
      expiraEm: convite.expiraEm,
      nome: conta?.nome ?? "",
      telefone: conta?.telefone ?? "",
      descricao: conta?.profissional?.descricao ?? "",
      temSenha: Boolean(conta?.senhaHash),
    };
  });

export const cadastrarFuncionarioPorConvite = createServerFn({
  method: "POST",
})
  .validator(cadastroSchema)
  .handler(async ({ data }) => {
    const tokenHash = hashToken(data.token);

    const convite = await prisma.conviteFuncionario.findUnique({
      where: {
        tokenHash,
      },
      select: {
        id: true,
        email: true,
        expiraEm: true,
        usadoEm: true,
      },
    });

    if (
      !convite ||
      convite.usadoEm ||
      convite.expiraEm <= new Date()
    ) {
      return {
        sucesso: false,
        mensagem: "Este convite não é mais válido.",
      };
    }

    const telefone = data.telefone.replace(/\D/g, "");

    if (telefone.length < 10 || telefone.length > 15) {
      return {
        sucesso: false,
        mensagem: "Informe um número de celular válido.",
      };
    }

    const conta = await buscarContaPorEmail(convite.email);

    if (conta) {
      if (!conta.ativo) {
        return {
          sucesso: false,
          mensagem: "Sua conta está inativa. Fale com o administrador.",
        };
      }

      if (conta.papel === "DONO") {
        return {
          sucesso: false,
          mensagem: "Sua conta já possui acesso administrativo.",
        };
      }

      if (
        conta.papel === "FUNCIONARIO" &&
        conta.profissional?.ativo
      ) {
        return {
          sucesso: false,
          mensagem: "Sua conta já possui acesso operacional.",
        };
      }

      await prisma.$transaction(async (tx) => {
        await tx.usuario.update({
          where: {
            id: conta.id,
          },
          data: {
            telefone,
            papel: "FUNCIONARIO",
            termosVersaoAceita: TERMOS_USO_VERSAO,
            termosAceitosEm: new Date(),
          },
        });

        if (conta.profissional) {
          await tx.profissional.update({
            where: {
              id: conta.profissional.id,
            },
            data: {
              nome: conta.nome,
              telefone,
              descricao:
                data.descricao?.trim() ||
                conta.profissional.descricao ||
                null,
              ativo: true,
            },
          });
        } else {
          await tx.profissional.create({
            data: {
              usuarioId: conta.id,
              nome: conta.nome,
              telefone,
              descricao: data.descricao?.trim() || null,
              ativo: true,
            },
          });
        }

        await tx.conviteFuncionario.update({
          where: {
            id: convite.id,
          },
          data: {
            usadoEm: new Date(),
          },
        });
      });

      return {
        sucesso: true,
        contaExistente: true,
        mensagem:
          "Acesso de funcionário ativado na sua conta existente. Seu e-mail e sua senha foram preservados.",
      };
    }

    const nome = data.nome?.trim() ?? "";
    const senha = data.senha ?? "";

    if (nome.length < 3) {
      return {
        sucesso: false,
        mensagem: "Informe seu nome com pelo menos 3 caracteres.",
      };
    }

    if (senha.length < 8) {
      return {
        sucesso: false,
        mensagem: "A senha deve ter pelo menos 8 caracteres.",
      };
    }

    const senhaHash = await gerarHashSenha(senha);

    try {
      await prisma.$transaction(async (tx) => {
        const usuario = await tx.usuario.create({
          data: {
            nome,
            email: convite.email,
            telefone,
            senhaHash,
            papel: "FUNCIONARIO",
            termosVersaoAceita: TERMOS_USO_VERSAO,
            termosAceitosEm: new Date(),
          },
          select: {
            id: true,
          },
        });

        await tx.profissional.create({
          data: {
            usuarioId: usuario.id,
            nome,
            telefone,
            descricao: data.descricao?.trim() || null,
            ativo: true,
          },
        });

        await tx.conviteFuncionario.update({
          where: {
            id: convite.id,
          },
          data: {
            usadoEm: new Date(),
          },
        });
      });
    } catch (error) {
      const contaCriadaDuranteFluxo =
        await buscarContaPorEmail(convite.email);

      if (contaCriadaDuranteFluxo) {
        return {
          sucesso: false,
          mensagem:
            "Uma conta com este e-mail foi criada enquanto o convite estava aberto. Solicite um novo convite para ativar o acesso na conta existente.",
        };
      }

      throw error;
    }

    return {
      sucesso: true,
      contaExistente: false,
      mensagem:
        "Conta de funcionário criada com sucesso. Você já pode entrar no sistema.",
    };
  });