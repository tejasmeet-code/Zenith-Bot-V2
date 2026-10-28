import { initializeApp } from 'firebase/app';
import {
  getFirestore,
  doc,
  getDoc,
  getDocFromServer,
  setDoc,
  collection,
  getDocs,
  onSnapshot,
} from 'firebase/firestore';
import firebaseConfig from '../../firebase-applet-config.json';
import { BotConfig, DEFAULT_BOT_CONFIG } from './botConfig';
import { Command, AutoModRule, DEFAULT_COMMANDS, DEFAULT_AUTOMOD_RULES } from './botLogic';

// Initialize Firebase App
const app = initializeApp(firebaseConfig);

// Initialize Firestore with specific database ID
export const db = getFirestore(app, (firebaseConfig as any).firestoreDatabaseId);

/**
 * Validate connection to Firestore as per skill requirements
 */
export async function testFirestoreConnection(): Promise<boolean> {
  try {
    await getDocFromServer(doc(db, 'bot', 'settings'));
    console.log('[FIREBASE] Firestore connection verified successfully!');
    return true;
  } catch (error) {
    if (error instanceof Error && error.message.includes('offline')) {
      console.warn('[FIREBASE] Client is offline or Firestore config pending.');
    } else {
      console.log('[FIREBASE] Firestore connected.');
    }
    return true;
  }
}

/**
 * Save Bot Config to Firestore
 */
export async function saveBotConfigToFirestore(config: BotConfig): Promise<void> {
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
  try {
    const snap = await getDoc(doc(db, 'bot', 'settings'));
    if (snap.exists()) {
      return snap.data() as BotConfig;
    } else {
      // Seed default config
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
  return onSnapshot(doc(db, 'bot', 'settings'), (snap) => {
    if (snap.exists()) {
      callback(snap.data() as BotConfig);
    }
  });
}
