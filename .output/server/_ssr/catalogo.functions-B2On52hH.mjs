import { c as createServerRpc } from "./createServerRpc-BaohzIh1.mjs";
import { c as createServerFn } from "./server-BeKYjhVv.mjs";
import "../_libs/seroval.mjs";
import "../_libs/react.mjs";
import { o as objectType, b as booleanType, n as numberType, s as stringType, l as literalType } from "../_libs/zod.mjs";
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
async function getPrisma() {
  const {
    prisma
  } = await import("./prisma.server-DGhEAvkH.mjs");
  return prisma;
}
async function exigirDonoCatalogo() {
  const {
    obterUsuarioAtual
  } = await import("./session.server-DqLwM1tR.mjs");
  const usuario = await obterUsuarioAtual();
  if (!usuario) {
    throw new Error("Você precisa estar logado.");
  }
  if (usuario.papel !== "DONO") {
    throw new Error("Acesso negado.");
  }
  return usuario;
}
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
const listarServicos_createServerFn_handler = createServerRpc({
  id: "a61758c75a93384f77851e2c66f920c099f8a47b64b2e7de0f19dcb50297749c",
  name: "listarServicos",
  filename: "src/lib/api/catalogo.functions.ts"
}, (opts) => listarServicos.__executeServer(opts));
const listarServicos = createServerFn({
  method: "GET"
}).handler(listarServicos_createServerFn_handler, async () => {
  await exigirDonoCatalogo();
  const prisma = await getPrisma();
  return prisma.servico.findMany({
    where: {
      ativo: true
    },
    orderBy: {
      criadoEm: "desc"
    }
  });
});
const listarServicosAtivos_createServerFn_handler = createServerRpc({
  id: "626df4263be9cd9a471ca16bab48b24b6b4cc076134d4219512dff0e44137aad",
  name: "listarServicosAtivos",
  filename: "src/lib/api/catalogo.functions.ts"
}, (opts) => listarServicosAtivos.__executeServer(opts));
const listarServicosAtivos = createServerFn({
  method: "GET"
}).handler(listarServicosAtivos_createServerFn_handler, async () => {
  const prisma = await getPrisma();
  return prisma.servico.findMany({
    where: {
      ativo: true
    },
    orderBy: {
      nome: "asc"
    }
  });
});
const cadastrarServico_createServerFn_handler = createServerRpc({
  id: "1b55ea4ae81486954146a9169ed54ee1b3f5677daf374d196ff0a70c67174bf5",
  name: "cadastrarServico",
  filename: "src/lib/api/catalogo.functions.ts"
}, (opts) => cadastrarServico.__executeServer(opts));
const cadastrarServico = createServerFn({
  method: "POST"
}).validator(servicoSchema).handler(cadastrarServico_createServerFn_handler, async ({
  data
}) => {
  await exigirDonoCatalogo();
  const prisma = await getPrisma();
  const servicoExistente = await prisma.servico.findFirst({
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
  if (servicoExistente?.ativo) {
    return {
      sucesso: false,
      mensagem: "Já existe um serviço ativo com esse nome."
    };
  }
  if (servicoExistente && !servicoExistente.ativo) {
    await prisma.servico.update({
      where: {
        id: servicoExistente.id
      },
      data: {
        nome: data.nome,
        descricao: data.descricao?.trim() || null,
        duracaoMinutos: data.duracaoMinutos,
        precoCentavos: data.precoCentavos,
        ativo: true
      }
    });
    return {
      sucesso: true,
      mensagem: `Serviço "${data.nome}" foi reativado com sucesso.`
    };
  }
  await prisma.servico.create({
    data: {
      nome: data.nome,
      descricao: data.descricao?.trim() || null,
      duracaoMinutos: data.duracaoMinutos,
      precoCentavos: data.precoCentavos,
      ativo: true
    }
  });
  return {
    sucesso: true,
    mensagem: "Serviço cadastrado com sucesso."
  };
});
const listarProfissionais_createServerFn_handler = createServerRpc({
  id: "acccc942ee9715b568f2129938d55974dab2f82d481eb703442b58a0729283dc",
  name: "listarProfissionais",
  filename: "src/lib/api/catalogo.functions.ts"
}, (opts) => listarProfissionais.__executeServer(opts));
const listarProfissionais = createServerFn({
  method: "GET"
}).handler(listarProfissionais_createServerFn_handler, async () => {
  await exigirDonoCatalogo();
  const prisma = await getPrisma();
  return prisma.profissional.findMany({
    where: {
      ativo: true
    },
    orderBy: {
      criadoEm: "desc"
    }
  });
});
const listarProfissionaisAtivos_createServerFn_handler = createServerRpc({
  id: "5297a8d7127791359d9babfafa1f6b1fce845eaf1f893147b2ca75d6016a34e3",
  name: "listarProfissionaisAtivos",
  filename: "src/lib/api/catalogo.functions.ts"
}, (opts) => listarProfissionaisAtivos.__executeServer(opts));
const listarProfissionaisAtivos = createServerFn({
  method: "GET"
}).handler(listarProfissionaisAtivos_createServerFn_handler, async () => {
  const prisma = await getPrisma();
  return prisma.profissional.findMany({
    where: {
      ativo: true
    },
    orderBy: {
      nome: "asc"
    }
  });
});
const cadastrarProfissional_createServerFn_handler = createServerRpc({
  id: "0fcfac69cc2b614945f84ad15d3a4e6446e05d320ff6a57316b302c459fe9001",
  name: "cadastrarProfissional",
  filename: "src/lib/api/catalogo.functions.ts"
}, (opts) => cadastrarProfissional.__executeServer(opts));
const cadastrarProfissional = createServerFn({
  method: "POST"
}).validator(profissionalSchema).handler(cadastrarProfissional_createServerFn_handler, async ({
  data
}) => {
  await exigirDonoCatalogo();
  const prisma = await getPrisma();
  const profissionalExistente = await prisma.profissional.findFirst({
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
  if (profissionalExistente?.ativo) {
    return {
      sucesso: false,
      mensagem: "Já existe um profissional ativo com esse nome."
    };
  }
  if (profissionalExistente && !profissionalExistente.ativo) {
    await prisma.profissional.update({
      where: {
        id: profissionalExistente.id
      },
      data: {
        usuarioId: data.usuarioId?.trim() || null,
        nome: data.nome,
        telefone: data.telefone?.trim() || null,
        descricao: data.descricao?.trim() || null,
        ativo: true
      }
    });
    return {
      sucesso: true,
      mensagem: `Profissional "${data.nome}" foi reativado com sucesso.`
    };
  }
  await prisma.profissional.create({
    data: {
      usuarioId: data.usuarioId?.trim() || null,
      nome: data.nome,
      telefone: data.telefone?.trim() || null,
      descricao: data.descricao?.trim() || null,
      ativo: true
    }
  });
  return {
    sucesso: true,
    mensagem: "Profissional cadastrado com sucesso."
  };
});
const adminDesativarServico_createServerFn_handler = createServerRpc({
  id: "b604fcd92b87c205c2b38a7d7823db579ad886441aeaca118fd7a90f94e0d282",
  name: "adminDesativarServico",
  filename: "src/lib/api/catalogo.functions.ts"
}, (opts) => adminDesativarServico.__executeServer(opts));
const adminDesativarServico = createServerFn({
  method: "POST"
}).validator(desativarItemCatalogoSchema).handler(adminDesativarServico_createServerFn_handler, async ({
  data
}) => {
  await exigirDonoCatalogo();
  const prisma = await getPrisma();
  const servico = await prisma.servico.findUnique({
    where: {
      id: data.id
    },
    select: {
      id: true,
      nome: true,
      ativo: true
    }
  });
  if (!servico) {
    return {
      sucesso: false,
      mensagem: "Serviço não encontrado."
    };
  }
  if (!servico.ativo) {
    return {
      sucesso: false,
      mensagem: "Esse serviço já está desativado."
    };
  }
  const agendamentoFuturo = await prisma.agendamento.findFirst({
    where: {
      servicoId: servico.id,
      status: {
        in: ["SOLICITADO", "CONFIRMADO"]
      },
      inicio: {
        gte: /* @__PURE__ */ new Date()
      }
    },
    select: {
      id: true
    }
  });
  if (agendamentoFuturo) {
    return {
      sucesso: false,
      mensagem: "Não é possível excluir este serviço porque existem agendamentos futuros solicitados ou confirmados."
    };
  }
  await prisma.servico.update({
    where: {
      id: servico.id
    },
    data: {
      ativo: false
    }
  });
  return {
    sucesso: true,
    mensagem: `Serviço "${servico.nome}" desativado com sucesso.`
  };
});
const adminDesativarProfissional_createServerFn_handler = createServerRpc({
  id: "571f947f803482b67a161ab5fb9aa9b72655b436213157f2462d96e25933e9c8",
  name: "adminDesativarProfissional",
  filename: "src/lib/api/catalogo.functions.ts"
}, (opts) => adminDesativarProfissional.__executeServer(opts));
const adminDesativarProfissional = createServerFn({
  method: "POST"
}).validator(desativarItemCatalogoSchema).handler(adminDesativarProfissional_createServerFn_handler, async ({
  data
}) => {
  await exigirDonoCatalogo();
  const prisma = await getPrisma();
  const profissional = await prisma.profissional.findUnique({
    where: {
      id: data.id
    },
    select: {
      id: true,
      nome: true,
      ativo: true
    }
  });
  if (!profissional) {
    return {
      sucesso: false,
      mensagem: "Funcionário/profissional não encontrado."
    };
  }
  if (!profissional.ativo) {
    return {
      sucesso: false,
      mensagem: "Esse profissional já está desativado."
    };
  }
  const agendamentoFuturo = await prisma.agendamento.findFirst({
    where: {
      profissionalId: profissional.id,
      status: {
        in: ["SOLICITADO", "CONFIRMADO"]
      },
      inicio: {
        gte: /* @__PURE__ */ new Date()
      }
    },
    select: {
      id: true
    }
  });
  if (agendamentoFuturo) {
    return {
      sucesso: false,
      mensagem: "Não é possível excluir este profissional porque existem agendamentos futuros solicitados ou confirmados."
    };
  }
  await prisma.profissional.update({
    where: {
      id: profissional.id
    },
    data: {
      ativo: false
    }
  });
  return {
    sucesso: true,
    mensagem: `Profissional "${profissional.nome}" desativado com sucesso.`
  };
});
export {
  adminDesativarProfissional_createServerFn_handler,
  adminDesativarServico_createServerFn_handler,
  cadastrarProfissional_createServerFn_handler,
  cadastrarServico_createServerFn_handler,
  listarProfissionaisAtivos_createServerFn_handler,
  listarProfissionais_createServerFn_handler,
  listarServicosAtivos_createServerFn_handler,
  listarServicos_createServerFn_handler
};
