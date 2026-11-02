import { useEffect, useRef } from "react";

export function useOnIntersect<T extends HTMLElement>(
  onIntersect: () => void,
  enabled: boolean,
) {
  const ref = useRef<T | null>(null);
  const onIntersectRef = useRef(onIntersect);

  // Keep the latest callback reference without triggering re-subscription
  useEffect(() => {
    onIntersectRef.current = onIntersect;
  }, [onIntersect]);

  useEffect(() => {
    const node = ref.current;
    if (!enabled || !node) return;

    // Primary trigger: IntersectionObserver with a 350px root margin to prefetch
    // before the user reaches the absolute bottom, ensuring seamless continuous scroll.
    const observer = new IntersectionObserver(
      (entries) => {
        const first = entries[0];
        if (first?.isIntersecting) {
          onIntersectRef.current();
        }
      },
      { rootMargin: "350px", threshold: 0 },
    );

    observer.observe(node);

    // Fallback trigger: window scroll/resize listener to guarantee incremental loading
    // even in browsers or environments where IntersectionObserver layout events are delayed.
    const handleScroll = () => {
      const rect = node.getBoundingClientRect();
      if (rect.top <= window.innerHeight + 350) {
        onIntersectRef.current();
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    window.addEventListener("resize", handleScroll, { passive: true });

    return () => {
      observer.disconnect();
      window.removeEventListener("scroll", handleScroll);
      window.removeEventListener("resize", handleScroll);
    };
  }, [enabled]);

  return ref;
}
