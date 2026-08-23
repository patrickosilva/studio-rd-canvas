import "dotenv/config";
import nodemailer, { type Transporter } from "nodemailer";

// Notifica a barbearia por e-mail sempre que um CLIENTE cria ou cancela um
// agendamento. Falha no envio nunca deve derrubar o fluxo de agendamento —
// por isso essa função nunca lança exceção, apenas registra o erro no log.

const EMAIL_NOTIFICACAO_PADRAO = "studiordbarber00@gmail.com";
const FUSO_HORARIO_BARBEARIA = "America/Sao_Paulo";

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

function obterTransportador(): Transporter | null {
  if (transportadorCache !== undefined) {
    return transportadorCache;
  }

  const host = process.env.SMTP_HOST;
  const port = process.env.SMTP_PORT;
  const usuario = process.env.SMTP_USER;
  const senha = process.env.SMTP_PASSWORD;

  if (!host || !port || !usuario || !senha) {
    console.warn(
      "[notificacao-agendamento] Variáveis SMTP não configuradas — notificações por e-mail estão desativadas.",
    );

    transportadorCache = null;
    return transportadorCache;
  }

  transportadorCache = nodemailer.createTransport({
    host,
    port: Number(port),
    secure: Number(port) === 465,
    auth: {
      user: usuario,
      pass: senha,
    },
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
    return;
  }

  const destinatario = process.env.NOTIFICATION_EMAIL?.trim() || EMAIL_NOTIFICACAO_PADRAO;

  const { assunto, texto } = montarConteudo(dados);

  try {
    await transportador.sendMail({
      from: process.env.SMTP_USER,
      to: destinatario,
      subject: assunto,
      text: texto,
    });
  } catch (error) {
    console.error(
      "[notificacao-agendamento] Falha ao enviar e-mail de notificação:",
      error instanceof Error ? error.message : error,
    );
  }
}
