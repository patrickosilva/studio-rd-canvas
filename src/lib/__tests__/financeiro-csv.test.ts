/// <reference types="node" />
/*
 * Testes da proteção contra CSV Injection das exportações do Financeiro.
 *
 * Executar (Node 22.18+ ou 23.6+, sem dependências adicionais):
 *   node --test "src/lib/__tests__/*.test.ts"
 */
import assert from "node:assert/strict";
import { describe, test } from "node:test";

import {
  celulaMonetariaCsv,
  celulaTextoCsv,
  montarConteudoCsv,
  neutralizarFormulaCsv,
} from "../financeiro-csv.ts";

// Caracteres especiais montados por código para deixar explícito o que é testado.
const NULO = String.fromCharCode(0x00);
const SINO = String.fromCharCode(0x07);
const DEL = String.fromCharCode(0x7f);
const ESPACO_NAO_SEPARAVEL = String.fromCharCode(0xa0);
const IGUAL_LARGURA_TOTAL = String.fromCharCode(0xff1d);
const MAIS_LARGURA_TOTAL = String.fromCharCode(0xff0b);
const MENOS_LARGURA_TOTAL = String.fromCharCode(0xff0d);
const ARROBA_LARGURA_TOTAL = String.fromCharCode(0xff20);

/** Leitor CSV mínimo (separador ";", aspas duplas) para verificar a integridade dos registros. */
function lerCsv(conteudo: string): string[][] {
  const linhas: string[][] = [];
  let linha: string[] = [];
  let campo = "";
  let entreAspas = false;

  for (let indice = 0; indice < conteudo.length; indice++) {
    const caractere = conteudo[indice];

    if (entreAspas) {
      if (caractere === '"' && conteudo[indice + 1] === '"') {
        campo += '"';
        indice++;
      } else if (caractere === '"') {
        entreAspas = false;
      } else {
        campo += caractere;
      }
    } else if (caractere === '"') {
      entreAspas = true;
    } else if (caractere === ";") {
      linha.push(campo);
      campo = "";
    } else if (caractere === "\n") {
      linha.push(campo);
      linhas.push(linha);
      linha = [];
      campo = "";
    } else {
      campo += caractere;
    }
  }

  linha.push(campo);
  linhas.push(linha);

  return linhas;
}

describe("neutralizarFormulaCsv", () => {
  test("prefixa com apóstrofo textos iniciados por caracteres de fórmula", () => {
    for (const valor of [
      "=1+1",
      "+5511999999999",
      "-2+3",
      "@SUM(A1:A2)",
      '=HYPERLINK("http://exemplo.invalido","clique")',
      "=cmd|' /C calc'!A0",
    ]) {
      assert.equal(neutralizarFormulaCsv(valor), `'${valor}`, valor);
    }
  });

  test("considera variantes de largura total", () => {
    for (const inicial of [
      IGUAL_LARGURA_TOTAL,
      MAIS_LARGURA_TOTAL,
      MENOS_LARGURA_TOTAL,
      ARROBA_LARGURA_TOTAL,
    ]) {
      const valor = `${inicial}1+1`;

      assert.equal(neutralizarFormulaCsv(valor), `'${valor}`);
    }
  });

  test("considera espaços iniciais antes da fórmula", () => {
    assert.equal(neutralizarFormulaCsv("  =1+1"), "'  =1+1");
    assert.equal(
      neutralizarFormulaCsv(`${ESPACO_NAO_SEPARAVEL}=1+1`),
      `'${ESPACO_NAO_SEPARAVEL}=1+1`,
    );
  });

  test("considera tabulação, retorno de carro e quebra de linha no início", () => {
    assert.equal(neutralizarFormulaCsv("\t=1+1"), "'\t=1+1");
    assert.equal(neutralizarFormulaCsv("\r=1+1"), "'\r=1+1");
    assert.equal(neutralizarFormulaCsv("\nTexto"), "'\nTexto");
  });

  test("remove caracteres de controle sem uso legítimo, inclusive os usados para esconder fórmulas", () => {
    assert.equal(neutralizarFormulaCsv(`Jo${NULO}ão${DEL}`), "João");
    assert.equal(neutralizarFormulaCsv(`${SINO}=1+1`), "'=1+1");
    assert.equal(neutralizarFormulaCsv(`${NULO} =1+1`), "' =1+1");
  });

  test("preserva textos comuns, acentuação e sinais fora da posição inicial", () => {
    for (const valor of [
      "João Ávila",
      "Corte + Barba",
      "Profissional: =Carlos",
      "Assinatura RD Black",
      "Plano com status ATIVA",
      "seg., 10/03/2026, 23:59",
      "",
    ]) {
      assert.equal(neutralizarFormulaCsv(valor), valor, valor);
    }
  });

  test("preserva quebras de linha internas", () => {
    assert.equal(neutralizarFormulaCsv("linha 1\nlinha 2"), "linha 1\nlinha 2");
  });
});

describe("células CSV", () => {
  test("texto é envolvido em aspas, com aspas internas duplicadas", () => {
    assert.equal(celulaTextoCsv('Maria "Bia"'), '"Maria ""Bia"""');
    assert.equal(celulaTextoCsv('=HYPERLINK("x")'), '"\'=HYPERLINK(""x"")"');
  });

  test("valores ausentes viram célula vazia", () => {
    assert.equal(celulaTextoCsv(null), '""');
    assert.equal(celulaTextoCsv(undefined), '""');
  });

  test("valor monetário é preservado exatamente como formatado", () => {
    const valor = new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(
      1234.5,
    );

    assert.equal(celulaMonetariaCsv(valor), `"${valor}"`);
    assert.equal(celulaMonetariaCsv("-R$ 5,00"), '"-R$ 5,00"');
  });
});

describe("montarConteudoCsv", () => {
  test("mantém separador ';', quebra de linha '\\n' e a integridade dos registros", () => {
    const original = [
      ["Período", "Cliente", "Detalhe", "Valor"],
      [
        "Personalizado (10/03/2026 até 25/03/2026)",
        "=1+1",
        "linha 1\nlinha 2; com ponto e vírgula",
        "R$ 10,00",
      ],
      ["Mês anterior (01/02/2026 até 28/02/2026)", 'Ana "Nina" Souza', "@SUM(A1)", "R$ 0,00"],
    ];

    const conteudo = montarConteudoCsv(
      original.map((linha) => [
        ...linha.slice(0, 3).map(celulaTextoCsv),
        celulaMonetariaCsv(linha[3]),
      ]),
    );

    assert.equal(conteudo.split("\n")[0], '"Período";"Cliente";"Detalhe";"Valor"');

    const lido = lerCsv(conteudo);

    assert.equal(lido.length, 3);
    assert.ok(lido.every((linha) => linha.length === 4));
    assert.deepEqual(lido[1], [
      "Personalizado (10/03/2026 até 25/03/2026)",
      "'=1+1",
      "linha 1\nlinha 2; com ponto e vírgula",
      "R$ 10,00",
    ]);
    assert.deepEqual(lido[2], [
      "Mês anterior (01/02/2026 até 28/02/2026)",
      'Ana "Nina" Souza',
      "'@SUM(A1)",
      "R$ 0,00",
    ]);
  });
});
