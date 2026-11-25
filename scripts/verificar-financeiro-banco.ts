/*
 * Verificação de integração do filtro de período do Financeiro.
 *
 * SOMENTE LEITURA: abre uma transação READ ONLY (o PostgreSQL rejeita
 * qualquer escrita) e termina com ROLLBACK.
 *
 * Compara, com os dados reais do banco apontado por DATABASE_URL:
 *   - o filtro usado pelo endpoint (limites UTC de financeiro-periodo);
 *   - uma referência independente (data de calendário em São Paulo via Intl);
 * e confere que a soma dos agrupamentos (dia/semana/mês) é igual ao total.
 *
 * Executar na raiz do projeto (Node 22.18+ ou 23.6+):
 *   node scripts/verificar-financeiro-banco.ts
 */
import assert from "node:assert/strict";

import "dotenv/config";
import pg from "pg";

import {
  calcularPeriodoRapido,
  chaveAgrupamento,
  contarDiasInclusivos,
  criarAgrupamentos,
  dataSaoPaulo,
  definirGranularidade,
  hojeSaoPaulo,
  type IntervaloDatasFinanceiro,
  obterLimitesConsultaUtc,
  somarDias,
} from "../src/lib/financeiro-periodo.ts";

type Agendamento = {
  id: string;
  inicio: Date;
  status: string;
  valorPagoCentavos: number | null;
  precoCentavos: number;
};

type Pagamento = {
  id: string;
  pagoEm: Date;
  valorCentavos: number;
};

// TIMESTAMP(3) sem fuso: o Prisma grava em UTC. Interpretar explicitamente como UTC.
pg.types.setTypeParser(1114, (valor: string) => new Date(`${valor.replace(" ", "T")}Z`));

const paraParametro = (data: Date) => data.toISOString().replace("Z", "");

const valorRealizado = (agendamento: Agendamento) =>
  agendamento.valorPagoCentavos ?? agendamento.precoCentavos;

const STATUS_PREVISTOS = ["SOLICITADO", "CONFIRMADO"];
const STATUS_PERDIDOS = ["RECUSADO", "CANCELADO_CLIENTE", "CANCELADO_FUNCIONARIO", "FALTOU"];

const SELECT_AGENDAMENTOS = `
  SELECT a.id, a.inicio, a.status::text AS status, a."valorPagoCentavos", s."precoCentavos"
  FROM "Agendamento" a JOIN "Servico" s ON s.id = a."servicoId"`;

function calcularTotais(agendamentos: Agendamento[], pagamentos: Pagamento[]) {
  const concluidos = agendamentos.filter((agendamento) => agendamento.status === "CONCLUIDO");

  return {
    total: agendamentos.length,
    concluidos: concluidos.length,
    realizadoAtendimentos: concluidos.reduce((t, a) => t + valorRealizado(a), 0),
    realizadoAssinaturas: pagamentos.reduce((t, p) => t + p.valorCentavos, 0),
    previsto: agendamentos
      .filter((a) => STATUS_PREVISTOS.includes(a.status))
      .reduce((t, a) => t + a.precoCentavos, 0),
    perdido: agendamentos
      .filter((a) => STATUS_PERDIDOS.includes(a.status))
      .reduce((t, a) => t + a.precoCentavos, 0),
  };
}

async function main() {
  if (!process.env.DATABASE_URL) {
    throw new Error("DATABASE_URL não definida.");
  }

  const cliente = new pg.Client({ connectionString: process.env.DATABASE_URL });

  await cliente.connect();
  await cliente.query("BEGIN TRANSACTION READ ONLY");

  let casos = 0;

  try {
    const todosAgendamentos: Agendamento[] = (await cliente.query(SELECT_AGENDAMENTOS)).rows;
    const todosPagamentos: Pagamento[] = (
      await cliente.query(`SELECT id, "pagoEm", "valorCentavos" FROM "PagamentoAssinatura"`)
    ).rows;

    console.log(
      `Base: ${todosAgendamentos.length} agendamentos, ${todosPagamentos.length} pagamentos de assinatura`,
    );

    async function verificar(nome: string, intervalo: IntervaloDatasFinanceiro) {
      const { inicio, fimExclusivo } = obterLimitesConsultaUtc(intervalo);
      const parametros = [paraParametro(inicio), paraParametro(fimExclusivo)];

      const agendamentos: Agendamento[] = (
        await cliente.query(
          `${SELECT_AGENDAMENTOS} WHERE a.inicio >= $1::timestamp AND a.inicio < $2::timestamp`,
          parametros,
        )
      ).rows;
      const pagamentos: Pagamento[] = (
        await cliente.query(
          `SELECT id, "pagoEm", "valorCentavos" FROM "PagamentoAssinatura"
           WHERE "pagoEm" >= $1::timestamp AND "pagoEm" < $2::timestamp`,
          parametros,
        )
      ).rows;

      const dentro = (data: Date) => {
        const dia = dataSaoPaulo(data);

        return dia >= intervalo.dataInicial && dia <= intervalo.dataFinal;
      };
      const referenciaAgendamentos = todosAgendamentos.filter((a) => dentro(a.inicio));
      const referenciaPagamentos = todosPagamentos.filter((p) => dentro(p.pagoEm));

      assert.deepEqual(
        new Set(agendamentos.map((a) => a.id)),
        new Set(referenciaAgendamentos.map((a) => a.id)),
        `${nome}: agendamentos divergentes`,
      );
      assert.deepEqual(
        new Set(pagamentos.map((p) => p.id)),
        new Set(referenciaPagamentos.map((p) => p.id)),
        `${nome}: pagamentos divergentes`,
      );

      const totais = calcularTotais(agendamentos, pagamentos);

      assert.deepEqual(
        totais,
        calcularTotais(referenciaAgendamentos, referenciaPagamentos),
        `${nome}: totais`,
      );

      const granularidade = definirGranularidade(
        contarDiasInclusivos(intervalo.dataInicial, intervalo.dataFinal),
      );
      const grupos = new Map(
        criarAgrupamentos(intervalo, granularidade).map((grupo) => [grupo.chave, 0]),
      );
      const somar = (data: Date, valor: number) => {
        const chave = chaveAgrupamento(dataSaoPaulo(data), granularidade, intervalo.dataInicial);

        assert.ok(grupos.has(chave), `${nome}: agrupamento ausente ${chave}`);
        grupos.set(chave, (grupos.get(chave) ?? 0) + valor);
      };

      agendamentos
        .filter((a) => a.status === "CONCLUIDO")
        .forEach((a) => somar(a.inicio, valorRealizado(a)));
      pagamentos.forEach((p) => somar(p.pagoEm, p.valorCentavos));

      const somaGrupos = [...grupos.values()].reduce((a, b) => a + b, 0);

      assert.equal(
        somaGrupos,
        totais.realizadoAtendimentos + totais.realizadoAssinaturas,
        `${nome}: soma dos agrupamentos`,
      );

      casos++;
      console.log(
        `OK  ${nome.padEnd(32)} ${intervalo.dataInicial}..${intervalo.dataFinal} ${granularidade.padEnd(6)} agendamentos=${agendamentos.length} assinaturas=${pagamentos.length}`,
      );
    }

    const hoje = hojeSaoPaulo();

    for (const tipo of ["hoje", "semanaAtual", "ultimos7", "mesAtual", "mesAnterior"] as const) {
      await verificar(`rápido: ${tipo}`, calcularPeriodoRapido(tipo, hoje));
    }

    const datas = [
      ...todosAgendamentos.map((a) => a.inicio),
      ...todosPagamentos.map((p) => p.pagoEm),
    ]
      .map((data) => dataSaoPaulo(data))
      .sort();

    if (datas.length > 0) {
      const ultima = datas[datas.length - 1];

      for (const mes of new Set(datas.map((data) => data.slice(0, 7)))) {
        await verificar(`mês ${mes}`, calcularPeriodoRapido("mesAtual", `${mes}-15`));
      }

      for (const dia of [...new Set(datas)].slice(-40)) {
        await verificar(`dia ${dia}`, { dataInicial: dia, dataFinal: dia });
      }

      await verificar("366 dias", { dataInicial: somarDias(ultima, -365), dataFinal: ultima });
      await verificar("cruzando meses", {
        dataInicial: somarDias(ultima, -50),
        dataFinal: somarDias(ultima, 10),
      });
    }

    await verificar("futuro (90 dias)", { dataInicial: hoje, dataFinal: somarDias(hoje, 89) });
    await verificar("sem movimento (jan/2019)", {
      dataInicial: "2019-01-01",
      dataFinal: "2019-01-31",
    });

    console.log(`\n${casos} verificações aprovadas.`);
  } finally {
    await cliente.query("ROLLBACK");
    await cliente.end();
  }
}

main().catch((error: unknown) => {
  console.error("FALHA:", error instanceof Error ? error.message : error);
  process.exitCode = 1;
});
