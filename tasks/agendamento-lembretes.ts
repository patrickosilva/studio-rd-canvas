import { defineTask } from "nitro/task";

import { enviarEmailLembreteAgendamento } from "../src/lib/notificacao-agendamento.server";
import { prisma } from "../src/lib/prisma.server";

// Lembrete automático ~24h antes do horário, enviado apenas para
// agendamentos CONFIRMADO e apenas uma vez (guardado por reminderSentAt).
//
// A tarefa roda periodicamente (ver `scheduledTasks` em vite.config.ts) e
// busca uma janela ao redor de "agora + 24h" em vez de um instante exato,
// para tolerar o intervalo entre execuções sem perder ou duplicar lembretes.
const JANELA_MINIMA_HORAS = 23;
const JANELA_MAXIMA_HORAS = 25;
const LOG_PREFIX = "[LembreteAgendamento]";

export default defineTask({
  meta: {
    name: "agendamento:lembretes",
    description:
      "Envia lembrete por e-mail para agendamentos confirmados ~24h antes do horário marcado.",
  },
  async run() {
    const agora = new Date();
    const inicioJanela = new Date(agora.getTime() + JANELA_MINIMA_HORAS * 60 * 60 * 1000);
    const fimJanela = new Date(agora.getTime() + JANELA_MAXIMA_HORAS * 60 * 60 * 1000);

    const agendamentos = await prisma.agendamento.findMany({
      where: {
        status: "CONFIRMADO",
        reminderSentAt: null,
        inicio: {
          gte: inicioJanela,
          lte: fimJanela,
        },
      },
      select: {
        id: true,
        inicio: true,
        cliente: {
          select: {
            nome: true,
            email: true,
          },
        },
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

    let enviados = 0;
    let falhas = 0;

    for (const agendamento of agendamentos) {
      const sucesso = await enviarEmailLembreteAgendamento({
        agendamentoId: agendamento.id,
        cliente: agendamento.cliente,
        servico: agendamento.servico,
        profissional: agendamento.profissional,
        inicio: agendamento.inicio,
      });

      if (sucesso) {
        enviados += 1;

        await prisma.agendamento.update({
          where: { id: agendamento.id },
          data: { reminderSentAt: new Date() },
        });
      } else {
        falhas += 1;

        console.error(
          `${LOG_PREFIX} Falha ao enviar lembrete (appointmentId: ${agendamento.id}) — será tentado novamente na próxima execução.`,
        );
      }
    }

    console.log(
      `${LOG_PREFIX} Execução concluída. candidatos: ${agendamentos.length}, enviados: ${enviados}, falhas: ${falhas}.`,
    );

    return {
      result: {
        candidatos: agendamentos.length,
        enviados,
        falhas,
      },
    };
  },
});
