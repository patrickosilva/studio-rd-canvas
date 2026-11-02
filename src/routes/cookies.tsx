import { createFileRoute } from "@tanstack/react-router";

import { LegalDocumentPage } from "@/components/legal/LegalDocumentPage";
import {
  POLITICA_COOKIES_VERSAO,
  PRIVACIDADE_CONTATO_PADRAO,
} from "@/lib/legal.constants";

export const Route = createFileRoute("/cookies")({
  component: CookiesPage,
});

function CookiesPage() {
  return (
    <LegalDocumentPage
      titulo="Política de Cookies"
      versao={POLITICA_COOKIES_VERSAO}
    >
      <section>
        <h2>1. O que utilizamos atualmente</h2>
        <p>
          O Studio RD utiliza cookie estritamente necessário para
          autenticação e manutenção segura da sessão do usuário. Esse
          cookie contém um token aleatório e não armazena nome, e-mail,
          telefone ou senha.
        </p>
      </section>

      <section>
        <h2>2. Cookie de sessão</h2>
        <p>
          Quando o usuário escolhe permanecer conectado, a sessão pode
          ser mantida por período definido pelas regras de segurança do
          sistema. Sem essa opção, o navegador utiliza uma sessão não
          persistente.
        </p>
      </section>

      <section>
        <h2>3. Login com Google</h2>
        <p>
          Quando o usuário utiliza ou conecta a opção de autenticação
          Google, recursos do Google Identity Services são carregados
          para realizar a autenticação. O tratamento realizado pelo
          Google também está sujeito às políticas próprias desse
          provedor.
        </p>
      </section>

      <section>
        <h2>4. Analytics, publicidade e marketing</h2>
        <p>
          Na versão atual, o Studio RD não depende de cookies de
          publicidade ou ferramentas próprias de rastreamento comercial
          para permitir o uso da plataforma. Caso tecnologias opcionais
          sejam adicionadas futuramente, esta Política e os controles do
          usuário serão atualizados antes de sua ativação quando isso
          for necessário.
        </p>
      </section>

      <section>
        <h2>5. Cookies necessários</h2>
        <p>
          Cookies estritamente necessários são utilizados para entregar
          funcionalidades solicitadas pelo usuário, como autenticação e
          segurança da conta. Desabilitá-los pode impedir o login e o
          funcionamento de áreas privadas.
        </p>
      </section>

      <section>
        <h2>6. Contato</h2>
        <p>
          Dúvidas sobre cookies e privacidade podem ser encaminhadas
          para <strong>{PRIVACIDADE_CONTATO_PADRAO}</strong>.
        </p>
      </section>
    </LegalDocumentPage>
  );
}
