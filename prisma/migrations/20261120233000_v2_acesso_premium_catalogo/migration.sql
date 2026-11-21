ALTER TYPE "ProvedorIntegracao"
ADD VALUE IF NOT EXISTS 'INFINITEPAY';

ALTER TYPE "ProvedorPagamento"
ADD VALUE IF NOT EXISTS 'INFINITEPAY';

DO $$
BEGIN
  CREATE TYPE "StatusPedidoAssinatura" AS ENUM (
    'CRIADO',
    'CHECKOUT_CRIADO',
    'PAGO',
    'FALHOU',
    'CANCELADO',
    'ESTORNADO'
  );
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

-- A solicitação deixa de apontar obrigatoriamente para um plano.
-- Ela passa a representar a permissão do cliente para enxergar o catálogo Premium.
DROP INDEX IF EXISTS "SolicitacaoAssinatura_aberta_unica_idx";

ALTER TABLE "SolicitacaoAssinatura"
ALTER COLUMN "planoId" DROP NOT NULL;

-- Se o modelo antigo deixou mais de uma solicitação aberta para o mesmo cliente,
-- preserva uma única decisão: APROVADA tem prioridade sobre PENDENTE e,
-- dentro do mesmo status, vence a mais recente.
WITH ordenadas AS (
  SELECT
    "id",
    ROW_NUMBER() OVER (
      PARTITION BY "clienteId"
      ORDER BY
        CASE WHEN "status" = 'APROVADA' THEN 0 ELSE 1 END,
        "solicitadoEm" DESC,
        "criadoEm" DESC
    ) AS rn
  FROM "SolicitacaoAssinatura"
  WHERE "status" IN ('PENDENTE','APROVADA')
)
UPDATE "SolicitacaoAssinatura" s
SET
  "status" = 'CANCELADA',
  "decididoEm" = COALESCE(s."decididoEm", CURRENT_TIMESTAMP),
  "observacaoDecisao" = COALESCE(
    s."observacaoDecisao",
    'Solicitação antiga encerrada na migração para acesso Premium global.'
  )
FROM ordenadas o
WHERE s."id" = o."id"
  AND o.rn > 1;

UPDATE "SolicitacaoAssinatura"
SET "planoId" = NULL
WHERE "status" IN ('PENDENTE','APROVADA');

CREATE UNIQUE INDEX IF NOT EXISTS "SolicitacaoAssinatura_acesso_aberto_unico_idx"
ON "SolicitacaoAssinatura"("clienteId")
WHERE "status" IN ('PENDENTE','APROVADA');

CREATE TABLE IF NOT EXISTS "PedidoAssinatura" (
  "id" TEXT NOT NULL,
  "clienteId" TEXT NOT NULL,
  "planoId" TEXT NOT NULL,
  "solicitacaoId" TEXT NOT NULL,
  "assinaturaId" TEXT,
  "status" "StatusPedidoAssinatura" NOT NULL DEFAULT 'CRIADO',

  "precoOriginalCentavos" INTEGER NOT NULL,
  "descontoCentavos" INTEGER NOT NULL DEFAULT 0,
  "valorFinalCentavos" INTEGER NOT NULL,

  "orderNsu" TEXT NOT NULL,
  "checkoutUrl" TEXT,
  "expiraEm" TIMESTAMP(3),

  "transactionNsu" TEXT,
  "invoiceSlug" TEXT,
  "receiptUrl" TEXT,
  "captureMethod" TEXT,
  "paidAmountCentavos" INTEGER,
  "installments" INTEGER,
  "pagoEm" TIMESTAMP(3),

  "criadoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "atualizadoEm" TIMESTAMP(3) NOT NULL,

  CONSTRAINT "PedidoAssinatura_pkey" PRIMARY KEY ("id")
);

DROP INDEX IF EXISTS "PedidoAssinatura_solicitacaoId_key";

CREATE UNIQUE INDEX IF NOT EXISTS "PedidoAssinatura_assinaturaId_key"
ON "PedidoAssinatura"("assinaturaId");

CREATE UNIQUE INDEX IF NOT EXISTS "PedidoAssinatura_orderNsu_key"
ON "PedidoAssinatura"("orderNsu");

CREATE UNIQUE INDEX IF NOT EXISTS "PedidoAssinatura_transactionNsu_key"
ON "PedidoAssinatura"("transactionNsu");

CREATE INDEX IF NOT EXISTS "PedidoAssinatura_clienteId_status_idx"
ON "PedidoAssinatura"("clienteId","status");

CREATE INDEX IF NOT EXISTS "PedidoAssinatura_planoId_status_idx"
ON "PedidoAssinatura"("planoId","status");

CREATE INDEX IF NOT EXISTS "PedidoAssinatura_solicitacaoId_idx"
ON "PedidoAssinatura"("solicitacaoId");

CREATE INDEX IF NOT EXISTS "PedidoAssinatura_status_criadoEm_idx"
ON "PedidoAssinatura"("status","criadoEm");

CREATE INDEX IF NOT EXISTS "PedidoAssinatura_expiraEm_idx"
ON "PedidoAssinatura"("expiraEm");

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'PedidoAssinatura_clienteId_fkey'
  ) THEN
    ALTER TABLE "PedidoAssinatura"
    ADD CONSTRAINT "PedidoAssinatura_clienteId_fkey"
    FOREIGN KEY ("clienteId") REFERENCES "Usuario"("id")
    ON DELETE CASCADE ON UPDATE CASCADE;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'PedidoAssinatura_planoId_fkey'
  ) THEN
    ALTER TABLE "PedidoAssinatura"
    ADD CONSTRAINT "PedidoAssinatura_planoId_fkey"
    FOREIGN KEY ("planoId") REFERENCES "PlanoAssinatura"("id")
    ON DELETE RESTRICT ON UPDATE CASCADE;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'PedidoAssinatura_solicitacaoId_fkey'
  ) THEN
    ALTER TABLE "PedidoAssinatura"
    ADD CONSTRAINT "PedidoAssinatura_solicitacaoId_fkey"
    FOREIGN KEY ("solicitacaoId") REFERENCES "SolicitacaoAssinatura"("id")
    ON DELETE RESTRICT ON UPDATE CASCADE;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'PedidoAssinatura_assinaturaId_fkey'
  ) THEN
    ALTER TABLE "PedidoAssinatura"
    ADD CONSTRAINT "PedidoAssinatura_assinaturaId_fkey"
    FOREIGN KEY ("assinaturaId") REFERENCES "AssinaturaCliente"("id")
    ON DELETE SET NULL ON UPDATE CASCADE;
  END IF;
END $$;
