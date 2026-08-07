import { a as createSsrRpc } from "./router-CUHN8dl0.js";
import { c as createServerFn } from "./server-n3LmVJQm.js";
import { z } from "zod";
const formasPagamento = ["PIX", "DINHEIRO", "CARTAO_DEBITO", "CARTAO_CREDITO", "ASSINATURA", "CORTESIA", "OUTRO"];
const criarPlanoAssinaturaSchema = z.object({
  nome: z.string().trim().min(2, "Informe o nome do plano.").max(80, "O nome do plano é muito grande."),
  descricao: z.string().trim().max(500, "A descrição é muito grande.").optional().or(z.literal("")),
  precoCentavos: z.number().int("O preço precisa estar em centavos.").min(0, "O preço não pode ser negativo."),
  cortesPorCiclo: z.number().int("A quantidade de cortes precisa ser inteira.").min(1, "Informe pelo menos 1 corte."),
  duracaoDias: z.number().int("A duração precisa ser em dias.").min(1, "A duração precisa ter pelo menos 1 dia.").max(365, "A duração não pode passar de 365 dias."),
  ativo: z.boolean().default(true)
});
const ativarAssinaturaClienteSchema = z.object({
  clienteId: z.string().trim().min(1, "Cliente inválido."),
  planoId: z.string().trim().min(1, "Plano inválido."),
  vigenciaInicio: z.string().trim().optional().or(z.literal("")),
  formaPagamento: z.enum(formasPagamento).optional(),
  valorPagoCentavos: z.number().int("O valor precisa estar em centavos.").min(0, "O valor não pode ser negativo.").optional(),
  observacao: z.string().trim().max(500, "A observação é muito grande.").optional().or(z.literal(""))
});
const cancelarAssinaturaClienteSchema = z.object({
  assinaturaId: z.string().trim().min(1, "Assinatura inválida."),
  observacao: z.string().trim().max(500, "A observação é muito grande.").optional().or(z.literal(""))
});
const adminListarPlanosAssinatura = createServerFn({
  method: "GET"
}).handler(createSsrRpc("0e9747a21b38d6cdadcf45c1fc58bad3883e66e28220894eb630d10eabce8e90"));
const adminCriarPlanoAssinatura = createServerFn({
  method: "POST"
}).validator(criarPlanoAssinaturaSchema).handler(createSsrRpc("7223ac46ebbeafaccff956bd870b73b225bae09e48ec4d40581f6a96f28aa18e"));
const adminListarClientesParaAssinatura = createServerFn({
  method: "GET"
}).handler(createSsrRpc("d2f95a13f200400331cd962899742ad94aa73572aceb997f4369fa33350de4f7"));
const adminListarAssinaturas = createServerFn({
  method: "GET"
}).handler(createSsrRpc("f77b1f7b4e34c18f6d82b68f42a323e40a6a2a31f4094e179287026761462c7e"));
const adminAtivarAssinaturaCliente = createServerFn({
  method: "POST"
}).validator(ativarAssinaturaClienteSchema).handler(createSsrRpc("a3adf929c7fd63bb1d2ef7b40cccee4f510bd1dc224a9c2beeea97d802839315"));
const adminCancelarAssinaturaCliente = createServerFn({
  method: "POST"
}).validator(cancelarAssinaturaClienteSchema).handler(createSsrRpc("10bba8106bda2eba336a14dcac07b30d05cd6549b66a6bce554e8eda7ae78cfb"));
const listarMinhaAssinaturaAtiva = createServerFn({
  method: "GET"
}).handler(createSsrRpc("12ca0ba994cdbd73e667498d7ec50ffdee3f41101838dcb079775cefd7bd3397"));
const adminListarPagamentosAssinatura = createServerFn({
  method: "GET"
}).handler(createSsrRpc("a877d16e29062f4c232692c2fcfca4772cd330d7055ebbdb47b126d4c9a32f79"));
const desativarPlanoAssinaturaSchema = z.object({
  planoId: z.string().trim().min(1, "Plano inválido.")
});
const adminDesativarPlanoAssinatura = createServerFn({
  method: "POST"
}).validator(desativarPlanoAssinaturaSchema).handler(createSsrRpc("f352d2d8511a4a809e893d8101f2ac63910fc348d29331f9706496a09ac5d249"));
export {
  adminListarPagamentosAssinatura as a,
  adminListarPlanosAssinatura as b,
  adminCriarPlanoAssinatura as c,
  adminDesativarPlanoAssinatura as d,
  adminListarClientesParaAssinatura as e,
  adminListarAssinaturas as f,
  adminAtivarAssinaturaCliente as g,
  adminCancelarAssinaturaCliente as h,
  listarMinhaAssinaturaAtiva as l
};
