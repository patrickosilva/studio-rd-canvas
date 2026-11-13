export type NomeProvedorPagamento = "MANUAL" | "MERCADO_PAGO";

export type EstadoConfiguracaoProvider = {
  nome: NomeProvedorPagamento;
  configurado: boolean;
};

export interface PaymentProvider {
  readonly nome: NomeProvedorPagamento;
  configurado(): boolean;
}

export function bpsParaPercentual(bps: number): number {
  return bps / 100;
}

export function calcularComissaoCentavos(
  valorCentavos: number,
  percentualComissaoBps: number,
): number {
  if (valorCentavos <= 0 || percentualComissaoBps <= 0) {
    return 0;
  }

  return Math.round(
    (valorCentavos * percentualComissaoBps) / 10_000,
  );
}
