import {
  useEffect,
  useMemo,
  useState,
} from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import {
  Mail,
  Phone,
  ShieldCheck,
  UserCog,
  UserRound,
  UsersRound,
} from "lucide-react";

import { PageHeader } from "@/components/dashboard/Sidebar";
import {
  adminAlterarPapelUsuario,
  adminListarUsuarios,
} from "@/lib/api/usuarios.functions";

export const Route = createFileRoute("/admin/usuarios")({
  component: AdminUsuariosPage,
});

type PapelUsuario = "CLIENTE" | "FUNCIONARIO" | "DONO";

type UsuarioAdmin = {
  id: string;
  nome: string;
  email: string;
  telefone: string | null;
  papel: PapelUsuario;
  ativo: boolean;
  criadoEm: string | Date;
  atualizadoEm: string | Date;
  profissional: {
    id: string;
    nome: string;
    ativo: boolean;
  } | null;
};

const papeis = [
  {
    value: "CLIENTE",
    label: "Cliente",
  },
  {
    value: "FUNCIONARIO",
    label: "Funcionário",
  },
  {
    value: "DONO",
    label: "Dono",
  },
] as const;

function traduzirPapel(papel: PapelUsuario): string {
  const mapa: Record<PapelUsuario, string> = {
    CLIENTE: "Cliente",
    FUNCIONARIO: "Funcionário",
    DONO: "Dono",
  };

  return mapa[papel];
}

function obterClassePapel(papel: PapelUsuario): string {
  if (papel === "DONO") {
    return "bg-gold-soft text-gold";
  }

  if (papel === "FUNCIONARIO") {
    return "bg-emerald-500/10 text-emerald-400";
  }

  return "border border-border bg-background text-muted-foreground";
}

function formatarTelefone(telefone: string | null): string {
  if (!telefone) {
    return "Não informado";
  }

  const numeros = telefone.replace(/\D/g, "");

  if (numeros.length === 11) {
    return numeros.replace(
      /(\d{2})(\d{5})(\d{4})/,
      "($1) $2-$3",
    );
  }

  if (numeros.length === 10) {
    return numeros.replace(
      /(\d{2})(\d{4})(\d{4})/,
      "($1) $2-$3",
    );
  }

  return telefone;
}

function AdminUsuariosPage() {
  const listarUsuarios = useServerFn(adminListarUsuarios);
  const alterarPapelUsuario = useServerFn(
    adminAlterarPapelUsuario,
  );

  const [usuarios, setUsuarios] = useState<UsuarioAdmin[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [processandoId, setProcessandoId] = useState("");
  const [busca, setBusca] = useState("");
  const [mensagem, setMensagem] = useState("");
  const [erro, setErro] = useState("");

  async function carregarDados() {
    setCarregando(true);
    setErro("");

    try {
      const resposta = await listarUsuarios();

      setUsuarios(resposta);
    } catch (error) {
      console.error(error);

      setErro("Não foi possível carregar os usuários.");
    } finally {
      setCarregando(false);
    }
  }

  useEffect(() => {
    void carregarDados();
  }, []);

  async function handleAlterarPapel(
    usuarioId: string,
    papel: PapelUsuario,
  ) {
    setMensagem("");
    setErro("");
    setProcessandoId(usuarioId);

    try {
      const resultado = await alterarPapelUsuario({
        data: {
          usuarioId,
          papel,
        },
      });

      if (!resultado.sucesso) {
        setErro(resultado.mensagem);
        return;
      }

      setMensagem(resultado.mensagem);

      await carregarDados();
    } catch (error) {
      console.error(error);

      setErro("Não foi possível alterar o papel do usuário.");
    } finally {
      setProcessandoId("");
    }
  }

  const usuariosFiltrados = useMemo(() => {
    const termo = busca.trim().toLowerCase();

    if (!termo) {
      return usuarios;
    }

    return usuarios.filter((usuario) => {
      return (
        usuario.nome.toLowerCase().includes(termo) ||
        usuario.email.toLowerCase().includes(termo) ||
        usuario.telefone?.toLowerCase().includes(termo) ||
        usuario.papel.toLowerCase().includes(termo)
      );
    });
  }, [usuarios, busca]);

  const resumo = useMemo(() => {
    return {
      total: usuarios.length,
      clientes: usuarios.filter(
        (usuario) => usuario.papel === "CLIENTE",
      ).length,
      funcionarios: usuarios.filter(
        (usuario) => usuario.papel === "FUNCIONARIO",
      ).length,
      donos: usuarios.filter(
        (usuario) => usuario.papel === "DONO",
      ).length,
    };
  }, [usuarios]);

  return (
    <div className="max-w-7xl p-8 lg:p-12">
      <PageHeader
        title="Usuários"
        subtitle="Gerencie clientes, funcionários e permissões de acesso do sistema."
      />

      {erro && (
        <div
          role="alert"
          className="mb-6 rounded-xl border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive"
        >
          {erro}
        </div>
      )}

      {mensagem && (
        <div className="mb-6 rounded-xl border border-gold/30 bg-gold-soft px-4 py-3 text-sm text-gold">
          {mensagem}
        </div>
      )}

      <div className="mb-8 grid gap-4 md:grid-cols-4">
        <section className="rounded-2xl border border-border bg-surface p-5">
          <div className="flex items-center justify-between">
            <span className="text-xs uppercase tracking-widest text-muted-foreground">
              Total
            </span>

            <UsersRound className="h-4 w-4 text-gold" />
          </div>

          <div className="mt-3 text-3xl font-display">
            {carregando ? "..." : resumo.total}
          </div>

          <p className="mt-1 text-xs text-muted-foreground">
            usuários cadastrados
          </p>
        </section>

        <section className="rounded-2xl border border-border bg-surface p-5">
          <div className="flex items-center justify-between">
            <span className="text-xs uppercase tracking-widest text-muted-foreground">
              Clientes
            </span>

            <UserRound className="h-4 w-4 text-gold" />
          </div>

          <div className="mt-3 text-3xl font-display">
            {carregando ? "..." : resumo.clientes}
          </div>

          <p className="mt-1 text-xs text-muted-foreground">
            contas comuns
          </p>
        </section>

        <section className="rounded-2xl border border-border bg-surface p-5">
          <div className="flex items-center justify-between">
            <span className="text-xs uppercase tracking-widest text-muted-foreground">
              Funcionários
            </span>

            <UserCog className="h-4 w-4 text-gold" />
          </div>

          <div className="mt-3 text-3xl font-display">
            {carregando ? "..." : resumo.funcionarios}
          </div>

          <p className="mt-1 text-xs text-muted-foreground">
            acesso operacional
          </p>
        </section>

        <section className="rounded-2xl border border-border bg-surface p-5">
          <div className="flex items-center justify-between">
            <span className="text-xs uppercase tracking-widest text-muted-foreground">
              Donos
            </span>

            <ShieldCheck className="h-4 w-4 text-gold" />
          </div>

          <div className="mt-3 text-3xl font-display">
            {carregando ? "..." : resumo.donos}
          </div>

          <p className="mt-1 text-xs text-muted-foreground">
            acesso administrativo
          </p>
        </section>
      </div>

      <section className="overflow-hidden rounded-2xl border border-border bg-surface">
        <div className="flex flex-col gap-4 border-b border-border px-6 py-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h2 className="text-sm font-medium">
              Lista de usuários
            </h2>

            <p className="mt-1 text-xs text-muted-foreground">
              Altere o papel de acesso de cada usuário conforme a função dele na barbearia.
            </p>
          </div>

          <input
            value={busca}
            onChange={(event) => setBusca(event.target.value)}
            placeholder="Buscar por nome, e-mail ou papel"
            className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm md:w-80"
          />
        </div>

        {carregando ? (
          <div className="px-6 py-10">
            <p className="text-sm text-muted-foreground">
              Carregando usuários...
            </p>
          </div>
        ) : usuariosFiltrados.length === 0 ? (
          <div className="flex min-h-64 flex-col items-center justify-center px-6 py-10 text-center">
            <UsersRound className="h-10 w-10 text-muted-foreground" />

            <h3 className="mt-4 text-lg font-display">
              Nenhum usuário encontrado
            </h3>

            <p className="mt-2 max-w-md text-sm text-muted-foreground">
              Tente buscar por outro nome, e-mail ou papel.
            </p>
          </div>
        ) : (
          <div className="divide-y divide-border">
            {usuariosFiltrados.map((usuario) => {
              const processando =
                processandoId === usuario.id;

              return (
                <article
                  key={usuario.id}
                  className="px-6 py-5"
                >
                  <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
                    <div>
                      <div className="flex flex-wrap items-center gap-3">
                        <h3 className="text-lg font-display">
                          {usuario.nome}
                        </h3>

                        <span
                          className={`rounded-full px-3 py-1 text-xs ${obterClassePapel(
                            usuario.papel,
                          )}`}
                        >
                          {traduzirPapel(usuario.papel)}
                        </span>

                        {!usuario.ativo && (
                          <span className="rounded-full bg-destructive/10 px-3 py-1 text-xs text-destructive">
                            Inativo
                          </span>
                        )}
                      </div>

                      <div className="mt-3 grid gap-2 text-sm text-muted-foreground md:grid-cols-2">
                        <p className="flex items-center gap-2">
                          <Mail className="h-4 w-4 text-gold" />
                          {usuario.email}
                        </p>

                        <p className="flex items-center gap-2">
                          <Phone className="h-4 w-4 text-gold" />
                          {formatarTelefone(usuario.telefone)}
                        </p>
                      </div>

                      {usuario.profissional && (
                        <p className="mt-3 text-xs text-muted-foreground">
                          Vinculado ao profissional:{" "}
                          <span className="text-foreground">
                            {usuario.profissional.nome}
                          </span>
                        </p>
                      )}
                    </div>

                    <div className="w-full lg:w-64">
                      <label className="text-xs uppercase tracking-widest text-muted-foreground">
                        Papel no sistema
                      </label>

                      <select
                        value={usuario.papel}
                        disabled={processando}
                        onChange={(event) =>
                          void handleAlterarPapel(
                            usuario.id,
                            event.target.value as PapelUsuario,
                          )
                        }
                        className="mt-2 h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
                      >
                        {papeis.map((papel) => (
                          <option
                            key={papel.value}
                            value={papel.value}
                          >
                            {papel.label}
                          </option>
                        ))}
                      </select>

                      {processando && (
                        <p className="mt-2 text-xs text-muted-foreground">
                          Atualizando permissão...
                        </p>
                      )}
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
}