import React from 'react';
import { DiscordEmoji } from './DiscordEmoji';

interface DashboardOverviewProps {
  statusData: any;
  onNavigate: (tab: 'sandbox' | 'commands' | 'music' | 'security' | 'deploy') => void;
  onRunBugChecks: () => void;
}

export const DashboardOverview: React.FC<DashboardOverviewProps> = ({
  statusData,
  onNavigate,
  onRunBugChecks,
}) => {
  return (
    <div className="space-y-6 max-w-7xl mx-auto px-4 sm:px-6 py-6 text-slate-100">
      {/* Hero Welcome Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 rounded-2xl p-6 sm:p-8 border border-indigo-900/50 shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 p-8 opacity-10 pointer-events-none">
          <DiscordEmoji emojiKey="WORLD" className="w-64 h-64" />
        </div>

        <div className="relative z-10 max-w-3xl space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 rounded-full text-xs font-mono">
            <DiscordEmoji emojiKey="WHITE_DONE" className="w-4 h-4" />
            <span>Heaven Cloud Network Online</span>
            <span className="text-slate-500">•</span>
            <span>Shard #0 Active</span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight flex items-center gap-3">
            <span>Aetheris Bot Management Studio</span>
            <DiscordEmoji emojiKey="WHITE_BOT" className="w-8 h-8" />
          </h1>

          <p className="text-sm text-slate-300 leading-relaxed">
            Manage your custom Discord bot persona with real-time Gemini AI chat capabilities,
            music streaming across major platforms, high-speed Auto-Mod anti-nuke shielding, and one-click
            Heaven Cloud deployment.
          </p>

          <div className="pt-2 flex flex-wrap gap-3">
            <button
              onClick={() => onNavigate('sandbox')}
              className="inline-flex items-center gap-2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-semibold shadow-md transition-colors"
            >
              <DiscordEmoji emojiKey="WHITE_MESSAGE" className="w-4 h-4" />
              <span>Launch Live Discord Sandbox</span>
            </button>

            <button
              onClick={onRunBugChecks}
              className="inline-flex items-center gap-2 px-4 py-2.5 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 rounded-lg text-xs font-semibold transition-colors"
            >
              <DiscordEmoji emojiKey="BUGHUNTER_1" className="w-4 h-4" />
              <span>Run Automated Bug Checks</span>
            </button>
          </div>
        </div>
      </div>

      {/* Primary Telemetry Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-[#2b2d31] p-5 rounded-xl border border-[#383a40] space-y-2">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>Bot Latency</span>
            <DiscordEmoji emojiKey="PING" className="w-4 h-4" />
          </div>
          <div className="text-2xl font-bold font-mono text-emerald-400 flex items-baseline gap-2">
            <span>{statusData?.ping || 22} ms</span>
            <span className="text-xs font-normal text-slate-400">WebSocket</span>
          </div>
          <p className="text-xs text-slate-400 flex items-center gap-1">
            <DiscordEmoji emojiKey="WHITE_DONE" className="w-3.5 h-3.5" />
            <span>Optimal response speed</span>
          </p>
        </div>

        <div className="bg-[#2b2d31] p-5 rounded-xl border border-[#383a40] space-y-2">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>Connected Guilds</span>
            <DiscordEmoji emojiKey="PEOPLE" className="w-4 h-4" />
          </div>
          <div className="text-2xl font-bold font-mono text-indigo-300 flex items-baseline gap-2">
            <span>{statusData?.guildsCount?.toLocaleString() || '1,420'}</span>
            <span className="text-xs font-normal text-slate-400">Servers</span>
          </div>
          <p className="text-xs text-slate-400 flex items-center gap-1">
            <DiscordEmoji emojiKey="WHITE_HOMIES" className="w-3.5 h-3.5" />
            <span>Serving 842k members</span>
          </p>
        </div>

        <div className="bg-[#2b2d31] p-5 rounded-xl border border-[#383a40] space-y-2">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>Registered Commands</span>
            <DiscordEmoji emojiKey="COMMANDS" className="w-4 h-4" />
          </div>
          <div className="text-2xl font-bold font-mono text-amber-300 flex items-baseline gap-2">
            <span>{statusData?.commandsCount || 7}</span>
            <span className="text-xs font-normal text-slate-400">Slash & Prefix</span>
          </div>
          <p className="text-xs text-slate-400 flex items-center gap-1">
            <DiscordEmoji emojiKey="TOOL" className="w-3.5 h-3.5" />
            <span>Fully synced to Gateway</span>
          </p>
        </div>

        <div className="bg-[#2b2d31] p-5 rounded-xl border border-[#383a40] space-y-2">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>Custom Emojis</span>
            <DiscordEmoji emojiKey="WHITE_AWARD" className="w-4 h-4" />
          </div>
          <div className="text-2xl font-bold font-mono text-pink-300 flex items-baseline gap-2">
            <span>{statusData?.emojisCount || 92}</span>
            <span className="text-xs font-normal text-slate-400">Registered</span>
          </div>
          <p className="text-xs text-slate-400 flex items-center gap-1">
            <DiscordEmoji emojiKey="WHITE_VIP" className="w-3.5 h-3.5" />
            <span>Custom Discord tags ready</span>
          </p>
        </div>
      </div>

      {/* Feature Navigation Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {/* Card 1: Live Discord Sandbox */}
        <div className="bg-[#2b2d31] border border-[#383a40] rounded-xl p-6 flex flex-col justify-between space-y-4 hover:border-indigo-500/50 transition-all">
          <div className="space-y-3">
            <div className="w-10 h-10 rounded-lg bg-indigo-950 border border-indigo-800 flex items-center justify-center">
              <DiscordEmoji emojiKey="WHITE_MESSAGE" className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <span>Interactive Discord Sandbox</span>
            </h3>
            <p className="text-xs text-slate-300 leading-relaxed">
              Test slash commands, music queues, and real-time Gemini AI bot responses in a pixel-perfect Discord channel simulator.
            </p>
          </div>
          <button
            onClick={() => onNavigate('sandbox')}
            className="w-full py-2 px-3 bg-indigo-600/80 hover:bg-indigo-600 text-white rounded-lg text-xs font-semibold transition-colors flex items-center justify-center gap-2"
          >
            <span>Open Chat Sandbox</span>
            <DiscordEmoji emojiKey="WHITE_FIRST" className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Card 2: Music Engine */}
        <div className="bg-[#2b2d31] border border-[#383a40] rounded-xl p-6 flex flex-col justify-between space-y-4 hover:border-emerald-500/50 transition-all">
          <div className="space-y-3">
            <div className="w-10 h-10 rounded-lg bg-emerald-950 border border-emerald-800 flex items-center justify-center">
              <DiscordEmoji emojiKey="MUSIC_02" className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <span>Music Engine & Streaming</span>
            </h3>
            <p className="text-xs text-slate-300 leading-relaxed">
              High-fidelity audio playback streaming supporting Spotify, YouTube Music, Apple Music, JioSaavn, and Amazon Music.
            </p>
          </div>
          <button
            onClick={() => onNavigate('music')}
            className="w-full py-2 px-3 bg-emerald-600/80 hover:bg-emerald-600 text-white rounded-lg text-xs font-semibold transition-colors flex items-center justify-center gap-2"
          >
            <span>Configure Music Player</span>
            <DiscordEmoji emojiKey="SPOTIFY" className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Card 3: Auto-Mod & Anti-Nuke */}
        <div className="bg-[#2b2d31] border border-[#383a40] rounded-xl p-6 flex flex-col justify-between space-y-4 hover:border-red-500/50 transition-all">
          <div className="space-y-3">
            <div className="w-10 h-10 rounded-lg bg-red-950 border border-red-800 flex items-center justify-center">
              <DiscordEmoji emojiKey="WHITE_AUTOMOD" className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <span>Auto-Mod & Anti-Nuke Vault</span>
            </h3>
            <p className="text-xs text-slate-300 leading-relaxed">
              Protect your guild with toxic word filters, anti-invite link shielding, mass mention limits, and automated moderation logs.
            </p>
          </div>
          <button
            onClick={() => onNavigate('security')}
            className="w-full py-2 px-3 bg-red-600/80 hover:bg-red-600 text-white rounded-lg text-xs font-semibold transition-colors flex items-center justify-center gap-2"
          >
            <span>Manage Security Rules</span>
            <DiscordEmoji emojiKey="WHITE_ANTINUKE" className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};
