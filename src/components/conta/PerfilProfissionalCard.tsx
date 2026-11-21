import {
  Camera,
  ImagePlus,
  Trash2,
  UserRound,
} from "lucide-react";
import {
  useEffect,
  useRef,
  useState,
  type ChangeEvent,
} from "react";
import { useServerFn } from "@tanstack/react-start";

import { Button } from "@/components/ui/button";
import {
  atualizarMeuPerfilProfissional,
  obterMeuPerfilProfissional,
} from "@/lib/api/perfil-profissional.functions";

const TAMANHO_FINAL = 512;
const MAX_ARQUIVO_ORIGINAL = 8 * 1024 * 1024;

async function imagemParaWebpQuadrado(
  arquivo: File,
): Promise<string> {
  if (!arquivo.type.startsWith("image/")) {
    throw new Error("Selecione um arquivo de imagem.");
  }

  if (arquivo.size > MAX_ARQUIVO_ORIGINAL) {
    throw new Error("A foto original pode ter no máximo 8 MB.");
  }

  const url = URL.createObjectURL(arquivo);

  try {
    const imagem = await new Promise<HTMLImageElement>(
      (resolve, reject) => {
        const img = new Image();

        img.onload = () => resolve(img);
        img.onerror = () =>
          reject(new Error("Não foi possível ler a imagem."));
        img.src = url;
      },
    );

    const canvas = document.createElement("canvas");
    canvas.width = TAMANHO_FINAL;
    canvas.height = TAMANHO_FINAL;

    const contexto = canvas.getContext("2d");

    if (!contexto) {
      throw new Error("Não foi possível preparar a foto.");
    }

    const lado = Math.min(
      imagem.naturalWidth,
      imagem.naturalHeight,
    );
    const origemX = (imagem.naturalWidth - lado) / 2;
    const origemY = (imagem.naturalHeight - lado) / 2;

    contexto.drawImage(
      imagem,
      origemX,
      origemY,
      lado,
      lado,
      0,
      0,
      TAMANHO_FINAL,
      TAMANHO_FINAL,
    );

    const resultado = canvas.toDataURL("image/webp", 0.82);

    if (resultado.length > 650_000) {
      throw new Error(
        "A foto continuou muito grande após a compressão. Escolha outra imagem.",
      );
    }

    return resultado;
  } finally {
    URL.revokeObjectURL(url);
  }
}

export function PerfilProfissionalCard() {
  const buscarPerfil = useServerFn(
    obterMeuPerfilProfissional,
  );
  const atualizarPerfil = useServerFn(
    atualizarMeuPerfilProfissional,
  );

  const inputRef = useRef<HTMLInputElement>(null);

  const [nome, setNome] = useState("");
  const [descricao, setDescricao] = useState("");
  const [fotoUrl, setFotoUrl] = useState("");
  const [encontrado, setEncontrado] = useState<boolean | null>(
    null,
  );
  const [processando, setProcessando] = useState(false);
  const [mensagem, setMensagem] = useState("");
  const [erro, setErro] = useState("");

  async function carregar() {
    setErro("");

    try {
      const resposta = await buscarPerfil();

      setEncontrado(resposta.encontrado);

      if (!resposta.encontrado) {
        setErro(resposta.mensagem);
        return;
      }

      setNome(resposta.profissional.nome);
      setDescricao(resposta.profissional.descricao ?? "");
      setFotoUrl(resposta.profissional.fotoUrl ?? "");
    } catch (error) {
      console.error(error);
      setEncontrado(false);
      setErro("Não foi possível carregar o perfil profissional.");
    }
  }

  useEffect(() => {
    void carregar();
  }, []);

  async function selecionarFoto(
    event: ChangeEvent<HTMLInputElement>,
  ) {
    const arquivo = event.target.files?.[0];

    if (!arquivo) {
      return;
    }

    setErro("");
    setMensagem("");
    setProcessando(true);

    try {
      const imagem = await imagemParaWebpQuadrado(arquivo);
      setFotoUrl(imagem);
      setMensagem(
        "Foto preparada. Clique em “Salvar perfil profissional” para publicar.",
      );
    } catch (error) {
      setErro(
        error instanceof Error
          ? error.message
          : "Não foi possível preparar a foto.",
      );
    } finally {
      setProcessando(false);

      if (inputRef.current) {
        inputRef.current.value = "";
      }
    }
  }

  async function salvar() {
    setProcessando(true);
    setMensagem("");
    setErro("");

    try {
      const resposta = await atualizarPerfil({
        data: {
          descricao,
          fotoUrl,
        },
      });

      setMensagem(resposta.mensagem);
      setFotoUrl(resposta.profissional.fotoUrl ?? "");
      setDescricao(resposta.profissional.descricao ?? "");
    } catch (error) {
      console.error(error);
      setErro(
        error instanceof Error
          ? error.message
          : "Não foi possível atualizar o perfil profissional.",
      );
    } finally {
      setProcessando(false);
    }
  }

  if (encontrado === null) {
    return (
      <section className="rounded-2xl border border-border bg-surface p-6 md:p-8">
        <p className="text-sm text-muted-foreground">
          Carregando perfil profissional...
        </p>
      </section>
    );
  }

  if (!encontrado) {
    return (
      <section className="rounded-2xl border border-border bg-surface p-6 md:p-8">
        <div className="flex items-center gap-3">
          <UserRound className="h-5 w-5 text-gold" />
          <div>
            <h2 className="font-medium">
              Perfil profissional
            </h2>
            <p className="mt-1 text-sm text-muted-foreground">
              {erro ||
                "Sua conta ainda não possui um perfil profissional vinculado."}
            </p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="rounded-2xl border border-border bg-surface p-6 md:p-8">
      <div className="mb-6 flex items-center gap-3">
        <Camera className="h-5 w-5 text-gold" />

        <div>
          <h2 className="font-medium">
            Perfil profissional
          </h2>

          <p className="text-sm text-muted-foreground">
            Esta foto e descrição são usadas na área operacional e na escolha do barbeiro.
          </p>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-[150px_1fr]">
        <div>
          <div className="grid h-32 w-32 place-items-center overflow-hidden rounded-full border border-border bg-background">
            {fotoUrl ? (
              <img
                src={fotoUrl}
                alt={`Foto profissional de ${nome}`}
                className="h-full w-full object-cover"
              />
            ) : (
              <UserRound className="h-12 w-12 text-muted-foreground" />
            )}
          </div>

          <input
            ref={inputRef}
            type="file"
            accept="image/png,image/jpeg,image/webp"
            className="hidden"
            onChange={(event) => void selecionarFoto(event)}
          />

          <div className="mt-3 flex flex-col gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={processando}
              onClick={() => inputRef.current?.click()}
            >
              <ImagePlus className="mr-2 h-4 w-4" />
              {fotoUrl ? "Trocar foto" : "Adicionar foto"}
            </Button>

            {fotoUrl && (
              <Button
                type="button"
                variant="outline"
                size="sm"
                disabled={processando}
                onClick={() => {
                  setFotoUrl("");
                  setMensagem(
                    "Foto removida da prévia. Salve para confirmar.",
                  );
                }}
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Remover foto
              </Button>
            )}
          </div>
        </div>

        <div className="space-y-5">
          <div>
            <p className="text-xs uppercase tracking-widest text-muted-foreground">
              Nome exibido
            </p>
            <p className="mt-2 font-medium">
              {nome}
            </p>
            <p className="mt-1 text-xs text-muted-foreground">
              O nome e o telefone acompanham os dados principais da sua conta.
            </p>
          </div>

          <div className="space-y-2">
            <label
              htmlFor="perfil-profissional-descricao"
              className="text-sm font-medium"
            >
              Descrição profissional
            </label>

            <textarea
              id="perfil-profissional-descricao"
              value={descricao}
              maxLength={500}
              onChange={(event) =>
                setDescricao(event.target.value)
              }
              placeholder="Ex.: Especialista em degradê, tesoura e barba."
              className="min-h-28 w-full rounded-md border border-input bg-background px-3 py-2 text-sm outline-none transition focus:border-gold"
            />

            <p className="text-xs text-muted-foreground">
              {descricao.length}/500
            </p>
          </div>

          {mensagem && (
            <p className="text-sm text-emerald-500">
              {mensagem}
            </p>
          )}

          {erro && (
            <p className="text-sm text-destructive">
              {erro}
            </p>
          )}

          <Button
            type="button"
            disabled={processando}
            onClick={() => void salvar()}
          >
            {processando
              ? "Salvando..."
              : "Salvar perfil profissional"}
          </Button>
        </div>
      </div>
    </section>
  );
}