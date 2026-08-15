/**
 * Inventário curado das mídias reais do Studio RD usadas na landing.
 *
 * Todos os arquivos ficam em public/media/landing e não são copiados nem
 * editados — apenas referenciados. Os nomes originais (exportados do
 * WhatsApp) contêm espaços e parênteses, por isso passam por
 * encodeURIComponent ao montar a URL.
 */

function imageUrl(filename: string): string {
  return `/media/landing/images/${encodeURIComponent(filename)}`;
}

function videoUrl(filename: string): string {
  return `/media/landing/videos/${encodeURIComponent(filename)}`;
}

export const landingImages = {
  ritualVapor: {
    src: imageUrl("WhatsApp Image 2026-07-20 at 10.36.10 (2).jpeg"),
    alt: "Cliente recebendo vapor facial durante o atendimento no Studio RD, em ambiente escuro com iluminação lateral quente.",
    width: 960,
    height: 1280,
  },
  resultadoDegrade: {
    src: imageUrl("WhatsApp Image 2026-07-20 at 10.36.10 (3).jpeg"),
    alt: "Perfil de cliente com corte degradê finalizado no Studio RD.",
    width: 960,
    height: 1280,
  },
  resultadoPenteado: {
    src: imageUrl("WhatsApp Image 2026-07-20 at 10.36.21.jpeg"),
    alt: "Perfil de cliente com o cabelo penteado para trás, finalizado no Studio RD.",
    width: 960,
    height: 1280,
  },
  ambienteEstacao: {
    src: imageUrl("WhatsApp Image 2026-07-20 at 10.36.10.jpeg"),
    alt: "Estação de atendimento do Studio RD, com paredes escuras, cadeira de barbeiro e iluminação quente.",
    width: 1152,
    height: 1536,
  },
  ambienteEspelho: {
    src: imageUrl("WhatsApp Image 2026-07-20 at 10.36.21 (1).jpeg"),
    alt: "Bancada de espelho e cadeiras do Studio RD vistas de outro ângulo.",
    width: 960,
    height: 1280,
  },
  ambienteDetalhe: {
    src: imageUrl("WhatsApp Image 2026-07-20 at 10.36.10 (1).jpeg"),
    alt: "Detalhe do ambiente do Studio RD, com iluminação amarelada e cadeiras pretas.",
    width: 1152,
    height: 1536,
  },
} as const;

export const landingVideos = {
  hero: {
    src: videoUrl("WhatsApp Video 2026-07-20 at 10.36.20.mp4"),
    width: 576,
    height: 1024,
    label: "Atendimento real no Studio RD",
  },
  ritual: [
    {
      src: videoUrl("WhatsApp Video 2026-07-20 at 10.33.26.mp4"),
      width: 576,
      height: 1024,
      caption: "Precisão",
    },
    {
      src: videoUrl("WhatsApp Video 2026-07-20 at 10.33.23.mp4"),
      width: 576,
      height: 1024,
      caption: "Acabamento",
    },
    {
      src: videoUrl("WhatsApp Video 2026-07-20 at 10.33.28.mp4"),
      width: 464,
      height: 832,
      caption: "Barba",
    },
  ],
} as const;
