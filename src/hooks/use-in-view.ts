import { useEffect, useRef, useState } from "react";

export function useInView<T extends HTMLElement>(options?: {
  once?: boolean;
  rootMargin?: string;
  threshold?: number;
}) {
  const ref = useRef<T | null>(null);
  const [inView, setInView] = useState(false);
  const once = options?.once ?? false;

  useEffect(() => {
    const node = ref.current;

    if (!node) {
      return;
    }

    if (typeof IntersectionObserver === "undefined") {
      setInView(true);
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setInView(true);

          if (once) {
            observer.disconnect();
          }
        } else if (!once) {
          setInView(false);
        }
      },
      {
        rootMargin: options?.rootMargin ?? "0px",
        threshold: options?.threshold ?? 0.2,
      },
    );

    observer.observe(node);

    return () => observer.disconnect();
  }, [once, options?.rootMargin, options?.threshold]);

  return { ref, inView };
}
