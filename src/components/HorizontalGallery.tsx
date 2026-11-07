
import React, { useState, useRef } from 'react';
import { GalleryPhoto, Language } from '../types';
import { translations } from '../data/initialData';
import { ChevronLeft, ChevronRight, X, Play, Pause } from 'lucide-react';

interface HorizontalGalleryProps {
  photos: GalleryPhoto[];
  language: Language;
}

export const HorizontalGallery: React.FC<HorizontalGalleryProps> = ({
  photos,
  language,
}) => {
  const t = translations[language];
  const [lightboxPhoto, setLightboxPhoto] = useState<GalleryPhoto | null>(null);
  const [isPaused, setIsPaused] = useState<boolean>(false);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const handleManualScroll = (direction: 'left' | 'right') => {
    if (scrollContainerRef.current) {
      const scrollAmount = direction === 'left' ? -380 : 380;

      scrollContainerRef.current.scrollBy({
        left: scrollAmount,
        behavior: 'smooth',
      });
    }
  };

  return (
    <section
      id="gallery"
      className="py-20 md:py-28 bg-[#F5F2E9] border-b border-[#E7E2D6] overflow-hidden"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Header & Controls Row */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6 mb-10">

          <div>
            <h2 className="font-bengali-serif text-3xl sm:text-4xl text-[#1C1917] font-semibold">
              {t.galleryHeading}
            </h2>

            {t.gallerySubtitle && (
              <p className="text-[#57534E] text-base mt-2 font-sans max-w-xl">
                {t.gallerySubtitle}
              </p>
            )}
          </div>

          {/* Reel Play / Pause & Scroll Controls */}
          <div className="flex items-center gap-2 self-start sm:self-auto text-xs text-[#57534E]">

            <button
              onClick={() => setIsPaused((prev) => !prev)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white hover:bg-[#EFECE4] text-[#1C1917] border border-[#DDD6C8] shadow-2xs transition-colors"
              title="Pause continuous reel"
            >
              {isPaused ? (
                <Play className="w-3.5 h-3.5" />
              ) : (
                <Pause className="w-3.5 h-3.5" />
              )}

              <span>{isPaused ? 'Resume Reel' : 'Pause'}</span>
            </button>

            <div className="flex items-center gap-1">

              <button
                onClick={() => handleManualScroll('left')}
                className="p-1.5 rounded-full bg-white hover:bg-[#EFECE4] text-[#1C1917] border border-[#DDD6C8] shadow-2xs transition-colors"
                aria-label="Scroll left"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>

              <button
                onClick={() => handleManualScroll('right')}
                className="p-1.5 rounded-full bg-white hover:bg-[#EFECE4] text-[#1C1917] border border-[#DDD6C8] shadow-2xs transition-colors"
                aria-label="Scroll right"
              >
                <ChevronRight className="w-4 h-4" />
              </button>

            </div>
          </div>
        </div>
      </div>

      {/* Infinite Horizontal Reel */}
      <div
        ref={scrollContainerRef}
        className="w-full overflow-x-auto py-3 no-scrollbar"
      >
        <div
          className={`flex gap-5 sm:gap-6 px-4 sm:px-8 w-max ${
            isPaused ? 'gallery-manually-paused' : 'animate-marquee-ltr'
          }`}
        >

          {/* Double array for seamless looping */}
          {[...photos, ...photos].map((photo, idx) => (
            <div
              key={`${photo.id}-${idx}`}
              onClick={() => setLightboxPhoto(photo)}
              className="group relative w-[18.36rem] sm:w-[24.48rem] aspect-4/3 flex-none rounded-xl overflow-hidden bg-white border border-[#D6CEBE] shadow-xs hover:shadow-lg transition-all duration-500 cursor-pointer"
            >
              <img
                src={photo.imageUrl}
                alt={photo.title}
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-106"
                referrerPolicy="no-referrer"
              />
            </div>
          ))}

        </div>
      </div>

      {/* Lightbox Modal */}
      {lightboxPhoto && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-8 bg-stone-900/70 backdrop-blur-xs"
          onClick={() => setLightboxPhoto(null)}
        >
          <div
            className="relative max-w-4xl w-full max-h-[92vh] flex flex-col bg-[#FBF9F5] rounded-xl overflow-hidden border border-[#D6CEBE] shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >

            <button
              onClick={() => setLightboxPhoto(null)}
              className="absolute top-4 right-4 z-20 p-2 text-[#78716C] hover:text-[#1C1917] rounded-full bg-white/80 hover:bg-white shadow-sm transition-colors"
              aria-label="Close Lightbox"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Main Image */}
            <div className="relative flex-1 bg-[#EFECE4] flex items-center justify-center max-h-[75vh] p-4">
              <img
                src={lightboxPhoto.imageUrl}
                alt={lightboxPhoto.title}
                className="max-h-[70vh] w-auto max-w-full object-contain rounded-lg shadow-sm"
                referrerPolicy="no-referrer"
              />
            </div>

          </div>
        </div>
      )}
    </section>
  );
};
