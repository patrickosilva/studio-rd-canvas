import { c as createServerRpc } from "./createServerRpc-BaohzIh1.mjs";
import { c as createServerFn } from "./server-BeKYjhVv.mjs";
import { prisma } from "./prisma.server-DGhEAvkH.mjs";
import { obterUsuarioAtual } from "./session.server-DqLwM1tR.mjs";
import "../_libs/seroval.mjs";
import "../_libs/react.mjs";
import "../_libs/dotenv.mjs";
import { o as objectType, b as booleanType, n as numberType, s as stringType, l as literalType, e as enumType } from "../_libs/zod.mjs";
import "node:async_hooks";
import "../_libs/h3-v2.mjs";
import "../_libs/rou3.mjs";
import "../_libs/srvx.mjs";
import "node:http";
import "node:stream";
import "node:stream/promises";
import "node:https";
import "node:http2";
import "../_libs/tanstack__router-core.mjs";
import "../_libs/tanstack__history.mjs";
import "../_libs/cookie-es.mjs";
import "../_libs/seroval-plugins.mjs";
import "node:stream/web";
import "../_libs/tanstack__react-router.mjs";
import "../_libs/react-dom.mjs";
import "util";
import "async_hooks";
import "stream";
import "crypto";
import "../_libs/isbot.mjs";
import "../_libs/prisma__adapter-pg.mjs";
import "../_libs/prisma__driver-adapter-utils.mjs";
import "../_libs/prisma__debug.mjs";
import "../_libs/pg.mjs";
import "events";
import "util/types";
import "dns";
import "net";
import "tls";
import "../_libs/pg-types.mjs";
import "../_libs/postgres-array.mjs";
import "../_libs/postgres-date.mjs";
import "../_libs/postgres-interval.mjs";
import "../_libs/xtend.mjs";
import "../_libs/postgres-bytea.mjs";
import "../_libs/pg-int8.mjs";
import "../_libs/pg-connection-string.mjs";
import "fs";
import "../_libs/pg-protocol.mjs";
import "../_libs/pg-cloudflare.mjs";
import "../_libs/pgpass.mjs";
import "path";
import "../_libs/split2.mjs";
import "string_decoder";
import "../_libs/pg-pool.mjs";
import "node:path";
import "node:url";
import "@prisma/client/runtime/client";
import "node:crypto";
import "os";
const formasPagamento = ["PIX", "DINHEIRO", "CARTAO_DEBITO", "CARTAO_CREDITO", "ASSINATURA", "CORTESIA", "OUTRO"];
const criarPlanoAssinaturaSchema = objectType({
  nome: stringType().trim().min(2, "Informe o nome do plano.").max(80, "O nome do plano é muito grande."),
  descricao: stringType().trim().max(500, "A descrição é muito grande.").optional().or(literalType("")),
  precoCentavos: numberType().int("O preço precisa estar em centavos.").min(0, "O preço não pode ser negativo."),
  cortesPorCiclo: numberType().int("A quantidade de cortes precisa ser inteira.").min(1, "Informe pelo menos 1 corte."),
  duracaoDias: numberType().int("A duração precisa ser em dias.").min(1, "A duração precisa ter pelo menos 1 dia.").max(365, "A duração não pode passar de 365 dias."),
  ativo: booleanType().default(true)
});
const ativarAssinaturaClienteSchema = objectType({
  clienteId: stringType().trim().min(1, "Cliente inválido."),
  planoId: stringType().trim().min(1, "Plano inválido."),
  vigenciaInicio: stringType().trim().optional().or(literalType("")),
  formaPagamento: enumType(formasPagamento).optional(),
  valorPagoCentavos: numberType().int("O valor precisa estar em centavos.").min(0, "O valor não pode ser negativo.").optional(),
  observacao: stringType().trim().max(500, "A observação é muito grande.").optional().or(literalType(""))
});
const cancelarAssinaturaClienteSchema = objectType({
  assinaturaId: stringType().trim().min(1, "Assinatura inválida."),
  observacao: stringType().trim().max(500, "A observação é muito grande.").optional().or(literalType(""))
});
async function exigirDono() {
  const usuario = await obterUsuarioAtual();
  if (!usuario) {
    throw new Error("Você precisa estar logado.");
  }
  if (usuario.papel !== "DONO") {
    throw new Error("Acesso negado.");
  }
  return usuario;
}
async function exigirCliente() {
  const usuario = await obterUsuarioAtual();
  if (!usuario) {
    throw new Error("Você precisa estar logado.");
  }
  if (usuario.papel !== "CLIENTE") {
    throw new Error("Acesso negado.");
  }
  return usuario;
}
function adicionarDias(data, dias) {
  const resultado = new Date(data);
  resultado.setDate(resultado.getDate() + dias);
  return resultado;
}
const adminListarPlanosAssinatura_createServerFn_handler = createServerRpc({
  id: "0e9747a21b38d6cdadcf45c1fc58bad3883e66e28220894eb630d10eabce8e90",
  name: "adminListarPlanosAssinatura",
  filename: "src/lib/api/assinatura.functions.ts"
}, (opts) => adminListarPlanosAssinatura.__executeServer(opts));
const adminListarPlanosAssinatura = createServerFn({
  method: "GET"
}).handler(adminListarPlanosAssinatura_createServerFn_handler, async () => {
  await exigirDono();
  return prisma.planoAssinatura.findMany({
    where: {
      ativo: true
    },
    orderBy: {
      criadoEm: "desc"
    },
    select: {
      id: true,
      nome: true,
      descricao: true,
      precoCentavos: true,
      cortesPorCiclo: true,
      duracaoDias: true,
      ativo: true,
      criadoEm: true,
      atualizadoEm: true
    }
  });
});
const adminCriarPlanoAssinatura_createServerFn_handler = createServerRpc({
  id: "7223ac46ebbeafaccff956bd870b73b225bae09e48ec4d40581f6a96f28aa18e",
  name: "adminCriarPlanoAssinatura",
  filename: "src/lib/api/assinatura.functions.ts"
}, (opts) => adminCriarPlanoAssinatura.__executeServer(opts));
const adminCriarPlanoAssinatura = createServerFn({
  method: "POST"
}).validator(criarPlanoAssinaturaSchema).handler(adminCriarPlanoAssinatura_createServerFn_handler, async ({
  data
}) => {
  await exigirDono();
  const planoExistente = await prisma.planoAssinatura.findFirst({
    where: {
      nome: {
        equals: data.nome,
        mode: "insensitive"
      }
    },
    select: {
      id: true,
      nome: true,
      ativo: true
    }
  });
  if (planoExistente?.ativo) {
    return {
      sucesso: false,
      mensagem: "Já existe um plano ativo com esse nome."
    };
  }
  if (planoExistente && !planoExistente.ativo) {
    const planoReativado = await prisma.planoAssinatura.update({
      where: {
        id: planoExistente.id
      },
      data: {
        nome: data.nome,
        descricao: data.descricao?.trim() || null,
        precoCentavos: data.precoCentavos,
        cortesPorCiclo: data.cortesPorCiclo,
        duracaoDias: data.duracaoDias,
        ativo: true
      },
      select: {
        id: true,
        nome: true,
        descricao: true,
        precoCentavos: true,
        cortesPorCiclo: true,
        duracaoDias: true,
        ativo: true,
        criadoEm: true,
        atualizadoEm: true
      }
    });
    return {
      sucesso: true,
      mensagem: `Plano "${data.nome}" foi reativado com sucesso.`,
      plano: planoReativado
    };
  }
  const plano = await prisma.planoAssinatura.create({
    data: {
      nome: data.nome,
      descricao: data.descricao?.trim() || null,
      precoCentavos: data.precoCentavos,
      cortesPorCiclo: data.cortesPorCiclo,
      duracaoDias: data.duracaoDias,
      ativo: data.ativo
    },
    select: {
      id: true,
      nome: true,
      descricao: true,
      precoCentavos: true,
      cortesPorCiclo: true,
      duracaoDias: true,
      ativo: true,
      criadoEm: true,
      atualizadoEm: true
    }
  });
  return {
    sucesso: true,
    mensagem: "Plano de assinatura criado com sucesso.",
    plano
  };
});
const adminListarClientesParaAssinatura_createServerFn_handler = createServerRpc({
  id: "d2f95a13f200400331cd962899742ad94aa73572aceb997f4369fa33350de4f7",
  name: "adminListarClientesParaAssinatura",
  filename: "src/lib/api/assinatura.functions.ts"
}, (opts) => adminListarClientesParaAssinatura.__executeServer(opts));
const adminListarClientesParaAssinatura = createServerFn({
  method: "GET"
}).handler(adminListarClientesParaAssinatura_createServerFn_handler, async () => {
  await exigirDono();
  return prisma.usuario.findMany({
    where: {
      papel: "CLIENTE",
      assinaturas: {
        none: {
          status: "ATIVA",
          vigenciaFim: {
            gte: /* @__PURE__ */ new Date()
          }
        }
      }
    },
    orderBy: {
      nome: "asc"
    },
    select: {
      id: true,
      nome: true,
      email: true,
      telefone: true
    }
  });
});
const adminListarAssinaturas_createServerFn_handler = createServerRpc({
  id: "f77b1f7b4e34c18f6d82b68f42a323e40a6a2a31f4094e179287026761462c7e",
  name: "adminListarAssinaturas",
  filename: "src/lib/api/assinatura.functions.ts"
}, (opts) => adminListarAssinaturas.__executeServer(opts));
const adminListarAssinaturas = createServerFn({
  method: "GET"
}).handler(adminListarAssinaturas_createServerFn_handler, async () => {
  await exigirDono();
  return prisma.assinaturaCliente.findMany({
    where: {
      status: "ATIVA",
      vigenciaFim: {
        gte: /* @__PURE__ */ new Date()
      }
    },
    orderBy: {
      criadoEm: "desc"
    },
    select: {
      id: true,
      status: true,
      inicio: true,
      vigenciaInicio: true,
      vigenciaFim: true,
      saldoCortes: true,
      renovaAutomaticamente: true,
      observacao: true,
      criadoEm: true,
      atualizadoEm: true,
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
          precoCentavos: true,
          cortesPorCiclo: true,
          duracaoDias: true
        }
      },
      usos: {
        select: {
          id: true,
          quantidadeCortes: true,
          criadoEm: true,
          agendamento: {
            select: {
              id: true,
              inicio: true,
              status: true,
              servico: {
                select: {
                  nome: true
                }
              }
            }
          }
        },
        orderBy: {
          criadoEm: "desc"
        }
      },
      pagamentos: {
        select: {
          id: true,
          formaPagamento: true,
          valorCentavos: true,
          pagoEm: true,
          observacao: true
        },
        orderBy: {
          pagoEm: "desc"
        }
      }
    }
  });
});
const adminAtivarAssinaturaCliente_createServerFn_handler = createServerRpc({
  id: "a3adf929c7fd63bb1d2ef7b40cccee4f510bd1dc224a9c2beeea97d802839315",
  name: "adminAtivarAssinaturaCliente",
  filename: "src/lib/api/assinatura.functions.ts"
}, (opts) => adminAtivarAssinaturaCliente.__executeServer(opts));
const adminAtivarAssinaturaCliente = createServerFn({
  method: "POST"
}).validator(ativarAssinaturaClienteSchema).handler(adminAtivarAssinaturaCliente_createServerFn_handler, async ({
  data
}) => {
  await exigirDono();
  const cliente = await prisma.usuario.findFirst({
    where: {
      id: data.clienteId,
      papel: "CLIENTE",
      ativo: true
    },
    select: {
      id: true,
      nome: true
    }
  });
  if (!cliente) {
    return {
      sucesso: false,
      mensagem: "Cliente não encontrado ou inativo."
    };
  }
  const plano = await prisma.planoAssinatura.findFirst({
    where: {
      id: data.planoId,
      ativo: true
    },
    select: {
      id: true,
      nome: true,
      precoCentavos: true,
      cortesPorCiclo: true,
      duracaoDias: true
    }
  });
  if (!plano) {
    return {
      sucesso: false,
      mensagem: "Plano não encontrado ou inativo."
    };
  }
  const agora = /* @__PURE__ */ new Date();
  const assinaturaAtiva = await prisma.assinaturaCliente.findFirst({
    where: {
      clienteId: cliente.id,
      status: "ATIVA",
      vigenciaFim: {
        gte: agora
      }
    },
    select: {
      id: true
    }
  });
  if (assinaturaAtiva) {
    return {
      sucesso: false,
      mensagem: "Esse cliente já possui uma assinatura ativa."
    };
  }
  const vigenciaInicio = data.vigenciaInicio?.trim() ? new Date(data.vigenciaInicio) : agora;
  if (Number.isNaN(vigenciaInicio.getTime())) {
    return {
      sucesso: false,
      mensagem: "Data de início inválida."
    };
  }
  const vigenciaFim = adicionarDias(vigenciaInicio, plano.duracaoDias);
  const formaPagamento = data.formaPagamento;
  const valorPagoCentavos = data.valorPagoCentavos ?? plano.precoCentavos;
  const assinatura = await prisma.$transaction(async (tx) => {
    const assinaturaCriada = await tx.assinaturaCliente.create({
      data: {
        clienteId: cliente.id,
        planoId: plano.id,
        status: "ATIVA",
        inicio: vigenciaInicio,
        vigenciaInicio,
        vigenciaFim,
        saldoCortes: plano.cortesPorCiclo,
        observacao: data.observacao?.trim() || null
      },
      select: {
        id: true,
        status: true,
        inicio: true,
        vigenciaInicio: true,
        vigenciaFim: true,
        saldoCortes: true,
        observacao: true,
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
            precoCentavos: true,
            cortesPorCiclo: true,
            duracaoDias: true
          }
        }
      }
    });
    if (formaPagamento) {
      await tx.pagamentoAssinatura.create({
        data: {
          assinaturaId: assinaturaCriada.id,
          formaPagamento,
          valorCentavos: valorPagoCentavos,
          pagoEm: /* @__PURE__ */ new Date(),
          observacao: "Pagamento registrado na ativação da assinatura."
        }
      });
    }
    return assinaturaCriada;
  });
  return {
    sucesso: true,
    mensagem: `Assinatura ativada para ${cliente.nome}.`,
    assinatura
  };
});
const adminCancelarAssinaturaCliente_createServerFn_handler = createServerRpc({
  id: "10bba8106bda2eba336a14dcac07b30d05cd6549b66a6bce554e8eda7ae78cfb",
  name: "adminCancelarAssinaturaCliente",
  filename: "src/lib/api/assinatura.functions.ts"
}, (opts) => adminCancelarAssinaturaCliente.__executeServer(opts));
const adminCancelarAssinaturaCliente = createServerFn({
  method: "POST"
}).validator(cancelarAssinaturaClienteSchema).handler(adminCancelarAssinaturaCliente_createServerFn_handler, async ({
  data
}) => {
  await exigirDono();
  const assinatura = await prisma.assinaturaCliente.findUnique({
    where: {
      id: data.assinaturaId
    },
    select: {
      id: true,
      status: true,
      cliente: {
        select: {
          nome: true
        }
      }
    }
  });
  if (!assinatura) {
    return {
      sucesso: false,
      mensagem: "Assinatura não encontrada."
    };
  }
  if (assinatura.status !== "ATIVA") {
    return {
      sucesso: false,
      mensagem: "Apenas assinaturas ativas podem ser canceladas."
    };
  }
  const assinaturaAtualizada = await prisma.assinaturaCliente.update({
    where: {
      id: assinatura.id
    },
    data: {
      status: "CANCELADA",
      observacao: data.observacao?.trim() || "Assinatura cancelada pelo administrador."
    },
    select: {
      id: true,
      status: true,
      observacao: true
    }
  });
  return {
    sucesso: true,
    mensagem: `Assinatura de ${assinatura.cliente.nome} cancelada.`,
    assinatura: assinaturaAtualizada
  };
});
const listarMinhaAssinaturaAtiva_createServerFn_handler = createServerRpc({
  id: "12ca0ba994cdbd73e667498d7ec50ffdee3f41101838dcb079775cefd7bd3397",
  name: "listarMinhaAssinaturaAtiva",
  filename: "src/lib/api/assinatura.functions.ts"
}, (opts) => listarMinhaAssinaturaAtiva.__executeServer(opts));
const listarMinhaAssinaturaAtiva = createServerFn({
  method: "GET"
}).handler(listarMinhaAssinaturaAtiva_createServerFn_handler, async () => {
  const usuario = await exigirCliente();
  const agora = /* @__PURE__ */ new Date();
  return prisma.assinaturaCliente.findFirst({
    where: {
      clienteId: usuario.id,
      status: "ATIVA",
      vigenciaInicio: {
        lte: agora
      },
      vigenciaFim: {
        gte: agora
      }
    },
    orderBy: {
      criadoEm: "desc"
    },
    select: {
      id: true,
      status: true,
      vigenciaInicio: true,
      vigenciaFim: true,
      saldoCortes: true,
      observacao: true,
      plano: {
        select: {
          id: true,
          nome: true,
          descricao: true,
          precoCentavos: true,
          cortesPorCiclo: true,
          duracaoDias: true
        }
      },
      usos: {
        select: {
          id: true,
          quantidadeCortes: true,
          criadoEm: true,
          agendamento: {
            select: {
              id: true,
              inicio: true,
              status: true,
              servico: {
                select: {
                  nome: true
                }
              }
            }
          }
        },
        orderBy: {
          criadoEm: "desc"
        }
      }
    }
  });
});
const adminListarPagamentosAssinatura_createServerFn_handler = createServerRpc({
  id: "a877d16e29062f4c232692c2fcfca4772cd330d7055ebbdb47b126d4c9a32f79",
  name: "adminListarPagamentosAssinatura",
  filename: "src/lib/api/assinatura.functions.ts"
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
const desativarPlanoAssinaturaSchema = objectType({
  planoId: stringType().trim().min(1, "Plano inválido.")
});
const adminDesativarPlanoAssinatura_createServerFn_handler = createServerRpc({
  id: "f352d2d8511a4a809e893d8101f2ac63910fc348d29331f9706496a09ac5d249",
  name: "adminDesativarPlanoAssinatura",
  filename: "src/lib/api/assinatura.functions.ts"
}, (opts) => adminDesativarPlanoAssinatura.__executeServer(opts));
const adminDesativarPlanoAssinatura = createServerFn({
  method: "POST"
}).validator(desativarPlanoAssinaturaSchema).handler(adminDesativarPlanoAssinatura_createServerFn_handler, async ({
  data
}) => {
  await exigirDono();
  const plano = await prisma.planoAssinatura.findUnique({
    where: {
      id: data.planoId,
      ativo: true
    },
    select: {
      id: true,
      nome: true,
      ativo: true
    }
  });
  if (!plano) {
    return {
      sucesso: false,
      mensagem: "Plano não encontrado."
    };
  }
  if (!plano.ativo) {
    return {
      sucesso: false,
      mensagem: "Esse plano já está desativado."
    };
  }
  const assinaturaAtiva = await prisma.assinaturaCliente.findFirst({
    where: {
      planoId: plano.id,
      status: "ATIVA",
      vigenciaFim: {
        gte: /* @__PURE__ */ new Date()
      }
    },
    select: {
      id: true
    }
  });
  if (assinaturaAtiva) {
    return {
      sucesso: false,
      mensagem: "Não é possível excluir este plano porque existem clientes com assinatura ativa nele."
    };
  }
  await prisma.planoAssinatura.update({
    where: {
      id: plano.id
    },
    data: {
      ativo: false
    }
  });
  return {
    sucesso: true,
    mensagem: `Plano "${plano.nome}" excluído com sucesso.`
  };
});
export {
  adminAtivarAssinaturaCliente_createServerFn_handler,
  adminCancelarAssinaturaCliente_createServerFn_handler,
  adminCriarPlanoAssinatura_createServerFn_handler,
  adminDesativarPlanoAssinatura_createServerFn_handler,
  adminListarAssinaturas_createServerFn_handler,
  adminListarClientesParaAssinatura_createServerFn_handler,
  adminListarPagamentosAssinatura_createServerFn_handler,
  adminListarPlanosAssinatura_createServerFn_handler,
  listarMinhaAssinaturaAtiva_createServerFn_handler
};
