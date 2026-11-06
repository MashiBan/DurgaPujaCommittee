
import React from 'react';
import { Language, FestivalId } from '../types';
import { allFestivals } from '../data/festivalData';

interface EditorialIntroProps {
  language: Language;
  activeFestival?: FestivalId;
}

export const EditorialIntro: React.FC<EditorialIntroProps> = ({
  language,
  activeFestival = 'durga',
}) => {
  const festival = allFestivals[activeFestival] || allFestivals['durga'];

  // Editorial kicker
  const kicker =
    language === 'bn'
      ? festival.editorialKickerBengali
      : language === 'hi'
      ? festival.editorialKickerHindi
      : festival.editorialKickerEnglish;

  // Main headline
  const quoteHeadline =
    language === 'bn'
      ? festival.quoteHeadlineBengali
      : language === 'hi'
      ? festival.quoteHeadlineHindi
      : festival.quoteHeadlineEnglish;

  // Left subtitle
  const quoteSubLeft =
    language === 'bn'
      ? festival.quoteSubLeftBengali
      : language === 'hi'
      ? festival.quoteSubLeftHindi
      : festival.quoteSubLeftEnglish;

  // Right subtitle
  const quoteSubRight =
    language === 'bn'
      ? festival.quoteSubRightBengali
      : language === 'hi'
      ? festival.quoteSubRightHindi
      : festival.quoteSubRightEnglish;

  // Ticker content
  const tickerItems =
    language === 'bn'
      ? festival.tickerItemsBengali
      : language === 'hi'
      ? festival.tickerItemsHindi
      : festival.tickerItemsEnglish;

  const safeTickerItems = Array.isArray(tickerItems)
    ? tickerItems
    : [];

  return (
    <section className="pt-16 md:pt-24 bg-[#FBF9F5] border-b border-[#E7E2D6]">

      <div className="max-w-6xl mb-30 mx-auto px-4 sm:px-6 lg:px-8">

        {/* Sub-label kicker */}
        <div className="flex items-center gap-2 mb-6 text-xs uppercase tracking-widest text-[#991B1B] font-semibold font-serif">
          <span>{kicker}</span>
        </div>

        {/* Main Editorial Headline */}
        <h1 className="font-bengali-serif text-3xl sm:text-5xl lg:text-6xl text-[#1C1917] font-semibold tracking-tight leading-[1.25] max-w-4xl mb-12 text-balance">
          {quoteHeadline}
        </h1>

        {/* Editorial Subtext */}
        {(quoteSubLeft || quoteSubRight) && (
          <div className="border-t border-[#E7E2D6] pt-8">

            {quoteSubLeft && (
              <p className="text-[#57534E] text-base lg:text-lg leading-relaxed font-serif italic max-w-3xl text-balance">
                {quoteSubLeft}
              </p>
            )}

            {quoteSubRight && (
              <p className="text-[#57534E] text-base lg:text-lg leading-relaxed font-sans mt-4 max-w-2xl">
                {quoteSubRight}
              </p>
            )}

          </div>
        )}

      </div>

      {/* Cultural Editorial Ticker */}
      {safeTickerItems.length > 0 && (
        <div className="mt-10 relative overflow-hidden bg-[#FAF7F0]">

          {/* Decorative Bengali-inspired top border */}
          <div className="h-[9px] w-full ticker-border" />

          {/* Scrolling text */}
          <div className="overflow-hidden py-5 sm:py-7">

            <div className="flex w-max animate-marquee-ltr items-center">

              {[...Array(4)].map((_, groupIdx) => (
                <div
                  key={groupIdx}
                  className="flex shrink-0 items-center gap-8 sm:gap-12 px-2"
                >
                  {safeTickerItems.map((item, itemIdx) => (
                    <React.Fragment key={`${groupIdx}-${itemIdx}`}>

                      <span
                        className={`whitespace-nowrap font-serif text-5xl sm:text-6xl md:text-5xl lg:text-[76px] leading-none tracking-tight transition-colors duration-300 cursor-default ${
                          itemIdx % 2 === 0
                            ? 'text-[#C92323]'
                            : 'ticker-outline'
                        }`}
                      >
                        {item}
                      </span>

                      <span
                        className="text-[#D97706] text-3xl sm:text-4xl font-serif px-1"
                        aria-hidden="true"
                      >
                        ⌒
                      </span>

                    </React.Fragment>
                  ))}
                </div>
              ))}

            </div>

          </div>

          

        </div>
      )}

    </section>
  );
};

export default EditorialIntro;
