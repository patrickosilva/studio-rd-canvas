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

    // Estado persistido da integração: não cria checkout nem expõe chaves.
    const inicioInfinitePay = Date.now();
    try {
      const integracao = await prisma.integracaoExterna.findUnique({
        where: { provedor: "INFINITEPAY" },
        select: { status: true, verificadoEm: true, ultimoErro: true },
      });
      const status = integracao?.status ?? "DESCONECTADA";
      const comErro = status === "ERRO";
      const conectada = status === "CONECTADA";
      verificacoes.push({
        id: "infinitepay-status",
        nome: "InfinitePay — estado registrado",
        estado: comErro ? "FALHA" : conectada ? "ATENCAO" : "ATENCAO",
        resumo: comErro ? "Integração registra erro" : conectada ? "Conexão registrada; checkout não testado" : "Integração não conectada",
        detalhe: comErro
          ? "A última validação falhou. Consulte Administração > Conexões e os logs do servidor; não são exibidas credenciais."
          : conectada
            ? `Última validação registrada: ${integracao?.verificadoEm?.toISOString() ?? "não informada"}. Isso não comprova que um link existente abre ou que o pagamento ativa a assinatura.`
            : "Confira a configuração e a validação em Administração > Conexões.",
        duracaoMs: Date.now() - inicioInfinitePay,
      });
    } catch (erro) {
      console.error("[monitoramento] Falha ao consultar status InfinitePay", erro);
      verificacoes.push({ id: "infinitepay-status", nome: "InfinitePay — estado registrado", estado: "FALHA", resumo: "Falha ao consultar integração", detalhe: "Consulte os logs do servidor.", duracaoMs: Date.now() - inicioInfinitePay });
    }

    const inicioPedidos = Date.now();
    try {
      const agora = new Date();
      const [pendentesExpirados, pedidosFalhos, pagosSemAssinatura, webhooksErro] = await Promise.all([
        prisma.pedidoAssinatura.count({ where: { status: "CHECKOUT_CRIADO", expiraEm: { lt: agora } } }),
        prisma.pedidoAssinatura.count({ where: { status: "FALHOU", criadoEm: { gte: new Date(agora.getTime() - 24 * 60 * 60 * 1000) } } }),
        prisma.pedidoAssinatura.count({ where: { status: "PAGO", assinaturaId: null } }),
        prisma.eventoWebhookPagamento.count({ where: { provedor: "INFINITEPAY", erro: { not: null }, recebidoEm: { gte: new Date(agora.getTime() - 24 * 60 * 60 * 1000) } } }),
      ]);
      const alerta = pendentesExpirados + pedidosFalhos + pagosSemAssinatura + webhooksErro > 0;
      verificacoes.push({
        id: "pagamento-anomalias",
        nome: "Assinaturas — pendências registradas",
        estado: alerta ? "ATENCAO" : "NAO_VERIFICADO",
        resumo: alerta ? "Há pedidos ou eventos que exigem revisão" : "Sem anomalias detectadas nas verificações de registros",
        detalhe: `Checkouts expirados sem confirmação: ${pendentesExpirados}; pedidos falhos nas últimas 24h: ${pedidosFalhos}; pedidos PAGO sem assinatura vinculada: ${pagosSemAssinatura}; webhooks com erro nas últimas 24h: ${webhooksErro}. Um checkout pode falhar no navegador sem registrar erro aqui. Não comprova o funcionamento da InfinitePay.`,
        duracaoMs: Date.now() - inicioPedidos,
      });
    } catch (erro) {
      console.error("[monitoramento] Falha ao consultar anomalias de pagamento", erro);
      verificacoes.push({ id: "pagamento-anomalias", nome: "Assinaturas — pendências registradas", estado: "FALHA", resumo: "Consulta de pedidos falhou", detalhe: "Consulte os logs do servidor.", duracaoMs: Date.now() - inicioPedidos });
    }

    const urlBase = process.env.APP_URL?.trim() || process.env.PUBLIC_APP_URL?.trim();
    let dominioOk = false;
    try { dominioOk = Boolean(urlBase && new URL(urlBase).protocol === "https:" && new URL(urlBase).hostname === "studiordbarber.com"); } catch { /* formato inválido */ }
    verificacoes.push({
      id: "dominio-retorno",
      nome: "Retorno de pagamento — domínio configurado",
      estado: dominioOk ? "ATENCAO" : "FALHA",
      resumo: dominioOk ? "Domínio esperado configurado; rota não testada" : "APP_URL / PUBLIC_APP_URL requer revisão",
      detalhe: dominioOk
        ? "O domínio configurado é studiordbarber.com. A página e o webhook não foram acessados nesta verificação; checkouts antigos podem continuar com retorno anterior."
        : "Verifique se APP_URL e PUBLIC_APP_URL apontam para https://studiordbarber.com. APP_URL tem prioridade no código.",
      duracaoMs: null,
    });

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
