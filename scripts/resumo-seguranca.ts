import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../src/generated/prisma/client";

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error("DATABASE_URL ausente.");
}

const prisma = new PrismaClient({
  adapter: new PrismaPg({
    connectionString,
  }),
});

const desde = new Date(Date.now() - 24 * 60 * 60 * 1000);

const [porTipo, bloqueios] = await Promise.all([
  prisma.eventoSeguranca.groupBy({
    by: ["tipo"],
    where: {
      criadoEm: {
        gte: desde,
      },
    },
    _count: {
      _all: true,
    },
    orderBy: {
      _count: {
        tipo: "desc",
      },
    },
  }),

  prisma.eventoSeguranca.findMany({
    where: {
      tipo: {
        startsWith: "BLOQUEIO_",
      },
      criadoEm: {
        gte: desde,
      },
    },
    select: {
      tipo: true,
      rota: true,
      criadoEm: true,
    },
    orderBy: {
      criadoEm: "desc",
    },
    take: 30,
  }),
]);

console.log("\n=== Segurança — últimas 24 horas ===\n");

if (porTipo.length === 0) {
  console.log("Nenhum evento registrado.");
} else {
  console.table(
    porTipo.map((item) => ({
      tipo: item.tipo,
      quantidade: item._count._all,
    })),
  );
}

console.log("\n=== Bloqueios recentes ===\n");

if (bloqueios.length === 0) {
  console.log("Nenhum rate limit acionado.");
} else {
  console.table(bloqueios);
}

await prisma.$disconnect();