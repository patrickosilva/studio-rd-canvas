import { c as createServerRpc } from "./createServerRpc-CwtiRIfn.js";
import { c as createServerFn } from "./server-n3LmVJQm.js";
import { z } from "zod";
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
async function getPrisma() {
  const {
    prisma
  } = await import("./prisma.server-DGhEAvkH.js");
  return prisma;
}
async function exigirDonoCatalogo() {
  const {
    obterUsuarioAtual
  } = await import("./session.server-Dmdt7VsU.js");
  const usuario = await obterUsuarioAtual();
  if (!usuario) {
    throw new Error("Você precisa estar logado.");
  }
  if (usuario.papel !== "DONO") {
    throw new Error("Acesso negado.");
  }
  return usuario;
}
const servicoSchema = z.object({
  nome: z.string().trim().min(2, "O nome do serviço é obrigatório.").max(80, "O nome do serviço é muito grande."),
  descricao: z.string().trim().max(500, "A descrição é muito grande.").optional().or(z.literal("")),
  duracaoMinutos: z.number().int("A duração precisa ser um número inteiro.").min(10, "A duração mínima é de 10 minutos.").max(480, "A duração máxima é de 480 minutos."),
  precoCentavos: z.number().int("O preço precisa estar em centavos.").min(0, "O preço não pode ser negativo."),
  ativo: z.boolean().default(true)
});
const profissionalSchema = z.object({
  usuarioId: z.string().trim().optional().or(z.literal("")),
  nome: z.string().trim().min(2, "O nome do profissional é obrigatório.").max(100, "O nome é muito grande."),
  telefone: z.string().trim().max(20, "Telefone inválido.").optional().or(z.literal("")),
  descricao: z.string().trim().max(500, "A descrição é muito grande.").optional().or(z.literal("")),
  ativo: z.boolean().default(true)
});
const desativarItemCatalogoSchema = z.object({
  id: z.string().trim().min(1, "Item inválido.")
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
