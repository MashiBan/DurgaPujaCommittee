import React from 'react';
import { FestivalId, Language } from '../types';
import { allFestivals } from '../data/festivalData';
import { Sparkles, Moon, Flame, BookOpen, SunMedium } from 'lucide-react';

interface FestivalTabsProps {
  activeFestival: FestivalId;
  onSelectFestival: (id: FestivalId) => void;
  language: Language;
}

export const FestivalTabs: React.FC<FestivalTabsProps> = ({
  activeFestival,
  onSelectFestival,
  language,
}) => {
  const festivals: Array<{
    id: FestivalId;
    icon: React.ReactNode;
  }> = [
    {
      id: 'durga',
      icon: <Sparkles className="w-3.5 h-3.5 text-[#DC2626]" />,
    },
    {
      id: 'laxmi',
      icon: <Moon className="w-3.5 h-3.5 text-[#D97706]" />,
    },
    {
      id: 'kali',
      icon: <Flame className="w-3.5 h-3.5 text-[#E11D48]" />,
    },
    {
      id: 'saraswati',
      icon: <BookOpen className="w-3.5 h-3.5 text-[#CA8A04]" />,
    },
    {
      id: 'noboborsho',
      icon: <SunMedium className="w-3.5 h-3.5 text-[#B91C1C]" />,
    },
  ];

  return (
    <div className="w-full bg-[#F4EFE6] border-b border-[#E2DDD3] pt-20 sm:pt-22 pb-2.5 px-3 sm:px-6 relative z-30 shadow-2xs">
      <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-3">
        {/* Left cultural context label */}
        <div className="flex items-center gap-2 text-xs font-serif text-[#78716C] tracking-wide shrink-0">
          <span className="w-2 h-2 rounded-full bg-[#DC2626] animate-pulse" />
          <span className="font-semibold text-[#1C1917]">
            {language === 'bn'
              ? 'বাঙালির বারো মাসে তেরো পার্বণ'
              : language === 'hi'
              ? 'बंगाल के पावन उत्सव पर्व'
              : 'Bengali Cultural Festivals'}
          </span>
          <span className="hidden sm:inline text-[#A8A29E]">|</span>
          <span className="hidden sm:inline text-[11px] text-[#78716C]">
            {language === 'bn'
              ? 'উৎসব নির্বাচন করুন'
              : language === 'hi'
              ? 'उत्सव चुनें'
              : 'Select Festival'}
          </span>
        </div>

        {/* Scrollable Festival Tabs */}
        <nav
          className="flex items-center gap-1.5 sm:gap-2 overflow-x-auto w-full md:w-auto pb-1 md:pb-0 scroll-smooth touch-pan-x [scrollbar-width:none] [-webkit-overflow-scrolling:touch]"
          aria-label="Festival Selection Tabs"
        >
          {festivals.map(({ id, icon }) => {
            const data = allFestivals[id];
            const isActive = activeFestival === id;
            const label =
              language === 'bn'
                ? data.tabLabelBengali
                : language === 'hi'
                ? data.tabLabelHindi
                : data.tabLabelEnglish;

            const season =
              language === 'bn'
                ? data.seasonBengali
                : language === 'hi'
                ? data.seasonHindi
                : data.seasonEnglish;

            return (
              <button
                key={id}
                onClick={() => onSelectFestival(id)}
                className={`group relative flex items-center gap-2 px-3 sm:px-4 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-all duration-200 border cursor-pointer select-none shrink-0 ${
                  isActive
                    ? 'bg-[#DC2626] text-white border-[#DC2626] shadow-sm scale-102'
                    : 'bg-white/90 text-[#44403C] border-[#DDD6C8] hover:bg-white hover:text-[#1C1917] hover:border-[#DC2626]/50'
                }`}
              >
                <span className={`shrink-0 transition-transform group-hover:scale-110 ${isActive ? 'text-white' : ''}`}>
                  {React.cloneElement(icon as React.ReactElement<{ className?: string }>, {
                    className: `w-3.5 h-3.5 ${isActive ? 'text-white' : ''}`,
                  })}
                </span>
                <span className="font-bengali-sans font-semibold tracking-tight">
                  {label}
                </span>
                <span
                  className={`hidden lg:inline text-[10px] px-1.5 py-0.2 rounded-full font-serif ${
                    isActive
                      ? 'bg-white/20 text-white'
                      : 'bg-[#F4EFE6] text-[#78716C] group-hover:text-[#44403C]'
                  }`}
                >
                  {season}
                </span>
              </button>
            );
          })}
        </nav>
      </div>
    </div>
  );
};
