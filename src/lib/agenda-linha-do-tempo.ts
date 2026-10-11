// Cálculos da linha do tempo da agenda do funcionário.
// Funções puras: posição vertical = minutos desde o início da escala,
// altura = duração real (fim - inicio), ambas multiplicadas pela mesma escala.

export const PIXELS_POR_MINUTO = 2;

const TIMEZONE_PADRAO = "America/Sao_Paulo";

export type IntervaloLinhaDoTempo = {
  id: string;
  inicioMinutos: number;
  fimMinutos: number;
};

export type PosicaoNaColuna = {
  coluna: number;
  totalColunas: number;
};

// Minutos desde 00:00 no fuso da barbearia, igual ao usado em formatarHora.
export function minutosNoDiaSaoPaulo(valor: string | Date): number {
  const partes = new Intl.DateTimeFormat("en-US", {
    timeZone: TIMEZONE_PADRAO,
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
  }).formatToParts(new Date(valor));

  const hora = Number(partes.find((p) => p.type === "hour")?.value ?? 0);
  const minuto = Number(
    partes.find((p) => p.type === "minute")?.value ?? 0,
  );

  return hora * 60 + minuto;
}

export function criarIntervalo(item: {
  id: string;
  inicio: string | Date;
  fim: string | Date;
}): IntervaloLinhaDoTempo {
  const inicioMinutos = minutosNoDiaSaoPaulo(item.inicio);
  const duracaoMinutos = Math.max(
    0,
    Math.round(
      (new Date(item.fim).getTime() - new Date(item.inicio).getTime()) /
        60000,
    ),
  );

  return {
    id: item.id,
    inicioMinutos,
    fimMinutos: inicioMinutos + duracaoMinutos,
  };
}

// Escala alinhada em horas cheias, cobrindo o funcionamento do dia e
// qualquer agendamento fora dele (para não ocultá-lo).
export function calcularJanelaDaEscala({
  aberturaMinutos,
  fechamentoMinutos,
  intervalos,
}: {
  aberturaMinutos: number | null;
  fechamentoMinutos: number | null;
  intervalos: IntervaloLinhaDoTempo[];
}): { inicioMinutos: number; fimMinutos: number } | null {
  const inicios = intervalos.map((i) => i.inicioMinutos);
  const fins = intervalos.map((i) => i.fimMinutos);

  if (aberturaMinutos !== null) inicios.push(aberturaMinutos);
  if (fechamentoMinutos !== null) fins.push(fechamentoMinutos);

  if (inicios.length === 0 || fins.length === 0) {
    return null;
  }

  const inicioMinutos = Math.floor(Math.min(...inicios) / 60) * 60;
  const fimMinutos = Math.ceil(Math.max(...fins) / 60) * 60;

  return {
    inicioMinutos,
    fimMinutos: Math.max(fimMinutos, inicioMinutos + 60),
  };
}

// Agendamentos simultâneos (ex.: profissionais diferentes) dividem a
// largura em colunas para que nenhum fique escondido.
export function distribuirEmColunas(
  intervalos: IntervaloLinhaDoTempo[],
): Map<string, PosicaoNaColuna> {
  const resultado = new Map<string, PosicaoNaColuna>();
  const ordenados = [...intervalos].sort(
    (a, b) =>
      a.inicioMinutos - b.inicioMinutos || b.fimMinutos - a.fimMinutos,
  );

  let grupo: IntervaloLinhaDoTempo[] = [];
  let colunasDoGrupo: number[] = [];
  let fimDoGrupo = -Infinity;

  function fecharGrupo() {
    const totalColunas = colunasDoGrupo.length;

    grupo.forEach((item) => {
      const posicao = resultado.get(item.id);
      if (posicao) posicao.totalColunas = totalColunas;
    });

    grupo = [];
    colunasDoGrupo = [];
    fimDoGrupo = -Infinity;
  }

  ordenados.forEach((item) => {
    if (item.inicioMinutos >= fimDoGrupo) {
      fecharGrupo();
    }

    let coluna = colunasDoGrupo.findIndex(
      (fimDaColuna) => fimDaColuna <= item.inicioMinutos,
    );

    if (coluna === -1) {
      coluna = colunasDoGrupo.length;
      colunasDoGrupo.push(item.fimMinutos);
    } else {
      colunasDoGrupo[coluna] = item.fimMinutos;
    }

    grupo.push(item);
    fimDoGrupo = Math.max(fimDoGrupo, item.fimMinutos);
    resultado.set(item.id, { coluna, totalColunas: 1 });
  });

  fecharGrupo();

  return resultado;
}
