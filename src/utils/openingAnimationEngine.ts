export type OpeningPhase = 'ignition' | 'materialize' | 'portal_split' | 'complete';

export interface OpeningPhaseState {
  phase: OpeningPhase;
  phaseIndex: number;
  phaseLabel: string;
  phaseSubtext: string;
  overallProgress: number; // 0 to 100
  phaseProgress: number; // 0 to 1
  shutterOffsetPct: number; // 0 (closed) to 100 (fully parted)
  coreScale: number;
  ringRotationDeg: number;
  unlockedModulesCount: number;
}

export interface OrbitalModuleBadge {
  id: string;
  title: string;
  metric: string;
  emojiName: string;
  emojiId: string;
  animated?: boolean;
  angleDeg: number;
  accentColor: string;
}

export const OPENING_TOTAL_DURATION_MS = 3200;

export const ORBITAL_MODULE_BADGES: OrbitalModuleBadge[] = [
  {
    id: 'antinuke',
    title: '16-Module Anti-Nuke Vault',
    metric: '0.2s INTERCEPT',
    emojiName: 'white_antinuke',
    emojiId: '1555133560334061610',
    angleDeg: -135,
    accentColor: '#F59E0B',
  },
  {
    id: 'music',
    title: '320kbps Lossless Audio DSP',
    metric: '24/7 STREAM',
    emojiName: '02music',
    emojiId: '1555133215508009061',
    animated: true,
    angleDeg: -45,
    accentColor: '#22D3EE',
  },
  {
    id: 'commands',
    title: 'Sideways Command Matrix',
    metric: '53+ COMMANDS',
    emojiName: 'Commands',
    emojiId: '1555133314380206160',
    angleDeg: 135,
    accentColor: '#818CF8',
  },
  {
    id: 'cloud',
    title: 'Heaven Cloud 24/7 Node',
    metric: 'GATEWAY LIVE',
    emojiName: 'World',
    emojiId: '1555133905412030607',
    animated: true,
    angleDeg: 45,
    accentColor: '#34D399',
  },
];

export function clamp01(value: number): number {
  if (!Number.isFinite(value)) return 0;
  return Math.max(0, Math.min(1, value));
}

export function easeOutCubic(t: number): number {
  const c = clamp01(t);
  return 1 - Math.pow(1 - c, 3);
}

export function easeInOutQuint(t: number): number {
  const c = clamp01(t);
  return c < 0.5 ? 16 * Math.pow(c, 5) : 1 - Math.pow(-2 * c + 2, 5) / 2;
}

/**
 * Computes the exact choreographed state of the Zenith Dashboard opening animation
 * at a given elapsed time in milliseconds.
 */
export function computeOpeningPhaseState(
  elapsedMs: number,
  totalDurationMs: number = OPENING_TOTAL_DURATION_MS
): OpeningPhaseState {
  const safeTotal = Math.max(500, totalDurationMs);
  const clampedElapsed = Math.max(0, Math.min(safeTotal, Number.isFinite(elapsedMs) ? elapsedMs : 0));
  const normalized = clamp01(clampedElapsed / safeTotal);
  const overallProgress = Math.round(normalized * 100);

  // Phase 1: 0.00 -> 0.30 (Singularity & Orbital Lock)
  // Phase 2: 0.30 -> 0.76 (Emblem Materialization & 4 Subsystem Ignitions)
  // Phase 3: 0.76 -> 0.98 (Dimensional Iris & Blast Shutter Split)
  // Phase 4: >= 0.98 (Complete)
  if (normalized < 0.3) {
    const phaseProgress = clamp01(normalized / 0.3);
    const eased = easeOutCubic(phaseProgress);
    return {
      phase: 'ignition',
      phaseIndex: 1,
      phaseLabel: 'CORE SINGULARITY IGNITION',
      phaseSubtext: 'Synchronizing Discord Gateway shards & astrolabe telemetry',
      overallProgress,
      phaseProgress,
      shutterOffsetPct: 0,
      coreScale: Number((0.65 + eased * 0.35).toFixed(3)),
      ringRotationDeg: Number((eased * 120).toFixed(1)),
      unlockedModulesCount: phaseProgress > 0.65 ? 1 : 0,
    };
  }

  if (normalized < 0.76) {
    const phaseProgress = clamp01((normalized - 0.3) / 0.46);
    const eased = easeOutCubic(phaseProgress);
    const unlockedModulesCount = Math.min(
      4,
      Math.max(1, Math.ceil(phaseProgress * 6.5))
    );
    return {
      phase: 'materialize',
      phaseIndex: 2,
      phaseLabel: 'ARMING 16-MODULE VAULT & 320KBPS DSP',
      phaseSubtext: 'Locking Anti-Nuke perimeter, FFmpeg spatial filters & Heaven Cloud node',
      overallProgress,
      phaseProgress,
      shutterOffsetPct: 0,
      coreScale: Number((1 + Math.sin(eased * Math.PI) * 0.06).toFixed(3)),
      ringRotationDeg: Number((120 + eased * 160).toFixed(1)),
      unlockedModulesCount,
    };
  }

  if (normalized < 0.98) {
    const phaseProgress = clamp01((normalized - 0.76) / 0.22);
    const shutterEased = easeInOutQuint(phaseProgress);
    return {
      phase: 'portal_split',
      phaseIndex: 3,
      phaseLabel: 'UNSEALING ZENITH CONTROL DECK',
      phaseSubtext: 'Portal shutters disengaged — launching live server telemetry',
      overallProgress,
      phaseProgress,
      shutterOffsetPct: Number((shutterEased * 100).toFixed(2)),
      coreScale: Number((1 + shutterEased * 0.28).toFixed(3)),
      ringRotationDeg: Number((280 + shutterEased * 80).toFixed(1)),
      unlockedModulesCount: 4,
    };
  }

  return {
    phase: 'complete',
    phaseIndex: 4,
    phaseLabel: 'ZENITH DASHBOARD ONLINE',
    phaseSubtext: 'All systems nominal',
    overallProgress: 100,
    phaseProgress: 1,
    shutterOffsetPct: 100,
    coreScale: 1.28,
    ringRotationDeg: 360,
    unlockedModulesCount: 4,
  };
}

/**
 * Generates deterministic harmonic equalizer bar heights (0.15 to 1.0)
 * for the opening animation's 320kbps audio spectrum visualizer.
 */
export function computeSpectrumBars(barCount: number, elapsedMs: number): number[] {
  const count = Math.max(1, Math.min(64, Math.floor(barCount)));
  const t = (Number.isFinite(elapsedMs) ? elapsedMs : 0) * 0.006;
  const bars: number[] = [];
  const center = (count - 1) / 2;

  for (let i = 0; i < count; i++) {
    const distFromCenter = Math.abs(i - center) / Math.max(1, center);
    const envelope = Math.max(0.2, 1 - distFromCenter * 0.65);
    const waveA = Math.sin(t * 2.1 + i * 0.55) * 0.5 + 0.5;
    const waveB = Math.cos(t * 1.4 - i * 0.35) * 0.5 + 0.5;
    const combined = (waveA * 0.6 + waveB * 0.4) * envelope;
    bars.push(Number(Math.max(0.16, Math.min(1, combined)).toFixed(3)));
  }

  return bars;
}
