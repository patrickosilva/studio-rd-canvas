import { useEffect, useRef, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { Link } from "@tanstack/react-router";
import { Loader2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  conectarContaGoogle,
  desconectarContaGoogle,
  entrarComGoogle,
  obterGoogleClientIdPublico,
  obterStatusGoogle,
} from "@/lib/api/google-auth.functions";

declare global {
  interface Window {
    google?: {
      accounts: {
        id: {
          initialize: (config: {
            client_id: string;
            callback: (response: { credential?: string }) => void;
          }) => void;
          renderButton: (
            parent: HTMLElement,
            options: {
              type: "standard";
              theme: "outline";
              size: "large";
              text: "continue_with";
              width: number;
            },
          ) => void;
        };
      };
    };
  }
}

let scriptPromise: Promise<void> | null = null;

function carregarGoogle() {
  if (window.google?.accounts?.id) return Promise.resolve();
  if (scriptPromise) return scriptPromise;

  scriptPromise = new Promise<void>((resolve, reject) => {
    const script = document.createElement("script");
    script.src = "https://accounts.google.com/gsi/client";
    script.async = true;
    script.defer = true;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error("Falha ao carregar Google."));
    document.head.appendChild(script);
  });

  return scriptPromise;
}

function GoogleButton({
  onCredential,
  onErro,
}: {
  onCredential: (credential: string) => Promise<void>;
  onErro: (mensagem: string) => void;
}) {
  const obterClientId = useServerFn(obterGoogleClientIdPublico);
  const ref = useRef<HTMLDivElement>(null);
  const [carregando, setCarregando] = useState(true);

  useEffect(() => {
    let cancelado = false;

    async function iniciar() {
      try {
        const [{ clientId }] = await Promise.all([
          obterClientId(),
          carregarGoogle(),
        ]);

        if (
          cancelado ||
          !ref.current ||
          !window.google?.accounts?.id
        ) {
          return;
        }

        ref.current.innerHTML = "";

        window.google.accounts.id.initialize({
          client_id: clientId,
          callback: (response) => {
            if (!response.credential) {
              onErro("O Google não retornou uma credencial válida.");
              return;
            }

            void onCredential(response.credential);
          },
        });

        window.google.accounts.id.renderButton(ref.current, {
          type: "standard",
          theme: "outline",
          size: "large",
          text: "continue_with",
          width: 340,
        });
      } catch (error) {
        console.error(error);
        onErro("Login com Google indisponível no momento.");
      } finally {
        if (!cancelado) setCarregando(false);
      }
    }

    void iniciar();
    return () => {
      cancelado = true;
    };
  }, [obterClientId, onCredential, onErro]);

  return (
    <div className="flex min-h-11 items-center justify-center">
      {carregando && (
        <span className="flex items-center gap-2 text-sm text-muted-foreground">
          <Loader2 className="h-4 w-4 animate-spin" />
          Carregando Google...
        </span>
      )}
      <div ref={ref} className={carregando ? "hidden" : ""} />
    </div>
  );
}

export function GoogleLoginButton({
  manterConectado,
  redirect,
  onErro,
}: {
  manterConectado: boolean;
  redirect?: string;
  onErro: (mensagem: string) => void;
}) {
  const entrar = useServerFn(entrarComGoogle);

  const [processando, setProcessando] = useState(false);
  const [credentialPendente, setCredentialPendente] =
    useState<string | null>(null);
  const [aceitouTermos, setAceitouTermos] = useState(false);

  async function autenticar(
    credential: string,
    aceitarTermos = false,
  ) {
    setProcessando(true);
    onErro("");

    try {
      const resultado = await entrar({
        data: {
          credential,
          manterConectado,
          redirect,
          aceitarTermos,
        },
      });

      if (!resultado.sucesso) {
        if (
          "exigeAceiteTermos" in resultado &&
          resultado.exigeAceiteTermos
        ) {
          setCredentialPendente(credential);
          setAceitouTermos(false);
          onErro("");
          return;
        }

        onErro(resultado.mensagem);
        return;
      }

      setCredentialPendente(null);
      window.location.assign(resultado.destino);
    } catch (error) {
      console.error(error);
      onErro("Não foi possível entrar com Google.");
    } finally {
      setProcessando(false);
    }
  }

  if (credentialPendente) {
    return (
      <div className="rounded-xl border border-border bg-background/50 p-4">
        <p className="text-sm font-medium text-foreground">
          Antes de criar sua conta
        </p>

        <p className="mt-2 text-xs leading-5 text-muted-foreground">
          O Google confirmou sua identidade. Para concluir o primeiro
          cadastro no Studio RD, leia e aceite os Termos de Uso.
        </p>

        <label className="mt-4 flex items-start gap-3 text-sm leading-6 text-muted-foreground">
          <input
            type="checkbox"
            checked={aceitouTermos}
            onChange={(event) =>
              setAceitouTermos(event.target.checked)
            }
            className="mt-1 h-4 w-4 shrink-0 rounded border-input accent-primary"
          />

          <span>
            Li e aceito os{" "}
            <Link
              to="/termos"
              target="_blank"
              className="font-medium text-foreground underline"
            >
              Termos de Uso
            </Link>
            . Consulte também a{" "}
            <Link
              to="/privacidade"
              target="_blank"
              className="font-medium text-foreground underline"
            >
              Política de Privacidade
            </Link>{" "}
            e a{" "}
            <Link
              to="/cookies"
              target="_blank"
              className="font-medium text-foreground underline"
            >
              Política de Cookies
            </Link>
            .
          </span>
        </label>

        <div className="mt-4 flex flex-col gap-2 sm:flex-row">
          <Button
            type="button"
            disabled={!aceitouTermos || processando}
            onClick={() =>
              void autenticar(credentialPendente, true)
            }
            className="flex-1"
          >
            {processando
              ? "Criando conta..."
              : "Criar conta e continuar"}
          </Button>

          <Button
            type="button"
            variant="outline"
            disabled={processando}
            onClick={() => {
              setCredentialPendente(null);
              setAceitouTermos(false);
            }}
          >
            Cancelar
          </Button>
        </div>
      </div>
    );
  }

  if (processando) {
    return (
      <div className="flex h-11 items-center justify-center gap-2 rounded-md border text-sm text-muted-foreground">
        <Loader2 className="h-4 w-4 animate-spin" />
        Entrando com Google...
      </div>
    );
  }

  return (
    <GoogleButton
      onCredential={(credential) =>
        autenticar(credential, false)
      }
      onErro={onErro}
    />
  );
}

export function GoogleAccountCard() {
  const statusFn = useServerFn(obterStatusGoogle);
  const conectar = useServerFn(conectarContaGoogle);
  const desconectar = useServerFn(desconectarContaGoogle);

  const [carregando, setCarregando] = useState(true);
  const [conectado, setConectado] = useState(false);
  const [emailGoogle, setEmailGoogle] = useState<string | null>(null);
  const [temSenha, setTemSenha] = useState(false);
  const [mensagem, setMensagem] = useState("");
  const [erro, setErro] = useState("");

  async function atualizar() {
    setCarregando(true);
    const status = await statusFn();
    setConectado(status.conectado);
    setEmailGoogle(status.emailGoogle);
    setTemSenha(status.temSenha);
    setCarregando(false);
  }

  useEffect(() => {
    void atualizar();
  }, []);

  async function vincular(credential: string) {
    setErro("");
    setMensagem("");
    const resultado = await conectar({ data: { credential } });

    if (!resultado.sucesso) {
      setErro(resultado.mensagem);
      return;
    }

    setMensagem(resultado.mensagem);
    await atualizar();
  }

  async function remover() {
    setErro("");
    setMensagem("");
    const resultado = await desconectar();

    if (!resultado.sucesso) {
      setErro(resultado.mensagem);
      return;
    }

    setMensagem(resultado.mensagem);
    await atualizar();
  }

  return (
    <section className="mt-6 rounded-2xl border border-border bg-surface p-6">
      <h2 className="text-lg font-medium">Login com Google</h2>
      <p className="mt-2 text-sm text-muted-foreground">
        Adicione o Google como outra forma de entrar. Seus dados do
        Studio RD não serão sobrescritos.
      </p>

      {erro && (
        <p className="mt-4 text-sm text-destructive" role="alert">
          {erro}
        </p>
      )}

      {mensagem && (
        <p className="mt-4 text-sm text-gold">{mensagem}</p>
      )}

      {carregando ? (
        <div className="mt-5 flex items-center gap-2 text-sm text-muted-foreground">
          <Loader2 className="h-4 w-4 animate-spin" />
          Consultando...
        </div>
      ) : conectado ? (
        <div className="mt-5 space-y-4">
          <div className="rounded-xl border border-gold/25 bg-gold-soft p-4">
            <p className="text-sm font-medium text-gold">
              Google conectado
            </p>
            <p className="mt-1 text-sm text-muted-foreground">
              {emailGoogle}
            </p>
          </div>

          <Button
            type="button"
            variant="outline"
            disabled={!temSenha}
            onClick={() => void remover()}
          >
            Desconectar Google
          </Button>

          {!temSenha && (
            <p className="text-xs text-muted-foreground">
              Esta conta depende do Google para entrar. Primeiro crie
              uma senha na futura área Minha Conta.
            </p>
          )}
        </div>
      ) : (
        <div className="mt-5 max-w-sm">
          <GoogleButton onCredential={vincular} onErro={setErro} />
          <p className="mt-3 text-xs text-muted-foreground">
            Use uma Conta Google com o mesmo e-mail cadastrado no
            Studio RD.
          </p>
        </div>
      )}
    </section>
  );
}
