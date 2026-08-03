import { a as createSsrRpc } from "./router-oC4Qe4sf.mjs";
import { c as createServerFn } from "./server-BeKYjhVv.mjs";
import { o as objectType, s as stringType, l as literalType, n as numberType, e as enumType } from "../_libs/zod.mjs";
const solicitarAgendamentoSchema = objectType({
  profissionalId: stringType().trim().min(1, "Escolha um profissional."),
  servicoId: stringType().trim().min(1, "Escolha um serviço."),
  inicio: stringType().trim().min(1, "Escolha uma data e horário."),
  observacaoCliente: stringType().trim().max(500, "A observação é muito grande.").optional().or(literalType(""))
});
const alterarStatusSchema = objectType({
  agendamentoId: stringType().trim().min(1, "Agendamento inválido.")
});
const recusarAgendamentoSchema = objectType({
  agendamentoId: stringType().trim().min(1, "Agendamento inválido."),
  motivoRecusa: stringType().trim().max(500, "O motivo é muito grande.").optional().or(literalType(""))
});
const cancelarAgendamentoClienteSchema = objectType({
  agendamentoId: stringType().trim().min(1, "Agendamento inválido."),
  motivoCancelamento: stringType().trim().max(500, "O motivo é muito grande.").optional().or(literalType(""))
});
const cancelarAgendamentoEquipeSchema = objectType({
  agendamentoId: stringType().trim().min(1, "Agendamento inválido."),
  motivoCancelamento: stringType().trim().max(500, "O motivo é muito grande.").optional().or(literalType(""))
});
const listarIndisponibilidadesAgendaSchema = objectType({
  profissionalId: stringType().trim().min(1, "Profissional inválido."),
  data: stringType().trim().min(1, "Data inválida.")
});
const concluirAgendamentoSchema = objectType({
  agendamentoId: stringType().trim().min(1, "Agendamento inválido."),
  formaPagamento: enumType(["PIX", "DINHEIRO", "CARTAO_DEBITO", "CARTAO_CREDITO", "ASSINATURA", "CORTESIA", "OUTRO"]),
  valorPagoCentavos: numberType().int("O valor precisa estar em centavos.").min(0, "O valor não pode ser negativo.").optional(),
  observacaoPagamento: stringType().trim().max(500, "A observação é muito grande.").optional().or(literalType(""))
});
const clienteCancelarAgendamento = createServerFn({
  method: "POST"
}).validator(cancelarAgendamentoClienteSchema).handler(createSsrRpc("54b9d6c4e78cdde1040dd786d1426c73cbd388e7818fab9e6e03b2954b0f59a8"));
const solicitarAgendamento = createServerFn({
  method: "POST"
}).validator(solicitarAgendamentoSchema).handler(createSsrRpc("33e1baa9becfda1aed7fa446a2c2156bddf2f478451e9c2be5d7c36d56705280"));
const funcionarioCancelarAgendamento = createServerFn({
  method: "POST"
}).validator(cancelarAgendamentoEquipeSchema).handler(createSsrRpc("f3afaaa43a4c5958bd175f73fc27a9466b1dd0873e68308b6867c584c1f5d619"));
const listarMeusAgendamentos = createServerFn({
  method: "GET"
}).handler(createSsrRpc("7c6043ea1b1a65f0a60cf9c13570dc698ea73d485c41e84caf6ca88a44dd6593"));
const funcionarioListarSolicitacoes = createServerFn({
  method: "GET"
}).handler(createSsrRpc("fa21e435155586f9baaebdd6a1b995977cd602043dba5712f11b8d54ed29008a"));
const funcionarioConfirmarAgendamento = createServerFn({
  method: "POST"
}).validator(alterarStatusSchema).handler(createSsrRpc("6e69d3d62ac519361169e7d548bfa960af78b451f060c3176a586699c0c0cd16"));
const funcionarioRecusarAgendamento = createServerFn({
  method: "POST"
}).validator(recusarAgendamentoSchema).handler(createSsrRpc("3c581b55b31ff6cc9ce3d06caef6fba5c0d51baff61cf3d6d3dc5211270a63f3"));
const funcionarioConcluirAgendamento = createServerFn({
  method: "POST"
}).validator(concluirAgendamentoSchema).handler(createSsrRpc("3b966bbc7a97b1493a192a849e3ab06860ed4ac2f2bc9ab6b7e0112d4f566047"));
const adminListarAgenda = createServerFn({
  method: "GET"
}).handler(createSsrRpc("b7774c684e8949e4ad5706454d448308ac44651daec84a5898c51433a055bc97"));
const listarIndisponibilidadesAgenda = createServerFn({
  method: "GET"
}).validator(listarIndisponibilidadesAgendaSchema).handler(createSsrRpc("f13d6399eab642541e5aa162f0da5b267f76c3da8ef06435e4a35f9b0359eb0c"));
createServerFn({
  method: "GET"
}).handler(createSsrRpc("475ca170db8c5b902e7cc99aefa67429c3d7eb628296d3286604499fe53283d5"));
export {
  funcionarioConfirmarAgendamento as a,
  funcionarioConcluirAgendamento as b,
  funcionarioRecusarAgendamento as c,
  funcionarioCancelarAgendamento as d,
  listarIndisponibilidadesAgenda as e,
  funcionarioListarSolicitacoes as f,
  clienteCancelarAgendamento as g,
  adminListarAgenda as h,
  listarMeusAgendamentos as l,
  solicitarAgendamento as s
};
