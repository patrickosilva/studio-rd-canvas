import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

import { obterLimitesConsultaUtc, validarPeriodoFinanceiro } from "../financeiro-periodo";
import { prisma } from "../prisma.server";
import { obterUsuarioAtual } from "../session.server";

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

const listarFinanceiroPeriodoSchema = z
  .object({
    dataInicial: z.string().trim(),
    dataFinal: z.string().trim(),
  })
  .superRefine((valor, contexto) => {
    const validacao = validarPeriodoFinanceiro(valor.dataInicial, valor.dataFinal);

    if (!validacao.valido) {
      contexto.addIssue({
        code: z.ZodIssueCode.custom,
        message: validacao.mensagem,
      });
    }
  });

/**
 * Dados financeiros de um período, filtrados no banco.
 *
 * - Agendamentos são filtrados por `inicio` (data do atendimento).
 * - Pagamentos de assinatura são filtrados por `pagoEm`.
 * - Intervalo: [00:00 da data inicial, 00:00 do dia seguinte à data final),
 *   ambos no fuso America/Sao_Paulo.
 *
 * Retorna somente os campos usados pelos indicadores, resumos, gráfico e
 * exportações do Financeiro (sem e-mail ou telefone de clientes).
 */
export const adminListarFinanceiroPeriodo = createServerFn({
  method: "GET",
})
  .validator(listarFinanceiroPeriodoSchema)
  .handler(async ({ data }) => {
    await exigirDono();

    const { inicio, fimExclusivo } = obterLimitesConsultaUtc(data);

    const [agendamentos, pagamentosAssinatura] = await Promise.all([
      prisma.agendamento.findMany({
        where: {
          inicio: {
            gte: inicio,
            lt: fimExclusivo,
          },
        },
        orderBy: {
          inicio: "asc",
        },
        select: {
          id: true,
          inicio: true,
          status: true,
          formaPagamento: true,
          valorPagoCentavos: true,
          cliente: {
            select: {
              nome: true,
            },
          },
          profissional: {
            select: {
              nome: true,
            },
          },
          servico: {
            select: {
              nome: true,
              precoCentavos: true,
            },
          },
        },
      }),

      prisma.pagamentoAssinatura.findMany({
        where: {
          pagoEm: {
            gte: inicio,
            lt: fimExclusivo,
          },
        },
        orderBy: {
          pagoEm: "asc",
        },
        select: {
          id: true,
          formaPagamento: true,
          valorCentavos: true,
          pagoEm: true,
          observacao: true,
          assinatura: {
            select: {
              status: true,
              cliente: {
                select: {
                  nome: true,
                },
              },
              plano: {
                select: {
                  nome: true,
                },
              },
            },
          },
        },
      }),
    ]);

    return {
      periodo: {
        dataInicial: data.dataInicial,
        dataFinal: data.dataFinal,
      },
      agendamentos,
      pagamentosAssinatura,
    };
  });
