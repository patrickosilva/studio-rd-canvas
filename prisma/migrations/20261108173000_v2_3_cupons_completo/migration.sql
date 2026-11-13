DO $$
BEGIN
  CREATE TYPE "TipoDescontoCupom" AS ENUM ('PERCENTUAL', 'VALOR_FIXO');
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

DO $$
BEGIN
  CREATE TYPE "PublicoCupom" AS ENUM (
    'TODOS',
    'PRIMEIRO_ATENDIMENTO',
    'ATE_X_ATENDIMENTOS',
    'MINIMO_X_ATENDIMENTOS',
    'SEM_ATENDIMENTO_HA_X_DIAS',
    'ASSINANTE_ATIVO'
  );
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

CREATE TABLE IF NOT EXISTS "Cupom" (
    "id" TEXT NOT NULL,
    "codigo" TEXT NOT NULL,
    "descricao" TEXT,
    "campanha" TEXT,
    "tipo" "TipoDescontoCupom" NOT NULL,
    "percentualDesconto" INTEGER,
    "valorDescontoCentavos" INTEGER,
    "limiteDescontoCentavos" INTEGER,
    "valorMinimoCentavos" INTEGER,
    "inicioEm" TIMESTAMP(3),
    "fimEm" TIMESTAMP(3),
    "limiteUsos" INTEGER,
    "limitePorCliente" INTEGER,
    "publico" "PublicoCupom" NOT NULL DEFAULT 'TODOS',
    "quantidadeAtendimentos" INTEGER,
    "diasSemAtendimento" INTEGER,
    "aplicaTodosServicos" BOOLEAN NOT NULL DEFAULT true,
    "visivelParaClientes" BOOLEAN NOT NULL DEFAULT true,
    "destaque" BOOLEAN NOT NULL DEFAULT false,
    "combinavelComAssinatura" BOOLEAN NOT NULL DEFAULT false,
    "ativo" BOOLEAN NOT NULL DEFAULT true,
    "criadoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "atualizadoEm" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Cupom_pkey" PRIMARY KEY ("id")
);

ALTER TABLE "Cupom"
  ADD COLUMN IF NOT EXISTS "campanha" TEXT,
  ADD COLUMN IF NOT EXISTS "limiteDescontoCentavos" INTEGER,
  ADD COLUMN IF NOT EXISTS "publico" "PublicoCupom" NOT NULL DEFAULT 'TODOS',
  ADD COLUMN IF NOT EXISTS "quantidadeAtendimentos" INTEGER,
  ADD COLUMN IF NOT EXISTS "diasSemAtendimento" INTEGER,
  ADD COLUMN IF NOT EXISTS "visivelParaClientes" BOOLEAN NOT NULL DEFAULT true,
  ADD COLUMN IF NOT EXISTS "destaque" BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS "combinavelComAssinatura" BOOLEAN NOT NULL DEFAULT false;

CREATE TABLE IF NOT EXISTS "CupomServico" (
    "cupomId" TEXT NOT NULL,
    "servicoId" TEXT NOT NULL,

    CONSTRAINT "CupomServico_pkey" PRIMARY KEY ("cupomId","servicoId")
);

CREATE TABLE IF NOT EXISTS "UsoCupom" (
    "id" TEXT NOT NULL,
    "cupomId" TEXT NOT NULL,
    "clienteId" TEXT NOT NULL,
    "agendamentoId" TEXT,
    "codigoAplicado" TEXT NOT NULL,
    "descontoCentavos" INTEGER NOT NULL,
    "criadoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "UsoCupom_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX IF NOT EXISTS "Cupom_codigo_key" ON "Cupom"("codigo");
CREATE INDEX IF NOT EXISTS "Cupom_ativo_idx" ON "Cupom"("ativo");
CREATE INDEX IF NOT EXISTS "Cupom_inicioEm_idx" ON "Cupom"("inicioEm");
CREATE INDEX IF NOT EXISTS "Cupom_fimEm_idx" ON "Cupom"("fimEm");
CREATE INDEX IF NOT EXISTS "Cupom_ativo_fimEm_idx" ON "Cupom"("ativo", "fimEm");
CREATE INDEX IF NOT EXISTS "Cupom_visivelParaClientes_ativo_idx"
ON "Cupom"("visivelParaClientes", "ativo");
CREATE INDEX IF NOT EXISTS "Cupom_publico_idx" ON "Cupom"("publico");

CREATE INDEX IF NOT EXISTS "CupomServico_servicoId_idx"
ON "CupomServico"("servicoId");

CREATE UNIQUE INDEX IF NOT EXISTS "UsoCupom_agendamentoId_key"
ON "UsoCupom"("agendamentoId");
CREATE INDEX IF NOT EXISTS "UsoCupom_cupomId_idx"
ON "UsoCupom"("cupomId");
CREATE INDEX IF NOT EXISTS "UsoCupom_clienteId_idx"
ON "UsoCupom"("clienteId");
CREATE INDEX IF NOT EXISTS "UsoCupom_cupomId_clienteId_idx"
ON "UsoCupom"("cupomId", "clienteId");
CREATE INDEX IF NOT EXISTS "UsoCupom_criadoEm_idx"
ON "UsoCupom"("criadoEm");

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'CupomServico_cupomId_fkey'
  ) THEN
    ALTER TABLE "CupomServico"
    ADD CONSTRAINT "CupomServico_cupomId_fkey"
    FOREIGN KEY ("cupomId") REFERENCES "Cupom"("id")
    ON DELETE CASCADE ON UPDATE CASCADE;
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'CupomServico_servicoId_fkey'
  ) THEN
    ALTER TABLE "CupomServico"
    ADD CONSTRAINT "CupomServico_servicoId_fkey"
    FOREIGN KEY ("servicoId") REFERENCES "Servico"("id")
    ON DELETE RESTRICT ON UPDATE CASCADE;
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'UsoCupom_cupomId_fkey'
  ) THEN
    ALTER TABLE "UsoCupom"
    ADD CONSTRAINT "UsoCupom_cupomId_fkey"
    FOREIGN KEY ("cupomId") REFERENCES "Cupom"("id")
    ON DELETE RESTRICT ON UPDATE CASCADE;
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'UsoCupom_clienteId_fkey'
  ) THEN
    ALTER TABLE "UsoCupom"
    ADD CONSTRAINT "UsoCupom_clienteId_fkey"
    FOREIGN KEY ("clienteId") REFERENCES "Usuario"("id")
    ON DELETE RESTRICT ON UPDATE CASCADE;
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'UsoCupom_agendamentoId_fkey'
  ) THEN
    ALTER TABLE "UsoCupom"
    ADD CONSTRAINT "UsoCupom_agendamentoId_fkey"
    FOREIGN KEY ("agendamentoId") REFERENCES "Agendamento"("id")
    ON DELETE SET NULL ON UPDATE CASCADE;
  END IF;
END $$;