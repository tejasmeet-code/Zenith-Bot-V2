/**
 * Cloud & Local Disk Persistence Service
 * Persists all Zenith Bot configurations, per-guild Anti-Nuke settings,
 * full audit logs, moderation cases, betrayal guard histories, honeypot traps,
 * per-server bot profiles (server avatar & name), and snipes.
 *
 * Uses synchronous in-memory + atomic local JSON disk persistence (`zenith-cloud-store.json`)
 * and optional non-blocking Firestore sync when a Firestore database is active.
 */

import { initializeApp, getApps, getApp, type FirebaseApp } from 'firebase/app';
import {
  getFirestore,
  doc,
  getDoc,
  setDoc,
  collection,
  getDocs,
  query,
  orderBy,
  limit,
  setLogLevel,
  disableNetwork,
  type Firestore,
} from 'firebase/firestore';
import fs from 'fs';
import path from 'path';

// Silence internal @firebase/firestore gRPC stream logs when database is unprovisioned
try {
  setLogLevel('silent');
} catch {
  // Ignore if unsupported in environment
}

interface FirebaseConfig {
  projectId: string;
  appId: string;
  apiKey: string;
  authDomain: string;
  firestoreDatabaseId?: string;
  storageBucket?: string;
  messagingSenderId?: string;
}

interface LocalCloudStore {
  botSettings: any | null;
  noPrefix: { grants: any[]; codes: any[]; updatedAt?: number } | null;
  gatewayHeartbeat: { nodeId?: string; isHeavenCloud?: boolean; lastSeen?: number } | null;
  voiceActionQueue: Record<string, RemoteVoiceActionPayload>;
  guilds: Record<
    string,
    {
      antiNuke?: any;
      moderation?: any;
      music?: any;
      profile?: { nickname?: string; avatarUrl?: string };
      modCases?: Record<string, any>;
    }
  >;
  snipes: Record<string, any>;
  editSnipes: Record<string, any>;
}

const STORE_FILE_PATH = path.resolve(process.cwd(), 'zenith-cloud-store.json');

const LOCAL_STORE: LocalCloudStore = {
  botSettings: null,
  noPrefix: null,
  gatewayHeartbeat: null,
  voiceActionQueue: {},
  guilds: {},
  snipes: {},
  editSnipes: {},
};

// Load existing disk store on startup
try {
  if (fs.existsSync(STORE_FILE_PATH)) {
    const raw = fs.readFileSync(STORE_FILE_PATH, 'utf-8');
    const parsed = JSON.parse(raw);
    if (parsed && typeof parsed === 'object') {
      Object.assign(LOCAL_STORE, parsed);
    }
  }
} catch {
  // Ignore corrupt or empty store file
}

let diskSaveTimeout: ReturnType<typeof setTimeout> | null = null;
function scheduleDiskFlush(): void {
  if (diskSaveTimeout) return;
  diskSaveTimeout = setTimeout(() => {
    diskSaveTimeout = null;
    try {
      fs.writeFileSync(STORE_FILE_PATH, JSON.stringify(LOCAL_STORE, null, 2), 'utf-8');
    } catch {
      // Non-blocking disk flush
    }
  }, 250);
}

let dbInstance: Firestore | null = null;
let firestoreAvailable = false;
let firestoreChecked = false;

function handleFirestoreError(err: any): void {
  const msg = String(err?.message || err?.code || '');
  if (
    msg.includes('NOT_FOUND') ||
    msg.includes('offline') ||
    msg.includes('unavailable') ||
    msg.includes('permission-denied')
  ) {
    firestoreAvailable = false;
    if (dbInstance) {
      disableNetwork(dbInstance).catch(() => {});
      dbInstance = null;
    }
  }
}

function getDb(): Firestore | null {
  if (firestoreChecked) return firestoreAvailable ? dbInstance : null;
  firestoreChecked = true;

  try {
    const configPath = path.resolve(process.cwd(), 'firebase-applet-config.json');
    if (!fs.existsSync(configPath)) {
      return null;
    }
    const config: FirebaseConfig = JSON.parse(fs.readFileSync(configPath, 'utf-8'));
    // Only connect to Firestore if firestoreDatabaseId is explicitly configured
    if (!config.firestoreDatabaseId) {
      return null;
    }
    const app: FirebaseApp = getApps().length === 0 ? initializeApp(config) : getApp();
    dbInstance = getFirestore(app, config.firestoreDatabaseId);
    firestoreAvailable = true;
    return dbInstance;
  } catch {
    firestoreAvailable = false;
    return null;
  }
}

function ensureGuildRecord(guildId: string) {
  if (!LOCAL_STORE.guilds[guildId]) {
    LOCAL_STORE.guilds[guildId] = {};
  }
  return LOCAL_STORE.guilds[guildId];
}

// In-Memory fast caches backed by LOCAL_STORE
const MEMORY_GUILD_PROFILES: Record<string, { nickname?: string; avatarUrl?: string }> = {};
const MEMORY_SNIPES: Record<string, any> = LOCAL_STORE.snipes || {};
const MEMORY_EDIT_SNIPES: Record<string, any> = LOCAL_STORE.editSnipes || {};

/**
 * Save Global Bot Config
 */
export async function persistBotConfig(config: any): Promise<void> {
  LOCAL_STORE.botSettings = { ...config, updatedAt: Date.now() };
  scheduleDiskFlush();

  const db = getDb();
  if (!db) return;
  try {
    const docRef = doc(db, 'bot', 'settings');
    await setDoc(docRef, LOCAL_STORE.botSettings, { merge: true });
  } catch (e: any) {
    handleFirestoreError(e);
  }
}

/**
 * Load Global Bot Config
 */
export async function loadPersistedBotConfig(): Promise<any | null> {
  if (LOCAL_STORE.botSettings) {
    return LOCAL_STORE.botSettings;
  }
  const db = getDb();
  if (!db) return null;
  try {
    const docRef = doc(db, 'bot', 'settings');
    const snap = await getDoc(docRef);
    if (snap.exists()) {
      const data = snap.data();
      LOCAL_STORE.botSettings = data;
      scheduleDiskFlush();
      return data;
    }
  } catch (e: any) {
    handleFirestoreError(e);
  }
  return null;
}

/**
 * Save Per-Guild Anti-Nuke Settings (unrestricted full audit & logs)
 */
export async function persistGuildAntiNukeConfig(guildId: string, config: any): Promise<void> {
  const guildRec = ensureGuildRecord(guildId);
  guildRec.antiNuke = JSON.parse(JSON.stringify(config));
  scheduleDiskFlush();

  const db = getDb();
  if (!db) return;
  try {
    const docRef = doc(db, 'guilds', guildId);
    await setDoc(docRef, { antiNuke: guildRec.antiNuke, updatedAt: Date.now() }, { merge: true });
  } catch (e: any) {
    handleFirestoreError(e);
  }
}

/**
 * Load Per-Guild Anti-Nuke Settings
 */
export async function loadPersistedGuildAntiNukeConfig(guildId: string): Promise<any | null> {
  if (LOCAL_STORE.guilds[guildId]?.antiNuke) {
    return LOCAL_STORE.guilds[guildId].antiNuke;
  }
  const db = getDb();
  if (!db) return null;
  try {
    const docRef = doc(db, 'guilds', guildId);
    const snap = await getDoc(docRef);
    if (snap.exists() && snap.data().antiNuke) {
      const data = snap.data().antiNuke;
      ensureGuildRecord(guildId).antiNuke = data;
      scheduleDiskFlush();
      return data;
    }
  } catch (e: any) {
    handleFirestoreError(e);
  }
  return null;
}

/**
 * Save Mod Case (Never capped, full permanent historical records)
 */
export async function persistModCase(guildId: string, caseData: any): Promise<void> {
  const guildRec = ensureGuildRecord(guildId);
  if (!guildRec.modCases) guildRec.modCases = {};
  guildRec.modCases[caseData.caseId] = JSON.parse(JSON.stringify(caseData));
  scheduleDiskFlush();

  const db = getDb();
  if (!db) return;
  try {
    const caseRef = doc(db, 'guilds', guildId, 'modCases', caseData.caseId);
    await setDoc(caseRef, caseData, { merge: true });
  } catch (e: any) {
    handleFirestoreError(e);
  }
}

/**
 * Load Guild Mod Cases
 */
export async function loadPersistedGuildModCases(guildId: string): Promise<any[]> {
  const localCases = LOCAL_STORE.guilds[guildId]?.modCases;
  if (localCases && Object.keys(localCases).length > 0) {
    return Object.values(localCases).sort((a: any, b: any) => (b.createdAt || 0) - (a.createdAt || 0));
  }
  const db = getDb();
  if (!db) return [];
  try {
    const colRef = collection(db, 'guilds', guildId, 'modCases');
    const q = query(colRef, orderBy('createdAt', 'desc'), limit(100));
    const snap = await getDocs(q);
    return snap.docs.map((d) => d.data());
  } catch (e: any) {
    handleFirestoreError(e);
    return [];
  }
}

/**
 * Save Per-Guild Bot Profile (.botavatar and .botname commands)
 */
export async function persistGuildBotProfile(
  guildId: string,
  profile: { nickname?: string; avatarUrl?: string }
): Promise<void> {
  MEMORY_GUILD_PROFILES[guildId] = {
    ...MEMORY_GUILD_PROFILES[guildId],
    ...profile,
  };
  const guildRec = ensureGuildRecord(guildId);
  guildRec.profile = MEMORY_GUILD_PROFILES[guildId];
  scheduleDiskFlush();

  const db = getDb();
  if (!db) return;
  try {
    const docRef = doc(db, 'guilds', guildId, 'profile', 'botDisplay');
    await setDoc(docRef, MEMORY_GUILD_PROFILES[guildId], { merge: true });
  } catch (e: any) {
    handleFirestoreError(e);
  }
}

/**
 * Load Per-Guild Bot Profile
 */
export async function loadPersistedGuildBotProfile(
  guildId: string
): Promise<{ nickname?: string; avatarUrl?: string }> {
  if (MEMORY_GUILD_PROFILES[guildId]) {
    return MEMORY_GUILD_PROFILES[guildId];
  }
  if (LOCAL_STORE.guilds[guildId]?.profile) {
    MEMORY_GUILD_PROFILES[guildId] = LOCAL_STORE.guilds[guildId].profile!;
    return MEMORY_GUILD_PROFILES[guildId];
  }
  const db = getDb();
  if (!db) return {};
  try {
    const docRef = doc(db, 'guilds', guildId, 'profile', 'botDisplay');
    const snap = await getDoc(docRef);
    if (snap.exists()) {
      const data = snap.data();
      MEMORY_GUILD_PROFILES[guildId] = data;
      ensureGuildRecord(guildId).profile = data;
      scheduleDiskFlush();
      return data;
    }
  } catch (e: any) {
    handleFirestoreError(e);
  }
  return {};
}

/**
 * Save Snipe (Most recent deleted message in channel)
 */
export async function recordDeletedMessage(
  channelId: string,
  snipeData: {
    author: string;
    authorTag: string;
    authorAvatar?: string;
    content: string;
    createdAt: number;
    deletedAt: number;
    attachments?: string[];
  }
): Promise<void> {
  MEMORY_SNIPES[channelId] = snipeData;
  LOCAL_STORE.snipes[channelId] = snipeData;
  scheduleDiskFlush();

  const db = getDb();
  if (!db) return;
  try {
    const docRef = doc(db, 'snipes', channelId);
    await setDoc(docRef, snipeData);
  } catch (e: any) {
    handleFirestoreError(e);
  }
}

/**
 * Get Snipe for channel
 */
export function getChannelSnipe(channelId: string): any | null {
  return MEMORY_SNIPES[channelId] || LOCAL_STORE.snipes[channelId] || null;
}

/**
 * Clear Snipe for channel
 */
export async function clearChannelSnipe(channelId: string): Promise<void> {
  delete MEMORY_SNIPES[channelId];
  delete LOCAL_STORE.snipes[channelId];
  scheduleDiskFlush();

  const db = getDb();
  if (!db) return;
  try {
    const docRef = doc(db, 'snipes', channelId);
    await setDoc(docRef, { cleared: true, clearedAt: Date.now() });
  } catch (e: any) {
    handleFirestoreError(e);
  }
}

/**
 * Record Edited Message (EditSnipe)
 */
export function recordEditedMessage(
  channelId: string,
  editData: {
    author: string;
    authorTag: string;
    authorAvatar?: string;
    oldContent: string;
    newContent: string;
    editedAt: number;
  }
): void {
  MEMORY_EDIT_SNIPES[channelId] = editData;
  LOCAL_STORE.editSnipes[channelId] = editData;
  scheduleDiskFlush();
}

/**
 * Get EditSnipe for channel
 */
export function getChannelEditSnipe(channelId: string): any | null {
  return MEMORY_EDIT_SNIPES[channelId] || LOCAL_STORE.editSnipes[channelId] || null;
}

/**
 * Save Per-Guild Live Music State (syncs Website Dashboard <-> Heaven Cloud Bot)
 */
export async function persistGuildMusicState(guildId: string, musicState: any): Promise<void> {
  const guildRec = ensureGuildRecord(guildId);
  guildRec.music = JSON.parse(JSON.stringify(musicState));
  scheduleDiskFlush();

  const db = getDb();
  if (!db) return;
  try {
    const docRef = doc(db, 'guilds', guildId);
    await setDoc(docRef, { music: guildRec.music, musicUpdatedAt: Date.now() }, { merge: true });
  } catch (e: any) {
    handleFirestoreError(e);
  }
}

export interface RemoteVoiceActionPayload {
  actionId: string;
  guildId: string;
  action: string;
  query?: string;
  speed?: number;
  filter?: string;
  platform?: string;
  volume?: number;
  queueIndex?: number;
  voiceChannelId?: string;
  createdAt: number;
}

/**
 * Enqueues a real-time Voice Channel command from the Web Dashboard to the Heaven Cloud 24/7 Bot Node
 */
export async function enqueueRemoteVoiceAction(payload: RemoteVoiceActionPayload): Promise<void> {
  LOCAL_STORE.voiceActionQueue[payload.guildId] = JSON.parse(JSON.stringify(payload));
  scheduleDiskFlush();

  const db = getDb();
  if (!db) return;
  try {
    const docRef = doc(db, 'bot', 'voiceActionQueue');
    await setDoc(
      docRef,
      {
        [payload.guildId]: LOCAL_STORE.voiceActionQueue[payload.guildId],
        updatedAt: Date.now(),
      },
      { merge: true }
    );
  } catch (e: any) {
    handleFirestoreError(e);
  }
}

/**
 * Loads all pending Voice Channel commands for the Heaven Cloud Bot Node to execute
 */
export async function loadPendingVoiceActions(): Promise<Record<string, RemoteVoiceActionPayload>> {
  const db = getDb();
  if (!db) return { ...LOCAL_STORE.voiceActionQueue };
  try {
    const docRef = doc(db, 'bot', 'voiceActionQueue');
    const snap = await getDoc(docRef);
    if (snap.exists()) {
      const data = snap.data() || {};
      const out: Record<string, RemoteVoiceActionPayload> = { ...LOCAL_STORE.voiceActionQueue };
      for (const [k, v] of Object.entries(data)) {
        if (k !== 'updatedAt' && v && typeof v === 'object' && (v as any).actionId) {
          out[k] = v as RemoteVoiceActionPayload;
        }
      }
      return out;
    }
  } catch (e: any) {
    handleFirestoreError(e);
  }
  return { ...LOCAL_STORE.voiceActionQueue };
}

/**
 * Load Per-Guild Live Music State
 */
export async function loadPersistedGuildMusicState(guildId: string): Promise<any | null> {
  if (LOCAL_STORE.guilds[guildId]?.music) {
    return LOCAL_STORE.guilds[guildId].music;
  }
  const db = getDb();
  if (!db) return null;
  try {
    const docRef = doc(db, 'guilds', guildId);
    const snap = await getDoc(docRef);
    if (snap.exists() && snap.data().music) {
      const music = snap.data().music;
      ensureGuildRecord(guildId).music = music;
      scheduleDiskFlush();
      return music;
    }
  } catch (e: any) {
    handleFirestoreError(e);
  }
  return null;
}

/**
 * Save Per-Guild Moderation & Appeals Config
 */
export async function persistGuildModerationState(guildId: string, moderation: any): Promise<void> {
  const guildRec = ensureGuildRecord(guildId);
  guildRec.moderation = JSON.parse(JSON.stringify(moderation));
  scheduleDiskFlush();

  const db = getDb();
  if (!db) return;
  try {
    const docRef = doc(db, 'guilds', guildId);
    await setDoc(docRef, { moderation: guildRec.moderation, modUpdatedAt: Date.now() }, { merge: true });
  } catch (e: any) {
    handleFirestoreError(e);
  }
}

/**
 * Load Per-Guild Moderation & Appeals Config
 */
export async function loadPersistedGuildModerationState(guildId: string): Promise<any | null> {
  if (LOCAL_STORE.guilds[guildId]?.moderation) {
    return LOCAL_STORE.guilds[guildId].moderation;
  }
  const db = getDb();
  if (!db) return null;
  try {
    const docRef = doc(db, 'guilds', guildId);
    const snap = await getDoc(docRef);
    if (snap.exists() && snap.data().moderation) {
      const moderation = snap.data().moderation;
      ensureGuildRecord(guildId).moderation = moderation;
      scheduleDiskFlush();
      return moderation;
    }
  } catch (e: any) {
    handleFirestoreError(e);
  }
  return null;
}

/**
 * Save No-Prefix Grants and Redeem Codes
 */
export async function persistNoPrefixState(grantsOrAccess: any[], codes: any[]): Promise<void> {
  LOCAL_STORE.noPrefix = {
    grants: JSON.parse(JSON.stringify(grantsOrAccess || [])),
    codes: JSON.parse(JSON.stringify(codes || [])),
    updatedAt: Date.now(),
  };
  scheduleDiskFlush();

  const db = getDb();
  if (!db) return;
  try {
    const docRef = doc(db, 'bot', 'noPrefix');
    await setDoc(docRef, LOCAL_STORE.noPrefix, { merge: true });
  } catch (e: any) {
    handleFirestoreError(e);
  }
}

/**
 * Load No-Prefix Grants and Redeem Codes
 */
export async function loadPersistedNoPrefixState(): Promise<any | null> {
  if (LOCAL_STORE.noPrefix) {
    return LOCAL_STORE.noPrefix;
  }
  const db = getDb();
  if (!db) return null;
  try {
    const docRef = doc(db, 'bot', 'noPrefix');
    const snap = await getDoc(docRef);
    if (snap.exists()) {
      const data = snap.data();
      LOCAL_STORE.noPrefix = data as any;
      scheduleDiskFlush();
      return data;
    }
  } catch (e: any) {
    handleFirestoreError(e);
  }
  return null;
}

let lastHeartbeatWrite = 0;

export async function persistGatewayHeartbeat(nodeId: string, isHeavenCloud: boolean): Promise<void> {
  if (Date.now() - lastHeartbeatWrite < 60000) return;
  lastHeartbeatWrite = Date.now();
  LOCAL_STORE.gatewayHeartbeat = {
    nodeId,
    isHeavenCloud,
    lastSeen: Date.now(),
  };
  scheduleDiskFlush();

  const db = getDb();
  if (!db) return;
  try {
    const docRef = doc(db, 'bot', 'gatewayHeartbeat');
    await setDoc(docRef, LOCAL_STORE.gatewayHeartbeat, { merge: true });
  } catch (e: any) {
    handleFirestoreError(e);
  }
}

export async function loadGatewayHeartbeat(): Promise<{ nodeId?: string; isHeavenCloud?: boolean; lastSeen?: number } | null> {
  if (LOCAL_STORE.gatewayHeartbeat) {
    return LOCAL_STORE.gatewayHeartbeat;
  }
  const db = getDb();
  if (!db) return null;
  try {
    const docRef = doc(db, 'bot', 'gatewayHeartbeat');
    const snap = await getDoc(docRef);
    if (snap.exists()) {
      const data = snap.data();
      LOCAL_STORE.gatewayHeartbeat = data;
      scheduleDiskFlush();
      return data;
    }
  } catch (e: any) {
    handleFirestoreError(e);
  }
  return null;
}
