import { a as createSsrRpc } from "./router-oC4Qe4sf.mjs";
import { c as createServerFn } from "./server-BeKYjhVv.mjs";
import { o as objectType, s as stringType, l as literalType } from "../_libs/zod.mjs";
const criarBloqueioAgendaSchema = objectType({
  profissionalId: stringType().trim().optional().or(literalType("")),
  inicio: stringType().trim().min(1, "Informe o início do bloqueio."),
  fim: stringType().trim().min(1, "Informe o fim do bloqueio."),
  motivo: stringType().trim().max(300, "O motivo é muito grande.").optional().or(literalType(""))
});
const removerBloqueioAgendaSchema = objectType({
  bloqueioId: stringType().trim().min(1, "Bloqueio inválido.")
});
const listarBloqueiosAgenda = createServerFn({
  method: "GET"
}).handler(createSsrRpc("62ec7a62ad5b0a23623c54b791e76ee0b9c65ea1b11c15279f051df7e50ed8d2"));
const criarBloqueioAgenda = createServerFn({
  method: "POST"
}).validator(criarBloqueioAgendaSchema).handler(createSsrRpc("0e0e5c7f84714efb2203feb27040c7bf66eec94c4ddb5db99e9b37bfdf0bc108"));
const removerBloqueioAgenda = createServerFn({
  method: "POST"
}).validator(removerBloqueioAgendaSchema).handler(createSsrRpc("cfff6113b35a8d60b7c007076a06359311bcb6bf4cf667927839816a4400a0cf"));
export {
  criarBloqueioAgenda as c,
  listarBloqueiosAgenda as l,
  removerBloqueioAgenda as r
};
