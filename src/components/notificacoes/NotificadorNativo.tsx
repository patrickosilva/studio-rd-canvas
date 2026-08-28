import {
  useEffect,
  useRef,
  useState,
} from "react";
import { useServerFn } from "@tanstack/react-start";

import { Button } from "@/components/ui/button";
import {
  funcionarioListarNotificacoes,
  funcionarioMarcarNotificacaoComoLida,
} from "@/lib/api/notificacao.functions";

type Notificacao = {
  id: string;
  titulo: string;
  mensagem: string;
  link: string | null;
  tipo: string;
  lida: boolean;
  criadoEm: string | Date;
};

const STORAGE_ATIVO = "studio-rd-notificacoes-nativas-ativas";
const STORAGE_IDS = "studio-rd-notificacoes-nativas-ids";

function lerIdsJaNotificados(): string[] {
  if (typeof window === "undefined") {
    return [];
  }

  try {
    const bruto = window.localStorage.getItem(STORAGE_IDS);

    if (!bruto) {
      return [];
    }

    const ids = JSON.parse(bruto);

    if (!Array.isArray(ids)) {
      return [];
    }

    return ids.filter((id) => typeof id === "string");
  } catch {
    return [];
  }
}

function salvarIdsJaNotificados(ids: string[]) {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.setItem(
    STORAGE_IDS,
    JSON.stringify(ids.slice(-100)),
  );
}

export function NotificadorNativo() {
  const listarNotificacoes = useServerFn(
    funcionarioListarNotificacoes,
  );

  const marcarComoLida = useServerFn(
    funcionarioMarcarNotificacaoComoLida,
  );

  const [suportaNotificacao, setSuportaNotificacao] =
    useState(false);
  const [habilitado, setHabilitado] = useState(false);
  const [permissao, setPermissao] =
    useState<NotificationPermission>("default");

  const idsJaNotificados = useRef<Set<string>>(new Set());

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    const temSuporte = "Notification" in window;

    setSuportaNotificacao(temSuporte);

    if (!temSuporte) {
      return;
    }

    setPermissao(Notification.permission);
    idsJaNotificados.current = new Set(lerIdsJaNotificados());

    const estavaAtivo =
      window.localStorage.getItem(STORAGE_ATIVO) === "true";

    if (estavaAtivo && Notification.permission === "granted") {
      setHabilitado(true);
    }
  }, []);

  async function ativarNotificacoes() {
    if (
      typeof window === "undefined" ||
      !("Notification" in window)
    ) {
      return;
    }

    const resultado = await Notification.requestPermission();

    setPermissao(resultado);

    if (resultado === "granted") {
      window.localStorage.setItem(STORAGE_ATIVO, "true");
      setHabilitado(true);

      new Notification("Notificações ativadas", {
        body: "Você receberá avisos de novos agendamentos aqui.",
        tag: "studio-rd-notificacoes-ativadas",
      });
    }
  }

  useEffect(() => {
    if (!habilitado || permissao !== "granted") {
      return;
    }

    let ativo = true;

    async function verificarNotificacoes() {
      try {
        const notificacoes =
          (await listarNotificacoes()) as Notificacao[];

        if (!ativo) {
          return;
        }

        const novas = notificacoes
          .filter((notificacao) => !notificacao.lida)
          .filter(
            (notificacao) =>
              !idsJaNotificados.current.has(notificacao.id),
          )
          .reverse();

        if (novas.length === 0) {
          return;
        }

        for (const notificacao of novas) {
          idsJaNotificados.current.add(notificacao.id);

          const popup = new Notification(notificacao.titulo, {
            body: notificacao.mensagem,
            tag: notificacao.id,
          });

          popup.onclick = () => {
            window.focus();

            void marcarComoLida({
              data: {
                notificacaoId: notificacao.id,
              },
            });

            if (notificacao.link) {
              window.location.href = notificacao.link;
            }

            popup.close();
          };
        }

        salvarIdsJaNotificados(
          Array.from(idsJaNotificados.current),
        );
      } catch (error) {
        console.error(
          "Erro ao buscar notificações nativas:",
          error,
        );
      }
    }

    void verificarNotificacoes();

    const intervalo = window.setInterval(() => {
      void verificarNotificacoes();
    }, 10000);

    return () => {
      ativo = false;
      window.clearInterval(intervalo);
    };
  }, [
    habilitado,
    permissao,
    listarNotificacoes,
    marcarComoLida,
  ]);

  if (!suportaNotificacao) {
    return null;
  }

  if (habilitado && permissao === "granted") {
    return null;
  }

  return (
    <div className="fixed bottom-4 right-4 z-50 max-w-xs rounded-2xl border border-border bg-surface p-4 shadow-xl">
      <p className="text-sm font-medium">
        Ativar notificações
      </p>

      <p className="mt-1 text-xs text-muted-foreground">
        Receba avisos de novos agendamentos no canto da tela.
      </p>

      <Button
        type="button"
        onClick={() => void ativarNotificacoes()}
        className="mt-3 h-9 w-full rounded-xl text-xs"
      >
        Ativar no navegador
      </Button>

      {permissao === "denied" && (
        <p className="mt-2 text-xs text-destructive">
          As notificações estão bloqueadas no navegador.
        </p>
      )}
    </div>
  );
}