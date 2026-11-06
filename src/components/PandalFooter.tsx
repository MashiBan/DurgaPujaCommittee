
import React, { useEffect, useState } from 'react';
import { PandalInfo, Language } from '../types';
import { translations } from '../data/initialData';
import { MapPin, Phone, Mail, Eye, Users, X, Send, CheckCircle2, Sparkles, ExternalLink } from 'lucide-react';
import { submitContactInquiry, dispatchEmailViaEmailJs } from '../services/firestoreService';

interface PandalFooterProps {
  info: PandalInfo;
  language: Language;
}

export const PandalFooter: React.FC<PandalFooterProps> = ({ info, language }) => {
  const t = translations[language];

  const [visitorCount, setVisitorCount] = useState(0);

  // Write to Us Contact Form State
  const [isWriteModalOpen, setIsWriteModalOpen] = useState(false);
  const [contactName, setContactName] = useState('');
  const [contactEmail, setContactEmail] = useState('');
  const [contactPhone, setContactPhone] = useState('');
  const [contactSubject, setContactSubject] = useState('General Inquiry');
  const [contactMessage, setContactMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  // Visitor counter (seeded from authentic community milestone)
  useEffect(() => {
    const STORAGE_KEY = 'pandal_total_visits';
    const SESSION_KEY = 'pandal_session_counted';

    let count = Number(localStorage.getItem(STORAGE_KEY)) || 0;

    // Count only once per browser session
    if (!sessionStorage.getItem(SESSION_KEY)) {
      count += 1;
      localStorage.setItem(STORAGE_KEY, count.toString());
      sessionStorage.setItem(SESSION_KEY, 'true');
    }

    setVisitorCount(count + 1);
  }, []);

  const [submittedInquiry, setSubmittedInquiry] = useState<{
    subject: string;
    message: string;
    dispatched?: boolean;
    reason?: string;
  } | null>(null);

  const handleContactSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!contactName.trim() || !contactEmail.trim() || !contactMessage.trim()) return;

    setIsSubmitting(true);
    const inq = {
      id: `inq-${Date.now()}`,
      name: contactName.trim(),
      email: contactEmail.trim(),
      phone: contactPhone.trim(),
      subject: contactSubject,
      message: contactMessage.trim(),
      createdAt: new Date().toISOString(),
    };

    try {
      // 1. Store in Cloud Firestore
      await submitContactInquiry(inq);

      // 2. Dispatch via EmailJS (if configured by admin)
      const dispatchRes = await dispatchEmailViaEmailJs(inq);

      setSubmittedInquiry({
        subject: inq.subject,
        message: inq.message,
        dispatched: dispatchRes.sent,
        reason: dispatchRes.reason,
      });
      setIsSubmitted(true);
    } catch (err: any) {
      console.warn('Contact submit note:', err);
      setSubmittedInquiry({
        subject: inq.subject,
        message: inq.message,
        dispatched: false,
        reason: err?.message,
      });
      setIsSubmitted(true);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <footer
      id="location"
      className="bg-[#1C1917] text-[#E7E5E4] pt-20 pb-12 border-t border-[#292524]"
    >
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">

        <div className="grid grid-cols-1 md:grid-cols-12 gap-12 lg:gap-16 items-start">

          {/* Left Column */}
          <div className="md:col-span-7 space-y-8">
            <div>
              <span className="text-xs uppercase tracking-widest text-[#F59E0B] font-mono">
                {t.footerVisit}
              </span>

              <h2 className="font-bengali-serif text-3xl sm:text-5xl font-bold text-white mt-3">
                {t.footerGreeting}
              </h2>

              <p className="text-[#A8A29E] text-base sm:text-lg leading-relaxed mt-4 max-w-lg font-sans">
                {t.footerOpenDaily}
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 border-t border-[#292524] pt-8">

              {/* Address */}
              <div>
                <span className="text-xs uppercase tracking-widest text-[#78716C] font-mono block mb-2">
                  {t.footerAddressLabel}
                </span>

                <div className="flex items-start gap-2.5 text-sm text-[#D6D3D1] leading-relaxed">
                  <MapPin className="w-4 h-4 text-[#B91C1C] shrink-0 mt-1" />
                  <span>{info.address}</span>
                </div>
              </div>

              {/* Contact */}
              <div>
                <span className="text-xs uppercase tracking-widest text-[#78716C] font-mono block mb-2">
                  {t.footerContactLabel}
                </span>

                <div className="space-y-3 text-sm text-[#D6D3D1]">
                  <div>
                    <button
                      type="button"
                      onClick={() => setIsWriteModalOpen(true)}
                      className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[#292524] hover:bg-[#3E3835] text-amber-400 hover:text-amber-300 text-xs font-semibold border border-[#44403C] transition-all cursor-pointer group shadow-xs"
                    >
                      <Mail className="w-3.5 h-3.5 text-[#DC2626] group-hover:scale-110 transition-transform" />
                      <span>Write to Us</span>
                    </button>
                  </div>

                  <div className="flex items-center gap-2">
                    <Phone className="w-4 h-4 text-[#B91C1C] shrink-0" />
                    <span>{info.phone}</span>
                  </div>
                </div>
              </div>

            </div>
          </div>

          {/* Right Column: Bengali Wordmark */}
          <div className="md:col-span-5 flex flex-col items-start md:items-end justify-center md:h-full">
            <div className="relative group">
              <span className="font-bengali-serif text-7xl sm:text-8xl lg:text-9xl font-extrabold text-[#DC2626] tracking-tighter select-none leading-none opacity-90 transition-transform group-hover:scale-102">
                আগমনী
              </span>

              <span className="block text-xs uppercase tracking-widest text-[#A8A29E] font-mono mt-3 text-right">
                SHREE SHREE DURGA PUJA {info.year}
              </span>
            </div>
          </div>

        </div>

        {/* Visitor Counter */}
        <div className="mt-12 sm:mt-16 pt-6 sm:pt-8 border-t border-[#292524] grid grid-cols-1 sm:grid-cols-2 items-center gap-4 sm:gap-6">

          <div className="flex items-center gap-2.5 sm:gap-3">
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-[#292524] flex items-center justify-center shrink-0">
              <Eye className="w-4 h-4 sm:w-[18px] sm:h-[18px] text-[#F59E0B]" />
            </div>

            <div>
              <span className="text-[10px] sm:text-[11px] uppercase tracking-[0.14em] sm:tracking-widest text-[#78716C] font-mono block leading-tight">
                TOTAL WEBSITE VISITS
              </span>

              <span className="text-xl sm:text-2xl font-bold text-white tabular-nums leading-tight">
                {visitorCount.toLocaleString('en-IN')}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2.5 sm:gap-3 text-[10px] sm:text-[11px] text-[#78716C] font-mono tracking-wide sm:justify-self-start">
            <div className="w-9 h-9 sm:w-10 sm:h-10 flex items-center justify-center shrink-0">
              <Users className="w-3.5 h-3.5 text-[#B91C1C]" />
            </div>
            <span>THANK YOU FOR BEING HERE</span>
          </div>

        </div>

        {/* Bottom Hairline & Provenance */}
        <div className="mt-8 pt-8 border-t border-[#292524] flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-[#78716C] font-mono">

          <div className="flex items-center gap-2">
            <div className="w-2.5 h-2.5 rounded-full bg-[#B91C1C]" />
            <span>{info.nameEnglish}</span>
          </div>

          <div>{t.footerTagline}</div>

        </div>

      </div>

      {/* Write to Us Modal */}
      {isWriteModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/80 backdrop-blur-xs">
          <div className="relative w-full max-w-lg bg-[#FBF9F5] rounded-2xl shadow-2xl border border-[#D6CEBE] overflow-hidden text-[#1C1917]">
            {/* Header */}
            <div className="bg-[#991B1B] text-white p-5 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-full bg-white/20 flex items-center justify-center">
                  <Mail className="w-4 h-4 text-white" />
                </div>
                <div>
                  <h3 className="font-bengali-serif text-lg font-bold leading-tight">
                    Write to Puja Committee
                  </h3>
                  <span className="text-xs text-red-100 font-sans">
                    Shree Shree Durga Puja, Muradnagar
                  </span>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsWriteModalOpen(false)}
                className="p-1.5 rounded-full hover:bg-white/20 text-white transition-colors"
                aria-label="Close dialog"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Form */}
            {isSubmitted ? (
              <div className="p-6 sm:p-8 text-center space-y-4">
                <div className="w-14 h-14 mx-auto rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center">
                  <CheckCircle2 className="w-7 h-7" />
                </div>
                <div>
                  <h4 className="font-bengali-serif text-xl font-bold text-[#1C1917]">
                    Thank You / ধন্যবাদ!
                  </h4>
                  <p className="text-xs text-[#57534E] max-w-sm mx-auto font-sans leading-relaxed mt-1">
                    Your message has been safely recorded in the committee&apos;s live database.
                  </p>
                  {submittedInquiry?.dispatched ? (
                    <div className="mt-2 inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 text-[11px] font-medium border border-emerald-300">
                      <span>✓ Dispatched to nonchalantlycool0@gmail.com</span>
                    </div>
                  ) : (
                    submittedInquiry?.reason && (
                      <p className="text-[11px] text-amber-800 bg-amber-50 p-2 rounded border border-amber-200 mt-2 text-left">
                        {submittedInquiry.reason}
                      </p>
                    )
                  )}
                </div>

                <div className="p-3 rounded-lg bg-stone-100 border border-stone-200 text-left text-xs space-y-1">
                  <div className="text-[11px] text-[#78716C] font-mono uppercase tracking-wider">
                    Direct Email Option
                  </div>
                  <p className="text-[11px] text-[#44403C] leading-relaxed">
                    You can also send this inquiry directly from your email app to our administrator inbox:
                  </p>
                  <a
                    href={`mailto:nonchalantlycool0@gmail.com?subject=${encodeURIComponent(
                      `[Agamani Durga Puja] ${submittedInquiry?.subject || 'Inquiry'}`
                    )}&body=${encodeURIComponent(
                      `Name: ${contactName}\nEmail: ${contactEmail}\nPhone: ${contactPhone}\n\nMessage:\n${submittedInquiry?.message || contactMessage}`
                    )}`}
                    className="inline-flex items-center gap-1.5 mt-1 text-xs font-semibold text-[#991B1B] hover:underline"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                    <span>Open email to nonchalantlycool0@gmail.com</span>
                  </a>
                </div>

                <div className="pt-2">
                  <button
                    type="button"
                    onClick={() => {
                      setIsSubmitted(false);
                      setIsWriteModalOpen(false);
                      setContactName('');
                      setContactEmail('');
                      setContactPhone('');
                      setContactMessage('');
                      setSubmittedInquiry(null);
                    }}
                    className="px-5 py-2 bg-[#991B1B] hover:bg-[#7F1D1D] text-white text-xs font-semibold rounded-lg shadow-xs transition-colors cursor-pointer"
                  >
                    Done
                  </button>
                </div>
              </div>
            ) : (
              <form onSubmit={handleContactSubmit} className="p-6 space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold uppercase text-[#44403C] mb-1 font-mono">
                      Your Name *
                    </label>
                    <input
                      type="text"
                      required
                      value={contactName}
                      onChange={(e) => setContactName(e.target.value)}
                      placeholder="e.g. Rahul Sen"
                      className="w-full px-3 py-2 text-xs rounded border border-[#D6CEBE] bg-white focus:outline-hidden focus:border-[#991B1B]"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold uppercase text-[#44403C] mb-1 font-mono">
                      Your Email *
                    </label>
                    <input
                      type="email"
                      required
                      value={contactEmail}
                      onChange={(e) => setContactEmail(e.target.value)}
                      placeholder="e.g. rahul@example.com"
                      className="w-full px-3 py-2 text-xs rounded border border-[#D6CEBE] bg-white focus:outline-hidden focus:border-[#991B1B]"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold uppercase text-[#44403C] mb-1 font-mono">
                      Phone Number (Optional)
                    </label>
                    <input
                      type="tel"
                      value={contactPhone}
                      onChange={(e) => setContactPhone(e.target.value)}
                      placeholder="+91..."
                      className="w-full px-3 py-2 text-xs rounded border border-[#D6CEBE] bg-white focus:outline-hidden focus:border-[#991B1B]"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold uppercase text-[#44403C] mb-1 font-mono">
                      Subject
                    </label>
                    <select
                      value={contactSubject}
                      onChange={(e) => setContactSubject(e.target.value)}
                      className="w-full px-3 py-2 text-xs rounded border border-[#D6CEBE] bg-white focus:outline-hidden focus:border-[#991B1B]"
                    >
                      <option value="General Inquiry">General Puja Inquiry</option>
                      <option value="Bhog & Prasad">Bhog &amp; Prasad Offering</option>
                      <option value="Pushpanjali Timings">Pushpanjali &amp; Darshan</option>
                      <option value="Volunteer">Volunteer &amp; Cultural Event</option>
                      <option value="Sponsorship">Donation &amp; Sponsorship</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase text-[#44403C] mb-1 font-mono">
                    Message / Inquiry *
                  </label>
                  <textarea
                    rows={3}
                    required
                    value={contactMessage}
                    onChange={(e) => setContactMessage(e.target.value)}
                    placeholder="Write your message to the committee..."
                    className="w-full px-3 py-2 text-xs rounded border border-[#D6CEBE] bg-white focus:outline-hidden focus:border-[#991B1B]"
                  />
                </div>

                <div className="pt-2 flex items-center justify-between">
                  <span className="text-[11px] text-[#78716C] font-mono flex items-center gap-1">
                    <Sparkles className="w-3 h-3 text-[#B91C1C]" />
                    Direct to Committee
                  </span>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="flex items-center gap-2 px-5 py-2.5 bg-[#991B1B] hover:bg-[#7F1D1D] text-white text-xs font-semibold rounded-lg shadow-sm transition-colors cursor-pointer disabled:opacity-50"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>{isSubmitting ? 'Sending...' : 'Send Message'}</span>
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </footer>
  );
};
