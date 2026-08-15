import { useEffect, useState } from "react";

import { cn } from "@/lib/utils";
import { WhatsAppIcon } from "./WhatsAppIcon";

export const WHATSAPP_NUMBER = "5521966140230";
export const WHATSAPP_DISPLAY = "+55 21 96614-0230";
export const WHATSAPP_LINK = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(
  "Olá! Gostaria de agendar um horário no Studio RD.",
)}`;

export function WhatsAppButton() {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    // No mobile, a seção Hero preenche o primeiro viewport com texto até
    // embaixo, então o botão fixo colidiria com o título nessa faixa. A
    // partir do lg (mesmo corte usado no resto do site) o Hero libera a
    // lateral direita e não há mais colisão, então o botão fica sempre
    // visível ali, como antes.
    const mobileQuery = window.matchMedia("(max-width: 1023px)");
    const hero = document.getElementById("hero");

    function updateVisibility() {
      if (!mobileQuery.matches || !hero) {
        setVisible(true);
        return;
      }

      setVisible(hero.getBoundingClientRect().bottom <= window.innerHeight);
    }

    updateVisibility();
    window.addEventListener("scroll", updateVisibility, { passive: true });
    window.addEventListener("resize", updateVisibility);
    mobileQuery.addEventListener("change", updateVisibility);

    return () => {
      window.removeEventListener("scroll", updateVisibility);
      window.removeEventListener("resize", updateVisibility);
      mobileQuery.removeEventListener("change", updateVisibility);
    };
  }, []);

  return (
    <a
      href={WHATSAPP_LINK}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Conversar no WhatsApp"
      className={cn(
        "fixed right-5 bottom-5 z-40 grid h-14 w-14 place-items-center rounded-full bg-[#25D366] text-white shadow-premium transition-all duration-300 hover:scale-105 hover:brightness-105 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold lg:right-8 lg:bottom-8",
        visible ? "opacity-100" : "pointer-events-none translate-y-2 opacity-0",
      )}
    >
      <WhatsAppIcon className="h-7 w-7" />
    </a>
  );
}
