DO $$
BEGIN
  CREATE TYPE "StatusSolicitacaoAssinatura" AS ENUM (
    'PENDENTE',
    'APROVADA',
    'RECUSADA',
    'CANCELADA',
    'UTILIZADA'
  );
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

ALTER TABLE "PlanoAssinatura"
ADD COLUMN IF NOT EXISTS "duracaoMeses" INTEGER NOT NULL DEFAULT 1;

UPDATE "PlanoAssinatura"
SET "duracaoMeses" = GREATEST(1, ROUND("duracaoDias"::numeric / 30.0)::integer)
WHERE "duracaoMeses" = 1 AND "duracaoDias" <> 30;

CREATE TABLE IF NOT EXISTS "ConfiguracaoAssinatura" (
  "id" TEXT NOT NULL,
  "chave" TEXT NOT NULL DEFAULT 'STUDIO_RD',
  "aprovacaoAutomatica" BOOLEAN NOT NULL DEFAULT false,
  "criadoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "atualizadoEm" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "ConfiguracaoAssinatura_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX IF NOT EXISTS "ConfiguracaoAssinatura_chave_key"
ON "ConfiguracaoAssinatura"("chave");

CREATE TABLE IF NOT EXISTS "SolicitacaoAssinatura" (
  "id" TEXT NOT NULL,
  "clienteId" TEXT NOT NULL,
  "planoId" TEXT NOT NULL,
  "status" "StatusSolicitacaoAssinatura" NOT NULL DEFAULT 'PENDENTE',
  "solicitadoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "decididoEm" TIMESTAMP(3),
  "decididoPorUsuarioId" TEXT,
  "observacaoDecisao" TEXT,
  "utilizadoEm" TIMESTAMP(3),
  "criadoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "atualizadoEm" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "SolicitacaoAssinatura_pkey" PRIMARY KEY ("id")
);

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'SolicitacaoAssinatura_clienteId_fkey'
  ) THEN
    ALTER TABLE "SolicitacaoAssinatura"
    ADD CONSTRAINT "SolicitacaoAssinatura_clienteId_fkey"
    FOREIGN KEY ("clienteId") REFERENCES "Usuario"("id")
    ON DELETE CASCADE ON UPDATE CASCADE;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'SolicitacaoAssinatura_planoId_fkey'
  ) THEN
    ALTER TABLE "SolicitacaoAssinatura"
    ADD CONSTRAINT "SolicitacaoAssinatura_planoId_fkey"
    FOREIGN KEY ("planoId") REFERENCES "PlanoAssinatura"("id")
    ON DELETE RESTRICT ON UPDATE CASCADE;
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS "SolicitacaoAssinatura_clienteId_status_idx"
ON "SolicitacaoAssinatura"("clienteId","status");

CREATE INDEX IF NOT EXISTS "SolicitacaoAssinatura_planoId_status_idx"
ON "SolicitacaoAssinatura"("planoId","status");

CREATE INDEX IF NOT EXISTS "SolicitacaoAssinatura_status_solicitadoEm_idx"
ON "SolicitacaoAssinatura"("status","solicitadoEm");

CREATE INDEX IF NOT EXISTS "SolicitacaoAssinatura_clienteId_planoId_status_idx"
ON "SolicitacaoAssinatura"("clienteId","planoId","status");

CREATE UNIQUE INDEX IF NOT EXISTS "SolicitacaoAssinatura_aberta_unica_idx"
ON "SolicitacaoAssinatura"("clienteId","planoId")
WHERE "status" IN ('PENDENTE','APROVADA');