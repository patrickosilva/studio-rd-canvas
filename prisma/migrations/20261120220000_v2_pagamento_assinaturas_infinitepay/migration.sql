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

CREATE UNIQUE INDEX IF NOT EXISTS "PedidoAssinatura_solicitacaoId_key"
ON "PedidoAssinatura"("solicitacaoId");

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