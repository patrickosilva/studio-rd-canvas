CREATE TYPE "TipoDescontoCupom" AS ENUM ('PERCENTUAL', 'VALOR_FIXO');

CREATE TABLE "Cupom" (
    "id" TEXT NOT NULL,
    "codigo" TEXT NOT NULL,
    "descricao" TEXT,
    "tipo" "TipoDescontoCupom" NOT NULL,
    "percentualDesconto" INTEGER,
    "valorDescontoCentavos" INTEGER,
    "valorMinimoCentavos" INTEGER,
    "inicioEm" TIMESTAMP(3),
    "fimEm" TIMESTAMP(3),
    "limiteUsos" INTEGER,
    "limitePorCliente" INTEGER,
    "aplicaTodosServicos" BOOLEAN NOT NULL DEFAULT true,
    "ativo" BOOLEAN NOT NULL DEFAULT true,
    "criadoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "atualizadoEm" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Cupom_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "CupomServico" (
    "cupomId" TEXT NOT NULL,
    "servicoId" TEXT NOT NULL,

    CONSTRAINT "CupomServico_pkey" PRIMARY KEY ("cupomId","servicoId")
);

CREATE UNIQUE INDEX "Cupom_codigo_key" ON "Cupom"("codigo");
CREATE INDEX "Cupom_ativo_idx" ON "Cupom"("ativo");
CREATE INDEX "Cupom_inicioEm_idx" ON "Cupom"("inicioEm");
CREATE INDEX "Cupom_fimEm_idx" ON "Cupom"("fimEm");
CREATE INDEX "Cupom_ativo_fimEm_idx" ON "Cupom"("ativo", "fimEm");
CREATE INDEX "CupomServico_servicoId_idx" ON "CupomServico"("servicoId");

ALTER TABLE "CupomServico"
ADD CONSTRAINT "CupomServico_cupomId_fkey"
FOREIGN KEY ("cupomId") REFERENCES "Cupom"("id")
ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "CupomServico"
ADD CONSTRAINT "CupomServico_servicoId_fkey"
FOREIGN KEY ("servicoId") REFERENCES "Servico"("id")
ON DELETE RESTRICT ON UPDATE CASCADE;