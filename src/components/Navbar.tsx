import React, { useState, useEffect } from 'react';
import { Language } from '../types';
import { translations } from '../data/initialData';
import { Lock, Menu, X } from 'lucide-react';

interface NavbarProps {
  language: Language;
  onLanguageChange: (lang: Language) => void;
  onOpenAdmin: () => void;
  isAdminLoggedIn: boolean;
}

export const Navbar: React.FC<NavbarProps> = ({
  language,
  onLanguageChange,
  onOpenAdmin,
  isAdminLoggedIn,
}) => {
  const t = translations[language];
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  // Add subtle scroll awareness
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 40);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div className="fixed top-3 sm:top-4 inset-x-0 z-50 px-3 sm:px-6 lg:px-8 pointer-events-none transition-all duration-300">
      <div className="max-w-6xl mx-auto flex items-center justify-between gap-3 sm:gap-6">
        {/* Left Pill: Agamani Brand Lockup with Solid Styling (No Glass Effect) */}
        <a
          href="#"
          className={`pointer-events-auto flex items-center gap-2.5 px-3.5 py-1.5 rounded-full transition-all duration-300 group shadow-md border border-[#D6CEBE] ${
            isScrolled ? 'bg-[#FBF9F5]' : 'bg-[#FDFBF7]'
          }`}
        >
          {/* Authentic red/maroon icon matching reference */}
          <div className="w-6 h-6 rounded-md bg-[#800000] flex items-center justify-center p-1 shadow-xs transition-transform group-hover:scale-105 shrink-0">
            <svg viewBox="0 0 24 24" fill="none" className="w-3.5 h-3.5 text-white">
              <path
                d="M6 18V10C6 6.68629 8.68629 4 12 4C15.3137 4 18 6.68629 18 10V18"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
              />
              <circle cx="12" cy="11" r="1.5" fill="currentColor" />
            </svg>
          </div>

          {/* English Wordmark in rich Maroon */}
          <span className="font-playfair font-bold text-xl sm:text-2xl text-[#800000] tracking-tight leading-none select-none group-hover:text-[#991B1B] transition-colors">
            Agamani
          </span>
        </a>

        {/* Right Pill: Nav Links + Language Switcher + Admin with Solid Styling (No Glass Effect) */}
        <div
          className={`pointer-events-auto flex items-center gap-3.5 sm:gap-6 px-4 sm:px-5 py-1.5 rounded-full transition-all duration-300 shadow-md border border-[#D6CEBE] ${
            isScrolled ? 'bg-[#FBF9F5]' : 'bg-[#FDFBF7]'
          }`}
        >
          {/* Desktop Nav Links in Maroon */}
          <nav className="hidden md:flex items-center gap-5 sm:gap-6 text-sm font-semibold text-[#800000]">
            <a
              href="#schedule"
              className="hover:text-[#991B1B] transition-colors whitespace-nowrap shrink-0"
            >
              {t.navSchedule}
            </a>
            <a
              href="#stories"
              className="hover:text-[#991B1B] transition-colors whitespace-nowrap shrink-0"
            >
              {t.navStories}
            </a>
          </nav>

          {/* Hairline Separator */}
          <div className="hidden sm:block h-3.5 w-px bg-[#D6CEBE]" aria-hidden="true" />

          {/* Language Selector Capsule (Solid, No glass effect) */}
          <div className="flex items-center bg-[#F3EFE6] p-0.5 rounded-full border border-[#D6CEBE] text-xs font-semibold shadow-xs">
            <button
              onClick={() => onLanguageChange('bn')}
              className={`px-2 py-0.5 rounded-full transition-all whitespace-nowrap ${
                language === 'bn'
                  ? 'bg-white text-[#800000] shadow-xs font-bold'
                  : 'text-[#44403C] hover:text-[#1C1917]'
              }`}
            >
              বাংলা
            </button>
            <button
              onClick={() => onLanguageChange('en')}
              className={`px-2 py-0.5 rounded-full transition-all whitespace-nowrap ${
                language === 'en'
                  ? 'bg-white text-[#800000] shadow-xs font-bold'
                  : 'text-[#44403C] hover:text-[#1C1917]'
              }`}
            >
              EN
            </button>
            <button
              onClick={() => onLanguageChange('hi')}
              className={`px-2 py-0.5 rounded-full transition-all whitespace-nowrap ${
                language === 'hi'
                  ? 'bg-white text-[#800000] shadow-xs font-bold'
                  : 'text-[#44403C] hover:text-[#1C1917]'
              }`}
            >
              हिंदी
            </button>
          </div>

          {/* Admin Lock Button */}
          <button
            onClick={onOpenAdmin}
            className={`flex items-center gap-1 px-2.5 py-1 text-xs font-medium rounded-full transition-all whitespace-nowrap shrink-0 border shadow-xs ${
              isAdminLoggedIn
                ? 'bg-[#15803D] text-white border-[#15803D] hover:bg-[#166534]'
                : 'bg-[#800000] text-white border-[#800000] hover:bg-[#991B1B]'
            }`}
            title="Puja Committee Admin Panel"
          >
            <Lock className="w-3 h-3" />
            <span className="hidden sm:inline">{isAdminLoggedIn ? 'Admin' : t.adminLogin}</span>
          </button>

          {/* Mobile Menu Hamburger */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-1 text-[#800000] hover:text-[#991B1B] transition-colors"
            aria-label="Toggle Navigation Menu"
          >
            {mobileMenuOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer (Solid, No Glass Effect) */}
      {mobileMenuOpen && (
        <div className="pointer-events-auto mt-2 max-w-sm mx-auto bg-[#FDFBF7] border border-[#D6CEBE] rounded-2xl p-4 shadow-2xl space-y-2 animate-in fade-in slide-in-from-top-2 duration-200">
          <a
            href="#schedule"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3 py-1.5 text-sm font-semibold text-[#800000] hover:text-[#991B1B] hover:bg-[#F3EFE6] rounded-lg transition-colors"
          >
            {t.navSchedule}
          </a>
          <a
            href="#gallery"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3 py-1.5 text-sm font-semibold text-[#800000] hover:text-[#991B1B] hover:bg-[#F3EFE6] rounded-lg transition-colors"
          >
            {t.navGallery}
          </a>
          <a
            href="#social"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3 py-1.5 text-sm font-semibold text-[#800000] hover:text-[#991B1B] hover:bg-[#F3EFE6] rounded-lg transition-colors"
          >
            {t.navSocial}
          </a>
        </div>
      )}
    </div>
  );
};
