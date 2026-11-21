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
import {
  useEffect,
  useMemo,
  useState,
  type FormEvent,
} from "react";

import { PageHeader } from "@/components/dashboard/Sidebar";
import {
  adminConvidarFuncionario,
  adminListarConvitesFuncionarios,
} from "@/lib/api/convite-funcionario.functions";
import { adminListarUsuarios } from "@/lib/api/usuarios.functions";

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

type Convite = {
  id: string;
  email: string;
  expiraEm: string | Date;
  usadoEm: string | Date | null;
  criadoEm: string | Date;
};

function traduzirPapel(papel: PapelUsuario) {
  return {
    CLIENTE: "Cliente",
    FUNCIONARIO: "Funcionário",
    DONO: "Dono",
  }[papel];
}

function obterClassePapel(papel: PapelUsuario) {
  if (papel === "DONO") return "bg-gold-soft text-gold";
  if (papel === "FUNCIONARIO") return "bg-emerald-500/10 text-emerald-400";
  return "border border-border bg-background text-muted-foreground";
}

function formatarTelefone(telefone: string | null) {
  if (!telefone) return "Não informado";
  const numeros = telefone.replace(/\D/g, "");
  if (numeros.length === 11) {
    return numeros.replace(/(\d{2})(\d{5})(\d{4})/, "($1) $2-$3");
  }
  if (numeros.length === 10) {
    return numeros.replace(/(\d{2})(\d{4})(\d{4})/, "($1) $2-$3");
  }
  return telefone;
}

function AdminUsuariosPage() {
  const listarUsuarios = useServerFn(adminListarUsuarios);
  const listarConvites = useServerFn(adminListarConvitesFuncionarios);
  const convidar = useServerFn(adminConvidarFuncionario);

  const [usuarios, setUsuarios] = useState<UsuarioAdmin[]>([]);
  const [convites, setConvites] = useState<Convite[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [enviando, setEnviando] = useState(false);
  const [busca, setBusca] = useState("");
  const [mensagem, setMensagem] = useState("");
  const [erro, setErro] = useState("");

  async function carregarDados() {
    setCarregando(true);
    setErro("");

    try {
      const [usuariosResposta, convitesResposta] = await Promise.all([
        listarUsuarios(),
        listarConvites(),
      ]);

      setUsuarios(usuariosResposta as UsuarioAdmin[]);
      setConvites(convitesResposta as Convite[]);
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

  async function handleConvidar(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setEnviando(true);
    setMensagem("");
    setErro("");

    const formulario = event.currentTarget;
    const formData = new FormData(formulario);

    try {
      const resposta = await convidar({
        data: {
          email: String(formData.get("email") ?? ""),
        },
      });

      if (!resposta.sucesso) {
        setErro(resposta.mensagem);
        return;
      }

      setMensagem(resposta.mensagem);
      formulario.reset();
      await carregarDados();
    } catch (error) {
      console.error(error);
      setErro("Não foi possível enviar o convite.");
    } finally {
      setEnviando(false);
    }
  }

  const usuariosFiltrados = useMemo(() => {
    const termo = busca.trim().toLowerCase();
    if (!termo) return usuarios;

    return usuarios.filter((usuario) =>
      usuario.nome.toLowerCase().includes(termo) ||
      usuario.email.toLowerCase().includes(termo) ||
      usuario.telefone?.toLowerCase().includes(termo) ||
      usuario.papel.toLowerCase().includes(termo),
    );
  }, [usuarios, busca]);

  const resumo = useMemo(() => ({
    total: usuarios.length,
    clientes: usuarios.filter((u) => u.papel === "CLIENTE").length,
    funcionarios: usuarios.filter((u) => u.papel === "FUNCIONARIO").length,
    donos: usuarios.filter((u) => u.papel === "DONO").length,
  }), [usuarios]);

  return (
    <div className="max-w-7xl p-8 lg:p-12">
      <PageHeader
        title="Usuários"
        subtitle="Consulte contas e convide novos funcionários com acesso operacional."
      />

      {erro && (
        <div className="mb-6 rounded-md border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">
          {erro}
        </div>
      )}

      {mensagem && (
        <div className="mb-6 rounded-md border border-gold/30 bg-gold-soft px-4 py-3 text-sm text-gold">
          {mensagem}
        </div>
      )}

      <section className="mb-8 rounded-xl border border-border bg-surface p-5">
        <h2 className="text-sm font-medium">Convidar funcionário</h2>
        <p className="mt-1 text-xs text-muted-foreground">
          O e-mail pode pertencer a uma pessoa nova ou a um cliente já cadastrado. Se a conta existir, a senha atual será preservada.
        </p>

        <form
          onSubmit={handleConvidar}
          className="mt-4 flex flex-col gap-3 sm:flex-row"
        >
          <input
            name="email"
            type="email"
            required
            placeholder="funcionario@email.com"
            className="h-10 flex-1 rounded-md border border-input bg-background px-3 text-sm"
          />
          <button
            type="submit"
            disabled={enviando}
            className="h-10 rounded-md bg-primary px-4 text-sm font-medium text-primary-foreground disabled:opacity-50"
          >
            {enviando ? "Enviando..." : "Enviar convite"}
          </button>
        </form>

        {convites.length > 0 && (
          <details className="group mt-5 border-t border-border pt-4">
            <summary className="flex cursor-pointer list-none items-center justify-between rounded-md px-1 py-2 text-xs uppercase tracking-widest text-muted-foreground transition hover:text-foreground">
              <span>
                Convites recentes ({convites.length})
              </span>
              <span
                aria-hidden="true"
                className="text-lg leading-none transition-transform group-open:rotate-180"
              >
                ↓
              </span>
            </summary>

            <div className="mt-3 space-y-2">
              {convites.slice(0, 5).map((convite) => {
                const usado = Boolean(convite.usadoEm);
                const expirado =
                  !usado && new Date(convite.expiraEm) <= new Date();

                return (
                  <div
                    key={convite.id}
                    className="flex flex-col gap-1 rounded-md border border-border bg-background/40 px-3 py-3 text-sm sm:flex-row sm:items-center sm:justify-between"
                  >
                    <span>{convite.email}</span>
                    <span className="text-xs text-muted-foreground">
                      {usado
                        ? "Utilizado"
                        : expirado
                          ? "Expirado"
                          : "Pendente"}
                    </span>
                  </div>
                );
              })}
            </div>
          </details>
        )}
      </section>

      <div className="mb-8 grid gap-4 md:grid-cols-4">
        <section className="rounded-xl border border-border bg-surface p-5">
          <div className="flex items-center justify-between">
            <span className="text-xs uppercase tracking-widest text-muted-foreground">Total</span>
            <UsersRound className="h-4 w-4 text-gold" />
          </div>
          <div className="mt-3 text-3xl font-display">{carregando ? "..." : resumo.total}</div>
          <p className="mt-1 text-xs text-muted-foreground">usuários cadastrados</p>
        </section>

        <section className="rounded-xl border border-border bg-surface p-5">
          <div className="flex items-center justify-between">
            <span className="text-xs uppercase tracking-widest text-muted-foreground">Clientes</span>
            <UserRound className="h-4 w-4 text-gold" />
          </div>
          <div className="mt-3 text-3xl font-display">{carregando ? "..." : resumo.clientes}</div>
          <p className="mt-1 text-xs text-muted-foreground">contas comuns</p>
        </section>

        <section className="rounded-xl border border-border bg-surface p-5">
          <div className="flex items-center justify-between">
            <span className="text-xs uppercase tracking-widest text-muted-foreground">Funcionários</span>
            <UserCog className="h-4 w-4 text-gold" />
          </div>
          <div className="mt-3 text-3xl font-display">{carregando ? "..." : resumo.funcionarios}</div>
          <p className="mt-1 text-xs text-muted-foreground">acesso operacional</p>
        </section>

        <section className="rounded-xl border border-border bg-surface p-5">
          <div className="flex items-center justify-between">
            <span className="text-xs uppercase tracking-widest text-muted-foreground">Donos</span>
            <ShieldCheck className="h-4 w-4 text-gold" />
          </div>
          <div className="mt-3 text-3xl font-display">{carregando ? "..." : resumo.donos}</div>
          <p className="mt-1 text-xs text-muted-foreground">acesso administrativo</p>
        </section>
      </div>

      <section className="overflow-hidden rounded-xl border border-border bg-surface">
        <div className="flex flex-col gap-4 border-b border-border px-6 py-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h2 className="text-sm font-medium">Lista de usuários</h2>
            <p className="mt-1 text-xs text-muted-foreground">
              Os papéis são definidos pelo fluxo de cadastro. Não há promoção manual de contas.
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
          <div className="px-6 py-10 text-sm text-muted-foreground">
            Carregando usuários...
          </div>
        ) : usuariosFiltrados.length === 0 ? (
          <div className="px-6 py-10 text-sm text-muted-foreground">
            Nenhum usuário encontrado.
          </div>
        ) : (
          <div className="divide-y divide-border">
            {usuariosFiltrados.map((usuario) => (
              <article key={usuario.id} className="px-6 py-5">
                <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                  <div>
                    <div className="flex flex-wrap items-center gap-3">
                      <h3 className="text-lg font-display">{usuario.nome}</h3>
                      <span className={`rounded-full px-3 py-1 text-xs ${obterClassePapel(usuario.papel)}`}>
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
                        Perfil operacional:{" "}
                        <span className="text-foreground">
                          {usuario.profissional.nome}
                        </span>
                      </p>
                    )}
                  </div>

                  <div className="text-xs uppercase tracking-widest text-muted-foreground">
                    {traduzirPapel(usuario.papel)}
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}