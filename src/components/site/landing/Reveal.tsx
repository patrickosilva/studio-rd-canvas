import { useEffect, useState, type ReactNode } from "react";

import { useInView } from "@/hooks/use-in-view";
import { cn } from "@/lib/utils";

type RevealProps = {
  children: ReactNode;
  className?: string;
  delay?: 1 | 2 | 3;
};

/**
 * Fade + translate discreto ao entrar na viewport, uma única vez.
 *
 * Por padrão (SSR, JS desabilitado, ou antes da hidratação) o conteúdo
 * nasce totalmente visível. A animação só é "armada" depois que o
 * client confirma que o elemento realmente começa fora da viewport,
 * então o conteúdo nunca fica preso invisível por falha do observer
 * (que já tem seu próprio fallback em useInView para navegadores sem
 * suporte a IntersectionObserver).
 */
export function Reveal({ children, className, delay }: RevealProps) {
  const { ref, inView } = useInView<HTMLDivElement>({ once: true, threshold: 0.15 });
  const [armed, setArmed] = useState(false);

  useEffect(() => {
    if (!inView) {
      setArmed(true);
    }
  }, [inView]);

  return (
    <div
      ref={ref}
      className={cn(
        armed && "landing-reveal",
        armed && delay === 1 && "landing-reveal-delay-1",
        armed && delay === 2 && "landing-reveal-delay-2",
        armed && delay === 3 && "landing-reveal-delay-3",
        inView && "is-visible",
        className,
      )}
    >
      {children}
    </div>
  );
}
