import "dotenv/config";
import nodemailer, { type Transporter } from "nodemailer";

// Notifica a barbearia por e-mail sempre que um CLIENTE cria ou cancela um
// agendamento. Falha no envio nunca deve derrubar o fluxo de agendamento —
// por isso essa função nunca lança exceção, apenas registra o erro no log.

const EMAIL_NOTIFICACAO_PADRAO = "studiordbarber00@gmail.com";
const FUSO_HORARIO_BARBEARIA = "America/Sao_Paulo";
const LOG_PREFIX = "[AppointmentNotification]";

type TipoNotificacaoAgendamento = "NOVO_AGENDAMENTO" | "AGENDAMENTO_CANCELADO";

interface DadosNotificacaoAgendamento {
  tipo: TipoNotificacaoAgendamento;
  agendamentoId: string;
  cliente: {
    nome: string;
    telefone: string | null;
    email: string;
  };
  servico: {
    nome: string;
  };
  profissional: {
    nome: string;
  };
  inicio: Date;
  motivoCancelamento?: string | null;
}

let transportadorCache: Transporter | null | undefined;

function variaveisSmtpAusentes(): string[] {
  const ausentes: string[] = [];

  if (!process.env.SMTP_HOST) ausentes.push("SMTP_HOST");
  if (!process.env.SMTP_PORT) ausentes.push("SMTP_PORT");
  if (!process.env.SMTP_USER) ausentes.push("SMTP_USER");
  if (!process.env.SMTP_PASSWORD) ausentes.push("SMTP_PASSWORD");

  return ausentes;
}

function obterTransportador(): Transporter | null {
  if (transportadorCache !== undefined) {
    return transportadorCache;
  }

  const ausentes = variaveisSmtpAusentes();

  if (ausentes.length > 0) {
    console.warn(
      `${LOG_PREFIX} SMTP não configurado — notificações desativadas. Variáveis ausentes: ${ausentes.join(", ")}.`,
    );

    transportadorCache = null;
    return transportadorCache;
  }

  const host = process.env.SMTP_HOST as string;
  const port = process.env.SMTP_PORT as string;
  const usuario = process.env.SMTP_USER as string;
  const senha = process.env.SMTP_PASSWORD as string;

  transportadorCache = nodemailer.createTransport({
    host,
    port: Number(port),
    secure: Number(port) === 465,
    auth: {
      user: usuario,
      pass: senha,
    },
  });

  // Diagnóstico único de conexão/autenticação SMTP, feito só na primeira
  // vez que o transportador é criado — não a cada envio.
  transportadorCache
    .verify()
    .then(() => {
      console.log(
        `${LOG_PREFIX} Conexão SMTP verificada com sucesso (host, porta e autenticação OK).`,
      );
    })
    .catch((error) => {
      console.error(
        `${LOG_PREFIX} Falha ao verificar conexão SMTP: ${
          error instanceof Error ? error.message : String(error)
        }`,
      );
    });

  return transportadorCache;
}

function formatarDataHora(data: Date): {
  data: string;
  horario: string;
} {
  return {
    data: new Intl.DateTimeFormat("pt-BR", {
      timeZone: FUSO_HORARIO_BARBEARIA,
      dateStyle: "short",
    }).format(data),

    horario: new Intl.DateTimeFormat("pt-BR", {
      timeZone: FUSO_HORARIO_BARBEARIA,
      timeStyle: "short",
    }).format(data),
  };
}

function montarConteudo(dados: DadosNotificacaoAgendamento): { assunto: string; texto: string } {
  const agora = formatarDataHora(new Date());
  const horarioAgendamento = formatarDataHora(dados.inicio);

  const linhasCliente = [
    `Cliente: ${dados.cliente.nome}`,
    `Telefone: ${dados.cliente.telefone ?? "Não informado"}`,
    `E-mail: ${dados.cliente.email}`,
  ];

  const linhasServico = [
    `Serviço: ${dados.servico.nome}`,
    `Profissional: ${dados.profissional.nome}`,
  ];

  if (dados.tipo === "NOVO_AGENDAMENTO") {
    return {
      assunto: "[Studio RD] Novo agendamento",
      texto: [
        "Novo agendamento realizado.",
        "",
        ...linhasCliente,
        "",
        ...linhasServico,
        "",
        `Data: ${horarioAgendamento.data}`,
        `Horário: ${horarioAgendamento.horario}`,
        "",
        `Agendamento realizado em: ${agora.data} às ${agora.horario}.`,
        `Referência: ${dados.agendamentoId}`,
      ].join("\n"),
    };
  }

  return {
    assunto: "[Studio RD] Agendamento cancelado",
    texto: [
      "Um cliente cancelou um agendamento.",
      "",
      ...linhasCliente,
      "",
      ...linhasServico,
      "",
      `Data que estava agendada: ${horarioAgendamento.data}`,
      `Horário que estava agendado: ${horarioAgendamento.horario}`,
      ...(dados.motivoCancelamento
        ? [`Motivo informado pelo cliente: ${dados.motivoCancelamento}`]
        : []),
      "",
      `Cancelamento realizado em: ${agora.data} às ${agora.horario}.`,
      `Referência: ${dados.agendamentoId}`,
    ].join("\n"),
  };
}

export async function enviarNotificacaoAgendamento(
  dados: DadosNotificacaoAgendamento,
): Promise<void> {
  const transportador = obterTransportador();

  if (!transportador) {
    console.warn(
      `${LOG_PREFIX} Envio ignorado (SMTP não configurado). event: ${dados.tipo}, appointmentId: ${dados.agendamentoId}`,
    );

    return;
  }

  const destinatario = process.env.NOTIFICATION_EMAIL?.trim() || EMAIL_NOTIFICACAO_PADRAO;

  const { assunto, texto } = montarConteudo(dados);

  console.log(
    `${LOG_PREFIX} Attempting ${dados.tipo} (appointmentId: ${dados.agendamentoId}, to: ${destinatario})`,
  );

  try {
    await transportador.sendMail({
      from: process.env.SMTP_USER,
      to: destinatario,
      subject: assunto,
      text: texto,
    });

    console.log(`${LOG_PREFIX} Sent successfully (appointmentId: ${dados.agendamentoId})`);
  } catch (error) {
    console.error(
      `${LOG_PREFIX} Failed: ${
        error instanceof Error ? error.message : String(error)
      } (event: ${dados.tipo}, appointmentId: ${dados.agendamentoId})`,
    );
  }
}
