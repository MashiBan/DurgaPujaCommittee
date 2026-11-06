
import React, { useState, useEffect } from 'react';
import { Language, FestivalId } from '../types';
import { translations } from '../data/initialData';
import { allFestivals } from '../data/festivalData';
import {
  Sun,
  Moon,
  Clock,
  Sunrise,
  Sunset,
  MoonStar,
  LoaderCircle,
  Sparkles,
  ChevronDown,
} from 'lucide-react';

interface LivingPandalHeroProps {
  language: Language;
  activeFestival?: FestivalId;
}

type TimePhase = 'dawn' | 'noon' | 'sunset' | 'night' | 'lateNight';
type DevoteePose = 'walking' | 'prayer' | 'aarti' | 'dance' | 'drum';

const DEVOTEES: {
  x: number;
  height: number;
  outfit: string;
  accent: string;
  skin: string;
  pose: DevoteePose;
  depth: 'background' | 'foreground';
  mobileHidden?: boolean;
}[] = [
  { x: 2, height: 96, outfit: '#8B3A3A', accent: '#D9A441', skin: '#9B6349', pose: 'walking', depth: 'background' },
  { x: 7, height: 120, outfit: '#E8DCC8', accent: '#A52A2A', skin: '#9C684F', pose: 'prayer', depth: 'foreground' },
  { x: 12, height: 104, outfit: '#23635A', accent: '#D5B56A', skin: '#805239', pose: 'walking', depth: 'background', mobileHidden: true },
  { x: 17, height: 132, outfit: '#A92C35', accent: '#F0D8B2', skin: '#A96F53', pose: 'drum', depth: 'foreground' },
  { x: 22, height: 112, outfit: '#455B75', accent: '#D5B56A', skin: '#85543F', pose: 'walking', depth: 'background' },
  { x: 27, height: 126, outfit: '#F0E7D7', accent: '#B73036', skin: '#986149', pose: 'aarti', depth: 'foreground', mobileHidden: true },
  { x: 32, height: 100, outfit: '#6E4260', accent: '#D9A441', skin: '#744B3A', pose: 'walking', depth: 'background' },
  { x: 37, height: 118, outfit: '#2E6B4E', accent: '#E5C78B', skin: '#A16B50', pose: 'prayer', depth: 'foreground' },
  { x: 42, height: 92, outfit: '#B77132', accent: '#F0D8B2', skin: '#85563E', pose: 'walking', depth: 'background', mobileHidden: true },
  { x: 47, height: 128, outfit: '#F0E7D7', accent: '#A52A2A', skin: '#A56C51', pose: 'aarti', depth: 'foreground' },
  { x: 53, height: 108, outfit: '#384A69', accent: '#D5B56A', skin: '#7D503D', pose: 'walking', depth: 'background' },
  { x: 58, height: 122, outfit: '#C34A42', accent: '#E8DCC8', skin: '#9C654B', pose: 'dance', depth: 'foreground', mobileHidden: true },
  { x: 63, height: 96, outfit: '#537253', accent: '#D9A441', skin: '#82533D', pose: 'walking', depth: 'background' },
  { x: 68, height: 130, outfit: '#D6C6A7', accent: '#A52A2A', skin: '#A36B51', pose: 'prayer', depth: 'foreground' },
  { x: 73, height: 106, outfit: '#6D485D', accent: '#D5B56A', skin: '#80533F', pose: 'walking', depth: 'background', mobileHidden: true },
  { x: 78, height: 124, outfit: '#176B66', accent: '#E8DCC8', skin: '#996149', pose: 'aarti', depth: 'foreground' },
  { x: 84, height: 100, outfit: '#8B542F', accent: '#D9A441', skin: '#82523D', pose: 'walking', depth: 'background' },
  { x: 90, height: 132, outfit: '#E9DFCE', accent: '#A52A2A', skin: '#A66C51', pose: 'prayer', depth: 'foreground' },
  { x: 96, height: 112, outfit: '#724354', accent: '#D5B56A', skin: '#895941', pose: 'walking', depth: 'background', mobileHidden: true },
];

const VISIBLE_DEVOTEES: Record<TimePhase, number[]> = {
  dawn: [0, 1, 3, 5, 7, 9, 11, 13, 15, 17],
  noon: DEVOTEES.map((_, index) => index),
  sunset: DEVOTEES.map((_, index) => index).filter((index) => index !== 2),
  night: [0, 1, 3, 5, 6, 7, 9, 11, 13, 15, 17, 18],
  lateNight: [1, 5, 7, 9, 13, 15],
};

const getNowHour = () => {
  const date = new Date();
  return date.getHours() + date.getMinutes() / 60;
};

const getTimePhase = (hour: number): TimePhase => {
  if (hour >= 5 && hour < 8) return 'dawn';
  if (hour >= 8 && hour < 16.5) return 'noon';
  if (hour >= 16.5 && hour < 19) return 'sunset';
  if (hour >= 19 && hour < 23.5) return 'night';
  return 'lateNight';
};

export const LivingPandalHero: React.FC<LivingPandalHeroProps> = ({
  language,
  activeFestival = 'durga',
}) => {
  const t = translations[language];
  const festival = allFestivals[activeFestival] || allFestivals['durga'];

  const headline =
    language === 'bn'
      ? festival.headlineBengali
      : language === 'hi'
      ? festival.headlineHindi
      : festival.headlineEnglish;

  const subBadge =
    language === 'bn'
      ? festival.subBadgeBengali
      : language === 'hi'
      ? festival.subBadgeHindi
      : festival.subBadgeEnglish;

  const altarBadge =
    language === 'bn'
      ? festival.altarBadgeBengali
      : language === 'hi'
      ? festival.altarBadgeHindi
      : festival.altarBadgeEnglish;

  const [hour, setHour] = useState<number>(getNowHour);
  const [isLiveClock, setIsLiveClock] = useState(true);
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);
  const [hasScrolled, setHasScrolled] = useState(false);

  const phase = getTimePhase(hour);

  // Scroll detection: on initial load, only the scene is visible. Scrolling a bit reveals time controls.
  useEffect(() => {
    const handleScroll = () => {
      setHasScrolled(window.scrollY > 25);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Live clock
  useEffect(() => {
    if (!isLiveClock) return;

    const updateClock = () => setHour(getNowHour());

    updateClock();

    const interval = window.setInterval(updateClock, 30000);

    return () => window.clearInterval(interval);
  }, [isLiveClock]);

  // Time formatting
  const formatTime = (h: number) => {
    const totalMinutes = Math.round(h * 60) % 1440;
    const hrs = Math.floor(totalMinutes / 60);
    const mins = totalMinutes % 60;

    const period = hrs >= 12 ? 'PM' : 'AM';
    const displayHours = hrs % 12 || 12;

    return `${displayHours}:${String(mins).padStart(2, '0')} ${period}`;
  };

  // Day and night filter
  const getDayNightFilter = (h: number) => {
    let sat = 100;
    let hue = 0;
    let sepia = 4;
    let brightness = 100;
    let contrast = 100;

    if (h >= 5 && h < 8) {
      const p = (h - 5) / 3;
      sat = 106 + Math.sin(p * Math.PI) * 16;
      hue = -4.5 * Math.sin(p * Math.PI);
      sepia = 5 + 8 * Math.sin(p * Math.PI);
      brightness = 96 + p * 8;
      contrast = 102;
    } else if (h >= 8 && h < 16) {
      const p = (h - 8) / 8;
      sat = 105 + Math.sin(p * Math.PI) * 5;
      brightness = 104;
      contrast = 101;
    } else if (h >= 16 && h < 19.5) {
      const p = (h - 16) / 3.5;
      sat = 110 + Math.sin(p * Math.PI) * 24;
      hue = -8 * Math.sin(p * Math.PI);
      sepia = 5 + 12 * Math.sin(p * Math.PI);
      brightness = 104 - p * 9;
      contrast = 102 + Math.sin(p * Math.PI) * 5;
    } else if (h >= 19.5 && h < 23.5) {
      const p = (h - 19.5) / 4;
      sat = 114 - p * 8;
      hue = 3.5 * p;
      sepia = 7 - p * 2.5;
      brightness = 95 - p * 7;
      contrast = 106;
    } else {
      const normH = h >= 23.5 ? h - 23.5 : h + 0.5;
      const p = normH / 5.5;
      sat = 98 + p * 8;
      hue = 3.5 * (1 - p);
      sepia = 5;
      brightness = 88 + p * 8;
      contrast = 104;
    }

    return `saturate(${sat}%) hue-rotate(${hue}deg) sepia(${sepia}%) brightness(${brightness}%) contrast(${contrast}%)`;
  };

  const dayNightFilter = getDayNightFilter(hour);

  // Sky atmosphere
  const getSkyStyle = () => {
    switch (phase) {
      case 'dawn':
        return {
          background:
            'linear-gradient(180deg, #FDBA74 0%, #FED7AA 35%, #FDE047 75%, #FEF3C7 100%)',
          lightsOpacity: 0.4,
          crowdOpacity: 0.85,
        };

      case 'noon':
        return {
          background:
            'linear-gradient(180deg, #7DD3FC 0%, #BAE6FD 45%, #E0F2FE 80%, #FEF9C3 100%)',
          lightsOpacity: 0.08,
          crowdOpacity: 0.82,
        };

      case 'sunset':
        return {
          background:
            'linear-gradient(180deg, #F97316 0%, #FB7185 35%, #F43F5E 65%, #FED7AA 100%)',
          lightsOpacity: 0.8,
          crowdOpacity: 0.95,
        };

      case 'night':
        return {
          background:
            'linear-gradient(180deg, #090D16 0%, #1E1B4B 45%, #312E81 80%, #4338CA 100%)',
          lightsOpacity: 1,
          crowdOpacity: 1,
        };

      default:
        return {
          background:
            'linear-gradient(180deg, #030712 0%, #0F172A 50%, #1E1B4B 100%)',
          lightsOpacity: 0.9,
          crowdOpacity: 0.78,
        };
    }
  };

  const sky = getSkyStyle();
  const visibleDevotees = VISIBLE_DEVOTEES[phase];

  // Celestial movement
  const sunVisible = hour >= 5 && hour <= 19;
  const sunProgress = sunVisible ? (hour - 5) / 14 : 0;

  const sunLeft = Math.max(6, Math.min(94, 8 + sunProgress * 84));
  const sunTop = 78 - Math.sin(sunProgress * Math.PI) * 64;

  const sunOpacity = sunVisible
    ? Math.min(1, Math.max(0, (hour - 5) / 0.8)) *
      Math.min(1, Math.max(0, (19 - hour) / 0.8))
    : 0;

  const moonVisible = hour >= 18 || hour <= 6;
  const moonProgress = hour >= 18 ? (hour - 18) / 12 : (hour + 6) / 12;

  const moonLeft = 10 + moonProgress * 80;
  const moonTop = 74 - Math.sin(moonProgress * Math.PI) * 54;

  const moonOpacity = moonVisible
    ? hour >= 18
      ? Math.min(1, Math.max(0, (hour - 18) / 0.8))
      : Math.min(1, Math.max(0, (6 - hour) / 0.8))
    : 0;

  // Time presets
  const PRESETS = [
    { key: 'dawn', hour: 6, label: t.dawn, Icon: Sunrise },
    { key: 'noon', hour: 12, label: t.noon, Icon: Sun },
    { key: 'sunset', hour: 17.5, label: t.sunset, Icon: Sunset },
    { key: 'night', hour: 20.5, label: t.night, Icon: Moon },
    { key: 'lateNight', hour: 1.5, label: t.lateNight, Icon: MoonStar },
  ] as const;

  const currentPhaseLabel = PRESETS.find((p) => p.key === phase)?.label;

  return (
    <section
      className="relative w-full h-[100svh] min-h-[600px] overflow-hidden bg-[#FBF9F5] select-none"
    >
      {/* FULL SCREEN SKY */}

      <div
        className="absolute inset-0 overflow-hidden"
        style={{
          background: sky.background,
          filter: dayNightFilter,
          transition: isLiveClock
            ? 'filter 1.5s ease, background 1.5s ease'
            : 'filter 0.15s ease, background 0.3s ease',
        }}
      >
        {/* Atmospheric glow */}

        <div
          className="absolute inset-0 pointer-events-none z-[1]"
          style={{
            background:
              hour >= 5 && hour < 16.5
                ? 'radial-gradient(ellipse at 50% 30%, rgba(254,240,138,0.2), transparent 70%)'
                : hour >= 16.5 && hour < 19.5
                ? 'radial-gradient(ellipse at 50% 35%, rgba(251,146,60,0.3), transparent 75%)'
                : 'radial-gradient(ellipse at 50% 40%, rgba(245,158,11,0.15), transparent 75%)',
            mixBlendMode: 'screen',
          }}
        />

        {/* HEADER */}
        <div className="absolute top-[14%] sm:top-[15%] md:top-[16%] inset-x-0 z-20 text-center px-4 sm:px-6 pointer-events-none transition-all duration-300">
          <h1
            className={`font-bengali-serif italic font-black text-3xl sm:text-5xl md:text-6xl lg:text-7xl xl:text-8xl tracking-wide uppercase px-4 leading-tight transition-colors duration-1000 ${
              phase === 'dawn' || phase === 'noon'
                ? 'text-[#C2183A]'
                : phase === 'sunset'
                ? 'text-white'
                : phase === 'night' || phase === 'lateNight'
                ? 'text-[#FF8C00]'
                : 'text-[#F5C542]'
            }`}
            style={{
              textShadow:
                phase === 'sunset'
                  ? '0 2px 12px rgba(0,0,0,0.25)'
                  : phase === 'night' || phase === 'lateNight'
                  ? '0 0 18px rgba(255,140,0,0.55), 0 2px 14px rgba(0,0,0,0.75)'
                  : '0 2px 8px rgba(255,255,255,0.35)',
            }}
          >
            {headline}
          </h1>

          <div className="inline-flex items-center gap-2 mt-3 px-5 py-1 rounded-full bg-white/30 sm:bg-white/40 backdrop-blur-xl border border-white/60 ring-1 ring-white/30 text-xs sm:text-sm md:text-base font-serif font-bold text-[#800020] shadow-[0_8px_25px_rgba(0,0,0,0.12)]">
            <Sparkles className="w-3.5 h-3.5 text-amber-600 shrink-0" />
            <span>{subBadge}</span>
          </div>
        </div>

        {/* TWINKLING STARS */}
        {moonVisible && (
          <div
            className="absolute inset-0 z-[2] pointer-events-none transition-opacity duration-1000"
            style={{ opacity: moonOpacity * 0.85 }}
          >
            <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
              {[
                [12, 15, 1.5],
                [24, 28, 1.2],
                [38, 12, 2],
                [52, 22, 1],
                [68, 16, 1.8],
                [82, 25, 1.4],
                [91, 14, 2.2],
                [18, 40, 1],
                [79, 38, 1.2],
                [45, 32, 1.5],
                [30, 8, 1.3],
                [60, 9, 1.6],
                [73, 43, 1.1],
                [8, 32, 1.4],
                [95, 35, 1.5],
              ].map(([x, y, r], i) => (
                <circle
                  key={i}
                  cx={`${x}%`}
                  cy={`${y}%`}
                  r={r}
                  fill="#FFFBEB"
                  className="star-twinkle"
                  style={{
                    animationDelay: `${(i * 0.47) % 4}s`,
                    animationDuration: `${2 + (i % 4) * 0.7}s`,
                    transformBox: 'fill-box',
                    transformOrigin: 'center',
                  }}
                />
              ))}
            </svg>
          </div>
        )}

        {/* SUN */}

        {sunVisible && (
          <div
            className={`absolute z-[3] -translate-x-1/2 -translate-y-1/2 pointer-events-none transition-all ${
              isLiveClock ? 'duration-1000' : 'duration-75'
            }`}
            style={{
              left: `${sunLeft}%`,
              top: `${sunTop}%`,
              opacity: sunOpacity,
            }}
          >
            <div className="w-56 h-56 sm:w-32 sm:h-32 rounded-full bg-amber-200/40 blur-4xl" />

            <div className="absolute inset-0 m-auto w-56 h-56 sm:w-32 sm:h-32 rounded-full bg-white/90 shadow-[0_0_50px_rgba(254,240,138,0.9)]" />
          </div>
        )}

        {/* MOON */}

        {moonVisible && (
          <div
            className={`absolute z-[3] -translate-x-1/2 -translate-y-1/2 pointer-events-none transition-all ${
              isLiveClock ? 'duration-1000' : 'duration-75'
            }`}
            style={{
              left: `${moonLeft}%`,
              top: `${moonTop}%`,
              opacity: moonOpacity,
            }}
          >
            <div className="w-56 h-56 sm:w-24 sm:h-24 rounded-full bg-amber-100/20 blur-3xl" />

            <div className="absolute inset-0 m-auto w-56 h-56 sm:w-24 sm:h-24 rounded-full bg-[#FEF3C7] shadow-[0_0_35px_rgba(254,243,199,0.7)]" />
          </div>
        )}

        {/* FLOATING CLOUDS */}

        <div className="absolute top-[18%] inset-x-0 h-40 z-[4] pointer-events-none opacity-50 overflow-hidden">
          <svg
            className="w-full h-full animate-cloud-drift"
            viewBox="0 0 1200 200"
            fill="none"
          >

            <path
              d="M150 90C170 50 240 50 270 80C300 70 340 90 350 120C360 150 310 170 270 170H130C80 170 70 130 100 100C120 80 140 100 150 90Z"
              fill={phase === 'sunset' ? '#FDBA74' : '#FFFFFF'}
              fillOpacity="0.6"
            />

            <path
              d="M750 60C780 30 840 30 870 55C900 45 940 60 950 90C960 120 920 140 880 140H740C700 140 680 110 710 80C730 60 740 70 750 60Z"
              fill={phase === 'sunset' ? '#FDA4AF' : '#FFFFFF'}
              fillOpacity="0.5"
            />
          </svg>
        </div>

        {/* BENGAL LANDSCAPE */}

        <div className="absolute bottom-[12%] inset-x-0 h-[30%] z-[5] pointer-events-none">
          <svg
            className="w-full h-full"
            preserveAspectRatio="none"
            viewBox="0 0 1440 260"
            fill="none"
          >
            <g
              fill={phase === 'night' || phase === 'lateNight' ? '#111827' : phase === 'sunset' ? '#7C2D3A' : '#355B61'}
              opacity={phase === 'noon' ? 0.42 : 0.68}
            >
              <path d="M0 160V126h35v34h14V108h32v52h17V121h28v39h18V96h36v64h18v-40h33v40h20V110h29v50h17V88h39v72h19v-28h31v28h18V105h43v55h19v-35h34v35h20V91h33v69h21v-39h31v39h19V112h42v48h19v-54h35v54h18v-27h32v27h22V99h40v61h20v-42h35v42h19V114h30v46h20V91h39v69h20v-29h35v29h17V107h36v53h24v-34h35v34h16v-45h43v45h20v-30h34v30h18V117h36v43h20v-26h31v26h22v-39h39v39h18v-28h40v28h18V107h35v53h28v100H0Z" />
            </g>
            <g
              fill={phase === 'sunset' || phase === 'night' || phase === 'lateNight' ? '#FDE68A' : '#FEF3C7'}
              opacity={phase === 'noon' ? 0.38 : 0.72}
            >
              <path d="M27 132h4v5h-4zm26-17h5v6h-5zm29 14h4v5h-4zm49-8h4v5h-4zm35-17h5v6h-5zm35 21h4v5h-4zm45-9h5v6h-5zm49-1h4v5h-4zm45-18h5v6h-5zm38 25h4v5h-4zm46-12h5v6h-5zm35 14h4v5h-4zm48-27h5v6h-5zm38 22h4v5h-4zm45-7h5v6h-5zm46 14h4v5h-4zm45-33h5v6h-5zm37 23h4v5h-4zm51-8h5v6h-5zm41 18h4v5h-4zm44-26h5v6h-5zm43 20h4v5h-4zm45-10h5v6h-5zm43 17h4v5h-4zm48-30h5v6h-5zm40 23h4v5h-4zm43-12h5v6h-5zm42 18h4v5h-4z" />
            </g>

            {/* Green riverbank */}

            <path
              d="M0 160 Q240 140 480 155 T960 148 T1440 158 V260 H0Z"
              fill={phase === 'night' || phase === 'lateNight' ? '#090D16' : '#14532D'}
              fillOpacity="0.9"
            />

            {/* River */}

            <path
              d="M0 185 Q360 175 720 188 T1440 180 V260 H0Z"
              fill={phase === 'night' || phase === 'lateNight' ? '#0F172A' : phase === 'sunset' ? '#EA580C' : '#38BDF8'}
              fillOpacity="0.55"
            />

            {/* Traditional Bengali houses */}

            <g transform="translate(900,100) scale(0.85)">
              <rect x="0" y="45" width="80" height="40" fill="#991B1B" />
              <polygon points="-5,45 40,20 85,45" fill="#C2410C" />
              <rect x="25" y="55" width="14" height="16" fill="#FEF08A" />

              <rect x="95" y="50" width="70" height="35" fill="#78350F" />
              <polygon points="90,50 130,30 170,50" fill="#B45309" />
              <rect x="120" y="58" width="12" height="14" fill="#FEF08A" />
            </g>
          </svg>
        </div>

        {/* KASH PHUL */}

        <div className="absolute bottom-[14%] left-2 sm:left-12 z-[8] pointer-events-none">
          <svg
            className="w-32 sm:w-56 h-32 sm:h-44 animate-kash-sway"
            viewBox="0 0 200 120"
            fill="none"
          >
            <path d="M20 120 Q30 60 50 10" stroke="#4ADE80" strokeWidth="2" />
            <path d="M40 120 Q55 50 85 20" stroke="#86EFAC" strokeWidth="2" />
            <path d="M10 120 Q15 70 30 30" stroke="#4ADE80" strokeWidth="1.5" />

            <path d="M45 25 C40 15 60 5 55 0 C50 10 35 20 45 25Z" fill="white" />
            <path d="M78 35 C75 22 95 12 90 8 C82 20 70 30 78 35Z" fill="white" />
            <path d="M28 42 C24 30 42 22 38 18 C30 28 22 36 28 42Z" fill="white" />
          </svg>
        </div>

        {/* DURGA IDOL AND ALTAR (Zero Gap to Pedestal and Ground) */}
        <div className="absolute inset-x-0 bottom-0 flex justify-center items-end pointer-events-none">
          <div className="relative flex flex-col items-center w-full">

            {/* Divine aura */}
            <div
              className="absolute bottom-[20%] w-[70vw] max-w-[620px] aspect-square rounded-full blur-3xl transition-all duration-1000"
              style={{
                background:
                  phase === 'night' || phase === 'lateNight'
                    ? 'radial-gradient(circle, rgba(245,158,11,0.55), rgba(220,38,38,0.2) 55%, transparent 75%)'
                    : phase === 'sunset'
                    ? 'radial-gradient(circle, rgba(251,146,60,0.5), rgba(244,63,94,0.2) 55%, transparent 75%)'
                    : 'radial-gradient(circle, rgba(254,240,138,0.4), transparent 75%)',
              }}
            />

            {/* Idol image */}
            <div className="relative flex justify-center w-full">
              {!imageLoaded && !imageError && (
                <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 z-40">
                  <LoaderCircle className="w-8 h-8 text-amber-500 animate-spin" />
                  <span className="text-xs tracking-[0.25em] uppercase text-amber-100">
                    Preparing the sacred space
                  </span>
                </div>
              )}

              {imageError ? (
                <div className="flex items-center justify-center min-h-[260px] text-amber-100 text-sm">
                  Durga idol image could not be loaded.
                </div>
              ) : (
                <img
                  src="/assets/aistudio/durga_idol_transparent.png"
                  alt="Shree Shree Durga Idol with Chalchitra"
                  onLoad={() => setImageLoaded(true)}
                  onError={() => setImageError(true)}
                  className={`relative z-20 w-auto max-w-[94vw] h-[58svh] sm:h-[62svh] md:h-[65svh] max-h-[580px] min-h-[300px] object-contain drop-shadow-[0_20px_35px_rgba(0,0,0,0.55)] transition-all duration-1000 ${
                    imageLoaded ? 'opacity-100' : 'opacity-0'
                  }`}
                  referrerPolicy="no-referrer"
                />
              )}
            </div>

            {/* Terracotta pedestal - connects flush against idol base with ZERO gap */}
            <div className="relative z-30 w-[84%] sm:w-[60%] max-w-[560px] -mt-1 sm:-mt-2 bg-gradient-to-r from-[#78350F] via-[#991B1B] to-[#78350F] border-t-2 border-[#EAB308] shadow-2xl rounded-t-sm py-2 sm:py-2.5 px-4 flex items-center justify-between">
              {/* Diya lights resting directly on the pedestal ledge */}
              <div
                className="absolute -top-3.5 inset-x-0 flex justify-center gap-3 sm:gap-6 z-35 pointer-events-none"
                style={{ opacity: sky.lightsOpacity }}
              >
                {Array.from({ length: 9 }).map((_, i) => (
                  <div key={i} className="flex flex-col items-center">
                    <div
                      className="w-2.5 h-2.5 rounded-full bg-amber-300 animate-diya-glow shadow-[0_0_12px_#F59E0B]"
                      style={{ animationDelay: `${i * 0.22}s` }}
                    />
                    <div className="w-3.5 h-1 bg-[#B45309] rounded-b-sm border-t border-amber-400/60" />
                  </div>
                ))}
              </div>

              <div className="flex gap-1.5 items-center">
                <div className="w-3 h-3 rounded-full bg-amber-400 shadow-[0_0_12px_#F59E0B]" />
                <div className="w-2 h-2 rounded-full bg-orange-500" />
              </div>

              <span className="font-bengali-serif text-[11px] sm:text-sm font-bold text-[#FEF3C7] tracking-wider text-center drop-shadow-sm">
                {altarBadge}
              </span>

              <div className="flex gap-1.5 items-center">
                <div className="w-2 h-2 rounded-full bg-orange-500" />
                <div className="w-3 h-3 rounded-full bg-amber-400 shadow-[0_0_12px_#F59E0B]" />
              </div>
            </div>
          </div>
        </div>

        {/* Time-aware devotee illustrations */}
        <div
          id="devotee-crowd"
          className="absolute bottom-0 inset-x-0 h-40 sm:h-48 pointer-events-none overflow-hidden"
          data-time-phase={phase}
        >
          {DEVOTEES.map((devotee, index) => {
            const isPresent = visibleDevotees.includes(index);

            return (
              <svg
                key={index}
                aria-hidden="true"
                viewBox="0 0 56 140"
                className={`devotee-figure ${devotee.depth === 'background' ? 'devotee-figure-back' : 'devotee-figure-front'} ${devotee.pose === 'dance' ? 'devotee-dancer' : ''} ${devotee.pose === 'drum' ? 'devotee-drummer' : ''}`}
                data-mobile-hidden={devotee.mobileHidden}
                style={{
                  left: `${devotee.x}%`,
                  height: `${devotee.height}px`,
                  animationDelay: `${(index % 6) * -0.55}s`,
                  opacity: isPresent
                    ? sky.crowdOpacity * (devotee.depth === 'background' ? 0.62 : 0.9)
                    : 0,
                }}
              >
                <ellipse cx="28" cy="134" rx="14" ry="3" fill="#171717" opacity="0.22" />
                <path
                  d="M22 83 L20 126 Q22 130 26 127 L29 91 M31 88 L34 126 Q37 129 40 126 L37 82"
                  fill="none"
                  stroke={devotee.outfit}
                  strokeWidth="7"
                  strokeLinecap="round"
                />
                <path d="M17 43 Q28 37 39 43 L43 84 Q28 91 13 84 Z" fill={devotee.outfit} />
                <path
                  d="M17 45 Q28 55 39 44 L37 86 L28 101 L14 88 Z"
                  fill={devotee.accent}
                  opacity="0.88"
                />
                {devotee.pose === 'prayer' ? (
                  <>
                    <path d="M19 48 Q22 57 27 61 M37 48 Q34 57 29 61" fill="none" stroke={devotee.skin} strokeWidth="5" strokeLinecap="round" />
                    <path d="M27 60 L28 55 L30 60" fill="none" stroke="#E8DCC8" strokeWidth="2" strokeLinecap="round" />
                  </>
                ) : devotee.pose === 'aarti' ? (
                  <>
                    <path d="M19 48 Q28 54 39 58 M37 48 Q43 54 46 58" fill="none" stroke={devotee.skin} strokeWidth="5" strokeLinecap="round" />
                    <ellipse cx="45" cy="62" rx="9" ry="2.5" fill="#D6A442" />
                    <path className="aarti-flame" d="M44 58 Q40 52 45 49 Q50 54 46 58 Z" fill="#FFC94A" />
                  </>
                ) : devotee.pose === 'dance' ? (
                  <>
                    <path d="M19 48 Q11 40 10 29 M37 48 Q44 55 48 62" fill="none" stroke={devotee.skin} strokeWidth="5" strokeLinecap="round" />
                    <ellipse cx="9" cy="27" rx="3" ry="2" fill={devotee.skin} />
                  </>
                ) : devotee.pose === 'drum' ? (
                  <>
                    <path d="M19 48 L11 62 M37 48 L44 61" fill="none" stroke={devotee.skin} strokeWidth="5" strokeLinecap="round" />
                    <path d="M12 61 L44 72 L40 84 L9 73 Z" fill="#9A4D25" stroke="#D6A442" strokeWidth="2" />
                    <path d="M13 68 L41 78 M15 63 L39 83" stroke="#F0D8A5" strokeWidth="1.5" opacity="0.8" />
                  </>
                ) : (
                  <path d="M19 48 Q16 60 17 70 M37 48 Q40 60 39 70" fill="none" stroke={devotee.skin} strokeWidth="5" strokeLinecap="round" />
                )}
                <path d="M19 41 Q17 31 21 24 Q28 17 35 24 Q40 30 37 42 Q29 47 19 41" fill={devotee.skin} />
                <path d="M20 30 Q19 21 27 19 Q36 19 38 28 Q31 24 20 30" fill="#29211D" />
              </svg>
            );
          })}

          <div className="absolute bottom-0 inset-x-0 z-10 h-7 bg-gradient-to-t from-black/40 via-black/15 to-transparent" />
        </div>

        {/* SUBTLE INITIAL PROMPT ON LOAD (When page loads, only scene is visible) */}
        <div
          className={`absolute bottom-16 sm:bottom-20 inset-x-0 z-30 flex flex-col items-center justify-center pointer-events-none transition-all duration-500 ${
            hasScrolled ? 'opacity-0 translate-y-3 pointer-events-none' : 'opacity-90 translate-y-0'
          }`}
        >
          <span className="text-[10px] sm:text-xs font-serif font-bold text-[#FEF3C7] tracking-widest uppercase drop-shadow-[0_2px_4px_rgba(0,0,0,0.85)] flex items-center gap-1.5 bg-black/40 backdrop-blur-md px-3.5 py-1 rounded-full border border-white/20">
            <span>
              {language === 'bn'
                ? 'সময় ও আচার অন্বেষণে নিচে স্ক্রোল করুন'
                : language === 'hi'
                ? 'समय व अनुष्ठान देखने के लिए नीचे स्क्रॉल करें'
                : 'Scroll down to explore time & rituals'}
            </span>
            <ChevronDown className="w-3.5 h-3.5 animate-bounce" />
          </span>
        </div>

      </div>

      {/* Compact time control stays at the bottom of the hero. */}
      <div
        className="absolute bottom-3 sm:bottom-5 inset-x-2 sm:inset-x-6 z-40 mx-auto w-auto max-w-[760px] px-2 sm:px-6 py-1.5 sm:py-2 rounded-2xl bg-white/90 sm:bg-white/95 backdrop-blur-xl border border-white/80 shadow-[0_4px_14px_rgba(0,0,0,0.12)]"
      >
        <div className="mx-auto flex w-full flex-nowrap items-center justify-between gap-1 sm:gap-3">

          {/* Clock */}
          <div className="flex items-center gap-1 sm:gap-2 bg-white/90 rounded-full border border-[#DDD6C8] px-2 sm:px-3 py-0.5 shrink-0 shadow-xs">
            {phase === 'night' || phase === 'lateNight' ? (
              <Moon className="w-4 h-4 text-amber-600" />
            ) : (
              <Sun className="w-4 h-4 text-amber-500" />
            )}

            <span className="font-mono text-[10px] sm:text-xs font-semibold text-stone-800 tabular-nums">
              {formatTime(hour)}
            </span>

            <span className="hidden sm:inline text-xs font-semibold text-[#8B0000]">
              {currentPhaseLabel}
            </span>

            <button
              onClick={() => {
                const next = !isLiveClock;
                setIsLiveClock(next);
                if (next) setHour(getNowHour());
              }}
              title={isLiveClock ? t.localTimeActive : t.localTimeSync}
              aria-label={isLiveClock ? t.localTimeActive : t.localTimeSync}
              aria-pressed={isLiveClock}
              className={`flex items-center gap-1 border-l pl-1.5 sm:pl-2 text-xs font-medium ${
                isLiveClock ? 'text-amber-800' : 'text-stone-500'
              }`}
            >
              <Clock className="w-3 h-3" />
              {isLiveClock && (
                <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
              )}
            </button>
          </div>

          {/* Presets */}
          <div className="flex items-center gap-0 sm:gap-1 bg-white/90 border border-[#DDD6C8] rounded-full p-0.5 shrink-0 shadow-xs">
            {PRESETS.map(({ key, hour: h, label, Icon }) => (
              <button
                key={key}
                onClick={() => {
                  setIsLiveClock(false);
                  setHour(h);
                }}
                title={label}
                aria-label={label}
                className={`flex h-6 w-6 sm:h-6 sm:w-auto items-center justify-center gap-1 rounded-full px-1 sm:px-2 py-0 text-xs font-semibold transition-colors ${
                  phase === key
                    ? 'bg-[#8B0000] text-white shadow-xs'
                    : 'text-stone-600 hover:bg-[#F4EFE6]'
                }`}
              >
                <Icon className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                <span className="hidden lg:inline">{label}</span>
              </button>
            ))}
          </div>

        </div>

        <div className="mt-2 flex items-center gap-2 sm:gap-3 px-1">
          <Sun className="h-3.5 w-3.5 shrink-0 text-amber-500" aria-hidden="true" />
          <div className="min-w-0 flex-1">
            <label htmlFor="pandal-time-slider" className="sr-only">
              {language === 'bn'
                ? 'সূর্য ও চাঁদের চলাচল দেখতে সময় সরান'
                : language === 'hi'
                ? 'सूर्य और चंद्रमा की चाल देखने के लिए समय बदलें'
                : 'Scrub time to see the sun and moon move'}
            </label>
            <input
              id="pandal-time-slider"
              type="range"
              min="0"
              max="24"
              step="0.05"
              value={hour}
              onChange={(event) => {
                setIsLiveClock(false);
                setHour(Number(event.target.value));
              }}
              aria-valuetext={formatTime(hour)}
              className="h-1.5 w-full cursor-pointer appearance-none rounded-full accent-[#8B0000]"
              style={{
                background:
                  'linear-gradient(90deg, #0f172a 0%, #fb923c 25%, #fef08a 50%, #fb923c 75%, #0f172a 100%)',
              }}
            />
            <div className="mt-0.5 flex justify-between text-[8px] sm:text-[9px] font-medium text-stone-500">
              <span>12 AM</span>
              <span>6 AM</span>
              <span>12 PM</span>
              <span>6 PM</span>
              <span>12 AM</span>
            </div>
          </div>
          <MoonStar className="h-3.5 w-3.5 shrink-0 text-indigo-900" aria-hidden="true" />
        </div>
      </div>
    </section>
  );
};

export default LivingPandalHero;
