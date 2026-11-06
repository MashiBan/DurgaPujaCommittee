export type Language = 'bn' | 'en' | 'hi';

export type TimePhase = 'dawn' | 'noon' | 'sunset' | 'night' | 'lateNight';

export interface Ritual {
  id: string;
  time: string;
  titleBengali: string;
  titleEnglish: string;
  titleHindi: string;
  note?: string;
}

export interface ScheduleDay {
  id: string;
  dayNumber: number;
  dayBengaliNum: string;
  titleBengali: string;
  titleEnglish: string;
  titleHindi: string;
  subtitleBengali: string;
  subtitleEnglish: string;
  subtitleHindi: string;
  date: string;
  rituals: Ritual[];
}

export interface StoryArticle {
  id: string;
  titleBengali: string;
  titleEnglish: string;
  titleHindi: string;
  subtitleBengali: string;
  subtitleEnglish: string;
  subtitleHindi: string;
  categoryBengali: string;
  categoryEnglish: string;
  categoryHindi: string;
  readTime: string;
  image: string;
  contentBengali: string;
  contentEnglish: string;
  contentHindi: string;
  pullQuote?: string;
}

export interface GalleryPhoto {
  id: string;
  title: string;
  caption: string;
  category?: 'all' | 'rituals' | 'pandal' | 'culture' | 'art';
  imageUrl: string;
  year: string;
}

export interface SocialPost {
  id: string;
  platform?: 'youtube' | 'instagram' | 'facebook';
  title: string;
  caption: string;
  author: string;
  handle: string;
  date: string;
  imageUrl?: string;
  videoUrl?: string;
  likes: number;
  sharesOrComments: number;
  url: string;
}

export interface Organiser {
  id: string;
  nameBengali: string;
  nameEnglish: string;
  nameHindi: string;
  roleBengali: string;
  roleEnglish: string;
  roleHindi: string;
  bioBengali: string;
  bioEnglish: string;
  bioHindi: string;
  photoUrl: string;
  contact?: string;
}

export interface PandalInfo {
  nameBengali: string;
  nameEnglish: string;
  nameHindi: string;
  taglineBengali: string;
  taglineEnglish: string;
  taglineHindi: string;
  address: string;
  timings: string;
  email: string;
  phone: string;
  year: string;
}

export type FestivalId = 'durga' | 'laxmi' | 'kali' | 'saraswati' | 'noboborsho';

export interface FestivalMeta {
  id: FestivalId;
  tabLabelBengali: string;
  tabLabelEnglish: string;
  tabLabelHindi: string;
  seasonBengali: string;
  seasonEnglish: string;
  seasonHindi: string;
  headlineBengali: string;
  headlineEnglish: string;
  headlineHindi: string;
  subBadgeBengali: string;
  subBadgeEnglish: string;
  subBadgeHindi: string;
  altarBadgeBengali: string;
  altarBadgeEnglish: string;
  altarBadgeHindi: string;
  editorialKickerBengali: string;
  editorialKickerEnglish: string;
  editorialKickerHindi: string;
  quoteHeadlineBengali: string;
  quoteHeadlineEnglish: string;
  quoteHeadlineHindi: string;
  quoteSubLeftBengali: string;
  quoteSubLeftEnglish: string;
  quoteSubLeftHindi: string;
  quoteSubRightBengali: string;
  quoteSubRightEnglish: string;
  quoteSubRightHindi: string;
  tickerItemsBengali: string[];
  tickerItemsEnglish: string[];
  tickerItemsHindi: string[];
  scheduleHeadingBengali: string;
  scheduleHeadingEnglish: string;
  scheduleHeadingHindi: string;
  scheduleSubtitleBengali: string;
  scheduleSubtitleEnglish: string;
  scheduleSubtitleHindi: string;
  scheduleDays: ScheduleDay[];
  stories: StoryArticle[];
  galleryPhotos: GalleryPhoto[];
}
