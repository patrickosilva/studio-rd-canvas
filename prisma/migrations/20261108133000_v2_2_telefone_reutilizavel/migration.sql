DROP INDEX IF EXISTS "Usuario_telefone_key";

CREATE INDEX IF NOT EXISTS "Usuario_telefone_idx"
ON "Usuario"("telefone");