import { useEffect, useRef, useState } from 'react';

/**
 * Reveals an element once it scrolls into view. Falls back to visible
 * immediately when IntersectionObserver isn't available (e.g. in jsdom
 * during tests), so component behavior stays testable without a mock.
 */
export function useFadeIn<T extends HTMLElement>() {
  const ref = useRef<T | null>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const node = ref.current;
    if (!node) return;

    if (typeof IntersectionObserver === 'undefined') {
      setVisible(true);
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.15 },
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  return { ref, visible };
}
