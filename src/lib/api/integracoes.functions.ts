import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

import { prisma } from "@/lib/prisma.server";
import { obterUsuarioAtual } from "@/lib/session.server";
import {
  criptografarSegredo,
  descriptografarSegredo,
} from "@/lib/integracoes/segredos.server";
import {
  consultarCobrancaPixInter,
  criarCobrancaPixTesteInter,
  testarAutenticacaoInter,
  type AmbienteInter,
  type CredenciaisInter,
} from "@/lib/integracoes/inter.server";

const provedores = ["INTER", "META"] as const;

async function exigirDono() {
  const usuario = await obterUsuarioAtual();

  if (!usuario) {
    throw new Error("Voce precisa estar logado.");
  }

  if (usuario.papel !== "DONO") {
    throw new Error("Acesso negado.");
  }

  return usuario;
}

type ConfiguracaoPublicaInter = {
  ambiente: AmbienteInter;
  contaCorrente?: string | null;
  chavePix?: string | null;
};

function lerConfiguracaoPublicaInter(
  valor: unknown,
): ConfiguracaoPublicaInter {
  if (
    valor &&
    typeof valor === "object" &&
    !Array.isArray(valor)
  ) {
    const objeto = valor as Record<string, unknown>;

    return {
      ambiente:
        objeto.ambiente === "PRODUCAO"
          ? "PRODUCAO"
          : "SANDBOX",
      contaCorrente:
        typeof objeto.contaCorrente === "string"
          ? objeto.contaCorrente
          : null,
      chavePix:
        typeof objeto.chavePix === "string"
          ? objeto.chavePix
          : null,
    };
  }

  return {
    ambiente: "SANDBOX",
    contaCorrente: null,
    chavePix: null,
  };
}

async function obterIntegracaoInterComSegredo() {
  const integracao =
    await prisma.integracaoExterna.findUnique({
      where: {
        provedor: "INTER",
      },
      select: {
        id: true,
        status: true,
        configuracaoPublica: true,
        segredoCriptografado: true,
        conectadoEm: true,
      },
    });

  if (!integracao?.segredoCriptografado) {
    throw new Error(
      "Salve as credenciais do Banco Inter antes de continuar.",
    );
  }

  return {
    integracao,
    configuracao: lerConfiguracaoPublicaInter(
      integracao.configuracaoPublica,
    ),
    credenciais:
      descriptografarSegredo<CredenciaisInter>(
        integracao.segredoCriptografado,
      ),
  };
}

export const adminListarIntegracoes = createServerFn({
  method: "GET",
}).handler(async () => {
  await exigirDono();

  const registros =
    await prisma.integracaoExterna.findMany({
      select: {
        id: true,
        provedor: true,
        status: true,
        nomeConta: true,
        identificadorExterno: true,
        configuracaoPublica: true,
        segredoCriptografado: true,
        conectadoEm: true,
        verificadoEm: true,
        ultimoErro: true,
        atualizadoEm: true,
      },
    });

  return provedores.map((provedor) => {
    const registro = registros.find(
      (item) => item.provedor === provedor,
    );

    return {
      provedor,
      status: registro?.status ?? "DESCONECTADA",
      nomeConta: registro?.nomeConta ?? null,
      identificadorExterno:
        registro?.identificadorExterno ?? null,
      configuracaoPublica:
        registro?.configuracaoPublica ?? null,
      possuiCredenciais: Boolean(
        registro?.segredoCriptografado,
      ),
      conectadoEm: registro?.conectadoEm ?? null,
      verificadoEm: registro?.verificadoEm ?? null,
      ultimoErro: registro?.ultimoErro ?? null,
      atualizadoEm: registro?.atualizadoEm ?? null,
    };
  });
});

const prepararIntegracaoSchema = z.object({
  provedor: z.enum(provedores),
});

export const adminPrepararIntegracao = createServerFn({
  method: "POST",
})
  .validator(prepararIntegracaoSchema)
  .handler(async ({ data }) => {
    await exigirDono();

    const integracao =
      await prisma.integracaoExterna.upsert({
        where: {
          provedor: data.provedor,
        },
        create: {
          provedor: data.provedor,
          status: "CONFIGURANDO",
        },
        update: {
          status: "CONFIGURANDO",
          ultimoErro: null,
        },
        select: {
          id: true,
          provedor: true,
          status: true,
        },
      });

    return {
      sucesso: true,
      integracao,
      mensagem:
        data.provedor === "INTER"
          ? "Configuracao do Banco Inter iniciada."
          : "Configuracao preparada.",
    };
  });

const salvarInterSchema = z.object({
  ambiente: z.enum(["SANDBOX", "PRODUCAO"]),
  clientId: z.string().trim().min(1, "Informe o Client ID."),
  clientSecret: z
    .string()
    .trim()
    .min(1, "Informe o Client Secret."),
  certificadoPem: z
    .string()
    .trim()
    .min(1, "Envie o certificado."),
  chavePrivadaPem: z
    .string()
    .trim()
    .min(1, "Envie a chave privada."),
  contaCorrente: z
    .string()
    .trim()
    .max(40)
    .optional()
    .or(z.literal("")),
  chavePix: z
    .string()
    .trim()
    .min(1, "Informe a chave Pix recebedora.")
    .max(120),
});

export const adminSalvarConfiguracaoInter =
  createServerFn({
    method: "POST",
  })
    .validator(salvarInterSchema)
    .handler(async ({ data }) => {
      await exigirDono();

      if (
        !data.certificadoPem.includes(
          "BEGIN CERTIFICATE",
        )
      ) {
        return {
          sucesso: false,
          mensagem:
            "O certificado precisa estar em formato PEM (.crt/.pem).",
        };
      }

      if (
        !data.chavePrivadaPem.includes(
          "PRIVATE KEY",
        )
      ) {
        return {
          sucesso: false,
          mensagem:
            "A chave privada precisa estar em formato PEM (.key/.pem).",
        };
      }

      const segredo = criptografarSegredo({
        clientId: data.clientId,
        clientSecret: data.clientSecret,
        certificadoPem: data.certificadoPem,
        chavePrivadaPem: data.chavePrivadaPem,
      } satisfies CredenciaisInter);

      await prisma.integracaoExterna.upsert({
        where: {
          provedor: "INTER",
        },
        create: {
          provedor: "INTER",
          status: "CONFIGURANDO",
          nomeConta: "Banco Inter",
          identificadorExterno:
            data.contaCorrente?.trim() || null,
          configuracaoPublica: {
            ambiente: data.ambiente,
            contaCorrente:
              data.contaCorrente?.trim() || null,
            chavePix: data.chavePix.trim(),
          },
          segredoCriptografado: segredo,
        },
        update: {
          status: "CONFIGURANDO",
          nomeConta: "Banco Inter",
          identificadorExterno:
            data.contaCorrente?.trim() || null,
          configuracaoPublica: {
            ambiente: data.ambiente,
            contaCorrente:
              data.contaCorrente?.trim() || null,
            chavePix: data.chavePix.trim(),
          },
          segredoCriptografado: segredo,
          ultimoErro: null,
        },
      });

      return {
        sucesso: true,
        mensagem:
          data.ambiente === "SANDBOX"
            ? "Credenciais do Sandbox (area de testes) salvas e criptografadas. Agora teste a conexao."
            : "Credenciais de Producao salvas e criptografadas. Agora teste a autenticacao real com cuidado.",
      };
    });

export const adminTestarConexaoInter =
  createServerFn({
    method: "POST",
  }).handler(async () => {
    await exigirDono();

    const {
      integracao,
      configuracao,
      credenciais,
    } = await obterIntegracaoInterComSegredo();

    try {
      const token = await testarAutenticacaoInter({
        ambiente: configuracao.ambiente,
        credenciais,
      });

      const agora = new Date();

      await prisma.integracaoExterna.update({
        where: {
          id: integracao.id,
        },
        data: {
          status: "CONECTADA",
          conectadoEm:
            integracao.conectadoEm ?? agora,
          verificadoEm: agora,
          ultimoErro: null,
        },
      });

      return {
        sucesso: true,
        mensagem:
          configuracao.ambiente === "SANDBOX"
            ? "Sandbox (area de testes) do Banco Inter autenticado com sucesso."
            : "Producao (ambiente real) do Banco Inter autenticada com sucesso.",
        expiresIn: token.expiresIn,
      };
    } catch (error) {
      const mensagem =
        error instanceof Error
          ? error.message
          : "Falha desconhecida ao autenticar no Banco Inter.";

      await prisma.integracaoExterna.update({
        where: {
          id: integracao.id,
        },
        data: {
          status: "ERRO",
          ultimoErro: mensagem.slice(0, 1000),
        },
      });

      return {
        sucesso: false,
        mensagem,
      };
    }
  });

const criarCobrancaTesteSchema = z.object({
  valorCentavos: z
    .number()
    .int()
    .min(1, "Informe um valor maior que zero.")
    .max(100000, "No Sandbox, limite o teste a R$ 1.000,00."),
  descricao: z
    .string()
    .trim()
    .min(2)
    .max(140),
});

export const adminCriarCobrancaPixTesteInter =
  createServerFn({
    method: "POST",
  })
    .validator(criarCobrancaTesteSchema)
    .handler(async ({ data }) => {
      await exigirDono();

      const {
        integracao,
        configuracao,
        credenciais,
      } = await obterIntegracaoInterComSegredo();

      if (integracao.status !== "CONECTADA") {
        return {
          sucesso: false,
          mensagem:
            "Teste a conexao do Inter antes de gerar uma cobranca.",
        };
      }

      if (
        configuracao.ambiente !== "SANDBOX" ||
        !configuracao.chavePix
      ) {
        return {
          sucesso: false,
          mensagem:
            "A configuracao Sandbox precisa conter uma chave Pix recebedora.",
        };
      }

      try {
        const cobranca = await criarCobrancaPixTesteInter({
          ambiente: "SANDBOX",
          credenciais,
          chavePix: configuracao.chavePix,
          valorCentavos: data.valorCentavos,
          descricao: data.descricao,
        });

        return {
          sucesso: true,
          mensagem: "Cobranca Pix Sandbox criada.",
          cobranca,
        };
      } catch (error) {
        return {
          sucesso: false,
          mensagem:
            error instanceof Error
              ? error.message
              : "Nao foi possivel criar a cobranca Pix Sandbox.",
        };
      }
    });

const consultarCobrancaTesteSchema = z.object({
  txid: z.string().trim().min(26).max(35),
});

export const adminConsultarCobrancaPixTesteInter =
  createServerFn({
    method: "POST",
  })
    .validator(consultarCobrancaTesteSchema)
    .handler(async ({ data }) => {
      await exigirDono();

      const {
        configuracao,
        credenciais,
      } = await obterIntegracaoInterComSegredo();

      if (configuracao.ambiente !== "SANDBOX") {
        return {
          sucesso: false,
          mensagem: "Consulta de teste bloqueada fora do Sandbox.",
        };
      }

      try {
        const cobranca = await consultarCobrancaPixInter({
          ambiente: "SANDBOX",
          credenciais,
          txid: data.txid,
        });

        return {
          sucesso: true,
          mensagem: "Cobranca consultada.",
          cobranca,
        };
      } catch (error) {
        return {
          sucesso: false,
          mensagem:
            error instanceof Error
              ? error.message
              : "Nao foi possivel consultar a cobranca.",
        };
      }
    });
