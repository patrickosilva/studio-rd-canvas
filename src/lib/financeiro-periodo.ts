/*
 * Utilitários de período do módulo Financeiro.
 *
 * Todas as datas de calendário são representadas como texto "YYYY-MM-DD"
 * e sempre interpretadas no fuso America/Sao_Paulo, independentemente do
 * fuso configurado no navegador ou no servidor.
 *
 * Este arquivo é puro (sem dependências de servidor ou de React) para ser
 * compartilhado entre o endpoint financeiro e a tela do Financeiro.
 */

export const TIMEZONE_FINANCEIRO = "America/Sao_Paulo";

/** Limite máximo de dias corridos por consulta (inclui as duas datas). */
export const LIMITE_DIAS_PERIODO_FINANCEIRO = 366;

/** Até este número de dias o resumo é exibido dia a dia. */
const LIMITE_DIAS_GRANULARIDADE_DIARIA = 62;

/** Até este número de dias o resumo é exibido por semana. */
const LIMITE_DIAS_GRANULARIDADE_SEMANAL = 186;

const MILISSEGUNDOS_POR_DIA = 24 * 60 * 60 * 1000;

const REGEX_DATA_ISO = /^(\d{4})-(\d{2})-(\d{2})$/;

export type TipoPeriodoFinanceiro =
  "hoje" | "semanaAtual" | "ultimos7" | "mesAtual" | "mesAnterior" | "personalizado";

export type GranularidadeFinanceira = "dia" | "semana" | "mes";

export type IntervaloDatasFinanceiro = {
  dataInicial: string;
  dataFinal: string;
};

export type AgrupamentoFinanceiro = {
  chave: string;
  dataInicial: string;
  dataFinal: string;
  rotulo: string;
  rotuloCurto: string;
};

export type ResultadoValidacaoPeriodo =
  { valido: true; dias: number } | { valido: false; mensagem: string };

// ---------------------------------------------------------------------------
// Datas de calendário (YYYY-MM-DD)
// ---------------------------------------------------------------------------

function separarDataIso(data: string): [number, number, number] | null {
  const match = REGEX_DATA_ISO.exec(data);

  if (!match) {
    return null;
  }

  return [Number(match[1]), Number(match[2]), Number(match[3])];
}

/** Verifica formato e existência real da data no calendário (ex.: rejeita 2026-02-30). */
export function dataIsoValida(data: string): boolean {
  const partes = separarDataIso(data);

  if (!partes) {
    return false;
  }

  const [ano, mes, dia] = partes;

  if (ano < 1900 || ano > 9999 || mes < 1 || mes > 12 || dia < 1) {
    return false;
  }

  const referencia = new Date(Date.UTC(ano, mes - 1, dia));

  return (
    referencia.getUTCFullYear() === ano &&
    referencia.getUTCMonth() === mes - 1 &&
    referencia.getUTCDate() === dia
  );
}

/** Converte "YYYY-MM-DD" em um Date à meia-noite UTC, usado apenas para aritmética de calendário. */
function dataIsoParaUtc(data: string): Date {
  const partes = separarDataIso(data);

  if (!partes) {
    throw new Error(`Data inválida: ${data}`);
  }

  const [ano, mes, dia] = partes;

  return new Date(Date.UTC(ano, mes - 1, dia));
}

function utcParaDataIso(data: Date): string {
  const ano = String(data.getUTCFullYear()).padStart(4, "0");
  const mes = String(data.getUTCMonth() + 1).padStart(2, "0");
  const dia = String(data.getUTCDate()).padStart(2, "0");

  return `${ano}-${mes}-${dia}`;
}

export function somarDias(data: string, quantidade: number): string {
  const referencia = dataIsoParaUtc(data);

  referencia.setUTCDate(referencia.getUTCDate() + quantidade);

  return utcParaDataIso(referencia);
}

/** Quantidade de dias corridos entre as duas datas, contando ambas. */
export function contarDiasInclusivos(dataInicial: string, dataFinal: string): number {
  const diferenca = dataIsoParaUtc(dataFinal).getTime() - dataIsoParaUtc(dataInicial).getTime();

  return Math.round(diferenca / MILISSEGUNDOS_POR_DIA) + 1;
}

/** Segunda-feira da semana da data (mesmo padrão de semana usado anteriormente no Financeiro). */
function inicioDaSemana(data: string): string {
  const diaSemana = dataIsoParaUtc(data).getUTCDay();
  const diferenca = diaSemana === 0 ? -6 : 1 - diaSemana;

  return somarDias(data, diferenca);
}

function inicioDoMes(data: string): string {
  return `${data.slice(0, 7)}-01`;
}

function fimDoMes(data: string): string {
  const referencia = dataIsoParaUtc(inicioDoMes(data));

  referencia.setUTCMonth(referencia.getUTCMonth() + 1);
  referencia.setUTCDate(0);

  return utcParaDataIso(referencia);
}

function maiorData(a: string, b: string): string {
  return a > b ? a : b;
}

function menorData(a: string, b: string): string {
  return a < b ? a : b;
}

// ---------------------------------------------------------------------------
// Conversão entre instantes e o calendário de São Paulo
// ---------------------------------------------------------------------------

const formatadorPartesSaoPaulo = new Intl.DateTimeFormat("en-US", {
  timeZone: TIMEZONE_FINANCEIRO,
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
  hour: "2-digit",
  minute: "2-digit",
  second: "2-digit",
  hourCycle: "h23",
});

function obterPartesSaoPaulo(instante: Date) {
  const mapa: Record<string, string> = {};

  for (const parte of formatadorPartesSaoPaulo.formatToParts(instante)) {
    mapa[parte.type] = parte.value;
  }

  return {
    ano: Number(mapa.year),
    mes: Number(mapa.month),
    dia: Number(mapa.day),
    hora: Number(mapa.hour),
    minuto: Number(mapa.minute),
    segundo: Number(mapa.second),
  };
}

/** Diferença, em milissegundos, entre o horário de São Paulo e o UTC naquele instante. */
function deslocamentoSaoPaulo(instante: Date): number {
  const partes = obterPartesSaoPaulo(instante);
  const comoUtc = Date.UTC(
    partes.ano,
    partes.mes - 1,
    partes.dia,
    partes.hora,
    partes.minuto,
    partes.segundo,
  );

  return comoUtc - Math.floor(instante.getTime() / 1000) * 1000;
}

/** Data de calendário (YYYY-MM-DD) em São Paulo correspondente a um instante. */
export function dataSaoPaulo(valor: string | Date): string {
  const partes = obterPartesSaoPaulo(new Date(valor));

  return `${String(partes.ano).padStart(4, "0")}-${String(partes.mes).padStart(2, "0")}-${String(
    partes.dia,
  ).padStart(2, "0")}`;
}

/** Data de hoje no calendário de São Paulo. */
export function hojeSaoPaulo(agora: Date = new Date()): string {
  return dataSaoPaulo(agora);
}

/**
 * Instante UTC correspondente à meia-noite (00:00:00.000) de uma data em São Paulo.
 * O deslocamento é obtido do próprio fuso, sem compensação fixa.
 */
export function inicioDoDiaSaoPauloUtc(data: string): Date {
  const meiaNoiteUtc = dataIsoParaUtc(data).getTime();
  const primeiroDeslocamento = deslocamentoSaoPaulo(new Date(meiaNoiteUtc));
  let instante = meiaNoiteUtc - primeiroDeslocamento;

  // Segunda verificação para o caso de o deslocamento mudar entre os dois
  // instantes (horário de verão histórico).
  const segundoDeslocamento = deslocamentoSaoPaulo(new Date(instante));

  if (segundoDeslocamento !== primeiroDeslocamento) {
    instante = meiaNoiteUtc - segundoDeslocamento;
  }

  return new Date(instante);
}

/**
 * Limites da consulta ao banco: início inclusivo do primeiro dia e
 * fim exclusivo no início do dia seguinte à data final.
 */
export function obterLimitesConsultaUtc(intervalo: IntervaloDatasFinanceiro): {
  inicio: Date;
  fimExclusivo: Date;
} {
  return {
    inicio: inicioDoDiaSaoPauloUtc(intervalo.dataInicial),
    fimExclusivo: inicioDoDiaSaoPauloUtc(somarDias(intervalo.dataFinal, 1)),
  };
}

// ---------------------------------------------------------------------------
// Validação
// ---------------------------------------------------------------------------

export function validarPeriodoFinanceiro(
  dataInicial: string,
  dataFinal: string,
): ResultadoValidacaoPeriodo {
  if (!dataInicial || !dataFinal) {
    return {
      valido: false,
      mensagem: "Informe a data inicial e a data final.",
    };
  }

  if (!dataIsoValida(dataInicial)) {
    return {
      valido: false,
      mensagem: "A data inicial é inválida.",
    };
  }

  if (!dataIsoValida(dataFinal)) {
    return {
      valido: false,
      mensagem: "A data final é inválida.",
    };
  }

  if (dataFinal < dataInicial) {
    return {
      valido: false,
      mensagem: "A data final não pode ser anterior à data inicial.",
    };
  }

  const dias = contarDiasInclusivos(dataInicial, dataFinal);

  if (dias > LIMITE_DIAS_PERIODO_FINANCEIRO) {
    return {
      valido: false,
      mensagem: `O período pode ter no máximo ${LIMITE_DIAS_PERIODO_FINANCEIRO} dias. O intervalo selecionado tem ${dias} dias.`,
    };
  }

  return { valido: true, dias };
}

// ---------------------------------------------------------------------------
// Filtros rápidos
// ---------------------------------------------------------------------------

export function calcularPeriodoRapido(
  tipo: Exclude<TipoPeriodoFinanceiro, "personalizado">,
  hoje: string,
): IntervaloDatasFinanceiro {
  if (tipo === "hoje") {
    return { dataInicial: hoje, dataFinal: hoje };
  }

  if (tipo === "ultimos7") {
    return { dataInicial: somarDias(hoje, -6), dataFinal: hoje };
  }

  if (tipo === "mesAtual") {
    return { dataInicial: inicioDoMes(hoje), dataFinal: fimDoMes(hoje) };
  }

  if (tipo === "mesAnterior") {
    const ultimoDiaMesAnterior = somarDias(inicioDoMes(hoje), -1);

    return {
      dataInicial: inicioDoMes(ultimoDiaMesAnterior),
      dataFinal: ultimoDiaMesAnterior,
    };
  }

  const inicioSemana = inicioDaSemana(hoje);

  return { dataInicial: inicioSemana, dataFinal: somarDias(inicioSemana, 6) };
}

// ---------------------------------------------------------------------------
// Agrupamentos (dia, semana ou mês)
// ---------------------------------------------------------------------------

export function definirGranularidade(dias: number): GranularidadeFinanceira {
  if (dias <= LIMITE_DIAS_GRANULARIDADE_DIARIA) {
    return "dia";
  }

  if (dias <= LIMITE_DIAS_GRANULARIDADE_SEMANAL) {
    return "semana";
  }

  return "mes";
}

/**
 * Chave do agrupamento ao qual uma data pertence. O primeiro agrupamento
 * começa na data inicial do período, mesmo que ela caia no meio da semana
 * ou do mês.
 */
export function chaveAgrupamento(
  data: string,
  granularidade: GranularidadeFinanceira,
  dataInicialPeriodo: string,
): string {
  if (granularidade === "dia") {
    return data;
  }

  const inicio = granularidade === "semana" ? inicioDaSemana(data) : inicioDoMes(data);

  return maiorData(inicio, dataInicialPeriodo);
}

const formatadorDiaCurto = new Intl.DateTimeFormat("pt-BR", {
  timeZone: "UTC",
  day: "2-digit",
  month: "2-digit",
});

const formatadorDiaSemana = new Intl.DateTimeFormat("pt-BR", {
  timeZone: "UTC",
  weekday: "short",
  day: "2-digit",
  month: "2-digit",
});

const formatadorMesAno = new Intl.DateTimeFormat("pt-BR", {
  timeZone: "UTC",
  month: "short",
  year: "numeric",
});

const formatadorDataCompleta = new Intl.DateTimeFormat("pt-BR", {
  timeZone: "UTC",
  day: "2-digit",
  month: "2-digit",
  year: "numeric",
});

/** Formata "YYYY-MM-DD" como "dd/mm/aaaa" sem depender do fuso local. */
export function formatarDataIso(data: string): string {
  return formatadorDataCompleta.format(dataIsoParaUtc(data));
}

export function formatarIntervaloDatas(intervalo: IntervaloDatasFinanceiro): string {
  if (intervalo.dataInicial === intervalo.dataFinal) {
    return formatarDataIso(intervalo.dataInicial);
  }

  return `${formatarDataIso(intervalo.dataInicial)} até ${formatarDataIso(intervalo.dataFinal)}`;
}

function rotularAgrupamento(
  dataInicial: string,
  dataFinal: string,
  granularidade: GranularidadeFinanceira,
): { rotulo: string; rotuloCurto: string } {
  const inicio = dataIsoParaUtc(dataInicial);

  if (granularidade === "dia") {
    return {
      rotulo: formatadorDiaSemana.format(inicio),
      rotuloCurto: formatadorDiaCurto.format(inicio),
    };
  }

  const faixa = `${formatadorDiaCurto.format(inicio)} – ${formatadorDiaCurto.format(
    dataIsoParaUtc(dataFinal),
  )}`;

  if (granularidade === "semana") {
    return {
      rotulo: `Semana ${faixa}`,
      rotuloCurto: formatadorDiaCurto.format(inicio),
    };
  }

  const mesAno = formatadorMesAno.format(inicio);
  const mesCompleto =
    dataInicial === inicioDoMes(dataInicial) && dataFinal === fimDoMes(dataInicial);

  return {
    rotulo: mesCompleto ? mesAno : `${mesAno} (${faixa})`,
    rotuloCurto: mesAno,
  };
}

/** Lista completa e contígua de agrupamentos que cobre todo o período, sem limite de quantidade. */
export function criarAgrupamentos(
  intervalo: IntervaloDatasFinanceiro,
  granularidade: GranularidadeFinanceira,
): AgrupamentoFinanceiro[] {
  const agrupamentos: AgrupamentoFinanceiro[] = [];
  let cursor = intervalo.dataInicial;

  while (cursor <= intervalo.dataFinal) {
    let fimNatural: string;

    if (granularidade === "dia") {
      fimNatural = cursor;
    } else if (granularidade === "semana") {
      fimNatural = somarDias(inicioDaSemana(cursor), 6);
    } else {
      fimNatural = fimDoMes(cursor);
    }

    const fim = menorData(fimNatural, intervalo.dataFinal);

    agrupamentos.push({
      chave: cursor,
      dataInicial: cursor,
      dataFinal: fim,
      ...rotularAgrupamento(cursor, fim, granularidade),
    });

    cursor = somarDias(fim, 1);
  }

  return agrupamentos;
}

export function descreverGranularidade(granularidade: GranularidadeFinanceira): string {
  if (granularidade === "dia") {
    return "por dia";
  }

  if (granularidade === "semana") {
    return "por semana";
  }

  return "por mês";
}
