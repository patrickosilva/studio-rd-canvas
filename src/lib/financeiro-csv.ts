/*
 * Geração segura de células CSV para as exportações do Financeiro.
 *
 * Proteção contra CSV Injection (fórmulas interpretadas por Excel,
 * LibreOffice, Google Sheets etc.): textos que começam com caracteres de
 * fórmula recebem um apóstrofo inicial, que faz a planilha tratar o
 * conteúdo como texto. A proteção ocorre apenas na exportação; nenhum dado
 * armazenado é alterado.
 *
 * Arquivo puro (sem dependências) para poder ser testado com `node --test`.
 */

export const SEPARADOR_CSV = ";";

export const QUEBRA_LINHA_CSV = "\n";

// Caracteres que iniciam fórmulas, incluindo as variantes de largura total
// que algumas planilhas normalizam para os caracteres comuns.
const INICIO_FORMULA = /^[=+\-@\uFF1D\uFF0B\uFF0D\uFF20]/;

// Tabulação, retorno de carro e quebra de linha no início também são usados
// para contornar filtros simples de fórmulas.
const INICIO_CONTROLE = /^[\t\r\n]/;

// Espaços iniciais (inclusive não separáveis e de largura total) não impedem
// que algumas planilhas interpretem a fórmula que vem em seguida.
const ESPACOS_INICIAIS = /^\s+/;

/**
 * Remove caracteres de controle (U+0000–U+001F e U+007F), que não têm uso
 * legítimo em um texto exportado. Tabulação, quebra de linha e retorno de
 * carro são mantidos porque podem fazer parte de observações com várias linhas.
 */
function removerCaracteresControle(valor: string): string {
  let resultado = "";

  for (const caractere of valor) {
    const codigo = caractere.charCodeAt(0);
    const controle = codigo <= 0x1f || codigo === 0x7f;
    const permitido = caractere === "\t" || caractere === "\n" || caractere === "\r";

    if (!controle || permitido) {
      resultado += caractere;
    }
  }

  return resultado;
}

/**
 * Neutraliza conteúdo que poderia ser interpretado como fórmula.
 * O texto visível é preservado; apenas um apóstrofo é acrescentado no início
 * quando necessário.
 */
export function neutralizarFormulaCsv(valor: string): string {
  const semControles = removerCaracteresControle(valor);
  const semEspacosIniciais = semControles.replace(ESPACOS_INICIAIS, "");

  if (INICIO_CONTROLE.test(semControles) || INICIO_FORMULA.test(semEspacosIniciais)) {
    return `'${semControles}`;
  }

  return semControles;
}

function envolverEmAspas(texto: string): string {
  return `"${texto.replace(/"/g, '""')}"`;
}

/**
 * Célula de texto: pode conter conteúdo informado por usuários (nomes de
 * clientes, profissionais, serviços, planos, observações). Sempre neutralizada.
 */
export function celulaTextoCsv(valor: string | number | null | undefined): string {
  const texto = valor === null || valor === undefined ? "" : String(valor);

  return envolverEmAspas(neutralizarFormulaCsv(texto));
}

/**
 * Célula monetária gerada pelo próprio sistema (Intl.NumberFormat). Não é
 * neutralizada para preservar exatamente o valor exportado.
 */
export function celulaMonetariaCsv(valorFormatado: string): string {
  return envolverEmAspas(valorFormatado);
}

export function montarConteudoCsv(linhas: string[][]): string {
  return linhas.map((linha) => linha.join(SEPARADOR_CSV)).join(QUEBRA_LINHA_CSV);
}
