import { c as createServerRpc } from "./createServerRpc-CwtiRIfn.js";
import { c as createServerFn } from "./server-n3LmVJQm.js";
import { z } from "zod";
import { prisma } from "./prisma.server-DGhEAvkH.js";
import { obterUsuarioAtual } from "./session.server-Dmdt7VsU.js";
import "node:async_hooks";
import "h3-v2";
import "@tanstack/router-core";
import "seroval";
import "@tanstack/history";
import "@tanstack/router-core/ssr/client";
import "@tanstack/router-core/ssr/server";
import "react";
import "@tanstack/react-router";
import "react/jsx-runtime";
import "@tanstack/react-router/ssr/server";
import "dotenv/config";
import "@prisma/adapter-pg";
import "node:path";
import "node:url";
import "@prisma/client/runtime/client";
import "node:crypto";
async function exigirUsuarioLogado() {
  const usuario = await obterUsuarioAtual();
  if (!usuario) {
    throw new Error("Você precisa estar logado.");
  }
  return usuario;
}
async function exigirCliente() {
  const usuario = await exigirUsuarioLogado();
  if (usuario.papel !== "CLIENTE") {
    throw new Error("Apenas clientes podem solicitar agendamentos.");
  }
  return usuario;
}
async function exigirOperacional() {
  const usuario = await exigirUsuarioLogado();
  if (usuario.papel !== "FUNCIONARIO" && usuario.papel !== "DONO") {
    throw new Error("Acesso negado.");
  }
  return usuario;
}
async function exigirDono() {
  const usuario = await exigirUsuarioLogado();
  if (usuario.papel !== "DONO") {
    throw new Error("Acesso negado.");
  }
  return usuario;
}
const solicitarAgendamentoSchema = z.object({
  profissionalId: z.string().trim().min(1, "Escolha um profissional."),
  servicoId: z.string().trim().min(1, "Escolha um serviço."),
  inicio: z.string().trim().min(1, "Escolha uma data e horário."),
  observacaoCliente: z.string().trim().max(500, "A observação é muito grande.").optional().or(z.literal(""))
});
const alterarStatusSchema = z.object({
  agendamentoId: z.string().trim().min(1, "Agendamento inválido.")
});
const recusarAgendamentoSchema = z.object({
  agendamentoId: z.string().trim().min(1, "Agendamento inválido."),
  motivoRecusa: z.string().trim().max(500, "O motivo é muito grande.").optional().or(z.literal(""))
});
const cancelarAgendamentoClienteSchema = z.object({
  agendamentoId: z.string().trim().min(1, "Agendamento inválido."),
  motivoCancelamento: z.string().trim().max(500, "O motivo é muito grande.").optional().or(z.literal(""))
});
const cancelarAgendamentoEquipeSchema = z.object({
  agendamentoId: z.string().trim().min(1, "Agendamento inválido."),
  motivoCancelamento: z.string().trim().max(500, "O motivo é muito grande.").optional().or(z.literal(""))
});
const listarIndisponibilidadesAgendaSchema = z.object({
  profissionalId: z.string().trim().min(1, "Profissional inválido."),
  data: z.string().trim().min(1, "Data inválida.")
});
const concluirAgendamentoSchema = z.object({
  agendamentoId: z.string().trim().min(1, "Agendamento inválido."),
  formaPagamento: z.enum(["PIX", "DINHEIRO", "CARTAO_DEBITO", "CARTAO_CREDITO", "ASSINATURA", "CORTESIA", "OUTRO"]),
  valorPagoCentavos: z.number().int("O valor precisa estar em centavos.").min(0, "O valor não pode ser negativo.").optional(),
  observacaoPagamento: z.string().trim().max(500, "A observação é muito grande.").optional().or(z.literal(""))
});
function converterData(valor) {
  const data = new Date(valor);
  if (Number.isNaN(data.getTime())) {
    return null;
  }
  return data;
}
function calcularFim(inicio, duracaoMinutos) {
  return new Date(inicio.getTime() + duracaoMinutos * 60 * 1e3);
}
async function existeConflitoDeHorario({
  profissionalId,
  inicio,
  fim,
  ignorarAgendamentoId
}) {
  const conflito = await prisma.agendamento.findFirst({
    where: {
      profissionalId,
      id: ignorarAgendamentoId ? {
        not: ignorarAgendamentoId
      } : void 0,
      status: {
        in: ["SOLICITADO", "CONFIRMADO"]
      },
      inicio: {
        lt: fim
      },
      fim: {
        gt: inicio
      }
    },
    select: {
      id: true
    }
  });
  return Boolean(conflito);
}
const clienteCancelarAgendamento_createServerFn_handler = createServerRpc({
  id: "54b9d6c4e78cdde1040dd786d1426c73cbd388e7818fab9e6e03b2954b0f59a8",
  name: "clienteCancelarAgendamento",
  filename: "src/lib/api/agendamento.functions.ts"
}, (opts) => clienteCancelarAgendamento.__executeServer(opts));
const clienteCancelarAgendamento = createServerFn({
  method: "POST"
}).validator(cancelarAgendamentoClienteSchema).handler(clienteCancelarAgendamento_createServerFn_handler, async ({
  data
}) => {
  const usuario = await exigirCliente();
  const agendamento = await prisma.agendamento.findFirst({
    where: {
      id: data.agendamentoId,
      clienteId: usuario.id
    },
    select: {
      id: true,
      status: true,
      inicio: true
    }
  });
  if (!agendamento) {
    return {
      sucesso: false,
      mensagem: "Agendamento não encontrado."
    };
  }
  if (agendamento.status !== "SOLICITADO" && agendamento.status !== "CONFIRMADO") {
    return {
      sucesso: false,
      mensagem: "Apenas agendamentos solicitados ou confirmados podem ser cancelados."
    };
  }
  if (agendamento.inicio <= /* @__PURE__ */ new Date()) {
    return {
      sucesso: false,
      mensagem: "Não é possível cancelar um agendamento que já passou."
    };
  }
  z.object({
    agendamentoId: z.string().trim().min(1, "Agendamento inválido."),
    motivoCancelamento: z.string().trim().max(500, "O motivo é muito grande.").optional().or(z.literal(""))
  });
  z.object({
    profissionalId: z.string().trim().min(1, "Profissional inválido."),
    data: z.string().trim().min(1, "Data inválida.")
  });
  const agendamentoAtualizado = await prisma.agendamento.update({
    where: {
      id: agendamento.id
    },
    data: {
      status: "CANCELADO_CLIENTE",
      motivoCancelamento: data.motivoCancelamento?.trim() || null,
      canceladoEm: /* @__PURE__ */ new Date()
    },
    select: {
      id: true,
      status: true,
      motivoCancelamento: true,
      canceladoEm: true
    }
  });
  return {
    sucesso: true,
    mensagem: "Agendamento cancelado com sucesso.",
    agendamento: agendamentoAtualizado
  };
});
const solicitarAgendamento_createServerFn_handler = createServerRpc({
  id: "33e1baa9becfda1aed7fa446a2c2156bddf2f478451e9c2be5d7c36d56705280",
  name: "solicitarAgendamento",
  filename: "src/lib/api/agendamento.functions.ts"
}, (opts) => solicitarAgendamento.__executeServer(opts));
const solicitarAgendamento = createServerFn({
  method: "POST"
}).validator(solicitarAgendamentoSchema).handler(solicitarAgendamento_createServerFn_handler, async ({
  data
}) => {
  const usuario = await exigirCliente();
  const inicio = converterData(data.inicio);
  if (!inicio) {
    return {
      sucesso: false,
      mensagem: "Data ou horário inválido."
    };
  }
  const agora = /* @__PURE__ */ new Date();
  if (inicio.getTime() <= agora.getTime()) {
    return {
      sucesso: false,
      mensagem: "Escolha um horário futuro."
    };
  }
  const [servico, profissional] = await Promise.all([prisma.servico.findFirst({
    where: {
      id: data.servicoId,
      ativo: true
    },
    select: {
      id: true,
      nome: true,
      duracaoMinutos: true,
      precoCentavos: true
    }
  }), prisma.profissional.findFirst({
    where: {
      id: data.profissionalId,
      ativo: true
    },
    select: {
      id: true,
      nome: true
    }
  })]);
  if (!servico) {
    return {
      sucesso: false,
      mensagem: "Serviço não encontrado ou inativo."
    };
  }
  if (!profissional) {
    return {
      sucesso: false,
      mensagem: "Profissional não encontrado ou inativo."
    };
  }
  const fim = calcularFim(inicio, servico.duracaoMinutos);
  const profissionalOcupado = await existeConflitoDeHorario({
    profissionalId: profissional.id,
    inicio,
    fim
  });
  if (profissionalOcupado) {
    return {
      sucesso: false,
      mensagem: "Esse profissional já possui uma solicitação ou agendamento nesse horário."
    };
  }
  const clienteOcupado = await prisma.agendamento.findFirst({
    where: {
      clienteId: usuario.id,
      status: {
        in: ["SOLICITADO", "CONFIRMADO"]
      },
      inicio: {
        lt: fim
      },
      fim: {
        gt: inicio
      }
    },
    select: {
      id: true
    }
  });
  if (clienteOcupado) {
    return {
      sucesso: false,
      mensagem: "Você já possui uma solicitação ou agendamento nesse horário."
    };
  }
  const agendamento = await prisma.agendamento.create({
    data: {
      clienteId: usuario.id,
      profissionalId: profissional.id,
      servicoId: servico.id,
      inicio,
      fim,
      status: "SOLICITADO",
      observacaoCliente: data.observacaoCliente?.trim() || null
    },
    select: {
      id: true,
      inicio: true,
      fim: true,
      status: true,
      servico: {
        select: {
          nome: true,
          duracaoMinutos: true,
          precoCentavos: true
        }
      },
      profissional: {
        select: {
          nome: true
        }
      }
    }
  });
  return {
    sucesso: true,
    mensagem: "Solicitação enviada com sucesso. Aguarde a confirmação da equipe.",
    agendamento
  };
});
const funcionarioCancelarAgendamento_createServerFn_handler = createServerRpc({
  id: "f3afaaa43a4c5958bd175f73fc27a9466b1dd0873e68308b6867c584c1f5d619",
  name: "funcionarioCancelarAgendamento",
  filename: "src/lib/api/agendamento.functions.ts"
}, (opts) => funcionarioCancelarAgendamento.__executeServer(opts));
const funcionarioCancelarAgendamento = createServerFn({
  method: "POST"
}).validator(cancelarAgendamentoEquipeSchema).handler(funcionarioCancelarAgendamento_createServerFn_handler, async ({
  data
}) => {
  await exigirOperacional();
  const agendamento = await prisma.agendamento.findUnique({
    where: {
      id: data.agendamentoId
    },
    select: {
      id: true,
      status: true,
      inicio: true
    }
  });
  if (!agendamento) {
    return {
      sucesso: false,
      mensagem: "Agendamento não encontrado."
    };
  }
  if (agendamento.status !== "CONFIRMADO") {
    return {
      sucesso: false,
      mensagem: "Apenas agendamentos confirmados podem ser cancelados pela equipe."
    };
  }
  if (agendamento.inicio <= /* @__PURE__ */ new Date()) {
    return {
      sucesso: false,
      mensagem: "Não é possível cancelar um agendamento que já passou."
    };
  }
  const agendamentoAtualizado = await prisma.agendamento.update({
    where: {
      id: agendamento.id
    },
    data: {
      status: "CANCELADO_FUNCIONARIO",
      motivoCancelamento: data.motivoCancelamento?.trim() || null,
      canceladoEm: /* @__PURE__ */ new Date()
    },
    select: {
      id: true,
      status: true,
      motivoCancelamento: true,
      canceladoEm: true
    }
  });
  return {
    sucesso: true,
    mensagem: "Agendamento cancelado pela equipe.",
    agendamento: agendamentoAtualizado
  };
});
const listarMeusAgendamentos_createServerFn_handler = createServerRpc({
  id: "7c6043ea1b1a65f0a60cf9c13570dc698ea73d485c41e84caf6ca88a44dd6593",
  name: "listarMeusAgendamentos",
  filename: "src/lib/api/agendamento.functions.ts"
}, (opts) => listarMeusAgendamentos.__executeServer(opts));
const listarMeusAgendamentos = createServerFn({
  method: "GET"
}).handler(listarMeusAgendamentos_createServerFn_handler, async () => {
  const usuario = await exigirCliente();
  return prisma.agendamento.findMany({
    where: {
      clienteId: usuario.id
    },
    orderBy: {
      inicio: "desc"
    },
    select: {
      id: true,
      inicio: true,
      fim: true,
      status: true,
      observacaoCliente: true,
      motivoRecusa: true,
      motivoCancelamento: true,
      canceladoEm: true,
      criadoEm: true,
      atualizadoEm: true,
      profissional: {
        select: {
          id: true,
          nome: true
        }
      },
      servico: {
        select: {
          id: true,
          nome: true,
          duracaoMinutos: true,
          precoCentavos: true
        }
      }
    }
  });
});
const funcionarioListarSolicitacoes_createServerFn_handler = createServerRpc({
  id: "fa21e435155586f9baaebdd6a1b995977cd602043dba5712f11b8d54ed29008a",
  name: "funcionarioListarSolicitacoes",
  filename: "src/lib/api/agendamento.functions.ts"
}, (opts) => funcionarioListarSolicitacoes.__executeServer(opts));
const funcionarioListarSolicitacoes = createServerFn({
  method: "GET"
}).handler(funcionarioListarSolicitacoes_createServerFn_handler, async () => {
  await exigirOperacional();
  return prisma.agendamento.findMany({
    where: {
      status: {
        in: ["SOLICITADO", "CONFIRMADO"]
      }
    },
    orderBy: {
      inicio: "asc"
    },
    select: {
      id: true,
      inicio: true,
      fim: true,
      status: true,
      observacaoCliente: true,
      cliente: {
        select: {
          id: true,
          nome: true,
          email: true,
          telefone: true
        }
      },
      servico: {
        select: {
          nome: true,
          duracaoMinutos: true,
          precoCentavos: true
        }
      },
      profissional: {
        select: {
          id: true,
          nome: true
        }
      }
    }
  });
});
const funcionarioConfirmarAgendamento_createServerFn_handler = createServerRpc({
  id: "6e69d3d62ac519361169e7d548bfa960af78b451f060c3176a586699c0c0cd16",
  name: "funcionarioConfirmarAgendamento",
  filename: "src/lib/api/agendamento.functions.ts"
}, (opts) => funcionarioConfirmarAgendamento.__executeServer(opts));
const funcionarioConfirmarAgendamento = createServerFn({
  method: "POST"
}).validator(alterarStatusSchema).handler(funcionarioConfirmarAgendamento_createServerFn_handler, async ({
  data
}) => {
  await exigirOperacional();
  const agendamento = await prisma.agendamento.findUnique({
    where: {
      id: data.agendamentoId
    },
    select: {
      id: true,
      profissionalId: true,
      inicio: true,
      fim: true,
      status: true
    }
  });
  if (!agendamento) {
    return {
      sucesso: false,
      mensagem: "Agendamento não encontrado."
    };
  }
  if (agendamento.status !== "SOLICITADO") {
    return {
      sucesso: false,
      mensagem: "Apenas solicitações pendentes podem ser confirmadas."
    };
  }
  const conflito = await existeConflitoDeHorario({
    profissionalId: agendamento.profissionalId,
    inicio: agendamento.inicio,
    fim: agendamento.fim,
    ignorarAgendamentoId: agendamento.id
  });
  if (conflito) {
    return {
      sucesso: false,
      mensagem: "Existe outro agendamento ou solicitação ocupando esse horário."
    };
  }
  const agendamentoAtualizado = await prisma.agendamento.update({
    where: {
      id: agendamento.id
    },
    data: {
      status: "CONFIRMADO",
      motivoRecusa: null
    },
    select: {
      id: true,
      status: true,
      inicio: true,
      fim: true
    }
  });
  return {
    sucesso: true,
    mensagem: "Agendamento confirmado com sucesso.",
    agendamento: agendamentoAtualizado
  };
});
const funcionarioRecusarAgendamento_createServerFn_handler = createServerRpc({
  id: "3c581b55b31ff6cc9ce3d06caef6fba5c0d51baff61cf3d6d3dc5211270a63f3",
  name: "funcionarioRecusarAgendamento",
  filename: "src/lib/api/agendamento.functions.ts"
}, (opts) => funcionarioRecusarAgendamento.__executeServer(opts));
const funcionarioRecusarAgendamento = createServerFn({
  method: "POST"
}).validator(recusarAgendamentoSchema).handler(funcionarioRecusarAgendamento_createServerFn_handler, async ({
  data
}) => {
  await exigirOperacional();
  const agendamento = await prisma.agendamento.findUnique({
    where: {
      id: data.agendamentoId
    },
    select: {
      id: true,
      status: true
    }
  });
  if (!agendamento) {
    return {
      sucesso: false,
      mensagem: "Agendamento não encontrado."
    };
  }
  if (agendamento.status !== "SOLICITADO") {
    return {
      sucesso: false,
      mensagem: "Apenas solicitações pendentes podem ser recusadas."
    };
  }
  const agendamentoAtualizado = await prisma.agendamento.update({
    where: {
      id: agendamento.id
    },
    data: {
      status: "RECUSADO",
      motivoRecusa: data.motivoRecusa?.trim() || null
    },
    select: {
      id: true,
      status: true,
      motivoRecusa: true
    }
  });
  return {
    sucesso: true,
    mensagem: "Solicitação recusada.",
    agendamento: agendamentoAtualizado
  };
});
const funcionarioConcluirAgendamento_createServerFn_handler = createServerRpc({
  id: "3b966bbc7a97b1493a192a849e3ab06860ed4ac2f2bc9ab6b7e0112d4f566047",
  name: "funcionarioConcluirAgendamento",
  filename: "src/lib/api/agendamento.functions.ts"
}, (opts) => funcionarioConcluirAgendamento.__executeServer(opts));
const funcionarioConcluirAgendamento = createServerFn({
  method: "POST"
}).validator(concluirAgendamentoSchema).handler(funcionarioConcluirAgendamento_createServerFn_handler, async ({
  data
}) => {
  await exigirOperacional();
  const agendamento = await prisma.agendamento.findUnique({
    where: {
      id: data.agendamentoId
    },
    select: {
      id: true,
      clienteId: true,
      status: true,
      usoAssinatura: {
        select: {
          id: true
        }
      },
      servico: {
        select: {
          id: true,
          nome: true,
          precoCentavos: true
        }
      }
    }
  });
  if (!agendamento) {
    return {
      sucesso: false,
      mensagem: "Agendamento não encontrado."
    };
  }
  if (agendamento.status !== "CONFIRMADO") {
    return {
      sucesso: false,
      mensagem: "Apenas agendamentos confirmados podem ser concluídos."
    };
  }
  if (agendamento.usoAssinatura) {
    return {
      sucesso: false,
      mensagem: "Esse agendamento já possui uso de assinatura registrado."
    };
  }
  const formaPagamento = data.formaPagamento;
  if (formaPagamento === "ASSINATURA") {
    const agora = /* @__PURE__ */ new Date();
    const assinatura = await prisma.assinaturaCliente.findFirst({
      where: {
        clienteId: agendamento.clienteId,
        status: "ATIVA",
        vigenciaInicio: {
          lte: agora
        },
        vigenciaFim: {
          gte: agora
        },
        saldoCortes: {
          gt: 0
        }
      },
      orderBy: {
        criadoEm: "desc"
      },
      select: {
        id: true,
        saldoCortes: true,
        plano: {
          select: {
            nome: true
          }
        }
      }
    });
    if (!assinatura) {
      return {
        sucesso: false,
        mensagem: "Este cliente não possui assinatura ativa com saldo disponível."
      };
    }
    const agendamentoAtualizado2 = await prisma.$transaction(async (tx) => {
      await tx.assinaturaCliente.update({
        where: {
          id: assinatura.id
        },
        data: {
          saldoCortes: {
            decrement: 1
          }
        }
      });
      await tx.usoAssinatura.create({
        data: {
          assinaturaId: assinatura.id,
          agendamentoId: agendamento.id,
          quantidadeCortes: 1
        }
      });
      return tx.agendamento.update({
        where: {
          id: agendamento.id
        },
        data: {
          status: "CONCLUIDO",
          formaPagamento: "ASSINATURA",
          valorPagoCentavos: 0,
          pagoEm: /* @__PURE__ */ new Date(),
          observacaoPagamento: data.observacaoPagamento?.trim() || `Atendimento descontado da assinatura ${assinatura.plano.nome}.`
        },
        select: {
          id: true,
          status: true,
          formaPagamento: true,
          valorPagoCentavos: true,
          pagoEm: true
        }
      });
    });
    return {
      sucesso: true,
      mensagem: "Atendimento concluído e 1 corte foi descontado da assinatura.",
      agendamento: agendamentoAtualizado2
    };
  }
  const valorPagoCentavos = data.valorPagoCentavos ?? agendamento.servico.precoCentavos;
  const agendamentoAtualizado = await prisma.agendamento.update({
    where: {
      id: agendamento.id
    },
    data: {
      status: "CONCLUIDO",
      formaPagamento,
      valorPagoCentavos,
      pagoEm: /* @__PURE__ */ new Date(),
      observacaoPagamento: data.observacaoPagamento?.trim() || null
    },
    select: {
      id: true,
      status: true,
      formaPagamento: true,
      valorPagoCentavos: true,
      pagoEm: true
    }
  });
  return {
    sucesso: true,
    mensagem: "Atendimento concluído com sucesso.",
    agendamento: agendamentoAtualizado
  };
});
const adminListarAgenda_createServerFn_handler = createServerRpc({
  id: "b7774c684e8949e4ad5706454d448308ac44651daec84a5898c51433a055bc97",
  name: "adminListarAgenda",
  filename: "src/lib/api/agendamento.functions.ts"
}, (opts) => adminListarAgenda.__executeServer(opts));
const adminListarAgenda = createServerFn({
  method: "GET"
}).handler(adminListarAgenda_createServerFn_handler, async () => {
  await exigirDono();
  return prisma.agendamento.findMany({
    orderBy: {
      inicio: "desc"
    },
    select: {
      id: true,
      inicio: true,
      fim: true,
      status: true,
      observacaoCliente: true,
      motivoRecusa: true,
      criadoEm: true,
      atualizadoEm: true,
      formaPagamento: true,
      valorPagoCentavos: true,
      pagoEm: true,
      observacaoPagamento: true,
      motivoCancelamento: true,
      canceladoEm: true,
      cliente: {
        select: {
          id: true,
          nome: true,
          email: true,
          telefone: true
        }
      },
      profissional: {
        select: {
          id: true,
          nome: true
        }
      },
      servico: {
        select: {
          id: true,
          nome: true,
          duracaoMinutos: true,
          precoCentavos: true
        }
      }
    }
  });
});
const listarIndisponibilidadesAgenda_createServerFn_handler = createServerRpc({
  id: "f13d6399eab642541e5aa162f0da5b267f76c3da8ef06435e4a35f9b0359eb0c",
  name: "listarIndisponibilidadesAgenda",
  filename: "src/lib/api/agendamento.functions.ts"
}, (opts) => listarIndisponibilidadesAgenda.__executeServer(opts));
const listarIndisponibilidadesAgenda = createServerFn({
  method: "GET"
}).validator(listarIndisponibilidadesAgendaSchema).handler(listarIndisponibilidadesAgenda_createServerFn_handler, async ({
  data
}) => {
  await exigirCliente();
  const inicioDia = /* @__PURE__ */ new Date(`${data.data}T00:00:00`);
  const fimDia = /* @__PURE__ */ new Date(`${data.data}T23:59:59.999`);
  if (Number.isNaN(inicioDia.getTime()) || Number.isNaN(fimDia.getTime())) {
    return {
      sucesso: false,
      mensagem: "Data inválida.",
      intervalos: []
    };
  }
  const [agendamentos, bloqueios] = await Promise.all([prisma.agendamento.findMany({
    where: {
      profissionalId: data.profissionalId,
      status: {
        in: ["SOLICITADO", "CONFIRMADO"]
      },
      inicio: {
        lt: fimDia
      },
      fim: {
        gt: inicioDia
      }
    },
    select: {
      id: true,
      inicio: true,
      fim: true,
      status: true
    }
  }), prisma.bloqueioAgenda.findMany({
    where: {
      ativo: true,
      inicio: {
        lt: fimDia
      },
      fim: {
        gt: inicioDia
      },
      OR: [{
        profissionalId: null
      }, {
        profissionalId: data.profissionalId
      }]
    },
    select: {
      id: true,
      inicio: true,
      fim: true,
      motivo: true,
      profissionalId: true
    }
  })]);
  const intervalos = [...agendamentos.map((agendamento) => ({
    id: agendamento.id,
    tipo: "AGENDAMENTO",
    inicio: agendamento.inicio,
    fim: agendamento.fim,
    motivo: agendamento.status
  })), ...bloqueios.map((bloqueio) => ({
    id: bloqueio.id,
    tipo: "BLOQUEIO",
    inicio: bloqueio.inicio,
    fim: bloqueio.fim,
    motivo: bloqueio.motivo || "Horário bloqueado pela barbearia."
  }))];
  return {
    sucesso: true,
    mensagem: "Indisponibilidades carregadas.",
    intervalos
  };
});
const adminListarPagamentosAssinatura_createServerFn_handler = createServerRpc({
  id: "475ca170db8c5b902e7cc99aefa67429c3d7eb628296d3286604499fe53283d5",
  name: "adminListarPagamentosAssinatura",
  filename: "src/lib/api/agendamento.functions.ts"
}, (opts) => adminListarPagamentosAssinatura.__executeServer(opts));
const adminListarPagamentosAssinatura = createServerFn({
  method: "GET"
}).handler(adminListarPagamentosAssinatura_createServerFn_handler, async () => {
  await exigirDono();
  return prisma.pagamentoAssinatura.findMany({
    orderBy: {
      pagoEm: "desc"
    },
    select: {
      id: true,
      formaPagamento: true,
      valorCentavos: true,
      pagoEm: true,
      observacao: true,
      assinatura: {
        select: {
          id: true,
          status: true,
          cliente: {
            select: {
              id: true,
              nome: true,
              email: true,
              telefone: true
            }
          },
          plano: {
            select: {
              id: true,
              nome: true,
              precoCentavos: true
            }
          }
        }
      }
    }
  });
});
export {
  adminListarAgenda_createServerFn_handler,
  adminListarPagamentosAssinatura_createServerFn_handler,
  clienteCancelarAgendamento_createServerFn_handler,
  funcionarioCancelarAgendamento_createServerFn_handler,
  funcionarioConcluirAgendamento_createServerFn_handler,
  funcionarioConfirmarAgendamento_createServerFn_handler,
  funcionarioListarSolicitacoes_createServerFn_handler,
  funcionarioRecusarAgendamento_createServerFn_handler,
  listarIndisponibilidadesAgenda_createServerFn_handler,
  listarMeusAgendamentos_createServerFn_handler,
  solicitarAgendamento_createServerFn_handler
};
