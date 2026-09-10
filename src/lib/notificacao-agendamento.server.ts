import "dotenv/config";

// Serviço central de e-mail transacional da barbearia. Cobre duas direções:
//
// 1) Notificações administrativas -> sempre para o e-mail da barbearia
//    (novo agendamento, cancelamento pelo cliente, reagendamento).
// 2) Notificações para o cliente -> para o e-mail que ele cadastrou
//    (confirmação, recusa, reagendamento e lembrete de agendamento).
//
// Falha no envio nunca deve derrubar o fluxo de agendamento: a operação no
// banco já aconteceu antes de qualquer chamada deste módulo. Por isso nenhuma
// função aqui lança exceção — elas apenas registram o erro no log e retornam
// `false` para quem precisar saber se o envio realmente aconteceu.

const EMAIL_NOTIFICACAO_PADRAO = "studiordbarber00@gmail.com";
const FUSO_HORARIO_BARBEARIA = "America/Sao_Paulo";
const LOG_PREFIX = "[EmailNotificacao]";
const RESEND_API_URL = "https://api.resend.com/emails";

type DestinatarioEmail = string | string[];

function variaveisEmailApiAusentes(): string[] {
  const ausentes: string[] = [];

  if (!process.env.RESEND_API_KEY?.trim()) {
    ausentes.push("RESEND_API_KEY");
  }

  if (!remetentePadrao()) {
    ausentes.push("RESEND_FROM_EMAIL ou EMAIL_FROM");
  }

  return ausentes;
}

function remetentePadrao(): string {
  return (
    process.env.RESEND_FROM_EMAIL?.trim() ||
    process.env.EMAIL_FROM?.trim() ||
    `Studio RD Black <${EMAIL_NOTIFICACAO_PADRAO}>`
  );
}

async function enviarEmail({
  to,
  subject,
  text,
  contexto,
}: {
  to: DestinatarioEmail;
  subject: string;
  text: string;
  contexto: string;
}): Promise<boolean> {
  const ausentes = variaveisEmailApiAusentes();

  if (ausentes.length > 0) {
    console.warn(
      `${LOG_PREFIX} API de e-mail não configurada — envio ignorado. Variáveis ausentes: ${ausentes.join(", ")}. contexto: ${contexto}`,
    );

    return false;
  }

  const destinatarios = Array.isArray(to) ? to : [to];

  console.log(`${LOG_PREFIX} Enviando e-mail via Resend API.`, {
    contexto,
    to: destinatarios.join(", "),
    fromConfigurado: Boolean(remetentePadrao()),
    apiKeyConfigurada: Boolean(process.env.RESEND_API_KEY?.trim()),
  });

  try {
    const resposta = await fetch(RESEND_API_URL, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.RESEND_API_KEY?.trim()}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: remetentePadrao(),
        to: destinatarios,
        subject,
        text,
      }),
    });

    if (!resposta.ok) {
      const detalhe = await resposta.text().catch(() => "");

      console.error(
        `${LOG_PREFIX} Falha ao enviar e-mail via Resend API. contexto: ${contexto}, status: ${resposta.status}, detalhe: ${detalhe}`,
      );

      return false;
    }

    console.log(`${LOG_PREFIX} E-mail enviado com sucesso via Resend API. contexto: ${contexto}`);
    return true;
  } catch (error) {
    console.error(
      `${LOG_PREFIX} Erro ao chamar Resend API. contexto: ${contexto}, erro: ${
        error instanceof Error ? error.message : String(error)
      }`,
    );

    return false;
  }
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

function destinatariosBarbearia(): string[] {
  const emails = [
    process.env.NOTIFICATION_EMAIL,
    process.env.NOTIFICATION_EMAIL2,
    process.env.BARBERSHOP_NOTIFICATION_EMAIL,
  ]
    .map((email) => email?.trim())
    .filter((email): email is string => Boolean(email));

  const emailsUnicos = Array.from(new Set(emails));

  if (emailsUnicos.length > 0) {
    return emailsUnicos;
  }

  return [EMAIL_NOTIFICACAO_PADRAO];
}

// ---------------------------------------------------------------------------
// Notificações administrativas (destinatário: barbearia)
// ---------------------------------------------------------------------------

type TipoNotificacaoAgendamento =
  | "NOVO_AGENDAMENTO"
  | "AGENDAMENTO_CANCELADO"
  | "AGENDAMENTO_REAGENDADO";

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
  inicioAnterior?: Date;
  motivoCancelamento?: string | null;
}

function montarConteudoAdministrativo(dados: DadosNotificacaoAgendamento): {
  assunto: string;
  texto: string;
} {
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
      assunto: `Novo agendamento — ${dados.cliente.nome} — ${horarioAgendamento.data} às ${horarioAgendamento.horario}`,
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

  if (dados.tipo === "AGENDAMENTO_REAGENDADO") {
    const horarioAnterior = dados.inicioAnterior ? formatarDataHora(dados.inicioAnterior) : null;

    return {
      assunto: `Agendamento reagendado — ${dados.cliente.nome}`,
      texto: [
        "Um agendamento teve a data/horário alterados.",
        "",
        ...linhasCliente,
        "",
        ...linhasServico,
        "",
        "HORÁRIO ANTERIOR:",
        horarioAnterior ? `Data: ${horarioAnterior.data}` : "Data: não disponível",
        horarioAnterior ? `Horário: ${horarioAnterior.horario}` : "Horário: não disponível",
        "",
        "NOVO HORÁRIO:",
        `Data: ${horarioAgendamento.data}`,
        `Horário: ${horarioAgendamento.horario}`,
        "",
        `Alteração realizada em: ${agora.data} às ${agora.horario}.`,
        `Referência: ${dados.agendamentoId}`,
      ].join("\n"),
    };
  }

  return {
    assunto: `Agendamento cancelado — ${dados.cliente.nome} — ${horarioAgendamento.data}`,
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
): Promise<boolean> {
  const { assunto, texto } = montarConteudoAdministrativo(dados);

 return enviarEmail({
  to: destinatariosBarbearia(),
  subject: assunto,
  text: texto,
  contexto: `${dados.tipo} (appointmentId: ${dados.agendamentoId})`,
});
}

// ---------------------------------------------------------------------------
// Notificações para o cliente (destinatário: e-mail cadastrado pelo cliente)
// ---------------------------------------------------------------------------

interface DadosEmailCliente {
  agendamentoId: string;
  cliente: {
    nome: string;
    email: string;
  };
  servico: {
    nome: string;
  };
  profissional: {
    nome: string;
  };
  inicio: Date;
}

export async function enviarEmailConfirmacaoAgendamento(
  dados: DadosEmailCliente,
): Promise<boolean> {
  const horario = formatarDataHora(dados.inicio);

  const texto = [
    `Olá, ${dados.cliente.nome}.`,
    "",
    "Seu horário foi confirmado!",
    "",
    `Serviço: ${dados.servico.nome}`,
    `Profissional: ${dados.profissional.nome}`,
    `Data: ${horario.data}`,
    `Horário: ${horario.horario}`,
    "Situação: CONFIRMADO",
    "",
    "Te esperamos no Studio RD Barber. Até lá!",
  ].join("\n");

  return enviarEmail({
    to: dados.cliente.email,
    subject: "Seu horário foi confirmado — Studio RD Barber",
    text: texto,
    contexto: `AGENDAMENTO_CONFIRMADO (appointmentId: ${dados.agendamentoId})`,
  });
}

export async function enviarEmailRecusaAgendamento(
  dados: DadosEmailCliente,
): Promise<boolean> {
  const horario = formatarDataHora(dados.inicio);

  const texto = [
    `Olá, ${dados.cliente.nome}.`,
    "",
    `Infelizmente não foi possível confirmar seu horário para ${horario.data} às ${horario.horario}.`,
    "Acesse novamente nosso sistema para escolher outro horário disponível.",
    "",
    `Serviço: ${dados.servico.nome}`,
    `Data: ${horario.data}`,
    `Horário: ${horario.horario}`,
    "Situação: NÃO CONFIRMADO",
    "",
    "Agradecemos a compreensão. Esperamos te atender em breve no Studio RD Barber.",
  ].join("\n");

  return enviarEmail({
    to: dados.cliente.email,
    subject: "Atualização sobre seu agendamento — Studio RD Barber",
    text: texto,
    contexto: `AGENDAMENTO_RECUSADO (appointmentId: ${dados.agendamentoId})`,
  });
}

export async function enviarEmailReagendamentoCliente(
  dados: DadosEmailCliente & { inicioAnterior: Date },
): Promise<boolean> {
  const horarioAnterior = formatarDataHora(dados.inicioAnterior);
  const horarioNovo = formatarDataHora(dados.inicio);

  const texto = [
    `Olá, ${dados.cliente.nome}.`,
    "",
    "Seu agendamento foi reagendado pela nossa equipe.",
    "",
    `Serviço: ${dados.servico.nome}`,
    `Profissional: ${dados.profissional.nome}`,
    "",
    "HORÁRIO ANTERIOR:",
    `Data: ${horarioAnterior.data}`,
    `Horário: ${horarioAnterior.horario}`,
    "",
    "NOVO HORÁRIO:",
    `Data: ${horarioNovo.data}`,
    `Horário: ${horarioNovo.horario}`,
    "",
    "Se o novo horário não for bom para você, entre em contato com a gente ou acesse o sistema para cancelar.",
  ].join("\n");

  return enviarEmail({
    to: dados.cliente.email,
    subject: "Seu agendamento foi reagendado — Studio RD Barber",
    text: texto,
    contexto: `AGENDAMENTO_REAGENDADO_CLIENTE (appointmentId: ${dados.agendamentoId})`,
  });
}

export async function enviarEmailCancelamentoEquipeCliente(
  dados: DadosEmailCliente & { motivoCancelamento?: string | null },
): Promise<boolean> {
  const horario = formatarDataHora(dados.inicio);

  const texto = [
    `Olá, ${dados.cliente.nome}.`,
    "",
    "Seu agendamento foi cancelado pela nossa equipe.",
    "",
    `Serviço: ${dados.servico.nome}`,
    `Profissional: ${dados.profissional.nome}`,
    `Data: ${horario.data}`,
    `Horário: ${horario.horario}`,
    "Situação: CANCELADO",
    "",
    ...(dados.motivoCancelamento
      ? [`Motivo informado: ${dados.motivoCancelamento}`, ""]
      : []),
    "Se desejar, acesse o sistema para escolher um novo horário disponível.",
    "",
    "Agradecemos a compreensão.",
    "Studio RD Barber",
  ].join("\n");

  return enviarEmail({
    to: dados.cliente.email,
    subject: "Seu agendamento foi cancelado — Studio RD Barber",
    text: texto,
    contexto: `AGENDAMENTO_CANCELADO_EQUIPE_CLIENTE (appointmentId: ${dados.agendamentoId})`,
  });
}


export async function enviarEmailLembreteAgendamento(
  dados: DadosEmailCliente,
): Promise<boolean> {
  const horario = formatarDataHora(dados.inicio);

  const texto = [
    `Olá, ${dados.cliente.nome}.`,
    "",
    `Este é um lembrete do seu horário amanhã, ${horario.data} às ${horario.horario}.`,
    "",
    `Serviço: ${dados.servico.nome}`,
    `Profissional: ${dados.profissional.nome}`,
    "",
    "Contamos com a sua presença. Até breve no Studio RD Barber!",
  ].join("\n");

  return enviarEmail({
    to: dados.cliente.email,
    subject: "Lembrete do seu agendamento — Studio RD Barber",
    text: texto,
    contexto: `AGENDAMENTO_LEMBRETE (appointmentId: ${dados.agendamentoId})`,
  });
}
