import { createFileRoute } from "@tanstack/react-router";

import { LegalDocumentPage } from "@/components/legal/LegalDocumentPage";
import {
  POLITICA_PRIVACIDADE_VERSAO,
  PRIVACIDADE_CONTATO_PADRAO,
} from "@/lib/legal.constants";

export const Route = createFileRoute("/privacidade")({
  component: PrivacidadePage,
});

function PrivacidadePage() {
  return (
    <LegalDocumentPage
      titulo="Política de Privacidade"
      versao={POLITICA_PRIVACIDADE_VERSAO}
    >
      <section>
        <h2>1. Objetivo</h2>
        <p>
          Esta Política explica de forma transparente quais dados
          pessoais são tratados pelo Studio RD Black, para quais
          finalidades e quais controles são oferecidos ao usuário.
        </p>
      </section>

      <section>
        <h2>2. Dados tratados</h2>
        <p>Conforme as funcionalidades utilizadas, podemos tratar:</p>
        <ul>
          <li>nome;</li>
          <li>e-mail;</li>
          <li>telefone;</li>
          <li>credenciais protegidas por hash quando houver senha;</li>
          <li>identificador de provedor externo quando o usuário conectar o Google;</li>
          <li>agendamentos, histórico de serviços e informações operacionais relacionadas;</li>
          <li>informações de pagamento registradas no sistema, sem armazenamento de dados completos de cartão;</li>
          <li>assinaturas, benefícios, vouchers, descontos e fidelidade quando essas funções forem utilizadas;</li>
          <li>registros técnicos estritamente necessários à segurança, autenticação e prevenção de abuso.</li>
        </ul>
      </section>

      <section>
        <h2>3. Finalidades</h2>
        <p>Os dados são utilizados para finalidades compatíveis com o serviço, como:</p>
        <ul>
          <li>criar e manter a conta;</li>
          <li>autenticar o usuário e proteger sessões;</li>
          <li>permitir agendamentos e atendimento pela barbearia;</li>
          <li>administrar assinaturas, benefícios e histórico;</li>
          <li>enviar comunicações transacionais relacionadas ao serviço;</li>
          <li>cumprir obrigações legais e regulatórias aplicáveis;</li>
          <li>prevenir fraude, abuso e acessos não autorizados.</li>
        </ul>
      </section>

      <section>
        <h2>4. Minimização</h2>
        <p>
          O Studio RD procura limitar a coleta ao necessário para cada
          finalidade. Não utilizamos senha em texto aberto e não
          armazenamos a senha da Conta Google.
        </p>
      </section>

      <section>
        <h2>5. Compartilhamentos e fornecedores</h2>
        <p>
          Para operar o serviço, determinados dados podem ser tratados
          por fornecedores de infraestrutura e comunicação, incluindo
          hospedagem, banco de dados, envio de e-mail e autenticação
          externa. Esses fornecedores são utilizados apenas conforme a
          finalidade necessária ao serviço.
        </p>
      </section>

      <section>
        <h2>6. Retenção</h2>
        <p>
          Os dados são mantidos pelo período necessário às finalidades
          informadas, às obrigações aplicáveis e à segurança do serviço.
          Sessões e tokens possuem expiração própria. Prazos específicos
          de retenção serão documentados e revisados na política interna
          da V1.5.
        </p>
      </section>

      <section>
        <h2>7. Direitos do titular</h2>
        <p>
          O titular pode solicitar informações e exercer os direitos
          previstos na legislação aplicável, incluindo confirmação,
          acesso, correção e, quando cabível, eliminação ou outras
          providências relacionadas aos seus dados.
        </p>
      </section>

      <section>
        <h2>8. Segurança</h2>
        <p>
          Aplicamos controles de autenticação, autorização, expiração de
          sessões, proteção de credenciais e medidas de monitoramento
          para reduzir riscos de acesso não autorizado e abuso.
        </p>
      </section>

      <section>
        <h2>9. Contato de privacidade</h2>
        <p>
          Solicitações relacionadas a privacidade podem ser encaminhadas
          para <strong>{PRIVACIDADE_CONTATO_PADRAO}</strong>.
        </p>
      </section>
    </LegalDocumentPage>
  );
}
