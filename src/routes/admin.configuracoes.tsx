import {
  useEffect,
  useState,
  type FormEvent,
} from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import {
  Clock,
  Plus,
  Scissors,
  Trash2,
  UserRound,
} from "lucide-react";

import { PageHeader } from "@/components/dashboard/Sidebar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  adminDesativarProfissional,
  adminDesativarServico,
  cadastrarProfissional,
  cadastrarServico,
  listarProfissionais,
  listarServicos,
} from "@/lib/api/catalogo.functions";

export const Route = createFileRoute("/admin/configuracoes")({
  component: ConfiguracoesPage,
});

type Servico = {
  id: string;
  nome: string;
  descricao: string | null;
  duracaoMinutos: number;
  precoCentavos: number;
  ativo: boolean;
};

type Profissional = {
  id: string;
  nome: string;
  telefone: string | null;
  descricao: string | null;
  ativo: boolean;
  usuario?: {
    id: string;
    nome: string;
    email: string;
    papel: string;
  } | null;
};

function formatarMoeda(precoCentavos: number): string {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(precoCentavos / 100);
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

function converterPrecoParaCentavos(valor: string): number {
  const limpo = valor
    .trim()
    .replace(/\./g, "")
    .replace(",", ".");

  const numero = Number(limpo);

  if (!Number.isFinite(numero)) {
    return 0;
  }

  return Math.round(numero * 100);
}

function ConfiguracoesPage() {
  const carregarServicos = useServerFn(listarServicos);
  const carregarProfissionais = useServerFn(listarProfissionais);
  const criarServico = useServerFn(cadastrarServico);
  const criarProfissional = useServerFn(cadastrarProfissional);
  const desativarServico = useServerFn(adminDesativarServico);
  const desativarProfissional = useServerFn(
    adminDesativarProfissional,
  );

  const [servicos, setServicos] = useState<Servico[]>([]);
  const [profissionais, setProfissionais] = useState<Profissional[]>([]);

  const [carregando, setCarregando] = useState(true);
  const [salvandoServico, setSalvandoServico] = useState(false);
  const [salvandoProfissional, setSalvandoProfissional] = useState(false);
  const [removendoServicoId, setRemovendoServicoId] = useState("");
  const [removendoProfissionalId, setRemovendoProfissionalId] =
    useState("");



  const [mensagemServico, setMensagemServico] = useState("");
  const [mensagemProfissional, setMensagemProfissional] = useState("");
  const [erro, setErro] = useState("");

  async function carregarDados() {
    setCarregando(true);
    setErro("");

    try {
      const [servicosResposta, profissionaisResposta] =
        await Promise.all([
          carregarServicos(),
          carregarProfissionais(),
        ]);

      setServicos(servicosResposta);
      setProfissionais(profissionaisResposta);
    } catch (error) {
      console.error(error);

      setErro(
        "Não foi possível carregar as configurações.",
      );
    } finally {
      setCarregando(false);
    }
  }

  useEffect(() => {
    void carregarDados();
  }, []);


  async function handleCadastrarServico(
    event: FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();

    setSalvandoServico(true);
    setMensagemServico("");

    const formulario = event.currentTarget;
    const formData = new FormData(formulario);

    const precoCentavos = converterPrecoParaCentavos(
      String(formData.get("preco") ?? ""),
    );

    try {
      const resultado = await criarServico({
        data: {
          nome: String(formData.get("nome") ?? ""),
          descricao: String(formData.get("descricao") ?? ""),
          duracaoMinutos: Number(
            formData.get("duracaoMinutos") ?? 0,
          ),
          precoCentavos,
          ativo: true,
        },
      });

      setMensagemServico(resultado.mensagem);

      if (resultado.sucesso) {
        formulario.reset();
        await carregarDados();
      }
    } catch (error) {
      console.error(error);

      setMensagemServico(
        "Não foi possível cadastrar o serviço.",
      );
    } finally {
      setSalvandoServico(false);
    }
  }
async function handleCadastrarProfissional(
  event: FormEvent<HTMLFormElement>,
) {
  event.preventDefault();

  setSalvandoProfissional(true);
  setMensagemProfissional("");

  const formulario = event.currentTarget;
  const formData = new FormData(formulario);

  try {
    const resultado = await criarProfissional({
      data: {
        nome: String(formData.get("nome") ?? ""),
        telefone: String(formData.get("telefone") ?? ""),
        descricao: String(formData.get("descricao") ?? ""),
        ativo: true,
      },
    });

    setMensagemProfissional(resultado.mensagem);

    if (resultado.sucesso) {
      formulario.reset();
      await carregarDados();
    }
  } catch (error) {
    console.error(error);

    setMensagemProfissional(
      "Não foi possível cadastrar o profissional.",
    );
  } finally {
    setSalvandoProfissional(false);
  }
}
  async function handleDesativarServico(servico: Servico) {
    const confirmar = window.confirm(
      `Tem certeza que deseja excluir o serviço "${servico.nome}"? Ele ficará indisponível para novos agendamentos.`,
    );

    if (!confirmar) {
      return;
    }

    setMensagemServico("");
    setErro("");
    setRemovendoServicoId(servico.id);

    try {
      const resultado = await desativarServico({
        data: {
          id: servico.id,
        },
      });

      if (!resultado.sucesso) {
        setMensagemServico(resultado.mensagem);
        return;
      }

      setMensagemServico(resultado.mensagem);

      await carregarDados();
    } catch (error) {
      console.error(error);

      setMensagemServico("Não foi possível excluir o serviço.");
    } finally {
      setRemovendoServicoId("");
    }
  }

  async function handleDesativarProfissional(
    profissional: Profissional,
  ) {
    const confirmar = window.confirm(
      `Tem certeza que deseja excluir o profissional "${profissional.nome}"? Ele ficará indisponível para novos agendamentos.`,
    );

    if (!confirmar) {
      return;
    }

    setMensagemProfissional("");
    setErro("");
    setRemovendoProfissionalId(profissional.id);

    try {
      const resultado = await desativarProfissional({
        data: {
          id: profissional.id,
        },
      });

      if (!resultado.sucesso) {
        setMensagemProfissional(resultado.mensagem);
        return;
      }

      setMensagemProfissional(resultado.mensagem);

      await carregarDados();
    } catch (error) {
      console.error(error);

      setMensagemProfissional(
        "Não foi possível excluir o profissional.",
      );
    } finally {
      setRemovendoProfissionalId("");
    }
  }

  return (
    <div className="max-w-7xl p-8 lg:p-12">
      <PageHeader
        title="Configurações"
        subtitle="Cadastre serviços e profissionais usados no fluxo de agendamento."
      />

      {erro && (
        <div
          role="alert"
          className="mb-6 rounded-xl border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive"
        >
          {erro}
        </div>
      )}

      <div className="grid gap-6 xl:grid-cols-2">
        {/* Serviços */}
        <section className="rounded-2xl border border-border bg-surface p-6">
          <div className="mb-6 flex items-center gap-3">
            <div className="grid h-10 w-10 place-items-center rounded-full bg-gold-soft">
              <Scissors className="h-5 w-5 text-gold" />
            </div>

            <div>
              <h2 className="font-display text-lg">
                Serviços
              </h2>

              <p className="text-sm text-muted-foreground">
                Cadastre cortes, barba, combos e outros atendimentos.
              </p>
            </div>
          </div>

          <form
            className="space-y-4"
            onSubmit={handleCadastrarServico}
          >
            <div className="space-y-2">
              <Label htmlFor="servicoNome">
                Nome do serviço
              </Label>

              <Input
                id="servicoNome"
                name="nome"
                required
                placeholder="Ex: Corte masculino"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="servicoDescricao">
                Descrição
              </Label>

              <Input
                id="servicoDescricao"
                name="descricao"
                placeholder="Ex: Corte tradicional com acabamento"
              />
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="duracaoMinutos">
                  Duração em minutos
                </Label>

                <Input
                  id="duracaoMinutos"
                  name="duracaoMinutos"
                  type="number"
                  min={10}
                  max={480}
                  required
                  placeholder="Ex: 45"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="preco">
                  Preço
                </Label>

                <Input
                  id="preco"
                  name="preco"
                  inputMode="decimal"
                  required
                  placeholder="Ex: 50,00"
                />
              </div>
            </div>

            {mensagemServico && (
              <p className="text-sm text-muted-foreground">
                {mensagemServico}
              </p>
            )}

            <Button
              type="submit"
              disabled={salvandoServico}
              className="w-full"
            >
              <Plus className="mr-2 h-4 w-4" />
              {salvandoServico
                ? "Cadastrando..."
                : "Cadastrar serviço"}
            </Button>
          </form>

          <div className="mt-8 border-t border-border pt-6">
            <h3 className="mb-4 text-sm font-medium">
              Serviços cadastrados
            </h3>

            {carregando ? (
              <p className="text-sm text-muted-foreground">
                Carregando serviços...
              </p>
            ) : servicos.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                Nenhum serviço cadastrado ainda.
              </p>
            ) : (
              <div className="space-y-3">
                {servicos.map((servico) => (
                  <article
                    key={servico.id}
                    className="rounded-xl border border-border bg-background/40 p-4"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <h4 className="font-medium">
                          {servico.nome}
                        </h4>

                        {servico.descricao && (
                          <p className="mt-1 text-sm text-muted-foreground">
                            {servico.descricao}
                          </p>
                        )}
                      </div>

                      <div className="flex flex-col items-end gap-2">
                        <span className="rounded-full bg-gold-soft px-3 py-1 text-xs text-gold">
                          {servico.ativo ? "Ativo" : "Inativo"}
                        </span>

                        {servico.ativo && (
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            disabled={removendoServicoId === servico.id}
                            onClick={() => void handleDesativarServico(servico)}
                            className="border-destructive/40 text-destructive hover:bg-destructive/10"
                          >
                            <Trash2 className="mr-2 h-4 w-4" />
                            {removendoServicoId === servico.id
                              ? "Excluindo..."
                              : "Excluir"}
                          </Button>
                        )}
                      </div>
                    </div>

                    <div className="mt-4 flex flex-wrap gap-3 text-sm text-muted-foreground">
                      <span className="inline-flex items-center gap-1">
                        <Clock className="h-4 w-4" />
                        {servico.duracaoMinutos} min
                      </span>

                      <span>
                        {formatarMoeda(servico.precoCentavos)}
                      </span>
                    </div>
                  </article>
                ))}
              </div>
            )}
          </div>
        </section>

        {/* Profissionais */}
        <section className="rounded-2xl border border-border bg-surface p-6">
          <div className="mb-6 flex items-center gap-3">
            <div className="grid h-10 w-10 place-items-center rounded-full bg-gold-soft">
              <UserRound className="h-5 w-5 text-gold" />
            </div>

            <div>
              <h2 className="font-display text-lg">
                Profissionais
              </h2>

              <p className="text-sm text-muted-foreground">
                Cadastre quem poderá aparecer no agendamento.
              </p>
            </div>
          </div>

          <form
            className="space-y-4"
            onSubmit={handleCadastrarProfissional}
          >
            <div className="space-y-2">
              <Label htmlFor="profissionalNome">
                Nome do profissional
              </Label>

              <Input
                id="profissionalNome"
                name="nome"
                required
                placeholder="Ex: Rafael Dias"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="profissionalTelefone">
                Telefone
              </Label>

              <Input
                id="profissionalTelefone"
                name="telefone"
                placeholder="Ex: (21) 99999-9999"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="profissionalDescricao">
                Descrição
              </Label>

              <Input
                id="profissionalDescricao"
                name="descricao"
                placeholder="Ex: Especialista em corte masculino"
              />
            </div>

            {mensagemProfissional && (
              <p className="text-sm text-muted-foreground">
                {mensagemProfissional}
              </p>
            )}

            <Button
              type="submit"
              disabled={salvandoProfissional}
              className="w-full"
            >
              <Plus className="mr-2 h-4 w-4" />
              {salvandoProfissional
                ? "Cadastrando..."
                : "Cadastrar profissional"}
            </Button>
          </form>

          <div className="mt-8 border-t border-border pt-6">
            <h3 className="mb-4 text-sm font-medium">
              Profissionais cadastrados
            </h3>

            {carregando ? (
              <p className="text-sm text-muted-foreground">
                Carregando profissionais...
              </p>
            ) : profissionais.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                Nenhum profissional cadastrado ainda.
              </p>
            ) : (
              <div className="space-y-3">
                {profissionais.map((profissional) => (
                  <article
                    key={profissional.id}
                    className="rounded-xl border border-border bg-background/40 p-4"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <h4 className="font-medium">
                          {profissional.nome}
                        </h4>

                        <p className="mt-1 text-sm text-muted-foreground">
                          {formatarTelefone(profissional.telefone)}
                        </p>

                        {profissional.descricao && (
                          <p className="mt-2 text-sm text-muted-foreground">
                            {profissional.descricao}
                          </p>
                        )}
                      </div>

                      <div className="flex flex-col items-end gap-2">
                        <span className="rounded-full bg-gold-soft px-3 py-1 text-xs text-gold">
                          {profissional.ativo ? "Ativo" : "Inativo"}
                        </span>

                        {profissional.ativo && (
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            disabled={removendoProfissionalId === profissional.id}
                            onClick={() =>
                              void handleDesativarProfissional(profissional)
                            }
                            className="border-destructive/40 text-destructive hover:bg-destructive/10"
                          >
                            <Trash2 className="mr-2 h-4 w-4" />
                            {removendoProfissionalId === profissional.id
                              ? "Excluindo..."
                              : "Excluir"}
                          </Button>
                        )}
                      </div>
                    </div>
                  </article>
                ))}
              </div>
            )}
          </div>
        </section>
      </div>
    </div>
  );
}