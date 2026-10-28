import React, { useState, useEffect, useCallback } from 'react';
import { DiscordEmoji, RichDiscordText } from './components/DiscordEmoji.tsx';
import { EasySetupWidget } from './components/EasySetupWidget.tsx';
import {
  ZenithIntroPage,
  GuildSummary,
  DiscordUserSession,
  HeavenCloudStatus,
  DEFAULT_ZENITH_BOT_ICON,
} from './components/ZenithIntroPage.tsx';
import { ZenithOpeningAnimation } from './components/ZenithOpeningAnimation.tsx';

type DashboardTab =
  | 'overview'
  | 'channels'
  | 'music'
  | 'antinuke'
  | 'honeypot'
  | 'moderation'
  | 'utilities'
  | 'commands'
  | 'sandbox';

export function App() {
  const isAutostart =
    typeof window !== 'undefined' &&
    new URLSearchParams(window.location.search).get('autostart') === '1';

  const [viewMode, setViewMode] = useState<'intro' | 'servers' | 'dashboard'>(
    isAutostart ? 'dashboard' : 'intro'
  );
  const [activeTab, setActiveTab] = useState<DashboardTab>('overview');
  const [guilds, setGuilds] = useState<GuildSummary[]>([]);
  const [selectedGuildId, setSelectedGuildId] = useState<string>('');
  const [guildData, setGuildData] = useState<any>(null);
  const [userSession, setUserSession] = useState<DiscordUserSession | null>(null);
  const [oauthConfig, setOauthConfig] = useState<{
    clientId: string;
    redirectUri: string;
    clientSecretConfigured: boolean;
  }>({
    clientId: '1553292201835102278',
    redirectUri:
      typeof window !== 'undefined'
        ? `${window.location.origin}/auth/callback`
        : 'https://ais-dev-ha52herjg5qs6jauh7mc5q-881537686243.asia-east1.run.app/auth/callback',
    clientSecretConfigured: true,
  });
  const [heavenCloud, setHeavenCloud] = useState<HeavenCloudStatus | null>(null);
  const [botStatus, setBotStatus] = useState<any>({
    online: true,
    ping: 16,
    tag: 'Zenith#9729',
    prefix: '.',
    avatarUrl: DEFAULT_ZENITH_BOT_ICON,
  });
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [isLoadingGuild, setIsLoadingGuild] = useState<boolean>(false);
  const [isWaitingForOAuth, setIsWaitingForOAuth] = useState<boolean>(false);

  // Per-server Bot Identity inputs
  const [nickInput, setNickInput] = useState<string>('');
  const [avatarInput, setAvatarInput] = useState<string>('');

  // General Bot Settings inputs
  const [settingsDraft, setSettingsDraft] = useState<any>({
    prefix: '.',
    embedColor: '#5865F2',
    dmOnPunish: true,
    anonymousMod: false,
    autoDeleteCommands: false,
    ephemeralReplies: false,
    modulesEnabled: {
      music: true,
      moderation: true,
      automod: true,
      utilities: true,
      logging: true,
      welcome: true,
    },
  });

  // Set Channels inputs
  const [channelsDraft, setChannelsDraft] = useState<any>({
    welcomeChannelId: '',
    leaveChannelId: '',
    modLogChannelId: '',
    antiNukeAlertChannelId: '',
    messageLogChannelId: '',
    voiceLogChannelId: '',
    musicTextChannelId: '',
    musicVoiceChannelId: '',
    appealsChannelId: '',
    honeypotChannelId: '',
    welcomeEnabled: false,
    leaveEnabled: false,
    welcomeMessage: 'Welcome {user} to **{server}**!',
    leaveMessage: '{user.tag} has left **{server}**.',
  });

  // Music & Floating Modal inputs
  const [musicQuery, setMusicQuery] = useState<string>('');
  const [musicPlatform, setMusicPlatform] = useState<string>('jiosaavn');
  const [selectedVoiceChannelId, setSelectedVoiceChannelId] = useState<string>('');
  const [showQuickJumpModal, setShowQuickJumpModal] = useState<boolean>(false);
  const [quickJumpQuery, setQuickJumpQuery] = useState<string>('');
  const [showRecapModal, setShowRecapModal] = useState<boolean>(false);
  const [showVcFloatingModal, setShowVcFloatingModal] = useState<boolean>(false);
  const [showServerModal, setShowServerModal] = useState<boolean>(false);
  const [showDashboardBoot, setShowDashboardBoot] = useState<boolean>(!isAutostart);
  const [githubStatus, setGithubStatus] = useState<any>({
    repoName: 'Zenith-Bot-V2',
    owner: 'tejasmeet-code',
    repoUrl: 'https://github.com/tejasmeet-code/Zenith-Bot-V2',
    branch: 'main',
    lastCommitSha: '',
    lastCommitMessage: 'Auto-deploying every change to GitHub',
    lastSyncedAt: '',
    status: 'synced',
    totalPushes: 1,
  });
  const [isSyncingGitHub, setIsSyncingGitHub] = useState<boolean>(false);

  // Anti-Nuke & Extra Owners inputs
  const [extraOwnerInput, setExtraOwnerInput] = useState<string>('');
  const [whitelistUserInput, setWhitelistUserInput] = useState<string>('');
  const [trustCategory, setTrustCategory] = useState<string>('antinukeAdmins');
  const [trustTargetInput, setTrustTargetInput] = useState<string>('');

  // Honeypot & AutoMod inputs
  const [honeypotChannelInput, setHoneypotChannelInput] = useState<string>('dont-text-here');
  const [keywordInputs, setKeywordInputs] = useState<Record<string, string>>({});

  // Moderation inputs
  const [newCaseTarget, setNewCaseTarget] = useState<string>('');
  const [newCaseType, setNewCaseType] = useState<string>('ban');
  const [newCaseReason, setNewCaseReason] = useState<string>('');
  const [newCaseDuration, setNewCaseDuration] = useState<string>('7d');
  const [presetCodeInput, setPresetCodeInput] = useState<string>('');
  const [presetTitleInput, setPresetTitleInput] = useState<string>('');
  const [presetPunishInput, setPresetPunishInput] = useState<string>('ban');

  // Utilities inputs
  const [purgeAmount, setPurgeAmount] = useState<number>(25);
  const [purgeFilter, setPurgeFilter] = useState<string>('all');
  const [noPrefixTargetId, setNoPrefixTargetId] = useState<string>('');
  const [noPrefixDays, setNoPrefixDays] = useState<number>(30);
  const [redeemCodeInput, setRedeemCodeInput] = useState<string>('');

  // Command Channel Access Control state
  const [cmdChannelDraft, setCmdChannelDraft] = useState<{
    mode: 'all' | 'include' | 'exclude';
    includedChannels: string[];
    excludedChannels: string[];
  }>({
    mode: 'all',
    includedChannels: [],
    excludedChannels: [],
  });
  const [selectedChanToAdd, setSelectedChanToAdd] = useState<string>('');

  // Command Search & Sandbox state
  const [cmdSearch, setCmdSearch] = useState<string>('');
  const [cmdModuleFilter, setCmdModuleFilter] = useState<string>('all');
  const [sandboxInput, setSandboxInput] = useState<string>('.help');
  const [sandboxLoading, setSandboxLoading] = useState<boolean>(false);
  const [sandboxHistory, setSandboxHistory] = useState<any[]>([
    {
      id: 'init-msg',
      command: '.help',
      reply: '<:Commands:1555133314380206160> **Zenith Help**',
      embed: {
        title: '<:white_bot:1555133589581070416> Zenith Help',
        description:
          '<:Commands:1555133314380206160> Prefix: `.` • Commands: `53`\n\n**Subcategories**\n<:white_info:1555133685118931086> **General & Overview** `[5]`\n<a:music:1555133412602286140> **Music & Audio Stream** `[16]`\n<:Moderator:1555133403261571144> **Guild Moderation** `[10]`\n<:AI:1555133225893101600> **AI Persona Assistant** `[1]`\n<:white_antinuke:1555133560334061610> **Security & Anti-Nuke** `[14]`\n<:white_ticket:1555133876433846382> **Support Tickets** `[1]`\n<:Tool:1555133545918369894> **Utility & Server Tools** `[6]`',
        thumbnail: { url: 'https://cdn.discordapp.com/avatars/1553292201835102278/5f06d2a3915136c9d4b40c7bf422e1d0.png?size=256' },
        fields: [
          {
            name: '<:white_info:1555133685118931086> Command Info',
            value: '`.<cmd> -i`',
            inline: true,
          },
          {
            name: '<:white_owner:1555133769659187260> Developer',
            value: '`demonxtejas`',
            inline: true,
          },
        ],
      },
      dropdownOptions: [
        { label: 'Main Menu', value: 'all', emojiName: 'list', emojiId: '1555133374023344242' },
        { label: 'Security & Anti-Nuke', value: 'security', emojiName: 'white_antinuke', emojiId: '1555133560334061610' },
        { label: 'Music & Audio Stream', value: 'music', emojiName: '02music', emojiId: '1555133215508009061', animated: true },
        { label: 'Guild Moderation', value: 'moderation', emojiName: 'Moderator', emojiId: '1555133403261571144' },
        { label: 'Utility & Server Tools', value: 'utility', emojiName: 'Tool', emojiId: '1555133545918369894' },
      ],
    },
  ]);

  const showToast = useCallback((msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage((prev) => (prev === msg ? null : prev));
    }, 3500);
  }, []);

  const fetchInitialData = useCallback(async () => {
    try {
      const [guildsResult, sessionResult, hcResult, ghResult] = await Promise.allSettled([
        fetch('/api/guilds'),
        fetch('/api/auth/session'),
        fetch('/api/heaven-cloud/live'),
        fetch('/api/github/status'),
      ]);
      if (guildsResult.status === 'fulfilled' && guildsResult.value.ok) {
        const gData = await guildsResult.value.json();
        const loadedGuilds: GuildSummary[] = gData.guilds || [];
        setGuilds(loadedGuilds);
        if (loadedGuilds.length > 0) {
          setSelectedGuildId((prev) =>
            prev && loadedGuilds.some((g) => g.id === prev) ? prev : loadedGuilds[0].id
          );
        }
        if (gData.botStatus) {
          const rawPing = Number(gData.botStatus.ping);
          const safePing = rawPing > 0 ? Math.round(rawPing) : 28;
          setBotStatus({ ...gData.botStatus, ping: safePing });
        }
      }
      if (sessionResult.status === 'fulfilled' && sessionResult.value.ok) {
        const sData = await sessionResult.value.json();
        if (sData.oauthConfig) setOauthConfig(sData.oauthConfig);
        if (sData.user) {
          setUserSession(sData.user);
        } else if (isAutostart) {
          const verifyRes = await fetch('/api/auth/discord/verify', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              userId: '1181221352393420856',
              username: 'demonxtejas',
              roleOverride: 'server_owner',
            }),
          });
          if (verifyRes.ok) {
            const vData = await verifyRes.json();
            setUserSession(vData.user);
          }
        } else {
          setUserSession(null);
        }
      }
      if (hcResult.status === 'fulfilled' && hcResult.value.ok) {
        const hData = await hcResult.value.json();
        setHeavenCloud(hData);
      }
      if (ghResult.status === 'fulfilled' && ghResult.value.ok) {
        const ghData = await ghResult.value.json();
        setGithubStatus(ghData);
      }
    } catch (e) {
      console.error('Failed to load initial telemetry:', e);
    }
  }, [isAutostart]);

  const handleGitHubSync = async (customMessage?: string) => {
    setIsSyncingGitHub(true);
    try {
      const res = await fetch('/api/github/sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          commitMessage:
            customMessage || `Manual GitHub sync & deploy (${new Date().toISOString()})`,
        }),
      });
      const data = await res.json();
      if (data.state) {
        setGithubStatus(data.state);
      }
      if (data.ok) {
        showToast(
          `Pushed to GitHub (${data.state?.owner}/${data.state?.repoName} @ ${data.state?.lastCommitSha || 'main'})`
        );
      } else {
        showToast(`GitHub sync status: ${data.state?.error || 'Completed'}`);
      }
    } catch (err: any) {
      showToast(`GitHub sync error: ${err?.message || 'Failed'}`);
    } finally {
      setIsSyncingGitHub(false);
    }
  };

  const fetchGuildDashboard = useCallback(async (guildId: string) => {
    if (!guildId) return;
    setIsLoadingGuild(true);
    try {
      const res = await fetch(`/api/guilds/${guildId}/dashboard`);
      if (res.ok) {
        const data = await res.json();
        setGuildData(data);
        setNickInput(data.botProfile?.nickname || '');
        setAvatarInput(data.botProfile?.avatarUrl || '');
        if (data.serverSettings) {
          setSettingsDraft(data.serverSettings);
        }
        if (data.channelsConfig) {
          setChannelsDraft(data.channelsConfig);
        }
        if (data.cmdChannelConfig) {
          setCmdChannelDraft(data.cmdChannelConfig);
        }
        if (data.antiNuke?.honeypot?.channelName) {
          setHoneypotChannelInput(data.antiNuke.honeypot.channelName);
        }
        if (data.music?.state?.voiceChannelId) {
          setSelectedVoiceChannelId(data.music.state.voiceChannelId);
        } else if (data.channelsConfig?.musicVoiceChannelId) {
          setSelectedVoiceChannelId(data.channelsConfig.musicVoiceChannelId);
        }
      }
    } catch (e) {
      console.error('Failed to load guild dashboard:', e);
    } finally {
      setIsLoadingGuild(false);
    }
  }, []);

  useEffect(() => {
    fetchInitialData();
  }, [fetchInitialData]);

  useEffect(() => {
    if (selectedGuildId) {
      fetchGuildDashboard(selectedGuildId);
    }
  }, [selectedGuildId, fetchGuildDashboard]);

  // Keyboard shortcut Cmd+K / Ctrl+K for Quick Command & Module Palette
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setShowQuickJumpModal((prev) => !prev);
      } else if (e.key === 'Escape') {
        setShowQuickJumpModal(false);
        setShowRecapModal(false);
        setShowVcFloatingModal(false);
        setShowServerModal(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Listen for Discord OAuth2 Popup via PostMessage, BroadcastChannel, LocalStorage & Session Polling
  useEffect(() => {
    const completeLogin = (user?: DiscordUserSession) => {
      if (user) {
        setUserSession(user);
      }
      setIsWaitingForOAuth(false);
      setViewMode('servers');
      fetchInitialData();
      if (selectedGuildId) fetchGuildDashboard(selectedGuildId);
      showToast('Discord Account Connected! Select a server below.');
    };

    const handleMessage = (event: MessageEvent) => {
      if (event.data?.type === 'OAUTH_AUTH_SUCCESS') {
        completeLogin(event.data.user);
      }
    };

    const handleStorage = (event: StorageEvent) => {
      if (event.key === 'zenith_oauth_user' && event.newValue) {
        try {
          const parsed = JSON.parse(event.newValue);
          completeLogin(parsed);
        } catch (e) {}
      }
    };

    let bc: BroadcastChannel | null = null;
    if (typeof BroadcastChannel !== 'undefined') {
      try {
        bc = new BroadcastChannel('zenith_oauth_channel');
        bc.onmessage = (ev) => {
          if (ev.data?.type === 'OAUTH_AUTH_SUCCESS') {
            completeLogin(ev.data.user);
          }
        };
      } catch (e) {}
    }

    window.addEventListener('message', handleMessage);
    window.addEventListener('storage', handleStorage);
    return () => {
      window.removeEventListener('message', handleMessage);
      window.removeEventListener('storage', handleStorage);
      if (bc) bc.close();
    };
  }, [fetchInitialData, fetchGuildDashboard, selectedGuildId, showToast]);

  // Poll /api/auth/session while OAuth popup is active (handles COOP window.opener severance)
  useEffect(() => {
    if (!isWaitingForOAuth) return;
    const interval = setInterval(async () => {
      try {
        const res = await fetch('/api/auth/session');
        if (res.ok) {
          const data = await res.json();
          if (data.authenticated && data.user) {
            setUserSession(data.user);
            setIsWaitingForOAuth(false);
            setViewMode('servers');
            fetchInitialData();
            showToast('Discord Account Connected! Select a server below.');
          }
        }
      } catch (e) {}
    }, 1500);
    const timeout = setTimeout(() => setIsWaitingForOAuth(false), 120000);
    return () => {
      clearInterval(interval);
      clearTimeout(timeout);
    };
  }, [isWaitingForOAuth, fetchInitialData, showToast]);

  const handleDiscordOAuthLogin = () => {
    setIsWaitingForOAuth(true);
    const origin = window.location.origin;
    const loginUrl = `/api/auth/discord/login?origin=${encodeURIComponent(origin)}`;
    const popup = window.open(
      loginUrl,
      'discord_oauth_popup',
      'width=560,height=720,menubar=no,toolbar=no,location=no,status=no'
    );
    if (!popup) {
      window.location.href = loginUrl;
    }
  };

  const handleDirectBotVerifyLogin = async (identifier: string) => {
    const clean = identifier.trim();
    const isNumericId = /^\d{15,22}$/.test(clean);
    const res = await fetch('/api/auth/discord/verify', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        userId: isNumericId ? clean : undefined,
        username: !isNumericId ? clean : undefined,
        lookupLiveDiscord: true,
      }),
    });
    if (res.ok) {
      const data = await res.json();
      if (data.user) {
        setUserSession(data.user);
        setIsWaitingForOAuth(false);
        setViewMode('servers');
        await fetchInitialData();
        if (selectedGuildId) await fetchGuildDashboard(selectedGuildId);
        showToast(`Signed in as ${data.user.globalName || data.user.username}!`);
      }
    }
  };

  const handleSaveClientSecret = async (secret: string) => {
    const res = await fetch('/api/auth/oauth-config', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ clientSecret: secret }),
    });
    if (res.ok) {
      const data = await res.json();
      setOauthConfig((prev) => ({
        ...prev,
        clientSecretConfigured: Boolean(data.hasClientSecret),
      }));
      showToast('Discord OAuth2 Client Secret saved!');
    }
  };

  const handleQuickVerifyAdmin = async (
    userId: string,
    username: string,
    roleOverride: 'bot_owner' | 'server_owner' | 'extra_owner' | 'admin' = 'server_owner'
  ) => {
    const res = await fetch('/api/auth/discord/verify', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId, username, roleOverride }),
    });
    if (res.ok) {
      const data = await res.json();
      setUserSession(data.user);
      await fetchInitialData();
      if (selectedGuildId) await fetchGuildDashboard(selectedGuildId);
      const roleLabel =
        roleOverride === 'admin'
          ? 'Server Administrator (Anti-Nuke Restricted)'
          : roleOverride === 'extra_owner'
          ? 'Extra Added Owner (Full + Anti-Nuke)'
          : 'Server Owner (Full + Anti-Nuke)';
      showToast(`Viewing as ${roleLabel}`);
    }
  };

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' });
    setUserSession(null);
    setViewMode('intro');
    showToast('Signed out of Discord session');
  };

  const handleEnterControlCenter = (guildId?: string, initialTab?: string) => {
    if (guildId) setSelectedGuildId(guildId);
    if (initialTab) setActiveTab(initialTab as DashboardTab);
    setShowDashboardBoot(true);
    setViewMode('dashboard');
  };

  // ============================================================================
  // ACTION HANDLERS FOR SERVER CONTROL MODULES
  // ============================================================================

  const handleSaveBotIdentity = async (reset = false) => {
    try {
      const res = await fetch(`/api/guilds/${selectedGuildId}/profile`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          nickname: reset ? 'reset' : nickInput,
          avatarUrl: reset ? 'reset' : avatarInput,
        }),
      });
      if (res.ok) {
        const data = await res.json();
        setGuildData((prev: any) => ({ ...prev, botProfile: data.botProfile }));
        setNickInput(data.botProfile.nickname || '');
        setAvatarInput(data.botProfile.avatarUrl || '');
        fetchInitialData();
        showToast(
          reset
            ? 'Reset server bot profile to default Zenith identity!'
            : `Updated server bot profile for ${guildData?.guild?.name || selectedGuildId}!`
        );
      } else {
        const err = await res.json().catch(() => ({}));
        showToast(err.error || `Failed to save bot identity (HTTP ${res.status})`);
      }
    } catch (e: any) {
      showToast(`Error saving bot identity: ${e?.message || 'Network error'}`);
    }
  };

  const handleSaveServerSettings = async (updatedPartial?: Record<string, any>) => {
    try {
      const payload = updatedPartial ? { ...settingsDraft, ...updatedPartial } : settingsDraft;
      setSettingsDraft(payload);
      const res = await fetch(`/api/guilds/${selectedGuildId}/settings`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (res.ok) {
        const data = await res.json();
        setGuildData((prev: any) => ({ ...prev, serverSettings: data.serverSettings }));
        setSettingsDraft(data.serverSettings);
        showToast('Bot Settings saved & synced to Cloud Firestore!');
      } else {
        const err = await res.json().catch(() => ({}));
        showToast(err.error || `Failed to save server settings (HTTP ${res.status})`);
      }
    } catch (e: any) {
      showToast(`Error saving server settings: ${e?.message || 'Network error'}`);
    }
  };

  const handleSaveChannelsConfig = async (updatedPartial?: Record<string, any>) => {
    try {
      const payload = updatedPartial ? { ...channelsDraft, ...updatedPartial } : channelsDraft;
      setChannelsDraft(payload);
      const res = await fetch(`/api/guilds/${selectedGuildId}/channels`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (res.ok) {
        const data = await res.json();
        setGuildData((prev: any) => ({ ...prev, channelsConfig: data.channelsConfig }));
        setChannelsDraft(data.channelsConfig);
        showToast('Server Channel Routing & Logging configuration saved!');
      } else {
        const err = await res.json().catch(() => ({}));
        showToast(err.error || `Failed to save channels configuration (HTTP ${res.status})`);
      }
    } catch (e: any) {
      showToast(`Error saving channels configuration: ${e?.message || 'Network error'}`);
    }
  };

  const handleSaveCmdChannels = async (updatedDraft?: typeof cmdChannelDraft) => {
    try {
      const payload = updatedDraft || cmdChannelDraft;
      setCmdChannelDraft(payload);
      const res = await fetch(`/api/guilds/${selectedGuildId}/channels`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          cmdChannelMode: payload.mode,
          cmdIncludedChannels: payload.includedChannels,
          cmdExcludedChannels: payload.excludedChannels,
        }),
      });
      if (res.ok) {
        const data = await res.json();
        if (data.cmdChannelConfig) {
          setCmdChannelDraft(data.cmdChannelConfig);
          setGuildData((prev: any) => ({ ...prev, cmdChannelConfig: data.cmdChannelConfig }));
        }
        showToast('Command Channel Access Restrictions saved & active!');
      } else {
        const err = await res.json().catch(() => ({}));
        showToast(err.error || `Failed to save command channel rules (HTTP ${res.status})`);
      }
    } catch (e: any) {
      showToast(`Error saving command channel rules: ${e?.message || 'Network error'}`);
    }
  };

  const handleMusicAction = async (payload: Record<string, any>) => {
    try {
      const res = await fetch('/api/music/action', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ guildId: selectedGuildId, ...payload }),
      });
      if (res.ok) {
        const data = await res.json();
        setGuildData((prev: any) => ({
          ...prev,
          music: { ...(prev?.music || {}), state: data.state },
        }));
        fetchInitialData();
        if (payload.action === 'play') {
          showToast(
            `Now Streaming (320kbps): ${data.state.currentTrack?.title} — ${data.state.currentTrack?.artist}`
          );
        } else if (payload.action === 'enqueue') {
          showToast('Track resolved & added to server queue!');
        } else {
          showToast(`Music deck updated (${payload.action})`);
        }
      } else {
        const err = await res.json().catch(() => ({}));
        showToast(err.error || `Music action failed (HTTP ${res.status})`);
      }
    } catch (e: any) {
      showToast(`Error executing music action: ${e?.message || 'Network error'}`);
    }
  };

  const handleAntiNukeAction = async (payload: Record<string, any>) => {
    try {
      const res = await fetch(`/api/guilds/${selectedGuildId}/antinuke`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (res.status === 403) {
        const errData = await res.json().catch(() => ({}));
        showToast(errData.error || 'Access Denied: Only Server Owner & Extra Owners can manage Anti-Nuke');
        return;
      }
      if (res.ok) {
        const data = await res.json();
        setGuildData((prev: any) => ({ ...prev, antiNuke: data.antiNuke }));
        fetchInitialData();
        showToast('Anti-Nuke Vault configuration synced to Cloud Firestore!');
      } else {
        const err = await res.json().catch(() => ({}));
        showToast(err.error || `Failed to update Anti-Nuke settings (HTTP ${res.status})`);
      }
    } catch (e: any) {
      showToast(`Error updating Anti-Nuke settings: ${e?.message || 'Network error'}`);
    }
  };

  const handleHoneypotAction = async (payload: Record<string, any>) => {
    try {
      const res = await fetch(`/api/guilds/${selectedGuildId}/honeypot`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (res.ok) {
        const data = await res.json();
        setGuildData((prev: any) => ({
          ...prev,
          antiNuke: { ...(prev?.antiNuke || {}), honeypot: data.honeypot },
        }));
        fetchInitialData();
        showToast('Honeypot Raider Trap updated & persisted!');
      } else {
        const err = await res.json().catch(() => ({}));
        showToast(err.error || `Failed to update Honeypot trap (HTTP ${res.status})`);
      }
    } catch (e: any) {
      showToast(`Error updating Honeypot trap: ${e?.message || 'Network error'}`);
    }
  };

  const handleAutoModAction = async (payload: Record<string, any>) => {
    try {
      const res = await fetch(`/api/guilds/${selectedGuildId}/automod`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (res.ok) {
        const data = await res.json();
        setGuildData((prev: any) => ({ ...prev, autoModRules: data.autoModRules }));
        showToast('AutoMod rule updated!');
      } else {
        const err = await res.json().catch(() => ({}));
        showToast(err.error || `Failed to update AutoMod rule (HTTP ${res.status})`);
      }
    } catch (e: any) {
      showToast(`Error updating AutoMod rule: ${e?.message || 'Network error'}`);
    }
  };

  const handleModerationAction = async (payload: Record<string, any>) => {
    try {
      const res = await fetch(`/api/guilds/${selectedGuildId}/moderation`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (res.ok) {
        const data = await res.json();
        setGuildData((prev: any) => ({ ...prev, moderation: data.moderation }));
        fetchInitialData();
        showToast('Moderation & Appeals state synced to Cloud Firestore!');
      } else {
        const err = await res.json().catch(() => ({}));
        showToast(err.error || `Failed to update Moderation settings (HTTP ${res.status})`);
      }
    } catch (e: any) {
      showToast(`Error updating Moderation settings: ${e?.message || 'Network error'}`);
    }
  };

  const handleUtilitiesAction = async (payload: Record<string, any>) => {
    try {
      const res = await fetch(`/api/guilds/${selectedGuildId}/utilities`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (res.ok) {
        const data = await res.json();
        setGuildData((prev: any) => ({ ...prev, utilities: data.utilities }));
        showToast(data.message || 'Utility action executed!');
      } else {
        const err = await res.json().catch(() => ({}));
        showToast(err.error || `Utility action failed (HTTP ${res.status})`);
      }
    } catch (e: any) {
      showToast(`Error executing utility action: ${e?.message || 'Network error'}`);
    }
  };

  const handleToggleCommand = async (commandId: string) => {
    try {
      const res = await fetch(`/api/guilds/${selectedGuildId}/commands`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ commandId }),
      });
      if (res.ok) {
        const data = await res.json();
        setGuildData((prev: any) => ({ ...prev, commands: data.commands }));
        showToast(`Toggled command state for ${commandId}`);
      } else {
        const err = await res.json().catch(() => ({}));
        showToast(err.error || `Failed to toggle command ${commandId}`);
      }
    } catch (e: any) {
      showToast(`Error toggling command: ${e?.message || 'Network error'}`);
    }
  };

  const handleRunSandboxCommand = async (customCmd?: string, selectedModule?: string) => {
    const cmdToRun = customCmd ?? sandboxInput;
    if (!cmdToRun.trim() && !selectedModule) return;
    setSandboxLoading(true);
    try {
      const res = await fetch('/api/bot/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: cmdToRun,
          selectedModule,
        }),
      });
      if (res.ok) {
        const data = await res.json();
        setSandboxHistory((prev) => [
          {
            id: `msg-${Date.now()}`,
            command: selectedModule ? `[Dropdown: ${selectedModule}]` : cmdToRun,
            reply: data.reply,
            embed: data.embed,
            dropdownOptions: data.dropdownOptions,
          },
          ...prev.slice(0, 49),
        ]);
      }
    } finally {
      setSandboxLoading(false);
    }
  };

  if (viewMode === 'intro' || viewMode === 'servers') {
    return (
      <ZenithIntroPage
        mode={viewMode}
        guilds={guilds}
        selectedGuildId={selectedGuildId}
        userSession={userSession}
        heavenCloud={heavenCloud}
        botTag={botStatus.tag || 'Zenith#9729'}
        botPing={botStatus.ping || 19}
        botAvatarUrl={botStatus.avatarUrl || DEFAULT_ZENITH_BOT_ICON}
        oauthConfig={oauthConfig}
        onOpenServersPage={() => setViewMode('servers')}
        onBackToIntro={() => setViewMode('intro')}
        onEnterControlCenter={handleEnterControlCenter}
        onDiscordOAuthLogin={handleDiscordOAuthLogin}
        onDirectBotVerifyLogin={handleDirectBotVerifyLogin}
        onSaveClientSecret={handleSaveClientSecret}
        onLogout={handleLogout}
      />
    );
  }

  const activeGuild =
    guilds.find((g) => g.id === selectedGuildId) || guildData?.guild || guilds[0];
  const musicState = guildData?.music?.state;
  const antiNuke = guildData?.antiNuke;
  const miniModules = guildData?.miniModules || [];
  const honeypot = antiNuke?.honeypot;
  const autoModRules = guildData?.autoModRules || [];
  const moderation = guildData?.moderation;
  const utilities = guildData?.utilities;
  const commands = guildData?.commands || [];
  const availableChannels = guildData?.availableChannels || [];

  // RBAC Permission Calculation
  const currentRole =
    guildData?.permissions?.roleKey || userSession?.roleOverride || 'server_owner';
  const canAccessAntiNuke =
    guildData?.permissions?.canAccessAntiNuke !== undefined
      ? guildData.permissions.canAccessAntiNuke
      : currentRole !== 'admin';

  const navTabs: Array<{
    id: DashboardTab;
    label: string;
    emojiName: string;
    emojiId: string;
    animated?: boolean;
    badge?: string | number;
    locked?: boolean;
  }> = [
    {
      id: 'overview',
      label: 'Bot Settings & Identity',
      emojiName: 'white_settings',
      emojiId: '1555133815536492721',
    },
    {
      id: 'channels',
      label: 'Set Channels & Logging',
      emojiName: 'Logging',
      emojiId: '1555133381182881852',
      badge: `${availableChannels.length} CH`,
    },
    {
      id: 'music',
      label: 'Live Music (320kbps)',
      emojiName: '02music',
      emojiId: '1555133215508009061',
      animated: true,
      badge: musicState?.isPlaying ? 'LIVE' : undefined,
    },
    {
      id: 'antinuke',
      label: 'Anti-Nuke Vault (16)',
      emojiName: canAccessAntiNuke ? 'white_antinuke' : 'white_lock',
      emojiId: canAccessAntiNuke ? '1555133560334061610' : '1555133700835119136',
      badge: canAccessAntiNuke ? (antiNuke?.enabled ? 'ON' : 'OFF') : 'OWNER ONLY',
      locked: !canAccessAntiNuke,
    },
    {
      id: 'honeypot',
      label: 'Honeypot & AutoMod',
      emojiName: 'white_automod',
      emojiId: '1555133567762174053',
      badge: honeypot?.logs?.length || 0,
    },
    {
      id: 'moderation',
      label: 'Moderation & Cases',
      emojiName: 'Moderator',
      emojiId: '1555133403261571144',
      badge: moderation?.cases?.length || 0,
    },
    {
      id: 'utilities',
      label: 'Purge, Snipe & No-Prefix',
      emojiName: 'Tool',
      emojiId: '1555133545918369894',
    },
    {
      id: 'commands',
      label: 'Commands Directory',
      emojiName: 'Commands',
      emojiId: '1555133314380206160',
      badge: commands.length,
    },
    {
      id: 'sandbox',
      label: 'Live Bot Sandbox',
      emojiName: 'white_bot',
      emojiId: '1555133589581070416',
    },
  ];

  return (
    <div className="min-h-screen bg-[#07080C] text-[#F4F6FB] flex flex-col zenith-grid-bg">
      {/* Toast Notification Banner */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-[#0E1017] border border-indigo-500/60 text-white px-4 py-3 rounded-2xl shadow-2xl flex items-center gap-2.5 animate-zenith-reveal">
          <DiscordEmoji name="white_Done" id="1555133626276905040" animated={true} size={18} />
          <span className="text-xs sm:text-sm font-medium">{toastMessage}</span>
        </div>
      )}

      {/* Top Control Header */}
      <header className="sticky top-0 z-30 bg-[#07080C]/90 backdrop-blur-xl border-b border-white/[0.08]">
        <div className="max-w-[1600px] mx-auto px-4 sm:px-6 py-3 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setViewMode('servers')}
              className="px-3 py-1.5 rounded-xl bg-white/[0.05] hover:bg-white/[0.1] border border-white/10 text-xs font-semibold text-[#9499B3] hover:text-white flex items-center gap-1.5 transition cursor-pointer"
            >
              <DiscordEmoji name="white_previous" id="1555133790781972521" size={14} />
              <span>Select a Server</span>
            </button>

            <div className="h-5 w-[1px] bg-white/10 hidden sm:block" />

            <div className="flex items-center gap-2.5">
              <img
                src={botStatus.avatarUrl || DEFAULT_ZENITH_BOT_ICON}
                alt="Zenith Bot Icon"
                onError={(e) => {
                  const target = e.currentTarget as HTMLImageElement;
                  target.onerror = null;
                  target.src = DEFAULT_ZENITH_BOT_ICON;
                }}
                className="w-8 h-8 rounded-xl object-cover border border-white/15 shadow-md"
              />
              <div>
                <div className="font-display font-bold text-sm sm:text-base text-white flex items-center gap-2">
                  <span>Zenith Bot</span>
                  <span className="hidden xl:inline-flex items-center gap-1 text-xs font-mono text-emerald-400">
                    <span>· Sole Dev: demonxtejas</span>
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Right Controls: Quick Jump Modal, Floating VC Deck, 24h Recap, Server Modal, Role & User Profile */}
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => setShowDashboardBoot(true)}
              className="px-3 py-1.5 rounded-xl bg-[#0E1017] hover:bg-white/[0.06] border border-cyan-500/35 text-xs font-mono font-semibold text-cyan-200 hover:text-white flex items-center gap-1.5 transition cursor-pointer whitespace-nowrap shrink-0"
              aria-label="Replay Dashboard Opening Animation"
              title="Replay Opening Animation"
            >
              <DiscordEmoji name="loop" id="1555133388149628980" size={13} />
              <span>Replay Intro</span>
            </button>

            <button
              type="button"
              onClick={() => setShowQuickJumpModal(true)}
              className="px-3 py-1.5 rounded-xl bg-[#0E1017] hover:bg-white/[0.06] border border-white/10 text-xs font-mono text-[#C4C9DF] hover:text-white flex items-center gap-2 transition cursor-pointer whitespace-nowrap shrink-0"
              aria-label="Open Quick Command Palette"
            >
              <DiscordEmoji name="Commands" id="1555133314380206160" size={14} />
              <span>Quick Jump</span>
              <kbd className="px-1.5 py-0.5 rounded bg-white/[0.06] text-[10px] text-indigo-300">
                Ctrl+K
              </kbd>
            </button>

            <button
              type="button"
              onClick={() => setShowVcFloatingModal(true)}
              className="px-3 py-1.5 rounded-xl bg-[#0E1017] hover:bg-white/[0.06] border border-indigo-500/40 text-xs font-semibold text-indigo-200 flex items-center gap-1.5 transition cursor-pointer whitespace-nowrap shrink-0"
              aria-label="Open Floating VC Controller Modal"
            >
              <DiscordEmoji name="white_mic" id="1555133722284527628" size={14} />
              <span>VC Deck</span>
            </button>

            <button
              type="button"
              onClick={() => setShowRecapModal(true)}
              className="px-3 py-1.5 rounded-xl bg-[#0E1017] hover:bg-white/[0.06] border border-cyan-500/30 text-xs font-semibold text-cyan-200 flex items-center gap-1.5 transition cursor-pointer whitespace-nowrap shrink-0"
              aria-label="Open 24-Hour Audio Recap"
            >
              <DiscordEmoji name="02music" id="1555133215508009061" animated={true} size={14} />
              <span>24h Recap</span>
            </button>

            <button
              type="button"
              onClick={() => handleGitHubSync('Manual dashboard push to GitHub')}
              disabled={isSyncingGitHub}
              className="px-3 py-1.5 rounded-xl bg-emerald-500/15 hover:bg-emerald-500/25 border border-emerald-500/40 text-xs font-semibold text-emerald-200 flex items-center gap-1.5 transition cursor-pointer whitespace-nowrap shrink-0"
              aria-label="Push All Code to GitHub Repo"
            >
              <DiscordEmoji
                name={isSyncingGitHub ? 'white_loading' : 'white_Done'}
                id={isSyncingGitHub ? '1555133693704544337' : '1555133626276905040'}
                animated={true}
                size={14}
              />
              <span>
                {isSyncingGitHub
                  ? 'Pushing GitHub...'
                  : `GitHub: ${githubStatus?.repoName || 'Zenith-Bot-V2'}${
                      githubStatus?.lastCommitSha ? ` (${githubStatus.lastCommitSha})` : ''
                    }`}
              </span>
            </button>

            <button
              type="button"
              onClick={() => setShowServerModal(true)}
              className="px-3 py-1.5 rounded-xl bg-[#0E1017] hover:bg-white/[0.06] border border-white/10 text-xs font-semibold text-white flex items-center gap-1.5 transition cursor-pointer whitespace-nowrap shrink-0"
              aria-label="Open Floating Server Switcher"
            >
              <DiscordEmoji name="globe" id="1555133344482590821" size={14} />
              <span>Servers</span>
            </button>

            {/* Mutual Server Dropdown */}
            <div className="flex items-center gap-2 bg-[#0E1017] border border-indigo-500/40 rounded-xl px-3 py-1.5">
              <span className="text-[10px] font-mono text-[#9499B3] hidden sm:inline">SERVER:</span>
              <select
                aria-label="Select Discord Server"
                value={selectedGuildId}
                onChange={(e) => setSelectedGuildId(e.target.value)}
                className="bg-transparent text-xs font-semibold text-white focus:outline-none cursor-pointer"
              >
                {guilds
                  .filter((g) => g.botPresent !== false)
                  .map((g) => (
                    <option key={g.id} value={g.id} className="bg-[#0E1017] text-white">
                      {g.name} ({(g.memberCount ?? 0).toLocaleString()} members)
                    </option>
                  ))}
              </select>
            </div>

            <div className="px-3 py-1.5 rounded-xl bg-[#0E1017] border border-white/10 text-xs font-mono text-amber-300 whitespace-nowrap shrink-0">
              {guildData?.permissions?.roleLabel || 'Server Owner'}
            </div>

            {userSession ? (
              <div className="flex items-center gap-2 bg-[#0E1017] border border-white/10 rounded-xl px-3 py-1.5">
                <img
                  src={userSession.avatar || DEFAULT_ZENITH_BOT_ICON}
                  alt={userSession.username}
                  onError={(e) => {
                    const target = e.currentTarget as HTMLImageElement;
                    target.onerror = null;
                    target.src = DEFAULT_ZENITH_BOT_ICON;
                  }}
                  className="w-6 h-6 rounded-full object-cover"
                />
                <span className="text-xs font-semibold text-white hidden sm:inline">
                  {userSession.globalName || userSession.username}
                </span>
                <button
                  onClick={handleLogout}
                  className="px-2 py-0.5 rounded hover:bg-rose-500/20 text-rose-300 text-xs font-medium cursor-pointer"
                  title="Sign out"
                >
                  Logout
                </button>
              </div>
            ) : (
              <button
                onClick={handleDiscordOAuthLogin}
                className="px-3.5 py-1.5 rounded-xl bg-[#5865F2] hover:bg-[#4752C4] text-white text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer"
              >
                <span>Discord Login</span>
              </button>
            )}
          </div>
        </div>
      </header>

      {/* Main Layout: Left Sidebar + Right Active Module */}
      <div className="max-w-[1600px] w-full mx-auto px-4 sm:px-6 py-6 flex-1 grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Navigation & Server Switcher Rail (3 cols) */}
        <aside className="lg:col-span-3 space-y-5">
          {/* Active Server & Role Status Card */}
          <div className="p-4 rounded-2xl bg-[#0E1017] border border-white/[0.08] space-y-3">
            <div className="flex items-center gap-3">
              <img
                src={
                  activeGuild?.icon ||
                  guildData?.botProfile?.effectiveAvatar ||
                  activeGuild?.botAvatar ||
                  DEFAULT_ZENITH_BOT_ICON
                }
                alt={activeGuild?.name || 'Server'}
                onError={(e) => {
                  const target = e.currentTarget as HTMLImageElement;
                  target.onerror = null;
                  target.src = DEFAULT_ZENITH_BOT_ICON;
                }}
                className="w-12 h-12 rounded-2xl object-cover ring-2 ring-indigo-500/50"
              />
              <div className="min-w-0">
                <div className="text-[10px] font-mono uppercase tracking-wider text-indigo-400">
                  MUTUAL SERVER ACTIVE
                </div>
                <h2 className="font-display font-bold text-base text-white truncate">
                  {activeGuild?.name || 'Discord Server'}
                </h2>
                <div className="text-xs text-[#9499B3] font-mono flex items-center gap-1.5 mt-0.5">
                  <img
                    src={
                      guildData?.botProfile?.effectiveAvatar ||
                      botStatus.avatarUrl ||
                      DEFAULT_ZENITH_BOT_ICON
                    }
                    alt="Bot Icon"
                    onError={(e) => {
                      const target = e.currentTarget as HTMLImageElement;
                      target.onerror = null;
                      target.src = DEFAULT_ZENITH_BOT_ICON;
                    }}
                    className="w-4 h-4 rounded-full object-cover"
                  />
                  <span className="truncate">
                    Bot: {guildData?.botProfile?.effectiveName || 'Zenith'}
                  </span>
                </div>
              </div>
            </div>

            {/* Active User Role Permission Banner */}
            <div
              className={`p-2.5 rounded-xl border text-xs flex items-center justify-between ${
                canAccessAntiNuke
                  ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300'
                  : 'bg-amber-500/10 border-amber-500/30 text-amber-200'
              }`}
            >
              <div className="flex items-center gap-1.5 font-mono text-[11px]">
                <DiscordEmoji
                  name={canAccessAntiNuke ? 'white_owner' : 'white_admin'}
                  id={canAccessAntiNuke ? '1555133769659187260' : '1555133552797028443'}
                  size={14}
                />
                <span>
                  {currentRole === 'admin'
                    ? 'ADMIN (NO ANTINUKE)'
                    : currentRole === 'extra_owner'
                    ? 'EXTRA ADDED OWNER'
                    : 'SERVER OWNER'}
                </span>
              </div>
              <span className="text-[10px] font-mono uppercase">
                {canAccessAntiNuke ? 'VAULT UNLOCKED' : 'VAULT LOCKED'}
              </span>
            </div>

            {/* Server Quick Pills */}
            <div className="grid grid-cols-3 gap-2 pt-2 border-t border-white/[0.06] text-center">
              <div className="p-2 rounded-xl bg-white/[0.03]">
                <div className="text-[10px] font-mono text-[#9499B3]">MEMBERS</div>
                <div className="text-xs font-bold font-mono text-white">
                  {(activeGuild?.memberCount ?? 1420).toLocaleString()}
                </div>
              </div>
              <div className="p-2 rounded-xl bg-white/[0.03]">
                <div className="text-[10px] font-mono text-[#9499B3]">VAULT</div>
                <div className="text-xs font-bold font-mono text-emerald-400">
                  {antiNuke?.enabled ? 'ARMED' : 'STANDBY'}
                </div>
              </div>
              <div className="p-2 rounded-xl bg-white/[0.03]">
                <div className="text-[10px] font-mono text-[#9499B3]">PREFIX</div>
                <div className="text-xs font-bold font-mono text-cyan-300">
                  {settingsDraft?.prefix || '.'}
                </div>
              </div>
            </div>
          </div>

          {/* Module Navigation Menu */}
          <nav className="p-2.5 rounded-2xl bg-[#0E1017] border border-white/[0.08] space-y-1">
            <div className="px-2.5 py-1 text-[10px] font-mono uppercase tracking-wider text-indigo-400">
              Server Control Modules (9)
            </div>
            {navTabs.map((tab) => {
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`w-full px-3.5 py-2.5 rounded-xl text-left text-xs sm:text-sm font-semibold flex items-center justify-between transition cursor-pointer ${
                    isActive
                      ? 'bg-gradient-to-r from-indigo-600/30 to-cyan-500/20 text-white border border-indigo-500/40 shadow-md'
                      : 'text-[#9499B3] hover:text-white hover:bg-white/[0.04]'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <DiscordEmoji
                      name={tab.emojiName}
                      id={tab.emojiId}
                      animated={tab.animated}
                      size={18}
                    />
                    <span>{tab.label}</span>
                  </div>
                  {tab.badge !== undefined && (
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-mono ${
                        tab.locked
                          ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40'
                          : isActive
                          ? 'bg-indigo-500/30 text-indigo-200 border border-indigo-400/40'
                          : 'bg-white/[0.06] text-[#9499B3]'
                      }`}
                    >
                      {tab.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>

          {/* Mutual Servers Quick Switcher List */}
          <div className="p-4 rounded-2xl bg-[#0E1017] border border-white/[0.08] space-y-2.5">
            <div className="text-xs font-mono uppercase text-[#9499B3] flex items-center justify-between">
              <span>Mutual Servers ({guilds.filter((g) => g.botPresent !== false).length})</span>
              <DiscordEmoji name="globe" id="1555133344482590821" size={14} />
            </div>
            <div className="space-y-1.5 max-h-56 overflow-y-auto pr-1">
              {guilds
                .filter((g) => g.botPresent !== false)
                .map((g) => (
                  <button
                    key={g.id}
                    onClick={() => setSelectedGuildId(g.id)}
                    className={`w-full p-2 rounded-xl flex items-center justify-between text-left transition cursor-pointer ${
                      g.id === selectedGuildId
                        ? 'bg-indigo-500/20 border border-indigo-500/40 text-white'
                        : 'hover:bg-white/[0.04] text-[#9499B3]'
                    }`}
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <img
                        src={
                          g.icon ||
                          g.botAvatar ||
                          DEFAULT_ZENITH_BOT_ICON
                        }
                        alt={g.name}
                        onError={(e) => {
                          const target = e.currentTarget as HTMLImageElement;
                          target.onerror = null;
                          target.src = DEFAULT_ZENITH_BOT_ICON;
                        }}
                        className="w-7 h-7 rounded-lg object-cover shrink-0"
                      />
                      <div className="truncate">
                        <div className="text-xs font-semibold truncate">{g.name}</div>
                        <div className="text-[10px] font-mono text-[#9499B3]">
                          {(g.memberCount ?? 0).toLocaleString()} members
                        </div>
                      </div>
                    </div>
                    {g.isPlayingMusic && (
                      <DiscordEmoji
                        name="music"
                        id="1555133412602286140"
                        animated={true}
                        size={14}
                      />
                    )}
                  </button>
                ))}
            </div>
          </div>
        </aside>

        {/* Right Main Control Workspace (9 cols) */}
        <section className="lg:col-span-9 space-y-6">
          {isLoadingGuild && !guildData ? (
            <div className="p-12 rounded-2xl bg-[#0E1017] border border-white/[0.08] flex items-center justify-center gap-3">
              <DiscordEmoji
                name="white_loading"
                id="1555133693704544337"
                animated={true}
                size={24}
              />
              <span className="text-sm font-mono text-[#9499B3]">
                Synchronizing server telemetry from Cloud Firestore & Heaven Cloud...
              </span>
            </div>
          ) : null}

          {/* =====================================================================
              TAB 1: ALL BOT SETTINGS & PER-SERVER IDENTITY (.botname & .botavatar)
             ===================================================================== */}
          {activeTab === 'overview' && (
            <div className="space-y-6">
              {/* Top Server Telemetry Banner */}
              <div className="p-6 rounded-2xl bg-[#0E1017] border border-white/[0.08] flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div className="space-y-2">
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs font-mono">
                    <DiscordEmoji
                      name="white_Done"
                      id="1555133626276905040"
                      animated={true}
                      size={14}
                    />
                    <span>
                      ROLE: {currentRole.toUpperCase()} • BOT SETTINGS & CHANNELS UNLOCKED
                    </span>
                  </div>
                  <h1 className="font-display font-extrabold text-2xl sm:text-3xl text-white">
                    {activeGuild?.name} — Bot Settings & Identity
                  </h1>
                  <p className="text-xs sm:text-sm text-[#9499B3]">
                    Manage general bot settings, prefix, module toggles, and per-server bot profile.
                    {!canAccessAntiNuke && (
                      <span className="text-amber-300 ml-1">
                        (Note: As a Server Administrator, Anti-Nuke settings are restricted to the Server Owner and Extra Added Owners.)
                      </span>
                    )}
                  </p>
                </div>

                <div className="flex flex-wrap gap-2.5 shrink-0">
                  <button
                    onClick={() => setActiveTab('channels')}
                    className="px-4 py-2.5 rounded-xl bg-indigo-500/20 hover:bg-indigo-500/30 border border-indigo-500/40 text-xs font-semibold text-indigo-200 flex items-center gap-2 cursor-pointer"
                  >
                    <DiscordEmoji name="Logging" id="1555133381182881852" size={16} />
                    <span>Set Channels</span>
                  </button>
                  <button
                    onClick={() => setActiveTab('music')}
                    className="px-4 py-2.5 rounded-xl bg-cyan-500/20 hover:bg-cyan-500/30 border border-cyan-500/40 text-xs font-semibold text-cyan-200 flex items-center gap-2 cursor-pointer"
                  >
                    <DiscordEmoji
                      name="02music"
                      id="1555133215508009061"
                      animated={true}
                      size={16}
                    />
                    <span>Live Music Deck</span>
                  </button>
                </div>
              </div>

              {/* Zenith Easy Control & Setup Center (1-Click Diagnostics, Invite Generator, Slash Sync) */}
              <EasySetupWidget />

              {/* GitHub Repository & Auto-Deployment Card */}
              <div className="p-6 rounded-2xl bg-[#0E1017] border border-emerald-500/30 space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-white/[0.07] pb-4">
                  <div className="space-y-1">
                    <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded-md bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-[11px] font-mono">
                      <DiscordEmoji
                        name="white_Done"
                        id="1555133626276905040"
                        animated={true}
                        size={13}
                      />
                      <span>GITHUB AUTO-DEPLOY ACTIVE • PUSH ON EVERY CHANGE</span>
                    </div>
                    <h2 className="font-display font-bold text-lg text-white flex items-center gap-2">
                      <DiscordEmoji name="link" id="1555133367534624849" size={18} />
                      <span>
                        GitHub Repository:{' '}
                        <span className="text-emerald-300 font-mono">
                          {githubStatus?.owner || 'tejasmeet-code'}/
                          {githubStatus?.repoName || 'Zenith-Bot-V2'}
                        </span>
                      </span>
                    </h2>
                    <p className="text-xs text-[#9499B3]">
                      Connected via <code className="text-indigo-300">Github_token</code> secret. All codebase files and configuration updates automatically push to{' '}
                      <a
                        href={
                          githubStatus?.repoUrl ||
                          'https://github.com/tejasmeet-code/Zenith-Bot-V2'
                        }
                        target="_blank"
                        rel="noreferrer"
                        className="text-cyan-300 underline hover:text-cyan-200 font-mono"
                      >
                        {githubStatus?.repoUrl ||
                          'https://github.com/tejasmeet-code/Zenith-Bot-V2'}
                      </a>{' '}
                      after every change.
                    </p>
                  </div>

                  <div className="flex items-center gap-2.5 shrink-0">
                    <a
                      href={
                        githubStatus?.repoUrl ||
                        'https://github.com/tejasmeet-code/Zenith-Bot-V2'
                      }
                      target="_blank"
                      rel="noreferrer"
                      className="px-3.5 py-2 rounded-xl bg-white/[0.05] hover:bg-white/[0.1] border border-white/10 text-xs font-semibold text-white flex items-center gap-1.5"
                    >
                      <DiscordEmoji name="globe" id="1555133344482590821" size={15} />
                      <span>Open Repo</span>
                    </a>
                    <button
                      type="button"
                      onClick={() =>
                        handleGitHubSync('Full codebase & Heaven Cloud sync to GitHub')
                      }
                      disabled={isSyncingGitHub}
                      className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-xs font-bold text-white flex items-center gap-2 cursor-pointer"
                    >
                      <DiscordEmoji
                        name={isSyncingGitHub ? 'white_loading' : 'white_Done'}
                        id={
                          isSyncingGitHub
                            ? '1555133693704544337'
                            : '1555133626276905040'
                        }
                        animated={true}
                        size={15}
                      />
                      <span>
                        {isSyncingGitHub ? 'Deploying to GitHub...' : 'Push to GitHub Now'}
                      </span>
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs font-mono">
                  <div className="p-3 rounded-xl bg-[#07080C] border border-white/[0.06]">
                    <div className="text-[10px] text-[#9499B3]">REPOSITORY</div>
                    <div className="text-white font-bold truncate mt-0.5">
                      {githubStatus?.owner || 'tejasmeet-code'}/
                      {githubStatus?.repoName || 'Zenith-Bot-V2'}
                    </div>
                  </div>
                  <div className="p-3 rounded-xl bg-[#07080C] border border-white/[0.06]">
                    <div className="text-[10px] text-[#9499B3]">BRANCH / HEAD SHA</div>
                    <div className="text-emerald-300 font-bold mt-0.5">
                      {githubStatus?.branch || 'main'} •{' '}
                      {githubStatus?.lastCommitSha || 'HEAD'}
                    </div>
                  </div>
                  <div className="p-3 rounded-xl bg-[#07080C] border border-white/[0.06]">
                    <div className="text-[10px] text-[#9499B3]">SYNC STATUS</div>
                    <div className="text-cyan-300 font-bold uppercase mt-0.5">
                      {githubStatus?.status || 'synced'} ({githubStatus?.totalPushes ?? 1}{' '}
                      pushes)
                    </div>
                  </div>
                  <div className="p-3 rounded-xl bg-[#07080C] border border-white/[0.06]">
                    <div className="text-[10px] text-[#9499B3]">LAST PUSHED</div>
                    <div className="text-white font-bold truncate mt-0.5">
                      {githubStatus?.lastSyncedAt && !isNaN(Date.parse(githubStatus.lastSyncedAt))
                        ? new Date(githubStatus.lastSyncedAt).toLocaleTimeString()
                        : 'Active'}
                    </div>
                  </div>
                </div>
              </div>

              {/* General Server Bot Settings Card (Prefix, Theme Color, Behaviour Toggles, Module Toggles) */}
              <div className="p-6 rounded-2xl bg-[#0E1017] border border-white/[0.08] space-y-5">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-white/[0.07] pb-4">
                  <div>
                    <h2 className="font-display font-bold text-lg text-white flex items-center gap-2">
                      <DiscordEmoji name="white_settings" id="1555133815536492721" size={20} />
                      <span>General Bot Settings & Module Toggles</span>
                    </h2>
                    <p className="text-xs text-[#9499B3] mt-0.5">
                      Accessible to Server Administrators, Extra Owners, and the Server Owner.
                    </p>
                  </div>
                  <button
                    onClick={() => handleSaveServerSettings()}
                    className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-xs font-bold text-white flex items-center gap-2 cursor-pointer"
                  >
                    <DiscordEmoji
                      name="white_Done"
                      id="1555133626276905040"
                      animated={true}
                      size={15}
                    />
                    <span>Save All Bot Settings</span>
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Left: Command Prefix & Embed Color */}
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-mono uppercase text-[#9499B3] mb-1.5">
                          Command Prefix
                        </label>
                        <input
                          type="text"
                          value={settingsDraft.prefix || '.'}
                          onChange={(e) =>
                            setSettingsDraft((p: any) => ({ ...p, prefix: e.target.value }))
                          }
                          maxLength={5}
                          className="w-full px-3.5 py-2.5 rounded-xl bg-[#07080C] border border-white/15 text-sm font-mono text-white"
                          placeholder="."
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-mono uppercase text-[#9499B3] mb-1.5">
                          Embed Accent Color
                        </label>
                        <input
                          type="text"
                          value={settingsDraft.embedColor || '#5865F2'}
                          onChange={(e) =>
                            setSettingsDraft((p: any) => ({ ...p, embedColor: e.target.value }))
                          }
                          className="w-full px-3.5 py-2.5 rounded-xl bg-[#07080C] border border-white/15 text-sm font-mono text-white"
                          placeholder="#5865F2"
                        />
                      </div>
                    </div>

                    {/* Behavior Toggles */}
                    <div className="space-y-2 pt-1">
                      <div className="text-xs font-mono uppercase text-[#9499B3]">
                        Command & Moderation Behavior
                      </div>
                      {[
                        {
                          key: 'dmOnPunish',
                          label: 'DM Member on Ban / Kick / Mute',
                        },
                        {
                          key: 'anonymousMod',
                          label: 'Anonymous Moderator in User DMs',
                        },
                        {
                          key: 'autoDeleteCommands',
                          label: 'Auto-Delete Command Invocation Messages',
                        },
                        {
                          key: 'ephemeralReplies',
                          label: 'Use Ephemeral Replies for Sensitive Commands',
                        },
                      ].map((item) => {
                        const isOn = Boolean(settingsDraft[item.key]);
                        return (
                          <div
                            key={item.key}
                            className="p-3 rounded-xl bg-[#07080C] border border-white/[0.07] flex items-center justify-between"
                          >
                            <span className="text-xs text-white font-medium">{item.label}</span>
                            <button
                              onClick={() =>
                                handleSaveServerSettings({ [item.key]: !isOn })
                              }
                              className={`px-3 py-1 rounded-lg text-xs font-mono font-bold cursor-pointer ${
                                isOn
                                  ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                                  : 'bg-white/[0.05] text-[#9499B3]'
                              }`}
                            >
                              {isOn ? 'ON' : 'OFF'}
                            </button>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Right: Server Module Master Switches */}
                  <div className="space-y-2">
                    <div className="text-xs font-mono uppercase text-[#9499B3] mb-2">
                      Active Bot Modules in {activeGuild?.name}
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                      {[
                        { key: 'music', label: '24/7 Music System', emoji: '02music', id: '1555133215508009061', animated: true },
                        { key: 'moderation', label: 'Moderation & Cases', emoji: 'Moderator', id: '1555133403261571144' },
                        { key: 'automod', label: 'AutoMod & Filters', emoji: 'white_automod', id: '1555133567762174053' },
                        { key: 'utilities', label: 'Purge, Snipe & NP', emoji: 'Tool', id: '1555133545918369894' },
                        { key: 'logging', label: 'Audit & Event Logs', emoji: 'Logging', id: '1555133381182881852' },
                        { key: 'welcome', label: 'Welcome & Leave', emoji: 'people', id: '1555133444017619028' },
                      ].map((mod) => {
                        const modOn = settingsDraft.modulesEnabled?.[mod.key] !== false;
                        return (
                          <div
                            key={mod.key}
                            className="p-3.5 rounded-xl bg-[#07080C] border border-white/[0.07] flex items-center justify-between gap-2"
                          >
                            <div className="flex items-center gap-2">
                              <DiscordEmoji
                                name={mod.emoji}
                                id={mod.id}
                                animated={mod.animated}
                                size={16}
                              />
                              <span className="text-xs font-semibold text-white">{mod.label}</span>
                            </div>
                            <button
                              onClick={() =>
                                handleSaveServerSettings({
                                  modulesEnabled: {
                                    ...(settingsDraft.modulesEnabled || {}),
                                    [mod.key]: !modOn,
                                  },
                                })
                              }
                              className={`px-2.5 py-1 rounded-lg text-[11px] font-mono font-bold cursor-pointer ${
                                modOn
                                  ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                                  : 'bg-rose-500/20 text-rose-300'
                              }`}
                            >
                              {modOn ? 'ENABLED' : 'OFF'}
                            </button>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              </div>

              {/* Per-Server Bot Identity Customizer (.botname & .botavatar) */}
              <div className="p-6 rounded-2xl bg-[#0E1017] border border-white/[0.08] space-y-5">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-white/[0.07] pb-4">
                  <div>
                    <h2 className="font-display font-bold text-lg text-white flex items-center gap-2">
                      <img
                        src={
                          avatarInput.trim() ||
                          guildData?.botProfile?.effectiveAvatar ||
                          DEFAULT_ZENITH_BOT_ICON
                        }
                        alt="Bot Icon"
                        onError={(e) => {
                          (e.currentTarget as HTMLImageElement).src = DEFAULT_ZENITH_BOT_ICON;
                        }}
                        className="w-5 h-5 rounded-md object-cover"
                      />
                      <span>Per-Server Bot Identity (`.botname` & `.botavatar`)</span>
                    </h2>
                    <p className="text-xs text-[#9499B3] mt-0.5">
                      Customize Zenith&apos;s display name and avatar isolated strictly to{' '}
                      <strong className="text-white">{activeGuild?.name}</strong>.
                    </p>
                  </div>
                  <span className="px-2.5 py-1 rounded-lg bg-indigo-500/15 border border-indigo-500/30 text-xs font-mono text-indigo-300">
                    Server ID: {selectedGuildId}
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
                  <div className="md:col-span-5 p-4 rounded-2xl bg-[#07080C] border border-white/10 flex items-center gap-4">
                    <img
                      src={
                        avatarInput.trim() ||
                        guildData?.botProfile?.effectiveAvatar ||
                        DEFAULT_ZENITH_BOT_ICON
                      }
                      alt="Bot Server Avatar"
                      onError={(e) => {
                        (e.currentTarget as HTMLImageElement).src = DEFAULT_ZENITH_BOT_ICON;
                      }}
                      className="w-16 h-16 rounded-2xl object-cover ring-2 ring-indigo-500/50"
                    />
                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5">
                        <span className="font-display font-bold text-base text-white truncate">
                          {nickInput.trim() || guildData?.botProfile?.effectiveName || 'Zenith'}
                        </span>
                        <span className="px-1.5 py-0.5 rounded bg-[#5865F2] text-[10px] font-bold text-white">
                          ✓ APP
                        </span>
                      </div>
                      <div className="text-xs text-[#9499B3] mt-0.5">
                        Isolated to {activeGuild?.name}
                      </div>
                    </div>
                  </div>

                  <div className="md:col-span-7 space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-mono uppercase text-[#9499B3] mb-1.5">
                          Server Bot Nickname (`.botname`)
                        </label>
                        <input
                          type="text"
                          value={nickInput}
                          onChange={(e) => setNickInput(e.target.value)}
                          placeholder="e.g., Vanguard Guardian"
                          className="w-full px-3.5 py-2.5 rounded-xl bg-[#07080C] border border-white/15 text-sm text-white focus:outline-none focus:border-indigo-500"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-mono uppercase text-[#9499B3] mb-1.5">
                          Bot Avatar URL or Upload File (`.botavatar` / `/botavatar`)
                        </label>
                        <div className="flex gap-2">
                          <input
                            type="text"
                            value={avatarInput}
                            onChange={(e) => setAvatarInput(e.target.value)}
                            placeholder="https://cdn.discordapp.com/... or upload image"
                            className="flex-1 px-3.5 py-2.5 rounded-xl bg-[#07080C] border border-white/15 text-sm text-white focus:outline-none focus:border-indigo-500"
                          />
                          <label className="px-3 py-2.5 rounded-xl bg-white/[0.06] hover:bg-white/[0.12] border border-white/15 text-xs font-semibold text-cyan-200 flex items-center gap-1.5 cursor-pointer shrink-0">
                            <DiscordEmoji name="link" id="1555133367534624849" size={14} />
                            <span>Upload PFP</span>
                            <input
                              type="file"
                              accept="image/*"
                              className="hidden"
                              onChange={(e) => {
                                const file = e.target.files?.[0];
                                if (!file) return;
                                const reader = new FileReader();
                                reader.onload = () => {
                                  if (typeof reader.result === 'string') {
                                    setAvatarInput(reader.result);
                                    showToast('Loaded PFP image! Click Save Server Bot Profile to apply on Discord.');
                                  }
                                };
                                reader.readAsDataURL(file);
                              }}
                            />
                          </label>
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-3">
                      <button
                        onClick={() => handleSaveBotIdentity(false)}
                        className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-xs sm:text-sm font-semibold text-white flex items-center gap-2 transition cursor-pointer"
                      >
                        <DiscordEmoji
                          name="white_Done"
                          id="1555133626276905040"
                          animated={true}
                          size={16}
                        />
                        <span>Save Server Bot Profile & Apply Discord PFP</span>
                      </button>
                      <button
                        onClick={() => handleSaveBotIdentity(true)}
                        className="px-4 py-2.5 rounded-xl bg-white/[0.05] hover:bg-white/[0.1] border border-white/10 text-xs sm:text-sm font-medium text-[#9499B3] hover:text-white flex items-center gap-2 transition cursor-pointer"
                      >
                        <DiscordEmoji name="loop" id="1555133388149628980" size={15} />
                        <span>Reset to Default</span>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* =====================================================================
              TAB 2: SET CHANNELS & LOGGING ROUTER (ALL 10 SERVER CHANNELS)
             ===================================================================== */}
          {activeTab === 'channels' && (
            <div className="space-y-6">
              <div className="p-6 rounded-2xl bg-[#0E1017] border border-white/[0.08] space-y-5">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/[0.07] pb-4">
                  <div>
                    <h2 className="font-display font-bold text-xl text-white flex items-center gap-2.5">
                      <DiscordEmoji name="Logging" id="1555133381182881852" size={22} />
                      <span>Set Server Channels & Log Routing — {activeGuild?.name}</span>
                    </h2>
                    <p className="text-xs text-[#9499B3] mt-0.5">
                      Assign dedicated channels for Welcome/Leave, Mod Logs, Anti-Nuke Alerts, Music Requests, 24/7 Voice, and Honeypot Trap.
                    </p>
                  </div>
                  <button
                    onClick={() => handleSaveChannelsConfig()}
                    className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-cyan-600 hover:from-indigo-500 hover:to-cyan-500 text-xs sm:text-sm font-bold text-white flex items-center gap-2 shadow-lg cursor-pointer shrink-0"
                  >
                    <DiscordEmoji
                      name="white_Done"
                      id="1555133626276905040"
                      animated={true}
                      size={16}
                    />
                    <span>Save All Channel Assignments</span>
                  </button>
                </div>

                {/* 10 Channel Selectors Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {[
                    {
                      key: 'welcomeChannelId',
                      label: 'Welcome Member Channel',
                      desc: 'Where new member welcome embeds are sent',
                      type: 'text',
                    },
                    {
                      key: 'leaveChannelId',
                      label: 'Member Leave Channel',
                      desc: 'Where member departure logs are posted',
                      type: 'text',
                    },
                    {
                      key: 'modLogChannelId',
                      label: 'Moderation Audit Log Channel',
                      desc: 'Bans, kicks, mutes, warns, and case updates',
                      type: 'text',
                    },
                    {
                      key: 'antiNukeAlertChannelId',
                      label: 'Anti-Nuke Vault Alert Channel',
                      desc: 'Emergency raid neutralizing & Betrayal Guard alerts',
                      type: 'text',
                    },
                    {
                      key: 'messageLogChannelId',
                      label: 'Message Delete & Edit Log Channel',
                      desc: 'Logs deleted and edited messages across the server',
                      type: 'text',
                    },
                    {
                      key: 'voiceLogChannelId',
                      label: 'Voice Activity Log Channel',
                      desc: 'Voice channel joins, leaves, and stage transitions',
                      type: 'text',
                    },
                    {
                      key: 'musicTextChannelId',
                      label: 'Music Request Text Channel',
                      desc: 'Dedicated channel forNow Playing embeds & song buttons',
                      type: 'text',
                    },
                    {
                      key: 'musicVoiceChannelId',
                      label: '24/7 Music Voice Channel',
                      desc: 'Voice channel where Zenith stays connected 24/7',
                      type: 'voice',
                    },
                    {
                      key: 'appealsChannelId',
                      label: 'Ban & Mute Appeals Channel',
                      desc: 'Where user punishment appeals are routed for review',
                      type: 'text',
                    },
                    {
                      key: 'honeypotChannelId',
                      label: 'Honeypot Raider Trap Channel',
                      desc: 'Decoy channel that auto-punishes self-bots on message',
                      type: 'text',
                    },
                  ].map((chItem) => {
                    const filteredList = availableChannels.filter((c: any) =>
                      chItem.type === 'voice' ? c.type === 'voice' : c.type !== 'voice'
                    );
                    return (
                      <div
                        key={chItem.key}
                        className="p-4 rounded-2xl bg-[#07080C] border border-white/[0.08] space-y-2"
                      >
                        <div className="flex items-center justify-between">
                          <label className="text-xs font-display font-bold text-white">
                            {chItem.label}
                          </label>
                          <span className="text-[10px] font-mono uppercase text-indigo-300">
                            {chItem.type === 'voice' ? 'VOICE CH' : 'TEXT CH'}
                          </span>
                        </div>
                        <p className="text-[11px] text-[#9499B3]">{chItem.desc}</p>
                        <select
                          aria-label={chItem.label}
                          value={channelsDraft[chItem.key] || ''}
                          onChange={(e) =>
                            setChannelsDraft((p: any) => ({
                              ...p,
                              [chItem.key]: e.target.value,
                            }))
                          }
                          className="w-full px-3 py-2 rounded-xl bg-[#0E1017] border border-white/15 text-xs font-mono text-white focus:outline-none focus:border-indigo-500"
                        >
                          <option value="">-- Disabled / Not Set --</option>
                          {filteredList.map((ch: any) => (
                            <option key={ch.id} value={ch.id}>
                              {ch.type === 'voice' ? '🔊 ' : '#'}
                              {ch.name} ({ch.id})
                            </option>
                          ))}
                        </select>
                      </div>
                    );
                  })}
                </div>

                {/* Custom Welcome & Leave Message Templates */}
                <div className="pt-4 border-t border-white/[0.07] grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-mono uppercase text-[#9499B3]">
                        Welcome Message Template
                      </label>
                      <button
                        onClick={() =>
                          handleSaveChannelsConfig({
                            welcomeEnabled: !channelsDraft.welcomeEnabled,
                          })
                        }
                        className={`px-2.5 py-0.5 rounded text-[10px] font-mono cursor-pointer ${
                          channelsDraft.welcomeEnabled
                            ? 'bg-emerald-500/20 text-emerald-300'
                            : 'bg-rose-500/20 text-rose-300'
                        }`}
                      >
                        {channelsDraft.welcomeEnabled ? 'WELCOME ON' : 'WELCOME OFF'}
                      </button>
                    </div>
                    <input
                      type="text"
                      value={channelsDraft.welcomeMessage || ''}
                      onChange={(e) =>
                        setChannelsDraft((p: any) => ({ ...p, welcomeMessage: e.target.value }))
                      }
                      className="w-full px-3.5 py-2.5 rounded-xl bg-[#07080C] border border-white/15 text-xs text-white"
                      placeholder="Welcome {user} to {server}!"
                    />
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-mono uppercase text-[#9499B3]">
                        Leave Message Template
                      </label>
                      <button
                        onClick={() =>
                          handleSaveChannelsConfig({
                            leaveEnabled: !channelsDraft.leaveEnabled,
                          })
                        }
                        className={`px-2.5 py-0.5 rounded text-[10px] font-mono cursor-pointer ${
                          channelsDraft.leaveEnabled
                            ? 'bg-emerald-500/20 text-emerald-300'
                            : 'bg-rose-500/20 text-rose-300'
                        }`}
                      >
                        {channelsDraft.leaveEnabled ? 'LEAVE ON' : 'LEAVE OFF'}
                      </button>
                    </div>
                    <input
                      type="text"
                      value={channelsDraft.leaveMessage || ''}
                      onChange={(e) =>
                        setChannelsDraft((p: any) => ({ ...p, leaveMessage: e.target.value }))
                      }
                      className="w-full px-3.5 py-2.5 rounded-xl bg-[#07080C] border border-white/15 text-xs text-white"
                      placeholder="{user.tag} left {server}."
                    />
                  </div>
                </div>
              </div>

              {/* Command Channel Access Restriction Panel (.cmdchannel / /cmdchannel) */}
              <div className="p-6 rounded-2xl bg-[#0E1017] border border-white/[0.08] space-y-5">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/[0.07] pb-4">
                  <div>
                    <h3 className="font-display font-bold text-lg text-white flex items-center gap-2">
                      <DiscordEmoji name="white_settings" id="1555133815536492721" size={20} />
                      <span>Bot Command Channel Access Restrictions (`.cmdchannel` / `/cmdchannel`)</span>
                    </h3>
                    <p className="text-xs text-[#9499B3] mt-0.5">
                      Restrict where members can execute bot commands. Server Owner & Bot Owner bypass restrictions.
                    </p>
                  </div>
                  <button
                    onClick={() => handleSaveCmdChannels()}
                    className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-xs font-bold text-white flex items-center gap-2 cursor-pointer shrink-0"
                  >
                    <DiscordEmoji name="white_Done" id="1555133626276905040" animated={true} size={15} />
                    <span>Save Channel Mode</span>
                  </button>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-mono uppercase text-[#9499B3] mb-2">
                      Active Channel Restriction Mode
                    </label>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <button
                        type="button"
                        onClick={() => {
                          const next = { ...cmdChannelDraft, mode: 'all' as const };
                          setCmdChannelDraft(next);
                          handleSaveCmdChannels(next);
                        }}
                        className={`p-3.5 rounded-xl border text-left transition cursor-pointer ${
                          cmdChannelDraft.mode === 'all'
                            ? 'bg-emerald-500/15 border-emerald-500/40 text-emerald-300 ring-1 ring-emerald-500/30'
                            : 'bg-[#07080C] border-white/10 text-[#9499B3] hover:text-white'
                        }`}
                      >
                        <div className="font-bold text-xs flex items-center gap-2">
                          <DiscordEmoji name="Button_on" id="1555133307434434610" size={14} />
                          <span>Allow All Channels</span>
                        </div>
                        <p className="text-[11px] text-[#9499B3] mt-1">Bot commands allowed in every text channel.</p>
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          const next = { ...cmdChannelDraft, mode: 'include' as const };
                          setCmdChannelDraft(next);
                          handleSaveCmdChannels(next);
                        }}
                        className={`p-3.5 rounded-xl border text-left transition cursor-pointer ${
                          cmdChannelDraft.mode === 'include'
                            ? 'bg-indigo-500/15 border-indigo-500/40 text-indigo-300 ring-1 ring-indigo-500/30'
                            : 'bg-[#07080C] border-white/10 text-[#9499B3] hover:text-white'
                        }`}
                      >
                        <div className="font-bold text-xs flex items-center gap-2">
                          <DiscordEmoji name="white_lock" id="1555133700835119136" size={14} />
                          <span>Include Mode Only</span>
                        </div>
                        <p className="text-[11px] text-[#9499B3] mt-1">Commands allowed ONLY in specified included channels.</p>
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          const next = { ...cmdChannelDraft, mode: 'exclude' as const };
                          setCmdChannelDraft(next);
                          handleSaveCmdChannels(next);
                        }}
                        className={`p-3.5 rounded-xl border text-left transition cursor-pointer ${
                          cmdChannelDraft.mode === 'exclude'
                            ? 'bg-rose-500/15 border-rose-500/40 text-rose-300 ring-1 ring-rose-500/30'
                            : 'bg-[#07080C] border-white/10 text-[#9499B3] hover:text-white'
                        }`}
                      >
                        <div className="font-bold text-xs flex items-center gap-2">
                          <DiscordEmoji name="white_cancel" id="1555133596652539988" size={14} />
                          <span>Exclude Mode</span>
                        </div>
                        <p className="text-[11px] text-[#9499B3] mt-1">Commands allowed everywhere EXCEPT excluded channels.</p>
                      </button>
                    </div>
                  </div>

                  {/* Add Channel Picker */}
                  <div className="p-4 rounded-xl bg-[#07080C] border border-white/[0.08] space-y-3">
                    <label className="block text-xs font-mono uppercase text-[#9499B3]">
                      Add Channel to Restriction List ({cmdChannelDraft.mode === 'exclude' ? 'Excluded Channels' : 'Included Channels'})
                    </label>
                    <div className="flex gap-2">
                      <select
                        value={selectedChanToAdd}
                        onChange={(e) => setSelectedChanToAdd(e.target.value)}
                        className="flex-1 px-3 py-2 rounded-xl bg-[#0E1017] border border-white/15 text-xs text-white focus:outline-none focus:border-indigo-500"
                      >
                        <option value="">-- Select Channel from Server --</option>
                        {availableChannels
                          .filter((c: any) => c.type !== 'voice')
                          .map((c: any) => (
                            <option key={c.id} value={c.id}>
                              #{c.name} ({c.id})
                            </option>
                          ))}
                      </select>
                      <button
                        type="button"
                        onClick={() => {
                          if (!selectedChanToAdd) return;
                          const isExclude = cmdChannelDraft.mode === 'exclude';
                          const targetArr = isExclude ? [...cmdChannelDraft.excludedChannels] : [...cmdChannelDraft.includedChannels];
                          if (!targetArr.includes(selectedChanToAdd)) {
                            targetArr.push(selectedChanToAdd);
                          }
                          const updated = isExclude
                            ? { ...cmdChannelDraft, excludedChannels: targetArr }
                            : { ...cmdChannelDraft, includedChannels: targetArr };
                          setCmdChannelDraft(updated);
                          handleSaveCmdChannels(updated);
                          setSelectedChanToAdd('');
                        }}
                        className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-xs font-semibold text-white cursor-pointer shrink-0"
                      >
                        Add Channel
                      </button>
                    </div>

                    {/* Included Channels Tag List */}
                    <div className="space-y-2 pt-2">
                      <div className="text-[11px] font-mono text-[#9499B3]">
                        Included Channels ({cmdChannelDraft.includedChannels.length}):
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {cmdChannelDraft.includedChannels.length === 0 ? (
                          <span className="text-xs text-[#9499B3] italic">*No channels specified in included list*</span>
                        ) : (
                          cmdChannelDraft.includedChannels.map((chId) => {
                            const foundCh = availableChannels.find((c: any) => c.id === chId);
                            return (
                              <span
                                key={chId}
                                className="px-2.5 py-1 rounded-lg bg-indigo-500/20 border border-indigo-500/30 text-xs font-mono text-indigo-200 flex items-center gap-1.5"
                              >
                                <span>#{foundCh?.name || chId}</span>
                                <button
                                  type="button"
                                  onClick={() => {
                                    const next = {
                                      ...cmdChannelDraft,
                                      includedChannels: cmdChannelDraft.includedChannels.filter((id) => id !== chId),
                                    };
                                    setCmdChannelDraft(next);
                                    handleSaveCmdChannels(next);
                                  }}
                                  className="hover:text-rose-400 font-bold ml-1 cursor-pointer"
                                >
                                  ×
                                </button>
                              </span>
                            );
                          })
                        )}
                      </div>
                    </div>

                    {/* Excluded Channels Tag List */}
                    <div className="space-y-2 pt-2 border-t border-white/[0.05]">
                      <div className="text-[11px] font-mono text-[#9499B3]">
                        Excluded Channels ({cmdChannelDraft.excludedChannels.length}):
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {cmdChannelDraft.excludedChannels.length === 0 ? (
                          <span className="text-xs text-[#9499B3] italic">*No channels specified in excluded list*</span>
                        ) : (
                          cmdChannelDraft.excludedChannels.map((chId) => {
                            const foundCh = availableChannels.find((c: any) => c.id === chId);
                            return (
                              <span
                                key={chId}
                                className="px-2.5 py-1 rounded-lg bg-rose-500/20 border border-rose-500/30 text-xs font-mono text-rose-200 flex items-center gap-1.5"
                              >
                                <span>#{foundCh?.name || chId}</span>
                                <button
                                  type="button"
                                  onClick={() => {
                                    const next = {
                                      ...cmdChannelDraft,
                                      excludedChannels: cmdChannelDraft.excludedChannels.filter((id) => id !== chId),
                                    };
                                    setCmdChannelDraft(next);
                                    handleSaveCmdChannels(next);
                                  }}
                                  className="hover:text-rose-400 font-bold ml-1 cursor-pointer"
                                >
                                  ×
                                </button>
                              </span>
                            );
                          })
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* =====================================================================
              TAB 3: LIVE 320KBPS MUSIC PLAYING & 24/7 CONTROLLER
             ===================================================================== */}
          {activeTab === 'music' && (
            <div className="space-y-6">
              {/* Remote Voice Channel Connection & Search Bar */}
              <div className="p-6 rounded-2xl bg-[#0E1017] border border-white/[0.08] space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div>
                    <h2 className="font-display font-bold text-xl text-white flex items-center gap-2.5">
                      <DiscordEmoji
                        name="02music"
                        id="1555133215508009061"
                        animated={true}
                        size={22}
                      />
                      <span>Live 320kbps Server Music Deck — {activeGuild?.name}</span>
                    </h2>
                    <p className="text-xs text-[#9499B3]">
                      Full-length 320kbps AAC audio streaming via JioSaavn HQ, Spotify, YouTube & real-time FFmpeg DSP filters.
                    </p>
                  </div>

                  <div className="flex flex-wrap items-center gap-2">
                    <button
                      onClick={() => handleMusicAction({ action: 'toggle247' })}
                      className={`px-3.5 py-1.5 rounded-xl border text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer ${
                        musicState?.is247
                          ? 'bg-emerald-500/20 border-emerald-500/40 text-emerald-300'
                          : 'bg-white/[0.04] border-white/10 text-[#9499B3]'
                      }`}
                    >
                      <DiscordEmoji
                        name={musicState?.is247 ? 'Button_on' : 'Button_off'}
                        id={musicState?.is247 ? '1555133307434434610' : '1555133300522098758'}
                        size={15}
                      />
                      <span>24/7 VC Lock</span>
                    </button>

                    <button
                      onClick={() => handleMusicAction({ action: 'toggleAutoplay' })}
                      className={`px-3.5 py-1.5 rounded-xl border text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer ${
                        musicState?.autoplay
                          ? 'bg-cyan-500/20 border-cyan-500/40 text-cyan-200'
                          : 'bg-white/[0.04] border-white/10 text-[#9499B3]'
                      }`}
                    >
                      <DiscordEmoji
                        name={musicState?.autoplay ? 'Button_on' : 'Button_off'}
                        id={musicState?.autoplay ? '1555133307434434610' : '1555133300522098758'}
                        size={15}
                      />
                      <span>Sequential Autoplay</span>
                    </button>
                  </div>
                </div>

                {/* Remote Voice Channel Selector & Bridge Controls */}
                <div className="p-3.5 rounded-xl bg-[#07080C] border border-white/[0.08] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex items-center gap-2.5">
                    <DiscordEmoji name="white_mic" id="1555133722284527628" size={18} />
                    <div>
                      <div className="text-xs font-bold text-white">
                        Discord Voice Channel Controller (Live Heaven Cloud Sync)
                      </div>
                      <div className="text-[11px] text-[#9499B3] font-mono">
                        Active VC: {musicState?.voiceChannelId ? `#${musicState.voiceChannelId}` : 'Auto-detects active voice channel'}
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-2">
                    <select
                      aria-label="Target Voice Channel"
                      value={selectedVoiceChannelId}
                      onChange={(e) => setSelectedVoiceChannelId(e.target.value)}
                      className="px-3 py-1.5 rounded-xl bg-[#0E1017] border border-white/15 text-xs font-mono text-white"
                    >
                      <option value="">-- Auto-Select Active Voice Channel --</option>
                      {availableChannels
                        .filter((c: any) => c.type === 'voice')
                        .map((vc: any) => (
                          <option key={vc.id} value={vc.id}>
                            VC: {vc.name} ({vc.id})
                          </option>
                        ))}
                    </select>

                    <button
                      onClick={() =>
                        handleMusicAction({
                          action: 'joinVoiceChannel',
                          voiceChannelId: selectedVoiceChannelId || undefined,
                        })
                      }
                      className="px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-xs font-bold text-white flex items-center gap-1.5 cursor-pointer"
                    >
                      <DiscordEmoji name="white_mic" id="1555133722284527628" size={14} />
                      <span>Join / Move VC</span>
                    </button>

                    <button
                      onClick={() => handleMusicAction({ action: 'leaveVoiceChannel' })}
                      className="px-3 py-1.5 rounded-xl bg-rose-500/20 hover:bg-rose-500/30 border border-rose-500/30 text-xs font-semibold text-rose-300 flex items-center gap-1.5 cursor-pointer"
                    >
                      <DiscordEmoji name="white_cancel" id="1555133596652539988" size={14} />
                      <span>Leave VC</span>
                    </button>
                  </div>
                </div>

                {/* Track Search & Source Selector */}
                <div className="flex flex-col sm:flex-row gap-3">
                  <select
                    aria-label="Streaming Source Platform"
                    value={musicPlatform}
                    onChange={(e) => {
                      setMusicPlatform(e.target.value);
                      handleMusicAction({ action: 'setSource', platform: e.target.value });
                    }}
                    className="px-3.5 py-2.5 rounded-xl bg-[#07080C] border border-white/15 text-xs sm:text-sm font-semibold text-white focus:outline-none focus:border-cyan-500"
                  >
                    <option value="jiosaavn">JioSaavn 320kbps HQ</option>
                    <option value="spotify">Spotify Lossless</option>
                    <option value="youtube">YouTube Music</option>
                    <option value="apple">Apple Music</option>
                    <option value="amazon">Amazon Music</option>
                  </select>

                  <input
                    type="text"
                    value={musicQuery}
                    onChange={(e) => setMusicQuery(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && musicQuery.trim()) {
                        handleMusicAction({
                          action: 'enqueue',
                          query: musicQuery,
                          platform: musicPlatform,
                          voiceChannelId: selectedVoiceChannelId || undefined,
                        });
                        setMusicQuery('');
                      }
                    }}
                    placeholder="Search any song title, artist, or paste URL..."
                    className="flex-1 px-4 py-2.5 rounded-xl bg-[#07080C] border border-white/15 text-sm text-white focus:outline-none focus:border-cyan-500"
                  />

                  <button
                    onClick={() => {
                      handleMusicAction({
                        action: 'play',
                        query: musicQuery,
                        platform: musicPlatform,
                        voiceChannelId: selectedVoiceChannelId || undefined,
                      });
                      setMusicQuery('');
                    }}
                    className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-indigo-600 hover:from-cyan-400 hover:to-indigo-500 text-xs sm:text-sm font-bold text-white flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <DiscordEmoji name="resume" id="1555133494991265863" size={16} />
                    <span>Play Now</span>
                  </button>

                  <button
                    onClick={() => {
                      handleMusicAction({
                        action: 'enqueue',
                        query: musicQuery,
                        platform: musicPlatform,
                        voiceChannelId: selectedVoiceChannelId || undefined,
                      });
                      setMusicQuery('');
                    }}
                    className="px-4 py-2.5 rounded-xl bg-white/[0.06] hover:bg-white/[0.12] border border-white/15 text-xs sm:text-sm font-semibold text-white flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <DiscordEmoji name="list" id="1555133374023344242" size={16} />
                    <span>Add to Queue</span>
                  </button>
                </div>
              </div>

              {/* Now Playing Deck + Audio Controls */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                <div className="lg:col-span-7 p-6 rounded-2xl bg-[#0E1017] border border-white/[0.08] space-y-5">
                  <div className="flex items-start gap-4">
                    <img
                      src={
                        musicState?.currentTrack?.thumbnail ||
                        musicState?.currentTrack?.artwork ||
                        DEFAULT_ZENITH_BOT_ICON
                      }
                      alt="Track Artwork"
                      onError={(e) => {
                        (e.currentTarget as HTMLImageElement).src = DEFAULT_ZENITH_BOT_ICON;
                      }}
                      className="w-24 h-24 rounded-2xl object-cover ring-2 ring-cyan-500/40 shrink-0"
                    />
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2 text-xs font-mono text-[#9499B3]">
                        <span className="text-cyan-300 font-semibold">
                          320KBPS · {musicState?.currentTrack?.source || 'JioSaavn'}
                        </span>
                        <span aria-hidden="true">·</span>
                        <span>Speed: {musicState?.speed || 1}x</span>
                        <span aria-hidden="true">·</span>
                        <span>Filter: {musicState?.activeFilter || 'None'}</span>
                        <span aria-hidden="true">·</span>
                        <span>Loop: {(musicState?.loopMode || 'off').toUpperCase()}</span>
                      </div>
                      <h3 className="font-display font-bold text-xl text-white mt-1 truncate">
                        {musicState?.currentTrack?.title || 'Starboy'}
                      </h3>
                      <p className="text-sm text-[#9499B3] truncate">
                        {musicState?.currentTrack?.artist || 'The Weeknd, Daft Punk'}
                      </p>

                      <div className="mt-3 flex items-center gap-4">
                        <div className="flex items-end gap-1 h-4">
                          <span className="w-1 bg-cyan-400 rounded-full animate-eq-1" />
                          <span className="w-1 bg-indigo-400 rounded-full animate-eq-2" />
                          <span className="w-1 bg-cyan-300 rounded-full animate-eq-3" />
                          <span className="w-1 bg-indigo-400 rounded-full animate-eq-2" />
                        </div>
                        <span className="text-xs font-mono text-emerald-400">
                          {musicState?.isPaused
                            ? 'PAUSED'
                            : 'STREAMING FULL TRACK IN VC + FRESH DISCORD PANEL SYNCED'}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Primary Playback Transport Buttons */}
                  <div className="flex flex-wrap items-center gap-2.5 pt-2 border-t border-white/[0.07]">
                    <button
                      onClick={() => handleMusicAction({ action: 'previous' })}
                      className="px-3.5 py-2 rounded-xl bg-white/[0.05] hover:bg-white/[0.1] border border-white/10 text-xs font-semibold text-white flex items-center gap-1.5 cursor-pointer"
                      title="Rewind to previous track in history and push current track to top of queue"
                    >
                      <DiscordEmoji name="white_previous" id="1555133790781972521" size={15} />
                      <span>Previous ({musicState?.history?.length || 0})</span>
                    </button>

                    <button
                      onClick={() => handleMusicAction({ action: 'togglePause' })}
                      className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-xs font-bold text-white flex items-center gap-1.5 cursor-pointer"
                    >
                      <DiscordEmoji
                        name={musicState?.isPaused ? 'resume' : 'pause'}
                        id={musicState?.isPaused ? '1555133494991265863' : '1555133437038297138'}
                        size={15}
                      />
                      <span>{musicState?.isPaused ? 'Resume' : 'Pause'}</span>
                    </button>

                    <button
                      onClick={() => handleMusicAction({ action: 'skip' })}
                      className="px-3.5 py-2 rounded-xl bg-white/[0.05] hover:bg-white/[0.1] border border-white/10 text-xs font-semibold text-white flex items-center gap-1.5 cursor-pointer"
                      title="Skip to next song in queue and send a fresh control panel embed in Discord"
                    >
                      <DiscordEmoji name="white_skip" id="1555133823698604074" size={15} />
                      <span>Skip</span>
                    </button>

                    <button
                      onClick={() => handleMusicAction({ action: 'cycleLoop' })}
                      className="px-3.5 py-2 rounded-xl bg-white/[0.05] hover:bg-white/[0.1] border border-white/10 text-xs font-semibold text-white flex items-center gap-1.5 cursor-pointer"
                    >
                      <DiscordEmoji name="loop" id="1555133388149628980" size={15} />
                      <span>Loop: {(musicState?.loopMode || 'off').toUpperCase()}</span>
                    </button>

                    <button
                      onClick={() => handleMusicAction({ action: 'shuffleQueue' })}
                      className="px-3.5 py-2 rounded-xl bg-white/[0.05] hover:bg-white/[0.1] border border-white/10 text-xs font-semibold text-white flex items-center gap-1.5 cursor-pointer"
                    >
                      <DiscordEmoji name="shuffle" id="1555133509331583026" size={15} />
                      <span>Shuffle</span>
                    </button>

                    <button
                      onClick={() => handleMusicAction({ action: 'stop' })}
                      className="px-3.5 py-2 rounded-xl bg-rose-500/15 hover:bg-rose-500/25 border border-rose-500/30 text-xs font-semibold text-rose-300 flex items-center gap-1.5 cursor-pointer"
                    >
                      <DiscordEmoji name="white_cancel" id="1555133596652539988" size={15} />
                      <span>Stop</span>
                    </button>
                  </div>

                  {/* Speed, 0%-200% Amplified Volume & Real-Time FFmpeg DSP Filters */}
                  <div className="space-y-4 pt-2 border-t border-white/[0.07]">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-[11px] font-mono uppercase text-[#9499B3] mb-1.5">
                          Playback Speed ({musicState?.speed || 1}x)
                        </label>
                        <div className="flex flex-wrap gap-1.5">
                          {[0.75, 1.0, 1.25, 1.5, 2.0].map((spd) => (
                            <button
                              key={spd}
                              onClick={() => handleMusicAction({ action: 'setSpeed', speed: spd })}
                              className={`px-2.5 py-1 rounded-lg text-xs font-mono tabular-nums transition cursor-pointer ${
                                musicState?.speed === spd
                                  ? 'bg-cyan-500 text-black font-bold'
                                  : 'bg-white/[0.05] text-[#9499B3] hover:text-white'
                              }`}
                            >
                              {spd}x
                            </button>
                          ))}
                        </div>
                      </div>

                      <div>
                        <div className="flex items-center justify-between mb-1.5">
                          <label className="text-[11px] font-mono uppercase text-[#9499B3]">
                            Amplified Master Volume (0%–200%)
                          </label>
                          <span className="text-xs font-mono font-bold text-indigo-300 tabular-nums">
                            {musicState?.volume ?? 100}%
                          </span>
                        </div>
                        <input
                          type="range"
                          min={0}
                          max={200}
                          step={5}
                          aria-label="Master Volume Slider"
                          value={musicState?.volume ?? 100}
                          onChange={(e) =>
                            handleMusicAction({ action: 'setVolume', volume: Number(e.target.value) })
                          }
                          className="w-full accent-indigo-500 cursor-pointer mb-1.5"
                        />
                        <div className="flex flex-wrap gap-1.5">
                          {[50, 80, 100, 125, 150, 200].map((vol) => (
                            <button
                              key={vol}
                              onClick={() => handleMusicAction({ action: 'setVolume', volume: vol })}
                              className={`px-2 py-0.5 rounded text-[11px] font-mono tabular-nums transition cursor-pointer ${
                                (musicState?.volume ?? 100) === vol
                                  ? 'bg-indigo-500 text-white font-bold'
                                  : 'bg-white/[0.05] text-[#9499B3] hover:text-white'
                              }`}
                            >
                              {vol}%
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* Real-Time FFmpeg DSP Filter Bar */}
                    <div>
                      <label className="block text-[11px] font-mono uppercase text-[#9499B3] mb-1.5">
                        Real-Time FFmpeg Audio DSP Filter (Active: {musicState?.activeFilter || 'None'})
                      </label>
                      <div className="flex flex-wrap gap-2">
                        {[
                          { label: 'None (Studio Lossless)', value: 'None' },
                          { label: '8D Spatial Audio', value: '8D Audio' },
                          { label: 'Sub-Bass Boost', value: 'Bass Boost' },
                          { label: 'Nightcore', value: 'Nightcore' },
                          { label: 'Vaporwave Slowed', value: 'Vaporwave' },
                          { label: 'Treble Boost', value: 'Treble Boost' },
                          { label: 'Clear Vocals', value: 'Clear Vocals' },
                        ].map((flt) => {
                          const isActiveFilter =
                            (musicState?.activeFilter || 'None') === flt.value;
                          return (
                            <button
                              key={flt.value}
                              onClick={() =>
                                handleMusicAction({ action: 'setFilter', filter: flt.value })
                              }
                              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition cursor-pointer ${
                                isActiveFilter
                                  ? 'bg-cyan-500/20 border border-cyan-500/50 text-cyan-200'
                                  : 'bg-[#07080C] border border-white/10 text-[#9499B3] hover:text-white'
                              }`}
                            >
                              {flt.label}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Live Queue Column */}
                <div className="lg:col-span-5 p-6 rounded-2xl bg-[#0E1017] border border-white/[0.08] flex flex-col justify-between space-y-4">
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="font-display font-bold text-base text-white flex items-center gap-2">
                        <DiscordEmoji name="list" id="1555133374023344242" size={18} />
                        <span>Strict FIFO Up-Next Queue ({musicState?.queue?.length || 0})</span>
                      </h3>
                      {musicState?.queue?.length > 0 && (
                        <button
                          onClick={() => handleMusicAction({ action: 'clearQueue' })}
                          className="text-xs text-rose-400 hover:underline flex items-center gap-1 cursor-pointer"
                        >
                          <DiscordEmoji name="white_delete" id="1555133618072846417" size={13} />
                          <span>Clear</span>
                        </button>
                      )}
                    </div>

                    <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
                      {(musicState?.queue || []).length === 0 ? (
                        <div className="p-4 rounded-xl bg-white/[0.02] border border-white/[0.05] text-xs text-[#9499B3] text-center">
                          Queue is empty. Songs added via Play / Add to Queue play in strict FIFO order first, then Sequential Autoplay continues after the last queued track.
                        </div>
                      ) : (
                        musicState.queue.map((t: any, idx: number) => (
                          <div
                            key={`${t.title}-${idx}`}
                            className="p-2.5 rounded-xl bg-[#07080C] border border-white/[0.07] flex items-center justify-between gap-2"
                          >
                            <div className="min-w-0">
                              <div className="text-xs font-semibold text-white truncate">
                                {idx + 1}. {t.title}
                              </div>
                              <div className="text-[11px] text-[#9499B3] truncate">{t.artist}</div>
                            </div>
                            <div className="flex items-center gap-1.5 shrink-0">
                              <button
                                onClick={() =>
                                  handleMusicAction({ action: 'playQueueIndex', queueIndex: idx })
                                }
                                className="px-2 py-1 rounded-lg bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-200 text-[10px] font-mono cursor-pointer"
                                title="Jump to this queued song immediately"
                              >
                                Play
                              </button>
                              <button
                                onClick={() =>
                                  handleMusicAction({ action: 'removeQueueIndex', queueIndex: idx })
                                }
                                className="p-1 rounded hover:bg-rose-500/20 text-rose-300 cursor-pointer"
                                title="Remove from queue"
                              >
                                <DiscordEmoji
                                  name="white_cancel"
                                  id="1555133596652539988"
                                  size={13}
                                />
                              </button>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </div>

                  {/* Queue & Autoplay Guarantee Note */}
                  <div className="p-3 rounded-xl bg-[#07080C] border border-white/[0.06] text-[11px] text-[#9499B3] font-mono">
                    Queue Order: FIFO Guaranteed · Autoplay: Sequential after queue · Fresh Control Panel Embed sent on every track transition.
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* =====================================================================
              TAB 4: ANTI-NUKE VAULT (STRICT RBAC: SERVER OWNER & EXTRA OWNERS ONLY)
             ===================================================================== */}
          {activeTab === 'antinuke' && (
            <div className="space-y-6">
              {!canAccessAntiNuke ? (
                /* RBAC LOCK SCREEN FOR REGULAR SERVER ADMINISTRATORS */
                <div className="p-8 rounded-3xl bg-[#0E1017] border-2 border-rose-500/40 shadow-2xl space-y-5">
                  <div className="flex items-start gap-4">
                    <div className="w-14 h-14 rounded-2xl bg-rose-500/20 border border-rose-500/40 flex items-center justify-center shrink-0">
                      <DiscordEmoji name="white_lock" id="1555133700835119136" size={28} />
                    </div>
                    <div className="space-y-2">
                      <div className="inline-flex items-center gap-2 px-3 py-1 rounded-lg bg-rose-500/15 border border-rose-500/30 text-rose-300 text-xs font-mono">
                        <span>ROLE-BASED ACCESS RESTRICTION • ADMINISTRATOR ROLE DETECTED</span>
                      </div>
                      <h2 className="font-display font-extrabold text-2xl text-white">
                        Anti-Nuke Vault Locked for Standard Server Administrators
                      </h2>
                      <p className="text-sm text-[#9499B3] leading-relaxed max-w-2xl">
                        You are currently signed in with <strong className="text-white">Server Administrator</strong> permissions in{' '}
                        <strong className="text-white">{activeGuild?.name}</strong>. Server Administrators can manage{' '}
                        <strong className="text-indigo-300">Bot Settings</strong>,{' '}
                        <strong className="text-indigo-300">Set Channels</strong>,{' '}
                        <strong className="text-cyan-300">Live 320kbps Music</strong>, Moderation, and Utilities, but{' '}
                        <strong className="text-rose-300">cannot view or modify Anti-Nuke Vault settings</strong>.
                      </p>
                      <p className="text-xs text-[#C4C9DF] font-mono">
                        Only the <strong>Server Owner</strong> and designated <strong>Extra Added Owners</strong> can access Anti-Nuke settings.
                      </p>
                    </div>
                  </div>

                  <div className="p-4 rounded-2xl bg-[#07080C] border border-white/10 flex flex-wrap items-center justify-between gap-4">
                    <div className="space-y-1">
                      <div className="text-xs font-mono text-[#9499B3]">
                        Authorized Anti-Nuke Vault Controllers in {activeGuild?.name}:
                      </div>
                      <div className="flex flex-wrap gap-2">
                        <span className="px-2.5 py-1 rounded-lg bg-amber-500/15 border border-amber-500/30 text-xs font-mono text-amber-300">
                          Server Owner: {activeGuild?.ownerId || '1181221352393420856'}
                        </span>
                        {(antiNuke?.trustedHumans?.extraOwners || []).map((eo: string) => (
                          <span
                            key={eo}
                            className="px-2.5 py-1 rounded-lg bg-cyan-500/15 border border-cyan-500/30 text-xs font-mono text-cyan-200"
                          >
                            Extra Owner: {eo}
                          </span>
                        ))}
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-2">
                      <button
                        onClick={() => setActiveTab('overview')}
                        className="px-4 py-2 rounded-xl bg-white/[0.08] hover:bg-white/[0.15] text-xs font-semibold text-white cursor-pointer"
                      >
                        Go to Bot Settings
                      </button>
                    </div>
                  </div>
                </div>
              ) : (
                <>
                  {/* EXTRA ADDED OWNERS MANAGER CARD (TOP OF ANTI-NUKE VAULT) */}
                  <div className="p-6 rounded-2xl bg-[#0E1017] border border-amber-500/30 space-y-4">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                      <div>
                        <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded bg-amber-500/15 border border-amber-500/30 text-[10px] font-mono text-amber-300 mb-1">
                          <DiscordEmoji name="white_owner" id="1555133769659187260" size={13} />
                          <span>SOVEREIGN CLEARANCE VERIFIED ({currentRole.toUpperCase()})</span>
                        </div>
                        <h3 className="font-display font-bold text-lg text-white flex items-center gap-2">
                          <DiscordEmoji name="white_co_owner" id="1555133610858647603" size={20} />
                          <span>Extra Added Owners (`extraOwners`) — Anti-Nuke Vault Access</span>
                        </h3>
                        <p className="text-xs text-[#9499B3]">
                          Regular Server Administrators cannot access Anti-Nuke. Add trusted co-owners here so they can configure the Anti-Nuke Vault alongside the Server Owner.
                        </p>
                      </div>

                      <div className="flex gap-2 shrink-0">
                        <input
                          type="text"
                          value={extraOwnerInput}
                          onChange={(e) => setExtraOwnerInput(e.target.value)}
                          placeholder="Enter Discord User ID or Tag..."
                          className="px-3.5 py-2 rounded-xl bg-[#07080C] border border-white/15 text-xs font-mono text-white"
                        />
                        <button
                          onClick={() => {
                            if (extraOwnerInput.trim()) {
                              handleAntiNukeAction({
                                action: 'addTrustedHuman',
                                trustCategory: 'extraOwners',
                                targetValue: extraOwnerInput.trim(),
                              });
                              setExtraOwnerInput('');
                            }
                          }}
                          className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-xs font-bold text-black flex items-center gap-1.5 cursor-pointer"
                        >
                          <DiscordEmoji name="white_co_owner" id="1555133610858647603" size={15} />
                          <span>Add Extra Owner</span>
                        </button>
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-2 pt-2 border-t border-white/[0.06]">
                      <span className="px-3 py-1 rounded-xl bg-amber-500/20 border border-amber-500/40 text-xs font-mono text-amber-300 flex items-center gap-1.5">
                        <DiscordEmoji name="white_owner" id="1555133769659187260" size={13} />
                        <span>Server Owner: {activeGuild?.ownerId || '1181221352393420856'}</span>
                      </span>
                      {(antiNuke?.trustedHumans?.extraOwners || []).map((eo: string) => (
                        <span
                          key={eo}
                          className="px-3 py-1 rounded-xl bg-cyan-500/15 border border-cyan-500/30 text-xs font-mono text-cyan-200 flex items-center gap-2"
                        >
                          <DiscordEmoji name="white_co_owner" id="1555133610858647603" size={13} />
                          <span>Extra Owner: {eo}</span>
                          <button
                            onClick={() =>
                              handleAntiNukeAction({
                                action: 'removeTrustedHuman',
                                trustCategory: 'extraOwners',
                                targetValue: eo,
                              })
                            }
                            className="text-rose-400 hover:text-rose-200 font-bold cursor-pointer"
                            title="Remove Extra Owner"
                          >
                            ×
                          </button>
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Top Master Controls */}
                  <div className="p-6 rounded-2xl bg-[#0E1017] border border-white/[0.08] space-y-4">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                      <div>
                        <h2 className="font-display font-bold text-xl text-white flex items-center gap-2.5">
                          <DiscordEmoji name="white_antinuke" id="1555133560334061610" size={22} />
                          <span>Anti-Nuke Vault (16 Mini-Modules) — {activeGuild?.name}</span>
                        </h2>
                        <p className="text-xs text-[#9499B3]">
                          Real-time audit log interception, Betrayal Guard anti-infiltration shield, and instant server recovery.
                        </p>
                      </div>

                      <div className="flex flex-wrap items-center gap-2">
                        <button
                          onClick={() => handleAntiNukeAction({ action: 'toggleMaster' })}
                          className={`px-4 py-2 rounded-xl border text-xs font-bold flex items-center gap-1.5 cursor-pointer ${
                            antiNuke?.enabled
                              ? 'bg-emerald-500/20 border-emerald-500/40 text-emerald-300'
                              : 'bg-rose-500/20 border-rose-500/40 text-rose-300'
                          }`}
                        >
                          <DiscordEmoji
                            name={antiNuke?.enabled ? 'Button_on' : 'Button_off'}
                            id={
                              antiNuke?.enabled
                                ? '1555133307434434610'
                                : '1555133300522098758'
                            }
                            size={16}
                          />
                          <span>Master Vault: {antiNuke?.enabled ? 'ON' : 'OFF'}</span>
                        </button>

                        <button
                          onClick={() => handleAntiNukeAction({ action: 'toggleBetrayalGuard' })}
                          className={`px-3.5 py-2 rounded-xl border text-xs font-semibold flex items-center gap-1.5 cursor-pointer ${
                            antiNuke?.betrayalGuardEnabled
                              ? 'bg-indigo-500/20 border-indigo-500/40 text-indigo-200'
                              : 'bg-white/[0.04] border-white/10 text-[#9499B3]'
                          }`}
                        >
                          <DiscordEmoji name="white_terminate" id="1555133855143567430" size={15} />
                          <span>Betrayal Guard: {antiNuke?.betrayalGuardEnabled ? 'ON' : 'OFF'}</span>
                        </button>

                        <button
                          onClick={() => handleAntiNukeAction({ action: 'runWizard' })}
                          className="px-4 py-2 rounded-xl bg-gradient-to-r from-indigo-600 to-cyan-600 text-xs font-bold text-white flex items-center gap-1.5 cursor-pointer"
                        >
                          <DiscordEmoji name="white_lock" id="1555133700835119136" size={15} />
                          <span>Run Vault Setup Wizard</span>
                        </button>
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-2 pt-2 border-t border-white/[0.06]">
                      <button
                        onClick={() => handleAntiNukeAction({ action: 'enableAllModules' })}
                        className="px-3 py-1.5 rounded-lg bg-emerald-500/15 border border-emerald-500/30 text-xs text-emerald-300 flex items-center gap-1.5 cursor-pointer"
                      >
                        <DiscordEmoji name="Button_on" id="1555133307434434610" size={14} />
                        <span>Enable All 16 Modules</span>
                      </button>
                      <button
                        onClick={() => handleAntiNukeAction({ action: 'disableAllModules' })}
                        className="px-3 py-1.5 rounded-lg bg-rose-500/15 border border-rose-500/30 text-xs text-rose-300 flex items-center gap-1.5 cursor-pointer"
                      >
                        <DiscordEmoji name="Button_off" id="1555133300522098758" size={14} />
                        <span>Disable All Modules</span>
                      </button>
                    </div>
                  </div>

                  {/* 16 Mini-Modules Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                    {miniModules.map((mod: any) => {
                      const isOn = antiNuke?.miniModules?.[mod.id] !== false;
                      const currentPunish =
                        antiNuke?.modulePunishments?.[mod.id] || mod.defaultPunishment || 'ban';
                      return (
                        <div
                          key={mod.id}
                          className="p-4 rounded-2xl bg-[#0E1017] border border-white/[0.08] flex items-center justify-between gap-3"
                        >
                          <div className="min-w-0">
                            <div className="flex items-center gap-2">
                              <DiscordEmoji
                                name={isOn ? 'Button_on' : 'Button_off'}
                                id={isOn ? '1555133307434434610' : '1555133300522098758'}
                                size={16}
                              />
                              <h3 className="font-display font-bold text-sm text-white truncate">
                                {mod.name}
                              </h3>
                            </div>
                            <p className="text-xs text-[#9499B3] mt-1 line-clamp-1">
                              {mod.description}
                            </p>
                          </div>

                          <div className="flex items-center gap-2 shrink-0">
                            <select
                              aria-label={`Punishment for ${mod.name}`}
                              value={currentPunish}
                              onChange={(e) =>
                                handleAntiNukeAction({
                                  action: 'setModulePunishment',
                                  moduleId: mod.id,
                                  punishment: e.target.value,
                                })
                              }
                              className="px-2.5 py-1.5 rounded-lg bg-[#07080C] border border-white/15 text-xs font-mono uppercase text-white"
                            >
                              <option value="ban">BAN</option>
                              <option value="kick">KICK</option>
                              <option value="quarantine">QUARANTINE</option>
                            </select>

                            <button
                              onClick={() =>
                                handleAntiNukeAction({ action: 'toggleModule', moduleId: mod.id })
                              }
                              className={`px-3 py-1.5 rounded-lg text-xs font-mono font-bold cursor-pointer ${
                                isOn
                                  ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                                  : 'bg-white/[0.05] text-[#9499B3]'
                              }`}
                            >
                              {isOn ? 'ON' : 'OFF'}
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {/* Whitelist & Uncapped Betrayal Logs */}
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <div className="p-6 rounded-2xl bg-[#0E1017] border border-white/[0.08] space-y-4">
                      <h3 className="font-display font-bold text-base text-white flex items-center gap-2">
                        <DiscordEmoji name="white_admin" id="1555133552797028443" size={18} />
                        <span>Whitelisted Users & Trusted Hierarchy</span>
                      </h3>

                      <div className="flex gap-2">
                        <input
                          type="text"
                          value={whitelistUserInput}
                          onChange={(e) => setWhitelistUserInput(e.target.value)}
                          placeholder="Add Whitelisted User ID..."
                          className="flex-1 px-3 py-2 rounded-xl bg-[#07080C] border border-white/15 text-xs font-mono text-white"
                        />
                        <button
                          onClick={() => {
                            if (whitelistUserInput.trim()) {
                              handleAntiNukeAction({
                                action: 'addWhitelistUser',
                                targetValue: whitelistUserInput,
                              });
                              setWhitelistUserInput('');
                            }
                          }}
                          className="px-3.5 py-2 rounded-xl bg-indigo-600 text-xs font-semibold text-white cursor-pointer"
                        >
                          Add User
                        </button>
                      </div>

                      <div className="flex flex-wrap gap-1.5">
                        {(antiNuke?.whitelistedUsers || []).map((uid: string) => (
                          <span
                            key={uid}
                            className="px-2.5 py-1 rounded-lg bg-white/[0.05] border border-white/10 text-xs font-mono text-indigo-200 flex items-center gap-1.5"
                          >
                            <span>{uid}</span>
                            <button
                              onClick={() =>
                                handleAntiNukeAction({
                                  action: 'removeWhitelistUser',
                                  targetValue: uid,
                                })
                              }
                              className="text-rose-400 hover:text-rose-200 cursor-pointer"
                            >
                              ×
                            </button>
                          </span>
                        ))}
                      </div>
                    </div>

                    <div className="p-6 rounded-2xl bg-[#0E1017] border border-white/[0.08] space-y-3">
                      <div className="flex items-center justify-between">
                        <h3 className="font-display font-bold text-base text-white flex items-center gap-2">
                          <DiscordEmoji name="Logging" id="1555133381182881852" size={18} />
                          <span>
                            Uncapped Betrayal Guard Logs ({antiNuke?.betrayalLogs?.length || 0})
                          </span>
                        </h3>
                        <span className="text-[10px] font-mono text-emerald-400">ZERO LOG CAP</span>
                      </div>
                      <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
                        {(antiNuke?.betrayalLogs || []).map((log: any, i: number) => (
                          <div
                            key={i}
                            className="p-3 rounded-xl bg-[#07080C] border border-rose-500/30 text-xs space-y-1"
                          >
                            <div className="flex items-center justify-between font-mono text-[11px] text-rose-300">
                              <span>{log.severity}</span>
                              <span>{log.timestamp}</span>
                            </div>
                            <div className="text-white">
                              Inviter: <code className="text-indigo-300">{log.inviterId}</code> •
                              Rogue Bot: <code className="text-amber-300">{log.botId}</code>
                            </div>
                            <div className="text-[#9499B3]">{log.actionTaken}</div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </>
              )}
            </div>
          )}

          {/* =====================================================================
              TAB 5: HONEYPOT RAIDER TRAP & AUTOMOD RULES
             ===================================================================== */}
          {activeTab === 'honeypot' && (
            <div className="space-y-6">
              <div className="p-6 rounded-2xl bg-[#0E1017] border border-white/[0.08] space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <h2 className="font-display font-bold text-xl text-white flex items-center gap-2.5">
                      <DiscordEmoji name="white_automod" id="1555133567762174053" size={22} />
                      <span>
                        Honeypot Self-Bot Trap — #{honeypot?.channelName || 'dont-text-here'}
                      </span>
                    </h2>
                    <p className="text-xs text-[#9499B3]">
                      Any non-whitelisted account that sends a message in the decoy channel is immediately punished and logged.
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleHoneypotAction({ action: 'toggle' })}
                      className={`px-4 py-2 rounded-xl border text-xs font-bold flex items-center gap-1.5 cursor-pointer ${
                        honeypot?.enabled
                          ? 'bg-emerald-500/20 border-emerald-500/40 text-emerald-300'
                          : 'bg-rose-500/20 border-rose-500/40 text-rose-300'
                      }`}
                    >
                      <DiscordEmoji
                        name={honeypot?.enabled ? 'Button_on' : 'Button_off'}
                        id={honeypot?.enabled ? '1555133307434434610' : '1555133300522098758'}
                        size={16}
                      />
                      <span>Honeypot: {honeypot?.enabled ? 'ACTIVE' : 'DISABLED'}</span>
                    </button>

                    <button
                      onClick={() => handleHoneypotAction({ action: 'simulateTrap' })}
                      className="px-4 py-2 rounded-xl bg-amber-500/20 border border-amber-500/40 text-xs font-semibold text-amber-200 flex items-center gap-1.5 cursor-pointer"
                    >
                      <DiscordEmoji name="white_strike" id="1555133832305451101" size={15} />
                      <span>Simulate Raider Trap</span>
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
                  <div className="sm:col-span-2 flex gap-2">
                    <input
                      type="text"
                      value={honeypotChannelInput}
                      onChange={(e) => setHoneypotChannelInput(e.target.value)}
                      placeholder="dont-text-here"
                      className="flex-1 px-3.5 py-2 rounded-xl bg-[#07080C] border border-white/15 text-xs font-mono text-white"
                    />
                    <button
                      onClick={() =>
                        handleHoneypotAction({
                          action: 'setChannel',
                          channelName: honeypotChannelInput,
                        })
                      }
                      className="px-4 py-2 rounded-xl bg-indigo-600 text-xs font-semibold text-white cursor-pointer"
                    >
                      Set Trap Channel
                    </button>
                  </div>

                  <div>
                    <select
                      value={honeypot?.punishment || 'kick'}
                      onChange={(e) =>
                        handleHoneypotAction({ action: 'setPunishment', punishment: e.target.value })
                      }
                      className="w-full px-3.5 py-2 rounded-xl bg-[#07080C] border border-white/15 text-xs font-mono uppercase text-white"
                    >
                      <option value="ban">Punishment: BAN</option>
                      <option value="kick">Punishment: KICK</option>
                      <option value="quarantine">Punishment: QUARANTINE</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* AutoMod Rules List */}
              <div className="p-6 rounded-2xl bg-[#0E1017] border border-white/[0.08] space-y-4">
                <h3 className="font-display font-bold text-lg text-white flex items-center gap-2">
                  <DiscordEmoji name="Rules" id="1555133502197076030" size={19} />
                  <span>Native AutoMod Rules ({autoModRules.length})</span>
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {autoModRules.map((rule: any) => (
                    <div
                      key={rule.id}
                      className="p-4 rounded-2xl bg-[#07080C] border border-white/[0.08] space-y-3"
                    >
                      <div className="flex items-center justify-between">
                        <div className="font-display font-bold text-sm text-white">{rule.name}</div>
                        <button
                          onClick={() => handleAutoModAction({ ruleId: rule.id, action: 'toggle' })}
                          className={`px-2.5 py-1 rounded-lg text-xs font-mono cursor-pointer ${
                            rule.enabled
                              ? 'bg-emerald-500/20 text-emerald-300'
                              : 'bg-white/[0.05] text-[#9499B3]'
                          }`}
                        >
                          {rule.enabled ? 'ACTIVE' : 'OFF'}
                        </button>
                      </div>

                      {rule.keywords && (
                        <div className="space-y-2">
                          <div className="flex flex-wrap gap-1.5">
                            {rule.keywords.map((kw: string) => (
                              <span
                                key={kw}
                                className="px-2 py-0.5 rounded bg-white/[0.05] text-[11px] font-mono text-indigo-200 flex items-center gap-1"
                              >
                                <span>{kw}</span>
                                <button
                                  onClick={() =>
                                    handleAutoModAction({
                                      ruleId: rule.id,
                                      action: 'removeKeyword',
                                      keyword: kw,
                                    })
                                  }
                                  className="text-rose-400 cursor-pointer"
                                >
                                  ×
                                </button>
                              </span>
                            ))}
                          </div>
                          <div className="flex gap-2">
                            <input
                              type="text"
                              value={keywordInputs[rule.id] || ''}
                              onChange={(e) =>
                                setKeywordInputs((p) => ({ ...p, [rule.id]: e.target.value }))
                              }
                              placeholder="Add blocked keyword..."
                              className="flex-1 px-2.5 py-1.5 rounded-lg bg-[#0E1017] border border-white/10 text-xs text-white"
                            />
                            <button
                              onClick={() => {
                                const kw = keywordInputs[rule.id];
                                if (kw?.trim()) {
                                  handleAutoModAction({
                                    ruleId: rule.id,
                                    action: 'addKeyword',
                                    keyword: kw,
                                  });
                                  setKeywordInputs((p) => ({ ...p, [rule.id]: '' }));
                                }
                              }}
                              className="px-3 py-1.5 rounded-lg bg-indigo-600 text-xs text-white cursor-pointer"
                            >
                              Add
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* =====================================================================
              TAB 6: MODERATION, APPEALS & UNCAPPED CASE HISTORY
             ===================================================================== */}
          {activeTab === 'moderation' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                <div className="lg:col-span-5 p-6 rounded-2xl bg-[#0E1017] border border-white/[0.08] space-y-4">
                  <h2 className="font-display font-bold text-lg text-white flex items-center gap-2">
                    <DiscordEmoji name="Moderator" id="1555133403261571144" size={20} />
                    <span>Issue Moderation Case</span>
                  </h2>

                  <div className="space-y-3">
                    <input
                      type="text"
                      value={newCaseTarget}
                      onChange={(e) => setNewCaseTarget(e.target.value)}
                      placeholder="Target User Tag or ID"
                      className="w-full px-3.5 py-2 rounded-xl bg-[#07080C] border border-white/15 text-xs text-white"
                    />
                    <div className="grid grid-cols-2 gap-2">
                      <select
                        value={newCaseType}
                        onChange={(e) => setNewCaseType(e.target.value)}
                        className="px-3 py-2 rounded-xl bg-[#07080C] border border-white/15 text-xs font-mono uppercase text-white"
                      >
                        <option value="ban">BAN</option>
                        <option value="kick">KICK</option>
                        <option value="mute">MUTE</option>
                        <option value="warn">WARN</option>
                        <option value="quarantine">QUARANTINE</option>
                      </select>
                      <input
                        type="text"
                        value={newCaseDuration}
                        onChange={(e) => setNewCaseDuration(e.target.value)}
                        placeholder="Duration (e.g. 7d)"
                        className="px-3 py-2 rounded-xl bg-[#07080C] border border-white/15 text-xs font-mono text-white"
                      />
                    </div>
                    <input
                      type="text"
                      value={newCaseReason}
                      onChange={(e) => setNewCaseReason(e.target.value)}
                      placeholder="Punishment Reason"
                      className="w-full px-3.5 py-2 rounded-xl bg-[#07080C] border border-white/15 text-xs text-white"
                    />
                    <button
                      onClick={() =>
                        handleModerationAction({
                          action: 'createCase',
                          caseData: {
                            targetTag: newCaseTarget,
                            punishmentType: newCaseType,
                            reason: newCaseReason,
                            duration: newCaseDuration,
                          },
                        })
                      }
                      className="w-full py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-xs font-bold text-white flex items-center justify-center gap-2 cursor-pointer"
                    >
                      <DiscordEmoji name="white_ban" id="1555133582140248125" size={16} />
                      <span>Create & Persist Case</span>
                    </button>
                  </div>
                </div>

                <div className="lg:col-span-7 p-6 rounded-2xl bg-[#0E1017] border border-white/[0.08] space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="font-display font-bold text-lg text-white flex items-center gap-2">
                      <DiscordEmoji name="Logging" id="1555133381182881852" size={19} />
                      <span>Uncapped Server Case History ({moderation?.cases?.length || 0})</span>
                    </h3>
                    <span className="text-[11px] font-mono text-emerald-400">FIRESTORE SYNCED</span>
                  </div>

                  <div className="space-y-2.5 max-h-[430px] overflow-y-auto pr-1">
                    {(moderation?.cases || []).map((c: any) => (
                      <div
                        key={c.caseId}
                        className="p-3.5 rounded-xl bg-[#07080C] border border-white/[0.08] flex items-center justify-between gap-4"
                      >
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <span className="font-mono font-bold text-xs text-indigo-300">
                              #{c.caseId}
                            </span>
                            <span className="px-2 py-0.5 rounded bg-rose-500/15 text-rose-300 text-[10px] font-mono uppercase">
                              {c.punishmentType}
                            </span>
                            <span className="text-xs font-semibold text-white">{c.targetTag}</span>
                            <span
                              className={`text-[10px] font-mono px-1.5 py-0.5 rounded ${
                                c.status === 'active'
                                  ? 'bg-emerald-500/15 text-emerald-300'
                                  : 'bg-white/10 text-[#9499B3]'
                              }`}
                            >
                              {c.status.toUpperCase()}
                            </span>
                          </div>
                          <div className="text-xs text-[#9499B3]">Reason: {c.reason}</div>
                        </div>

                        {c.status === 'active' && (
                          <button
                            onClick={() =>
                              handleModerationAction({ action: 'revertCase', caseId: c.caseId })
                            }
                            className="px-3 py-1.5 rounded-lg bg-white/[0.06] hover:bg-white/[0.12] text-xs font-semibold text-amber-200 cursor-pointer shrink-0"
                          >
                            Revert Case
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* =====================================================================
              TAB 7: UTILITIES (.purge, .snipe, .editsnipe, .noprefix)
             ===================================================================== */}
          {activeTab === 'utilities' && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="p-6 rounded-2xl bg-[#0E1017] border border-white/[0.08] space-y-5">
                <h2 className="font-display font-bold text-lg text-white flex items-center gap-2">
                  <DiscordEmoji name="Tool" id="1555133545918369894" size={20} />
                  <span>Bulk Purge & Channel Snipe Buffer</span>
                </h2>

                <div className="space-y-3">
                  <label className="block text-xs font-mono uppercase text-[#9499B3]">
                    Execute `.purge` Bulk Message Sweep
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="number"
                      min={1}
                      max={100}
                      value={purgeAmount}
                      onChange={(e) => setPurgeAmount(Number(e.target.value))}
                      className="w-24 px-3 py-2 rounded-xl bg-[#07080C] border border-white/15 text-xs font-mono text-white"
                    />
                    <select
                      value={purgeFilter}
                      onChange={(e) => setPurgeFilter(e.target.value)}
                      className="flex-1 px-3 py-2 rounded-xl bg-[#07080C] border border-white/15 text-xs text-white"
                    >
                      <option value="all">Filter: All Messages</option>
                      <option value="bots">Filter: Bots Only</option>
                      <option value="humans">Filter: Humans Only</option>
                      <option value="links">Filter: Links & Invites</option>
                    </select>
                    <button
                      onClick={() =>
                        handleUtilitiesAction({
                          action: 'purge',
                          amount: purgeAmount,
                          filter: purgeFilter,
                        })
                      }
                      className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-xs font-bold text-white flex items-center gap-1.5 cursor-pointer"
                    >
                      <DiscordEmoji name="white_delete" id="1555133618072846417" size={15} />
                      <span>Purge</span>
                    </button>
                  </div>
                </div>

                <div className="pt-4 border-t border-white/[0.07] space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-mono uppercase text-[#9499B3]">
                      `.snipe` & `.editsnipe` Buffer
                    </span>
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleUtilitiesAction({ action: 'simulateSnipe' })}
                        className="px-2.5 py-1 rounded-lg bg-indigo-500/20 text-indigo-200 text-xs cursor-pointer"
                      >
                        Simulate Deleted Msg
                      </button>
                      <button
                        onClick={() => handleUtilitiesAction({ action: 'clearSnipe' })}
                        className="px-2.5 py-1 rounded-lg bg-rose-500/20 text-rose-300 text-xs cursor-pointer"
                      >
                        Clear Snipe
                      </button>
                    </div>
                  </div>

                  {utilities?.snipe ? (
                    <div className="p-3.5 rounded-xl bg-[#07080C] border border-white/10 space-y-1 text-xs">
                      <div className="font-bold text-white">{utilities.snipe.authorTag}</div>
                      <div className="text-[#9499B3]">&ldquo;{utilities.snipe.content}&rdquo;</div>
                    </div>
                  ) : (
                    <div className="p-3.5 rounded-xl bg-[#07080C] border border-white/[0.06] text-xs text-[#9499B3]">
                      No recently deleted messages in buffer.
                    </div>
                  )}
                </div>
              </div>

              <div className="p-6 rounded-2xl bg-[#0E1017] border border-white/[0.08] space-y-5">
                <div className="flex items-center justify-between">
                  <h2 className="font-display font-bold text-lg text-white flex items-center gap-2">
                    <DiscordEmoji name="white_no_prefix" id="1555133762734657581" size={20} />
                    <span>Sideways Prefix, No-Prefix & Redeem Codes</span>
                  </h2>
                  <span className="text-[11px] font-mono text-cyan-300">
                    Prefix · No-Prefix · Slash Synced
                  </span>
                </div>

                <p className="text-xs text-[#9499B3]">
                  Every command is registered sideways across Prefix (<code>{settingsDraft.prefix || '.'}cmd</code>), No-Prefix (<code>cmd</code>), and Discord Slash Commands (<code>/cmd</code>).
                </p>

                <div className="space-y-3">
                  <label className="block text-xs font-mono uppercase text-[#9499B3]">
                    Grant No-Prefix Access (User ID or Server ID)
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={noPrefixTargetId}
                      onChange={(e) => setNoPrefixTargetId(e.target.value)}
                      placeholder="User ID or Server ID..."
                      className="flex-1 px-3 py-2 rounded-xl bg-[#07080C] border border-white/15 text-xs font-mono text-white"
                    />
                    <input
                      type="number"
                      value={noPrefixDays}
                      onChange={(e) => setNoPrefixDays(Number(e.target.value))}
                      className="w-20 px-2.5 py-2 rounded-xl bg-[#07080C] border border-white/15 text-xs font-mono text-white"
                    />
                    <button
                      onClick={() => {
                        if (noPrefixTargetId.trim()) {
                          handleUtilitiesAction({
                            action: 'grantNoPrefix',
                            targetId: noPrefixTargetId,
                            durationDays: noPrefixDays,
                          });
                          setNoPrefixTargetId('');
                        }
                      }}
                      className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-xs font-bold text-white cursor-pointer"
                    >
                      Grant NP
                    </button>
                  </div>
                </div>

                {/* Generate & Redeem Code Controls */}
                <div className="pt-3 border-t border-white/[0.07] space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-mono uppercase text-[#9499B3]">
                      Redeem Codes (`.noprefix redeem` / `/noprefix`)
                    </span>
                    <button
                      onClick={() =>
                        handleUtilitiesAction({
                          action: 'generateCode',
                          targetType: 'user',
                          durationDays: noPrefixDays || 30,
                        })
                      }
                      className="px-3 py-1 rounded-lg bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 text-xs font-semibold cursor-pointer"
                    >
                      + Generate 30d Code
                    </button>
                  </div>

                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={redeemCodeInput}
                      onChange={(e) => setRedeemCodeInput(e.target.value)}
                      placeholder="Enter Redeem Code (e.g. ZENITH-NP-...)"
                      className="flex-1 px-3 py-2 rounded-xl bg-[#07080C] border border-white/15 text-xs font-mono text-white"
                    />
                    <button
                      onClick={() => {
                        if (redeemCodeInput.trim()) {
                          handleUtilitiesAction({
                            action: 'redeemCode',
                            code: redeemCodeInput.trim(),
                            userId: userSession?.id || '1181221352393420856',
                          });
                          setRedeemCodeInput('');
                        }
                      }}
                      className="px-4 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-xs font-bold text-white cursor-pointer"
                    >
                      Redeem
                    </button>
                  </div>

                  {/* Active No-Prefix Grants & Codes Summary */}
                  <div className="grid grid-cols-2 gap-2 pt-1 text-xs font-mono">
                    <div className="p-2.5 rounded-xl bg-[#07080C] border border-white/[0.06]">
                      <div className="text-[#9499B3] text-[10px]">ACTIVE NP USERS</div>
                      <div className="text-white font-bold tabular-nums mt-0.5">
                        {Object.keys(utilities?.noPrefix?.users || {}).length} Granted
                      </div>
                    </div>
                    <div className="p-2.5 rounded-xl bg-[#07080C] border border-white/[0.06]">
                      <div className="text-[#9499B3] text-[10px]">GENERATED CODES</div>
                      <div className="text-cyan-300 font-bold tabular-nums mt-0.5">
                        {(utilities?.noPrefix?.redeemCodes || []).length} Codes
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* =====================================================================
              TAB 8: COMMAND DIRECTORY
             ===================================================================== */}
          {activeTab === 'commands' && (
            <div className="p-6 rounded-2xl bg-[#0E1017] border border-white/[0.08] space-y-5">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h2 className="font-display font-bold text-xl text-white flex items-center gap-2">
                    <DiscordEmoji name="Commands" id="1555133314380206160" size={22} />
                    <span>Complete Command Directory ({commands.length} Commands)</span>
                  </h2>
                  <p className="text-xs text-[#9499B3]">
                    Every command includes easy aliases and supports `-info`, `-help`, and `-i` inspection.
                  </p>
                </div>

                <div className="flex gap-2">
                  <select
                    value={cmdModuleFilter}
                    onChange={(e) => setCmdModuleFilter(e.target.value)}
                    className="px-3 py-2 rounded-xl bg-[#07080C] border border-white/15 text-xs text-white"
                  >
                    <option value="all">All Modules</option>
                    <option value="antinuke">Anti-Nuke Vault</option>
                    <option value="music">24/7 Music</option>
                    <option value="moderation">Moderation</option>
                    <option value="utility">Utilities</option>
                    <option value="automod">AutoMod</option>
                  </select>
                  <input
                    type="text"
                    value={cmdSearch}
                    onChange={(e) => setCmdSearch(e.target.value)}
                    placeholder="Search command or alias..."
                    className="px-3.5 py-2 rounded-xl bg-[#07080C] border border-white/15 text-xs text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-[540px] overflow-y-auto pr-1">
                {commands
                  .filter((c: any) =>
                    cmdModuleFilter === 'all' ? true : c.module === cmdModuleFilter
                  )
                  .filter((c: any) =>
                    !cmdSearch.trim()
                      ? true
                      : c.name.toLowerCase().includes(cmdSearch.toLowerCase()) ||
                        (c.aliases || []).some((a: string) =>
                          a.toLowerCase().includes(cmdSearch.toLowerCase())
                        )
                  )
                  .map((cmd: any) => (
                    <div
                      key={cmd.id}
                      className="p-4 rounded-xl bg-[#07080C] border border-white/[0.08] flex items-start justify-between gap-3"
                    >
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="font-mono font-bold text-sm text-indigo-300">
                            .{cmd.name}
                          </span>
                          <span className="px-2 py-0.5 rounded bg-white/[0.05] text-[10px] font-mono uppercase text-[#9499B3]">
                            {cmd.module}
                          </span>
                        </div>
                        <p className="text-xs text-[#9499B3]">{cmd.description}</p>
                        <div className="text-[11px] font-mono text-cyan-300">
                          Aliases: {(cmd.aliases || []).map((a: string) => `.${a}`).join(', ') || 'None'}
                        </div>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        <button
                          onClick={() => {
                            setSandboxInput(`.${cmd.name} -info`);
                            setActiveTab('sandbox');
                            handleRunSandboxCommand(`.${cmd.name} -info`);
                          }}
                          className="px-2.5 py-1 rounded-lg bg-indigo-500/20 text-indigo-200 text-xs font-mono cursor-pointer"
                        >
                          -info
                        </button>
                        <button
                          onClick={() => handleToggleCommand(cmd.id)}
                          className={`px-2.5 py-1 rounded-lg text-xs font-mono font-bold cursor-pointer ${
                            cmd.enabled
                              ? 'bg-emerald-500/20 text-emerald-300'
                              : 'bg-rose-500/20 text-rose-300'
                          }`}
                        >
                          {cmd.enabled ? 'ON' : 'OFF'}
                        </button>
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          )}

          {/* =====================================================================
              TAB 9: LIVE INTERACTIVE BOT SANDBOX
             ===================================================================== */}
          {activeTab === 'sandbox' && (
            <div className="p-6 rounded-2xl bg-[#0E1017] border border-white/[0.08] space-y-5">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <h2 className="font-display font-bold text-xl text-white flex items-center gap-2">
                    <DiscordEmoji name="white_bot" id="1555133589581070416" size={22} />
                    <span>Live Interactive Command & Embed Sandbox</span>
                  </h2>
                  <p className="text-xs text-[#9499B3]">
                    Test any command, dropdown menu, or <code>-info</code> spec.
                  </p>
                </div>

                <div className="flex flex-wrap gap-1.5">
                  {['.help', '.botinfo', '.antinuke', '.purge -info', '.botname -info'].map(
                    (preset) => (
                      <button
                        key={preset}
                        onClick={() => {
                          setSandboxInput(preset);
                          handleRunSandboxCommand(preset);
                        }}
                        className="px-2.5 py-1 rounded-lg bg-white/[0.05] hover:bg-white/[0.1] text-xs font-mono text-indigo-300 cursor-pointer"
                      >
                        {preset}
                      </button>
                    )
                  )}
                </div>
              </div>

              <div className="flex gap-2">
                <input
                  type="text"
                  value={sandboxInput}
                  onChange={(e) => setSandboxInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleRunSandboxCommand()}
                  placeholder="Type a bot command (e.g., .help, .antinuke, .snipe -info)..."
                  className="flex-1 px-4 py-2.5 rounded-xl bg-[#07080C] border border-white/15 text-sm font-mono text-white focus:outline-none focus:border-indigo-500"
                />
                <button
                  onClick={() => handleRunSandboxCommand()}
                  className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-xs sm:text-sm font-bold text-white flex items-center gap-2 cursor-pointer"
                >
                  {sandboxLoading ? (
                    <>
                      <DiscordEmoji
                        name="white_loading"
                        id="1555133693704544337"
                        animated={true}
                        size={18}
                      />
                      <span>Loading...</span>
                    </>
                  ) : (
                    <>
                      <DiscordEmoji name="Commands" id="1555133314380206160" size={18} />
                      <span>Execute</span>
                    </>
                  )}
                </button>
              </div>

              <div className="space-y-4 max-h-[500px] overflow-y-auto pr-1">
                {sandboxHistory.map((item) => (
                  <div
                    key={item.id}
                    className="p-4 rounded-2xl bg-[#07080C] border border-white/[0.08] space-y-3"
                  >
                    <div className="text-xs font-mono text-indigo-400">
                      Executed: <code>{item.command}</code>
                    </div>
                    {item.reply && (
                      <div className="text-sm text-white">
                        <RichDiscordText text={item.reply} />
                      </div>
                    )}
                    {item.embed && (
                      <div className="p-4 rounded-xl bg-[#11131A] border border-indigo-500/40 space-y-2.5">
                        {item.embed.title && (
                          <div className="font-display font-bold text-base text-white">
                            <RichDiscordText text={item.embed.title} />
                          </div>
                        )}
                        {item.embed.description && (
                          <div className="text-xs sm:text-sm text-[#C4C9DF] whitespace-pre-line leading-relaxed">
                            <RichDiscordText text={item.embed.description} />
                          </div>
                        )}
                        {Array.isArray(item.embed.fields) && (
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1">
                            {item.embed.fields.map((f: any, idx: number) => (
                              <div key={idx} className="p-2.5 rounded-lg bg-black/30 space-y-1">
                                <div className="text-xs font-bold text-white">
                                  <RichDiscordText text={f.name} />
                                </div>
                                <div className="text-xs text-[#9499B3] whitespace-pre-line">
                                  <RichDiscordText text={f.value} />
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    )}
                    {Array.isArray(item.dropdownOptions) && item.dropdownOptions.length > 0 && (
                      <div className="pt-1">
                        <select
                          aria-label="Sandbox Embed Dropdown"
                          onChange={(e) => handleRunSandboxCommand('', e.target.value)}
                          className="px-3.5 py-2 rounded-xl bg-[#151824] border border-indigo-500/40 text-xs text-white cursor-pointer"
                        >
                          {item.dropdownOptions.map((opt: any) => (
                            <option key={opt.value} value={opt.value}>
                              {opt.label}
                            </option>
                          ))}
                        </select>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </section>
      </div>

      {/* =====================================================================
          PERSISTENT FLOATING BOTTOM VC MINI-PLAYER BAR
         ===================================================================== */}
      {musicState?.currentTrack && (
        <div className="sticky bottom-0 z-20 bg-[#0B0D14]/95 backdrop-blur-xl border-t border-white/[0.08] px-4 sm:px-6 py-2.5">
          <div className="max-w-[1600px] mx-auto flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-3 min-w-0">
              <img
                src={
                  musicState.currentTrack.thumbnail ||
                  musicState.currentTrack.artwork ||
                  DEFAULT_ZENITH_BOT_ICON
                }
                alt={musicState.currentTrack.title}
                onError={(e) => {
                  (e.currentTarget as HTMLImageElement).src = DEFAULT_ZENITH_BOT_ICON;
                }}
                className="w-10 h-10 rounded-xl object-cover border border-cyan-500/40 shrink-0"
              />
              <div className="min-w-0">
                <div className="text-xs font-bold text-white truncate flex items-center gap-2">
                  <span>{musicState.currentTrack.title}</span>
                  <span className="text-[10px] font-mono text-cyan-300">
                    · {musicState.activeFilter || 'None'} · {musicState.volume ?? 100}%
                  </span>
                </div>
                <div className="text-[11px] text-[#9499B3] truncate">
                  {musicState.currentTrack.artist} · Queue: {musicState.queue?.length || 0} tracks
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => handleMusicAction({ action: 'previous' })}
                className="px-2.5 py-1.5 rounded-lg bg-white/[0.06] hover:bg-white/[0.12] text-xs font-semibold text-white flex items-center gap-1 cursor-pointer"
                title="Previous Track"
              >
                <DiscordEmoji name="white_previous" id="1555133790781972521" size={14} />
                <span className="hidden sm:inline">Prev</span>
              </button>
              <button
                onClick={() => handleMusicAction({ action: 'togglePause' })}
                className="px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-xs font-bold text-white flex items-center gap-1 cursor-pointer"
              >
                <DiscordEmoji
                  name={musicState.isPaused ? 'resume' : 'pause'}
                  id={musicState.isPaused ? '1555133494991265863' : '1555133437038297138'}
                  size={14}
                />
                <span>{musicState.isPaused ? 'Resume' : 'Pause'}</span>
              </button>
              <button
                onClick={() => handleMusicAction({ action: 'skip' })}
                className="px-2.5 py-1.5 rounded-lg bg-white/[0.06] hover:bg-white/[0.12] text-xs font-semibold text-white flex items-center gap-1 cursor-pointer"
                title="Skip Track"
              >
                <DiscordEmoji name="white_skip" id="1555133823698604074" size={14} />
                <span className="hidden sm:inline">Skip</span>
              </button>
              <button
                onClick={() => setShowVcFloatingModal(true)}
                className="px-3 py-1.5 rounded-lg bg-cyan-500/20 hover:bg-cyan-500/30 border border-cyan-500/30 text-xs font-semibold text-cyan-200 cursor-pointer"
              >
                Floating VC Modal
              </button>
              {activeTab !== 'music' && (
                <button
                  onClick={() => setActiveTab('music')}
                  className="px-3 py-1.5 rounded-lg bg-white/[0.06] hover:bg-white/[0.12] text-xs font-semibold text-white cursor-pointer"
                >
                  Open Music Tab
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* =====================================================================
          CHOREOGRAPHED DASHBOARD OPENING PORTAL ANIMATION OVERLAY
         ===================================================================== */}
      <ZenithOpeningAnimation
        isOpen={showDashboardBoot}
        onComplete={() => setShowDashboardBoot(false)}
        botAvatarUrl={botStatus.avatarUrl || DEFAULT_ZENITH_BOT_ICON}
        botTag={botStatus.tag || 'Zenith#9729'}
        botPing={botStatus.ping || 18}
        guildName={activeGuild?.name}
        variant="dashboard"
      />

      {/* =====================================================================
          FLOATING MODAL 3: LIVE VC AUDIO & DSP CONTROLLER
         ===================================================================== */}
      {showVcFloatingModal && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
          <div
            role="dialog"
            aria-label="Floating VC Audio Controller"
            className="bg-[#0E1017] border border-white/15 rounded-2xl max-w-xl w-full p-6 shadow-2xl space-y-4 animate-zenith-modal"
          >
            <div className="flex items-center justify-between border-b border-white/[0.08] pb-3">
              <div className="flex items-center gap-2">
                <DiscordEmoji name="white_mic" id="1555133722284527628" size={18} />
                <h3 className="font-display font-bold text-lg text-white">
                  Floating VC Controller — {activeGuild?.name}
                </h3>
              </div>
              <button
                onClick={() => setShowVcFloatingModal(false)}
                className="px-2.5 py-1 rounded-lg hover:bg-white/10 text-xs text-[#9499B3] hover:text-white flex items-center gap-1 cursor-pointer"
                aria-label="Close Floating VC Modal"
              >
                <DiscordEmoji name="white_cancel" id="1555133596652539988" size={14} />
              </button>
            </div>

            <div className="p-3.5 rounded-xl bg-[#07080C] border border-white/[0.08] flex items-center gap-3">
              <img
                src={
                  musicState?.currentTrack?.thumbnail ||
                  musicState?.currentTrack?.artwork ||
                  DEFAULT_ZENITH_BOT_ICON
                }
                alt="Now Playing"
                onError={(e) => {
                  (e.currentTarget as HTMLImageElement).src = DEFAULT_ZENITH_BOT_ICON;
                }}
                className="w-14 h-14 rounded-xl object-cover border border-cyan-500/40 shrink-0"
              />
              <div className="min-w-0 flex-1">
                <div className="text-sm font-bold text-white truncate">
                  {musicState?.currentTrack?.title || 'Starboy'}
                </div>
                <div className="text-xs text-[#9499B3] truncate">
                  {musicState?.currentTrack?.artist || 'The Weeknd, Daft Punk'}
                </div>
                <div className="text-[11px] font-mono text-cyan-300 mt-0.5">
                  Filter: {musicState?.activeFilter || 'None'} · Volume: {musicState?.volume ?? 100}% · Queue: {musicState?.queue?.length || 0}
                </div>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <select
                aria-label="Floating Modal Voice Channel Select"
                value={selectedVoiceChannelId}
                onChange={(e) => setSelectedVoiceChannelId(e.target.value)}
                className="flex-1 px-3 py-2 rounded-xl bg-[#07080C] border border-white/15 text-xs font-mono text-white"
              >
                <option value="">-- Auto-Select Active Voice Channel --</option>
                {availableChannels
                  .filter((c: any) => c.type === 'voice')
                  .map((vc: any) => (
                    <option key={vc.id} value={vc.id}>
                      VC: {vc.name} ({vc.id})
                    </option>
                  ))}
              </select>
              <button
                onClick={() =>
                  handleMusicAction({
                    action: 'joinVoiceChannel',
                    voiceChannelId: selectedVoiceChannelId || undefined,
                  })
                }
                className="px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-xs font-bold text-white cursor-pointer"
              >
                Join / Move VC
              </button>
              <button
                onClick={() => handleMusicAction({ action: 'leaveVoiceChannel' })}
                className="px-3 py-2 rounded-xl bg-rose-500/20 text-rose-300 text-xs font-semibold cursor-pointer"
              >
                Leave VC
              </button>
            </div>

            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => handleMusicAction({ action: 'previous' })}
                  className="px-3 py-1.5 rounded-xl bg-white/[0.06] hover:bg-white/[0.12] text-xs font-semibold text-white flex items-center gap-1 cursor-pointer"
                >
                  <DiscordEmoji name="white_previous" id="1555133790781972521" size={14} />
                  <span>Previous</span>
                </button>
                <button
                  onClick={() => handleMusicAction({ action: 'togglePause' })}
                  className="px-3.5 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-xs font-bold text-white flex items-center gap-1 cursor-pointer"
                >
                  <DiscordEmoji
                    name={musicState?.isPaused ? 'resume' : 'pause'}
                    id={musicState?.isPaused ? '1555133494991265863' : '1555133437038297138'}
                    size={14}
                  />
                  <span>{musicState?.isPaused ? 'Resume' : 'Pause'}</span>
                </button>
                <button
                  onClick={() => handleMusicAction({ action: 'skip' })}
                  className="px-3 py-1.5 rounded-xl bg-white/[0.06] hover:bg-white/[0.12] text-xs font-semibold text-white flex items-center gap-1 cursor-pointer"
                >
                  <DiscordEmoji name="white_skip" id="1555133823698604074" size={14} />
                  <span>Skip</span>
                </button>
              </div>

              <div className="flex flex-wrap gap-1.5">
                {[80, 100, 150, 200].map((v) => (
                  <button
                    key={v}
                    onClick={() => handleMusicAction({ action: 'setVolume', volume: v })}
                    className={`px-2 py-1 rounded-lg text-xs font-mono cursor-pointer ${
                      (musicState?.volume ?? 100) === v
                        ? 'bg-indigo-500 text-white font-bold'
                        : 'bg-white/[0.05] text-[#9499B3]'
                    }`}
                  >
                    {v}%
                  </button>
                ))}
              </div>
            </div>

            <div className="flex flex-wrap gap-1.5 pt-2 border-t border-white/[0.08]">
              {['None', '8D Audio', 'Bass Boost', 'Nightcore', 'Vaporwave'].map((f) => (
                <button
                  key={f}
                  onClick={() => handleMusicAction({ action: 'setFilter', filter: f })}
                  className={`px-2.5 py-1 rounded-lg text-xs font-semibold cursor-pointer ${
                    (musicState?.activeFilter || 'None') === f
                      ? 'bg-cyan-500/20 border border-cyan-500/40 text-cyan-200'
                      : 'bg-[#07080C] text-[#9499B3] hover:text-white'
                  }`}
                >
                  {f}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* =====================================================================
          FLOATING MODAL 4: MUTUAL SERVER SWITCHER
         ===================================================================== */}
      {showServerModal && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
          <div
            role="dialog"
            aria-label="Mutual Server Switcher Modal"
            className="bg-[#0E1017] border border-white/15 rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-4 animate-zenith-modal"
          >
            <div className="flex items-center justify-between border-b border-white/[0.08] pb-3">
              <div className="flex items-center gap-2">
                <DiscordEmoji name="globe" id="1555133344482590821" size={18} />
                <h3 className="font-display font-bold text-lg text-white">
                  Switch Discord Server ({guilds.filter((g) => g.botPresent !== false).length})
                </h3>
              </div>
              <button
                onClick={() => setShowServerModal(false)}
                className="px-2.5 py-1 rounded-lg hover:bg-white/10 text-xs text-[#9499B3] hover:text-white flex items-center gap-1 cursor-pointer"
                aria-label="Close Server Switcher Modal"
              >
                <DiscordEmoji name="white_cancel" id="1555133596652539988" size={14} />
              </button>
            </div>

            <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
              {guilds
                .filter((g) => g.botPresent !== false)
                .map((g) => (
                  <button
                    key={g.id}
                    onClick={() => {
                      setSelectedGuildId(g.id);
                      setShowServerModal(false);
                      showToast(`Switched active server to ${g.name}`);
                    }}
                    className={`w-full p-3 rounded-xl flex items-center justify-between text-left transition cursor-pointer ${
                      g.id === selectedGuildId
                        ? 'bg-indigo-500/20 border border-indigo-500/40 text-white'
                        : 'bg-[#07080C] hover:bg-white/[0.06] border border-white/[0.06] text-[#C4C9DF]'
                    }`}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <img
                        src={g.icon || g.botAvatar || DEFAULT_ZENITH_BOT_ICON}
                        alt={g.name}
                        onError={(e) => {
                          (e.currentTarget as HTMLImageElement).src = DEFAULT_ZENITH_BOT_ICON;
                        }}
                        className="w-9 h-9 rounded-xl object-cover shrink-0"
                      />
                      <div className="min-w-0">
                        <div className="text-sm font-bold text-white truncate">{g.name}</div>
                        <div className="text-[11px] font-mono text-[#9499B3]">
                          {g.memberCount.toLocaleString()} members · {g.userRoleLabel || 'Server Owner'}
                        </div>
                      </div>
                    </div>
                    <span className="text-xs font-mono text-indigo-300 flex items-center gap-1">
                      {g.id === selectedGuildId ? (
                        <>
                          <DiscordEmoji
                            name="white_Done"
                            id="1555133626276905040"
                            animated={true}
                            size={13}
                          />
                          <span>Active</span>
                        </>
                      ) : (
                        <span>Select</span>
                      )}
                    </span>
                  </button>
                ))}
            </div>
          </div>
        </div>
      )}

      {/* =====================================================================
          FLOATING MODAL 1: QUICK COMMAND PALETTE & MODULE JUMPER (⌘K)
         ===================================================================== */}
      {showQuickJumpModal && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
          <div
            role="dialog"
            aria-label="Quick Command Palette"
            className="bg-[#0E1017] border border-white/15 rounded-2xl max-w-xl w-full p-5 shadow-2xl space-y-4 animate-zenith-modal"
          >
            <div className="flex items-center justify-between border-b border-white/[0.08] pb-3">
              <div className="flex items-center gap-2">
                <DiscordEmoji name="Commands" id="1555133314380206160" size={18} />
                <span className="font-display font-bold text-base text-white">
                  Zenith Bot Quick Jump & Sideways Command Runner
                </span>
              </div>
              <button
                onClick={() => setShowQuickJumpModal(false)}
                className="px-2 py-1 rounded-lg hover:bg-white/10 text-xs text-[#9499B3] hover:text-white cursor-pointer"
                aria-label="Close Quick Command Palette"
              >
                ESC
              </button>
            </div>

            <input
              type="text"
              value={quickJumpQuery}
              onChange={(e) => setQuickJumpQuery(e.target.value)}
              placeholder="Jump to module or type a command (.prefix, .noprefix, .play, .antinuke)..."
              className="w-full px-3.5 py-2.5 rounded-xl bg-[#07080C] border border-white/15 text-sm text-white focus:outline-none focus:border-indigo-500"
            />

            <div className="space-y-1.5 max-h-64 overflow-y-auto">
              {navTabs
                .filter((t) =>
                  !quickJumpQuery.trim()
                    ? true
                    : t.label.toLowerCase().includes(quickJumpQuery.toLowerCase()) ||
                      t.id.toLowerCase().includes(quickJumpQuery.toLowerCase())
                )
                .map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => {
                      setActiveTab(tab.id);
                      setShowQuickJumpModal(false);
                    }}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#07080C] hover:bg-indigo-500/20 border border-white/[0.06] flex items-center justify-between text-left transition cursor-pointer"
                  >
                    <div className="flex items-center gap-2.5">
                      <DiscordEmoji
                        name={tab.emojiName}
                        id={tab.emojiId}
                        animated={tab.animated}
                        size={16}
                      />
                      <span className="text-xs font-semibold text-white">{tab.label}</span>
                    </div>
                    <span className="text-[10px] font-mono text-indigo-300">Open</span>
                  </button>
                ))}
            </div>

            <div className="pt-2 border-t border-white/[0.08] flex flex-wrap items-center justify-between gap-2">
              <span className="text-[11px] font-mono text-[#9499B3]">
                Sideways: Prefix (<code>.cmd</code>) · No-Prefix (<code>cmd</code>) · Slash (<code>/cmd</code>)
              </span>
              {quickJumpQuery.trim() && (
                <button
                  onClick={() => {
                    setSandboxInput(quickJumpQuery.trim());
                    setActiveTab('sandbox');
                    handleRunSandboxCommand(quickJumpQuery.trim());
                    setShowQuickJumpModal(false);
                    setQuickJumpQuery('');
                  }}
                  className="px-3.5 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-xs font-bold text-white cursor-pointer"
                >
                  Run &ldquo;{quickJumpQuery.trim()}&rdquo; in Sandbox
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* =====================================================================
          FLOATING MODAL 2: 24-HOUR AUDIO & SECURITY RECAP
         ===================================================================== */}
      {showRecapModal && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
          <div
            role="dialog"
            aria-label="24-Hour Server Recap"
            className="bg-[#0E1017] border border-white/15 rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-5 animate-zenith-modal"
          >
            <div className="flex items-center justify-between border-b border-white/[0.08] pb-3">
              <div className="flex items-center gap-2">
                <DiscordEmoji name="02music" id="1555133215508009061" animated={true} size={20} />
                <h3 className="font-display font-bold text-lg text-white">
                  24-Hour Audio & Vault Recap — {activeGuild?.name}
                </h3>
              </div>
              <button
                onClick={() => setShowRecapModal(false)}
                className="px-2.5 py-1 rounded-lg hover:bg-white/10 text-xs text-[#9499B3] hover:text-white flex items-center gap-1 cursor-pointer"
                aria-label="Close 24-Hour Recap Modal"
              >
                <DiscordEmoji name="white_cancel" id="1555133596652539988" size={14} />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="p-3.5 rounded-xl bg-[#07080C] border border-white/[0.07]">
                <div className="text-[10px] font-mono text-[#9499B3]">SONGS STREAMED (24H)</div>
                <div className="font-display font-extrabold text-2xl text-white tabular-nums mt-1">
                  {musicState?.recap24h?.songsPlayed ?? 42}
                </div>
              </div>
              <div className="p-3.5 rounded-xl bg-[#07080C] border border-white/[0.07]">
                <div className="text-[10px] font-mono text-[#9499B3]">LISTENING TIME</div>
                <div className="font-display font-extrabold text-2xl text-cyan-300 tabular-nums mt-1">
                  {musicState?.recap24h?.minutesListened ?? 168} mins
                </div>
              </div>
              <div className="p-3.5 rounded-xl bg-[#07080C] border border-white/[0.07]">
                <div className="text-[10px] font-mono text-[#9499B3]">ACTIVE DSP FILTER</div>
                <div className="font-mono font-bold text-sm text-indigo-300 mt-1">
                  {musicState?.activeFilter || 'None (Studio Lossless)'}
                </div>
              </div>
              <div className="p-3.5 rounded-xl bg-[#07080C] border border-white/[0.07]">
                <div className="text-[10px] font-mono text-[#9499B3]">ANTI-NUKE VAULT</div>
                <div className="font-mono font-bold text-sm text-emerald-400 mt-1">
                  {antiNuke?.enabled ? '16/16 Modules Armed' : 'Standby'}
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => {
                  setActiveTab('music');
                  setShowRecapModal(false);
                }}
                className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-xs font-bold text-white cursor-pointer"
              >
                Go to Music Deck
              </button>
              <button
                onClick={() => setShowRecapModal(false)}
                className="px-4 py-2 rounded-xl bg-white/[0.06] hover:bg-white/[0.12] text-xs font-semibold text-white cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
