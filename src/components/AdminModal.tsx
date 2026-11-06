import React, { useState, useEffect } from 'react';
import { 
  signInWithEmailAndPassword, 
  signInWithPopup,
  signOut, 
  onAuthStateChanged,
  type User,
} from 'firebase/auth';
import { auth, googleProvider } from '../firebase';
import { 
  saveGalleryPhoto, 
  deleteGalleryPhotoFromDb, 
  savePandalInfoToDb,
  subscribeInquiries,
  deleteInquiryFromDb,
  getEmailJsConfig,
  saveEmailJsConfig,
  dispatchEmailViaEmailJs,
  type ContactInquiry,
  type EmailJsConfig,
} from '../services/firestoreService';
import { compressImageFile } from '../utils/imageCompressor';
import {
  verifyOrInitializeAdminPassword,
  resetAdminPasswordInBackend,
  AUTHORIZED_ADMIN_EMAIL,
} from '../services/adminAuthService';
import {
  type StoryArticle,
  type ScheduleDay,
  type GalleryPhoto,
  type SocialPost,
  type Organiser, 
  type PandalInfo,
} from '../types';
import {
  spellCheckEnglish,
  autoSynthesizeMultilingual,
  translateToBengali,
  translateToHindi,
} from '../utils/translator';
import {
  X,
  Lock,
  LogOut,
  Plus,
  Trash2,
  Upload,
  Save,
  RotateCcw,
  CheckCircle,
  Calendar,
  Image as ImageIcon,
  Share2,
  BookOpen,
  Users,
  MapPin,
  Sparkles,
  Wand2,
  Languages,
  Check,
  ChevronLeft,
  ChevronRight,
  ArrowRight,
  Mail,
  Search,
  Key,
  RefreshCw,
  AlertCircle,
  ExternalLink,
  Send,
} from 'lucide-react';

interface AdminModalProps {
  isOpen: boolean;
  onClose: () => void;
  isLoggedIn: boolean;
  onLogin: (email: string) => void;
  onLogout: () => void;

  scheduleDays: ScheduleDay[];
  onUpdateSchedule: (days: ScheduleDay[]) => void;

  galleryPhotos: GalleryPhoto[];
  onUpdateGallery: (photos: GalleryPhoto[]) => void;

  socialPosts: SocialPost[];
  onUpdateSocialPosts: (posts: SocialPost[]) => void;

  stories: StoryArticle[];
  onUpdateStories: (stories: StoryArticle[]) => void;

  organisers: Organiser[];
  onUpdateOrganisers: (organisers: Organiser[]) => void;

  pandalInfo: PandalInfo;
  onUpdatePandalInfo: (info: PandalInfo) => void;

  onResetDefaults: () => void;
}

type TabId = 'schedule' | 'gallery' | 'inquiries' | 'social' | 'stories' | 'organisers' | 'settings';

const TABS: { id: TabId; label: string; Icon: React.ComponentType<{ className?: string }> }[] = [
  { id: 'schedule', label: 'Puja Schedule', Icon: Calendar },
  { id: 'gallery', label: 'Gallery & Uploads', Icon: ImageIcon },
  { id: 'inquiries', label: 'Messages & Mail Logs', Icon: Mail },
  { id: 'social', label: 'Social Media Posts', Icon: Share2 },
  { id: 'stories', label: 'Cultural Stories', Icon: BookOpen },
  { id: 'organisers', label: 'Organisers & Artisans', Icon: Users },
  { id: 'settings', label: 'Pandal Info & Settings', Icon: MapPin },
];

const INPUT =
  'w-full min-w-0 px-3 py-2 sm:py-1.5 text-sm sm:text-xs rounded border border-[#D6CEBE] bg-[#FBF9F5] focus:outline-hidden focus:border-[#B91C1C]';
const LABEL = 'block text-xs font-medium text-[#44403C] mb-1';
const PRIMARY_BTN =
  'flex items-center justify-center gap-1.5 w-full sm:w-auto px-4 py-2.5 sm:py-2 bg-[#B91C1C] hover:bg-[#991B1B] text-white text-xs font-semibold rounded-md shadow-xs transition-colors';
const FILE_INPUT =
  'w-full text-xs text-[#57534E] file:mr-3 file:py-1.5 file:px-3 file:rounded file:border-0 file:text-xs file:font-semibold file:bg-[#B91C1C] file:text-white hover:file:bg-[#991B1B] cursor-pointer';
const CARD = 'bg-white p-3 sm:p-5 rounded-lg border border-[#E7E2D6]';

export const AdminModal: React.FC<AdminModalProps> = ({
  isOpen,
  onClose,
  onLogin,
  onLogout,
  scheduleDays,
  onUpdateSchedule,
  galleryPhotos,
  onUpdateGallery,
  socialPosts,
  onUpdateSocialPosts,
  stories,
  onUpdateStories,
  organisers,
  onUpdateOrganisers,
  pandalInfo,
  onUpdatePandalInfo,
  onResetDefaults,
}) => {
  // Real Firebase Auth & Backend-verified Auth State
  const [currentUser, setCurrentUser] = useState<User | null>(() => auth.currentUser);
  const [isBackendAuthenticated, setIsBackendAuthenticated] = useState<boolean>(() => {
    return (
      localStorage.getItem('agamani_admin_logged') === 'true' &&
      localStorage.getItem('agamani_admin_email')?.toLowerCase() === AUTHORIZED_ADMIN_EMAIL.toLowerCase()
    );
  });

  // Sync auth state with real Firebase Auth
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user && user.email && user.email.toLowerCase() === AUTHORIZED_ADMIN_EMAIL.toLowerCase()) {
        setCurrentUser(user);
        setIsBackendAuthenticated(true);
        onLogin(user.email);
      } else {
        setCurrentUser(null);
        const isLocal =
          localStorage.getItem('agamani_admin_logged') === 'true' &&
          localStorage.getItem('agamani_admin_email')?.toLowerCase() === AUTHORIZED_ADMIN_EMAIL.toLowerCase();
        if (!isLocal) {
          setIsBackendAuthenticated(false);
          onLogout();
        }
      }
    });
    return () => unsubscribe();
  }, [onLogin, onLogout]);

  const activeIsLoggedIn =
    (!!currentUser && currentUser.email?.toLowerCase() === AUTHORIZED_ADMIN_EMAIL.toLowerCase()) ||
    isBackendAuthenticated;

  // Login & Password Reset form
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isResetMode, setIsResetMode] = useState(false);
  const [newResetPassword, setNewResetPassword] = useState('');
  const [authError, setAuthError] = useState('');

  const [activeTab, setActiveTab] = useState<TabId>('schedule');
  const [savedMessage, setSavedMessage] = useState('');

  // Inquiries State & EmailJS Config
  const [inquiries, setInquiries] = useState<ContactInquiry[]>([]);
  const [inquirySearch, setInquirySearch] = useState('');
  const [emailJsConfig, setEmailJsConfig] = useState<EmailJsConfig>({
    serviceId: '',
    templateId: '',
    publicKey: '',
    targetEmail: AUTHORIZED_ADMIN_EMAIL,
  });
  const [emailJsStatusMsg, setEmailJsStatusMsg] = useState('');
  const [isSendingTestMail, setIsSendingTestMail] = useState(false);

  // Subscribe to inquiries when logged in
  useEffect(() => {
    if (activeIsLoggedIn) {
      const unsub = subscribeInquiries((items) => {
        setInquiries(items);
      });
      getEmailJsConfig().then((cfg) => {
        if (cfg) setEmailJsConfig(cfg);
      });
      return () => unsub();
    }
  }, [activeIsLoggedIn]);

  // Gallery form
  const [newPhotoTitle, setNewPhotoTitle] = useState('');
  const [newPhotoCaption, setNewPhotoCaption] = useState('');
  const [newPhotoCategory, setNewPhotoCategory] = useState<'culture' | 'rituals' | 'pandal' | 'art'>('culture');
  const [newPhotoUrl, setNewPhotoUrl] = useState('');

  // Social form
  const [newPostPlatform, setNewPostPlatform] = useState<'youtube' | 'instagram' | 'facebook'>('youtube');
  const [newPostTitle, setNewPostTitle] = useState('');
  const [newPostCaption, setNewPostCaption] = useState('');
  const [newPostUrl, setNewPostUrl] = useState('');

  // Organiser form
  const [newOrgName, setNewOrgName] = useState('');
  const [newOrgRole, setNewOrgRole] = useState('');
  const [newOrgBio, setNewOrgBio] = useState('');
  const [newOrgPhoto, setNewOrgPhoto] = useState('');
  // Schedule quick add state in English per day
  const [newRitualTitleEn, setNewRitualTitleEn] = useState<Record<string, string>>({});
  const [newRitualTimeEn, setNewRitualTimeEn] = useState<Record<string, string>>({});
  const [isTranslatingDay, setIsTranslatingDay] = useState<Record<string, boolean>>({});

  // Gallery live translation preview
  const [galleryPreviewBn, setGalleryPreviewBn] = useState<{ title: string; caption: string; hindi: string } | null>(null);

  // Organiser live translation preview
  const [orgPreview, setOrgPreview] = useState<{ name: string; roleBn: string; roleHi: string; bioBn: string; bioHi: string } | null>(null);

  if (!isOpen) return null;

  const triggerSaveNotification = (msg: string) => {
    setSavedMessage(msg);
    setTimeout(() => setSavedMessage(''), 3000);
  };

  const handleGoogleSignIn = async () => {
    setAuthError('');
    try {
      const res = await signInWithPopup(auth, googleProvider);
      if (res.user?.email) {
        if (res.user.email.toLowerCase() !== AUTHORIZED_ADMIN_EMAIL.toLowerCase()) {
          await signOut(auth);
          setAuthError('Access Denied: This Google account is not authorized.');
          return;
        }
        setCurrentUser(res.user);
        setIsBackendAuthenticated(true);
        onLogin(res.user.email);
        localStorage.setItem('agamani_admin_logged', 'true');
        localStorage.setItem('agamani_admin_email', AUTHORIZED_ADMIN_EMAIL);
        triggerSaveNotification('Signed in with Google');
      }
    } catch (err: any) {
      setAuthError(err.message || 'Google sign-in was cancelled or encountered an error.');
    }
  };

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError('');

    const inputEmail = email.trim().toLowerCase();
    if (!inputEmail) {
      setAuthError('Please enter your email.');
      return;
    }

    if (!password) {
      setAuthError('Please enter your password.');
      return;
    }

    // Strictly enforce the single authorized email
    if (inputEmail !== AUTHORIZED_ADMIN_EMAIL.toLowerCase()) {
      setAuthError('Access Denied: Only nonchalantlycool0@gmail.com is authorized.');
      return;
    }

    try {
      // 1. Try Firebase Auth first (if user exists in Firebase Auth)
      try {
        const userCred = await signInWithEmailAndPassword(auth, inputEmail, password);
        if (userCred.user && userCred.user.email?.toLowerCase() === AUTHORIZED_ADMIN_EMAIL.toLowerCase()) {
          setCurrentUser(userCred.user);
          setIsBackendAuthenticated(true);
          onLogin(userCred.user.email);
          localStorage.setItem('agamani_admin_logged', 'true');
          localStorage.setItem('agamani_admin_email', AUTHORIZED_ADMIN_EMAIL);
          triggerSaveNotification('Authenticated as Administrator');
          return;
        }
      } catch {
        // Fall back to Cloud Firestore backend password verification.
      }

      // 2. Verify or auto-initialize password in Cloud Firestore backend
      const result = await verifyOrInitializeAdminPassword(password);
      if (result.success) {
        setIsBackendAuthenticated(true);
        onLogin(AUTHORIZED_ADMIN_EMAIL);
        localStorage.setItem('agamani_admin_logged', 'true');
        localStorage.setItem('agamani_admin_email', AUTHORIZED_ADMIN_EMAIL);
        triggerSaveNotification(result.message);
        return;
      } else {
        setAuthError(result.message);
      }
    } catch (err: any) {
      setAuthError(err?.message || 'Authentication failed. Please verify credentials.');
      return;
    }
  };

  const handleResetPasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError('');
    if (!newResetPassword || newResetPassword.trim().length < 3) {
      setAuthError('New password must be at least 3 characters long.');
      return;
    }

    try {
      const res = await resetAdminPasswordInBackend(newResetPassword.trim());
      if (res.success) {
        setIsBackendAuthenticated(true);
        onLogin(AUTHORIZED_ADMIN_EMAIL);
        localStorage.setItem('agamani_admin_logged', 'true');
        localStorage.setItem('agamani_admin_email', AUTHORIZED_ADMIN_EMAIL);
        setPassword(newResetPassword.trim());
        setIsResetMode(false);
        triggerSaveNotification('Admin password saved in backend database and signed in!');
      } else {
        setAuthError(res.message);
      }
    } catch (err: any) {
      setAuthError(err?.message || 'Failed to save password to backend database.');
    }
  };

  const handleLogoutClick = async () => {
    try {
      await signOut(auth); // Real Firebase sign-out
    } catch (err: any) {
      console.error('Logout note:', err);
    }
    setCurrentUser(null);
    setIsBackendAuthenticated(false);
    localStorage.removeItem('agamani_admin_logged');
    localStorage.removeItem('agamani_admin_email');
    onLogout(); // Notify parent
    triggerSaveNotification('Logged out');
  };

  const handleSaveEmailJsSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await saveEmailJsConfig(emailJsConfig);
      setEmailJsStatusMsg('EmailJS credentials saved to Firestore backend!');
      setTimeout(() => setEmailJsStatusMsg(''), 4000);
      triggerSaveNotification('Email configuration saved');
    } catch (err: any) {
      setEmailJsStatusMsg('Failed to save EmailJS settings: ' + err?.message);
    }
  };

  const handleSendTestEmail = async () => {
    setIsSendingTestMail(true);
    setEmailJsStatusMsg('');
    try {
      const testInquiry: ContactInquiry = {
        id: `test-${Date.now()}`,
        name: 'Puja Admin Test',
        email: AUTHORIZED_ADMIN_EMAIL,
        phone: '+91 98765 43210',
        subject: 'EmailJS Configuration Verification',
        message: 'This is a test notification confirming that EmailJS is sending messages directly to ' + AUTHORIZED_ADMIN_EMAIL,
        createdAt: new Date().toISOString(),
      };
      const res = await dispatchEmailViaEmailJs(testInquiry);
      if (res.sent) {
        setEmailJsStatusMsg('Test email successfully sent to ' + AUTHORIZED_ADMIN_EMAIL + '!');
      } else {
        setEmailJsStatusMsg('EmailJS Delivery Note: ' + (res.reason || 'Please verify Service ID, Template ID & Public Key.'));
      }
    } catch (err: any) {
      setEmailJsStatusMsg('Error testing email: ' + err?.message);
    } finally {
      setIsSendingTestMail(false);
    }
  };

  // --- Schedule Handlers with Multilingual Translation ---
  const handleAddRitualWithTranslation = async (dayId: string) => {
    const rawEnglish = newRitualTitleEn[dayId]?.trim();
    if (!rawEnglish) {
      alert('Please enter a ritual name in English (e.g. "Morning Pushpanjali & Aarti")');
      return;
    }
    const rawTime = newRitualTimeEn[dayId]?.trim() || '6:30 PM';

    setIsTranslatingDay((prev) => ({ ...prev, [dayId]: true }));
    try {
      const { english, bengali, hindi } = await autoSynthesizeMultilingual(rawEnglish);
      const updated = scheduleDays.map((day) =>
        day.id === dayId
          ? {
              ...day,
              rituals: [
                ...day.rituals,
                {
                  id: `r-custom-${Date.now()}`,
                  time: rawTime,
                  titleEnglish: english,
                  titleBengali: bengali || translateToBengali(english),
                  titleHindi: hindi || translateToHindi(english),
                },
              ],
            }
          : day
      );
      onUpdateSchedule(updated);
      setNewRitualTitleEn((prev) => ({ ...prev, [dayId]: '' }));
      triggerSaveNotification(`Ritual "${english}" added with Bengali & Hindi translations!`);
    } finally {
      setIsTranslatingDay((prev) => ({ ...prev, [dayId]: false }));
    }
  };

  const handleAutoTranslateRitual = async (dayId: string, ritualId: string, englishText: string) => {
    if (!englishText.trim()) return;
    const { english, bengali, hindi } = await autoSynthesizeMultilingual(englishText);
    const updated = scheduleDays.map((day) => {
      if (day.id !== dayId) return day;
      return {
        ...day,
        rituals: day.rituals.map((r) =>
          r.id === ritualId
            ? {
                ...r,
                titleEnglish: english,
                titleBengali: bengali || translateToBengali(english),
                titleHindi: hindi || translateToHindi(english),
              }
            : r
        ),
      };
    });
    onUpdateSchedule(updated);
    triggerSaveNotification('Spell-checked and translated!');
  };

  const handleAutoTranslateDayTitle = async (dayId: string, englishTitle: string) => {
    if (!englishTitle.trim()) return;
    const { english, bengali, hindi } = await autoSynthesizeMultilingual(englishTitle);
    const updated = scheduleDays.map((day) =>
      day.id === dayId
        ? {
            ...day,
            titleEnglish: english,
            titleBengali: bengali || translateToBengali(english),
            titleHindi: hindi || translateToHindi(english),
          }
        : day
    );
    onUpdateSchedule(updated);
    triggerSaveNotification('Day title translated');
  };

  const handleRemoveRitual = (dayId: string, ritualId: string) => {
    const updated = scheduleDays.map((day) =>
      day.id === dayId ? { ...day, rituals: day.rituals.filter((r) => r.id !== ritualId) } : day
    );
    onUpdateSchedule(updated);
    triggerSaveNotification('Ritual removed');
  };

  // --- Gallery Handlers with Multilingual Translation ---
  const readFileAsDataUrl = (file: File, cb: (url: string) => void) => {
    const reader = new FileReader();
    reader.onload = (event) => {
      if (event.target?.result) cb(event.target.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      try {
        const compressed = await compressImageFile(file, 1200, 900, 0.72);
        setNewPhotoUrl(compressed);
        triggerSaveNotification('Image optimized for web');
      } catch {
        readFileAsDataUrl(file, setNewPhotoUrl);
      }
    }
  };

  const handlePreviewGalleryTranslation = async () => {
    if (!newPhotoTitle && !newPhotoCaption) return;
    const polishedTitle = spellCheckEnglish(newPhotoTitle);
    const polishedCaption = spellCheckEnglish(newPhotoCaption);
    const [titleRes, captionRes] = await Promise.all([
      autoSynthesizeMultilingual(polishedTitle),
      autoSynthesizeMultilingual(polishedCaption),
    ]);
    setGalleryPreviewBn({
      title: titleRes.bengali,
      caption: captionRes.bengali,
      hindi: `${titleRes.hindi} — ${captionRes.hindi}`,
    });
    setNewPhotoTitle(titleRes.english);
    setNewPhotoCaption(captionRes.english);
    triggerSaveNotification('Spell-checked & translated preview generated');
  };

  const handleAddPhoto = async () => {
    if (!newPhotoUrl) {
      alert('Please upload an image file or enter an image URL');
      return;
    }
    const polishedTitle = spellCheckEnglish(newPhotoTitle) || 'Festival Moment';
    const polishedCaption = spellCheckEnglish(newPhotoCaption) || 'Captured with devotion at the Puja Pandal.';
    const bnTitle = translateToBengali(polishedTitle);
    const bnCaption = translateToBengali(polishedCaption);

    const newPhoto: GalleryPhoto = {
      id: `photo-${Date.now()}`,
      title: `${polishedTitle} (${bnTitle})`,
      caption: `${polishedCaption} · ${bnCaption}`,
      category: newPhotoCategory,
      imageUrl: newPhotoUrl,
      year: '2026',
    };
    onUpdateGallery([newPhoto, ...galleryPhotos]);
    saveGalleryPhoto(newPhoto).catch((err) => console.warn('Firestore photo save note:', err));
    setNewPhotoTitle('');
    setNewPhotoCaption('');
    setNewPhotoUrl('');
    setGalleryPreviewBn(null);
    triggerSaveNotification('Photo uploaded with cultural translation');
  };

  const handleRemovePhoto = (photoId: string) => {
    onUpdateGallery(galleryPhotos.filter((p) => p.id !== photoId));
    deleteGalleryPhotoFromDb(photoId).catch((err) => console.warn('Firestore photo delete note:', err));
    triggerSaveNotification('Photo removed');
  };

  // --- Social ---
  const handleAddSocialPost = () => {
    if (!newPostTitle) {
      alert('Please enter a title for the post');
      return;
    }
    const polishedTitle = spellCheckEnglish(newPostTitle);
    const polishedCaption = spellCheckEnglish(newPostCaption);

    const newPost: SocialPost = {
      id: `post-${Date.now()}`,
      platform: newPostPlatform,
      title: polishedTitle,
      caption: polishedCaption,
      author: 'Agamani Pujo Official',
      handle: '@AgamaniDurgotsab',
      date: 'Today',
      imageUrl:
        newPostPlatform === 'youtube'
          ? '/src/assets/images/bengal_dhunuchi_dance_1793704103666.jpg'
          : '/src/assets/images/bengal_pujo_alpona_1793704103241.jpg',
      likes: 1200,
      sharesOrComments: 45,
      url: newPostUrl || 'https://youtube.com',
    };
    onUpdateSocialPosts([newPost, ...socialPosts]);
    setNewPostTitle('');
    setNewPostCaption('');
    setNewPostUrl('');
    triggerSaveNotification('Social media post added');
  };

  const handleRemoveSocialPost = (postId: string) => {
    onUpdateSocialPosts(socialPosts.filter((p) => p.id !== postId));
    triggerSaveNotification('Post removed');
  };

  // --- Organisers Handlers with Multilingual Translation ---
  const handleOrgPhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      try {
        const compressed = await compressImageFile(file, 600, 600, 0.75);
        setNewOrgPhoto(compressed);
        triggerSaveNotification('Portrait photo optimized');
      } catch {
        readFileAsDataUrl(file, setNewOrgPhoto);
      }
    }
  };

  const handlePreviewOrganiserTranslation = async () => {
    if (!newOrgName && !newOrgRole) return;
    const polishedName = spellCheckEnglish(newOrgName);
    const polishedRole = spellCheckEnglish(newOrgRole || 'Committee Member');
    const polishedBio = spellCheckEnglish(newOrgBio || 'Dedicated volunteer serving the Durgotsav.');

    const [roleSyn, bioSyn] = await Promise.all([
      autoSynthesizeMultilingual(polishedRole),
      autoSynthesizeMultilingual(polishedBio),
    ]);

    setOrgPreview({
      name: polishedName,
      roleBn: roleSyn.bengali,
      roleHi: roleSyn.hindi,
      bioBn: bioSyn.bengali,
      bioHi: bioSyn.hindi,
    });
    setNewOrgName(polishedName);
    setNewOrgRole(roleSyn.english);
    setNewOrgBio(bioSyn.english);
    triggerSaveNotification('Spell-checked & translated preview generated');
  };

  const handleAddOrganiser = async () => {
    if (!newOrgName) {
      alert('Please enter the name of the organiser in English');
      return;
    }
    const polishedName = spellCheckEnglish(newOrgName);
    const polishedRole = spellCheckEnglish(newOrgRole || 'Committee Member');
    const polishedBio = spellCheckEnglish(newOrgBio || 'Dedicated volunteer serving the Durgotsav.');

    const bnRole = translateToBengali(polishedRole);
    const hiRole = translateToHindi(polishedRole);
    const bnBio = translateToBengali(polishedBio);
    const hiBio = translateToHindi(polishedBio);

  

    const newOrg: Organiser = {
      id: `org-${Date.now()}`,
      nameBengali: polishedName,
      nameEnglish: polishedName,
      nameHindi: polishedName,
      roleBengali: bnRole,
      roleEnglish: polishedRole,
      roleHindi: hiRole,
      bioBengali: bnBio,
      bioEnglish: polishedBio,
      bioHindi: hiBio,
      photoUrl: newOrgPhoto,
    };
    onUpdateOrganisers([...organisers, newOrg]);
    setNewOrgName('');
    setNewOrgRole('');
    setNewOrgBio('');
    setNewOrgPhoto('');
    setOrgPreview(null);
  };

  const handleRemoveOrganiser = (orgId: string) => {
    onUpdateOrganisers(organisers.filter((o) => o.id !== orgId));
    triggerSaveNotification('Organiser removed');
  };

  const initials = (name: string) =>
    name
      .split(/\s+/)
      .filter(Boolean)
      .slice(0, 2)
      .map((w) => w[0])
      .join('')
      .toUpperCase();

  return (
    <div className="fixed inset-0 z-50 flex items-stretch sm:items-center justify-center p-0 sm:p-4 lg:p-6 bg-stone-900/60 backdrop-blur-xs">
      <div className="relative bg-[#FBF9F5] w-full sm:max-w-3xl lg:max-w-5xl xl:max-w-6xl h-dvh sm:h-[92dvh] lg:h-[88dvh] rounded-none sm:rounded-xl shadow-2xl border-0 sm:border border-[#D6CEBE] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="bg-[#991B1B] text-white px-3 sm:px-6 py-3 sm:py-4 flex items-center justify-between gap-2 border-b border-[#7F1D1D] shrink-0">
          <div className="flex items-center gap-2 sm:gap-3 min-w-0">
            <div className="w-8 h-8 shrink-0 rounded bg-white/20 flex items-center justify-center text-white">
              <Lock className="w-4 h-4" />
            </div>
            <div className="min-w-0">
              <h2 className="font-semibold text-sm sm:text-base lg:text-lg text-white leading-tight truncate">
                <span className="sm:hidden">Admin Portal</span>
                <span className="hidden sm:inline">Admin &amp; Editorial Portal</span>
              </h2>
              <span className="block text-[10px] sm:text-xs text-red-100 font-mono truncate">
                {activeIsLoggedIn ? 'Signed in as Administrator' : 'Authentication Required'}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-1.5 sm:gap-3 shrink-0">
            {activeIsLoggedIn && (
              <button
                onClick={handleLogoutClick}
                className="flex items-center gap-1.5 text-xs text-white hover:text-rose-200 p-2 sm:px-2.5 sm:py-1 rounded bg-black/20 hover:bg-black/30 transition-colors"
                title="Log out"
                aria-label="Log out"
              >
                <LogOut className="w-4 h-4 sm:w-3.5 sm:h-3.5" />
                <span className="hidden sm:inline">Logout</span>
              </button>
            )}
            <button
              onClick={onClose}
              className="p-2 text-red-100 hover:text-white rounded-lg hover:bg-black/20 transition-colors"
              aria-label="Close Admin Modal"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Save toast */}
        {savedMessage && (
          <div className="absolute z-10 bottom-4 left-1/2 -translate-x-1/2 max-w-[90%] flex items-center gap-1.5 text-xs text-emerald-100 bg-emerald-900/95 border border-emerald-700 px-3 py-2 rounded-md shadow-lg">
            <CheckCircle className="w-3.5 h-3.5 shrink-0" />
            <span className="truncate">{savedMessage}</span>
          </div>
        )}

        {!activeIsLoggedIn ? (
          /* Login screen */
          <div className="flex-1 overflow-y-auto flex items-start sm:items-center justify-center p-4 sm:p-6 bg-[#F8F5EE]">
            <div className="bg-white p-5 sm:p-8 lg:p-10 rounded-xl border border-[#E7E2D6] shadow-sm w-full max-w-md my-auto">
              <div className="text-center mb-5 sm:mb-6">
                <div className="w-12 h-12 rounded-full bg-[#B91C1C]/10 text-[#B91C1C] flex items-center justify-center mx-auto mb-3">
                  <Lock className="w-6 h-6" />
                </div>
                <h3 className="font-bengali-serif text-xl sm:text-2xl font-bold text-[#1C1917]">
                  পূজা পরিচালনা প্যানেল
                </h3>
                <p className="text-xs text-[#78716C] mt-1">
                  Log in to update schedule, stories, live photos &amp; announcements
                </p>
              </div>

              {authError && (
                <div className="p-3 mb-4 rounded bg-rose-50 border border-rose-200 text-xs text-rose-700 leading-relaxed">
                  {authError}
                </div>
              )}

              <button
                type="button"
                onClick={handleGoogleSignIn}
                className="w-full mb-4 py-2.5 px-4 bg-white hover:bg-[#F3EFE6] text-[#292524] text-xs font-semibold rounded-md border border-[#D6CEBE] shadow-xs flex items-center justify-center gap-2.5 transition-colors cursor-pointer"
              >
                <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"/>
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"/>
                </svg>
                <span>Continue with Google</span>
              </button>

              <div className="relative flex py-2 items-center mb-3">
                <div className="grow border-t border-[#E7E2D6]"></div>
                <span className="shrink mx-2 text-[10px] text-[#A8A29E] uppercase tracking-wider font-mono">or password login</span>
                <div className="grow border-t border-[#E7E2D6]"></div>
              </div>

              {!isResetMode ? (
                <form onSubmit={handleLoginSubmit} className="space-y-4">
                  <div>
                    <label className="block text-xs font-semibold text-[#44403C] uppercase mb-1 font-mono">
                      Email
                    </label>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="nonchalantlycool0@gmail.com"
                      className="w-full px-3.5 py-2.5 text-base sm:text-sm rounded-md border border-[#D6CEBE] bg-[#FBF9F5] focus:outline-hidden focus:border-[#800000]"
                      required
                    />
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="block text-xs font-semibold text-[#44403C] uppercase font-mono">
                        Password
                      </label>
                      <button
                        type="button"
                        onClick={() => {
                          setIsResetMode(true);
                          setAuthError('');
                        }}
                        className="text-xs text-[#800000] hover:text-[#991B1B] hover:underline font-medium cursor-pointer"
                      >
                        Reset / Set Password
                      </button>
                    </div>
                    <input
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Enter admin password..."
                      className="w-full px-3.5 py-2.5 text-base sm:text-sm rounded-md border border-[#D6CEBE] bg-[#FBF9F5] focus:outline-hidden focus:border-[#800000]"
                      required
                    />
                  </div>

                  <div className="p-2.5 rounded bg-[#F5F2EB] border border-[#E5DECF] text-[11px] text-[#57534E] leading-relaxed">
                    <span className="font-semibold text-[#1C1917]">Backend Auth Note:</span> If this is your first time or you haven't set a password yet, whatever password you enter here will automatically be established and saved in your Cloud Firestore backend database.
                  </div>

                  <button
                    type="submit"
                    className="w-full py-3 sm:py-2.5 px-4 bg-[#800000] hover:bg-[#991B1B] text-white text-sm font-semibold rounded-md shadow-xs transition-colors cursor-pointer"
                  >
                    Sign In to Admin Dashboard
                  </button>
                </form>
              ) : (
                <form onSubmit={handleResetPasswordSubmit} className="space-y-4">
                  <div className="p-3 rounded-lg bg-amber-50 border border-amber-200 text-xs text-amber-900 leading-relaxed">
                    <div className="flex items-center gap-1.5 font-bold mb-1">
                      <Key className="w-3.5 h-3.5 text-amber-700" />
                      <span>Reset Admin Password</span>
                    </div>
                    <span>Enter your new password below. It will immediately be saved in the backend Cloud Firestore database (`system_auth` collection) and authenticate you.</span>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-[#44403C] uppercase mb-1 font-mono">
                      Target Admin Account
                    </label>
                    <input
                      type="text"
                      disabled
                      value={AUTHORIZED_ADMIN_EMAIL}
                      className="w-full px-3.5 py-2 text-xs rounded-md border border-[#D6CEBE] bg-[#EFECE4] text-[#78716C]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-[#44403C] uppercase mb-1 font-mono">
                      New Password *
                    </label>
                    <input
                      type="password"
                      autoFocus
                      required
                      value={newResetPassword}
                      onChange={(e) => setNewResetPassword(e.target.value)}
                      placeholder="Type your new password..."
                      className="w-full px-3.5 py-2.5 text-base sm:text-sm rounded-md border border-[#D6CEBE] bg-[#FBF9F5] focus:outline-hidden focus:border-[#800000]"
                    />
                  </div>

                  <div className="flex items-center gap-2 pt-1">
                    <button
                      type="submit"
                      className="flex-1 py-2.5 px-4 bg-[#15803D] hover:bg-[#166534] text-white text-xs font-semibold rounded-md shadow-xs transition-colors cursor-pointer"
                    >
                      Save Password to Backend &amp; Sign In
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setIsResetMode(false);
                        setAuthError('');
                      }}
                      className="px-3 py-2.5 bg-stone-200 hover:bg-stone-300 text-stone-700 text-xs font-medium rounded-md transition-colors cursor-pointer"
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>
        ) : (
          /* Dashboard */
          <div className="flex-1 flex flex-col md:flex-row min-h-0">
            {/* Scrollable Navigation Sidebar / Tab Bar */}
            <div className="shrink-0 flex flex-col border-b md:border-b-0 md:border-r border-[#E7E2D6] bg-[#EFECE4]">
              {/* Mobile swipe helper bar with left/right scroll controls */}
              <div className="flex md:hidden items-center justify-between px-3 py-1.5 bg-[#E6E0D4] border-b border-[#D8D0C0] text-[11px] text-[#78716C]">
                <span className="flex items-center gap-1 font-medium text-[#44403C]">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#991B1B]" />
                  <span>Swipe tabs horizontally</span>
                </span>
                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={() => {
                      const el = document.getElementById('admin-sections-nav');
                      if (el) el.scrollBy({ left: -140, behavior: 'smooth' });
                    }}
                    className="px-1.5 py-0.5 rounded bg-white/90 border border-[#D6CEBE] text-[#44403C] active:bg-[#991B1B] active:text-white"
                    aria-label="Scroll admin tabs left"
                  >
                    ◀
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      const el = document.getElementById('admin-sections-nav');
                      if (el) el.scrollBy({ left: 140, behavior: 'smooth' });
                    }}
                    className="px-1.5 py-0.5 rounded bg-white/90 border border-[#D6CEBE] text-[#44403C] active:bg-[#991B1B] active:text-white"
                    aria-label="Scroll admin tabs right"
                  >
                    ▶
                  </button>
                </div>
              </div>

              <nav
                id="admin-sections-nav"
                className="flex md:flex-col items-center md:items-stretch gap-1 p-2 md:p-3 overflow-x-auto md:overflow-x-visible md:overflow-y-auto md:w-52 lg:w-64 touch-pan-x scroll-smooth [scrollbar-width:thin] [scrollbar-color:#991B1B_transparent] [-webkit-overflow-scrolling:touch]"
                aria-label="Admin sections"
              >
                {TABS.map(({ id, label, Icon }) => (
                  <button
                    key={id}
                    onClick={() => setActiveTab(id)}
                    className={`flex items-center gap-2 shrink-0 md:w-full px-3 py-2 text-xs font-medium rounded-md transition-colors whitespace-nowrap cursor-pointer ${
                      activeTab === id
                        ? 'bg-white text-[#991B1B] shadow-xs font-semibold ring-1 ring-[#991B1B]/10'
                        : 'text-[#57534E] hover:text-[#1C1917] hover:bg-white/50'
                    }`}
                  >
                    <Icon className="w-4 h-4 shrink-0 text-[#991B1B]" />
                    <span>{label}</span>
                  </button>
                ))}

                <div className="shrink-0 ml-auto md:ml-0 md:mt-auto md:pt-4 md:border-t md:border-[#D6CEBE]">
                  <button
                    onClick={() => {
                      if (confirm('Reset all festival content back to the original default setup?')) {
                        onResetDefaults();
                        triggerSaveNotification('Reset to defaults');
                      }
                    }}
                    className="flex items-center gap-1.5 w-full px-3 py-2 text-[11px] text-[#78716C] hover:text-[#B91C1C] transition-colors whitespace-nowrap cursor-pointer"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span>
                      Reset<span className="hidden md:inline"> All to Defaults</span>
                    </span>
                  </button>
                </div>
              </nav>
            </div>

            <div className="flex-1 min-w-0 overflow-y-auto p-3 sm:p-6 lg:p-8 pb-16 bg-[#FBF9F5]">
              {/* TAB 1: SCHEDULE */}
              {activeTab === 'schedule' && (
                <div className="space-y-5 sm:space-y-6">
                  <div className="pb-3 border-b border-[#E7E2D6]">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <div>
                        <h3 className="font-bengali-serif text-lg sm:text-xl font-bold text-[#1C1917]">
                          Edit Puja Schedule &amp; Timings
                        </h3>
                        <p className="text-xs text-[#78716C]">
                          Enter all rituals in English; automatic spell check translates them to Bengali &amp; Hindi
                        </p>
                      </div>
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200 text-[11px] font-medium self-start sm:self-auto">
                        <Sparkles className="w-3 h-3 text-emerald-600" />
                        <span>English Input ➔ বাংলা + हिंदी</span>
                      </span>
                    </div>
                  </div>

                  <div className="space-y-5 sm:space-y-6">
                    {scheduleDays.map((day, dIdx) => (
                      <div key={day.id} className={`${CARD} shadow-xs space-y-4`}>
                        {/* Day Header with English Title & Translate */}
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-[#F2EEE4] pb-3">
                          <div className="flex items-start sm:items-center gap-3 min-w-0 flex-1">
                            <span className="font-bengali-serif font-bold text-xl text-[#991B1B] shrink-0">
                              {day.dayBengaliNum}
                            </span>
                            <div className="min-w-0 flex-1">
                              <div className="flex items-center gap-2">
                                <input
                                  type="text"
                                  value={day.titleEnglish}
                                  onChange={(e) => {
                                    const updated = [...scheduleDays];
                                    updated[dIdx].titleEnglish = e.target.value;
                                    onUpdateSchedule(updated);
                                  }}
                                  onBlur={(e) => {
                                    const corrected = spellCheckEnglish(e.target.value);
                                    if (corrected && corrected !== e.target.value) {
                                      const updated = [...scheduleDays];
                                      updated[dIdx].titleEnglish = corrected;
                                      onUpdateSchedule(updated);
                                    }
                                  }}
                                  className="w-full font-bold text-sm text-[#1C1917] bg-white px-2 py-1 rounded border border-[#D6CEBE] focus:outline-hidden focus:border-[#B91C1C]"
                                  placeholder="Day Title in English (e.g. Maha Saptami)"
                                />
                                <button
                                  type="button"
                                  onClick={() => handleAutoTranslateDayTitle(day.id, day.titleEnglish)}
                                  className="shrink-0 flex items-center gap-1 px-2.5 py-1 bg-[#B91C1C]/10 hover:bg-[#B91C1C]/20 text-[#991B1B] text-[11px] font-semibold rounded transition-colors"
                                  title="Spell-check and auto-translate day title to Bengali"
                                >
                                  <Wand2 className="w-3 h-3" />
                                  <span className="hidden sm:inline">Translate</span>
                                </button>
                              </div>
                              <div className="flex items-center gap-2 mt-1 text-[11px] text-[#78716C]">
                                <span className="font-bengali-sans font-medium text-[#1C1917]">
                                  বাংলা: {day.titleBengali}
                                </span>
                                <span>·</span>
                                <span className="font-mono">{day.date}</span>
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Quick Add Ritual in English Box */}
                        <div className="p-3 rounded-lg bg-[#F5F1E8] border border-[#E7E2D6] space-y-2">
                          <span className="text-[11px] font-bold uppercase tracking-wider text-[#991B1B] font-mono flex items-center gap-1.5">
                            <Plus className="w-3.5 h-3.5" />
                            <span>Quick Add Ritual (Type in English)</span>
                          </span>
                          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
                            <input
                              type="text"
                              value={newRitualTimeEn[day.id] || ''}
                              onChange={(e) =>
                                setNewRitualTimeEn((prev) => ({ ...prev, [day.id]: e.target.value }))
                              }
                              placeholder="Time (e.g. 6:30 AM)"
                              className="sm:w-28 px-2 py-1.5 text-xs font-mono font-bold text-[#B91C1C] rounded border border-[#D6CEBE] bg-white"
                            />
                            <input
                              type="text"
                              value={newRitualTitleEn[day.id] || ''}
                              onChange={(e) =>
                                setNewRitualTitleEn((prev) => ({ ...prev, [day.id]: e.target.value }))
                              }
                              onKeyDown={(e) => {
                                if (e.key === 'Enter') {
                                  e.preventDefault();
                                  handleAddRitualWithTranslation(day.id);
                                }
                              }}
                              placeholder="e.g. Morning Pushpanjali & Sandhi Aarti"
                              className="flex-1 px-3 py-1.5 text-xs rounded border border-[#D6CEBE] bg-white focus:outline-hidden focus:border-[#991B1B]"
                            />
                            <button
                              type="button"
                              disabled={isTranslatingDay[day.id]}
                              onClick={() => handleAddRitualWithTranslation(day.id)}
                              className="flex items-center justify-center gap-1.5 px-3.5 py-1.5 bg-[#991B1B] hover:bg-[#7F1D1D] text-white text-xs font-semibold rounded shadow-2xs transition-colors shrink-0 disabled:opacity-50 cursor-pointer"
                            >
                              <Sparkles className="w-3.5 h-3.5" />
                              <span>{isTranslatingDay[day.id] ? 'Translating...' : 'Add Ritual'}</span>
                            </button>
                          </div>
                          <p className="text-[10px] text-[#78716C]">
                            ✨ Tip: Misspellings like &quot;anjali&quot;, &quot;arti&quot;, or &quot;visarjan&quot; are automatically corrected and translated to authentic Bengali &amp; Hindi.
                          </p>
                        </div>

                        {/* Existing Rituals List */}
                        <div className="space-y-2.5">
                          {day.rituals.map((r, rIdx) => (
                            <div
                              key={r.id}
                              className="flex flex-col gap-2 p-2.5 rounded-lg bg-white border border-[#E7E2D6] shadow-2xs"
                            >
                              <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                                <div className="flex items-center gap-2">
                                  <input
                                    type="text"
                                    value={r.time}
                                    onChange={(e) => {
                                      const updated = [...scheduleDays];
                                      updated[dIdx].rituals[rIdx].time = e.target.value;
                                      onUpdateSchedule(updated);
                                    }}
                                    className="w-24 px-2 py-1 text-xs font-mono font-bold text-[#B91C1C] rounded border border-[#D6CEBE] bg-[#FBF9F5]"
                                    placeholder="Time"
                                  />
                                  <button
                                    type="button"
                                    onClick={() => handleRemoveRitual(day.id, r.id)}
                                    className="sm:hidden p-1.5 text-[#78716C] hover:text-rose-600 transition-colors ml-auto"
                                    title="Remove ritual"
                                    aria-label="Remove ritual"
                                  >
                                    <Trash2 className="w-4 h-4" />
                                  </button>
                                </div>

                                <div className="flex-1 flex items-center gap-1.5 min-w-0">
                                  <input
                                    type="text"
                                    value={r.titleEnglish}
                                    onChange={(e) => {
                                      const updated = [...scheduleDays];
                                      updated[dIdx].rituals[rIdx].titleEnglish = e.target.value;
                                      onUpdateSchedule(updated);
                                    }}
                                    onBlur={(e) => {
                                      const corrected = spellCheckEnglish(e.target.value);
                                      if (corrected !== e.target.value) {
                                        const updated = [...scheduleDays];
                                        updated[dIdx].rituals[rIdx].titleEnglish = corrected;
                                        onUpdateSchedule(updated);
                                      }
                                    }}
                                    className="flex-1 min-w-0 px-2.5 py-1 text-xs rounded border border-[#D6CEBE] bg-[#FBF9F5] focus:outline-hidden focus:border-[#991B1B]"
                                    placeholder="Ritual Name in English"
                                  />
                                  <button
                                    type="button"
                                    onClick={() => handleAutoTranslateRitual(day.id, r.id, r.titleEnglish)}
                                    className="p-1.5 rounded bg-[#FEF3C7] text-[#92400E] hover:bg-[#FDE68A] transition-colors shrink-0"
                                    title="Spell check & re-translate to Bengali and Hindi"
                                    aria-label="Auto translate ritual"
                                  >
                                    <Wand2 className="w-3.5 h-3.5" />
                                  </button>
                                </div>

                                <button
                                  type="button"
                                  onClick={() => handleRemoveRitual(day.id, r.id)}
                                  className="hidden sm:inline-flex p-1.5 text-[#78716C] hover:text-rose-600 transition-colors shrink-0"
                                  title="Remove ritual"
                                  aria-label="Remove ritual"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </div>

                              {/* Multilingual Translation Chips */}
                              <div className="flex flex-wrap items-center gap-2 pt-1 border-t border-[#F2EEE4] text-[11px]">
                                <span className="font-bengali-sans text-[#1C1917] bg-[#F4EFE6] px-2 py-0.5 rounded border border-[#E7E2D6]">
                                  বাংলা: <strong>{r.titleBengali}</strong>
                                </span>
                                <span className="text-[#57534E] bg-[#F4EFE6] px-2 py-0.5 rounded border border-[#E7E2D6]">
                                  हिंदी: <strong>{r.titleHindi}</strong>
                                </span>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* TAB 2: GALLERY */}
              {activeTab === 'gallery' && (
                <div className="space-y-5 sm:space-y-6">
                  <div className="pb-3 border-b border-[#E7E2D6]">
                    <h3 className="font-bengali-serif text-lg sm:text-xl font-bold text-[#1C1917]">
                      Gallery Management &amp; Photo Uploads
                    </h3>
                    <p className="text-xs text-[#78716C]">
                      Upload photos from your device or add image URLs to display in the continuous reel
                    </p>
                  </div>

                  <div className={`${CARD} space-y-4`}>
                    <h4 className="text-xs font-bold uppercase tracking-wider text-[#991B1B] font-mono">
                      Upload New Photo to Stream
                    </h4>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="min-w-0">
                        <label className={LABEL}>Select Image File</label>
                        <input type="file" accept="image/*" onChange={handleFileUpload} className={FILE_INPUT} />
                      </div>

                      <div className="min-w-0">
                        <label className={LABEL}>Or Enter Image URL</label>
                        <input
                          type="text"
                          value={newPhotoUrl.startsWith('data:') ? '' : newPhotoUrl}
                          onChange={(e) => setNewPhotoUrl(e.target.value)}
                          placeholder="https://..."
                          className={INPUT}
                        />
                      </div>
                    </div>

                    {newPhotoUrl && (
                      <img
                        src={newPhotoUrl}
                        alt="Upload preview"
                        className="w-full max-w-xs h-32 sm:h-40 object-cover rounded border border-[#D6CEBE]"
                      />
                    )}

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                      <div className="min-w-0">
                        <label className={LABEL}>Photo Title (English)</label>
                        <input
                          type="text"
                          value={newPhotoTitle}
                          onChange={(e) => setNewPhotoTitle(e.target.value)}
                          onBlur={(e) => {
                            const fixed = spellCheckEnglish(e.target.value);
                            if (fixed && fixed !== e.target.value) setNewPhotoTitle(fixed);
                          }}
                          placeholder="e.g. Maha Ashtami pushpanjali gathering"
                          className={INPUT}
                        />
                      </div>

                      <div className="min-w-0">
                        <label className={LABEL}>Category</label>
                        <select
                          value={newPhotoCategory}
                          onChange={(e) =>
                            setNewPhotoCategory(e.target.value as 'culture' | 'rituals' | 'pandal' | 'art')
                          }
                          className={INPUT}
                        >
                          <option value="culture">Culture (লোক সংস্কৃতি / परंपरा)</option>
                          <option value="rituals">Rituals (পুণ্য আচার / अनुष्ठान)</option>
                          <option value="pandal">Pandal &amp; Idol (প্রতিমা ও মণ্ডপ)</option>
                          <option value="art">Art &amp; Alpona (শিল্প ও কারুকার্য)</option>
                        </select>
                      </div>

                      <div className="min-w-0 sm:col-span-2 lg:col-span-1">
                        <label className={LABEL}>Short Caption (English)</label>
                        <input
                          type="text"
                          value={newPhotoCaption}
                          onChange={(e) => setNewPhotoCaption(e.target.value)}
                          onBlur={(e) => {
                            const fixed = spellCheckEnglish(e.target.value);
                            if (fixed && fixed !== e.target.value) setNewPhotoCaption(fixed);
                          }}
                          placeholder="e.g. Devotees offering lotus flowers at dawn"
                          className={INPUT}
                        />
                      </div>
                    </div>

                    {/* Multilingual Translation Preview */}
                    {galleryPreviewBn && (
                      <div className="p-2.5 rounded bg-[#FEF3C7] border border-[#FDE68A] text-xs space-y-1">
                        <div className="font-semibold text-[#92400E] flex items-center gap-1.5">
                          <Sparkles className="w-3.5 h-3.5" />
                          <span>Generated Multilingual Translations:</span>
                        </div>
                        <div className="text-[#1C1917] font-bengali-sans">
                          বাংলা: <strong>{galleryPreviewBn.title}</strong> — {galleryPreviewBn.caption}
                        </div>
                        <div className="text-[#57534E]">
                          हिंदी: {galleryPreviewBn.hindi}
                        </div>
                      </div>
                    )}

                    <div className="flex flex-col sm:flex-row items-center gap-2">
                      <button
                        type="button"
                        onClick={handlePreviewGalleryTranslation}
                        className="flex items-center justify-center gap-1.5 w-full sm:w-auto px-3.5 py-2 bg-[#FEF3C7] hover:bg-[#FDE68A] text-[#92400E] text-xs font-semibold rounded-md border border-[#FDE68A] transition-colors"
                      >
                        <Wand2 className="w-3.5 h-3.5" />
                        <span>✨ Spell Check &amp; Translate Preview</span>
                      </button>

                      <button onClick={handleAddPhoto} className={PRIMARY_BTN}>
                        <Upload className="w-3.5 h-3.5" />
                        <span>Upload &amp; Add with Translations</span>
                      </button>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-[#78716C] font-mono">
                      Current Photos in Continuous Reel ({galleryPhotos.length})
                    </h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3 sm:gap-4">
                      {galleryPhotos.map((photo) => (
                        <div
                          key={photo.id}
                          className="bg-white p-3 rounded-lg border border-[#E7E2D6] flex gap-3 items-center min-w-0"
                        >
                          <img
                            src={photo.imageUrl}
                            alt={photo.title}
                            className="w-16 h-12 shrink-0 object-cover rounded border border-[#D6CEBE]"
                            referrerPolicy="no-referrer"
                          />
                          <div className="flex-1 min-w-0">
                            <h5 className="text-xs font-bold text-[#1C1917] truncate">{photo.title}</h5>
                            <span className="text-[10px] text-[#78716C] uppercase font-mono">
                              {photo.category}
                            </span>
                          </div>
                          <button
                            onClick={() => handleRemovePhoto(photo.id)}
                            className="p-2 text-[#78716C] hover:text-rose-600 transition-colors shrink-0"
                            title="Delete photo"
                            aria-label="Delete photo"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* TAB: INQUIRIES & EMAIL DELIVERY LOGS */}
              {activeTab === 'inquiries' && (
                <div className="space-y-6">
                  <div className="pb-3 border-b border-[#E7E2D6] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div>
                      <h3 className="font-bengali-serif text-lg sm:text-xl font-bold text-[#1C1917] flex items-center gap-2">
                        <Mail className="w-5 h-5 text-[#991B1B]" />
                        <span>Write to Us Messages &amp; Mail Logs</span>
                      </h3>
                      <p className="text-xs text-[#78716C] mt-0.5">
                        Real-time visitor inquiries submitted from the website footer contact form
                      </p>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-[#991B1B]/10 text-[#991B1B] font-mono">
                        {inquiries.length} {inquiries.length === 1 ? 'Message' : 'Messages'}
                      </span>
                    </div>
                  </div>

                  {/* Automated Email Delivery (EmailJS) Configuration Card */}
                  <div className="bg-white p-4 sm:p-5 rounded-xl border border-[#E7E2D6] shadow-2xs space-y-4">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#F2EEE4] pb-3">
                      <div>
                        <h4 className="text-xs font-bold uppercase tracking-wider text-[#1C1917] font-mono flex items-center gap-2">
                          <Send className="w-3.5 h-3.5 text-[#991B1B]" />
                          <span>Automated Email Dispatch (EmailJS)</span>
                        </h4>
                        <p className="text-[11px] text-[#78716C] mt-0.5">
                          Dispatches incoming form messages straight to <strong>{AUTHORIZED_ADMIN_EMAIL}</strong>
                        </p>
                      </div>

                      <span
                        className={`text-[10px] font-semibold px-2 py-0.5 rounded-full uppercase tracking-wider font-mono self-start sm:self-auto ${
                          emailJsConfig.serviceId && emailJsConfig.templateId && emailJsConfig.publicKey
                            ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                            : 'bg-amber-100 text-amber-800 border border-amber-300'
                        }`}
                      >
                        {emailJsConfig.serviceId && emailJsConfig.templateId && emailJsConfig.publicKey
                          ? 'Active & Ready'
                          : 'Pending API Setup'}
                      </span>
                    </div>

                    <form onSubmit={handleSaveEmailJsSettings} className="space-y-3">
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                        <div>
                          <label className="block text-[11px] font-semibold uppercase text-[#57534E] mb-1 font-mono">
                            Service ID
                          </label>
                          <input
                            type="text"
                            value={emailJsConfig.serviceId}
                            onChange={(e) => setEmailJsConfig({ ...emailJsConfig, serviceId: e.target.value })}
                            placeholder="e.g. service_xxxx"
                            className={INPUT}
                          />
                        </div>
                        <div>
                          <label className="block text-[11px] font-semibold uppercase text-[#57534E] mb-1 font-mono">
                            Template ID
                          </label>
                          <input
                            type="text"
                            value={emailJsConfig.templateId}
                            onChange={(e) => setEmailJsConfig({ ...emailJsConfig, templateId: e.target.value })}
                            placeholder="e.g. template_xxxx"
                            className={INPUT}
                          />
                        </div>
                        <div>
                          <label className="block text-[11px] font-semibold uppercase text-[#57534E] mb-1 font-mono">
                            Public Key
                          </label>
                          <input
                            type="text"
                            value={emailJsConfig.publicKey}
                            onChange={(e) => setEmailJsConfig({ ...emailJsConfig, publicKey: e.target.value })}
                            placeholder="e.g. user_xxxx or public_key"
                            className={INPUT}
                          />
                        </div>
                      </div>

                      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pt-1">
                        <div className="text-[11px] text-[#78716C] leading-relaxed">
                          <span>Target recipient: </span>
                          <span className="font-mono font-medium text-[#1C1917] bg-stone-100 px-1.5 py-0.5 rounded">
                            {AUTHORIZED_ADMIN_EMAIL}
                          </span>
                        </div>

                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            disabled={isSendingTestMail}
                            onClick={handleSendTestEmail}
                            className="px-3 py-1.5 text-xs font-semibold rounded border border-[#D6CEBE] bg-[#FBF9F5] hover:bg-white text-[#44403C] transition-colors cursor-pointer disabled:opacity-50"
                          >
                            {isSendingTestMail ? 'Sending Test...' : 'Send Test Mail'}
                          </button>
                          <button
                            type="submit"
                            className="px-3.5 py-1.5 text-xs font-semibold rounded bg-[#991B1B] hover:bg-[#7F1D1D] text-white shadow-2xs transition-colors cursor-pointer"
                          >
                            Save Email Settings
                          </button>
                        </div>
                      </div>

                      {emailJsStatusMsg && (
                        <div className="p-2.5 rounded bg-amber-50 border border-amber-200 text-xs text-amber-900 flex items-center gap-2">
                          <AlertCircle className="w-4 h-4 text-amber-700 shrink-0" />
                          <span>{emailJsStatusMsg}</span>
                        </div>
                      )}
                    </form>
                  </div>

                  {/* Messages Feed */}
                  <div className="space-y-3">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <h4 className="text-xs font-bold uppercase tracking-wider text-[#57534E] font-mono">
                        Incoming Inquiries &amp; Messages
                      </h4>

                      <div className="relative w-full sm:w-64">
                        <Search className="w-3.5 h-3.5 text-[#A8A29E] absolute left-2.5 top-1/2 -translate-y-1/2" />
                        <input
                          type="text"
                          value={inquirySearch}
                          onChange={(e) => setInquirySearch(e.target.value)}
                          placeholder="Search sender, subject..."
                          className="w-full pl-8 pr-3 py-1.5 text-xs rounded border border-[#D6CEBE] bg-white focus:outline-hidden focus:border-[#991B1B]"
                        />
                      </div>
                    </div>

                    {inquiries.length === 0 ? (
                      <div className="p-8 text-center bg-white rounded-xl border border-[#E7E2D6] space-y-2">
                        <div className="w-10 h-10 rounded-full bg-[#F5F2EB] text-[#78716C] flex items-center justify-center mx-auto">
                          <Mail className="w-5 h-5" />
                        </div>
                        <h5 className="font-semibold text-sm text-[#1C1917]">No inquiries received yet</h5>
                        <p className="text-xs text-[#78716C] max-w-sm mx-auto">
                          Messages submitted via the &quot;Write to Us&quot; button in the website footer will automatically appear here in real time.
                        </p>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {inquiries
                          .filter((i) =>
                            (i.name + i.email + (i.subject || '') + i.message)
                              .toLowerCase()
                              .includes(inquirySearch.toLowerCase())
                          )
                          .map((inq) => (
                            <div
                              key={inq.id}
                              className="bg-white p-4 sm:p-5 rounded-xl border border-[#E7E2D6] shadow-2xs space-y-3 hover:border-[#D6CEBE] transition-colors"
                            >
                              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#F4EFE6] pb-2.5">
                                <div className="flex items-center gap-2 flex-wrap">
                                  <span className="font-bold text-sm text-[#1C1917]">{inq.name}</span>
                                  <a
                                    href={`mailto:${inq.email}`}
                                    className="text-xs text-[#991B1B] hover:underline font-mono"
                                  >
                                    &lt;{inq.email}&gt;
                                  </a>
                                  {inq.phone && (
                                    <span className="text-xs text-[#78716C] font-mono">
                                      · 📞 {inq.phone}
                                    </span>
                                  )}
                                </div>

                                <div className="flex items-center gap-2">
                                  {inq.subject && (
                                    <span className="px-2 py-0.5 rounded bg-[#FEF3C7] text-[#92400E] border border-[#FDE68A] text-[10px] font-semibold uppercase tracking-wider font-mono">
                                      {inq.subject}
                                    </span>
                                  )}
                                  <span className="text-[11px] text-[#A8A29E] font-mono">
                                    {new Date(inq.createdAt).toLocaleString('en-IN', {
                                      month: 'short',
                                      day: 'numeric',
                                      hour: '2-digit',
                                      minute: '2-digit',
                                    })}
                                  </span>
                                </div>
                              </div>

                              <div className="p-3 rounded-lg bg-[#FAF8F5] border border-[#EFECE4] text-xs text-[#292524] leading-relaxed whitespace-pre-wrap font-sans">
                                {inq.message}
                              </div>

                              <div className="flex items-center justify-between pt-1">
                                <span className="text-[10px] text-[#78716C] font-mono">
                                  ID: {inq.id}
                                </span>

                                <div className="flex items-center gap-2 flex-wrap">
                                  <button
                                    type="button"
                                    onClick={async () => {
                                      const res = await dispatchEmailViaEmailJs(inq);
                                      if (res.sent) {
                                        triggerSaveNotification(`Email dispatched to ${AUTHORIZED_ADMIN_EMAIL}!`);
                                      } else {
                                        alert(`Could not dispatch email: ${res.reason}`);
                                      }
                                    }}
                                    className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-semibold rounded shadow-2xs transition-colors cursor-pointer"
                                    title="Dispatch this message directly to your inbox via EmailJS"
                                  >
                                    <Send className="w-3 h-3" />
                                    <span>Send to My Inbox</span>
                                  </button>

                                  <a
                                    href={`mailto:${inq.email}?subject=${encodeURIComponent(
                                      'Re: ' + (inq.subject || 'Agamani Durga Puja Muradnagar')
                                    )}&body=${encodeURIComponent(
                                      `Dear ${inq.name},\n\nThank you for reaching out to the Shree Shree Durga Puja Committee, Muradnagar regarding: "${inq.subject || 'Inquiry'}".\n\n`
                                    )}`}
                                    className="inline-flex items-center gap-1.5 px-3 py-1 bg-[#991B1B] hover:bg-[#7F1D1D] text-white text-xs font-semibold rounded shadow-2xs transition-colors"
                                  >
                                    <Mail className="w-3 h-3" />
                                    <span>Reply via Email</span>
                                  </a>

                                  <button
                                    type="button"
                                    onClick={async () => {
                                      if (confirm(`Delete message from ${inq.name}?`)) {
                                        await deleteInquiryFromDb(inq.id);
                                        triggerSaveNotification('Message deleted');
                                      }
                                    }}
                                    className="p-1.5 rounded hover:bg-rose-50 text-[#78716C] hover:text-rose-600 transition-colors"
                                    title="Delete inquiry"
                                  >
                                    <Trash2 className="w-4 h-4" />
                                  </button>
                                </div>
                              </div>
                            </div>
                          ))}
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* TAB 3: SOCIAL */}
              {activeTab === 'social' && (
                <div className="space-y-5 sm:space-y-6">
                  <div className="pb-3 border-b border-[#E7E2D6]">
                    <h3 className="font-bengali-serif text-lg sm:text-xl font-bold text-[#1C1917]">
                      Social Media Management
                    </h3>
                    <p className="text-xs text-[#78716C]">
                      Publish YouTube video broadcasts, Instagram photos, and Facebook announcements
                    </p>
                  </div>

                  <div className={`${CARD} space-y-4`}>
                    <h4 className="text-xs font-bold uppercase tracking-wider text-[#991B1B] font-mono">
                      Add New Post / Broadcast
                    </h4>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <div className="min-w-0">
                        <label className={LABEL}>Platform</label>
                        <select
                          value={newPostPlatform}
                          onChange={(e) =>
                            setNewPostPlatform(e.target.value as 'youtube' | 'instagram' | 'facebook')
                          }
                          className={INPUT}
                        >
                          <option value="youtube">YouTube (Video / Live)</option>
                          <option value="instagram">Instagram (Reel / Photo)</option>
                          <option value="facebook">Facebook (Update / Notice)</option>
                        </select>
                      </div>

                      <div className="min-w-0 sm:col-span-2">
                        <label className={LABEL}>Post Title</label>
                        <input
                          type="text"
                          value={newPostTitle}
                          onChange={(e) => setNewPostTitle(e.target.value)}
                          placeholder="e.g. Maha Ashtami Aarti Live broadcast"
                          className={INPUT}
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <div className="min-w-0">
                        <label className={LABEL}>Caption / Text</label>
                        <textarea
                          rows={2}
                          value={newPostCaption}
                          onChange={(e) => setNewPostCaption(e.target.value)}
                          placeholder="Devotees gathering for anjali..."
                          className={INPUT}
                        />
                      </div>

                      <div className="min-w-0">
                        <label className={LABEL}>Post Link / URL</label>
                        <input
                          type="text"
                          value={newPostUrl}
                          onChange={(e) => setNewPostUrl(e.target.value)}
                          placeholder="https://youtube.com/watch?v=..."
                          className={INPUT}
                        />
                      </div>
                    </div>

                    <button onClick={handleAddSocialPost} className={PRIMARY_BTN}>
                      <Plus className="w-3.5 h-3.5" />
                      <span>Publish Social Post</span>
                    </button>
                  </div>

                  <div className="space-y-3">
                    {socialPosts.map((post) => (
                      <div
                        key={post.id}
                        className="bg-white p-3 sm:p-4 rounded-lg border border-[#E7E2D6] flex items-center justify-between gap-3"
                      >
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-[11px] font-bold uppercase font-mono text-[#991B1B]">
                              {post.platform}
                            </span>
                            <span className="text-xs text-[#78716C]">· {post.date}</span>
                          </div>
                          <h4 className="text-sm font-semibold text-[#1C1917] truncate">{post.title}</h4>
                          <p className="text-xs text-[#57534E] line-clamp-1">{post.caption}</p>
                        </div>
                        <button
                          onClick={() => handleRemoveSocialPost(post.id)}
                          className="p-2 text-[#78716C] hover:text-rose-600 transition-colors shrink-0"
                          title="Delete post"
                          aria-label="Delete post"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}


              

          {/* TAB 4: STORIES */}
{activeTab === 'stories' && (
  <div className="space-y-5 sm:space-y-6">
    <div className="pb-3 border-b border-[#E7E2D6]">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div>
          <h3 className="font-bengali-serif text-lg sm:text-xl font-bold text-[#1C1917]">
            Cultural Stories &amp; Articles
          </h3>
          <p className="text-xs text-[#78716C]">
            Edit titles, reading times and pull quotes. English input is translated to Bengali &amp; Hindi
          </p>
        </div>
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200 text-[11px] font-medium self-start sm:self-auto">
          <Sparkles className="w-3 h-3 text-emerald-600" />
          <span>English Input ➔ বাংলা + हिंदी</span>
        </span>
      </div>
    </div>

    {stories.length === 0 && (
      <div className="p-8 text-center bg-white rounded-xl border border-[#E7E2D6] text-xs text-[#78716C]">
        No stories found. Use &quot;Reset All to Defaults&quot; to restore the default stories.
      </div>
    )}

    <div className="space-y-5 sm:space-y-6">
      {stories.map((story, sIdx) => (
        <div key={story.id} className={`${CARD} space-y-3`}>
          <div className="flex items-center justify-between gap-2 border-b border-[#F2EEE4] pb-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-[#991B1B] font-mono">
              Story {sIdx + 1}
            </span>
            <span className="text-[11px] text-[#78716C] font-mono truncate">
              {story.categoryEnglish}
            </span>
          </div>

          {/* Story image: preview, upload or URL */}
          <div className="flex flex-col sm:flex-row gap-3 items-start">
            {story.image ? (
              <img
                src={story.image}
                alt={story.titleEnglish}
                className="w-full sm:w-40 h-28 shrink-0 object-cover rounded border border-[#D6CEBE]"
                referrerPolicy="no-referrer"
              />
            ) : (
              <div className="w-full sm:w-40 h-28 shrink-0 rounded border border-dashed border-[#D6CEBE] bg-[#F5F2EB] flex items-center justify-center text-[11px] text-[#78716C]">
                <ImageIcon className="w-4 h-4 mr-1.5" />
                <span>No image</span>
              </div>
            )}

            <div className="flex-1 min-w-0 w-full space-y-2">
              <div className="min-w-0">
                <label className={LABEL}>Upload Story Image</label>
                <input
                  type="file"
                  accept="image/*"
                  className={FILE_INPUT}
                  onChange={async (e) => {
                    const file = e.target.files?.[0];
                    if (!file) return;
                    const apply = (url: string) => {
                      const updated = [...stories];
                      updated[sIdx] = { ...story, image: url };
                      onUpdateStories(updated);
                    };
                    try {
                      const compressed = await compressImageFile(file, 1200, 900, 0.72);
                      apply(compressed);
                      triggerSaveNotification('Story image optimized & updated');
                    } catch {
                      readFileAsDataUrl(file, apply);
                    }
                  }}
                />
              </div>

              <div className="min-w-0">
                <label className={LABEL}>Or Enter Image URL</label>
                <input
                  type="text"
                  value={story.image && !story.image.startsWith('data:') ? story.image : ''}
                  onChange={(e) => {
                    const updated = [...stories];
                    updated[sIdx] = { ...story, image: e.target.value };
                    onUpdateStories(updated);
                  }}
                  placeholder="https://..."
                  className={INPUT}
                />
              </div>
            </div>
          </div>

          {/* English title + auto translate */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div className="min-w-0">
              <label className={LABEL}>English Title (Primary Input)</label>
              <div className="flex items-center gap-1.5">
                <input
                  type="text"
                  value={story.titleEnglish}
                  onChange={(e) => {
                    const updated = [...stories];
                    updated[sIdx] = { ...story, titleEnglish: e.target.value };
                    onUpdateStories(updated);
                  }}
                  onBlur={(e) => {
                    const fixed = spellCheckEnglish(e.target.value);
                    if (fixed && fixed !== e.target.value) {
                      const updated = [...stories];
                      updated[sIdx] = { ...story, titleEnglish: fixed };
                      onUpdateStories(updated);
                    }
                  }}
                  className={`${INPUT} font-bold`}
                  placeholder="e.g. The Clay Sculptors of Kumartuli"
                />
                <button
                  type="button"
                  onClick={async () => {
                    const { english, bengali, hindi } = await autoSynthesizeMultilingual(story.titleEnglish);
                    const updated = [...stories];
                    updated[sIdx] = {
                      ...story,
                      titleEnglish: english,
                      titleBengali: bengali || translateToBengali(english),
                      titleHindi: hindi || translateToHindi(english),
                    };
                    onUpdateStories(updated);
                    triggerSaveNotification('Story title translated to Bengali & Hindi');
                  }}
                  className="shrink-0 p-2 rounded bg-[#FEF3C7] text-[#92400E] hover:bg-[#FDE68A] transition-colors cursor-pointer"
                  title="Spell check and auto-translate story title"
                  aria-label="Auto translate story title"
                >
                  <Wand2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            <div className="min-w-0">
              <label className={LABEL}>Read Time</label>
              <input
                type="text"
                value={story.readTime || ''}
                onChange={(e) => {
                  const updated = [...stories];
                  updated[sIdx] = { ...story, readTime: e.target.value };
                  onUpdateStories(updated);
                }}
                className={INPUT}
                placeholder="e.g. 5 min read"
              />
            </div>
          </div>

          {/* Bengali + Hindi titles */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div className="min-w-0">
              <label className={LABEL}>Bengali Title (Auto-Generated / Editable)</label>
              <input
                type="text"
                value={story.titleBengali}
                onChange={(e) => {
                  const updated = [...stories];
                  updated[sIdx] = { ...story, titleBengali: e.target.value };
                  onUpdateStories(updated);
                }}
                className={`${INPUT} font-bengali-serif font-bold`}
              />
            </div>

            <div className="min-w-0">
              <label className={LABEL}>Hindi Title (Auto-Generated / Editable)</label>
              <input
                type="text"
                value={story.titleHindi}
                onChange={(e) => {
                  const updated = [...stories];
                  updated[sIdx] = { ...story, titleHindi: e.target.value };
                  onUpdateStories(updated);
                }}
                className={`${INPUT} font-bold`}
              />
            </div>
          </div>

          {/* Pull quote */}
          <div>
            <label className={LABEL}>Pull Quote (Editorial Highlight in English)</label>
            <input
              type="text"
              value={story.pullQuote || ''}
              onChange={(e) => {
                const updated = [...stories];
                updated[sIdx] = { ...story, pullQuote: e.target.value };
                onUpdateStories(updated);
              }}
              onBlur={(e) => {
                const fixed = spellCheckEnglish(e.target.value);
                if (fixed && fixed !== e.target.value) {
                  const updated = [...stories];
                  updated[sIdx] = { ...story, pullQuote: fixed };
                  onUpdateStories(updated);
                }
              }}
              placeholder="e.g. Generations of devotion transforming sacred clay into divine radiance..."
              className={`${INPUT} italic font-serif`}
            />
          </div>
        </div>
      ))}
    </div>
  </div>
)}
              {/* TAB 5: ORGANISERS */}
              {activeTab === 'organisers' && (
                <div className="space-y-5 sm:space-y-6">
                  <div className="pb-3 border-b border-[#E7E2D6]">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <div>
                        <h3 className="font-bengali-serif text-lg sm:text-xl font-bold text-[#1C1917]">
                          Puja Committee Organisers &amp; Artisans
                        </h3>
                        <p className="text-xs text-[#78716C]">
                          Add members in English; roles and bios are automatically translated to Bengali &amp; Hindi
                        </p>
                      </div>
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200 text-[11px] font-medium self-start sm:self-auto">
                        <Sparkles className="w-3 h-3 text-emerald-600" />
                        <span>English Input ➔ বাংলা + हिंदी</span>
                      </span>
                    </div>
                  </div>

                  <div className={`${CARD} space-y-4`}>
                    <h4 className="text-xs font-bold uppercase tracking-wider text-[#991B1B] font-mono">
                      Add New Committee Member / Artisan (English)
                    </h4>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div className="min-w-0">
                        <label className={LABEL}>Full Name (English)</label>
                        <input
                          type="text"
                          value={newOrgName}
                          onChange={(e) => setNewOrgName(e.target.value)}
                          onBlur={(e) => {
                            const fixed = spellCheckEnglish(e.target.value);
                            if (fixed && fixed !== e.target.value) setNewOrgName(fixed);
                          }}
                          placeholder="e.g. Amitabh Roy"
                          className={INPUT}
                        />
                      </div>

                      <div className="min-w-0">
                        <label className={LABEL}>Role / Designation (English)</label>
                        <input
                          type="text"
                          value={newOrgRole}
                          onChange={(e) => setNewOrgRole(e.target.value)}
                          onBlur={(e) => {
                            const fixed = spellCheckEnglish(e.target.value);
                            if (fixed && fixed !== e.target.value) setNewOrgRole(fixed);
                          }}
                          placeholder="e.g. Vice President / Master Sculptor / Treasurer"
                          className={INPUT}
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div className="min-w-0">
                        <label className={LABEL}>Short Bio (English)</label>
                        <textarea
                          rows={2}
                          value={newOrgBio}
                          onChange={(e) => setNewOrgBio(e.target.value)}
                          onBlur={(e) => {
                            const fixed = spellCheckEnglish(e.target.value);
                            if (fixed && fixed !== e.target.value) setNewOrgBio(fixed);
                          }}
                          placeholder="e.g. Dedicated committee officer managing cultural events and community prasad..."
                          className={INPUT}
                        />
                      </div>

                      <div className="min-w-0">
                        <label className={LABEL}>Upload Member Photo</label>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleOrgPhotoUpload}
                          className={FILE_INPUT}
                        />
                      </div>
                    </div>

                    {/* Multilingual preview chip */}
                    {orgPreview && (
                      <div className="p-2.5 rounded bg-[#FEF3C7] border border-[#FDE68A] text-xs space-y-1">
                        <div className="font-semibold text-[#92400E] flex items-center gap-1.5">
                          <Sparkles className="w-3.5 h-3.5" />
                          <span>Generated Translations for {orgPreview.name}:</span>
                        </div>
                        <div className="text-[#1C1917] font-bengali-sans">
                          বাংলা পদ: <strong>{orgPreview.roleBn}</strong> — {orgPreview.bioBn}
                        </div>
                        <div className="text-[#57534E]">
                          हिंदी पद: <strong>{orgPreview.roleHi}</strong> — {orgPreview.bioHi}
                        </div>
                      </div>
                    )}

                    <div className="flex flex-col sm:flex-row items-center gap-2">
                      <button
                        type="button"
                        onClick={handlePreviewOrganiserTranslation}
                        className="flex items-center justify-center gap-1.5 w-full sm:w-auto px-3.5 py-2 bg-[#FEF3C7] hover:bg-[#FDE68A] text-[#92400E] text-xs font-semibold rounded-md border border-[#FDE68A] transition-colors cursor-pointer"
                      >
                        <Wand2 className="w-3.5 h-3.5" />
                        <span>✨ Spell Check &amp; Translate Preview</span>
                      </button>

                      <button onClick={handleAddOrganiser} className={PRIMARY_BTN}>
                        <Plus className="w-3.5 h-3.5" />
                        <span>Add Member with Translations</span>
                      </button>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
                    {organisers.map((org) => (
                      <div
                        key={org.id}
                        className="bg-white p-3 sm:p-4 rounded-lg border border-[#E7E2D6] flex items-center gap-3 min-w-0"
                      >
                        {org.photoUrl ? (
                          <img
                            src={org.photoUrl}
                            alt={org.nameEnglish}
                            className="w-12 h-12 shrink-0 rounded-full object-cover border border-[#D6CEBE]"
                            referrerPolicy="no-referrer"
                          />
                        ) : (
                          <div className="w-12 h-12 shrink-0 rounded-full bg-[#B91C1C]/10 text-[#991B1B] border border-[#D6CEBE] flex items-center justify-center text-sm font-bold">
                            {initials(org.nameEnglish)}
                          </div>
                        )}
                        <div className="flex-1 min-w-0">
                          <h5 className="text-xs font-bold text-[#1C1917] truncate">{org.nameEnglish}</h5>
                          <span className="text-[11px] text-[#991B1B] font-mono block truncate">
                            {org.roleEnglish}
                          </span>
                        </div>
                        <button
                          onClick={() => handleRemoveOrganiser(org.id)}
                          className="p-2 text-[#78716C] hover:text-rose-600 transition-colors shrink-0"
                          title="Remove member"
                          aria-label="Remove member"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* TAB 6: SETTINGS */}
              {activeTab === 'settings' && (
                <div className="space-y-5 sm:space-y-6">
                  <div className="pb-3 border-b border-[#E7E2D6]">
                    <h3 className="font-bengali-serif text-lg sm:text-xl font-bold text-[#1C1917]">
                      Pandal Information &amp; Contact Details
                    </h3>
                    <p className="text-xs text-[#78716C]">
                      Edit official address, timings, hotline phone and emails displayed on the website
                    </p>
                  </div>

                  <div className={`${CARD} space-y-4`}>
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <label className="block text-xs font-semibold uppercase text-[#44403C] font-mono">
                          Pandal Name (English)
                        </label>
                        <button
                          type="button"
                          onClick={async () => {
                            const { english, bengali, hindi } = await autoSynthesizeMultilingual(pandalInfo.nameEnglish);
                            onUpdatePandalInfo({
                              ...pandalInfo,
                              nameEnglish: english,
                              nameBengali: bengali || translateToBengali(english),
                              nameHindi: hindi || translateToHindi(english),
                            });
                            triggerSaveNotification('Pandal name translated to Bengali & Hindi');
                          }}
                          className="flex items-center gap-1 text-[11px] text-[#991B1B] hover:underline"
                        >
                          <Wand2 className="w-3 h-3" />
                          <span>Auto-Translate to বাংলা &amp; हिंदी</span>
                        </button>
                      </div>
                      <input
                        type="text"
                        value={pandalInfo.nameEnglish}
                        onChange={(e) => onUpdatePandalInfo({ ...pandalInfo, nameEnglish: e.target.value })}
                        onBlur={(e) => {
                          const fixed = spellCheckEnglish(e.target.value);
                          if (fixed && fixed !== e.target.value) {
                            onUpdatePandalInfo({ ...pandalInfo, nameEnglish: fixed });
                          }
                        }}
                        className={INPUT}
                        placeholder="e.g. Shree Shree Durga Puja Committee Muradnagar"
                      />
                      <div className="flex flex-wrap gap-2 mt-1.5 text-[11px] text-[#78716C]">
                        <span className="font-bengali-sans bg-[#F4EFE6] px-2 py-0.5 rounded border border-[#E7E2D6]">
                          বাংলা: {pandalInfo.nameBengali}
                        </span>
                        <span className="bg-[#F4EFE6] px-2 py-0.5 rounded border border-[#E7E2D6]">
                          हिंदी: {pandalInfo.nameHindi}
                        </span>
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold uppercase text-[#44403C] mb-1 font-mono">
                        Address (English)
                      </label>
                      <textarea
                        rows={3}
                        value={pandalInfo.address}
                        onChange={(e) => onUpdatePandalInfo({ ...pandalInfo, address: e.target.value })}
                        onBlur={(e) => {
                          const fixed = spellCheckEnglish(e.target.value);
                          if (fixed && fixed !== e.target.value) {
                            onUpdatePandalInfo({ ...pandalInfo, address: fixed });
                          }
                        }}
                        placeholder="e.g. C-Block Community Park, Muradnagar, Ghaziabad, Uttar Pradesh"
                        className={INPUT}
                      />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div className="min-w-0">
                        <label className="block text-xs font-semibold uppercase text-[#44403C] mb-1 font-mono">
                          Contact Phone
                        </label>
                        <input
                          type="text"
                          value={pandalInfo.phone}
                          onChange={(e) => onUpdatePandalInfo({ ...pandalInfo, phone: e.target.value })}
                          className={INPUT}
                        />
                      </div>

                      <div className="min-w-0">
                        <label className="block text-xs font-semibold uppercase text-[#44403C] mb-1 font-mono">
                          Inquiry Email
                        </label>
                        <input
                          type="email"
                          value={pandalInfo.email}
                          onChange={(e) => onUpdatePandalInfo({ ...pandalInfo, email: e.target.value })}
                          className={INPUT}
                        />
                      </div>
                    </div>

                    <div className="pt-2">
                      <button
                        onClick={() => triggerSaveNotification('Pandal settings updated')}
                        className="flex items-center justify-center gap-1.5 w-full sm:w-auto px-4 py-2.5 sm:py-2 bg-[#15803D] hover:bg-[#166534] text-white text-xs font-semibold rounded-md shadow-xs transition-colors"
                      >
                        <Save className="w-3.5 h-3.5" />
                        <span>Save Settings</span>
                      </button>
                    </div>
                  </div>

                  {/* Security & Backend Admin Password Card */}
                  <div className={`${CARD} space-y-4 border-[#E5DECF]`}>
                    <div className="border-b border-[#F4EFE6] pb-3">
                      <h4 className="text-xs font-bold uppercase tracking-wider text-[#1C1917] font-mono flex items-center gap-2">
                        <Key className="w-3.5 h-3.5 text-[#991B1B]" />
                        <span>Admin Authentication &amp; Backend Password</span>
                      </h4>
                      <p className="text-[11px] text-[#78716C] mt-0.5">
                        Manage your password stored in Cloud Firestore backend (`system_auth` collection)
                      </p>
                    </div>

                    <div className="space-y-3">
                      <div>
                        <label className="block text-xs font-semibold uppercase text-[#44403C] mb-1 font-mono">
                          Authorized Admin Account
                        </label>
                        <input
                          type="text"
                          disabled
                          value={AUTHORIZED_ADMIN_EMAIL}
                          className="w-full px-3 py-1.5 text-xs rounded border border-[#D6CEBE] bg-[#EFECE4] text-[#78716C]"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-semibold uppercase text-[#44403C] mb-1 font-mono">
                          Set New Admin Password
                        </label>
                        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
                          <input
                            type="password"
                            value={newResetPassword}
                            onChange={(e) => setNewResetPassword(e.target.value)}
                            placeholder="Type new password here..."
                            className="flex-1 px-3 py-1.5 text-xs rounded border border-[#D6CEBE] bg-white focus:outline-hidden focus:border-[#991B1B]"
                          />
                          <button
                            type="button"
                            onClick={async () => {
                              if (!newResetPassword || newResetPassword.trim().length < 3) {
                                alert('Please enter at least 3 characters for the new password.');
                                return;
                              }
                              const res = await resetAdminPasswordInBackend(newResetPassword.trim());
                              if (res.success) {
                                triggerSaveNotification('Password updated in Cloud Firestore database!');
                                setNewResetPassword('');
                              } else {
                                alert('Error updating password: ' + res.message);
                              }
                            }}
                            className="px-4 py-1.5 bg-[#991B1B] hover:bg-[#7F1D1D] text-white text-xs font-semibold rounded shadow-2xs transition-colors shrink-0 cursor-pointer"
                          >
                            Update Password
                          </button>
                        </div>
                        <p className="text-[10px] text-[#78716C] mt-1">
                          🔒 Passwords are cryptographically hashed with SHA-256 and stored in the backend database. They are never hardcoded.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
