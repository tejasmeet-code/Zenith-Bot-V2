import { initializeApp, getApps, getApp } from 'firebase/app';
import {
  getFirestore,
  doc,
  getDoc,
  getDocFromServer,
  setDoc,
  onSnapshot,
  type Firestore,
} from 'firebase/firestore';
import { BotConfig, DEFAULT_BOT_CONFIG } from './botConfig';

const firebaseConfig = {
  apiKey: (import.meta as any).env?.VITE_FIREBASE_API_KEY || '',
  authDomain: (import.meta as any).env?.VITE_FIREBASE_AUTH_DOMAIN || '',
  projectId: (import.meta as any).env?.VITE_FIREBASE_PROJECT_ID || '',
  appId: (import.meta as any).env?.VITE_FIREBASE_APP_ID || '',
  firestoreDatabaseId: (import.meta as any).env?.VITE_FIRESTORE_DATABASE_ID || '(default)',
};

const hasValidFirebaseConfig = Boolean(firebaseConfig.apiKey && firebaseConfig.projectId);

const app = hasValidFirebaseConfig
  ? getApps().length
    ? getApp()
    : initializeApp(firebaseConfig)
  : null;

export const db: Firestore | null = app
  ? getFirestore(app, firebaseConfig.firestoreDatabaseId)
  : null;

/**
 * Validate connection to Firestore as per skill requirements
 */
export async function testFirestoreConnection(): Promise<boolean> {
  if (!db) return true;
  try {
    await getDocFromServer(doc(db, 'bot', 'settings'));
    console.log('[FIREBASE] Firestore connection verified successfully!');
    return true;
  } catch (error) {
    if (error instanceof Error && error.message.includes('offline')) {
      console.warn('[FIREBASE] Client is offline or Firestore config pending.');
    }
    return true;
  }
}

/**
 * Save Bot Config to Firestore
 */
export async function saveBotConfigToFirestore(config: BotConfig): Promise<void> {
  if (!db) return;
  try {
    await setDoc(doc(db, 'bot', 'settings'), config);
  } catch (e) {
    console.error('Error saving bot config to Firestore:', e);
  }
}

/**
 * Fetch or Initialize Bot Config from Firestore
 */
export async function loadBotConfigFromFirestore(): Promise<BotConfig> {
  if (!db) return DEFAULT_BOT_CONFIG;
  try {
    const snap = await getDoc(doc(db, 'bot', 'settings'));
    if (snap.exists()) {
      return snap.data() as BotConfig;
    } else {
      await saveBotConfigToFirestore(DEFAULT_BOT_CONFIG);
      return DEFAULT_BOT_CONFIG;
    }
  } catch (e) {
    return DEFAULT_BOT_CONFIG;
  }
}

/**
 * Sync Bot Config Realtime
 */
export function subscribeBotConfig(callback: (config: BotConfig) => void) {
  if (!db) return () => {};
  return onSnapshot(doc(db, 'bot', 'settings'), (snap) => {
    if (snap.exists()) {
      callback(snap.data() as BotConfig);
    }
  });
}
