import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import type { FormaPagamento } from "../../generated/prisma/client";
import { enviarNotificacaoAgendamento } from "../notificacao-agendamento.server";
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

const TIMEZONE_PADRAO = "America/Sao_Paulo";
const INTERVALO_GRADE_MINUTOS = 40;

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

  const distanciaDaAbertura = minutosInicio - minutosAbertura;

  if (distanciaDaAbertura % INTERVALO_GRADE_MINUTOS !== 0) {
    return {
      valido: false,
      mensagem:
        "Escolha um horário dentro da grade oficial de 40 minutos.",
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

      await enviarNotificacaoAgendamento({
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
      });

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
          "Escolha um horário válido na grade da barbearia.",
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

    await enviarNotificacaoAgendamento({
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
    });

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
            "Escolha um horário válido na grade da barbearia.",
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
            status: "CANCELADO_FUNCIONARIO",
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

      return {
        sucesso: true,
        mensagem: "Solicitação recusada.",
        agendamento: agendamentoAtualizado,
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
          cliente: {
            select: {
              nome: true,
            },
          },
          servico: {
            select: {
              nome: true,
              duracaoMinutos: true,
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

      const novoFim = calcularFim(
        novoInicio,
        agendamento.servico.duracaoMinutos,
      );

      const horarioNaGrade = validarHorarioNaGrade({
        inicio: novoInicio,
        duracaoMinutos: agendamento.servico.duracaoMinutos,
      });

      if (!horarioNaGrade.valido) {
        return {
          sucesso: false,
          mensagem:
            horarioNaGrade.mensagem ||
            "Escolha um horário válido na grade da barbearia.",
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

      const agendamentoAtualizado =
        await prisma.agendamento.update({
          where: {
            id: agendamento.id,
          },
          data: {
            inicio: novoInicio,
            fim: novoFim,
          },
          select: {
            id: true,
            inicio: true,
            fim: true,
            status: true,
          },
        });

      await criarNotificacaoNovoAgendamento({
        clienteNome: agendamento.cliente.nome,
        servicoNome: agendamento.servico.nome,
        inicio: agendamentoAtualizado.inicio,
        acao: "agendou",
      });

      return {
        sucesso: true,
        mensagem: "Agendamento remarcado com sucesso.",
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
