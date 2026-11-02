import { useState, type FormEvent } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { Eye, EyeOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { entrar } from "@/lib/api/auth.functions";
import { GoogleLoginButton } from "@/components/auth/GoogleAuth";

export const Route = createFileRoute("/login")({
  validateSearch: (search: Record<string, unknown>) => ({
    redirect:
      typeof search.redirect === "string"
        ? search.redirect
        : undefined,
  }),
  component: LoginPage,
});

function LoginPage() {
  const realizarLogin = useServerFn(entrar);
  const { redirect } = Route.useSearch();

  const [carregando, setCarregando] = useState(false);
  const [mensagem, setMensagem] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [manterConectado, setManterConectado] = useState(true);
  async function handleSubmit(
    event: FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();

    setCarregando(true);
    setMensagem("");

    const formulario = event.currentTarget;
    const formData = new FormData(formulario);

    try {
      const resultado = await realizarLogin({
        data: {
          email: String(formData.get("email") ?? ""),
          senha: String(formData.get("senha") ?? ""),
          manterConectado:
            formData.get("manterConectado") === "on",
          redirect,
        },
      });

      if (!resultado.sucesso) {
        setMensagem(resultado.mensagem);
        return;
      }

      /*
       * Fazemos uma navegação completa para que o navegador
       * envie o novo cookie de sessão e a aplicação carregue
       * novamente já reconhecendo o usuário autenticado.
       */
      window.location.assign(resultado.destino);
    } catch (error) {
      console.error(error);

      setMensagem(
        "Não foi possível entrar. Tente novamente.",
      );
    } finally {
      setCarregando(false);
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-background px-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-2xl">
            Entrar
          </CardTitle>

          <CardDescription>
            Acesse sua conta no Studio RD Black.
          </CardDescription>
        </CardHeader>

        <CardContent>
          <form
            className="space-y-4"
            onSubmit={handleSubmit}
          >
            <div className="space-y-2">
              <Label htmlFor="email">E-mail</Label>

              <Input
                id="email"
                name="email"
                type="email"
                required
                autoComplete="email"
                placeholder="seuemail@exemplo.com"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="senha">Senha</Label>

              <div className="relative">
                <Input
                  id="senha"
                  name="senha"
                  type={showPassword ? "text" : "password"}
                  required
                  autoComplete="current-password"
                  placeholder="Digite sua senha"
                  className="pr-10"
                />

                <button
                  type="button"
                  onClick={() => setShowPassword((prev) => !prev)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  aria-label={showPassword ? "Ocultar senha" : "Mostrar senha"}
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>
            </div>

                      <div className="flex justify-end">
            <Link
              to="/esqueci-senha"
              className="text-sm text-muted-foreground hover:text-foreground"
            >
              Esqueceu sua senha?
            </Link>
          </div>
<label
              htmlFor="manterConectado"
              className="flex cursor-pointer items-center gap-2 text-sm"
            >
              <input
                id="manterConectado"
                name="manterConectado"
                type="checkbox"
                checked={manterConectado}
                onChange={(event) =>
                  setManterConectado(event.target.checked)
                }
                className="h-4 w-4 rounded border-input accent-primary"
              />

              Manter conectado por até 30 dias de inatividade
            </label>

            {mensagem && (
              <p
                role="alert"
                className="text-sm text-destructive"
              >
                {mensagem}
              </p>
            )}

            <Button
              type="submit"
              disabled={carregando}
              className="w-full"
            >
              {carregando
                ? "Entrando..."
                : "Entrar"}
            </Button>
            <div className="relative py-2">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t border-border" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-card px-2 text-muted-foreground">
                  ou
                </span>
              </div>
            </div>

            <GoogleLoginButton
              manterConectado={manterConectado}
              redirect={redirect}
              onErro={setMensagem}
            />
          </form>

          <p className="mt-6 text-center text-sm text-muted-foreground">
            Ainda não possui conta?{" "}
            <Link
              to="/cadastro"
              className="font-medium text-primary hover:underline"
            >
              Cadastre-se
            </Link>
          </p>

          <p className="mt-3 text-center text-sm">
            <Link
              to="/"
              className="text-muted-foreground hover:text-foreground"
            >
              Voltar ao início
            </Link>
          </p>
          <div className="mt-5 flex flex-wrap justify-center gap-x-4 gap-y-2 text-xs text-muted-foreground">
            <Link to="/termos" className="hover:text-foreground">
              Termos
            </Link>
            <Link to="/privacidade" className="hover:text-foreground">
              Privacidade
            </Link>
            <Link to="/cookies" className="hover:text-foreground">
              Cookies
            </Link>
          </div>
        </CardContent>
      </Card>
    </main>
  );
}