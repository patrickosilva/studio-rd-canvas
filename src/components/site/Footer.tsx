import { Instagram } from "lucide-react";

import { WhatsAppIcon } from "./WhatsAppIcon";
import { WHATSAPP_DISPLAY, WHATSAPP_LINK } from "./WhatsAppButton";

const INSTAGRAM_HANDLE = "@studiord__00";
const INSTAGRAM_LINK = "https://instagram.com/studiord__00";

export function Footer() {
  return (
    <footer className="border-t border-border bg-surface">
      <div className="mx-auto grid max-w-7xl gap-12 px-6 py-16 md:grid-cols-[1.2fr_1fr] md:items-start lg:px-10">
        <div>
          <div className="mb-4 flex items-center gap-3">
            <span className="font-display-landing grid h-9 w-9 place-items-center rounded-full border border-gold/50 text-[13px] tracking-wide text-gold">
              RD
            </span>
            <span className="font-display-landing text-base text-foreground">Studio RD</span>
          </div>

          <p className="max-w-xs text-sm text-muted-foreground">
            Barbearia premium. Imagem, experiência e exclusividade.
          </p>
        </div>

        <div className="grid grid-cols-2 gap-8 lg:grid-cols-3 lg:gap-10">
          <div>
            <h4 className="mb-4 text-[11px] font-medium uppercase tracking-[0.2em] text-muted-foreground">
              Navegação
            </h4>

            <ul className="space-y-3 text-sm text-foreground/80">
              <li>
                <a href="/#servicos" className="transition hover:text-gold">
                  Serviços
                </a>
              </li>
              <li>
                <a href="/#ritual" className="transition hover:text-gold">
                  Ritual
                </a>
              </li>
              <li>
                <a href="/#ambiente" className="transition hover:text-gold">
                  Ambiente
                </a>
              </li>
              <li>
                <a href="/#assinatura" className="transition hover:text-gold">
                  RD Black
                </a>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="mb-4 text-[11px] font-medium uppercase tracking-[0.2em] text-muted-foreground">
              Acesso
            </h4>

            <ul className="space-y-3 text-sm text-foreground/80">
              <li>
                <a href="/login" className="transition hover:text-gold">
                  Entrar
                </a>
              </li>
              <li>
                <a href="/cadastro" className="transition hover:text-gold">
                  Criar cadastro
                </a>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="mb-4 text-[11px] font-medium uppercase tracking-[0.2em] text-muted-foreground">
              Contato
            </h4>

            <ul className="space-y-3 text-sm text-foreground/80">
              <li>
                <a
                  href={WHATSAPP_LINK}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 whitespace-nowrap transition hover:text-gold"
                >
                  <WhatsAppIcon className="h-4 w-4 shrink-0" />
                  {WHATSAPP_DISPLAY}
                </a>
              </li>
              <li>
                <a
                  href={INSTAGRAM_LINK}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 transition hover:text-gold"
                >
                  <Instagram className="h-4 w-4 shrink-0" aria-hidden="true" />
                  {INSTAGRAM_HANDLE}
                </a>
              </li>
            </ul>
          </div>
        </div>
      </div>

      <div className="border-t border-border">
        <div className="mx-auto flex max-w-7xl flex-wrap justify-between gap-3 px-6 py-6 text-xs text-muted-foreground lg:px-10">
          <span>© {new Date().getFullYear()} Studio RD. Todos os direitos reservados.</span>
        </div>
      </div>
    </footer>
  );
}
