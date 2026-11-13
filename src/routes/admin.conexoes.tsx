import {
  useEffect,
  useMemo,
  useState,
  type ChangeEvent,
} from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { Eye, EyeOff, Loader2 } from "lucide-react";

import { PageHeader } from "@/components/dashboard/Sidebar";
import { Button } from "@/components/ui/button";
import {
  adminConsultarCobrancaPixTesteInter,
  adminCriarCobrancaPixTesteInter,
  adminListarIntegracoes,
  adminPrepararIntegracao,
  adminSalvarConfiguracaoInter,
  adminTestarConexaoInter,
} from "@/lib/api/integracoes.functions";

export const Route = createFileRoute("/admin/conexoes")({
  component: AdminConexoesPage,
});

type StatusIntegracao =
  | "DESCONECTADA"
  | "CONFIGURANDO"
  | "CONECTADA"
  | "ERRO";

type AmbienteInter = "SANDBOX" | "PRODUCAO";

type Integracao = {
  provedor: "INTER" | "META";
  status: StatusIntegracao;
  configuracaoPublica: unknown;
  possuiCredenciais: boolean;
  conectadoEm: string | Date | null;
  verificadoEm: string | Date | null;
  ultimoErro: string | null;
};

type CobrancaTeste = {
  txid: string;
  status: string;
  pixCopiaECola: string | null;
  location: string | null;
  valorOriginal: string | null;
  expiracaoSegundos: number | null;
  revisao: number | null;
};

function classeStatus(status: StatusIntegracao): string {
  if (status === "CONECTADA") {
    return "border-emerald-500/30 bg-emerald-500/10 text-emerald-400";
  }

  if (status === "ERRO") {
    return "border-destructive/30 bg-destructive/10 text-destructive";
  }

  if (status === "CONFIGURANDO") {
    return "border-amber-500/30 bg-amber-500/10 text-amber-400";
  }

  return "border-border bg-background text-muted-foreground";
}

function labelStatus(status: StatusIntegracao): string {
  const labels: Record<StatusIntegracao, string> = {
    DESCONECTADA: "Nao conectado",
    CONFIGURANDO: "Configurando",
    CONECTADA: "Conectado",
    ERRO: "Erro de conexao",
  };

  return labels[status];
}

function lerAmbienteInter(configuracao: unknown): AmbienteInter {
  if (
    configuracao &&
    typeof configuracao === "object" &&
    !Array.isArray(configuracao) &&
    (configuracao as Record<string, unknown>).ambiente === "PRODUCAO"
  ) {
    return "PRODUCAO";
  }

  return "SANDBOX";
}

function dinheiroParaCentavos(valor: string): number {
  const numero = Number(
    valor.trim().replace(/\./g, "").replace(",", "."),
  );

  return Number.isFinite(numero)
    ? Math.round(numero * 100)
    : 0;
}

async function lerArquivo(
  event: ChangeEvent<HTMLInputElement>,
): Promise<{ nome: string; conteudo: string }> {
  const arquivo = event.target.files?.[0];

  if (!arquivo) {
    return { nome: "", conteudo: "" };
  }

  return {
    nome: arquivo.name,
    conteudo: await arquivo.text(),
  };
}

function AdminConexoesPage() {
  const listar = useServerFn(adminListarIntegracoes);
  const preparar = useServerFn(adminPrepararIntegracao);
  const salvarInter = useServerFn(
    adminSalvarConfiguracaoInter,
  );
  const testarInter = useServerFn(
    adminTestarConexaoInter,
  );
  const criarCobranca = useServerFn(
    adminCriarCobrancaPixTesteInter,
  );
  const consultarCobranca = useServerFn(
    adminConsultarCobrancaPixTesteInter,
  );

  const [integracoes, setIntegracoes] =
    useState<Integracao[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [processando, setProcessando] = useState("");
  const [mensagem, setMensagem] = useState("");
  const [erro, setErro] = useState("");

  const [formAberto, setFormAberto] = useState(false);
  const [mostrarSecret, setMostrarSecret] = useState(false);
  const [ambiente, setAmbiente] =
    useState<AmbienteInter>("SANDBOX");
  const [clientId, setClientId] = useState("");
  const [clientSecret, setClientSecret] = useState("");
  const [contaCorrente, setContaCorrente] = useState("");
  const [chavePix, setChavePix] = useState("");
  const [certificadoPem, setCertificadoPem] = useState("");
  const [certificadoNome, setCertificadoNome] = useState("");
  const [chavePrivadaPem, setChavePrivadaPem] = useState("");
  const [chaveNome, setChaveNome] = useState("");

  const [valorTeste, setValorTeste] = useState("1,00");
  const [descricaoTeste, setDescricaoTeste] = useState(
    "Teste Studio RD",
  );
  const [cobranca, setCobranca] =
    useState<CobrancaTeste | null>(null);

  async function carregar() {
    setCarregando(true);
    setErro("");

    try {
      setIntegracoes(await listar());
    } catch (error) {
      console.error(error);
      setErro("Nao foi possivel carregar as conexoes.");
    } finally {
      setCarregando(false);
    }
  }

  useEffect(() => {
    void carregar();
  }, []);

  const inter = useMemo(
    () =>
      integracoes.find(
        (item) => item.provedor === "INTER",
      ) ?? null,
    [integracoes],
  );

  useEffect(() => {
    if (!inter) {
      return;
    }

    setAmbiente(lerAmbienteInter(inter.configuracaoPublica));

    if (
      inter.status === "CONFIGURANDO" ||
      inter.status === "ERRO"
    ) {
      setFormAberto(true);
    }
  }, [inter]);

  async function abrirInter() {
    setMensagem("");
    setErro("");
    setFormAberto(true);

    if (!inter || inter.status === "DESCONECTADA") {
      setProcessando("PREPARAR");

      try {
        await preparar({
          data: { provedor: "INTER" },
        });
        await carregar();
      } finally {
        setProcessando("");
      }
    }
  }

  async function salvar() {
    if (
      !clientId.trim() ||
      !clientSecret.trim() ||
      !chavePix.trim() ||
      !certificadoPem ||
      !chavePrivadaPem
    ) {
      setErro(
        "Preencha Client ID, Client Secret, chave Pix, certificado e chave privada.",
      );
      return;
    }

    setMensagem("");
    setErro("");
    setProcessando("SALVAR");

    try {
      const resultado = await salvarInter({
        data: {
          ambiente,
          clientId,
          clientSecret,
          certificadoPem,
          chavePrivadaPem,
          contaCorrente,
          chavePix,
        },
      });

      if (!resultado.sucesso) {
        setErro(resultado.mensagem);
        return;
      }

      setMensagem(resultado.mensagem);
      setClientSecret("");
      await carregar();
    } catch (error) {
      console.error(error);
      setErro("Nao foi possivel salvar a configuracao.");
    } finally {
      setProcessando("");
    }
  }

  async function testar() {
    setMensagem("");
    setErro("");
    setProcessando("TESTAR");

    try {
      const resultado = await testarInter();

      if (!resultado.sucesso) {
        setErro(resultado.mensagem);
        await carregar();
        return;
      }

      setMensagem(
        `${resultado.mensagem} Token valido por cerca de ${Math.round(
          resultado.expiresIn / 60,
        )} minutos.`,
      );

      await carregar();
    } catch (error) {
      console.error(error);
      setErro("Nao foi possivel testar a conexao.");
    } finally {
      setProcessando("");
    }
  }

  async function gerarCobrancaTeste() {
    setMensagem("");
    setErro("");
    setProcessando("COBRAR");

    try {
      const resultado = await criarCobranca({
        data: {
          valorCentavos: dinheiroParaCentavos(valorTeste),
          descricao: descricaoTeste,
        },
      });

      if (!resultado.sucesso) {
        setErro(resultado.mensagem);
        return;
      }

      setCobranca(resultado.cobranca);
      setMensagem(resultado.mensagem);
    } catch (error) {
      console.error(error);
      setErro("Nao foi possivel criar a cobranca Sandbox (area de testes).");
    } finally {
      setProcessando("");
    }
  }

  async function atualizarCobranca() {
    if (!cobranca) {
      return;
    }

    setMensagem("");
    setErro("");
    setProcessando("CONSULTAR");

    try {
      const resultado = await consultarCobranca({
        data: { txid: cobranca.txid },
      });

      if (!resultado.sucesso) {
        setErro(resultado.mensagem);
        return;
      }

      setCobranca(resultado.cobranca);
      setMensagem(resultado.mensagem);
    } catch (error) {
      console.error(error);
      setErro("Nao foi possivel consultar a cobranca.");
    } finally {
      setProcessando("");
    }
  }

  async function copiarPix() {
    if (!cobranca?.pixCopiaECola) {
      return;
    }

    await navigator.clipboard.writeText(
      cobranca.pixCopiaECola,
    );
    setMensagem("Pix copia e cola copiado.");
  }

  return (
    <div className="max-w-6xl p-6 lg:p-10">
      <PageHeader
        title="Conexões"
        subtitle="Configure a integração do Banco Inter e escolha claramente entre ambiente de testes e ambiente real."
      />

      {mensagem && (
        <div className="mb-5 border-l-2 border-emerald-500 bg-emerald-500/5 px-4 py-3 text-sm text-emerald-400">
          {mensagem}
        </div>
      )}

      {erro && (
        <div className="mb-5 border-l-2 border-destructive bg-destructive/5 px-4 py-3 text-sm text-destructive">
          {erro}
        </div>
      )}

      {carregando ? (
        <div className="border border-border bg-surface p-6 text-sm text-muted-foreground">
          Carregando conexões...
        </div>
      ) : (
        <div className="space-y-5">
          <section className="rounded-lg border border-border bg-surface">
            <div className="flex flex-col gap-4 border-b border-border px-5 py-5 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <p className="text-xs font-medium uppercase tracking-[0.16em] text-gold">
                  Pagamentos
                </p>
                <h2 className="mt-1 font-display text-xl">Banco Inter</h2>
                <p className="mt-1 max-w-2xl text-sm leading-6 text-muted-foreground">
                  Conecte o Studio RD à API do Banco Inter escolhendo o ambiente
                  adequado para cada etapa da operação.
                </p>
              </div>

              <div className="flex flex-wrap gap-2">
                <span className="rounded-md border border-border bg-background px-2.5 py-1 text-xs text-muted-foreground">
                  {ambiente === "SANDBOX"
                    ? "Sandbox (área de testes)"
                    : "Produção (ambiente real)"}
                </span>
                <span
                  className={`rounded-md border px-2.5 py-1 text-xs ${classeStatus(
                    inter?.status ?? "DESCONECTADA",
                  )}`}
                >
                  {labelStatus(inter?.status ?? "DESCONECTADA")}
                </span>
              </div>
            </div>

            <div className="px-5 py-5">
              <div className="border-l-2 border-gold pl-4">
                <p className="text-sm font-medium text-foreground">
                  {ambiente === "SANDBOX"
                    ? "Sandbox (área de testes) selecionado"
                    : "Produção (ambiente real) selecionada"}
                </p>
                <p className="mt-1 text-sm leading-6 text-muted-foreground">
                  {ambiente === "SANDBOX"
                    ? "Use este ambiente para validar autenticação, cobranças e consultas sem movimentar dinheiro real."
                    : "Este ambiente usa a conta real da barbearia. O laboratório de cobrança permanece desativado para evitar testes acidentais com dinheiro real."}
                </p>
              </div>

              <div className="mt-5">
                <Button
                  type="button"
                  onClick={() => void abrirInter()}
                  disabled={processando === "PREPARAR"}
                >
                  {processando === "PREPARAR" && (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  )}
                  {inter?.status === "CONECTADA"
                    ? "Gerenciar configuração"
                    : "Configurar Banco Inter"}
                </Button>
              </div>

              {formAberto && (
                <div className="mt-7 border-t border-border pt-6">
                  <div>
                    <h3 className="text-base font-semibold">
                      Configuração do Banco Inter
                    </h3>
                    <p className="mt-1 max-w-3xl text-sm leading-6 text-muted-foreground">
                      Primeiro escolha o ambiente. Depois preencha somente as credenciais
                      e arquivos correspondentes a esse mesmo ambiente.
                    </p>
                  </div>

                  <div className="mt-5 max-w-xl">
                    <label className="text-xs font-medium text-foreground">
                      Ambiente da integração
                    </label>
                    <select
                      value={ambiente}
                      onChange={(event) => {
                        setAmbiente(event.target.value as AmbienteInter);
                        setCobranca(null);
                      }}
                      className="mt-2 h-11 w-full rounded-md border border-input bg-background px-3 text-sm outline-none transition focus:border-gold"
                    >
                      <option value="SANDBOX">
                        Sandbox (área de testes)
                      </option>
                      <option value="PRODUCAO">
                        Produção (ambiente real)
                      </option>
                    </select>
                    <p className="mt-2 text-xs leading-5 text-muted-foreground">
                      Sandbox é indicado para configuração e validação. Produção deve
                      ser usada somente quando a integração já estiver conferida.
                    </p>
                  </div>

                  <details className="mt-5 border-y border-border py-4" open>
                    <summary className="cursor-pointer select-none text-sm font-medium text-foreground">
                      Como conseguir os dados no Banco Inter
                    </summary>

                    <ol className="mt-4 space-y-4">
                      {[
                        {
                          numero: "01",
                          titulo: "Entre no Internet Banking da empresa",
                          texto:
                            "Acesse a conta Inter Empresas/PJ que será usada pela barbearia.",
                        },
                        {
                          numero: "02",
                          titulo: "Abra a área de integrações",
                          texto:
                            "Procure a área de APIs ou Integrações e crie uma integração para o Studio RD.",
                        },
                        {
                          numero: "03",
                          titulo: "Habilite Pix e cobranças",
                          texto:
                            "Libere as permissões necessárias para Pix e cobranças. Webhook e Pix Automático entram nas próximas etapas.",
                        },
                        {
                          numero: "04",
                          titulo: "Baixe certificado e chave privada",
                          texto:
                            "Guarde os dois arquivos. Eles formam um par e precisam pertencer à mesma integração.",
                        },
                        {
                          numero: "05",
                          titulo: "Copie Client ID e Client Secret",
                          texto:
                            "Preencha os campos abaixo, salve os dados e depois teste a autenticação.",
                        },
                      ].map((passo) => (
                        <li
                          key={passo.numero}
                          className="grid gap-2 sm:grid-cols-[44px_1fr]"
                        >
                          <span className="font-mono text-xs font-semibold text-gold">
                            {passo.numero}
                          </span>
                          <div>
                            <p className="text-sm font-medium">{passo.titulo}</p>
                            <p className="mt-1 text-sm leading-6 text-muted-foreground">
                              {passo.texto}
                            </p>
                          </div>
                        </li>
                      ))}
                    </ol>

                    <p className="mt-5 border-l-2 border-amber-500/60 pl-3 text-sm leading-6 text-muted-foreground">
                      Não misture ambientes: Client ID, Client Secret, certificado
                      e chave privada precisam pertencer à mesma integração selecionada.
                    </p>
                  </details>

                  <div className="mt-6 grid gap-x-6 gap-y-5 md:grid-cols-2">
                    <div className="space-y-2">
                      <label className="text-xs font-medium text-foreground">
                        Client ID
                      </label>
                      <input
                        value={clientId}
                        onChange={(event) => setClientId(event.target.value)}
                        className="h-11 w-full rounded-md border border-input bg-background px-3 text-sm outline-none transition focus:border-gold"
                        placeholder="Cole o Client ID da integração"
                      />
                      <p className="text-xs leading-5 text-muted-foreground">
                        Identificador da integração criada no Inter. Não é número da
                        conta, CPF/CNPJ ou chave Pix.
                      </p>
                    </div>

                    <div className="space-y-2">
                      <label className="text-xs font-medium text-foreground">
                        Client Secret
                      </label>
                      <div className="relative">
                        <input
                          type={mostrarSecret ? "text" : "password"}
                          value={clientSecret}
                          onChange={(event) => setClientSecret(event.target.value)}
                          className="h-11 w-full rounded-md border border-input bg-background px-3 pr-11 text-sm outline-none transition focus:border-gold"
                          placeholder="Cole o Client Secret"
                        />
                        <button
                          type="button"
                          onClick={() => setMostrarSecret((atual) => !atual)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground transition hover:text-foreground"
                          aria-label={
                            mostrarSecret
                              ? "Ocultar Client Secret"
                              : "Mostrar Client Secret"
                          }
                        >
                          {mostrarSecret ? (
                            <EyeOff className="h-4 w-4" />
                          ) : (
                            <Eye className="h-4 w-4" />
                          )}
                        </button>
                      </div>
                      <p className="text-xs leading-5 text-muted-foreground">
                        Senha técnica da integração. Não use a senha do Internet
                        Banking. O valor é criptografado antes de ser salvo.
                      </p>
                    </div>

                    <div className="space-y-2">
                      <label className="text-xs font-medium text-foreground">
                        Chave Pix recebedora
                      </label>
                      <input
                        value={chavePix}
                        onChange={(event) => setChavePix(event.target.value)}
                        className="h-11 w-full rounded-md border border-input bg-background px-3 text-sm outline-none transition focus:border-gold"
                        placeholder="Chave Pix do recebedor neste ambiente"
                      />
                      <p className="text-xs leading-5 text-muted-foreground">
                        Chave usada como recebedora das cobranças de teste.
                      </p>
                    </div>

                    <div className="space-y-2">
                      <label className="text-xs font-medium text-foreground">
                        Conta corrente
                        <span className="ml-1 font-normal text-muted-foreground">
                          (opcional)
                        </span>
                      </label>
                      <input
                        value={contaCorrente}
                        onChange={(event) => setContaCorrente(event.target.value)}
                        className="h-11 w-full rounded-md border border-input bg-background px-3 text-sm outline-none transition focus:border-gold"
                        placeholder="Deixe vazio se não for necessário"
                      />
                      <p className="text-xs leading-5 text-muted-foreground">
                        Preencha somente se a integração precisar identificar uma
                        conta corrente específica.
                      </p>
                    </div>

                    <div className="space-y-2">
                      <label className="text-xs font-medium text-foreground">
                        Certificado da integração
                      </label>
                      <label className="flex h-11 cursor-pointer items-center justify-between rounded-md border border-input bg-background px-3 text-sm transition hover:border-gold">
                        <span className="truncate text-muted-foreground">
                          {certificadoNome || "Selecionar .crt ou .pem"}
                        </span>
                        <span className="ml-3 text-xs font-medium text-gold">
                          Escolher
                        </span>
                        <input
                          type="file"
                          accept=".crt,.pem,text/plain"
                          className="hidden"
                          onChange={(event) => {
                            void lerArquivo(event).then((arquivo) => {
                              setCertificadoNome(arquivo.nome);
                              setCertificadoPem(arquivo.conteudo);
                            });
                          }}
                        />
                      </label>
                      <p className="text-xs leading-5 text-muted-foreground">
                        Certificado público correspondente à integração e ao ambiente selecionados.
                      </p>
                    </div>

                    <div className="space-y-2">
                      <label className="text-xs font-medium text-foreground">
                        Chave privada da integração
                      </label>
                      <label className="flex h-11 cursor-pointer items-center justify-between rounded-md border border-input bg-background px-3 text-sm transition hover:border-gold">
                        <span className="truncate text-muted-foreground">
                          {chaveNome || "Selecionar .key ou .pem"}
                        </span>
                        <span className="ml-3 text-xs font-medium text-gold">
                          Escolher
                        </span>
                        <input
                          type="file"
                          accept=".key,.pem,text/plain"
                          className="hidden"
                          onChange={(event) => {
                            void lerArquivo(event).then((arquivo) => {
                              setChaveNome(arquivo.nome);
                              setChavePrivadaPem(arquivo.conteudo);
                            });
                          }}
                        />
                      </label>
                      <p className="text-xs leading-5 text-muted-foreground">
                        Arquivo secreto que forma par com o certificado acima.
                      </p>
                    </div>
                  </div>

                  <div className="mt-7 border-t border-border pt-5">
                    <p className="text-sm font-medium">Antes de salvar</p>
                    <div className="mt-3 grid gap-x-8 gap-y-2 text-sm text-muted-foreground sm:grid-cols-2">
                      <p>• Client ID e Client Secret são da mesma integração.</p>
                      <p>• Certificado e chave privada pertencem ao mesmo par.</p>
                      <p>• As credenciais pertencem ao ambiente selecionado.</p>
                      <p>• As permissões de Pix e cobrança estão habilitadas.</p>
                      <p>• A chave Pix recebedora foi conferida.</p>
                      <p>• Nenhum dado de Produção foi misturado.</p>
                    </div>
                  </div>

                  <div className="mt-6 flex flex-col gap-3 sm:flex-row">
                    <Button
                      type="button"
                      variant="outline"
                      disabled={processando !== ""}
                      onClick={() => void salvar()}
                    >
                      {processando === "SALVAR" && (
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      )}
                      1. Salvar dados
                    </Button>

                    <Button
                      type="button"
                      disabled={
                        processando !== "" ||
                        !inter?.possuiCredenciais
                      }
                      onClick={() => void testar()}
                    >
                      {processando === "TESTAR" && (
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      )}
                      2. Testar autenticação
                    </Button>
                  </div>

                  <p className="mt-3 text-xs leading-5 text-muted-foreground">
                    O laboratório Pix será liberado somente depois que o Banco Inter
                    validar a autenticação.
                  </p>

                  <details className="mt-5 border-t border-border pt-4">
                    <summary className="cursor-pointer select-none text-sm font-medium">
                      Se a conexão falhar
                    </summary>
                    <div className="mt-3 grid gap-2 text-sm leading-6 text-muted-foreground">
                      <p>
                        <strong className="text-foreground">400:</strong> confira os
                        dados e os arquivos enviados.
                      </p>
                      <p>
                        <strong className="text-foreground">401:</strong> confira
                        Client ID, Client Secret e o par certificado/chave.
                      </p>
                      <p>
                        <strong className="text-foreground">403:</strong> confira as
                        permissões habilitadas na integração.
                      </p>
                      <p>
                        <strong className="text-foreground">429:</strong> houve muitas
                        tentativas em pouco tempo.
                      </p>
                    </div>
                  </details>

                  {inter?.ultimoErro && (
                    <div className="mt-4 border-l-2 border-destructive pl-3 text-sm text-destructive">
                      Último teste: {inter.ultimoErro}
                    </div>
                  )}
                </div>
              )}

              {inter?.status === "CONECTADA" && ambiente === "SANDBOX" && (
                <div className="mt-8 border-t border-border pt-6">
                  <div className="flex flex-col gap-4 border-b border-border pb-6 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      <p className="text-xs font-medium uppercase tracking-[0.16em] text-gold">
                        Validação da experiência
                      </p>
                      <h3 className="mt-1 text-base font-semibold">
                        Ambiente de teste do cliente
                      </h3>
                      <p className="mt-1 max-w-2xl text-sm leading-6 text-muted-foreground">
                        Entre em um checkout controlado e percorra o fluxo como se fosse
                        um cliente. Nada dessa simulação ativa assinatura real ou entra
                        nos relatórios da operação.
                      </p>
                    </div>

                    <a
                      href="/admin/teste-cliente"
                      className="inline-flex h-10 shrink-0 items-center justify-center rounded-md bg-primary px-4 text-sm font-medium text-primary-foreground transition hover:bg-primary/90"
                    >
                      Abrir ambiente de teste
                    </a>
                  </div>

                  <details className="pt-5">
                    <summary className="cursor-pointer select-none text-sm font-medium text-muted-foreground transition hover:text-foreground">
                      Laboratório técnico Pix
                    </summary>

                    <div className="pt-5">
                      <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
                        <div>
                          <p className="text-xs font-medium uppercase tracking-[0.16em] text-gold">
                            Teste técnico
                          </p>
                          <h3 className="mt-1 text-base font-semibold">
                            Laboratório Pix — Sandbox (área de testes)
                          </h3>
                          <p className="mt-1 text-sm leading-6 text-muted-foreground">
                            Gere uma cobrança imediata para validar o fluxo da integração.
                          </p>
                        </div>
                      </div>

                  <div className="mt-5 grid gap-4 md:grid-cols-[180px_1fr]">
                    <div className="space-y-2">
                      <label className="text-xs font-medium text-foreground">
                        Valor
                      </label>
                      <input
                        value={valorTeste}
                        onChange={(event) => setValorTeste(event.target.value)}
                        className="h-11 w-full rounded-md border border-input bg-background px-3 text-sm outline-none transition focus:border-gold"
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="text-xs font-medium text-foreground">
                        Descrição
                      </label>
                      <input
                        value={descricaoTeste}
                        onChange={(event) => setDescricaoTeste(event.target.value)}
                        className="h-11 w-full rounded-md border border-input bg-background px-3 text-sm outline-none transition focus:border-gold"
                      />
                    </div>
                  </div>

                  <Button
                    type="button"
                    className="mt-4"
                    disabled={processando !== ""}
                    onClick={() => void gerarCobrancaTeste()}
                  >
                    {processando === "COBRAR" && (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    )}
                    Gerar Pix Sandbox (área de testes)
                  </Button>

                  {cobranca && (
                    <div className="mt-6 border-l-2 border-gold pl-4">
                      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                        <div>
                          <p className="text-xs font-medium text-muted-foreground">
                            TXID
                          </p>
                          <p className="mt-1 break-all font-mono text-sm">
                            {cobranca.txid}
                          </p>
                        </div>

                        <span className="w-fit rounded-md border border-gold/30 bg-gold-soft px-2.5 py-1 text-xs text-gold">
                          {cobranca.status}
                        </span>
                      </div>

                      {cobranca.valorOriginal && (
                        <p className="mt-4 text-sm">
                          Valor: <strong>R$ {cobranca.valorOriginal}</strong>
                        </p>
                      )}

                      {cobranca.pixCopiaECola ? (
                        <div className="mt-4">
                          <label className="text-xs font-medium text-muted-foreground">
                            Pix copia e cola
                          </label>
                          <textarea
                            readOnly
                            value={cobranca.pixCopiaECola}
                            className="mt-2 min-h-24 w-full rounded-md border border-input bg-background p-3 font-mono text-xs"
                          />

                          <div className="mt-3 flex flex-col gap-2 sm:flex-row">
                            <Button
                              type="button"
                              variant="outline"
                              onClick={() => void copiarPix()}
                            >
                              Copiar Pix
                            </Button>

                            <Button
                              type="button"
                              variant="outline"
                              disabled={processando !== ""}
                              onClick={() => void atualizarCobranca()}
                            >
                              {processando === "CONSULTAR" && (
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                              )}
                              Consultar status
                            </Button>
                          </div>
                        </div>
                      ) : (
                        <p className="mt-4 text-sm text-muted-foreground">
                          O Sandbox (área de testes) criou a cobrança, mas não retornou Pix copia e
                          cola nesta resposta.
                        </p>
                      )}
                    </div>
                  )}
                    </div>
                  </details>
                </div>
              )}

              {inter?.status === "CONECTADA" && ambiente === "PRODUCAO" && (
                <div className="mt-8 border-t border-border pt-6">
                  <p className="text-sm font-medium text-foreground">
                    Produção conectada
                  </p>
                  <p className="mt-1 max-w-3xl text-sm leading-6 text-muted-foreground">
                    A autenticação com o ambiente real foi validada. Por segurança,
                    o laboratório Pix desta tela continua disponível somente no
                    Sandbox (área de testes).
                  </p>
                </div>
              )}

              <p className="mt-7 border-t border-border pt-4 text-xs leading-5 text-muted-foreground">
                Segurança: credenciais são armazenadas criptografadas e o access
                token permanece apenas temporariamente em memória no servidor.
              </p>
            </div>
          </section>

          <section className="rounded-lg border border-border bg-surface px-5 py-4">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h2 className="text-sm font-medium">Meta</h2>
                <p className="mt-1 text-sm text-muted-foreground">
                  WhatsApp Business e Instagram serão integrados em uma etapa futura.
                </p>
              </div>

              <span className="w-fit rounded-md border border-border bg-background px-2.5 py-1 text-xs text-muted-foreground">
                Em breve
              </span>
            </div>
          </section>
        </div>
      )}
    </div>
  );
}
