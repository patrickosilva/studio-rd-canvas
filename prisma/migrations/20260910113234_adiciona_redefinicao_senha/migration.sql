-- CreateTable
CREATE TABLE "TokenRedefinicaoSenha" (
    "id" TEXT NOT NULL,
    "usuarioId" TEXT NOT NULL,
    "tokenHash" TEXT NOT NULL,
    "usado" BOOLEAN NOT NULL DEFAULT false,
    "expiraEm" TIMESTAMP(3) NOT NULL,
    "criadoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "atualizadoEm" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "TokenRedefinicaoSenha_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "TokenRedefinicaoSenha_tokenHash_key" ON "TokenRedefinicaoSenha"("tokenHash");

-- CreateIndex
CREATE INDEX "TokenRedefinicaoSenha_usuarioId_idx" ON "TokenRedefinicaoSenha"("usuarioId");

-- CreateIndex
CREATE INDEX "TokenRedefinicaoSenha_expiraEm_idx" ON "TokenRedefinicaoSenha"("expiraEm");

-- CreateIndex
CREATE INDEX "TokenRedefinicaoSenha_usado_idx" ON "TokenRedefinicaoSenha"("usado");

-- AddForeignKey
ALTER TABLE "TokenRedefinicaoSenha" ADD CONSTRAINT "TokenRedefinicaoSenha_usuarioId_fkey" FOREIGN KEY ("usuarioId") REFERENCES "Usuario"("id") ON DELETE CASCADE ON UPDATE CASCADE;
