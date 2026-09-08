import type { ReactNode } from 'react';
import { useFadeIn } from '../hooks/useFadeIn';

export function FadeInSection({ children, className = '' }: { children: ReactNode; className?: string }) {
  const { ref, visible } = useFadeIn<HTMLDivElement>();

  return (
    <div
      ref={ref}
      className={`transition-all duration-700 ease-out ${
        visible ? 'translate-y-0 opacity-100' : 'translate-y-6 opacity-0'
      } ${className}`}
    >
      {children}
    </div>
  );
}
