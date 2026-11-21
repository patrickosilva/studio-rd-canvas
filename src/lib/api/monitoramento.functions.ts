import { createServerFn } from "@tanstack/react-start";

import { prisma } from "@/lib/prisma.server";
import { obterUsuarioAtual } from "@/lib/session.server";

type Estado = "OK" | "ATENCAO" | "FALHA" | "NAO_VERIFICADO";

type Verificacao = {
  id: string;
  nome: string;
  estado: Estado;
  resumo: string;
  detalhe: string;
  duracaoMs: number | null;
};

async function executarLeitura(
  id: string,
  nome: string,
  descricao: string,
  leitura: () => Promise<unknown>,
): Promise<Verificacao> {
  const inicio = Date.now();
  try {
    await leitura();
    return {
      id,
      nome,
      estado: "OK",
      resumo: "Consulta de leitura bem-sucedida",
      detalhe: descricao + " Isso não substitui testes de criação, alteração e exclusão.",
      duracaoMs: Date.now() - inicio,
    };
  } catch (erro) {
    // Log somente do lado do servidor; sem expor erros ou dados internos ao navegador.
    console.error(`[monitoramento] Falha no módulo ${id}`, erro);
    return {
      id,
      nome,
      estado: "FALHA",
      resumo: "Falha na consulta do módulo",
      detalhe: "Verifique os logs do servidor para identificar a causa.",
      duracaoMs: Date.now() - inicio,
    };
  }
}

export const adminBuscarMonitoramento = createServerFn({ method: "GET" }).handler(
  async () => {
    const usuario = await obterUsuarioAtual();
    if (!usuario || usuario.papel !== "DONO") {
      throw new Error("Acesso negado.");
    }

    const verificacoes = await Promise.all([
      executarLeitura("banco", "Banco de dados", "A conexão respondeu a uma consulta simples.",
        async () => { await prisma.$queryRaw`SELECT 1`; }),
      executarLeitura("agenda", "Agendamentos", "Os registros de agendamentos estão acessíveis.",
        async () => { await prisma.agendamento.count(); }),
      executarLeitura("usuarios", "Usuários e acessos", "Os registros de usuários e sessões estão acessíveis.",
        async () => { await prisma.usuario.count(); await prisma.sessao.count(); }),
      executarLeitura("catalogo", "Serviços e profissionais", "O catálogo e os profissionais estão acessíveis.",
        async () => { await prisma.servico.count(); await prisma.profissional.count(); }),
      executarLeitura("financeiro", "Dados financeiros", "Os registros de atendimentos podem ser consultados.",
        async () => { await prisma.agendamento.count({ where: { status: "CONCLUIDO" } }); }),
      executarLeitura("assinaturas", "Assinaturas (experimental)", "Planos, assinaturas e pagamentos estão acessíveis.",
        async () => { await prisma.planoAssinatura.count(); await prisma.assinaturaCliente.count(); await prisma.pagamentoAssinatura.count(); }),
      executarLeitura("fidelidade", "Fidelidade", "As origens de pontos (atendimentos concluídos e pagamentos de assinatura) estão acessíveis.",
        async () => { await prisma.agendamento.count({ where: { status: "CONCLUIDO" } }); await prisma.pagamentoAssinatura.count(); }),
      executarLeitura("notificacoes", "Notificações", "A tabela de notificações está acessível; entrega externa não foi testada.",
        async () => { await prisma.notificacao.count(); }),
      executarLeitura("integracoes", "Configuração das integrações", "As configurações de provedores estão acessíveis; nenhuma cobrança ou chamada externa foi executada.",
        async () => { await prisma.integracaoExterna.count(); }),
    ]);

    // Um recurso experimental ou parcial não deve ser apresentado como plenamente validado.
    for (const item of verificacoes) {
      if (item.estado !== "OK") continue;
      if (item.id === "assinaturas") {
        item.estado = "ATENCAO";
        item.resumo = "Consultas OK · fluxo experimental";
        item.detalhe += " Cobranças, renovação e cancelamento exigem testes de ponta a ponta.";
      }
      if (item.id === "fidelidade") {
        item.estado = "ATENCAO";
        item.resumo = "Consultas OK · resgates indisponíveis";
        item.detalhe += " O resgate de recompensas ainda não está implementado.";
      }
    }

    // Verificações que não seriam seguras executar a cada atualização da página.
    verificacoes.push({
      id: "pagamentos-externos",
      nome: "Pagamentos externos / webhooks",
      estado: "NAO_VERIFICADO",
      resumo: "Transação externa não executada",
      detalhe: "Verifique os logs e eventos do provedor. Nenhuma cobrança real ou webhook artificial foi disparado.",
      duracaoMs: null,
    });
    verificacoes.push({
      id: "email-entrega",
      nome: "Entrega de e-mails",
      estado: "NAO_VERIFICADO",
      resumo: "Envio externo não executado",
      detalhe: "A página não envia e-mails de teste automaticamente nem expõe credenciais.",
      duracaoMs: null,
    });

    return { verificadoEm: new Date().toISOString(), verificacoes };
  },
);
