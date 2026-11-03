import React, { useEffect, useRef, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { DiscordEmoji } from './DiscordEmoji.tsx';
import { DEFAULT_ZENITH_BOT_ICON } from './ZenithIntroPage.tsx';
import {
  computeOpeningPhaseState,
  computeSpectrumBars,
  OPENING_TOTAL_DURATION_MS,
  ORBITAL_MODULE_BADGES,
  OpeningPhaseState,
} from '../utils/openingAnimationEngine.ts';

interface ZenithOpeningAnimationProps {
  isOpen: boolean;
  onComplete: () => void;
  botAvatarUrl?: string;
  botTag?: string;
  botPing?: number;
  guildName?: string;
  variant?: 'landing' | 'dashboard';
  totalDurationMs?: number;
}

interface StarParticle {
  angle: number;
  radius: number;
  speed: number;
  size: number;
  hue: number;
  alpha: number;
  z: number;
}

export const ZenithOpeningAnimation: React.FC<ZenithOpeningAnimationProps> = ({
  isOpen,
  onComplete,
  botAvatarUrl,
  botTag = 'Zenith#9729',
  botPing = 18,
  guildName,
  variant = 'landing',
  totalDurationMs = OPENING_TOTAL_DURATION_MS,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const onCompleteRef = useRef(onComplete);
  onCompleteRef.current = onComplete;

  const [elapsedMs, setElapsedMs] = useState<number>(0);
  const [isPaused, setIsPaused] = useState<boolean>(false);
  const isPausedRef = useRef<boolean>(false);
  isPausedRef.current = isPaused;

  const startTimeRef = useRef<number | null>(null);
  const pausedElapsedRef = useRef<number>(0);
  const pointerRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });

  const resolvedAvatar = botAvatarUrl || DEFAULT_ZENITH_BOT_ICON;
  const phaseState: OpeningPhaseState = computeOpeningPhaseState(elapsedMs, totalDurationMs);
  const spectrumBars = computeSpectrumBars(24, elapsedMs);

  const handleRestart = useCallback((e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    pausedElapsedRef.current = 0;
    startTimeRef.current = performance.now();
    setElapsedMs(0);
    setIsPaused(false);
  }, []);

  const handleTogglePause = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    setIsPaused((prev) => {
      const next = !prev;
      if (!next) {
        startTimeRef.current = performance.now() - pausedElapsedRef.current;
      }
      return next;
    });
  }, []);

  const handleSkip = useCallback((e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    onCompleteRef.current();
  }, []);

  // Reset timeline whenever opened
  useEffect(() => {
    if (!isOpen) return;
    pausedElapsedRef.current = 0;
    startTimeRef.current = performance.now();
    setElapsedMs(0);
    setIsPaused(false);
  }, [isOpen]);

  // 60fps Canvas Vortex + Timeline driver
  useEffect(() => {
    if (!isOpen) return;

    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d') || null;

    const particles: StarParticle[] = Array.from({ length: 90 }, (_, idx) => ({
      angle: (idx / 90) * Math.PI * 2 + (idx % 7) * 0.31,
      radius: 40 + ((idx * 19) % 520),
      speed: 0.6 + (idx % 5) * 0.35,
      size: 1.2 + (idx % 3) * 0.9,
      hue: idx % 3 === 0 ? 190 : idx % 2 === 0 ? 235 : 160,
      alpha: 0.35 + (idx % 4) * 0.15,
      z: 0.5 + (idx % 5) * 0.25,
    }));

    const handleResize = () => {
      if (!canvas) return;
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = window.innerWidth * dpr;
      canvas.height = window.innerHeight * dpr;
      if (ctx) {
        ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      }
    };

    const handlePointerMove = (ev: PointerEvent) => {
      const nx = (ev.clientX / Math.max(1, window.innerWidth) - 0.5) * 2;
      const ny = (ev.clientY / Math.max(1, window.innerHeight) - 0.5) * 2;
      pointerRef.current = { x: nx, y: ny };
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    window.addEventListener('pointermove', handlePointerMove, { passive: true });

    let rafId = 0;
    let lastUiSync = 0;

    const renderLoop = (now: number) => {
      if (startTimeRef.current === null) {
        startTimeRef.current = now;
      }

      let currentElapsed = pausedElapsedRef.current;
      if (!isPausedRef.current) {
        currentElapsed = now - startTimeRef.current;
        pausedElapsedRef.current = currentElapsed;
      }

      // Throttle React state updates to ~30fps while Canvas renders at full 60fps
      if (now - lastUiSync >= 32) {
        lastUiSync = now;
        setElapsedMs(currentElapsed);
      }

      if (ctx && canvas) {
        const w = window.innerWidth;
        const h = window.innerHeight;
        const cx = w / 2 + pointerRef.current.x * 18;
        const cy = h / 2 + pointerRef.current.y * 18;
        const norm = Math.min(1, Math.max(0, currentElapsed / totalDurationMs));

        ctx.clearRect(0, 0, w, h);

        // Radial nebula core glow
        const coreGlow = ctx.createRadialGradient(cx, cy, 10, cx, cy, Math.max(w, h) * 0.55);
        coreGlow.addColorStop(0, 'rgba(88, 101, 242, 0.28)');
        coreGlow.addColorStop(0.35, 'rgba(34, 211, 238, 0.11)');
        coreGlow.addColorStop(0.7, 'rgba(16, 185, 129, 0.04)');
        coreGlow.addColorStop(1, 'rgba(7, 8, 12, 0)');
        ctx.fillStyle = coreGlow;
        ctx.fillRect(0, 0, w, h);

        // Perspective cyber grid horizon lines
        ctx.save();
        ctx.strokeStyle = 'rgba(99, 102, 241, 0.08)';
        ctx.lineWidth = 1;
        const ringCount = 5;
        for (let r = 1; r <= ringCount; r++) {
          const pulseRadius =
            r * 95 + ((currentElapsed * 0.045) % 95);
          const ringAlpha = Math.max(0, 0.18 - (pulseRadius / 620) * 0.16);
          ctx.strokeStyle = `rgba(56, 189, 248, ${ringAlpha.toFixed(3)})`;
          ctx.beginPath();
          ctx.arc(cx, cy, pulseRadius, 0, Math.PI * 2);
          ctx.stroke();
        }
        ctx.restore();

        // Converging & spiraling energy filaments + particles
        for (let i = 0; i < particles.length; i++) {
          const p = particles[i];
          if (!isPausedRef.current) {
            p.angle += 0.008 * p.speed;
            if (norm < 0.3) {
              // Phase 1: Pull inward toward singularity
              p.radius = Math.max(28, p.radius - p.speed * 2.2);
            } else if (norm < 0.76) {
              // Phase 2: Stable high-velocity orbital vortex
              p.radius += Math.sin(currentElapsed * 0.004 + i) * 0.6;
              if (p.radius < 65) p.radius = 65 + (i % 240);
            } else {
              // Phase 3: Warp outward expansion as portal splits
              p.radius += p.speed * 7.5;
            }
          }

          const px = cx + Math.cos(p.angle) * p.radius;
          const py = cy + Math.sin(p.angle) * p.radius * 0.78;
          const tailAngle = p.angle - 0.14 * p.speed;
          const tx = cx + Math.cos(tailAngle) * (p.radius + (norm < 0.3 ? 18 : -12));
          const ty = cy + Math.sin(tailAngle) * (p.radius + (norm < 0.3 ? 18 : -12)) * 0.78;

          ctx.strokeStyle = `hsla(${p.hue}, 92%, 68%, ${p.alpha * 0.65})`;
          ctx.lineWidth = p.size;
          ctx.beginPath();
          ctx.moveTo(tx, ty);
          ctx.lineTo(px, py);
          ctx.stroke();

          ctx.fillStyle = `hsla(${p.hue}, 95%, 76%, ${p.alpha})`;
          ctx.beginPath();
          ctx.arc(px, py, p.size * 1.15, 0, Math.PI * 2);
          ctx.fill();
        }

        // Shockwave burst at Phase 1->2 transition and Phase 2->3 transition
        const bursts = [0.3, 0.76];
        for (const trigger of bursts) {
          const delta = norm - trigger;
          if (delta > 0 && delta < 0.18) {
            const burstProgress = delta / 0.18;
            const burstRadius = 60 + burstProgress * Math.min(w, h) * 0.55;
            const burstAlpha = (1 - burstProgress) * 0.45;
            ctx.strokeStyle = `rgba(34, 211, 238, ${burstAlpha.toFixed(3)})`;
            ctx.lineWidth = 2.5 * (1 - burstProgress);
            ctx.beginPath();
            ctx.arc(cx, cy, burstRadius, 0, Math.PI * 2);
            ctx.stroke();
          }
        }
      }

      if (currentElapsed >= totalDurationMs && !isPausedRef.current) {
        onCompleteRef.current();
        return;
      }

      rafId = requestAnimationFrame(renderLoop);
    };

    rafId = requestAnimationFrame(renderLoop);

    return () => {
      cancelAnimationFrame(rafId);
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('pointermove', handlePointerMove);
    };
  }, [isOpen, totalDurationMs]);

  if (!isOpen) return null;

  const isSplitting = phaseState.phase === 'portal_split' || phaseState.phase === 'complete';
  const shutterTranslateY = phaseState.shutterOffsetPct;
  const titleWords =
    variant === 'dashboard'
      ? ['ZENITH', 'CONTROL', 'CENTER']
      : ['ZENITH', 'BOT', 'STUDIO'];

  return (
    <AnimatePresence>
      <div
        data-testid="zenith-opening-animation"
        data-phase={phaseState.phase}
        role="dialog"
        aria-label="Zenith Bot Dashboard Opening Animation"
        className="fixed inset-0 z-50 overflow-hidden select-none"
      >
        {/* TOP BLAST DOOR SHUTTER (100% OPAQUE OBSIDIAN VAULT DOOR) */}
        <div
          style={{
            transform: `translate3d(0, -${shutterTranslateY}%, 0)`,
            transition: isSplitting ? 'transform 80ms linear' : 'none',
          }}
          className="absolute inset-x-0 top-0 h-1/2 bg-[#05060B] border-b border-cyan-400/40 shadow-[0_12px_50px_rgba(34,211,238,0.28)] pointer-events-none z-0 zenith-grid-bg"
        />

        {/* BOTTOM BLAST DOOR SHUTTER (100% OPAQUE OBSIDIAN VAULT DOOR) */}
        <div
          style={{
            transform: `translate3d(0, ${shutterTranslateY}%, 0)`,
            transition: isSplitting ? 'transform 80ms linear' : 'none',
          }}
          className="absolute inset-x-0 bottom-0 h-1/2 bg-[#05060B] border-t border-indigo-500/40 shadow-[0_-12px_50px_rgba(88,101,242,0.28)] pointer-events-none z-0 zenith-grid-bg"
        />

        {/* 60FPS PARTICLE & SHOCKWAVE CANVAS */}
        <canvas
          ref={canvasRef}
          style={{
            opacity: Math.max(0, 1 - shutterTranslateY / 95),
          }}
          className="absolute inset-0 w-full h-full pointer-events-none z-10"
        />

        {/* LASER HORIZON SEAM FLARE DURING PORTAL SPLIT */}
        {isSplitting && (
          <div
            style={{
              opacity: Math.max(0, 1 - shutterTranslateY / 90),
              transform: `scaleX(${1 + shutterTranslateY / 40})`,
            }}
            className="absolute inset-x-0 top-1/2 -translate-y-1/2 h-1.5 bg-gradient-to-r from-transparent via-cyan-300 to-transparent shadow-[0_0_45px_12px_rgba(34,211,238,0.85)] z-20 pointer-events-none"
          />
        )}

        {/* INTERACTIVE TOP HUD BAR */}
        <div
          style={{
            opacity: Math.max(0, 1 - shutterTranslateY / 75),
          }}
          className="relative z-30 max-w-7xl mx-auto px-4 sm:px-8 pt-5 flex flex-wrap items-center justify-between gap-3"
        >
          <div className="flex items-center gap-2.5 px-3.5 py-1.5 rounded-xl bg-[#0B0D15]/85 border border-white/10 backdrop-blur-md">
            <DiscordEmoji name="ping" id="1555133452146319391" animated={true} size={15} />
            <span className="text-[11px] font-mono uppercase tracking-wider text-cyan-300 font-semibold">
              STAGE 0{phaseState.phaseIndex}/03 · {phaseState.phaseLabel}
            </span>
            <span className="text-[11px] font-mono text-emerald-400 tabular-nums">
              {botPing}ms
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleTogglePause}
              className="px-3 py-1.5 rounded-xl bg-[#0B0D15]/90 hover:bg-white/10 border border-white/15 text-xs font-mono text-[#C4C9DF] hover:text-white flex items-center gap-1.5 transition cursor-pointer"
              aria-label={isPaused ? 'Resume Opening Animation' : 'Pause Opening Animation'}
            >
              <DiscordEmoji
                name={isPaused ? 'resume' : 'pause'}
                id={isPaused ? '1555133494991265863' : '1555133437038297138'}
                size={13}
              />
              <span>{isPaused ? 'Resume' : 'Hold Frame'}</span>
            </button>

            <button
              type="button"
              onClick={handleRestart}
              className="px-3 py-1.5 rounded-xl bg-[#0B0D15]/90 hover:bg-white/10 border border-white/15 text-xs font-mono text-[#C4C9DF] hover:text-white flex items-center gap-1.5 transition cursor-pointer"
              aria-label="Restart Opening Animation"
            >
              <DiscordEmoji name="loop" id="1555133388149628980" size={13} />
              <span>Replay</span>
            </button>

            <button
              type="button"
              onClick={handleSkip}
              className="px-3.5 py-1.5 rounded-xl bg-indigo-600/90 hover:bg-indigo-500 border border-indigo-400/40 text-xs font-mono font-bold text-white flex items-center gap-1.5 shadow-lg shadow-indigo-500/25 transition cursor-pointer"
              aria-label="Skip Opening Animation"
            >
              <DiscordEmoji name="white_skip" id="1555133823698604074" size={13} />
              <span>Skip Intro</span>
            </button>
          </div>
        </div>

        {/* CENTRAL CHOREOGRAPHED STAGE */}
        <div
          onClick={handleSkip}
          style={{
            opacity: Math.max(0, 1 - shutterTranslateY / 82),
            transform: `scale(${phaseState.coreScale})`,
          }}
          className="relative z-20 flex-1 h-[calc(100vh-130px)] flex flex-col items-center justify-center px-4 cursor-pointer"
        >
          {/* CENTRAL ASTROLABE + ORBITAL MODULES CLUSTER */}
          <div className="relative w-[320px] h-[320px] sm:w-[440px] sm:h-[440px] flex items-center justify-center">
            {/* PRECISION VECTOR SVG ASTROLABE */}
            <svg
              viewBox="0 0 440 440"
              className="absolute inset-0 w-full h-full pointer-events-none"
              aria-hidden="true"
            >
              <defs>
                <linearGradient id="zenithArcGrad1" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#5865F2" stopOpacity="0.9" />
                  <stop offset="50%" stopColor="#22D3EE" stopOpacity="0.85" />
                  <stop offset="100%" stopColor="#34D399" stopOpacity="0.2" />
                </linearGradient>
                <linearGradient id="zenithArcGrad2" x1="100%" y1="0%" x2="0%" y2="100%">
                  <stop offset="0%" stopColor="#F59E0B" stopOpacity="0.8" />
                  <stop offset="100%" stopColor="#5865F2" stopOpacity="0.15" />
                </linearGradient>
              </defs>

              {/* Outer Degree Tick Ring */}
              <g
                style={{
                  transform: `rotate(${phaseState.ringRotationDeg * 0.45}deg)`,
                  transformOrigin: '220px 220px',
                }}
              >
                <circle
                  cx="220"
                  cy="220"
                  r="198"
                  fill="none"
                  stroke="rgba(148, 163, 184, 0.14)"
                  strokeWidth="1"
                  strokeDasharray="3 9"
                />
                <circle
                  cx="220"
                  cy="220"
                  r="182"
                  fill="none"
                  stroke="url(#zenithArcGrad1)"
                  strokeWidth="2"
                  strokeDasharray="180 260"
                  strokeLinecap="round"
                />
              </g>

              {/* Counter-Rotating Tactical Hex Ring */}
              <g
                style={{
                  transform: `rotate(-${phaseState.ringRotationDeg * 0.75}deg)`,
                  transformOrigin: '220px 220px',
                }}
              >
                <circle
                  cx="220"
                  cy="220"
                  r="148"
                  fill="none"
                  stroke="url(#zenithArcGrad2)"
                  strokeWidth="1.75"
                  strokeDasharray="95 140"
                  strokeLinecap="round"
                />
                <circle
                  cx="220"
                  cy="220"
                  r="122"
                  fill="none"
                  stroke="rgba(34, 211, 238, 0.25)"
                  strokeWidth="1"
                  strokeDasharray="6 14"
                />
              </g>

              {/* Laser Tethers to 4 Orbital Subsystem Nodes */}
              {phaseState.unlockedModulesCount > 0 && (
                <g stroke="rgba(99, 102, 241, 0.35)" strokeWidth="1.2" strokeDasharray="4 4">
                  <line x1="220" y1="220" x2="75" y2="85" />
                  <line x1="220" y1="220" x2="365" y2="85" />
                  <line x1="220" y1="220" x2="75" y2="355" />
                  <line x1="220" y1="220" x2="365" y2="355" />
                </g>
              )}
            </svg>

            {/* 4 ORBITAL SUBSYSTEM CARDS (CUSTOM DISCORD EMOJIS ONLY) */}
            {ORBITAL_MODULE_BADGES.map((badge, index) => {
              const isUnlocked = index < phaseState.unlockedModulesCount;
              const positionClasses = [
                '-top-2 -left-2 sm:top-4 sm:-left-16',
                '-top-2 -right-2 sm:top-4 sm:-right-16',
                '-bottom-2 -left-2 sm:bottom-4 sm:-left-16',
                '-bottom-2 -right-2 sm:bottom-4 sm:-right-16',
              ][index];

              return (
                <motion.div
                  key={badge.id}
                  initial={{ opacity: 0, scale: 0.72, y: 14 }}
                  animate={
                    isUnlocked
                      ? { opacity: 1, scale: 1, y: 0 }
                      : { opacity: 0.35, scale: 0.88, y: 6 }
                  }
                  transition={{ type: 'spring', stiffness: 260, damping: 20 }}
                  style={{
                    borderColor: isUnlocked ? `${badge.accentColor}77` : 'rgba(255,255,255,0.12)',
                  }}
                  className={`absolute ${positionClasses} z-30 px-3.5 py-2.5 rounded-2xl bg-[#0B0E18] border shadow-[0_12px_35px_rgba(0,0,0,0.75)] flex items-center gap-2.5 max-w-[205px] sm:max-w-[245px]`}
                >
                  <div
                    style={{
                      borderColor: `${badge.accentColor}55`,
                      backgroundColor: `${badge.accentColor}1A`,
                    }}
                    className="w-8 h-8 rounded-xl border flex items-center justify-center shrink-0"
                  >
                    <DiscordEmoji
                      name={badge.emojiName}
                      id={badge.emojiId}
                      animated={badge.animated}
                      size={18}
                    />
                  </div>
                  <div className="min-w-0 text-left">
                    <div className="text-[11px] font-display font-bold text-white truncate">
                      {badge.title}
                    </div>
                    <div className="flex items-center gap-1 text-[10px] font-mono text-cyan-300">
                      <DiscordEmoji
                        name="white_Done"
                        id="1555133626276905040"
                        animated={true}
                        size={11}
                      />
                      <span>{badge.metric}</span>
                    </div>
                  </div>
                </motion.div>
              );
            })}

            {/* CENTRAL HOLOGRAPHIC BOT CREST REACTOR */}
            <motion.div
              initial={{ scale: 0.5, rotate: -12, opacity: 0 }}
              animate={{ scale: 1, rotate: 0, opacity: 1 }}
              transition={{ type: 'spring', stiffness: 210, damping: 18 }}
              className="relative z-20 flex flex-col items-center"
            >
              <div className="relative p-3 rounded-[2rem] bg-gradient-to-br from-indigo-500/30 via-[#0E111B] to-cyan-500/30 border border-indigo-400/50 shadow-[0_0_70px_rgba(88,101,242,0.55)]">
                <img
                  src={resolvedAvatar}
                  alt="Zenith Bot Core Crest"
                  onError={(e) => {
                    (e.currentTarget as HTMLImageElement).src = DEFAULT_ZENITH_BOT_ICON;
                  }}
                  className="w-24 h-24 sm:w-28 sm:h-28 rounded-[1.5rem] object-cover border border-white/20 shadow-2xl"
                />

                {/* Corner status badge */}
                <div className="absolute -bottom-2 -right-2 px-2.5 py-1 rounded-xl bg-[#07080C] border border-emerald-400/50 flex items-center gap-1 shadow-lg">
                  <DiscordEmoji
                    name="white_bot"
                    id="1555133589581070416"
                    size={13}
                  />
                  <span className="text-[10px] font-mono font-bold text-emerald-400">
                    v2.5 LIVE
                  </span>
                </div>
              </div>

              {/* 24-BAR HARMONIC 320KBPS AUDIO SPECTRUM */}
              <div
                aria-hidden="true"
                className="mt-4 flex items-end justify-center gap-1 h-8 px-4 py-1.5 rounded-xl bg-[#0B0D15]/80 border border-white/10"
              >
                {spectrumBars.map((heightRatio, idx) => (
                  <div
                    key={idx}
                    style={{
                      height: `${Math.max(4, Math.round(heightRatio * 20))}px`,
                    }}
                    className={`w-1 rounded-full transition-all duration-75 ${
                      idx % 3 === 0
                        ? 'bg-cyan-400'
                        : idx % 2 === 0
                        ? 'bg-indigo-400'
                        : 'bg-emerald-400'
                    }`}
                  />
                ))}
              </div>
            </motion.div>
          </div>

          {/* KINETIC STAGGERED TITLE & TELEMETRY */}
          <div className="mt-4 sm:mt-6 text-center space-y-3 max-w-2xl">
            <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-3">
              {titleWords.map((word, wIdx) => (
                <motion.span
                  key={word}
                  initial={{ opacity: 0, y: 18, filter: 'blur(6px)' }}
                  animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
                  transition={{
                    delay: wIdx * 0.11,
                    duration: 0.42,
                    ease: [0.22, 1, 0.36, 1],
                  }}
                  className={`font-display font-extrabold text-3xl sm:text-5xl tracking-tight ${
                    wIdx === titleWords.length - 1
                      ? 'bg-gradient-to-r from-indigo-400 via-cyan-300 to-emerald-300 bg-clip-text text-transparent'
                      : 'text-white'
                  }`}
                >
                  {word}
                </motion.span>
              ))}
            </div>

            <div className="flex flex-wrap items-center justify-center gap-2 text-xs font-mono text-[#C4C9DF]">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-white/[0.05] border border-white/10">
                <DiscordEmoji name="white_owner" id="1555133769659187260" size={13} />
                <span>Sole Dev: demonxtejas</span>
              </span>
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-white/[0.05] border border-white/10">
                <DiscordEmoji name="02music" id="1555133215508009061" animated={true} size={13} />
                <span>{guildName ? `Server: ${guildName}` : botTag}</span>
              </span>
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-white/[0.05] border border-white/10 text-cyan-300">
                <DiscordEmoji name="white_antinuke" id="1555133560334061610" size={13} />
                <span>{phaseState.phaseSubtext}</span>
              </span>
            </div>

            {/* PRECISION PROGRESS RAIL */}
            <div className="w-64 sm:w-80 mx-auto pt-1 space-y-1.5">
              <div className="h-1.5 w-full rounded-full bg-white/10 overflow-hidden p-[1px]">
                <div
                  style={{ width: `${phaseState.overallProgress}%` }}
                  className="h-full rounded-full bg-gradient-to-r from-[#5865F2] via-cyan-400 to-emerald-400 transition-all duration-75"
                />
              </div>
              <div className="flex items-center justify-between text-[10px] font-mono text-[#9499B3]">
                <span>CLICK ANYWHERE TO ENTER</span>
                <span className="text-cyan-300 tabular-nums">{phaseState.overallProgress}%</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </AnimatePresence>
  );
};
