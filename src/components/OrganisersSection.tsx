import React from 'react';
import { Organiser, Language } from '../types';
import { translations } from '../data/initialData';
import { Mail, Phone } from 'lucide-react';

interface OrganisersSectionProps {
  organisers: Organiser[];
  language: Language;
}

const OrganiserAvatar: React.FC<{ organiser: Organiser }> = ({ organiser }) => {
  const [hasImageError, setHasImageError] = React.useState(false);

  if (!organiser.photoUrl || hasImageError) return null;

  return (
    <div className="w-16 h-16 rounded-full mb-4 border border-[#B91C1C]/20 overflow-hidden">
      <img
        src={organiser.photoUrl}
        alt={`${organiser.nameEnglish} portrait`}
        className="w-full h-full object-cover"
        onError={() => setHasImageError(true)}
      />
    </div>
  );
};

export const OrganisersSection: React.FC<OrganisersSectionProps> = ({ organisers, language }) => {
  const t = translations[language];

  return (
    <section id="organisers" className="py-20 md:py-28 bg-[#faf4e9] border-b border-[#dbd2bf]">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="mb-14">
          <div className="text-xs uppercase tracking-widest text-[#78716C] mb-2 font-mono">
            PUJA STEERING COMMITTEE · MASTER ARTISANS
          </div>
          <h2 className="font-bengali-serif text-3xl sm:text-4xl text-[#1C1917] font-semibold">
            {t.organisersHeading}
          </h2>
          {t.organisersSubtitle && (
            <p className="text-[#57534E] text-base mt-2 font-sans max-w-2xl">
              {t.organisersSubtitle}
            </p>
          )}
        </div>

        {/* Organisers Grid — Clean Typographic Presentation Without Photos */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8">
          {organisers.map((org) => {
            const name =
              language === 'bn'
                ? org.nameBengali
                : language === 'hi'
                ? org.nameHindi
                : org.nameEnglish;
            const role =
              language === 'bn'
                ? org.roleBengali
                : language === 'hi'
                ? org.roleHindi
                : org.roleEnglish;
            const bio =
              language === 'bn'
                ? org.bioBengali
                : language === 'hi'
                ? org.bioHindi
                : org.bioEnglish;

            return (
              <div
                key={org.id}
                className="bg-white p-6 rounded-xl border border-[#E7E2D6] shadow-2xs hover:shadow-md transition-all duration-300 flex flex-col justify-between group"
              >
                <div>
                  <OrganiserAvatar organiser={org} />

                  {/* Role Kicker */}
                  <span className="text-[11px] uppercase tracking-wider font-mono text-[#991B1B] font-semibold block mb-1.5">
                    {role}
                  </span>

                  {/* Name */}
                  <h3 className="font-bengali-serif text-xl font-bold text-[#1C1917] leading-tight mb-2.5 group-hover:text-[#B91C1C] transition-colors">
                    {name}
                  </h3>

                  {/* Bio / Dedication */}
                  <p className="text-xs sm:text-sm text-[#57534E] leading-relaxed font-sans">
                    {bio}
                  </p>
                </div>

                {/* Contact Email */}
                <div className="mt-5 pt-3.5 border-t border-[#F2EEE4] flex items-center gap-1.5 text-[11px] text-[#78716C] font-mono min-h-9">
                  {org.contact && (
                    <>
                      {org.contact.includes('@') ? (
                        <Mail className="w-3.5 h-3.5 text-[#991B1B] shrink-0" />
                      ) : (
                        <Phone className="w-3.5 h-3.5 text-[#991B1B] shrink-0" />
                      )}
                      <span className="truncate">{org.contact}</span>
                    </>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
