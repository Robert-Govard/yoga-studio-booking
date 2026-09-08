import { useEffect, useState } from 'react';

export interface GalleryImage {
  src: string;
  alt: string;
}

export function Gallery({ images }: { images: GalleryImage[] }) {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  useEffect(() => {
    if (openIndex === null) return;

    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') setOpenIndex(null);
      if (e.key === 'ArrowLeft') setOpenIndex((i) => (i === null ? null : (i - 1 + images.length) % images.length));
      if (e.key === 'ArrowRight') setOpenIndex((i) => (i === null ? null : (i + 1) % images.length));
    }

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [openIndex, images.length]);

  return (
    <>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        {images.map((image, index) => (
          <button
            type="button"
            key={image.src}
            onClick={() => setOpenIndex(index)}
            className="group aspect-square overflow-hidden rounded-lg"
          >
            <img
              src={image.src}
              alt={image.alt}
              loading="lazy"
              className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
            />
          </button>
        ))}
      </div>

      {openIndex !== null && (
        <div
          role="dialog"
          aria-modal="true"
          onClick={() => setOpenIndex(null)}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4"
        >
          <button
            type="button"
            aria-label="Close"
            onClick={(e) => {
              e.stopPropagation();
              setOpenIndex(null);
            }}
            className="absolute right-4 top-4 text-3xl text-white/80 hover:text-white"
          >
            ×
          </button>
          <button
            type="button"
            aria-label="Previous photo"
            onClick={(e) => {
              e.stopPropagation();
              setOpenIndex((i) => (i === null ? null : (i - 1 + images.length) % images.length));
            }}
            className="absolute left-2 text-4xl text-white/80 hover:text-white sm:left-6"
          >
            ‹
          </button>
          <img
            src={images[openIndex].src}
            alt={images[openIndex].alt}
            onClick={(e) => e.stopPropagation()}
            className="max-h-[85vh] max-w-[90vw] rounded-lg object-contain"
          />
          <button
            type="button"
            aria-label="Next photo"
            onClick={(e) => {
              e.stopPropagation();
              setOpenIndex((i) => (i === null ? null : (i + 1) % images.length));
            }}
            className="absolute right-2 text-4xl text-white/80 hover:text-white sm:right-6"
          >
            ›
          </button>
        </div>
      )}
    </>
  );
}
