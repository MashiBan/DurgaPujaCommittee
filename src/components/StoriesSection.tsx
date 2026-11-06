import React, { useState } from 'react';
import { StoryArticle, Language } from '../types';
import { translations } from '../data/initialData';
import { ArrowUpRight, X, Clock } from 'lucide-react';

interface StoriesSectionProps {
  stories: StoryArticle[];
  language: Language;
}

export const StoriesSection: React.FC<StoriesSectionProps> = ({
  stories,
  language,
}) => {
  const t = translations[language];
  const [activeStory, setActiveStory] = useState<StoryArticle | null>(null);

  // Show only two stories
  const displayedStories = stories.slice(0, 2);

  const getTitle = (story: StoryArticle) =>
    language === 'bn'
      ? story.titleBengali
      : language === 'hi'
      ? story.titleHindi
      : story.titleEnglish;

  const getSubtitle = (story: StoryArticle) =>
    language === 'bn'
      ? story.subtitleBengali
      : language === 'hi'
      ? story.subtitleHindi
      : story.subtitleEnglish;

  const getCategory = (story: StoryArticle) =>
    language === 'bn'
      ? story.categoryBengali
      : language === 'hi'
      ? story.categoryHindi
      : story.categoryEnglish;

  const getContent = (story: StoryArticle) =>
    language === 'bn'
      ? story.contentBengali
      : language === 'hi'
      ? story.contentHindi
      : story.contentEnglish;

  return (
    <section
      id="stories"
      className="bg-[#FAF7F0] py-16 md:py-24 border-b border-[#DED7CB]"
    >
      <div className="max-w-7xl mx-auto px-6 md:px-10 lg:px-14">

        {/* SECTION HEADER */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-16 items-end mb-16">

          <div>
            <p className="text-[11px] uppercase tracking-[0.25em] text-[#A5221B] font-medium mb-5">
              FOLKLORE · RITUAL ARCHIVE · CRAFT
            </p>

            <div className="flex items-center gap-1.5 mb-4 w-24">
              <span className="h-px flex-1 bg-[#D6B66B]" />
              <span className="text-[#B91C1C] text-sm">✦</span>
              <span className="h-px flex-1 bg-[#D6B66B]" />
            </div>

            <h2 className="font-bengali-serif text-5xl md:text-6xl lg:text-7xl text-[#2C1C18] font-normal tracking-tight leading-none">
              {t.storiesHeading}
            </h2>
          </div>

          <div className="md:pl-10">
            <p className="text-base md:text-[17px] leading-8 text-[#51433D] max-w-md">
              {t.storiesSubtitle}
            </p>

            <p className="text-sm text-[#81756C] mt-3">
              Stories, traditions and memories passed through generations.
            </p>
          </div>

        </div>

        {/* STORIES EDITORIAL GRID */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-10 lg:gap-x-16 gap-y-14 md:gap-y-20">

          {displayedStories.map((story, index) => {
            const title = getTitle(story);
            const subtitle = getSubtitle(story);
            const category = getCategory(story);

            return (
              <article
                key={story.id}
                onClick={() => setActiveStory(story)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    setActiveStory(story);
                  }
                }}
                role="button"
                tabIndex={0}
                aria-label={`Read ${title}`}
                className="group cursor-pointer flex flex-col"
              >

                {/* IMAGE */}
                <div className="relative aspect-[4/3] w-full overflow-hidden bg-[#EFE9DD] mb-6">

                  <img
                    src={story.image}
                    alt={title}
                    loading="lazy"
                    referrerPolicy="no-referrer"
                    className="
                      w-full h-full object-cover
                      transition-transform duration-700 ease-out
                      group-hover:scale-[1.035]
                    "
                  />

                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/[0.04] transition-colors duration-500" />

                  {/* Image Index */}
                  <div className="absolute bottom-4 left-4 text-white text-xs tracking-[0.2em] font-mono drop-shadow-md">
                    {String(index + 1).padStart(2, '0')}
                  </div>
                </div>

                {/* CATEGORY AND READING TIME */}
                <div className="flex items-center justify-between gap-4 pb-3 border-b border-[#DED7CB]">

                  <div className="flex items-center gap-3 text-[11px] uppercase tracking-[0.14em]">
                    <span className="text-[#B5221B] font-semibold">
                      {category}
                    </span>

                    <span className="text-[#B8AA99]">/</span>

                    <span className="text-[#81756C]">
                      {story.categoryEnglish}
                    </span>
                  </div>

                  <span className="text-xs text-[#81756C] whitespace-nowrap">
                    {story.readTime}
                  </span>

                </div>

                {/* TITLE */}
                <div className="flex items-start justify-between gap-5 mt-4">

                  <div>
                    <h3 className="
                      font-bengali-serif
                      text-2xl md:text-3xl lg:text-[34px]
                      font-normal
                      text-[#2C1C18]
                      leading-tight
                      transition-colors duration-300
                      group-hover:text-[#B91C1C]
                    ">
                      {title}
                    </h3>

                    <p className="
                      text-sm md:text-base
                      text-[#65564E]
                      mt-3
                      leading-7
                      font-serif
                    ">
                      {subtitle}
                    </p>
                  </div>

                  <ArrowUpRight
                    className="
                      w-5 h-5 mt-1
                      text-[#A5221B]
                      shrink-0
                      transition-transform duration-300
                      group-hover:translate-x-1
                      group-hover:-translate-y-1
                    "
                  />

                </div>

                {/* READ MORE */}
                <div className="mt-5">
                  <span className="
                    text-[11px] uppercase tracking-[0.2em]
                    text-[#A5221B]
                    border-b border-[#C9A69A]
                    pb-1
                  ">
                    Read Story
                  </span>
                </div>

              </article>
            );
          })}

        </div>

        {/* EMPTY STATE */}
        {displayedStories.length === 0 && (
          <div className="py-20 text-center border-t border-[#DED7CB]">
            <p className="font-bengali-serif text-2xl text-[#65564E]">
              No stories available yet.
            </p>
          </div>
        )}

      </div>

      {/* STORY READER MODAL */}
      {activeStory && (
        <div
          className="
            fixed inset-0 z-50
            flex items-center justify-center
            p-3 sm:p-6
            bg-[#211813]/75
            backdrop-blur-sm
          "
          onClick={() => setActiveStory(null)}
        >

          <div
            className="
              relative
              bg-[#FAF7F0]
              w-full max-w-4xl
              max-h-[92vh]
              overflow-y-auto
              border border-[#DED7CB]
              shadow-2xl
            "
            onClick={(e) => e.stopPropagation()}
          >

            {/* CLOSE BUTTON */}
            <button
              onClick={() => setActiveStory(null)}
              className="
                absolute top-4 right-4 z-10
                w-10 h-10
                flex items-center justify-center
                bg-[#FAF7F0]/90
                text-[#493A34]
                hover:text-[#B91C1C]
                transition-colors
              "
              aria-label="Close story"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="p-6 sm:p-10 md:p-14">

              {/* METADATA */}
              <div className="flex flex-wrap items-center gap-3 text-[11px] uppercase tracking-[0.16em] text-[#81756C] mb-6">

                <span className="text-[#A5221B] font-semibold">
                  {activeStory.categoryEnglish}
                </span>

                <span>/</span>

                <span className="flex items-center gap-2">
                  <Clock className="w-3.5 h-3.5" />
                  {activeStory.readTime}
                </span>

              </div>

              {/* TITLE */}
              <h2 className="
                font-bengali-serif
                text-3xl sm:text-5xl md:text-6xl
                font-normal
                text-[#2C1C18]
                leading-tight
              ">
                {getTitle(activeStory)}
              </h2>

              <p className="
                text-lg sm:text-xl
                text-[#81756C]
                font-serif italic
                mt-4 mb-8
                leading-relaxed
              ">
                {getSubtitle(activeStory)}
              </p>

              {/* DECORATIVE DIVIDER */}
              <div className="flex items-center gap-3 mb-8">
                <span className="h-px w-12 bg-[#D6B66B]" />
                <span className="text-[#B91C1C] text-sm">✦</span>
                <span className="h-px flex-1 bg-[#DED7CB]" />
              </div>

              {/* FEATURE IMAGE */}
              <div className="aspect-[16/9] w-full overflow-hidden bg-[#EFE9DD] mb-10">
                <img
                  src={activeStory.image}
                  alt={getTitle(activeStory)}
                  className="w-full h-full object-cover"
                  referrerPolicy="no-referrer"
                />
              </div>

              {/* PULL QUOTE */}
              {activeStory.pullQuote && (
                <div className="py-8 my-8 border-y border-[#DED7CB]">

                  <div className="max-w-2xl mx-auto text-center">

                    <span className="text-3xl text-[#B91C1C] font-serif">
                      “
                    </span>

                    <p className="
                      font-bengali-serif italic
                      text-xl sm:text-2xl
                      text-[#783B31]
                      leading-relaxed
                    ">
                      {activeStory.pullQuote}
                    </p>

                  </div>

                </div>
              )}

              {/* STORY CONTENT */}
              <div className="
                max-w-2xl mx-auto
                font-bengali-sans
                text-base sm:text-lg
                text-[#493A34]
                leading-[2]
                whitespace-pre-line
              ">
                {getContent(activeStory)}
              </div>

              {/* BOTTOM DIVIDER */}
              <div className="mt-14 pt-6 border-t border-[#DED7CB] flex items-center justify-between">

                <span className="text-[10px] uppercase tracking-[0.2em] text-[#81756C]">
                  End of story
                </span>

                <button
                  onClick={() => setActiveStory(null)}
                  className="
                    text-xs uppercase tracking-[0.15em]
                    text-[#A5221B]
                    hover:text-[#2C1C18]
                    transition-colors
                  "
                >
                  Close Story
                </button>

              </div>

            </div>
          </div>
        </div>
      )}

    </section>
  );
};