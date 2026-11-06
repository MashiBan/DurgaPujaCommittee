/**
 * Cultural Translation & Spell-Check Engine for Agamani Puja Application
 * Takes English input, applies cultural spell-checking/polish, and generates
 * authentic Bengali (বাংলা) and Hindi (हिंदी) translations.
 */

// Dictionary of canonical festival rituals, titles, and roles
const FESTIVAL_DICTIONARY: Record<string, { bn: string; hi: string }> = {
  // Common Rituals
  'morning puja': { bn: 'সকালবেলার পুজো', hi: 'प्रातःकालीन पूजा' },
  'pushpanjali': { bn: 'ভক্তিপূর্ণ পুষ্পাঞ্জলি', hi: 'पुष्पांजलि अनुष्ठান' },
  'morning pushpanjali': { bn: 'প্রভাতী পুষ্পাঞ্জলি', hi: 'प्रातः पुष्पांजलि' },
  'sandhya aarti': { bn: 'সন্ধ্যা আরতি ও ধুনুচি নাচ', hi: 'संध्या आरती एवं धुनुची नृत्य' },
  'aarti': { bn: 'আরতি', hi: 'आरती' },
  'evening aarti': { bn: 'সান্ধ্য মহা আরতি', hi: 'संध्या महा आरती' },
  'bhog prasad distribution': { bn: 'ভোগ প্রসাদ বিতরণ', hi: 'भोग प्रसाद वितरण' },
  'bhog distribution': { bn: 'মহাপ্রসাদ ও অন্নকূট বিতরণ', hi: 'भोग प्रसाद वितरण' },
  'prasad distribution': { bn: 'প্রসাদ বিতরণ', hi: 'प्रसाद वितरण' },
  'prasad bitoron': { bn: 'প্রসাদ বিতরণ', hi: 'प्रसाद वितरण' },
  'cultural programme': { bn: 'মনোজ্ঞ সাংস্কৃতিক অনুষ্ঠান', hi: 'भव्य सांस्कृतिक कार्यक्रम' },
  'cultural night': { bn: 'সান্ধ্য সাংস্কৃতিক অনুষ্ঠান', hi: 'सांस्कृतिक संध्या' },
  'dhunuchi dance': { bn: 'ঐতিহ্যবাহী ধুনুচি নাচ প্রতিযোগিতা', hi: 'पारंपरिक धुनुची नृत्य' },
  'dhaak competition': { bn: 'ঢাকের বোল প্রতিযোগিতা', hi: 'ढाक वादन प्रतियोगिता' },
  'chandi path': { bn: 'পবিত্র চণ্ডীপাঠ ও আগমনী গান', hi: 'पवित्र चंडीपाठ व भजन' },
  'bodhon': { bn: 'মায়ের অকাল বোধন ও আমন্ত্রণ', hi: 'माँ का अकाल बोधन व आमंत्रण' },
  'nabapatrika prabesh': { bn: 'নবপত্রিকা প্রবেশ ও স্নান', hi: 'नवपत्रिका प्रवेश व स्नान' },
  'sandhi puja': { bn: '১০৮ পদ্ম ও প্রদীপে মহাসন্ধিপূজা', hi: '१०८ दीपों से महासंधि पूजा' },
  'balidan': { bn: 'পবিত্র বলিদান আচার', hi: 'पवित्र बलिदान अनुष्ठान' },
  'sindoor khela': { bn: 'মায়েদের সিঁদুর খেলা ও শুভ বিজয়া', hi: 'सिन्दूर खेला व विजया उत्सव' },
  'bisarjan': { bn: 'গঙ্গাবক্ষে প্রতিমা বিসর্জন', hi: 'गंगा में पावन प्रतिमा विसर्जन' },
  'immersion': { bn: 'পবিত্র প্রতিমা বিসর্জন', hi: 'प्रतिमा विसर्जन' },
  'inauguration': { bn: 'মণ্ডপ ও প্রতিমার আনুষ্ঠানিক উদ্বোধন', hi: 'मंडप व प्रतिमा का औपचारिक उद्घाटन' },
  'lamp lighting': { bn: 'মঙ্গল প্রদীপ প্রজ্জ্বলন', hi: 'मंगल दीप प्रज्वलन' },
  'special aarti': { bn: 'বিশেষ আরতি ও অর্চনা', hi: 'विशेष आरती व अर्चना' },
  'narayan puja': { bn: 'শ্রীশ্রী সত্যনারায়ণ পূজা', hi: 'श्री श्री सत्यनारायण पूजा' },

  // Committee Roles
  'president': { bn: 'সভাপতি', hi: 'अध्यक्ष' },
  'vice president': { bn: 'সহ-সভাপতি', hi: 'उपाध्यक्ष' },
  'secretary': { bn: 'সাধারণ সম্পাদক', hi: 'महासचिव' },
  'joint secretary': { bn: 'যুগ্ম সম্পাদক', hi: 'संयुक्त सचिव' },
  'treasurer': { bn: 'কোষাধ্যক্ষ', hi: 'कोषाध्यक्ष' },
  'committee member': { bn: 'কমিটি সদস্য', hi: 'समिति सदस्य' },
  'member': { bn: 'সম্মানিত সদস্য', hi: 'मानद सदस्य' },
  'patron': { bn: 'প্রধান পৃষ্ঠপোষক', hi: 'मुख्य संरक्षक' },
  'chief patron': { bn: 'মুখ্য পৃষ্ঠপোষক', hi: 'मुख्य संरक्षक' },
  'advisor': { bn: 'উপদেষ্টা', hi: 'सलाहकार' },
  'chief advisor': { bn: 'প্রধান উপদেষ্টা', hi: 'मुख्य सलाहकार' },
  'cultural secretary': { bn: 'সাংস্কৃতিক সম্পাদক', hi: 'सांस्कृतिक सचिव' },
  'volunteer': { bn: 'নিষ্ঠাবান স্বেচ্ছাসেবক', hi: 'समर्पित स्वयंसेवक' },
  'head artisan': { bn: 'প্রধান প্রতিমা শিল্পী', hi: 'मुख्य मूर्तिकार' },
  'master sculptor': { bn: 'মৃৎশিল্পী ও ভাস্কর', hi: 'मूर्तिकार व शिल्पकार' },
  'lighting designer': { bn: 'আলোকসজ্জা রূপকার (চন্দননগর)', hi: 'प्रकाश व्यवस्था सज्जाकार' },
  'pandal architect': { bn: 'মণ্ডপ স্থপতি ও শিল্পী', hi: 'मंडप वास्तुकार एवं कलाकार' },

  // Photo & Gallery Categories
  'culture': { bn: 'সংস্কৃতি ও ঐতিহ্য', hi: 'संस्कृति एवं परंपरा' },
  'rituals': { bn: 'পুণ্য আচার ও পূজা', hi: 'धार्मिक अनुष्ठान' },
  'pandal': { bn: 'মণ্ডপ শিল্পকলা', hi: 'मंडप सज्जा' },
  'art': { bn: 'প্রতিমা ও অলংকরণ', hi: 'प्रतिमा व कला' },
};

// Common spell check dictionary for festival entries
const SPELL_FIXES: [RegExp, string][] = [
  [/\banjali\b/gi, 'Pushpanjali'],
  [/\banjaly\b/gi, 'Pushpanjali'],
  [/\barti\b/gi, 'Aarti'],
  [/\baarthi\b/gi, 'Aarti'],
  [/\bdurgotsav\b/gi, 'Durgotsav'],
  [/\bdurgotsob\b/gi, 'Durgotsav'],
  [/\bpanjika\b/gi, 'Panjika'],
  [/\bdhaak\b/gi, 'Dhaak'],
  [/\bdhak\b/gi, 'Dhaak'],
  [/\bdhunuchi\b/gi, 'Dhunuchi'],
  [/\bsindoor\b/gi, 'Sindoor'],
  [/\bsindur\b/gi, 'Sindoor'],
  [/\balpana\b/gi, 'Alpona'],
  [/\balpona\b/gi, 'Alpona'],
  [/\bbhog\b/gi, 'Bhog'],
  [/\bprosad\b/gi, 'Prasad'],
  [/\bpashad\b/gi, 'Prasad'],
  [/\bvisarjan\b/gi, 'Visarjan'],
  [/\bbisarjan\b/gi, 'Visarjan'],
  [/\bmuradnagar\b/gi, 'Muradnagar'],
  [/\bghaziabad\b/gi, 'Ghaziabad'],
  [/\bkolkata\b/gi, 'Kolkata'],
  [/\bshashthi\b/gi, 'Maha Shashthi'],
  [/\bsaptami\b/gi, 'Maha Saptami'],
  [/\bashtami\b/gi, 'Maha Ashtami'],
  [/\bnavami\b/gi, 'Maha Navami'],
  [/\bdashami\b/gi, 'Bijoya Dashami'],
  [/\bsecretery\b/gi, 'Secretary'],
  [/\bpresidant\b/gi, 'President'],
  [/\bprograme\b/gi, 'Programme'],
  [/\bprogram\b/gi, 'Programme'],
  [/\bcomittee\b/gi, 'Committee'],
  [/\bcommitee\b/gi, 'Committee'],
];

/**
 * Polish and auto-correct English input text.
 */
export function spellCheckEnglish(text: string): string {
  if (!text) return '';
  let cleaned = text.trim();

  // Fix spacing around punctuation
  cleaned = cleaned.replace(/\s+([.,;:!?])/g, '$1');
  cleaned = cleaned.replace(/([.,;:!?])(?=[a-zA-Z])/g, '$1 ');
  cleaned = cleaned.replace(/\s{2,}/g, ' ');

  // Apply cultural spell checks
  for (const [regex, replacement] of SPELL_FIXES) {
    cleaned = cleaned.replace(regex, replacement);
  }

  // Capitalize first letter of each sentence
  cleaned = cleaned.replace(/(^\s*\w|[.!?]\s*\w)/g, (c) => c.toUpperCase());

  return cleaned;
}

/**
 * Convert time string into Bengali digits & period
 * e.g. "6:30 PM" -> "সন্ধ্যা ৬:৩০"
 */
export function translateTimeToBengali(timeStr: string): string {
  if (!timeStr) return '';
  const bnDigits: Record<string, string> = {
    '0': '০', '1': '১', '2': '২', '3': '৩', '4': '৪',
    '5': '৫', '6': '৬', '7': '৭', '8': '৮', '9': '৯',
  };

  const periodMatch = timeStr.match(/(AM|PM|am|pm)/i);
  let prefix = '';
  if (periodMatch) {
    const isPm = periodMatch[0].toUpperCase() === 'PM';
    const hourNum = parseInt(timeStr, 10) || 0;
    if (isPm) {
      prefix = hourNum >= 1 && hourNum <= 3 ? 'দুপুর ' : hourNum >= 4 && hourNum <= 7 ? 'সন্ধ্যা ' : 'রাত ';
    } else {
      prefix = hourNum >= 4 && hourNum <= 11 ? 'সকাল ' : 'ভোর ';
    }
  }

  const numericPart = timeStr.replace(/(AM|PM|am|pm)/gi, '').trim();
  const bnNumeric = numericPart.replace(/[0-9]/g, (d) => bnDigits[d] || d);
  return `${prefix}${bnNumeric}`.trim();
}

/**
 * Convert time string into Hindi digits & period
 * e.g. "6:30 PM" -> "सायं ६:३०"
 */
export function translateTimeToHindi(timeStr: string): string {
  if (!timeStr) return '';
  const hiDigits: Record<string, string> = {
    '0': '०', '1': '१', '2': '२', '3': '३', '4': '४',
    '5': '५', '6': '६', '7': '७', '8': '८', '9': '९',
  };

  const periodMatch = timeStr.match(/(AM|PM|am|pm)/i);
  let prefix = '';
  if (periodMatch) {
    const isPm = periodMatch[0].toUpperCase() === 'PM';
    prefix = isPm ? 'सायं ' : 'प्रातः ';
  }

  const numericPart = timeStr.replace(/(AM|PM|am|pm)/gi, '').trim();
  const hiNumeric = numericPart.replace(/[0-9]/g, (d) => hiDigits[d] || d);
  return `${prefix}${hiNumeric}`.trim();
}

/**
 * Offline rule-based transliterator & dictionary translator for English to Bengali.
 */
export function translateToBengali(text: string): string {
  if (!text) return '';
  const cleaned = text.trim();
  const lower = cleaned.toLowerCase();

  // Exact dictionary match
  if (FESTIVAL_DICTIONARY[lower]?.bn) {
    return FESTIVAL_DICTIONARY[lower].bn;
  }

  // Check substring replacements for multi-word phrases
  let translated = cleaned;
  for (const [enKey, val] of Object.entries(FESTIVAL_DICTIONARY)) {
    const regex = new RegExp(`\\b${enKey}\\b`, 'gi');
    if (regex.test(translated)) {
      translated = translated.replace(regex, val.bn);
    }
  }

  // If translation happened via dictionary
  if (translated !== cleaned) {
    return translated;
  }

  // General vocabulary mapping
  const commonWords: Record<string, string> = {
    'puja': 'পূজা',
    'pandal': 'মণ্ডপ',
    'durgotsav': 'দুর্গোৎসব',
    'festival': 'মহোৎসব',
    'committee': 'কমিটি',
    'shree': 'শ্রীশ্রী',
    'sri': 'শ্রী',
    'celebration': 'উৎসব',
    'welcomes': 'স্বাগত জানায়',
    'welcome': 'স্বাগতম',
    'all': 'সকলকে',
    'devotees': 'ভক্তবৃন্দকে',
    'auspicious': 'পুণ্যময়',
    'sacred': 'পবিত্র',
    'annual': 'বার্ষিক',
    'autumn': 'শরতের',
    'evening': 'সন্ধ্যা',
    'morning': 'সকাল',
    'night': 'রাত্রি',
    'day': 'দিন',
    'dates': 'তারিখ',
    'timings': 'সময়সূচি',
    'inauguration': 'উদ্বোধন',
    'guest': 'অতিথি',
    'chief': 'প্রধান',
    'honour': 'সম্মানীয়',
    'residence': 'বাসস্থান',
    'estate': 'এস্টেট',
    'club': 'ক্লাব',
  };

  for (const [en, bn] of Object.entries(commonWords)) {
    const regex = new RegExp(`\\b${en}\\b`, 'gi');
    translated = translated.replace(regex, bn);
  }

  return translated;
}

/**
 * Offline rule-based transliterator & dictionary translator for English to Hindi.
 */
export function translateToHindi(text: string): string {
  if (!text) return '';
  const cleaned = text.trim();
  const lower = cleaned.toLowerCase();

  // Exact dictionary match
  if (FESTIVAL_DICTIONARY[lower]?.hi) {
    return FESTIVAL_DICTIONARY[lower].hi;
  }

  // Check substring replacements for multi-word phrases
  let translated = cleaned;
  for (const [enKey, val] of Object.entries(FESTIVAL_DICTIONARY)) {
    const regex = new RegExp(`\\b${enKey}\\b`, 'gi');
    if (regex.test(translated)) {
      translated = translated.replace(regex, val.hi);
    }
  }

  // If translation happened via dictionary
  if (translated !== cleaned) {
    return translated;
  }

  // General vocabulary mapping
  const commonWords: Record<string, string> = {
    'puja': 'पूजा',
    'pandal': 'मंडप',
    'durgotsav': 'दुर्गोत्सव',
    'festival': 'महोत्सव',
    'committee': 'समिति',
    'shree': 'श्री श्री',
    'sri': 'श्री',
    'celebration': 'उत्सव',
    'welcomes': 'हार्दिक स्वागत करता है',
    'welcome': 'स्वागत',
    'all': 'समस्त',
    'devotees': 'भक्तजनों का',
    'auspicious': 'पावन',
    'sacred': 'पवित्र',
    'annual': 'वार्षिक',
    'autumn': 'शारदीय',
    'evening': 'सायं',
    'morning': 'प्रातः',
    'night': 'रात्रि',
    'day': 'दिवस',
    'dates': 'तिथियाँ',
    'timings': 'समय',
    'inauguration': 'उद्घाटन',
    'guest': 'अतिथि',
    'chief': 'मुख्य',
    'honour': 'सम्मानित',
    'residence': 'निवास',
    'estate': 'एस्टेट',
    'club': 'क्लब',
  };

  for (const [en, hi] of Object.entries(commonWords)) {
    const regex = new RegExp(`\\b${en}\\b`, 'gi');
    translated = translated.replace(regex, hi);
  }

  return translated;
}

/**
 * Asynchronous translator that uses free web translation API with instant offline fallback.
 */
export async function translateTextAsync(
  text: string,
  targetLang: 'bn' | 'hi'
): Promise<string> {
  if (!text || !text.trim()) return '';

  const polished = spellCheckEnglish(text);

  // Try MyMemory public translation API with timeout
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 2000);

    const langPair = targetLang === 'bn' ? 'en|bn' : 'en|hi';
    const res = await fetch(
      `https://api.mymemory.translated.net/get?q=${encodeURIComponent(polished)}&langpair=${langPair}`,
      { signal: controller.signal }
    );
    clearTimeout(timeout);

    if (res.ok) {
      const data = await res.json();
      if (data?.responseData?.translatedText && !data.responseData.translatedText.includes('MYMEMORY WARNING')) {
        return data.responseData.translatedText.trim();
      }
    }
  } catch {
    // Graceful fallback to offline dictionary
  }

  return targetLang === 'bn' ? translateToBengali(polished) : translateToHindi(polished);
}

/**
 * Universal auto-synthesizer: Takes English input, spell-checks it,
 * and generates both Bengali and Hindi counterparts simultaneously.
 */
export async function autoSynthesizeMultilingual(englishInput: string): Promise<{
  english: string;
  bengali: string;
  hindi: string;
}> {
  const polishedEnglish = spellCheckEnglish(englishInput);
  if (!polishedEnglish) {
    return { english: '', bengali: '', hindi: '' };
  }

  const [bengali, hindi] = await Promise.all([
    translateTextAsync(polishedEnglish, 'bn'),
    translateTextAsync(polishedEnglish, 'hi'),
  ]);

  return {
    english: polishedEnglish,
    bengali: bengali || translateToBengali(polishedEnglish),
    hindi: hindi || translateToHindi(polishedEnglish),
  };
}
