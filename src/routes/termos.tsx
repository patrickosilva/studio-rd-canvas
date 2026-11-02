import { createFileRoute } from "@tanstack/react-router";

import { LegalDocumentPage } from "@/components/legal/LegalDocumentPage";
import {
  PRIVACIDADE_CONTATO_PADRAO,
  TERMOS_USO_VERSAO,
} from "@/lib/legal.constants";

export const Route = createFileRoute("/termos")({
  component: TermosPage,
});

function TermosPage() {
  return (
    <LegalDocumentPage
      titulo="Termos de Uso"
      versao={TERMOS_USO_VERSAO}
    >
      <section>
        <h2>1. Sobre estes Termos</h2>
        <p>
          Estes Termos disciplinam o uso do sistema Studio RD Black,
          incluindo criação de conta, autenticação, agendamentos,
          acompanhamento de serviços e demais funcionalidades
          disponibilizadas pela barbearia.
        </p>
      </section>

      <section>
        <h2>2. Conta do usuário</h2>
        <p>
          O usuário deve fornecer informações verdadeiras e manter seus
          dados de acesso sob sua responsabilidade. O Studio RD nunca
          solicitará que a senha seja enviada por mensagem, e-mail ou
          atendimento comum.
        </p>
      </section>

      <section>
        <h2>3. Formas de acesso</h2>
        <p>
          O sistema poderá permitir acesso por senha e, opcionalmente,
          por provedores externos de identidade, como Google. A conexão
          de um provedor externo não altera automaticamente os dados
          cadastrais mantidos no Studio RD.
        </p>
      </section>

      <section>
        <h2>4. Agendamentos e serviços</h2>
        <p>
          Horários, disponibilidade, cancelamentos, reagendamentos,
          benefícios, assinaturas, descontos e outras condições
          comerciais podem possuir regras específicas apresentadas no
          momento de uso da respectiva funcionalidade.
        </p>
      </section>

      <section>
        <h2>5. Uso adequado</h2>
        <p>Não é permitido utilizar o sistema para:</p>
        <ul>
          <li>tentar acessar contas ou áreas sem autorização;</li>
          <li>interferir no funcionamento, segurança ou disponibilidade do serviço;</li>
          <li>automatizar requisições abusivas ou maliciosas;</li>
          <li>fornecer dados falsos com objetivo de fraude ou abuso.</li>
        </ul>
      </section>

      <section>
        <h2>6. Segurança</h2>
        <p>
          O Studio RD adota medidas técnicas e administrativas
          proporcionais ao serviço para proteger contas e dados. Por
          segurança, sessões podem ser encerradas e nova autenticação
          pode ser exigida.
        </p>
      </section>

      <section>
        <h2>7. Privacidade</h2>
        <p>
          O tratamento de dados pessoais é explicado separadamente na
          Política de Privacidade e na Política de Cookies, que integram
          a documentação pública do sistema.
        </p>
      </section>

      <section>
        <h2>8. Alterações destes Termos</h2>
        <p>
          Estes Termos podem ser atualizados para refletir mudanças
          legais, técnicas ou de funcionalidades. Alterações relevantes
          poderão exigir nova ciência ou novo aceite quando necessário.
        </p>
      </section>

      <section>
        <h2>9. Contato</h2>
        <p>
          Dúvidas sobre estes Termos podem ser encaminhadas para{" "}
          <strong>{PRIVACIDADE_CONTATO_PADRAO}</strong>.
        </p>
      </section>
    </LegalDocumentPage>
  );
}
