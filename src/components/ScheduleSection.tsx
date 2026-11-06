
import React, { useEffect } from 'react';
import { ScheduleDay, Language, FestivalId } from '../types';
import { translations } from '../data/initialData';
import { allFestivals } from '../data/festivalData';

interface ScheduleSectionProps {
  days: ScheduleDay[];
  language: Language;
  activeFestival: FestivalId;
  onSelectFestival: (id: FestivalId) => void;
}

export const ScheduleSection: React.FC<ScheduleSectionProps> = ({
  days,
  language,
  activeFestival,
  onSelectFestival,
}) => {
  const currentFestival = allFestivals[activeFestival] || allFestivals.durga;

  const heading =
    language === 'bn'
      ? currentFestival.scheduleHeadingBengali
      : language === 'hi'
      ? currentFestival.scheduleHeadingHindi
      : currentFestival.scheduleHeadingEnglish;

  const subtitle =
    language === 'bn'
      ? currentFestival.scheduleSubtitleBengali
      : language === 'hi'
      ? currentFestival.scheduleSubtitleHindi
      : currentFestival.scheduleSubtitleEnglish;

  // Festival tabs
  const festivalTabs: FestivalId[] = [
    'durga',
    'laxmi',
    'kali',
    'saraswati',
    'noboborsho',
  ];

  const getFestivalLabel = (id: FestivalId) => {
    const festival = allFestivals[id];

    return language === 'bn'
      ? festival.tabLabelBengali
      : language === 'hi'
      ? festival.tabLabelHindi
      : festival.tabLabelEnglish;
  };

  return (
    <section
      id="schedule"
      className="bg-[#FAF7F0] py-16 md:py-24 border-b border-[#DED7CB]"
    >
      <div className="max-w-7xl mx-auto px-6 md:px-10 lg:px-14">

        {/* HEADER */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-16 items-center mb-16">

          <div>
            <p className="text-[11px] uppercase tracking-[0.25em] text-[#A5221B] font-medium mb-5">
              SHASHTHI TO DASHAMI
            </p>

            {/* Decorative divider */}
            <div className="flex items-center gap-1.5 mb-4 w-24">
              <span className="h-px flex-1 bg-[#D6B66B]" />
              <span className="text-[#B91C1C] text-sm">✦</span>
              <span className="h-px flex-1 bg-[#D6B66B]" />
            </div>

            <h2 className="font-bengali-serif text-5xl md:text-6xl lg:text-7xl text-[#2C1C18] font-normal tracking-tight leading-none">
              {heading}
            </h2>
          </div>

          <div className="md:pl-10">
            {subtitle && (
              <p className="font-bengali-sans text-base md:text-[17px] leading-8 text-[#51433D] max-w-md">
                {subtitle}
              </p>
            )}

            <p className="text-sm text-[#81756C] mt-2 leading-7">
              Timings follow the traditional panjika.
            </p>
          </div>

        </div>

        {/* FESTIVAL TABS */}
        <div className="mb-10 border-b border-[#DED7CB] overflow-x-auto">
          <div
            className="flex items-center gap-8 md:gap-10 min-w-max"
            role="tablist"
            aria-label="Select a festival"
          >
            {festivalTabs.map((id) => {
              const isActive = activeFestival === id;

              return (
                <button
                  key={id}
                  role="tab"
                  aria-selected={isActive}
                  onClick={() => onSelectFestival(id)}
                  className={`
                    relative pb-4 text-sm md:text-[15px]
                    whitespace-nowrap transition-colors duration-200
                    font-bengali-sans
                    ${
                      isActive
                        ? 'text-[#B91C1C] font-medium'
                        : 'text-[#493A34] hover:text-[#B91C1C]'
                    }
                  `}
                >
                  {getFestivalLabel(id)}

                  {isActive && (
                    <span className="absolute bottom-0 left-0 w-full h-[2px] bg-[#B91C1C]" />
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* SCHEDULE DAYS */}
        <div>
          {days.map((day, index) => {
            const title =
              language === 'bn'
                ? day.titleBengali
                : language === 'hi'
                ? day.titleHindi
                : day.titleEnglish;

            const daySubtitle =
              language === 'bn'
                ? day.subtitleBengali
                : language === 'hi'
                ? day.subtitleHindi
                : day.subtitleEnglish;

            return (
              <article
                key={day.id}
                className="
                  grid grid-cols-1
                  md:grid-cols-[100px_1fr_1fr]
                  lg:grid-cols-[115px_1.15fr_1fr]
                  gap-6 md:gap-8
                  py-10 md:py-12
                  border-t border-[#DED7CB]
                "
              >

                {/* DAY NUMBER */}
                <div>
                  <span className="font-bengali-serif text-5xl md:text-6xl font-normal text-[#2C1C18] leading-none">
                    {index + 1}
                  </span>
                </div>

                {/* DAY INFORMATION */}
                <div>
                  <h3 className="font-bengali-serif text-3xl md:text-4xl lg:text-[42px] text-[#2C1C18] font-normal leading-tight">
                    {title}
                  </h3>

                  <p className="uppercase tracking-[0.16em] text-[11px] text-[#65564E] mt-3">
                    DAY {index + 1}
                    {day.date ? ` · ${day.date}` : ''}
                  </p>

                  {daySubtitle && (
                    <p className="font-bengali-serif italic text-lg text-[#493A34] mt-3">
                      {daySubtitle}
                    </p>
                  )}
                </div>

                {/* RITUALS */}
                <div className="pt-1">
                  {day.rituals.map((ritual) => {
                    const ritualTitle =
                      language === 'bn'
                        ? ritual.titleBengali
                        : language === 'hi'
                        ? ritual.titleHindi
                        : ritual.titleEnglish;

                    return (
                      <div
                        key={ritual.id}
                        className="
                          flex items-center justify-between
                          gap-4 py-3.5
                          border-b border-dashed border-[#DED7CB]
                        "
                      >
                        <div className="min-w-0">
                          <p className="text-sm md:text-[15px] text-[#342722] font-normal">
                            {ritualTitle}
                          </p>

                          {ritual.note && (
                            <p className="text-xs text-[#82766D] mt-1">
                              {ritual.note}
                            </p>
                          )}
                        </div>

                        <span className="
                          text-sm text-[#C5221A]
                          whitespace-nowrap shrink-0
                          tabular-nums
                        ">
                          {ritual.time}
                        </span>
                      </div>
                    );
                  })}
                </div>

              </article>
            );
          })}
        </div>

      </div>
    </section>
  );
};
