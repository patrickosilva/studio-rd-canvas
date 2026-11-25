/// <reference types="node" />
/*
 * Testes dos utilitários de período do Financeiro.
 *
 * Executar (Node 22.18+ ou 23.6+, sem dependências adicionais):
 *   node --test "src/lib/__tests__/*.test.ts"
 *
 * Os testes não dependem do fuso horário da máquina. Para conferir isso:
 *   TZ=UTC node --test "src/lib/__tests__/*.test.ts"
 */
import assert from "node:assert/strict";
import { describe, test } from "node:test";

import {
  calcularPeriodoRapido,
  chaveAgrupamento,
  contarDiasInclusivos,
  criarAgrupamentos,
  dataIsoValida,
  dataSaoPaulo,
  definirGranularidade,
  formatarDataIso,
  formatarIntervaloDatas,
  type GranularidadeFinanceira,
  type IntervaloDatasFinanceiro,
  obterLimitesConsultaUtc,
  somarDias,
  validarPeriodoFinanceiro,
} from "../financeiro-periodo.ts";

describe("dataIsoValida", () => {
  test("rejeita datas inexistentes e formatos inválidos", () => {
    for (const data of ["2026-02-29", "2026-02-30", "2026-13-01", "2026-04-31", "2026-4-01", ""]) {
      assert.equal(dataIsoValida(data), false, data);
    }
  });

  test("aceita 29/02 em anos bissextos", () => {
    assert.equal(dataIsoValida("2024-02-29"), true);
    assert.equal(dataIsoValida("2028-02-29"), true);
  });
});

describe("obterLimitesConsultaUtc (America/Sao_Paulo)", () => {
  test("um único dia: 00:00 BRT inclusivo até 00:00 BRT do dia seguinte exclusivo", () => {
    const limites = obterLimitesConsultaUtc({ dataInicial: "2026-03-10", dataFinal: "2026-03-10" });

    assert.equal(limites.inicio.toISOString(), "2026-03-10T03:00:00.000Z");
    assert.equal(limites.fimExclusivo.toISOString(), "2026-03-11T03:00:00.000Z");
  });

  test("virada de ano e fevereiro bissexto", () => {
    const limites = obterLimitesConsultaUtc({ dataInicial: "2027-12-31", dataFinal: "2028-02-29" });

    assert.equal(limites.inicio.toISOString(), "2027-12-31T03:00:00.000Z");
    assert.equal(limites.fimExclusivo.toISOString(), "2028-03-01T03:00:00.000Z");
  });

  test("usa o deslocamento real do fuso (horário de verão histórico, -02:00)", () => {
    const limites = obterLimitesConsultaUtc({ dataInicial: "2018-12-01", dataFinal: "2018-12-01" });

    assert.equal(limites.inicio.toISOString(), "2018-12-01T02:00:00.000Z");
  });

  test("inclui 00:00 do primeiro dia e 23:59 do último; exclui as bordas externas", () => {
    const limites = obterLimitesConsultaUtc({ dataInicial: "2026-03-10", dataFinal: "2026-03-25" });
    const dentro = (iso: string) => {
      const data = new Date(iso);

      return data >= limites.inicio && data < limites.fimExclusivo;
    };

    assert.equal(dentro("2026-03-10T03:00:00.000Z"), true, "10/03 00:00 BRT");
    assert.equal(dentro("2026-03-26T02:59:00.000Z"), true, "25/03 23:59 BRT");
    assert.equal(dentro("2026-03-26T02:59:59.999Z"), true, "25/03 23:59:59.999 BRT");
    assert.equal(dentro("2026-03-10T02:59:59.999Z"), false, "09/03 23:59:59.999 BRT");
    assert.equal(dentro("2026-03-26T03:00:00.000Z"), false, "26/03 00:00 BRT");
  });
});

describe("dataSaoPaulo", () => {
  test("atribui o dia correto perto da meia-noite, independentemente do fuso da máquina", () => {
    assert.equal(dataSaoPaulo("2026-03-01T02:30:00.000Z"), "2026-02-28");
    assert.equal(dataSaoPaulo("2026-03-01T03:00:00.000Z"), "2026-03-01");
    assert.equal(dataSaoPaulo(new Date("2027-01-01T02:59:59.000Z")), "2026-12-31");
  });
});

describe("validarPeriodoFinanceiro", () => {
  test("um único dia é válido", () => {
    assert.deepEqual(validarPeriodoFinanceiro("2026-03-10", "2026-03-10"), {
      valido: true,
      dias: 1,
    });
  });

  test("rejeita datas incompletas, inexistentes e invertidas", () => {
    assert.equal(validarPeriodoFinanceiro("", "2026-03-10").valido, false);
    assert.equal(validarPeriodoFinanceiro("2026-03-10", "").valido, false);
    assert.equal(validarPeriodoFinanceiro("2026-02-30", "2026-03-10").valido, false);
    assert.equal(validarPeriodoFinanceiro("2026-03-25", "2026-03-10").valido, false);
  });

  test("aceita exatamente 366 dias e rejeita 367", () => {
    assert.deepEqual(validarPeriodoFinanceiro("2027-03-01", "2028-02-29"), {
      valido: true,
      dias: 366,
    });
    assert.deepEqual(validarPeriodoFinanceiro("2026-01-01", "2027-01-01"), {
      valido: true,
      dias: 366,
    });

    const excesso = validarPeriodoFinanceiro("2026-01-01", "2027-01-02");

    assert.equal(excesso.valido, false);
    assert.match(excesso.valido ? "" : excesso.mensagem, /367 dias/);
  });

  test("não restringe anos anteriores", () => {
    assert.equal(validarPeriodoFinanceiro("2019-01-01", "2019-12-31").valido, true);
  });
});

describe("calcularPeriodoRapido", () => {
  test("hoje, semana atual (segunda a domingo) e últimos 7 dias", () => {
    // 25/11/2026 é quarta-feira; 29/11/2026 é domingo.
    assert.deepEqual(calcularPeriodoRapido("hoje", "2026-11-25"), {
      dataInicial: "2026-11-25",
      dataFinal: "2026-11-25",
    });
    assert.deepEqual(calcularPeriodoRapido("semanaAtual", "2026-11-25"), {
      dataInicial: "2026-11-23",
      dataFinal: "2026-11-29",
    });
    assert.deepEqual(calcularPeriodoRapido("semanaAtual", "2026-11-29"), {
      dataInicial: "2026-11-23",
      dataFinal: "2026-11-29",
    });
    assert.deepEqual(calcularPeriodoRapido("ultimos7", "2026-03-03"), {
      dataInicial: "2026-02-25",
      dataFinal: "2026-03-03",
    });
  });

  test("mês atual e mês anterior, inclusive virada de ano e fevereiro bissexto", () => {
    assert.deepEqual(calcularPeriodoRapido("mesAtual", "2028-02-10"), {
      dataInicial: "2028-02-01",
      dataFinal: "2028-02-29",
    });
    assert.deepEqual(calcularPeriodoRapido("mesAnterior", "2026-01-15"), {
      dataInicial: "2025-12-01",
      dataFinal: "2025-12-31",
    });
    assert.deepEqual(calcularPeriodoRapido("mesAnterior", "2028-03-31"), {
      dataInicial: "2028-02-01",
      dataFinal: "2028-02-29",
    });
  });
});

describe("agrupamentos", () => {
  test("granularidade: até 62 dias por dia, até 186 por semana, acima disso por mês", () => {
    assert.equal(definirGranularidade(1), "dia");
    assert.equal(definirGranularidade(62), "dia");
    assert.equal(definirGranularidade(63), "semana");
    assert.equal(definirGranularidade(186), "semana");
    assert.equal(definirGranularidade(187), "mes");
  });

  function verificarCobertura(
    intervalo: IntervaloDatasFinanceiro,
    granularidade: GranularidadeFinanceira,
  ) {
    const agrupamentos = criarAgrupamentos(intervalo, granularidade);

    assert.equal(agrupamentos[0].dataInicial, intervalo.dataInicial);
    assert.equal(agrupamentos[agrupamentos.length - 1].dataFinal, intervalo.dataFinal);

    for (let indice = 1; indice < agrupamentos.length; indice++) {
      assert.equal(
        agrupamentos[indice].dataInicial,
        somarDias(agrupamentos[indice - 1].dataFinal, 1),
        "agrupamentos contíguos",
      );
    }

    const porChave = new Map(agrupamentos.map((agrupamento) => [agrupamento.chave, agrupamento]));

    for (let data = intervalo.dataInicial; data <= intervalo.dataFinal; data = somarDias(data, 1)) {
      const agrupamento = porChave.get(
        chaveAgrupamento(data, granularidade, intervalo.dataInicial),
      );

      assert.ok(agrupamento, `sem agrupamento para ${data}`);
      assert.ok(
        agrupamento.dataInicial <= data && data <= agrupamento.dataFinal,
        `${data} fora de ${agrupamento.chave}`,
      );
    }

    return agrupamentos;
  }

  test("diário sem limite de quantidade (antes era cortado em 41 dias)", () => {
    const agrupamentos = verificarCobertura(
      { dataInicial: "2026-01-01", dataFinal: "2026-03-31" },
      "dia",
    );

    assert.equal(agrupamentos.length, 90);
  });

  test("semanal recorta o primeiro e o último agrupamento nas datas selecionadas", () => {
    const agrupamentos = verificarCobertura(
      { dataInicial: "2026-01-01", dataFinal: "2026-03-31" },
      "semana",
    );

    assert.equal(agrupamentos[0].dataFinal, "2026-01-04");
    assert.equal(agrupamentos[1].dataInicial, "2026-01-05");
  });

  test("mensal de 366 dias atravessando o ano e o fevereiro bissexto", () => {
    const intervalo = { dataInicial: "2027-03-15", dataFinal: "2028-03-14" };
    const agrupamentos = verificarCobertura(intervalo, "mes");

    assert.equal(contarDiasInclusivos(intervalo.dataInicial, intervalo.dataFinal), 366);
    assert.equal(agrupamentos.length, 13);
    assert.equal(agrupamentos[0].dataFinal, "2027-03-31");
    assert.equal(agrupamentos[11].dataFinal, "2028-02-29");
    assert.equal(agrupamentos[12].dataInicial, "2028-03-01");
  });
});

describe("formatação de datas", () => {
  test("não depende do fuso local", () => {
    assert.equal(formatarDataIso("2026-03-01"), "01/03/2026");
    assert.equal(
      formatarIntervaloDatas({ dataInicial: "2026-03-10", dataFinal: "2026-03-25" }),
      "10/03/2026 até 25/03/2026",
    );
    assert.equal(
      formatarIntervaloDatas({ dataInicial: "2026-03-10", dataFinal: "2026-03-10" }),
      "10/03/2026",
    );
  });
});
