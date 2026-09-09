import { fileURLToPath } from "node:url";

import { defineConfig } from "@lovable.dev/vite-tanstack-config";
import { nitro } from "nitro/vite";

const lembretesTaskHandler = fileURLToPath(
  new URL("./tasks/agendamento-lembretes.ts", import.meta.url),
);

export default defineConfig({
  vite: {
    plugins: [
      nitro({
        preset: "node-server",
        experimental: {
          tasks: true,
        },
        tasks: {
          "agendamento:lembretes": {
            handler: lembretesTaskHandler,
            description:
              "Envia lembrete por e-mail para agendamentos confirmados ~24h antes do horário marcado.",
          },
        },
        scheduledTasks: {
          // A cada 15 minutos, cobrindo com folga a janela de 23h-25h
          // usada pela task para encontrar agendamentos a lembrar.
          "*/15 * * * *": "agendamento:lembretes",
        },
      }),
    ],
  },
});