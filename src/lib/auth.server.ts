import { compare, hash } from "bcryptjs";

const PASSWORD_ROUNDS = 12;

export function gerarHashSenha(senha: string): Promise<string> {
  return hash(senha, PASSWORD_ROUNDS);
}

export function verificarSenha(
  senhaInformada: string,
  senhaHash: string,
): Promise<boolean> {
  return compare(senhaInformada, senhaHash);
}