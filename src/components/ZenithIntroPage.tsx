import React, { useState } from 'react';
import { DiscordEmoji } from './DiscordEmoji.tsx';
import { ZenithOpeningAnimation } from './ZenithOpeningAnimation.tsx';

export const DEFAULT_ZENITH_BOT_ICON =
  'https://cdn.discordapp.com/avatars/1553292201835102278/286d052869b71984debd082f899177be.png?size=256';

export interface GuildSummary {
  id: string;
  name: string;
  icon: string;
  memberCount: number;
  ownerId: string;
  channelsCount: number;
  rolesCount: number;
  boostTier: number;
  boostCount: number;
  region: string;
  isLive: boolean;
  botPresent?: boolean;
  isMutual?: boolean;
  userCanManage?: boolean;
  userRoleLabel?: string;
  userRoleKey?: 'bot_owner' | 'server_owner' | 'extra_owner' | 'admin' | 'member';
  canManageBotSettings?: boolean;
  canAccessAntiNuke?: boolean;
  extraOwnersCount?: number;
  inviteUrl?: string;
  botNickname: string;
  botAvatar: string;
  antiNukeEnabled: boolean;
  honeypotEnabled: boolean;
  isPlayingMusic: boolean;
  currentTrackTitle: string | null;
  activeCasesCount: number;
}

export interface DiscordUserSession {
  id: string;
  username: string;
  globalName?: string;
  discriminator: string;
  avatar: string;
  isBotOwner: boolean;
  roleOverride?: 'bot_owner' | 'server_owner' | 'extra_owner' | 'admin';
  verifiedVia: 'discord_oauth' | 'owner_passkey';
  guilds?: Array<{
    id: string;
    name: string;
    icon: string | null;
    owner: boolean;
    permissions: string;
    isAdmin: boolean;
  }>;
}

export interface HeavenCloudStatus {
  connected: boolean;
  connectionStatus?: string;
  serverId: string;
  currentState: string;
  memoryMb: number;
  cpuAbsolute: number;
  uptimeMs: number;
  lastContactAt?: string | null;
  dashboardOnlyMode: boolean;
  firestoreSync: string;
}

interface ZenithIntroPageProps {
  mode?: 'intro' | 'servers';
  guilds: GuildSummary[];
  selectedGuildId: string;
  userSession: DiscordUserSession | null;
  heavenCloud: HeavenCloudStatus | null;
  botTag: string;
  botPing: number;
  botAvatarUrl?: string;
  botInviteUrl?: string;
  oauthConfig?: {
    clientId: string;
    redirectUri: string;
    clientSecretConfigured: boolean;
  };
  onOpenServersPage: () => void;
  onBackToIntro?: () => void;
  onEnterControlCenter: (guildId?: string, initialTab?: string) => void;
  onDiscordOAuthLogin: () => void;
  onDirectBotVerifyLogin?: (identifier: string) => Promise<void>;
  onSaveClientSecret: (secret: string) => Promise<void>;
  onLogout: () => Promise<void>;
}

export const ZenithIntroPage: React.FC<ZenithIntroPageProps> = ({
  mode = 'intro',
  guilds,
  userSession,
  botTag,
  botPing,
  botAvatarUrl,
  botInviteUrl,
  oauthConfig,
  onOpenServersPage,
  onBackToIntro,
  onEnterControlCenter,
  onDiscordOAuthLogin,
  onDirectBotVerifyLogin,
  onSaveClientSecret,
  onLogout,
}) => {
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [showArchitectureModal, setShowArchitectureModal] = useState(false);
  const [showOpeningSplash, setShowOpeningSplash] = useState(true);
  const [showOAuthSetupDrawer, setShowOAuthSetupDrawer] = useState(false);
  const [clientSecretInput, setClientSecretInput] = useState('');
  const [savingSecret, setSavingSecret] = useState(false);
  const [copiedRedirect, setCopiedRedirect] = useState<string | null>(null);
  const [serverSearch, setServerSearch] = useState('');
  const [discordIdentifierInput, setDiscordIdentifierInput] = useState('demonxtejas');
  const [verifyingBotAuth, setVerifyingBotAuth] = useState(false);

  const resolvedBotIcon = botAvatarUrl || DEFAULT_ZENITH_BOT_ICON;
  const clientId = oauthConfig?.clientId || '1553292201835102278';
  const currentOriginRedirect =
    typeof window !== 'undefined'
      ? `${window.location.origin}/auth/callback`
      : oauthConfig?.redirectUri || 'https://demonzenith.ai.studio/auth/callback';
  const publishedRedirect = 'https://demonzenith.ai.studio/auth/callback';

  const inviteHref =
    botInviteUrl ||
    `https://discord.com/oauth2/authorize?client_id=${clientId}&permissions=8&scope=bot%20applications.commands`;

  const launchDiscordOAuthPopupNow = () => {
    onDiscordOAuthLogin();
    setShowAuthModal(true);
  };

  const handleDashboardClick = () => {
    if (userSession) {
      onOpenServersPage();
      return;
    }
    launchDiscordOAuthPopupNow();
  };

  const handleCopyUri = (uri: string) => {
    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText(uri);
      setCopiedRedirect(uri);
      setTimeout(() => setCopiedRedirect(null), 2500);
    }
  };

  const handleDirectBotLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!onDirectBotVerifyLogin || !discordIdentifierInput.trim()) return;
    setVerifyingBotAuth(true);
    try {
      await onDirectBotVerifyLogin(discordIdentifierInput.trim());
      setShowAuthModal(false);
    } finally {
      setVerifyingBotAuth(false);
    }
  };

  const handleSaveSecretSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!clientSecretInput.trim()) return;
    setSavingSecret(true);
    try {
      await onSaveClientSecret(clientSecretInput.trim());
      setClientSecretInput('');
    } finally {
      setSavingSecret(false);
    }
  };

  const activeGuilds = guilds.filter((g) => g.botPresent !== false);
  const totalMembers = activeGuilds.reduce((acc, g) => acc + (g.memberCount || 0), 0);

  const filteredServers = guilds.filter((g) => {
    if (!serverSearch.trim()) return true;
    return (
      g.name.toLowerCase().includes(serverSearch.toLowerCase()) ||
      g.id.includes(serverSearch.trim())
    );
  });

  // ===========================================================================
  // STAGE 2: "SELECT A SERVER" PAGE (After Discord Login — Sapphire / Wick / Dyno)
  // ===========================================================================
  if (mode === 'servers') {
    return (
      <div className="min-h-screen bg-[#090A0F] text-[#F4F6FB] flex flex-col justify-between">
        <ZenithOpeningAnimation
          isOpen={showOpeningSplash}
          onComplete={() => setShowOpeningSplash(false)}
          botAvatarUrl={resolvedBotIcon}
          botTag={botTag}
          botPing={botPing}
          variant="landing"
        />
        {/* Top Navbar */}
        <header className="sticky top-0 z-30 border-b border-white/[0.06] bg-[#090A0F]/90 backdrop-blur-xl">
          <div className="max-w-7xl mx-auto px-4 sm:px-8 h-20 flex items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <button
                onClick={onBackToIntro}
                className="flex items-center gap-3 hover:opacity-90 transition cursor-pointer"
              >
                <img
                  src={resolvedBotIcon}
                  alt="Zenith Bot Icon"
                  onError={(e) => {
                    (e.currentTarget as HTMLImageElement).src = DEFAULT_ZENITH_BOT_ICON;
                  }}
                  className="w-10 h-10 rounded-xl object-cover shadow-lg shadow-[#5865F2]/25 border border-white/15"
                />
                <div className="text-left">
                  <span className="font-display font-extrabold text-xl tracking-tight text-white block leading-none">
                    Zenith Bot
                  </span>
                  <span className="text-[11px] font-mono text-[#9499B3]">
                    Select a Server
                  </span>
                </div>
              </button>
            </div>

            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setShowOpeningSplash(true)}
                className="px-3.5 py-2 rounded-xl bg-[#12141D] hover:bg-white/[0.08] border border-cyan-500/30 text-xs font-mono font-semibold text-cyan-200 flex items-center gap-1.5 transition cursor-pointer"
                aria-label="Replay Opening Animation"
              >
                <DiscordEmoji name="loop" id="1555133388149628980" size={14} />
                <span>Replay Intro</span>
              </button>
              {userSession ? (
                <div className="flex items-center gap-2.5 bg-[#12141D] border border-white/10 rounded-xl px-3.5 py-2">
                  <img
                    src={userSession.avatar || resolvedBotIcon}
                    alt={userSession.username}
                    onError={(e) => {
                      (e.currentTarget as HTMLImageElement).src = resolvedBotIcon;
                    }}
                    className="w-7 h-7 rounded-full object-cover"
                  />
                  <div className="text-left hidden sm:block">
                    <div className="text-xs font-bold text-white leading-tight">
                      {userSession.globalName || userSession.username}
                    </div>
                    <div className="text-[10px] font-mono text-emerald-400">
                      Discord Connected
                    </div>
                  </div>
                  <button
                    onClick={onLogout}
                    className="ml-1 px-2 py-1 rounded-lg hover:bg-rose-500/20 text-rose-300 text-xs font-semibold transition cursor-pointer"
                    title="Logout"
                  >
                    Logout
                  </button>
                </div>
              ) : (
                <button
                  onClick={launchDiscordOAuthPopupNow}
                  className="px-5 py-2.5 rounded-xl bg-[#5865F2] hover:bg-[#4752C4] text-white font-semibold text-sm flex items-center gap-2.5 shadow-lg shadow-[#5865F2]/25 transition cursor-pointer"
                >
                  <img
                    src={resolvedBotIcon}
                    alt="Zenith"
                    className="w-5 h-5 rounded-full object-cover"
                  />
                  <span>Login with Discord</span>
                </button>
              )}
            </div>
          </div>
        </header>

        {/* Server Selection Grid */}
        <main className="max-w-7xl mx-auto w-full px-4 sm:px-8 py-12 flex-1 space-y-8">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-white/[0.07] pb-6">
            <div className="space-y-1.5">
              <h1 className="font-display font-extrabold text-3xl sm:text-4xl text-white">
                Select a Server
              </h1>
              <p className="text-sm text-[#9499B3]">
                Choose a Discord server below to manage Bot Settings, Set Channels, 24/7 Music, Moderation, and Anti-Nuke.
              </p>
            </div>

            <div className="flex items-center gap-3">
              <input
                type="text"
                value={serverSearch}
                onChange={(e) => setServerSearch(e.target.value)}
                placeholder="Search servers by name or ID..."
                className="px-4 py-2.5 rounded-xl bg-[#12141D] border border-white/10 text-sm text-white placeholder-[#9499B3] focus:outline-none focus:border-[#5865F2] w-full sm:w-72"
              />
            </div>
          </div>

          {filteredServers.length === 0 ? (
            <div className="p-12 rounded-3xl bg-[#12141D] border border-white/[0.07] text-center space-y-4">
              <img
                src={resolvedBotIcon}
                alt="Zenith"
                className="w-16 h-16 rounded-2xl object-cover mx-auto border border-white/15 shadow-lg"
              />
              <div className="text-lg font-bold text-white">No Matching Discord Servers Found</div>
              <p className="text-sm text-[#9499B3] max-w-md mx-auto">
                Make sure you have Administrator or Server Owner permissions in the server, or invite Zenith to your server first.
              </p>
              <a
                href={inviteHref}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex px-6 py-3 rounded-xl bg-[#5865F2] hover:bg-[#4752C4] text-white font-bold text-sm items-center gap-2 transition"
              >
                <span>Add Zenith to a Server</span>
              </a>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {filteredServers.map((guild) => {
                const isBotInServer = guild.botPresent !== false;
                const canAntiNuke = Boolean(guild.canAccessAntiNuke);
                return (
                  <div
                    key={guild.id}
                    className="p-5 rounded-2xl bg-[#12141D] border border-white/[0.08] hover:border-[#5865F2]/50 transition flex flex-col justify-between gap-5 shadow-lg"
                  >
                    <div className="flex items-center gap-4">
                      <img
                        src={guild.icon || resolvedBotIcon}
                        alt={guild.name}
                        onError={(e) => {
                          (e.currentTarget as HTMLImageElement).src = resolvedBotIcon;
                        }}
                        className="w-14 h-14 rounded-2xl object-cover border border-white/10 bg-[#090A0F] shrink-0"
                      />
                      <div className="min-w-0 flex-1">
                        <h3 className="font-display font-bold text-base text-white truncate">
                          {guild.name}
                        </h3>
                        <div className="flex flex-wrap items-center gap-1.5 mt-1">
                          <span className="px-2 py-0.5 rounded-md bg-white/[0.06] text-[11px] font-mono text-[#9499B3]">
                            {(guild.memberCount ?? 0).toLocaleString()} members
                          </span>
                          <span
                            className={`px-2 py-0.5 rounded-md text-[10px] font-mono font-semibold ${
                              canAntiNuke
                                ? 'bg-amber-500/15 text-amber-300 border border-amber-500/30'
                                : 'bg-indigo-500/15 text-indigo-300 border border-indigo-500/30'
                            }`}
                          >
                            {guild.userRoleLabel || 'Administrator'}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="pt-3 border-t border-white/[0.06] flex items-center justify-between gap-2">
                      <div className="text-[11px] font-mono text-[#9499B3]">
                        {canAntiNuke ? (
                          <span className="text-emerald-400">Full + Anti-Nuke Access</span>
                        ) : (
                          <span className="text-indigo-300">Settings, Channels & Music</span>
                        )}
                      </div>

                      {isBotInServer ? (
                        <button
                          onClick={() => onEnterControlCenter(guild.id, 'overview')}
                          className="px-4 py-2 rounded-xl bg-[#5865F2] hover:bg-[#4752C4] text-white font-bold text-xs flex items-center gap-1.5 shadow-md shadow-[#5865F2]/25 transition cursor-pointer"
                        >
                          <span>Manage Server</span>
                        </button>
                      ) : (
                        <a
                          href={guild.inviteUrl || inviteHref}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="px-4 py-2 rounded-xl bg-white/[0.08] hover:bg-white/[0.14] text-white font-bold text-xs flex items-center gap-1.5 transition"
                        >
                          <span>Add Bot</span>
                        </a>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </main>

        {/* Footer */}
        <footer className="border-t border-white/[0.06] bg-[#090A0F] py-6 px-4 sm:px-8">
          <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-[#9499B3]">
            <div className="flex items-center gap-2.5">
              <img
                src={resolvedBotIcon}
                alt="Zenith"
                className="w-5 h-5 rounded-md object-cover"
              />
              <span className="font-semibold text-white">Zenith Bot</span>
              <span>·</span>
              <span>
                Sole Developer: <strong className="text-white">demonxtejas</strong>
              </span>
            </div>
            <div>24/7 Hosted on HeavenCloud</div>
          </div>
        </footer>
      </div>
    );
  }

  // ===========================================================================
  // STAGE 1: BOT LANDING PAGE (Sapphire sapph.xyz / Wick wickbot.com style)
  // ===========================================================================
  return (
    <div className="min-h-screen bg-[#090A0F] text-[#F4F6FB] flex flex-col justify-between selection:bg-indigo-500 selection:text-white zenith-grid-bg">
      {/* CHOREOGRAPHED MULTI-STAGE OPENING ANIMATION */}
      <ZenithOpeningAnimation
        isOpen={showOpeningSplash}
        onComplete={() => setShowOpeningSplash(false)}
        botAvatarUrl={resolvedBotIcon}
        botTag={botTag}
        botPing={botPing}
        variant="landing"
      />

      {/* Subtle Top Glow */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden z-0">
        <div className="absolute -top-48 left-1/2 -translate-x-1/2 w-[800px] h-[420px] rounded-full bg-[#5865F2]/12 blur-[140px]" />
      </div>

      {/* TOP NAVBAR */}
      <header className="sticky top-0 z-30 border-b border-white/[0.06] bg-[#090A0F]/85 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-4 sm:px-8 h-20 flex items-center justify-between gap-4">
          <div className="flex items-center gap-8">
            <div className="flex items-center gap-3">
              <img
                src={resolvedBotIcon}
                alt="Zenith Bot Icon"
                onError={(e) => {
                  (e.currentTarget as HTMLImageElement).src = DEFAULT_ZENITH_BOT_ICON;
                }}
                className="w-10 h-10 rounded-xl object-cover shadow-lg shadow-[#5865F2]/25 border border-white/15"
              />
              <span className="font-display font-extrabold text-xl tracking-tight text-white whitespace-nowrap shrink-0">
                Zenith Bot
              </span>
            </div>

            <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-[#9499B3]">
              <a href="#features" className="hover:text-white transition">
                Features
              </a>
              <a href="#stats" className="hover:text-white transition">
                Statistics
              </a>
              <a href="#permissions" className="hover:text-white transition">
                Permissions
              </a>
              <a
                href={inviteHref}
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-white transition"
              >
                Invite
              </a>
            </nav>
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setShowOpeningSplash(true)}
              className="px-3.5 py-2 rounded-xl bg-[#12141D] hover:bg-white/[0.08] border border-cyan-500/30 text-xs font-mono font-semibold text-cyan-200 flex items-center gap-1.5 transition cursor-pointer"
              aria-label="Replay Opening Animation"
            >
              <DiscordEmoji name="loop" id="1555133388149628980" size={14} />
              <span className="hidden sm:inline">Replay Intro</span>
            </button>
            {userSession ? (
              <div className="flex items-center gap-3">
                <button
                  onClick={onOpenServersPage}
                  className="px-5 py-2.5 rounded-xl bg-[#5865F2] hover:bg-[#4752C4] text-white font-semibold text-sm flex items-center gap-2 shadow-lg shadow-[#5865F2]/25 transition cursor-pointer"
                >
                  <span>Dashboard</span>
                </button>
                <div className="flex items-center gap-2 bg-[#12141D] border border-white/10 rounded-xl px-3 py-1.5">
                  <img
                    src={userSession.avatar || resolvedBotIcon}
                    alt={userSession.username}
                    onError={(e) => {
                      (e.currentTarget as HTMLImageElement).src = resolvedBotIcon;
                    }}
                    className="w-7 h-7 rounded-full object-cover"
                  />
                  <span className="text-xs font-semibold text-white hidden sm:inline">
                    {userSession.globalName || userSession.username}
                  </span>
                  <button
                    onClick={onLogout}
                    className="px-2 py-0.5 rounded hover:bg-rose-500/20 text-rose-300 text-xs font-medium transition cursor-pointer"
                    title="Logout"
                  >
                    Logout
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-3">
                <a
                  href={inviteHref}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hidden sm:inline-flex px-4 py-2.5 rounded-xl bg-white/[0.05] hover:bg-white/[0.1] border border-white/10 text-sm font-semibold text-white items-center gap-2 transition"
                >
                  <span>Add to Discord</span>
                </a>
                <button
                  onClick={handleDashboardClick}
                  className="px-5 py-2.5 rounded-xl bg-[#5865F2] hover:bg-[#4752C4] text-white font-semibold text-sm flex items-center gap-2 shadow-lg shadow-[#5865F2]/25 transition cursor-pointer"
                >
                  <span>Dashboard</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* HERO SECTION & LIVE BOT STATS */}
      <main className="relative z-10 max-w-7xl mx-auto px-4 sm:px-8 pt-14 pb-24 flex-1 space-y-20 animate-zenith-reveal">
        <section className="text-center max-w-4xl mx-auto space-y-6 pt-4">
          <div className="relative flex items-center justify-center py-4">
            <div className="w-36 h-36 rounded-full border border-indigo-500/30 border-t-indigo-400 animate-zenith-orbit absolute pointer-events-none" />
            <div className="w-28 h-28 rounded-full border border-cyan-400/25 border-b-cyan-300 animate-zenith-orbit-reverse absolute pointer-events-none" />
            <img
              src={resolvedBotIcon}
              alt="Zenith Bot Avatar"
              onError={(e) => {
                (e.currentTarget as HTMLImageElement).src = DEFAULT_ZENITH_BOT_ICON;
              }}
              className="w-24 h-24 rounded-3xl object-cover shadow-2xl shadow-[#5865F2]/40 border-2 border-[#5865F2]/60 animate-zenith-float relative z-10"
            />
          </div>

          <div className="inline-flex items-center gap-2 text-xs font-medium text-[#C4C9DF]">
            <DiscordEmoji name="ping" id="1555133452146319391" animated={true} size={14} />
            <span>{botTag} Online</span>
            <span aria-hidden="true">·</span>
            <span className="text-emerald-400 font-mono tabular-nums">{botPing}ms Gateway</span>
            <span aria-hidden="true">·</span>
            <span>
              Sole Dev: <strong className="text-white">demonxtejas</strong>
            </span>
          </div>

          <h1 className="font-display font-extrabold text-4xl sm:text-6xl tracking-tight leading-[1.08] text-white">
            Zenith Bot — Complete Security, Anti-Nuke &{' '}
            <span className="bg-gradient-to-r from-[#5865F2] via-indigo-400 to-cyan-300 bg-clip-text text-transparent">
              24/7 320kbps Music
            </span>
          </h1>

          <p className="text-[#9499B3] text-base sm:text-lg max-w-2xl mx-auto leading-relaxed">
            Protect your Discord server with 16-module Anti-Nuke security, automated moderation, custom log channels, and lossless 320kbps 24/7 music—all managed from a fast, modern web dashboard.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-4 pt-2">
            <button
              onClick={handleDashboardClick}
              className="px-7 py-3.5 rounded-xl bg-[#5865F2] hover:bg-[#4752C4] text-white font-display font-bold text-base flex items-center gap-2.5 shadow-xl shadow-[#5865F2]/30 transition transform hover:-translate-y-0.5 cursor-pointer"
            >
              <span>{userSession ? 'Open Dashboard' : 'Dashboard'}</span>
            </button>

            <button
              type="button"
              onClick={() => setShowArchitectureModal(true)}
              className="px-6 py-3.5 rounded-xl bg-[#12141D] hover:bg-[#191C28] border border-cyan-500/30 text-cyan-200 font-display font-bold text-base flex items-center gap-2.5 transition cursor-pointer"
            >
              <DiscordEmoji name="Commands" id="1555133314380206160" size={18} />
              <span>Interactive Feature Preview</span>
            </button>

            <a
              href={inviteHref}
              target="_blank"
              rel="noopener noreferrer"
              className="px-7 py-3.5 rounded-xl bg-[#12141D] hover:bg-[#191C28] border border-white/10 text-white font-display font-bold text-base flex items-center gap-2.5 transition"
            >
              <span>Add to Server</span>
            </a>
          </div>
        </section>

        {/* Live Bot Statistics Bar */}
        <section
          id="stats"
          className="grid grid-cols-2 md:grid-cols-4 gap-4 p-6 rounded-3xl bg-[#12141D]/90 border border-white/[0.07]"
        >
          <div className="p-4 text-center space-y-1">
            <div className="font-display font-extrabold text-3xl sm:text-4xl text-white">
              {activeGuilds.length.toLocaleString()}
            </div>
            <div className="text-xs font-mono uppercase tracking-wider text-[#9499B3]">
              Active Servers
            </div>
          </div>
          <div className="p-4 text-center space-y-1 border-l border-white/[0.06]">
            <div className="font-display font-extrabold text-3xl sm:text-4xl text-white">
              {totalMembers.toLocaleString()}
            </div>
            <div className="text-xs font-mono uppercase tracking-wider text-[#9499B3]">
              Protected Members
            </div>
          </div>
          <div className="p-4 text-center space-y-1 border-l border-white/[0.06]">
            <div className="font-display font-extrabold text-3xl sm:text-4xl text-emerald-400">
              {botPing}ms
            </div>
            <div className="text-xs font-mono uppercase tracking-wider text-[#9499B3]">
              Gateway Latency
            </div>
          </div>
          <div className="p-4 text-center space-y-1 border-l border-white/[0.06]">
            <div className="font-display font-extrabold text-3xl sm:text-4xl text-indigo-400">
              53+
            </div>
            <div className="text-xs font-mono uppercase tracking-wider text-[#9499B3]">
              Bot Commands
            </div>
          </div>
        </section>

        {/* Bot Features Grid */}
        <section id="features" className="space-y-8">
          <div className="text-center max-w-2xl mx-auto space-y-2">
            <h2 className="font-display font-bold text-2xl sm:text-3xl text-white">
              Everything Your Server Needs in One Dashboard
            </h2>
            <p className="text-sm text-[#9499B3]">
              Configure modules per-server with real-time sync to the 24/7 Zenith bot node.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-6 rounded-2xl bg-[#12141D] border border-white/[0.07] space-y-3">
              <div className="w-11 h-11 rounded-xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center">
                <DiscordEmoji name="white_antinuke" id="1555133560334061610" size={22} />
              </div>
              <h3 className="font-display font-bold text-lg text-white">
                16-Module Anti-Nuke Vault
              </h3>
              <p className="text-sm text-[#9499B3] leading-relaxed">
                Instant neutralization of mass bans, kicks, channel deletions, role creations, and rogue bots. Protected by Owner & Extra Owner role locks.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-[#12141D] border border-white/[0.07] space-y-3">
              <div className="w-11 h-11 rounded-xl bg-cyan-500/15 border border-cyan-500/30 flex items-center justify-center">
                <DiscordEmoji name="02music" id="1555133215508009061" animated={true} size={22} />
              </div>
              <h3 className="font-display font-bold text-lg text-white">
                24/7 Lossless 320kbps Music
              </h3>
              <p className="text-sm text-[#9499B3] leading-relaxed">
                Stream full-length 320kbps tracks from JioSaavn, Spotify, and YouTube with real-time web player controls, audio filters, 24h recap, and 24/7 voice lock.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-[#12141D] border border-white/[0.07] space-y-3">
              <div className="w-11 h-11 rounded-xl bg-indigo-500/15 border border-indigo-500/30 flex items-center justify-center">
                <DiscordEmoji name="Logging" id="1555133381182881852" size={22} />
              </div>
              <h3 className="font-display font-bold text-lg text-white">
                Set Channels & Custom Identity
              </h3>
              <p className="text-sm text-[#9499B3] leading-relaxed">
                Route Welcome, Leave, Mod Logs, Message Logs, Voice Logs, and Music channels with 1 click, and customize Zenith&apos;s nickname and avatar per server.
              </p>
            </div>
          </div>
        </section>

        {/* Role-Based Dashboard Access Control Explanation */}
        <section
          id="permissions"
          className="p-8 rounded-3xl bg-[#12141D] border border-white/[0.07] grid grid-cols-1 lg:grid-cols-2 gap-8 items-center"
        >
          <div className="space-y-4">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-lg bg-indigo-500/15 text-indigo-300 text-xs font-mono">
              <span>ROLE-BASED ACCESS CONTROL</span>
            </div>
            <h2 className="font-display font-bold text-2xl text-white">
              Built-in Security Hierarchy for Server Owners & Admins
            </h2>
            <p className="text-sm text-[#9499B3] leading-relaxed">
              When you log in with Discord, Zenith automatically checks which mutual servers you and the bot share and applies strict permission tiers:
            </p>
            <div className="space-y-3 pt-1">
              <div className="p-3.5 rounded-xl bg-[#090A0F] border border-white/[0.06] flex items-start gap-3">
                <DiscordEmoji name="white_owner" id="1555133769659187260" size={18} />
                <div>
                  <div className="text-sm font-bold text-white">
                    Server Owner & Extra Added Owners
                  </div>
                  <p className="text-xs text-[#9499B3] mt-0.5">
                    Full access to the <strong>Anti-Nuke Vault</strong>, Extra Owner management, plus all Bot Settings, Set Channels, and Music controls.
                  </p>
                </div>
              </div>
              <div className="p-3.5 rounded-xl bg-[#090A0F] border border-white/[0.06] flex items-start gap-3">
                <DiscordEmoji name="white_admin" id="1555133552797028443" size={18} />
                <div>
                  <div className="text-sm font-bold text-white">Server Administrators</div>
                  <p className="text-xs text-[#9499B3] mt-0.5">
                    Can manage all <strong>Bot Settings</strong>, <strong>Set Channels</strong>, <strong>Music</strong>, Moderation, and Utilities, but <strong>cannot access or disable Anti-Nuke settings</strong>.
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="p-6 rounded-2xl bg-[#090A0F] border border-white/10 space-y-4">
            <div className="flex items-center justify-between border-b border-white/[0.07] pb-3">
              <span className="text-xs font-mono uppercase text-[#9499B3]">
                Dashboard Permission Matrix
              </span>
              <span className="text-xs font-mono text-emerald-400">Enforced Live</span>
            </div>
            <div className="space-y-2.5 text-xs">
              {[
                { feature: 'General Bot Settings & Prefix', admin: true, owner: true },
                { feature: 'Set Channels & Logging Router', admin: true, owner: true },
                { feature: '24/7 320kbps Music Player & Queue', admin: true, owner: true },
                { feature: 'Moderation, AutoMod & Utilities', admin: true, owner: true },
                { feature: 'Anti-Nuke Vault (16 Mini-Modules)', admin: false, owner: true },
                { feature: 'Manage Extra Added Owners', admin: false, owner: true },
              ].map((row) => (
                <div
                  key={row.feature}
                  className="flex items-center justify-between py-2 border-b border-white/[0.04]"
                >
                  <span className="text-white font-medium">{row.feature}</span>
                  <div className="flex items-center gap-3 font-mono text-[11px]">
                    <span className={row.admin ? 'text-emerald-400' : 'text-rose-400'}>
                      Admin: {row.admin ? 'YES' : 'LOCKED'}
                    </span>
                    <span className="text-amber-300">Owner/Extra: YES</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="relative z-10 border-t border-white/[0.06] bg-[#090A0F] py-6 px-4 sm:px-8">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-[#9499B3]">
          <div className="flex items-center gap-2.5">
            <img
              src={resolvedBotIcon}
              alt="Zenith"
              className="w-5 h-5 rounded-md object-cover"
            />
            <span className="font-semibold text-white">Zenith Bot</span>
            <span>·</span>
            <span>
              Sole Developer: <strong className="text-white">demonxtejas</strong>
            </span>
            <span>·</span>
            <span>24/7 Hosted on HeavenCloud</span>
          </div>
          <div className="flex items-center gap-5">
            <button
              onClick={handleDashboardClick}
              className="hover:text-white transition cursor-pointer"
            >
              Dashboard
            </button>
            <a
              href={inviteHref}
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-white transition"
            >
              Invite Bot
            </a>
          </div>
        </div>
      </footer>

      {/* =====================================================================
          DISCORD OAUTH2 & LIVE GATEWAY SIGN-IN MODAL
         ===================================================================== */}
      {showAuthModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-[#12141D] border border-white/10 rounded-3xl max-w-md w-full p-7 shadow-2xl space-y-5 text-center relative animate-zenith-modal">
            <button
              onClick={() => setShowAuthModal(false)}
              className="absolute top-5 right-5 px-2.5 py-1 rounded-lg hover:bg-white/10 text-xs font-semibold text-[#9499B3] hover:text-white flex items-center gap-1 cursor-pointer"
              aria-label="Close modal"
            >
              <DiscordEmoji name="white_cancel" id="1555133596652539988" size={14} />
            </button>

            <img
              src={resolvedBotIcon}
              alt="Zenith Bot Icon"
              onError={(e) => {
                (e.currentTarget as HTMLImageElement).src = DEFAULT_ZENITH_BOT_ICON;
              }}
              className="w-16 h-16 rounded-2xl object-cover mx-auto shadow-xl shadow-[#5865F2]/30 border border-white/15"
            />

            <div className="space-y-1.5">
              <h3 className="font-display font-extrabold text-2xl text-white">
                Sign in to Zenith Dashboard
              </h3>
              <p className="text-xs sm:text-sm text-[#9499B3] leading-relaxed">
                Connect your Discord account to view mutual servers and manage your server settings.
              </p>
            </div>

            {/* Option 1: Official Discord OAuth2 Popup */}
            <div className="space-y-2">
              <button
                type="button"
                onClick={onDiscordOAuthLogin}
                className="w-full py-3.5 px-5 rounded-xl bg-[#5865F2] hover:bg-[#4752C4] text-white font-display font-bold text-sm sm:text-base flex items-center justify-center gap-2.5 shadow-lg shadow-[#5865F2]/30 transition cursor-pointer"
              >
                <img
                  src={resolvedBotIcon}
                  alt="Zenith"
                  className="w-5 h-5 rounded-full object-cover"
                />
                <span>Continue with Discord OAuth2</span>
              </button>
            </div>

            {/* Option 2: Direct Live Discord Bot Gateway Verification (Works instantly even inside preview iframes!) */}
            {onDirectBotVerifyLogin && (
              <form
                onSubmit={handleDirectBotLoginSubmit}
                className="pt-4 border-t border-white/[0.08] text-left space-y-2.5"
              >
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-mono uppercase text-emerald-400 font-semibold">
                    Instant Bot Gateway Verify (No Redirect Needed)
                  </span>
                  <span className="text-[10px] font-mono text-[#9499B3]">Live Discord API</span>
                </div>
                <p className="text-[11px] text-[#9499B3] leading-relaxed">
                  If Discord OAuth2 popup is blocked by your browser or Redirect URI isn&apos;t saved yet, verify directly via Zenith&apos;s live Discord Bot Gateway:
                </p>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={discordIdentifierInput}
                    onChange={(e) => setDiscordIdentifierInput(e.target.value)}
                    placeholder="Discord Username or User ID (e.g. demonxtejas)"
                    className="flex-1 px-3 py-2 rounded-xl bg-[#090A0F] border border-white/15 text-xs font-mono text-white focus:outline-none focus:border-[#5865F2]"
                  />
                  <button
                    type="submit"
                    disabled={verifyingBotAuth}
                    className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-xs font-bold text-white shrink-0 cursor-pointer transition"
                  >
                    {verifyingBotAuth ? 'Verifying...' : 'Sign In Now'}
                  </button>
                </div>
              </form>
            )}

            {/* Collapsible Developer OAuth2 Redirect URI & Client Secret Setup */}
            <div className="pt-3 border-t border-white/[0.08] text-left">
              <button
                type="button"
                onClick={() => setShowOAuthSetupDrawer(!showOAuthSetupDrawer)}
                className="w-full text-center text-xs text-indigo-300 hover:text-white font-mono cursor-pointer"
              >
                {showOAuthSetupDrawer
                  ? 'Hide Discord Developer Portal Redirect URLs'
                  : 'Show Redirect URLs for Discord Developer Portal'}
              </button>

              {showOAuthSetupDrawer && (
                <div className="mt-3 p-3.5 rounded-2xl bg-[#090A0F] border border-white/10 space-y-3">
                  <div className="space-y-1.5">
                    <div className="text-[10px] font-mono uppercase text-[#9499B3]">
                      Add Redirect URI in Discord Developer Portal - OAuth2 - Redirects:
                    </div>
                    {[publishedRedirect, currentOriginRedirect]
                      .filter((v, idx, arr) => arr.indexOf(v) === idx)
                      .map((uri) => (
                        <div key={uri} className="flex items-center gap-1.5">
                          <code className="flex-1 px-2.5 py-1.5 rounded-lg bg-[#12141D] border border-white/10 text-[11px] font-mono text-cyan-300 overflow-x-auto whitespace-nowrap">
                            {uri}
                          </code>
                          <button
                            type="button"
                            onClick={() => handleCopyUri(uri)}
                            className="px-2.5 py-1.5 rounded-lg bg-indigo-500/20 text-indigo-200 text-xs font-mono shrink-0 cursor-pointer"
                          >
                            {copiedRedirect === uri ? 'Copied!' : 'Copy'}
                          </button>
                        </div>
                      ))}
                  </div>

                  <form onSubmit={handleSaveSecretSubmit} className="space-y-2">
                    <div className="flex items-center justify-between text-[10px] font-mono uppercase text-[#9499B3]">
                      <span>Discord Client Secret:</span>
                      <span
                        className={
                          oauthConfig?.clientSecretConfigured
                            ? 'text-emerald-400'
                            : 'text-amber-300'
                        }
                      >
                        {oauthConfig?.clientSecretConfigured ? 'Configured' : 'Not Set'}
                      </span>
                    </div>
                    <div className="flex gap-1.5">
                      <input
                        type="password"
                        value={clientSecretInput}
                        onChange={(e) => setClientSecretInput(e.target.value)}
                        placeholder="Update DISCORD_CLIENT_SECRET..."
                        className="flex-1 px-2.5 py-1.5 rounded-lg bg-[#12141D] border border-white/15 text-xs font-mono text-white"
                      />
                      <button
                        type="submit"
                        disabled={savingSecret}
                        className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-xs font-semibold text-white cursor-pointer"
                      >
                        {savingSecret ? '...' : 'Save'}
                      </button>
                    </div>
                  </form>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* =====================================================================
          FLOATING ARCHITECTURE & INTERACTIVE PREVIEW MODAL
         ===================================================================== */}
      {showArchitectureModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div
            role="dialog"
            aria-label="Zenith Bot Interactive Feature Preview"
            className="bg-[#12141D] border border-white/15 rounded-3xl max-w-2xl w-full p-7 shadow-2xl space-y-5 relative animate-zenith-modal"
          >
            <div className="flex items-center justify-between border-b border-white/[0.08] pb-4">
              <div className="flex items-center gap-3">
                <img
                  src={resolvedBotIcon}
                  alt="Zenith Bot"
                  onError={(e) => {
                    (e.currentTarget as HTMLImageElement).src = DEFAULT_ZENITH_BOT_ICON;
                  }}
                  className="w-10 h-10 rounded-xl object-cover border border-white/15"
                />
                <div>
                  <h3 className="font-display font-extrabold text-xl text-white">
                    Zenith Bot — Live Architecture & Modules
                  </h3>
                  <p className="text-xs text-[#9499B3] font-mono">
                    Sideways Prefix · No-Prefix · Slash Commands · 320kbps Audio · 16-Module Anti-Nuke
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowArchitectureModal(false)}
                className="px-2.5 py-1 rounded-lg hover:bg-white/10 text-xs font-semibold text-[#9499B3] hover:text-white flex items-center gap-1 cursor-pointer"
                aria-label="Close Architecture Modal"
              >
                <DiscordEmoji name="white_cancel" id="1555133596652539988" size={14} />
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 text-left">
              <div className="p-4 rounded-2xl bg-[#090A0F] border border-white/[0.08] space-y-1.5">
                <div className="flex items-center gap-2 font-display font-bold text-sm text-white">
                  <DiscordEmoji name="white_antinuke" id="1555133560334061610" size={18} />
                  <span>16-Module Anti-Nuke & Quarantine Wall</span>
                </div>
                <p className="text-xs text-[#9499B3]">
                  Sub-second audit log interception for mass bans, kicks, channels, roles, webhooks, and rogue bot additions.
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-[#090A0F] border border-white/[0.08] space-y-1.5">
                <div className="flex items-center gap-2 font-display font-bold text-sm text-white">
                  <DiscordEmoji name="02music" id="1555133215508009061" animated={true} size={18} />
                  <span>320kbps AAC & Real-Time FFmpeg DSP</span>
                </div>
                <p className="text-xs text-[#9499B3]">
                  Buffered full-song playback, 0%–200% amplified volume, 8D Spatial, Bass Boost, Nightcore, FIFO queue, and Previous rewind.
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-[#090A0F] border border-white/[0.08] space-y-1.5">
                <div className="flex items-center gap-2 font-display font-bold text-sm text-white">
                  <DiscordEmoji name="white_no_prefix" id="1555133762734657581" size={18} />
                  <span>Sideways Command Pipeline</span>
                </div>
                <p className="text-xs text-[#9499B3]">
                  Every command works identically across Prefix (<code>.play</code>), No-Prefix (<code>play</code>), and Slash (<code>/play</code>).
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-[#090A0F] border border-white/[0.08] space-y-1.5">
                <div className="flex items-center gap-2 font-display font-bold text-sm text-white">
                  <DiscordEmoji name="white_settings" id="1555133815536492721" size={18} />
                  <span>Live Bot Avatar & Nickname Sync</span>
                </div>
                <p className="text-xs text-[#9499B3]">
                  Change Zenith Bot&apos;s PFP and nickname via <code>.botavatar</code>, <code>/botavatar</code>, or direct image upload in the dashboard.
                </p>
              </div>
            </div>

            <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-white/[0.08]">
              <button
                type="button"
                onClick={() => {
                  setShowArchitectureModal(false);
                  setShowOpeningSplash(true);
                }}
                className="px-4 py-2 rounded-xl bg-white/[0.06] hover:bg-white/[0.12] text-xs font-semibold text-cyan-200 cursor-pointer"
              >
                Replay Opening Animation
              </button>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setShowArchitectureModal(false);
                    handleDashboardClick();
                  }}
                  className="px-5 py-2 rounded-xl bg-[#5865F2] hover:bg-[#4752C4] text-xs font-bold text-white cursor-pointer"
                >
                  Open Control Dashboard
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
