import {
  collection,
  doc,
  setDoc,
  getDoc,
  deleteDoc,
  onSnapshot,
} from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../firebase';
import { GalleryPhoto, Organiser, PandalInfo } from '../types';
import emailjs from '@emailjs/browser';

export const subscribeGallery = (
  callback: (photos: GalleryPhoto[]) => void,
  onError?: (err: unknown) => void
) => {
  const collectionPath = 'gallery';
  return onSnapshot(
    collection(db, collectionPath),
    (snapshot) => {
      if (!snapshot.empty) {
        const photos: GalleryPhoto[] = [];
        snapshot.forEach((docSnap) => {
          photos.push(docSnap.data() as GalleryPhoto);
        });
        callback(photos);
      }
    },
    (error) => {
      console.warn('Firestore gallery snapshot listener note:', error);
      if (onError) onError(error);
      try {
        handleFirestoreError(error, OperationType.GET, collectionPath);
      } catch (err) {
        console.error(err);
      }
    }
  );
};

export const saveGalleryPhoto = async (photo: GalleryPhoto): Promise<void> => {
  const docPath = `gallery/${photo.id}`;
  try {
    await setDoc(doc(db, 'gallery', photo.id), photo);
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, docPath);
  }
};

export const deleteGalleryPhotoFromDb = async (photoId: string): Promise<void> => {
  const docPath = `gallery/${photoId}`;
  try {
    await deleteDoc(doc(db, 'gallery', photoId));
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, docPath);
  }
};

export const subscribePandalInfo = (
  callback: (info: PandalInfo) => void,
  onError?: (err: unknown) => void
) => {
  const docPath = 'pandal_info/default';
  return onSnapshot(
    doc(db, 'pandal_info', 'default'),
    (docSnap) => {
      if (docSnap.exists()) {
        callback(docSnap.data() as PandalInfo);
      }
    },
    (error) => {
      console.warn('Firestore pandal_info snapshot listener note:', error);
      if (onError) onError(error);
      try {
        handleFirestoreError(error, OperationType.GET, docPath);
      } catch (err) {
        console.error(err);
      }
    }
  );
};

export const savePandalInfoToDb = async (info: PandalInfo): Promise<void> => {
  const docPath = 'pandal_info/default';
  try {
    await setDoc(doc(db, 'pandal_info', 'default'), info);
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, docPath);
  }
};

const organiserFromFirestore = (data: Record<string, unknown>): Organiser =>
  ({
    ...data,
    id: data.id as string,
    nameEnglish: (data.nameEnglish || data.name || '') as string,
    roleEnglish: (data.roleEnglish || data.role || '') as string,
    bioEnglish: (data.bioEnglish || data.bio || '') as string,
    photoUrl: (data.photoUrl || data.photo || '') as string,
  }) as Organiser;

export const subscribeOrganisers = (callback: (organisers: Organiser[], fromCache: boolean) => void) =>
  onSnapshot(
    collection(db, 'organisers'),
    { includeMetadataChanges: true },
    (snapshot) => {
      callback(
        snapshot.docs.map((organiserDoc) => organiserFromFirestore(organiserDoc.data())),
        snapshot.metadata.fromCache
      );
    },
    (error) => {
      console.error('Firestore organisers snapshot error:', error);
    }
  );

export const saveOrganiserToDb = async (organiser: Organiser): Promise<void> => {
  const { photoUrl, ...organiserFields } = organiser;
  const firestoreOrganiser = {
    ...organiserFields,
    name: organiser.nameEnglish,
    role: organiser.roleEnglish,
    bio: organiser.bioEnglish,
    photo: photoUrl,
  };
  try {
    await setDoc(doc(db, 'organisers', organiser.id), firestoreOrganiser);
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, `organisers/${organiser.id}`);
  }
};

export const deleteOrganiserFromDb = async (organiserId: string): Promise<void> => {
  try {
    await deleteDoc(doc(db, 'organisers', organiserId));
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, `organisers/${organiserId}`);
  }
};

export interface ContactInquiry {
  id: string;
  name: string;
  email: string;
  phone?: string;
  subject?: string;
  message: string;
  createdAt: string;
  status?: 'new' | 'reviewed';
}

export interface EmailJsConfig {
  serviceId: string;
  templateId: string;
  publicKey: string;
  targetEmail: string; // default nonchalantlycool0@gmail.com
}

export const subscribeInquiries = (
  callback: (inquiries: ContactInquiry[]) => void
) => {
  const collectionPath = 'inquiries';
  return onSnapshot(
    collection(db, collectionPath),
    (snapshot) => {
      const items: ContactInquiry[] = [];
      snapshot.forEach((docSnap) => {
        items.push(docSnap.data() as ContactInquiry);
      });
      // Sort newest first
      items.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      callback(items);
    },
    (err) => {
      console.warn('Inquiries snapshot listener note:', err);
    }
  );
};

export const submitContactInquiry = async (inquiry: ContactInquiry): Promise<void> => {
  const docPath = `inquiries/${inquiry.id}`;
  try {
    await setDoc(doc(db, 'inquiries', inquiry.id), {
      ...inquiry,
      status: 'new',
    });
  } catch (error) {
    console.warn('Inquiry Firestore save note:', error);
  }
};

export const deleteInquiryFromDb = async (inquiryId: string): Promise<void> => {
  try {
    await deleteDoc(doc(db, 'inquiries', inquiryId));
  } catch (err) {
    console.warn('Delete inquiry error:', err);
  }
};

export const getEmailJsConfig = async (): Promise<EmailJsConfig | null> => {
  try {
    const snap = await getDoc(doc(db, 'settings', 'emailjs'));
    if (snap.exists()) {
      return snap.data() as EmailJsConfig;
    }

    const cachedConfig = localStorage.getItem('agamani_emailjs_config');
    if (cachedConfig) {
      return JSON.parse(cachedConfig) as EmailJsConfig;
    }
    return null;
  } catch (err) {
    console.warn('Get EmailJS config note:', err);
    return null;
  }
};

export const saveEmailJsConfig = async (config: EmailJsConfig): Promise<void> => {
  try {
    await setDoc(doc(db, 'settings', 'emailjs'), config);
    localStorage.setItem('agamani_emailjs_config', JSON.stringify(config));
  } catch (err) {
    console.warn('Save EmailJS config note:', err);
    localStorage.setItem('agamani_emailjs_config', JSON.stringify(config));
  }
};

/**
 * Attempts to deliver email using EmailJS if configured.
 * Logs output thoroughly for troubleshooting.
 */
export const dispatchEmailViaEmailJs = async (
  inquiry: ContactInquiry
): Promise<{ sent: boolean; reason?: string }> => {
  const cfg = await getEmailJsConfig();
  if (!cfg || !cfg.serviceId || !cfg.templateId || !cfg.publicKey) {
    const msg =
      'EmailJS credentials (serviceId, templateId, publicKey) are not yet configured in Admin Portal. Inquiry is saved in Firestore database logs.';
    console.warn('[Write to Us Email Dispatch]:', msg);
    return { sent: false, reason: msg };
  }

  try {
    const targetEmail = cfg.targetEmail || 'nonchalantlycool0@gmail.com';
    const templateParams = {
      // Sender Details (all standard variable names used across EmailJS templates)
      from_name: inquiry.name,
      name: inquiry.name,
      user_name: inquiry.name,

      from_email: inquiry.email,
      reply_to: inquiry.email,
      user_email: inquiry.email,
      sender_email: inquiry.email,

      // Phone
      phone: inquiry.phone || 'Not provided',
      phone_number: inquiry.phone || 'Not provided',

      // Subject & Title
      subject: inquiry.subject || 'Durga Puja Inquiry',
      title: inquiry.subject || 'Durga Puja Inquiry',

      // Message Content
      message: inquiry.message,
      content: inquiry.message,
      message_html: inquiry.message,

      // Recipient target
      to_email: targetEmail,
      to_name: 'Agamani Puja Admin',
      recipient: targetEmail,
      email: inquiry.email,
      time: new Date(inquiry.createdAt).toLocaleString('en-IN'),

      // Date & Tracking
      date: new Date(inquiry.createdAt).toLocaleString('en-IN'),
      inquiry_id: inquiry.id,
    };

    console.log("EmailJS Configuration:", {
  serviceId: cfg.serviceId,
  templateId: cfg.templateId,
  publicKeyExists: !!cfg.publicKey,
  targetEmail: cfg.targetEmail,
});

const response = await emailjs.send(
  cfg.serviceId.trim(),
  cfg.templateId.trim(),
  templateParams,
  cfg.publicKey.trim()
);
    console.log('[Write to Us EmailJS Success]:', response.status, response.text);
    return { sent: true };
  } catch (err: any) {
    console.error('[Write to Us EmailJS Error]:', err);
    return { sent: false, reason: err?.text || err?.message || 'EmailJS delivery error' };
  }
};
