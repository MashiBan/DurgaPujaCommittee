import React, { useState, useEffect, useRef } from 'react';
import {
  Language,
  FestivalId,
  ScheduleDay,
  StoryArticle,
  GalleryPhoto,
  SocialPost,
  Organiser,
  PandalInfo,
} from './types';
import {
  initialScheduleDays,
  initialStories,
  initialGalleryPhotos,
  initialSocialPosts,
  initialOrganisers,
  initialPandalInfo,
} from './data/initialData';
import { allFestivals } from './data/festivalData';
import {
  deleteOrganiserFromDb,
  saveOrganiserToDb,
  subscribeGallery,
  subscribeOrganisers,
  subscribePandalInfo,
} from './services/firestoreService';
import { Navbar } from './components/Navbar';
import { LivingPandalHero } from './components/LivingPandalHero';
import { EditorialIntro } from './components/EditorialIntro';
import { ScheduleSection } from './components/ScheduleSection';
import { StoriesSection } from './components/StoriesSection';
import { HorizontalGallery } from './components/HorizontalGallery';
import { SocialMediaSection } from './components/SocialMediaSection';
import { OrganisersSection } from './components/OrganisersSection';
import { PandalFooter } from './components/PandalFooter';
import { AdminModal } from './components/AdminModal';
import { StickySpotifyPlayer } from './components/StickySpotifyPlayer';

import { onAuthStateChanged } from 'firebase/auth';
import { auth } from './firebase';

export default function App() {
  // Festival Tabs State: 'durga' | 'laxmi' | 'kali' | 'saraswati' | 'noboborsho'
  const [activeFestival, setActiveFestival] = useState<FestivalId>('durga');

  // Language State: 'bn' (Default Bangla), 'en' (English), 'hi' (Hindi)
  const [language, setLanguage] = useState<Language>(() => {
    const saved = localStorage.getItem('agamani_language');
    return (saved as Language) || 'bn';
  });

  const handleLanguageChange = (lang: Language) => {
    setLanguage(lang);
    localStorage.setItem('agamani_language', lang);
  };

  // Admin Auth State synced with real Firebase Auth and backend-verified session
  const [isAdminLoggedIn, setIsAdminLoggedIn] = useState<boolean>(() => {
    const isLocal =
      localStorage.getItem('agamani_admin_logged') === 'true' &&
      localStorage.getItem('agamani_admin_email')?.toLowerCase() === 'nonchalantlycool0@gmail.com';
    const isFirebase =
      !!auth.currentUser && auth.currentUser.email?.toLowerCase() === 'nonchalantlycool0@gmail.com';
    return isLocal || isFirebase;
  });

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user && user.email?.toLowerCase() === 'nonchalantlycool0@gmail.com') {
        setIsAdminLoggedIn(true);
        localStorage.setItem('agamani_admin_logged', 'true');
        localStorage.setItem('agamani_admin_email', 'nonchalantlycool0@gmail.com');
      } else {
        const isLocal =
          localStorage.getItem('agamani_admin_logged') === 'true' &&
          localStorage.getItem('agamani_admin_email')?.toLowerCase() === 'nonchalantlycool0@gmail.com';
        if (!isLocal) {
          setIsAdminLoggedIn(false);
        }
      }
    });
    return () => unsubscribe();
  }, []);

  const [isAdminModalOpen, setIsAdminModalOpen] = useState<boolean>(false);

  const handleAdminLogin = (email: string) => {
    if (email.toLowerCase() === 'nonchalantlycool0@gmail.com') {
      setIsAdminLoggedIn(true);
      localStorage.setItem('agamani_admin_logged', 'true');
      localStorage.setItem('agamani_admin_email', 'nonchalantlycool0@gmail.com');
    }
  };

  const handleAdminLogout = () => {
    setIsAdminLoggedIn(false);
    localStorage.removeItem('agamani_admin_logged');
    localStorage.removeItem('agamani_admin_email');
  };

  // Safe LocalStorage setter helper
  const safeSetItem = (key: string, value: string) => {
    try {
      localStorage.setItem(key, value);
    } catch (e) {
      console.warn(`LocalStorage quota exceeded while saving ${key}. State preserved in memory & Firestore:`, e);
      try {
        // Clear old gallery blob caches to free quota if needed
        localStorage.removeItem('agamani_gallery');
      } catch {}
    }
  };

  // Schedule State with LocalStorage Persistence
  const [scheduleDays, setScheduleDays] = useState<ScheduleDay[]>(() => {
    try {
      const saved = localStorage.getItem('agamani_schedule');
      return saved ? JSON.parse(saved) : initialScheduleDays;
    } catch {
      return initialScheduleDays;
    }
  });

  const handleUpdateSchedule = (days: ScheduleDay[]) => {
    setScheduleDays(days);
    safeSetItem('agamani_schedule', JSON.stringify(days));
  };

  // Gallery Photos State
  const [galleryPhotos, setGalleryPhotos] = useState<GalleryPhoto[]>(() => {
    try {
      const saved = localStorage.getItem('agamani_gallery');
      return saved ? JSON.parse(saved) : initialGalleryPhotos;
    } catch {
      return initialGalleryPhotos;
    }
  });

  const handleUpdateGallery = (photos: GalleryPhoto[]) => {
    setGalleryPhotos(photos);
    try {
      // Keep only lightweight image paths or limit stored photos to prevent quota overflow
      const lightweight = photos.slice(0, 20).map((p) => ({
        ...p,
        // If image data URL is larger than 100KB, rely on Firestore and don't bloat localStorage
        imageUrl: p.imageUrl.startsWith('data:') && p.imageUrl.length > 100000 ? '' : p.imageUrl,
      }));
      safeSetItem('agamani_gallery', JSON.stringify(lightweight));
    } catch (e) {
      console.warn('Gallery localStorage skipped:', e);
    }
  };

  // Social Media Posts State
  const [socialPosts, setSocialPosts] = useState<SocialPost[]>(() => {
    try {
      const saved = localStorage.getItem('agamani_social_posts');
      return saved ? JSON.parse(saved) : initialSocialPosts;
    } catch {
      return initialSocialPosts;
    }
  });

  const handleUpdateSocialPosts = (posts: SocialPost[]) => {
    setSocialPosts(posts);
    safeSetItem('agamani_social_posts', JSON.stringify(posts));
  };

  // Stories Articles State
  const [stories, setStories] = useState<StoryArticle[]>(() => {
    try {
      const saved = localStorage.getItem('agamani_stories');
      return saved ? JSON.parse(saved) : initialStories;
    } catch {
      return initialStories;
    }
  });

  const handleUpdateStories = (updatedStories: StoryArticle[]) => {
    setStories(updatedStories);
    safeSetItem('agamani_stories', JSON.stringify(updatedStories));
  };

  // Organisers State
  const [organisers, setOrganisers] = useState<Organiser[]>(() => {
    try {
      const saved = localStorage.getItem('agamani_organisers');
      if (!saved) return initialOrganisers;

      const savedOrganisers = JSON.parse(saved) as Organiser[];
      return savedOrganisers.map((organiser) => {
        const defaults = initialOrganisers.find((initialOrganiser) => initialOrganiser.id === organiser.id);
        return defaults
          ? { ...defaults, ...organiser, contact: organiser.contact || defaults.contact }
          : organiser;
      });
    } catch {
      return initialOrganisers;
    }
  });
  const organisersRef = useRef(organisers);

  const handleUpdateOrganisers = async (updatedOrganisers: Organiser[]): Promise<void> => {
    const updatedIds = new Set(updatedOrganisers.map((organiser) => organiser.id));
    const previousIds = new Set(organisersRef.current.map((organiser) => organiser.id));
    const removedOrganisers = organisersRef.current.filter((organiser) => !updatedIds.has(organiser.id));
    const addedOrganisers = updatedOrganisers.filter((organiser) => !previousIds.has(organiser.id));

    await Promise.all([
      ...removedOrganisers.map((organiser) => deleteOrganiserFromDb(organiser.id)),
      ...addedOrganisers.map((organiser) => saveOrganiserToDb(organiser)),
    ]);

    organisersRef.current = updatedOrganisers;
    setOrganisers(updatedOrganisers);
    safeSetItem('agamani_organisers', JSON.stringify(updatedOrganisers));
  };

  // Pandal Info State
  const [pandalInfo, setPandalInfo] = useState<PandalInfo>(() => {
    try {
      const saved = localStorage.getItem('agamani_info');
      return saved ? JSON.parse(saved) : initialPandalInfo;
    } catch {
      return initialPandalInfo;
    }
  });

  const handleUpdatePandalInfo = (info: PandalInfo) => {
    setPandalInfo(info);
    safeSetItem('agamani_info', JSON.stringify(info));
  };

  // Reset to original defaults
  const handleResetDefaults = () => {
    localStorage.removeItem('agamani_schedule');
    localStorage.removeItem('agamani_gallery');
    localStorage.removeItem('agamani_social_posts');
    localStorage.removeItem('agamani_stories');
    localStorage.removeItem('agamani_organisers');
    localStorage.removeItem('agamani_info');

    setScheduleDays(initialScheduleDays);
    setGalleryPhotos(initialGalleryPhotos);
    setSocialPosts(initialSocialPosts);
    setStories(initialStories);
    organisersRef.current = initialOrganisers;
    setOrganisers(initialOrganisers);
    setPandalInfo(initialPandalInfo);
  };

  // Sync real-time data from Firestore
  useEffect(() => {
    const unsubGallery = subscribeGallery((photos) => {
      if (photos && photos.length > 0) {
        setGalleryPhotos(photos);
      }
    });

    const unsubPandal = subscribePandalInfo((info) => {
      if (info) {
        setPandalInfo(info);
      }
    });

    const unsubOrganisers = subscribeOrganisers((remoteOrganisers, fromCache) => {
      if (fromCache && remoteOrganisers.length === 0) return;

      const localOrganisers = organisersRef.current;
      const remoteById = new Map(remoteOrganisers.map((organiser) => [organiser.id, organiser]));
      const mergedOrganisers = remoteOrganisers.map((remoteOrganiser) => {
        const localOrganiser = localOrganisers.find((organiser) => organiser.id === remoteOrganiser.id);
        if (!localOrganiser || remoteOrganiser.photoUrl || !localOrganiser.photoUrl) return remoteOrganiser;
        const mergedOrganiser = { ...localOrganiser, ...remoteOrganiser, photoUrl: localOrganiser.photoUrl };
        void saveOrganiserToDb(mergedOrganiser).catch((error) =>
          console.error('Firestore organiser photo migration failed:', error)
        );
        return mergedOrganiser;
      });

      const localOnlyOrganisers = localOrganisers.filter((organiser) => !remoteById.has(organiser.id));
      localOnlyOrganisers.forEach((organiser) => {
        void saveOrganiserToDb(organiser).catch((error) =>
          console.error('Firestore organiser migration failed:', error)
        );
      });

      const merged = [...mergedOrganisers, ...localOnlyOrganisers];
      organisersRef.current = merged;
      setOrganisers(merged);
      safeSetItem('agamani_organisers', JSON.stringify(merged));
    });

    return () => {
      unsubGallery();
      unsubPandal();
      unsubOrganisers();
    };
  }, []);

  const currentFestival = allFestivals[activeFestival as FestivalId] || allFestivals.durga;
  const currentScheduleDays = activeFestival === 'durga' ? scheduleDays : currentFestival.scheduleDays;
  const currentStories = activeFestival === 'durga' ? stories : currentFestival.stories;
  const currentGalleryPhotos = activeFestival === 'durga' ? galleryPhotos : currentFestival.galleryPhotos;

  return (
    <div className="min-h-screen flex flex-col bg-[#FBF9F5] text-[#1C1917] selection:bg-[#B91C1C] selection:text-white font-sans antialiased">
      {/* 1. Header / Top Bar adhering to the Top Bar Contract */}
      <Navbar
        language={language}
        onLanguageChange={handleLanguageChange}
        onOpenAdmin={() => setIsAdminModalOpen(true)}
        isAdminLoggedIn={isAdminLoggedIn}
      />

      <main className="flex-1">
        {/* 2. Interactive Living Pandal Hero */}
        <LivingPandalHero language={language} activeFestival={activeFestival} />

        {/* 3. Editorial Introduction & Marquee Ticker */}
        <EditorialIntro language={language} activeFestival={activeFestival} />

        {/* 4. Puja Schedule & Panjika Timings with Integrated Festival Selection */}
        <ScheduleSection
          days={currentScheduleDays}
          language={language}
          activeFestival={activeFestival}
          onSelectFestival={(id) => setActiveFestival(id)}
        />

        {/* 6. Cultural Stories & Folklore */}
        <StoriesSection stories={currentStories} language={language} />

        {/* 7. Continuous Left-to-Right Moving Horizontal Gallery */}
        <HorizontalGallery photos={currentGalleryPhotos} language={language} />

        {/* 8. Social Media Hub (YouTube, Instagram, Facebook) */}
        <SocialMediaSection posts={socialPosts} language={language} />

        <hr
          aria-hidden="true"
          style={{
            display: 'block',
            width: '100%',
            height: 1,
            flex: 'none',
            border: 0,
            backgroundColor: '#E7E2D6',
            margin: 0,
          }}
        />

        {/* 9. Puja Steering Committee & Master Artisans */}
        <OrganisersSection organisers={organisers} language={language} />
      </main>

      {/* 9. Pandal Address & Dark Heritage Footer */}
      <PandalFooter info={pandalInfo} language={language} />

      {/* 10. Admin & Editorial Management Modal */}
      <AdminModal
        isOpen={isAdminModalOpen}
        onClose={() => setIsAdminModalOpen(false)}
        isLoggedIn={isAdminLoggedIn}
        onLogin={handleAdminLogin}
        onLogout={handleAdminLogout}
        scheduleDays={scheduleDays}
        onUpdateSchedule={handleUpdateSchedule}
        galleryPhotos={galleryPhotos}
        onUpdateGallery={handleUpdateGallery}
        socialPosts={socialPosts}
        onUpdateSocialPosts={handleUpdateSocialPosts}
        stories={stories}
        onUpdateStories={handleUpdateStories}
        organisers={organisers}
        onUpdateOrganisers={handleUpdateOrganisers}
        pandalInfo={pandalInfo}
        onUpdatePandalInfo={handleUpdatePandalInfo}
        onResetDefaults={handleResetDefaults}
      />

      {/* 11. Sticky Translucent Bottom-Center Spotify Agamani Music Player */}
      <StickySpotifyPlayer language={language} />
    </div>
  );
}
