import { useEffect, useRef, useState } from "react";

import { useInView } from "@/hooks/use-in-view";
import { useReducedMotion } from "@/hooks/use-reduced-motion";
import { cn } from "@/lib/utils";

type MediaVideoProps = {
  src: string;
  width: number;
  height: number;
  fallback: { src: string; alt: string };
  className?: string;
  objectPosition?: string;
  /** Vídeo do hero: carrega imediatamente em vez de esperar entrar na viewport. */
  priority?: boolean;
};

/**
 * Vídeo de ambiente/processo, silencioso e decorativo.
 *
 * - Só busca o arquivo quando entra (ou está perto de entrar) na viewport.
 * - Pausa quando sai da viewport, para nunca haver mais de um vídeo tocando.
 * - Respeita prefers-reduced-motion mostrando a fotografia real de fallback.
 * - Se o vídeo falhar ao carregar, a fotografia de fallback permanece visível.
 */
export function MediaVideo({
  src,
  width,
  height,
  fallback,
  className,
  objectPosition,
  priority = false,
}: MediaVideoProps) {
  const { ref, inView } = useInView<HTMLDivElement>({
    rootMargin: "240px",
    threshold: 0.15,
  });
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const reducedMotion = useReducedMotion();
  const [shouldLoad, setShouldLoad] = useState(priority);
  const [ready, setReady] = useState(false);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    if (inView && !shouldLoad) {
      setShouldLoad(true);
    }
  }, [inView, shouldLoad]);

  useEffect(() => {
    const video = videoRef.current;

    if (!video || reducedMotion || failed) {
      return;
    }

    if (inView) {
      void video.play().catch(() => {
        // Autoplay pode ser recusado pelo navegador; a fotografia de
        // fallback permanece visível nesse caso.
      });
    } else {
      video.pause();
    }
  }, [inView, reducedMotion, failed]);

  const showFallback = reducedMotion || failed || !ready;
  const mediaStyle = objectPosition ? { objectPosition } : undefined;

  return (
    <div
      ref={ref}
      className={cn("relative overflow-hidden bg-surface", className)}
      style={{ aspectRatio: `${width} / ${height}` }}
    >
      <img
        src={fallback.src}
        alt={fallback.alt}
        width={width}
        height={height}
        loading={priority ? "eager" : "lazy"}
        decoding="async"
        style={mediaStyle}
        className={cn(
          "absolute inset-0 h-full w-full object-cover transition-opacity duration-700 ease-out",
          showFallback ? "opacity-100" : "opacity-0",
        )}
      />

      {!reducedMotion && !failed && shouldLoad && (
        <video
          ref={videoRef}
          muted
          loop
          playsInline
          autoPlay
          preload={priority ? "metadata" : "none"}
          aria-hidden="true"
          tabIndex={-1}
          style={mediaStyle}
          className={cn(
            "absolute inset-0 h-full w-full object-cover transition-opacity duration-700 ease-out",
            showFallback ? "opacity-0" : "opacity-100",
          )}
          onLoadedData={() => setReady(true)}
          onError={() => setFailed(true)}
        >
          <source src={src} type="video/mp4" />
        </video>
      )}
    </div>
  );
}
