STUDIO RD BLACK — NOVO BLOQUEIO DE AGENDA

O que este pacote altera:

1. Remove os campos manuais datetime-local de início/fim das telas de bloqueio.
2. Cria uma janela/modal de criação de bloqueio.
3. Fluxo sequencial:
   - escolha do alvo (barbearia inteira ou profissional)
   - escolha da data
   - horário de início em grade de 5 em 5 minutos
   - horário de término em grade de 5 em 5 minutos
   - motivo opcional
   - resumo e confirmação
4. Usa os mesmos horários de funcionamento da grade atual do agendamento:
   - terça: 09:30–19:30
   - quarta: 09:30–19:30
   - quinta: 09:00–19:30
   - sexta: 08:00–21:00
   - sábado: 08:30–19:00
5. Admin e funcionário passam a usar o mesmo componente visual de bloqueios.
6. O backend passa a recusar início/fim fora da grade de 5 minutos.
7. A listagem e a remoção de bloqueios existentes são preservadas.

COMO APLICAR NO WINDOWS

Recomendado: esteja na branch dev-patrick e com o working tree limpo.

  git switch dev-patrick
  git status

Extraia este pacote em qualquer pasta.

Na raiz do projeto studio-rd-canvas, execute:

  powershell -ExecutionPolicy Bypass -File "CAMINHO_DO_PACOTE\aplicar-bloqueio-agenda.ps1"

O script cria backup automático dos arquivos substituídos.

Depois valide:

  npm run typecheck
  npm run build

E confira o diff:

  git diff -- src/components/agenda/BloqueiosAgendaPage.tsx src/routes/admin.bloqueios.tsx src/routes/funcionario.bloqueios.tsx src/lib/api/bloqueio-agenda.functions.ts

Se tudo estiver certo:

  git add src/components/agenda/BloqueiosAgendaPage.tsx src/routes/admin.bloqueios.tsx src/routes/funcionario.bloqueios.tsx src/lib/api/bloqueio-agenda.functions.ts
  git commit -m "feat: melhora fluxo de bloqueio da agenda"
  git push origin dev-patrick

OBSERVAÇÃO

O pacote foi preparado sobre os arquivos atuais lidos da branch dev-patrick. A integração do GitHub desta conversa permitiu leitura, mas bloqueou escrita via GitHub App com HTTP 403; por isso o commit não foi enviado automaticamente.
