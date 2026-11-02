-- CreateEnum
CREATE TYPE "ProvedorOAuth" AS ENUM ('GOOGLE');

-- AlterTable
ALTER TABLE "Usuario" ALTER COLUMN "senhaHash" DROP NOT NULL;

-- CreateTable
CREATE TABLE "ContaOAuth" (
    "id" TEXT NOT NULL,
    "usuarioId" TEXT NOT NULL,
    "provedor" "ProvedorOAuth" NOT NULL,
    "providerUserId" TEXT NOT NULL,
    "emailNoVinculo" TEXT,
    "ultimoLoginEm" TIMESTAMP(3),
    "criadoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "atualizadoEm" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ContaOAuth_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "ContaOAuth_usuarioId_idx" ON "ContaOAuth"("usuarioId");

-- CreateIndex
CREATE UNIQUE INDEX "ContaOAuth_provedor_providerUserId_key" ON "ContaOAuth"("provedor", "providerUserId");

-- CreateIndex
CREATE UNIQUE INDEX "ContaOAuth_usuarioId_provedor_key" ON "ContaOAuth"("usuarioId", "provedor");

-- AddForeignKey
ALTER TABLE "ContaOAuth" ADD CONSTRAINT "ContaOAuth_usuarioId_fkey" FOREIGN KEY ("usuarioId") REFERENCES "Usuario"("id") ON DELETE CASCADE ON UPDATE CASCADE;
