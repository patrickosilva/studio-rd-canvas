import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import type { FormaPagamento } from "../../generated/prisma/client";
import {
  enviarEmailCancelamentoEquipeCliente,
  enviarEmailConfirmacaoAgendamento,
  enviarEmailReagendamentoCliente,
  enviarEmailRecusaAgendamento,
  enviarNotificacaoAgendamento,
} from "../notificacao-agendamento.server";

import { prisma } from "../prisma.server";
import { obterUsuarioAtual } from "../session.server";

async function exigirUsuarioLogado() {
  const usuario = await obterUsuarioAtual();

  if (!usuario) {
    throw new Error("Você precisa estar logado.");
  }

  return usuario;
}

async function exigirCliente() {
  const usuario = await exigirUsuarioLogado();

  if (usuario.papel !== "CLIENTE") {
    throw new Error("Apenas clientes podem solicitar agendamentos.");
  }

  return usuario;
}

async function exigirOperacional() {
  const usuario = await exigirUsuarioLogado();

  if (
    usuario.papel !== "FUNCIONARIO" &&
    usuario.papel !== "DONO"
  ) {
    throw new Error("Acesso negado.");
  }

  return usuario;
}

async function exigirDono() {
  const usuario = await exigirUsuarioLogado();

  if (usuario.papel !== "DONO") {
    throw new Error("Acesso negado.");
  }

  return usuario;
}

const solicitarAgendamentoSchema = z.object({
  profissionalId: z
    .string()
    .trim()
    .min(1, "Escolha um profissional."),

  servicoId: z
    .string()
    .trim()
    .min(1, "Escolha um serviço."),

  inicio: z
    .string()
    .trim()
    .min(1, "Escolha uma data e horário."),

  observacaoCliente: z
    .string()
    .trim()
    .max(500, "A observação é muito grande.")
    .optional()
    .or(z.literal("")),
});

const funcionarioCriarAgendamentoParaClienteSchema = z.object({
  clienteId: z
    .string()
    .trim()
    .min(1, "Escolha um cliente."),

  profissionalId: z
    .string()
    .trim()
    .min(1, "Escolha um profissional."),

  servicoId: z
    .string()
    .trim()
    .min(1, "Escolha um serviço."),

  inicio: z
    .string()
    .trim()
    .min(1, "Escolha uma data e horário."),

  observacaoCliente: z
    .string()
    .trim()
    .max(500, "A observação é muito grande.")
    .optional()
    .or(z.literal("")),
});

const alterarStatusSchema = z.object({
  agendamentoId: z
    .string()
    .trim()
    .min(1, "Agendamento inválido."),
});

const recusarAgendamentoSchema = z.object({
  agendamentoId: z
    .string()
    .trim()
    .min(1, "Agendamento inválido."),

  motivoRecusa: z
    .string()
    .trim()
    .max(500, "O motivo é muito grande.")
    .optional()
    .or(z.literal("")),
});

const remarcarAgendamentoSchema = z.object({
  agendamentoId: z
    .string()
    .trim()
    .min(1, "Agendamento inválido."),

  servicoId: z
    .string()
    .trim()
    .min(1, "Escolha um serviço."),

  inicio: z
    .string()
    .trim()
    .min(1, "Escolha uma nova data e horário."),
});
const cancelarAgendamentoClienteSchema = z.object({
  agendamentoId: z
    .string()
    .trim()
    .min(1, "Agendamento inválido."),

  motivoCancelamento: z
    .string()
    .trim()
    .max(500, "O motivo é muito grande.")
    .optional()
    .or(z.literal("")),
});

const cancelarAgendamentoEquipeSchema = z.object({
  agendamentoId: z
    .string()
    .trim()
    .min(1, "Agendamento inválido."),

  motivoCancelamento: z
    .string()
    .trim()
    .max(500, "O motivo é muito grande.")
    .optional()
    .or(z.literal("")),
});

const listarIndisponibilidadesAgendaSchema = z.object({
  profissionalId: z
    .string()
    .trim()
    .min(1, "Profissional inválido."),

  data: z
    .string()
    .trim()
    .min(1, "Data inválida."),
});

const concluirAgendamentoSchema = z.object({
  agendamentoId: z
    .string()
    .trim()
    .min(1, "Agendamento inválido."),

  formaPagamento: z.enum([
    "PIX",
    "DINHEIRO",
    "CARTAO_DEBITO",
    "CARTAO_CREDITO",
    "ASSINATURA",
    "CORTESIA",
    "OUTRO",
  ]),

  valorPagoCentavos: z
    .number()
    .int("O valor precisa estar em centavos.")
    .min(0, "O valor não pode ser negativo.")
    .optional(),

  observacaoPagamento: z
    .string()
    .trim()
    .max(500, "A observação é muito grande.")
    .optional()
    .or(z.literal("")),
});


const corrigirServicoConcluidoSchema = z.object({
  agendamentoId: z
    .string()
    .trim()
    .min(1, "Atendimento inválido."),

  servicoId: z
    .string()
    .trim()
    .min(1, "Escolha o serviço correto."),

  valorPagoCentavos: z
    .number()
    .int("O valor precisa estar em centavos.")
    .min(0, "O valor não pode ser negativo."),

  motivo: z
    .string()
    .trim()
    .min(3, "Informe o motivo da correção.")
    .max(500, "O motivo é muito grande."),
});

const JANELA_CORRECAO_SERVICO_MS =
  7 * 24 * 60 * 60 * 1000;

function obterLimiteCorrecaoServico(
  agora: Date = new Date(),
): Date {
  return new Date(
    agora.getTime() - JANELA_CORRECAO_SERVICO_MS,
  );
}


const formasPagamentoAjusteHistorico = [
  "PIX",
  "DINHEIRO",
  "CARTAO_DEBITO",
  "CARTAO_CREDITO",
  "ASSINATURA",
  "CORTESIA",
  "OUTRO",
] as const;

const atendimentoHistoricoBaseSchema = z.object({
  clienteId: z.string().trim().min(1, "Escolha o cliente."),
  profissionalId: z
    .string()
    .trim()
    .min(1, "Escolha o profissional."),
  servicoId: z.string().trim().min(1, "Escolha o serviço."),
  inicio: z.string().trim().min(1, "Informe o início."),
  fim: z.string().trim().min(1, "Informe o término."),
  formaPagamento: z.enum(formasPagamentoAjusteHistorico),
  valorPagoCentavos: z
    .number()
    .int("O valor precisa estar em centavos.")
    .min(0, "O valor não pode ser negativo."),
  motivo: z
    .string()
    .trim()
    .min(3, "Informe o motivo do ajuste.")
    .max(500, "O motivo é muito grande."),
});

const criarAtendimentoRetroativoSchema =
  atendimentoHistoricoBaseSchema;

const atualizarAtendimentoConcluidoSchema =
  atendimentoHistoricoBaseSchema.extend({
    agendamentoId: z
      .string()
      .trim()
      .min(1, "Atendimento inválido."),
  });

const JANELA_AJUSTE_HISTORICO_MS =
  7 * 24 * 60 * 60 * 1000;

function validarJanelaAjusteHistorico({
  inicio,
  fim,
  agora = new Date(),
}: {
  inicio: Date;
  fim: Date;
  agora?: Date;
}): string | null {
  if (fim.getTime() <= inicio.getTime()) {
    return "O horário de término precisa ser depois do início.";
  }

  const limite = new Date(
    agora.getTime() - JANELA_AJUSTE_HISTORICO_MS,
  );

  if (
    inicio.getTime() < limite.getTime() ||
    inicio.getTime() > agora.getTime() ||
    fim.getTime() > agora.getTime()
  ) {
    return "O atendimento precisa estar dentro dos últimos 7 dias e já ter terminado.";
  }

  return null;
}

function formatarValorAuditoria(valorCentavos: number | null): string {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format((valorCentavos ?? 0) / 100);
}

const TIMEZONE_PADRAO = "America/Sao_Paulo";
const INTERVALO_INICIO_MINUTOS = 5;

const ALMOCO_INICIO_MINUTOS = 12 * 60;
const ALMOCO_FIM_MINUTOS = 13 * 60;

function inicioEstaNoHorarioDeAlmoco(
  minutosInicio: number,
): boolean {
  return (
    minutosInicio >= ALMOCO_INICIO_MINUTOS &&
    minutosInicio < ALMOCO_FIM_MINUTOS
  );
}

// Esse intervalo define apenas os possíveis horários de início.
// A duração real do atendimento sempre vem de servico.duracaoMinutos.
const funcionamentoPorDia: Record<
  number,
  {
    abre: string;
    fecha: string;
  }
> = {
  2: {
    abre: "09:30",
    fecha: "19:30",
  },
  3: {
    abre: "09:30",
    fecha: "19:30",
  },
  4: {
    abre: "09:00",
    fecha: "19:30",
  },
  5: {
    abre: "08:00",
    fecha: "21:00",
  },
  6: {
    abre: "08:30",
    fecha: "19:00",
  },
};

function converterData(valor: string): Date | null {
  const texto = valor.trim();

  const match = texto.match(
    /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})(?::(\d{2}))?$/,
  );

  if (!match) {
    const data = new Date(texto);

    if (Number.isNaN(data.getTime())) {
      return null;
    }

    return data;
  }

  const [, ano, mes, dia, hora, minuto, segundo] = match;

  const anoNumero = Number(ano);
  const mesNumero = Number(mes);
  const diaNumero = Number(dia);
  const horaNumero = Number(hora);
  const minutoNumero = Number(minuto);
  const segundoNumero = Number(segundo ?? "0");

  const dataUtc = new Date(
    Date.UTC(
      anoNumero,
      mesNumero - 1,
      diaNumero,
      horaNumero + 3,
      minutoNumero,
      segundoNumero,
      0,
    ),
  );

  if (Number.isNaN(dataUtc.getTime())) {
    return null;
  }

  return dataUtc;
}

function calcularFim(inicio: Date, duracaoMinutos: number): Date {
  return new Date(
    inicio.getTime() + duracaoMinutos * 60 * 1000,
  );
}

function converterHoraParaMinutos(hora: string): number {
  const [horas, minutos] = hora.split(":").map(Number);

  return horas * 60 + minutos;
}

function obterPartesDataSaoPaulo(data: Date) {
  const partes = new Intl.DateTimeFormat("pt-BR", {
    timeZone: TIMEZONE_PADRAO,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).formatToParts(data);

  const mapa = Object.fromEntries(
    partes.map((parte) => [parte.type, parte.value]),
  );

  const ano = Number(mapa.year);
  const mes = Number(mapa.month);
  const dia = Number(mapa.day);
  const hora = Number(mapa.hour);
  const minuto = Number(mapa.minute);

  const dataLocal = new Date(ano, mes - 1, dia);

  return {
    diaSemana: dataLocal.getDay(),
    hora,
    minuto,
  };
}

function validarHorarioNaGrade({
  inicio,
  duracaoMinutos,
}: {
  inicio: Date;
  duracaoMinutos: number;
}): {
  valido: boolean;
  mensagem?: string;
} {
  const partes = obterPartesDataSaoPaulo(inicio);
  const regra = funcionamentoPorDia[partes.diaSemana];

  if (!regra) {
    return {
      valido: false,
      mensagem: "A barbearia não atende nesse dia.",
    };
  }

  const minutosInicio = partes.hora * 60 + partes.minuto;
  const minutosAbertura = converterHoraParaMinutos(regra.abre);
  const minutosFechamento = converterHoraParaMinutos(regra.fecha);

  if (
    minutosInicio < minutosAbertura ||
    minutosInicio + duracaoMinutos > minutosFechamento
  ) {
    return {
      valido: false,
      mensagem: "Escolha um horário dentro do funcionamento da barbearia.",
    };
  }
    //intervalo da barbearia para almoço
  const distanciaDaAbertura = minutosInicio - minutosAbertura;
  if (inicioEstaNoHorarioDeAlmoco(minutosInicio)) {
  return {
    valido: false,
    mensagem:
      "Não é possível iniciar um atendimento entre 12:00 e 13:00.",
  };
}

  if (distanciaDaAbertura % INTERVALO_INICIO_MINUTOS !== 0) {
    return {
      valido: false,
      mensagem:
        "Escolha um horário em um início válido de 5 em 5 minutos.",
    };
  }

  return {
    valido: true,
  };
}

async function existeConflitoDeHorario({
  profissionalId,
  inicio,
  fim,
  ignorarAgendamentoId,
}: {
  profissionalId: string;
  inicio: Date;
  fim: Date;
  ignorarAgendamentoId?: string;
}) {
  const conflito = await prisma.agendamento.findFirst({
    where: {
      profissionalId,
      id: ignorarAgendamentoId
        ? {
          not: ignorarAgendamentoId,
        }
        : undefined,
      status: {
        in: ["SOLICITADO", "CONFIRMADO"],
      },
      inicio: {
        lt: fim,
      },
      fim: {
        gt: inicio,
      },
    },
    select: {
      id: true,
    },
  });

  return Boolean(conflito);
}

async function existeBloqueioAgenda({
  profissionalId,
  inicio,
  fim,
}: {
  profissionalId: string;
  inicio: Date;
  fim: Date;
}) {
  const bloqueio = await prisma.bloqueioAgenda.findFirst({
    where: {
      ativo: true,
      inicio: {
        lt: fim,
      },
      fim: {
        gt: inicio,
      },
      OR: [
        {
          profissionalId: null,
        },
        {
          profissionalId,
        },
      ],
    },
    select: {
      id: true,
    },
  });

  return Boolean(bloqueio);
}

async function criarNotificacaoNovoAgendamento({
  clienteNome,
  servicoNome,
  inicio,
  acao,
}: {
  clienteNome: string;
  servicoNome: string;
  inicio: Date;
  acao: "solicitou" | "agendou";
}) {
  try {
    const destinatarios = await prisma.usuario.findMany({
      where: {
        papel: {
          in: ["FUNCIONARIO", "DONO"],
        },
      },
      select: {
        id: true,
      },
    });

    if (destinatarios.length === 0) {
      return;
    }

    const dataFormatada = new Intl.DateTimeFormat("pt-BR", {
      dateStyle: "short",
      timeStyle: "short",
      timeZone: TIMEZONE_PADRAO,
    }).format(inicio);

    await prisma.notificacao.createMany({
      data: destinatarios.map((usuario) => ({
        usuarioId: usuario.id,
        titulo: "Novo agendamento",
        mensagem: `Cliente ${clienteNome} ${acao} ${servicoNome} para ${dataFormatada}.`,
        link: "/funcionario/solicitacoes",
        tipo: "AGENDAMENTO",
      })),
    });
  } catch (error) {
    console.error("Erro ao criar notificação de agendamento:", error);
  }
}


async function criarNotificacaoCancelamentoCliente({
  clienteNome,
  servicoNome,
  inicio,
}: {
  clienteNome: string;
  servicoNome: string;
  inicio: Date;
}) {
  try {
    const destinatarios = await prisma.usuario.findMany({
      where: {
        papel: {
          in: ["FUNCIONARIO", "DONO"],
        },
      },
      select: {
        id: true,
      },
    });

    if (destinatarios.length === 0) {
      return;
    }

    const dataFormatada = new Intl.DateTimeFormat("pt-BR", {
      dateStyle: "short",
      timeStyle: "short",
      timeZone: TIMEZONE_PADRAO,
    }).format(inicio);

    await prisma.notificacao.createMany({
      data: destinatarios.map((usuario) => ({
        usuarioId: usuario.id,
        titulo: "Agendamento cancelado",
        mensagem: `Cliente ${clienteNome} cancelou ${servicoNome} de ${dataFormatada}.`,
        link: "/funcionario/solicitacoes",
        tipo: "CANCELAMENTO",
      })),
    });
  } catch (error) {
    console.error("Erro ao criar notificação de cancelamento:", error);
  }
}
function dispararEmailSemBloquear(
  contexto: string,
  acao: () => Promise<boolean>,
) {
  void acao().catch((error) => {
    console.error(
      `[EmailNotificacao] Erro assíncrono no envio. contexto: ${contexto}`,
      error,
    );
  });
}

export const clienteCancelarAgendamento =
  createServerFn({
    method: "POST",
  })
    .validator(cancelarAgendamentoClienteSchema)
    .handler(async ({ data }) => {
      const usuario = await exigirCliente();

      const agendamento =
        await prisma.agendamento.findFirst({
          where: {
            id: data.agendamentoId,
            clienteId: usuario.id,
          },
          select: {
            id: true,
            status: true,
            inicio: true,
            servico: {
              select: {
                nome: true,
              },
            },
            profissional: {
              select: {
                nome: true,
              },
            },
          },
        });

      if (!agendamento) {
        return {
          sucesso: false,
          mensagem: "Agendamento não encontrado.",
        };
      }

      if (
        agendamento.status !== "SOLICITADO" &&
        agendamento.status !== "CONFIRMADO"
      ) {
        return {
          sucesso: false,
          mensagem:
            "Apenas agendamentos solicitados ou confirmados podem ser cancelados.",
        };
      }

      if (agendamento.inicio <= new Date()) {
        return {
          sucesso: false,
          mensagem:
            "Não é possível cancelar um agendamento que já passou.",
        };
      }

      const agendamentoAtualizado =
        await prisma.agendamento.update({
          where: {
            id: agendamento.id,
          },
          data: {
            status: "CANCELADO_CLIENTE",
            motivoCancelamento:
              data.motivoCancelamento?.trim() || null,
            canceladoEm: new Date(),
          },
          select: {
            id: true,
            status: true,
            motivoCancelamento: true,
            canceladoEm: true,
          },
        });

      await criarNotificacaoCancelamentoCliente({
        clienteNome: usuario.nome,
        servicoNome: agendamento.servico.nome,
        inicio: agendamento.inicio,
      });

      dispararEmailSemBloquear("AGENDAMENTO_CANCELADO", () =>
        enviarNotificacaoAgendamento({
          tipo: "AGENDAMENTO_CANCELADO",
          agendamentoId: agendamento.id,
          cliente: {
            nome: usuario.nome,
            telefone: usuario.telefone,
            email: usuario.email,
          },
          servico: {
            nome: agendamento.servico.nome,
          },
          profissional: {
            nome: agendamento.profissional.nome,
          },
          inicio: agendamento.inicio,
          motivoCancelamento: agendamentoAtualizado.motivoCancelamento,
        }),
      );

      return {
        sucesso: true,
        mensagem: "Agendamento cancelado com sucesso.",
        agendamento: agendamentoAtualizado,
      };
    });

export const solicitarAgendamento = createServerFn({
  method: "POST",
})
  .validator(solicitarAgendamentoSchema)
  .handler(async ({ data }) => {
    const usuario = await exigirCliente();

    const inicio = converterData(data.inicio);

    if (!inicio) {
      return {
        sucesso: false,
        mensagem: "Data ou horário inválido.",
      };
    }

    const agora = new Date();

    if (inicio.getTime() <= agora.getTime()) {
      return {
        sucesso: false,
        mensagem: "Escolha um horário futuro.",
      };
    }

    const [servico, profissional] = await Promise.all([
      prisma.servico.findFirst({
        where: {
          id: data.servicoId,
          ativo: true,
        },
        select: {
          id: true,
          nome: true,
          duracaoMinutos: true,
          precoCentavos: true,
        },
      }),

      prisma.profissional.findFirst({
        where: {
          id: data.profissionalId,
          ativo: true,
        },
        select: {
          id: true,
          nome: true,
        },
      }),
    ]);

    if (!servico) {
      return {
        sucesso: false,
        mensagem: "Serviço não encontrado ou inativo.",
      };
    }

    if (!profissional) {
      return {
        sucesso: false,
        mensagem: "Profissional não encontrado ou inativo.",
      };
    }

    const fim = calcularFim(
      inicio,
      servico.duracaoMinutos,
    );

    const horarioNaGrade = validarHorarioNaGrade({
      inicio,
      duracaoMinutos: servico.duracaoMinutos,
    });

    if (!horarioNaGrade.valido) {
      return {
        sucesso: false,
        mensagem:
          horarioNaGrade.mensagem ||
          "Escolha um horário válido da agenda da barbearia.",
      };
    }

    const horarioBloqueado = await existeBloqueioAgenda({
      profissionalId: profissional.id,
      inicio,
      fim,
    });

    if (horarioBloqueado) {
      return {
        sucesso: false,
        mensagem:
          "Esse horário está bloqueado na agenda da barbearia.",
      };
    }

    const profissionalOcupado =
      await existeConflitoDeHorario({
        profissionalId: profissional.id,
        inicio,
        fim,
      });

    if (profissionalOcupado) {
      return {
        sucesso: false,
        mensagem:
          "Esse profissional já possui uma solicitação ou agendamento nesse horário.",
      };
    }

    const clienteOcupado = await prisma.agendamento.findFirst({
      where: {
        clienteId: usuario.id,
        status: {
          in: ["SOLICITADO", "CONFIRMADO"],
        },
        inicio: {
          lt: fim,
        },
        fim: {
          gt: inicio,
        },
      },
      select: {
        id: true,
      },
    });

    if (clienteOcupado) {
      return {
        sucesso: false,
        mensagem:
          "Você já possui uma solicitação ou agendamento nesse horário.",
      };
    }

    const agendamento = await prisma.agendamento.create({
      data: {
        clienteId: usuario.id,
        profissionalId: profissional.id,
        servicoId: servico.id,
        inicio,
        fim,
        status: "SOLICITADO",
        observacaoCliente:
          data.observacaoCliente?.trim() || null,
      },
      select: {
        id: true,
        inicio: true,
        fim: true,
        status: true,
        servico: {
          select: {
            nome: true,
            duracaoMinutos: true,
            precoCentavos: true,
          },
        },
        profissional: {
          select: {
            nome: true,
          },
        },
      },
    });

    await criarNotificacaoNovoAgendamento({
      clienteNome: usuario.nome,
      servicoNome: agendamento.servico.nome,
      inicio: agendamento.inicio,
      acao: "solicitou",
    });

    dispararEmailSemBloquear("NOVO_AGENDAMENTO", () =>
      enviarNotificacaoAgendamento({
        tipo: "NOVO_AGENDAMENTO",
        agendamentoId: agendamento.id,
        cliente: {
          nome: usuario.nome,
          telefone: usuario.telefone,
          email: usuario.email,
        },
        servico: {
          nome: agendamento.servico.nome,
        },
        profissional: {
          nome: agendamento.profissional.nome,
        },
        inicio: agendamento.inicio,
      }),
    );

    return {
      sucesso: true,
      mensagem:
        "Solicitação enviada com sucesso. Aguarde a confirmação da equipe.",
      agendamento,
    };
  });

export const funcionarioListarDadosParaAgendarCliente =
  createServerFn({
    method: "GET",
  }).handler(async () => {
    await exigirOperacional();

    const [clientes, servicos, profissionais] =
      await Promise.all([
        prisma.usuario.findMany({
          where: {
            papel: "CLIENTE",
          },
          orderBy: {
            nome: "asc",
          },
          select: {
            id: true,
            nome: true,
            email: true,
            telefone: true,
          },
        }),

        prisma.servico.findMany({
          where: {
            ativo: true,
          },
          orderBy: {
            nome: "asc",
          },
          select: {
            id: true,
            nome: true,
            duracaoMinutos: true,
            precoCentavos: true,
          },
        }),

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
          },
        }),
      ]);

    return {
      clientes,
      servicos,
      profissionais,
    };
  });

export const funcionarioCriarAgendamentoParaCliente =
  createServerFn({
    method: "POST",
  })
    .validator(funcionarioCriarAgendamentoParaClienteSchema)
    .handler(async ({ data }) => {
      await exigirOperacional();

      const inicio = converterData(data.inicio);

      if (!inicio) {
        return {
          sucesso: false,
          mensagem: "Data ou horário inválido.",
        };
      }

      const agora = new Date();

      if (inicio.getTime() <= agora.getTime()) {
        return {
          sucesso: false,
          mensagem: "Escolha um horário futuro.",
        };
      }

      const [cliente, servico, profissional] =
        await Promise.all([
          prisma.usuario.findFirst({
            where: {
              id: data.clienteId,
              papel: "CLIENTE",
            },
            select: {
              id: true,
              nome: true,
              email: true,
              telefone: true,
            },
          }),

          prisma.servico.findFirst({
            where: {
              id: data.servicoId,
              ativo: true,
            },
            select: {
              id: true,
              nome: true,
              duracaoMinutos: true,
              precoCentavos: true,
            },
          }),

          prisma.profissional.findFirst({
            where: {
              id: data.profissionalId,
              ativo: true,
            },
            select: {
              id: true,
              nome: true,
            },
          }),
        ]);

      if (!cliente) {
        return {
          sucesso: false,
          mensagem: "Cliente não encontrado.",
        };
      }

      if (!servico) {
        return {
          sucesso: false,
          mensagem: "Serviço não encontrado ou inativo.",
        };
      }

      if (!profissional) {
        return {
          sucesso: false,
          mensagem: "Profissional não encontrado ou inativo.",
        };
      }

      const fim = calcularFim(
        inicio,
        servico.duracaoMinutos,
      );

      const horarioNaGrade = validarHorarioNaGrade({
        inicio,
        duracaoMinutos: servico.duracaoMinutos,
      });

      if (!horarioNaGrade.valido) {
        return {
          sucesso: false,
          mensagem:
            horarioNaGrade.mensagem ||
            "Escolha um horário válido da agenda da barbearia.",
        };
      }

      const horarioBloqueado = await existeBloqueioAgenda({
        profissionalId: profissional.id,
        inicio,
        fim,
      });

      if (horarioBloqueado) {
        return {
          sucesso: false,
          mensagem:
            "Esse horário está bloqueado na agenda da barbearia.",
        };
      }

      const profissionalOcupado =
        await existeConflitoDeHorario({
          profissionalId: profissional.id,
          inicio,
          fim,
        });

      if (profissionalOcupado) {
        return {
          sucesso: false,
          mensagem:
            "Esse profissional já possui uma solicitação ou agendamento nesse horário.",
        };
      }

      const clienteOcupado =
        await prisma.agendamento.findFirst({
          where: {
            clienteId: cliente.id,
            status: {
              in: ["SOLICITADO", "CONFIRMADO"],
            },
            inicio: {
              lt: fim,
            },
            fim: {
              gt: inicio,
            },
          },
          select: {
            id: true,
          },
        });

      if (clienteOcupado) {
        return {
          sucesso: false,
          mensagem:
            "Esse cliente já possui uma solicitação ou agendamento nesse horário.",
        };
      }

      const agendamento = await prisma.agendamento.create({
        data: {
          clienteId: cliente.id,
          profissionalId: profissional.id,
          servicoId: servico.id,
          inicio,
          fim,
          status: "CONFIRMADO",
          observacaoCliente:
            data.observacaoCliente?.trim() ||
            "Agendamento criado pela equipe.",
        },
        select: {
          id: true,
          inicio: true,
          fim: true,
          status: true,

          cliente: {
            select: {
              id: true,
              nome: true,
              email: true,
              telefone: true,
            },
          },

          servico: {
            select: {
              id: true,
              nome: true,
              duracaoMinutos: true,
              precoCentavos: true,
            },
          },

          profissional: {
            select: {
              id: true,
              nome: true,
            },
          },
        },
      });

      await criarNotificacaoNovoAgendamento({
        clienteNome: agendamento.cliente.nome,
        servicoNome: agendamento.servico.nome,
        inicio: agendamento.inicio,
        acao: "agendou",
      });

      dispararEmailSemBloquear("AGENDAMENTO_CONFIRMADO_CRIADO_EQUIPE", () =>
        enviarEmailConfirmacaoAgendamento({
          agendamentoId: agendamento.id,
          cliente: agendamento.cliente,
          servico: agendamento.servico,
          profissional: agendamento.profissional,
          inicio: agendamento.inicio,
        }),
      );

      return {
        sucesso: true,
        mensagem: "Agendamento criado e confirmado com sucesso.",
        agendamento,
      };
    });


export const funcionarioCancelarAgendamento =
  createServerFn({
    method: "POST",
  })
    .validator(cancelarAgendamentoEquipeSchema)
    .handler(async ({ data }) => {
      await exigirOperacional();

      const agendamento =
        await prisma.agendamento.findUnique({
          where: {
            id: data.agendamentoId,
          },
          select: {
            id: true,
            status: true,
            inicio: true,

            cliente: {
              select: {
                id: true,
                nome: true,
                email: true,
              },
            },

            servico: {
              select: {
                id: true,
                nome: true,
              },
            },

            profissional: {
              select: {
                id: true,
                nome: true,
              },
            },
          },
        });

      if (!agendamento) {
        return {
          sucesso: false,
          mensagem: "Agendamento não encontrado.",
        };
      }

      if (agendamento.status !== "CONFIRMADO") {
        return {
          sucesso: false,
          mensagem:
            "Apenas agendamentos confirmados podem ser cancelados pela equipe.",
        };
      }

      const motivoCancelamento =
        data.motivoCancelamento?.trim() || null;

      const agendamentoAtualizado =
        await prisma.agendamento.update({
          where: {
            id: agendamento.id,
          },
          data: {
            status: "CANCELADO_FUNCIONARIO",
            motivoCancelamento,
            canceladoEm: new Date(),
          },
          select: {
            id: true,
            status: true,
            motivoCancelamento: true,
            canceladoEm: true,
          },
        });

      dispararEmailSemBloquear("AGENDAMENTO_CANCELADO_EQUIPE_CLIENTE", () =>
        enviarEmailCancelamentoEquipeCliente({
          agendamentoId: agendamento.id,
          cliente: {
            nome: agendamento.cliente.nome,
            email: agendamento.cliente.email,
          },
          servico: {
            nome: agendamento.servico.nome,
          },
          profissional: {
            nome: agendamento.profissional.nome,
          },
          inicio: agendamento.inicio,
          motivoCancelamento,
        }),
      );

      return {
        sucesso: true,
        mensagem: "Agendamento cancelado pela equipe.",
        agendamento: agendamentoAtualizado,
      };
    });

export const listarMeusAgendamentos = createServerFn({
  method: "GET",
}).handler(async () => {
  const usuario = await exigirCliente();

  return prisma.agendamento.findMany({
    where: {
      clienteId: usuario.id,
    },
    orderBy: {
      inicio: "desc",
    },
    select: {
      id: true,
      inicio: true,
      fim: true,
      status: true,
      observacaoCliente: true,
      motivoRecusa: true,
      motivoCancelamento: true,
      canceladoEm: true,
      criadoEm: true,
      atualizadoEm: true,

      profissional: {
        select: {
          id: true,
          nome: true,
        },
      },

      servico: {
        select: {
          id: true,
          nome: true,
          duracaoMinutos: true,
          precoCentavos: true,
        },
      },
    },
  });
});

export const funcionarioListarSolicitacoes =
  createServerFn({
    method: "GET",
  }).handler(async () => {
    await exigirOperacional();

    return prisma.agendamento.findMany({
      where: {
        status: {
          in: ["SOLICITADO", "CONFIRMADO"],
        },
      },
      orderBy: {
        inicio: "asc",
      },
      select: {
        id: true,
        inicio: true,
        fim: true,
        status: true,
        observacaoCliente: true,
        cliente: {
          select: {
            id: true,
            nome: true,
            email: true,
            telefone: true,
          },
        },
        servico: {
          select: {
            id: true,
            nome: true,
            duracaoMinutos: true,
            precoCentavos: true,
          },
        },
        profissional: {
          select: {
            id: true,
            nome: true,
          },
        },
      },
    });
  });

export const funcionarioConfirmarAgendamento =
  createServerFn({
    method: "POST",
  })
    .validator(alterarStatusSchema)
    .handler(async ({ data }) => {
      await exigirOperacional();

      const agendamento =
        await prisma.agendamento.findUnique({
          where: {
            id: data.agendamentoId,
          },
          select: {
            id: true,
            profissionalId: true,
            inicio: true,
            fim: true,
            status: true,

            cliente: {
              select: {
                nome: true,
                email: true,
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
              },
            },
          },
        });

      if (!agendamento) {
        return {
          sucesso: false,
          mensagem: "Agendamento não encontrado.",
        };
      }

      if (agendamento.status !== "SOLICITADO") {
        return {
          sucesso: false,
          mensagem:
            "Apenas solicitações pendentes podem ser confirmadas.",
        };
      }

      const conflito = await existeConflitoDeHorario({
        profissionalId: agendamento.profissionalId,
        inicio: agendamento.inicio,
        fim: agendamento.fim,
        ignorarAgendamentoId: agendamento.id,
      });

      if (conflito) {
        return {
          sucesso: false,
          mensagem:
            "Existe outro agendamento ou solicitação ocupando esse horário.",
        };
      }

      const agendamentoAtualizado =
        await prisma.agendamento.update({
          where: {
            id: agendamento.id,
          },
          data: {
            status: "CONFIRMADO",
            motivoRecusa: null,
          },
          select: {
            id: true,
            status: true,
            inicio: true,
            fim: true,
          },
        });

      dispararEmailSemBloquear("AGENDAMENTO_CONFIRMADO", () =>
        enviarEmailConfirmacaoAgendamento({
          agendamentoId: agendamento.id,
          cliente: agendamento.cliente,
          servico: agendamento.servico,
          profissional: agendamento.profissional,
          inicio: agendamentoAtualizado.inicio,
        }),
      );

      return {
        sucesso: true,
        mensagem: "Agendamento confirmado com sucesso.",
        agendamento: agendamentoAtualizado,
      };
    });

export const funcionarioRecusarAgendamento =
  createServerFn({
    method: "POST",
  })
    .validator(recusarAgendamentoSchema)
    .handler(async ({ data }) => {
      await exigirOperacional();

      const agendamento =
        await prisma.agendamento.findUnique({
          where: {
            id: data.agendamentoId,
          },
          select: {
            id: true,
            status: true,
            inicio: true,

            cliente: {
              select: {
                nome: true,
                email: true,
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
              },
            },
          },
        });

      if (!agendamento) {
        return {
          sucesso: false,
          mensagem: "Agendamento não encontrado.",
        };
      }

      if (agendamento.status !== "SOLICITADO") {
        return {
          sucesso: false,
          mensagem:
            "Apenas solicitações pendentes podem ser recusadas.",
        };
      }

      const agendamentoAtualizado =
        await prisma.agendamento.update({
          where: {
            id: agendamento.id,
          },
          data: {
            status: "RECUSADO",
            motivoRecusa:
              data.motivoRecusa?.trim() || null,
          },
          select: {
            id: true,
            status: true,
            motivoRecusa: true,
          },
        });

      dispararEmailSemBloquear("AGENDAMENTO_RECUSADO", () =>
        enviarEmailRecusaAgendamento({
          agendamentoId: agendamento.id,
          cliente: agendamento.cliente,
          servico: agendamento.servico,
          profissional: agendamento.profissional,
          inicio: agendamento.inicio,
        }),
      );

      return {
        sucesso: true,
        mensagem: "Solicitação recusada.",
        agendamento: agendamentoAtualizado,
      };
    });



export const operacionalCriarAtendimentoRetroativo =
  createServerFn({
    method: "POST",
  })
    .validator(criarAtendimentoRetroativoSchema)
    .handler(async ({ data }) => {
      const usuario = await exigirOperacional();

      const inicio = converterData(data.inicio);
      const fim = converterData(data.fim);

      if (!inicio || !fim) {
        return {
          sucesso: false,
          mensagem: "Data ou horário inválido.",
        };
      }

      const agora = new Date();
      const erroJanela = validarJanelaAjusteHistorico({
        inicio,
        fim,
        agora,
      });

      if (erroJanela) {
        return {
          sucesso: false,
          mensagem: erroJanela,
        };
      }

      const [cliente, profissional, servico] = await Promise.all([
        prisma.usuario.findFirst({
          where: {
            id: data.clienteId,
            papel: "CLIENTE",
          },
          select: {
            id: true,
            nome: true,
          },
        }),
        prisma.profissional.findFirst({
          where: {
            id: data.profissionalId,
            ativo: true,
          },
          select: {
            id: true,
            nome: true,
          },
        }),
        prisma.servico.findFirst({
          where: {
            id: data.servicoId,
            ativo: true,
          },
          select: {
            id: true,
            nome: true,
            precoCentavos: true,
          },
        }),
      ]);

      if (!cliente) {
        return {
          sucesso: false,
          mensagem: "Cliente não encontrado.",
        };
      }

      if (!profissional) {
        return {
          sucesso: false,
          mensagem: "Profissional não encontrado ou inativo.",
        };
      }

      if (!servico) {
        return {
          sucesso: false,
          mensagem: "Serviço não encontrado ou inativo.",
        };
      }

      const valorFinal =
        data.formaPagamento === "ASSINATURA"
          ? 0
          : data.valorPagoCentavos;

      const auditoria = [
        `[LANÇAMENTO RETROATIVO ${agora.toISOString()}]`,
        `${usuario.nome} registrou atendimento passado.`,
        `Cliente: ${cliente.nome}.`,
        `Profissional: ${profissional.nome}.`,
        `Serviço: ${servico.nome}.`,
        `Período: ${inicio.toISOString()} até ${fim.toISOString()}.`,
        `Pagamento: ${data.formaPagamento}.`,
        `Valor: ${formatarValorAuditoria(valorFinal)}.`,
        `Motivo: ${data.motivo.trim()}`,
      ].join(" ");

      try {
        const agendamento = await prisma.$transaction(
          async (tx) => {
            let assinatura:
              | {
                  id: string;
                  plano: {
                    nome: string;
                  };
                }
              | null = null;

            if (data.formaPagamento === "ASSINATURA") {
              assinatura =
                await tx.assinaturaCliente.findFirst({
                  where: {
                    clienteId: cliente.id,
                    vigenciaInicio: {
                      lte: inicio,
                    },
                    vigenciaFim: {
                      gte: inicio,
                    },
                    saldoCortes: {
                      gt: 0,
                    },
                  },
                  orderBy: {
                    criadoEm: "desc",
                  },
                  select: {
                    id: true,
                    plano: {
                      select: {
                        nome: true,
                      },
                    },
                  },
                });

              if (!assinatura) {
                throw new Error(
                  "ASSINATURA_RETROATIVA_INDISPONIVEL",
                );
              }
            }

            const criado = await tx.agendamento.create({
              data: {
                clienteId: cliente.id,
                profissionalId: profissional.id,
                servicoId: servico.id,
                inicio,
                fim,
                status: "CONCLUIDO",
                formaPagamento: data.formaPagamento,
                valorPagoCentavos: valorFinal,
                pagoEm: fim,
                observacaoInterna: auditoria,
                observacaoPagamento:
                  data.formaPagamento === "ASSINATURA"
                    ? `Atendimento retroativo descontado da assinatura ${assinatura?.plano.nome}.`
                    : null,
              },
              select: {
                id: true,
                inicio: true,
                fim: true,
                status: true,
                formaPagamento: true,
                valorPagoCentavos: true,
                pagoEm: true,
                observacaoInterna: true,
                cliente: {
                  select: {
                    id: true,
                    nome: true,
                    email: true,
                    telefone: true,
                  },
                },
                profissional: {
                  select: {
                    id: true,
                    nome: true,
                  },
                },
                servico: {
                  select: {
                    id: true,
                    nome: true,
                    duracaoMinutos: true,
                    precoCentavos: true,
                  },
                },
              },
            });

            if (assinatura) {
              await tx.assinaturaCliente.update({
                where: {
                  id: assinatura.id,
                },
                data: {
                  saldoCortes: {
                    decrement: 1,
                  },
                },
              });

              await tx.usoAssinatura.create({
                data: {
                  assinaturaId: assinatura.id,
                  agendamentoId: criado.id,
                  quantidadeCortes: 1,
                },
              });
            }

            return criado;
          },
        );

        return {
          sucesso: true,
          mensagem:
            "Atendimento passado registrado com sucesso.",
          agendamento,
        };
      } catch (error) {
        if (
          error instanceof Error &&
          error.message ===
            "ASSINATURA_RETROATIVA_INDISPONIVEL"
        ) {
          return {
            sucesso: false,
            mensagem:
              "Não existe assinatura com saldo válida para esse cliente na data informada.",
          };
        }

        throw error;
      }
    });

export const operacionalAtualizarAtendimentoConcluido =
  createServerFn({
    method: "POST",
  })
    .validator(atualizarAtendimentoConcluidoSchema)
    .handler(async ({ data }) => {
      const usuario = await exigirOperacional();

      const novoInicio = converterData(data.inicio);
      const novoFim = converterData(data.fim);

      if (!novoInicio || !novoFim) {
        return {
          sucesso: false,
          mensagem: "Data ou horário inválido.",
        };
      }

      const agora = new Date();
      const erroNovaJanela = validarJanelaAjusteHistorico({
        inicio: novoInicio,
        fim: novoFim,
        agora,
      });

      if (erroNovaJanela) {
        return {
          sucesso: false,
          mensagem: erroNovaJanela,
        };
      }

      const atual = await prisma.agendamento.findUnique({
        where: {
          id: data.agendamentoId,
        },
        select: {
          id: true,
          status: true,
          inicio: true,
          fim: true,
          formaPagamento: true,
          valorPagoCentavos: true,
          pagoEm: true,
          observacaoInterna: true,
          observacaoPagamento: true,
          cliente: {
            select: {
              id: true,
              nome: true,
            },
          },
          profissional: {
            select: {
              id: true,
              nome: true,
            },
          },
          servico: {
            select: {
              id: true,
              nome: true,
            },
          },
          usoAssinatura: {
            select: {
              id: true,
              assinaturaId: true,
              quantidadeCortes: true,
            },
          },
        },
      });

      if (!atual) {
        return {
          sucesso: false,
          mensagem: "Atendimento não encontrado.",
        };
      }

      if (atual.status !== "CONCLUIDO") {
        return {
          sucesso: false,
          mensagem:
            "Somente atendimentos concluídos podem ser ajustados aqui.",
        };
      }

      const erroJanelaAtual = validarJanelaAjusteHistorico({
        inicio: atual.inicio,
        fim: atual.fim,
        agora,
      });

      if (erroJanelaAtual) {
        return {
          sucesso: false,
          mensagem:
            "Este atendimento ultrapassou a janela de 7 dias para ajustes.",
        };
      }

      const [cliente, profissional, servico] = await Promise.all([
        prisma.usuario.findFirst({
          where: {
            id: data.clienteId,
            papel: "CLIENTE",
          },
          select: {
            id: true,
            nome: true,
          },
        }),
        prisma.profissional.findFirst({
          where: {
            id: data.profissionalId,
            ativo: true,
          },
          select: {
            id: true,
            nome: true,
          },
        }),
        prisma.servico.findFirst({
          where: {
            id: data.servicoId,
            ativo: true,
          },
          select: {
            id: true,
            nome: true,
            precoCentavos: true,
          },
        }),
      ]);

      if (!cliente) {
        return {
          sucesso: false,
          mensagem: "Cliente não encontrado.",
        };
      }

      if (!profissional) {
        return {
          sucesso: false,
          mensagem: "Profissional não encontrado ou inativo.",
        };
      }

      if (!servico) {
        return {
          sucesso: false,
          mensagem: "Serviço não encontrado ou inativo.",
        };
      }

      const valorFinal =
        data.formaPagamento === "ASSINATURA"
          ? 0
          : data.valorPagoCentavos;

      const linhaAuditoria = [
        `[AJUSTE DE ATENDIMENTO ${agora.toISOString()}]`,
        `${usuario.nome} alterou o atendimento.`,
        `Cliente: "${atual.cliente.nome}" -> "${cliente.nome}".`,
        `Profissional: "${atual.profissional.nome}" -> "${profissional.nome}".`,
        `Serviço: "${atual.servico.nome}" -> "${servico.nome}".`,
        `Período: ${atual.inicio.toISOString()}–${atual.fim.toISOString()} -> ${novoInicio.toISOString()}–${novoFim.toISOString()}.`,
        `Pagamento: ${atual.formaPagamento ?? "NÃO INFORMADO"} -> ${data.formaPagamento}.`,
        `Valor: ${formatarValorAuditoria(atual.valorPagoCentavos)} -> ${formatarValorAuditoria(valorFinal)}.`,
        `Motivo: ${data.motivo.trim()}`,
      ].join(" ");

      const novaObservacaoInterna = [
        atual.observacaoInterna?.trim(),
        linhaAuditoria,
      ]
        .filter(Boolean)
        .join("\n");

      try {
        const agendamento = await prisma.$transaction(
          async (tx) => {
            const desejaAssinatura =
              data.formaPagamento === "ASSINATURA";

            if (atual.usoAssinatura) {
              if (!desejaAssinatura) {
                await tx.assinaturaCliente.update({
                  where: {
                    id: atual.usoAssinatura.assinaturaId,
                  },
                  data: {
                    saldoCortes: {
                      increment:
                        atual.usoAssinatura.quantidadeCortes,
                    },
                  },
                });

                await tx.usoAssinatura.delete({
                  where: {
                    id: atual.usoAssinatura.id,
                  },
                });
              } else {
                const assinaturaAtualAindaValida =
                  await tx.assinaturaCliente.findFirst({
                    where: {
                      id: atual.usoAssinatura.assinaturaId,
                      clienteId: cliente.id,
                      vigenciaInicio: {
                        lte: novoInicio,
                      },
                      vigenciaFim: {
                        gte: novoInicio,
                      },
                    },
                    select: {
                      id: true,
                    },
                  });

                if (!assinaturaAtualAindaValida) {
                  await tx.assinaturaCliente.update({
                    where: {
                      id: atual.usoAssinatura.assinaturaId,
                    },
                    data: {
                      saldoCortes: {
                        increment:
                          atual.usoAssinatura.quantidadeCortes,
                      },
                    },
                  });

                  const novaAssinatura =
                    await tx.assinaturaCliente.findFirst({
                      where: {
                        clienteId: cliente.id,
                        vigenciaInicio: {
                          lte: novoInicio,
                        },
                        vigenciaFim: {
                          gte: novoInicio,
                        },
                        saldoCortes: {
                          gt: 0,
                        },
                      },
                      orderBy: {
                        criadoEm: "desc",
                      },
                      select: {
                        id: true,
                      },
                    });

                  if (!novaAssinatura) {
                    throw new Error(
                      "ASSINATURA_AJUSTE_INDISPONIVEL",
                    );
                  }

                  await tx.assinaturaCliente.update({
                    where: {
                      id: novaAssinatura.id,
                    },
                    data: {
                      saldoCortes: {
                        decrement:
                          atual.usoAssinatura.quantidadeCortes,
                      },
                    },
                  });

                  await tx.usoAssinatura.update({
                    where: {
                      id: atual.usoAssinatura.id,
                    },
                    data: {
                      assinaturaId: novaAssinatura.id,
                    },
                  });
                }
              }
            } else if (desejaAssinatura) {
              const assinatura =
                await tx.assinaturaCliente.findFirst({
                  where: {
                    clienteId: cliente.id,
                    vigenciaInicio: {
                      lte: novoInicio,
                    },
                    vigenciaFim: {
                      gte: novoInicio,
                    },
                    saldoCortes: {
                      gt: 0,
                    },
                  },
                  orderBy: {
                    criadoEm: "desc",
                  },
                  select: {
                    id: true,
                  },
                });

              if (!assinatura) {
                throw new Error(
                  "ASSINATURA_AJUSTE_INDISPONIVEL",
                );
              }

              await tx.assinaturaCliente.update({
                where: {
                  id: assinatura.id,
                },
                data: {
                  saldoCortes: {
                    decrement: 1,
                  },
                },
              });

              await tx.usoAssinatura.create({
                data: {
                  assinaturaId: assinatura.id,
                  agendamentoId: atual.id,
                  quantidadeCortes: 1,
                },
              });
            }

            return tx.agendamento.update({
              where: {
                id: atual.id,
              },
              data: {
                clienteId: cliente.id,
                profissionalId: profissional.id,
                servicoId: servico.id,
                inicio: novoInicio,
                fim: novoFim,
                formaPagamento: data.formaPagamento,
                valorPagoCentavos: valorFinal,
                pagoEm: atual.pagoEm ?? novoFim,
                observacaoPagamento:
                  data.formaPagamento === "ASSINATURA"
                    ? "Atendimento ajustado com uso de assinatura RD Black."
                    : atual.formaPagamento === data.formaPagamento
                      ? atual.observacaoPagamento
                      : null,
                observacaoInterna: novaObservacaoInterna,
              },
              select: {
                id: true,
                inicio: true,
                fim: true,
                status: true,
                formaPagamento: true,
                valorPagoCentavos: true,
                pagoEm: true,
                observacaoInterna: true,
                cliente: {
                  select: {
                    id: true,
                    nome: true,
                    email: true,
                    telefone: true,
                  },
                },
                profissional: {
                  select: {
                    id: true,
                    nome: true,
                  },
                },
                servico: {
                  select: {
                    id: true,
                    nome: true,
                    duracaoMinutos: true,
                    precoCentavos: true,
                  },
                },
              },
            });
          },
        );

        return {
          sucesso: true,
          mensagem:
            "Atendimento ajustado com sucesso. Agenda e financeiro foram atualizados.",
          agendamento,
        };
      } catch (error) {
        if (
          error instanceof Error &&
          error.message ===
            "ASSINATURA_AJUSTE_INDISPONIVEL"
        ) {
          return {
            sucesso: false,
            mensagem:
              "Não existe assinatura com saldo válida para esse cliente na data informada.",
          };
        }

        throw error;
      }
    });

export const operacionalListarAtendimentosCorrigiveis =
  createServerFn({
    method: "GET",
  }).handler(async () => {
    await exigirOperacional();

    const agora = new Date();
    const limite = obterLimiteCorrecaoServico(agora);

    return prisma.agendamento.findMany({
      where: {
        status: "CONCLUIDO",
        inicio: {
          gte: limite,
          lte: agora,
        },
      },
      orderBy: {
        inicio: "desc",
      },
      select: {
        id: true,
        inicio: true,
        fim: true,
        status: true,
        formaPagamento: true,
        valorPagoCentavos: true,
        pagoEm: true,
        observacaoInterna: true,

        cliente: {
          select: {
            id: true,
            nome: true,
            email: true,
            telefone: true,
          },
        },

        profissional: {
          select: {
            id: true,
            nome: true,
          },
        },

        servico: {
          select: {
            id: true,
            nome: true,
            duracaoMinutos: true,
            precoCentavos: true,
          },
        },
      },
    });
  });

export const operacionalCorrigirServicoConcluido =
  createServerFn({
    method: "POST",
  })
    .validator(corrigirServicoConcluidoSchema)
    .handler(async ({ data }) => {
      const usuario = await exigirOperacional();

      const agora = new Date();
      const limite = obterLimiteCorrecaoServico(agora);

      const agendamento = await prisma.agendamento.findUnique({
        where: {
          id: data.agendamentoId,
        },
        select: {
          id: true,
          status: true,
          inicio: true,
          fim: true,
          servicoId: true,
          observacaoInterna: true,
          formaPagamento: true,
          valorPagoCentavos: true,
          pagoEm: true,

          servico: {
            select: {
              id: true,
              nome: true,
            },
          },
        },
      });

      if (!agendamento) {
        return {
          sucesso: false,
          mensagem: "Atendimento não encontrado.",
        };
      }

      if (agendamento.status !== "CONCLUIDO") {
        return {
          sucesso: false,
          mensagem:
            "Somente atendimentos concluídos podem ter o serviço corrigido.",
        };
      }

      if (
        agendamento.inicio < limite ||
        agendamento.inicio > agora
      ) {
        return {
          sucesso: false,
          mensagem:
            "Este atendimento ultrapassou o período de 7 dias permitido para correções.",
        };
      }

      if (agendamento.servicoId === data.servicoId) {
        return {
          sucesso: false,
          mensagem:
            "O serviço escolhido já é o serviço atual deste atendimento.",
        };
      }

      const novoServico = await prisma.servico.findFirst({
        where: {
          id: data.servicoId,
          ativo: true,
        },
        select: {
          id: true,
          nome: true,
          duracaoMinutos: true,
          precoCentavos: true,
        },
      });

      if (!novoServico) {
        return {
          sucesso: false,
          mensagem: "O novo serviço não foi encontrado ou está inativo.",
        };
      }

      const valorPagoCentavosCorrigido =
        agendamento.formaPagamento === "ASSINATURA"
          ? 0
          : data.valorPagoCentavos;

      const valorAnteriorTexto = new Intl.NumberFormat("pt-BR", {
        style: "currency",
        currency: "BRL",
      }).format((agendamento.valorPagoCentavos ?? 0) / 100);

      const valorNovoTexto = new Intl.NumberFormat("pt-BR", {
        style: "currency",
        currency: "BRL",
      }).format(valorPagoCentavosCorrigido / 100);
      const motivo = data.motivo.trim();
      const linhaAuditoria = [
        `[CORREÇÃO DE SERVIÇO ${agora.toISOString()}]`,
        `${usuario.nome} alterou "${agendamento.servico.nome}" para "${novoServico.nome}" e o valor de ${valorAnteriorTexto} para ${valorNovoTexto}.`,
        `Motivo: ${motivo}`,
      ].join(" ");

      const observacaoInterna = [
        agendamento.observacaoInterna?.trim(),
        linhaAuditoria,
      ]
        .filter(Boolean)
        .join("\n");

      const atualizado = await prisma.agendamento.update({
        where: {
          id: agendamento.id,
        },
        data: {
          servicoId: novoServico.id,
          valorPagoCentavos: valorPagoCentavosCorrigido,
          observacaoInterna,
        },
        select: {
          id: true,
          inicio: true,
          fim: true,
          status: true,
          formaPagamento: true,
          valorPagoCentavos: true,
          pagoEm: true,

          servico: {
            select: {
              id: true,
              nome: true,
              duracaoMinutos: true,
              precoCentavos: true,
            },
          },
        },
      });

      return {
        sucesso: true,
        mensagem: `Atendimento corrigido para "${novoServico.nome}" com valor ${valorNovoTexto}. Horário e forma de pagamento foram preservados.`,
        agendamento: atualizado,
      };
    });

export const funcionarioConcluirAgendamento =
  createServerFn({
    method: "POST",
  })
    .validator(concluirAgendamentoSchema)
    .handler(async ({ data }) => {
      await exigirOperacional();

      const agendamento =
        await prisma.agendamento.findUnique({
          where: {
            id: data.agendamentoId,
          },
          select: {
            id: true,
            clienteId: true,
            status: true,

            usoAssinatura: {
              select: {
                id: true,
              },
            },

            servico: {
              select: {
                id: true,
                nome: true,
                precoCentavos: true,
              },
            },
          },
        });

      if (!agendamento) {
        return {
          sucesso: false,
          mensagem: "Agendamento não encontrado.",
        };
      }

      if (agendamento.status !== "CONFIRMADO") {
        return {
          sucesso: false,
          mensagem:
            "Apenas agendamentos confirmados podem ser concluídos.",
        };
      }

      if (agendamento.usoAssinatura) {
        return {
          sucesso: false,
          mensagem:
            "Esse agendamento já possui uso de assinatura registrado.",
        };
      }

      const formaPagamento =
        data.formaPagamento as FormaPagamento;

      if (formaPagamento === "ASSINATURA") {
        const agora = new Date();

        const assinatura =
          await prisma.assinaturaCliente.findFirst({
            where: {
              clienteId: agendamento.clienteId,
              status: "ATIVA",
              vigenciaInicio: {
                lte: agora,
              },
              vigenciaFim: {
                gte: agora,
              },
              saldoCortes: {
                gt: 0,
              },
            },
            orderBy: {
              criadoEm: "desc",
            },
            select: {
              id: true,
              saldoCortes: true,
              plano: {
                select: {
                  nome: true,
                },
              },
            },
          });

        if (!assinatura) {
          return {
            sucesso: false,
            mensagem:
              "Este cliente não possui assinatura ativa com saldo disponível.",
          };
        }

        const agendamentoAtualizado =
          await prisma.$transaction(async (tx) => {
            await tx.assinaturaCliente.update({
              where: {
                id: assinatura.id,
              },
              data: {
                saldoCortes: {
                  decrement: 1,
                },
              },
            });

            await tx.usoAssinatura.create({
              data: {
                assinaturaId: assinatura.id,
                agendamentoId: agendamento.id,
                quantidadeCortes: 1,
              },
            });

            return tx.agendamento.update({
              where: {
                id: agendamento.id,
              },
              data: {
                status: "CONCLUIDO",
                formaPagamento: "ASSINATURA",
                valorPagoCentavos: 0,
                pagoEm: new Date(),
                observacaoPagamento:
                  data.observacaoPagamento?.trim() ||
                  `Atendimento descontado da assinatura ${assinatura.plano.nome}.`,
              },
              select: {
                id: true,
                status: true,
                formaPagamento: true,
                valorPagoCentavos: true,
                pagoEm: true,
              },
            });
          });

        return {
          sucesso: true,
          mensagem:
            "Atendimento concluído e 1 corte foi descontado da assinatura.",
          agendamento: agendamentoAtualizado,
        };
      }

      const valorPagoCentavos =
        data.valorPagoCentavos ??
        agendamento.servico.precoCentavos;

      const agendamentoAtualizado =
        await prisma.agendamento.update({
          where: {
            id: agendamento.id,
          },
          data: {
            status: "CONCLUIDO",
            formaPagamento,
            valorPagoCentavos,
            pagoEm: new Date(),
            observacaoPagamento:
              data.observacaoPagamento?.trim() || null,
          },
          select: {
            id: true,
            status: true,
            formaPagamento: true,
            valorPagoCentavos: true,
            pagoEm: true,
          },
        });

      return {
        sucesso: true,
        mensagem: "Atendimento concluído com sucesso.",
        agendamento: agendamentoAtualizado,
      };
    });
export const operacionalRemarcarAgendamento =
  createServerFn({
    method: "POST",
  })
    .validator(remarcarAgendamentoSchema)
    .handler(async ({ data }) => {
      await exigirOperacional();

      const novoInicio = converterData(data.inicio);

      if (!novoInicio) {
        return {
          sucesso: false,
          mensagem: "Nova data ou horário inválido.",
        };
      }

      if (novoInicio.getTime() <= new Date().getTime()) {
        return {
          sucesso: false,
          mensagem: "Escolha um horário futuro.",
        };
      }

      const agendamento = await prisma.agendamento.findUnique({
        where: {
          id: data.agendamentoId,
        },
        select: {
          id: true,
          status: true,
          profissionalId: true,
          inicio: true,

          cliente: {
            select: {
              id: true,
              nome: true,
              email: true,
              telefone: true,
            },
          },

          profissional: {
            select: {
              id: true,
              nome: true,
            },
          },

          servico: {
            select: {
              id: true,
              nome: true,
              duracaoMinutos: true,
              precoCentavos: true,
            },
          },
        },
      });

      if (!agendamento) {
        return {
          sucesso: false,
          mensagem: "Agendamento não encontrado.",
        };
      }

      if (
        agendamento.status !== "SOLICITADO" &&
        agendamento.status !== "CONFIRMADO"
      ) {
        return {
          sucesso: false,
          mensagem:
            "Apenas agendamentos solicitados ou confirmados podem ser remarcados.",
        };
      }

      const novoServico = await prisma.servico.findFirst({
        where: {
          id: data.servicoId,
          ativo: true,
        },
        select: {
          id: true,
          nome: true,
          duracaoMinutos: true,
          precoCentavos: true,
        },
      });

      if (!novoServico) {
        return {
          sucesso: false,
          mensagem: "Serviço não encontrado ou inativo.",
        };
      }

      const novoFim = calcularFim(
        novoInicio,
        novoServico.duracaoMinutos,
      );

      const horarioNaGrade = validarHorarioNaGrade({
        inicio: novoInicio,
        duracaoMinutos: novoServico.duracaoMinutos,
      });

      if (!horarioNaGrade.valido) {
        return {
          sucesso: false,
          mensagem:
            horarioNaGrade.mensagem ||
            "Escolha um horário válido na agenda da barbearia.",
        };
      }

      const horarioBloqueado = await existeBloqueioAgenda({
        profissionalId: agendamento.profissionalId,
        inicio: novoInicio,
        fim: novoFim,
      });

      if (horarioBloqueado) {
        return {
          sucesso: false,
          mensagem:
            "Esse horário está bloqueado na agenda da barbearia.",
        };
      }

      const conflito = await existeConflitoDeHorario({
        profissionalId: agendamento.profissionalId,
        inicio: novoInicio,
        fim: novoFim,
        ignorarAgendamentoId: agendamento.id,
      });

      if (conflito) {
        return {
          sucesso: false,
          mensagem:
            "Já existe outro agendamento ocupando esse horário.",
        };
      }

      const inicioAnterior = agendamento.inicio;

      const agendamentoAtualizado =
        await prisma.agendamento.update({
          where: {
            id: agendamento.id,
          },

          data: {
            servicoId: novoServico.id,
            inicio: novoInicio,
            fim: novoFim,
            reminderSentAt: null,
          },

          select: {
            id: true,
            inicio: true,
            fim: true,
            status: true,

            cliente: {
              select: {
                id: true,
                nome: true,
                email: true,
                telefone: true,
              },
            },

            profissional: {
              select: {
                id: true,
                nome: true,
              },
            },

            servico: {
              select: {
                id: true,
                nome: true,
                duracaoMinutos: true,
                precoCentavos: true,
              },
            },
          },
        });

      await criarNotificacaoNovoAgendamento({
        clienteNome: agendamento.cliente.nome,
        servicoNome: agendamentoAtualizado.servico.nome,
        inicio: agendamentoAtualizado.inicio,
        acao: "agendou",
      });

      dispararEmailSemBloquear(
        "AGENDAMENTO_REAGENDADO_BARBEARIA",
        () =>
          enviarNotificacaoAgendamento({
            tipo: "AGENDAMENTO_REAGENDADO",
            agendamentoId: agendamento.id,

            cliente: {
              nome: agendamento.cliente.nome,
              telefone: agendamento.cliente.telefone,
              email: agendamento.cliente.email,
            },

            servico: {
              nome: agendamentoAtualizado.servico.nome,
            },

            profissional: {
              nome: agendamentoAtualizado.profissional.nome,
            },

            inicio: agendamentoAtualizado.inicio,
            inicioAnterior,
          }),
      );

      dispararEmailSemBloquear(
        "AGENDAMENTO_REAGENDADO_CLIENTE",
        () =>
          enviarEmailReagendamentoCliente({
            agendamentoId: agendamento.id,

            cliente: {
              nome: agendamento.cliente.nome,
              email: agendamento.cliente.email,
            },

            servico: {
              nome: agendamentoAtualizado.servico.nome,
            },

            profissional: {
              nome: agendamentoAtualizado.profissional.nome,
            },

            inicio: agendamentoAtualizado.inicio,
            inicioAnterior,
          }),
      );

      return {
        sucesso: true,
        mensagem: "Agendamento atualizado com sucesso.",
        agendamento: agendamentoAtualizado,
      };
    });
    
export const adminListarAgenda = createServerFn({
  method: "GET",
}).handler(async () => {
  await exigirDono();

  return prisma.agendamento.findMany({
    orderBy: {
      inicio: "desc",
    },
    select: {
      id: true,
      inicio: true,
      fim: true,
      status: true,
      observacaoCliente: true,
      motivoRecusa: true,
      criadoEm: true,
      atualizadoEm: true,
      formaPagamento: true,
      valorPagoCentavos: true,
      pagoEm: true,
      observacaoPagamento: true,
      motivoCancelamento: true,
      canceladoEm: true,

      cliente: {
        select: {
          id: true,
          nome: true,
          email: true,
          telefone: true,
        },
      },

      profissional: {
        select: {
          id: true,
          nome: true,
        },
      },

      servico: {
        select: {
          id: true,
          nome: true,
          duracaoMinutos: true,
          precoCentavos: true,
        },
      },
    },
  });
});

export const listarIndisponibilidadesAgenda =
  createServerFn({
    method: "GET",
  })
    .validator(listarIndisponibilidadesAgendaSchema)
    .handler(async ({ data }) => {
      await exigirUsuarioLogado();

      const inicioDia = converterData(`${data.data}T00:00:00`);
      const fimDia = converterData(`${data.data}T23:59:59`);

      if (!inicioDia || !fimDia) {
        return {
          sucesso: false,
          mensagem: "Data inválida.",
          intervalos: [],
        };
      }

      const [agendamentos, bloqueios] = await Promise.all([
        prisma.agendamento.findMany({
          where: {
            profissionalId: data.profissionalId,
            status: {
              in: ["SOLICITADO", "CONFIRMADO"],
            },
            inicio: {
              lt: fimDia,
            },
            fim: {
              gt: inicioDia,
            },
          },
          select: {
            id: true,
            inicio: true,
            fim: true,
            status: true,
          },
        }),

        prisma.bloqueioAgenda.findMany({
          where: {
            ativo: true,
            inicio: {
              lt: fimDia,
            },
            fim: {
              gt: inicioDia,
            },
            OR: [
              {
                profissionalId: null,
              },
              {
                profissionalId: data.profissionalId,
              },
            ],
          },
          select: {
            id: true,
            inicio: true,
            fim: true,
            motivo: true,
            profissionalId: true,
          },
        }),
      ]);

      const intervalos = [
        ...agendamentos.map((agendamento) => ({
          id: agendamento.id,
          tipo: "AGENDAMENTO" as const,
          inicio: agendamento.inicio,
          fim: agendamento.fim,
          motivo: agendamento.status,
        })),

        ...bloqueios.map((bloqueio) => ({
          id: bloqueio.id,
          tipo: "BLOQUEIO" as const,
          inicio: bloqueio.inicio,
          fim: bloqueio.fim,
          motivo:
            bloqueio.motivo ||
            "Horário bloqueado pela barbearia.",
        })),
      ];

      return {
        sucesso: true,
        mensagem: "Indisponibilidades carregadas.",
        intervalos,
      };
    });

export const adminListarPagamentosAssinatura = createServerFn({
  method: "GET",
}).handler(async () => {
  await exigirDono();

  return prisma.pagamentoAssinatura.findMany({
    orderBy: {
      pagoEm: "desc",
    },
    select: {
      id: true,
      formaPagamento: true,
      valorCentavos: true,
      pagoEm: true,
      observacao: true,

      assinatura: {
        select: {
          id: true,
          status: true,

          cliente: {
            select: {
              id: true,
              nome: true,
              email: true,
              telefone: true,
            },
          },

          plano: {
            select: {
              id: true,
              nome: true,
              precoCentavos: true,
            },
          },
        },
      },
    },
  });
});
