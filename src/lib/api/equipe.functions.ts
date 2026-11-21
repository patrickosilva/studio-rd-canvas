import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

import { prisma } from "../prisma.server";
import { obterUsuarioAtual } from "../session.server";

const periodoSchema = z.object({
  periodo: z.enum(["HOJE", "SEMANA"]),
});

async function exigirDono() {
  const usuario = await obterUsuarioAtual();

  if (!usuario || usuario.papel !== "DONO") {
    throw new Error("Acesso negado.");
  }

  return usuario;
}

function partesSaoPaulo(data = new Date()) {
  const partes = new Intl.DateTimeFormat("en-CA", {
    timeZone: "America/Sao_Paulo",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(data);

  const mapa = Object.fromEntries(
    partes.map((parte) => [parte.type, parte.value]),
  );

  return {
    ano: Number(mapa.year),
    mes: Number(mapa.month),
    dia: Number(mapa.day),
  };
}

function inicioDiaSaoPaulo({
  ano,
  mes,
  dia,
}: {
  ano: number;
  mes: number;
  dia: number;
}) {
  return new Date(Date.UTC(ano, mes - 1, dia, 3, 0, 0, 0));
}

function obterIntervalo(periodo: "HOJE" | "SEMANA") {
  const partes = partesSaoPaulo();
  const inicioHoje = inicioDiaSaoPaulo(partes);

  if (periodo === "HOJE") {
    return {
      inicio: inicioHoje,
      fim: new Date(inicioHoje.getTime() + 24 * 60 * 60 * 1000),
    };
  }

  const calendario = new Date(
    Date.UTC(partes.ano, partes.mes - 1, partes.dia),
  );

  const diaSemana = calendario.getUTCDay();
  const distanciaSegunda = (diaSemana + 6) % 7;

  const inicioSemanaCalendario = new Date(
    calendario.getTime() -
      distanciaSegunda * 24 * 60 * 60 * 1000,
  );

  const inicio = inicioDiaSaoPaulo({
    ano: inicioSemanaCalendario.getUTCFullYear(),
    mes: inicioSemanaCalendario.getUTCMonth() + 1,
    dia: inicioSemanaCalendario.getUTCDate(),
  });

  return {
    inicio,
    fim: new Date(inicio.getTime() + 7 * 24 * 60 * 60 * 1000),
  };
}

export const adminResumoEquipe = createServerFn({
  method: "GET",
})
  .validator(periodoSchema)
  .handler(async ({ data }) => {
    await exigirDono();

    const intervalo = obterIntervalo(data.periodo);

    const [profissionais, atendimentos] = await Promise.all([
      prisma.profissional.findMany({
        where: {
          ativo: true,
        },
        orderBy: {
          nome: "asc",
        },
        select: {
          id: true,
          nome: true,
          usuarioId: true,
        },
      }),

      prisma.agendamento.findMany({
        where: {
          status: "CONCLUIDO",
          inicio: {
            gte: intervalo.inicio,
            lt: intervalo.fim,
          },
        },
        orderBy: {
          inicio: "desc",
        },
        select: {
          id: true,
          inicio: true,
          formaPagamento: true,
          valorPagoCentavos: true,
          valorFinalCentavos: true,
          profissionalId: true,

          cliente: {
            select: {
              id: true,
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
    ]);

    const equipe = profissionais
      .map((profissional) => {
        const itens = atendimentos.filter(
          (atendimento) =>
            atendimento.profissionalId === profissional.id,
        );

        const detalhes = itens.map((atendimento) => {
          const valorServico =
            atendimento.valorFinalCentavos ??
            atendimento.servico.precoCentavos;

          const valorRecebido =
            atendimento.formaPagamento === "ASSINATURA"
              ? 0
              : atendimento.valorPagoCentavos ??
                valorServico;

          return {
            id: atendimento.id,
            inicio: atendimento.inicio,
            cliente: atendimento.cliente,
            servicoNome: atendimento.servico.nome,
            formaPagamento: atendimento.formaPagamento,
            valorServicoCentavos: valorServico,
            valorRecebidoCentavos: valorRecebido,
          };
        });

        const faturamentoCentavos = detalhes.reduce(
          (total, item) =>
            total + item.valorRecebidoCentavos,
          0,
        );

        return {
          profissional: {
            id: profissional.id,
            nome: profissional.nome,
            possuiContaFuncionario: Boolean(
              profissional.usuarioId,
            ),
          },
          clientesAtendidos: detalhes.length,
          faturamentoCentavos,
          detalhes,
        };
      })
      .sort((a, b) => {
        if (
          b.faturamentoCentavos !==
          a.faturamentoCentavos
        ) {
          return (
            b.faturamentoCentavos -
            a.faturamentoCentavos
          );
        }

        return (
          b.clientesAtendidos -
          a.clientesAtendidos
        );
      });

    const faturamentoTotalCentavos = equipe.reduce(
      (total, item) =>
        total + item.faturamentoCentavos,
      0,
    );

    const clientesAtendidos = equipe.reduce(
      (total, item) =>
        total + item.clientesAtendidos,
      0,
    );

    return {
      periodo: data.periodo,
      inicio: intervalo.inicio,
      fim: intervalo.fim,
      faturamentoTotalCentavos,
      clientesAtendidos,
      ticketMedioCentavos:
        clientesAtendidos > 0
          ? Math.round(
              faturamentoTotalCentavos /
                clientesAtendidos,
            )
          : 0,
      equipe,
    };
  });