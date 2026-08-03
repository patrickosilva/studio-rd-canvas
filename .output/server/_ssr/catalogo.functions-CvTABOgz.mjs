import { a as createSsrRpc } from "./router-oC4Qe4sf.mjs";
import { c as createServerFn } from "./server-BeKYjhVv.mjs";
import { o as objectType, b as booleanType, n as numberType, s as stringType, l as literalType } from "../_libs/zod.mjs";
const servicoSchema = objectType({
  nome: stringType().trim().min(2, "O nome do serviço é obrigatório.").max(80, "O nome do serviço é muito grande."),
  descricao: stringType().trim().max(500, "A descrição é muito grande.").optional().or(literalType("")),
  duracaoMinutos: numberType().int("A duração precisa ser um número inteiro.").min(10, "A duração mínima é de 10 minutos.").max(480, "A duração máxima é de 480 minutos."),
  precoCentavos: numberType().int("O preço precisa estar em centavos.").min(0, "O preço não pode ser negativo."),
  ativo: booleanType().default(true)
});
const profissionalSchema = objectType({
  usuarioId: stringType().trim().optional().or(literalType("")),
  nome: stringType().trim().min(2, "O nome do profissional é obrigatório.").max(100, "O nome é muito grande."),
  telefone: stringType().trim().max(20, "Telefone inválido.").optional().or(literalType("")),
  descricao: stringType().trim().max(500, "A descrição é muito grande.").optional().or(literalType("")),
  ativo: booleanType().default(true)
});
const desativarItemCatalogoSchema = objectType({
  id: stringType().trim().min(1, "Item inválido.")
});
const listarServicos = createServerFn({
  method: "GET"
}).handler(createSsrRpc("a61758c75a93384f77851e2c66f920c099f8a47b64b2e7de0f19dcb50297749c"));
const listarServicosAtivos = createServerFn({
  method: "GET"
}).handler(createSsrRpc("626df4263be9cd9a471ca16bab48b24b6b4cc076134d4219512dff0e44137aad"));
const cadastrarServico = createServerFn({
  method: "POST"
}).validator(servicoSchema).handler(createSsrRpc("1b55ea4ae81486954146a9169ed54ee1b3f5677daf374d196ff0a70c67174bf5"));
const listarProfissionais = createServerFn({
  method: "GET"
}).handler(createSsrRpc("acccc942ee9715b568f2129938d55974dab2f82d481eb703442b58a0729283dc"));
const listarProfissionaisAtivos = createServerFn({
  method: "GET"
}).handler(createSsrRpc("5297a8d7127791359d9babfafa1f6b1fce845eaf1f893147b2ca75d6016a34e3"));
const cadastrarProfissional = createServerFn({
  method: "POST"
}).validator(profissionalSchema).handler(createSsrRpc("0fcfac69cc2b614945f84ad15d3a4e6446e05d320ff6a57316b302c459fe9001"));
const adminDesativarServico = createServerFn({
  method: "POST"
}).validator(desativarItemCatalogoSchema).handler(createSsrRpc("b604fcd92b87c205c2b38a7d7823db579ad886441aeaca118fd7a90f94e0d282"));
const adminDesativarProfissional = createServerFn({
  method: "POST"
}).validator(desativarItemCatalogoSchema).handler(createSsrRpc("571f947f803482b67a161ab5fb9aa9b72655b436213157f2462d96e25933e9c8"));
export {
  listarServicosAtivos as a,
  listarServicos as b,
  listarProfissionais as c,
  cadastrarServico as d,
  adminDesativarServico as e,
  cadastrarProfissional as f,
  adminDesativarProfissional as g,
  listarProfissionaisAtivos as l
};
