import React from 'react';
import { DiscordEmoji } from './DiscordEmoji';
import { BotConfig } from '../utils/botConfig';

interface NavbarProps {
  botConfig: BotConfig;
  activeTab: 'sandbox' | 'music' | 'security' | 'deploy';
  setActiveTab: (tab: 'sandbox' | 'music' | 'security' | 'deploy') => void;
  onOpenConfigModal: () => void;
  onDeployClick: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  botConfig,
  activeTab,
  setActiveTab,
  onOpenConfigModal,
  onDeployClick,
}) => {
  return (
    <header className="flex items-center justify-between gap-8 px-6 py-3.5 bg-[#1e1f22] border-b border-[#2b2d31] text-slate-100 sticky top-0 z-50">
      {/* Zone 1: Single text wordmark Brand Zone */}
      <a
        href="#"
        onClick={(e) => {
          e.preventDefault();
          setActiveTab('sandbox');
        }}
        className="flex items-center gap-2 text-base font-bold tracking-tight text-white whitespace-nowrap shrink-0 hover:text-indigo-400 transition-colors"
      >
        <DiscordEmoji emojiKey="WHITE_BOT" className="w-6 h-6 object-contain" />
        <span>{botConfig.botName || 'Zenith'} Bot</span>
      </a>

      {/* Zone 2: Nav links */}
      <nav className="hidden md:flex items-center gap-6 text-xs font-medium text-slate-300">
        <button
          onClick={() => setActiveTab('sandbox')}
          className={`flex items-center gap-1.5 py-1 transition-colors whitespace-nowrap shrink-0 ${
            activeTab === 'sandbox' ? 'text-indigo-400 font-semibold border-b-2 border-indigo-500' : 'hover:text-white'
          }`}
        >
          <DiscordEmoji emojiKey="WHITE_MESSAGE" className="w-4 h-4" />
          <span>Interactive Bot Chat & Help</span>
        </button>

        <button
          onClick={() => setActiveTab('music')}
          className={`flex items-center gap-1.5 py-1 transition-colors whitespace-nowrap shrink-0 ${
            activeTab === 'music' ? 'text-indigo-400 font-semibold border-b-2 border-indigo-500' : 'hover:text-white'
          }`}
        >
          <DiscordEmoji emojiKey="MUSIC_02" className="w-4 h-4" />
          <span>Music Player</span>
        </button>

        <button
          onClick={() => setActiveTab('security')}
          className={`flex items-center gap-1.5 py-1 transition-colors whitespace-nowrap shrink-0 ${
            activeTab === 'security' ? 'text-indigo-400 font-semibold border-b-2 border-indigo-500' : 'hover:text-white'
          }`}
        >
          <DiscordEmoji emojiKey="WHITE_AUTOMOD" className="w-4 h-4" />
          <span>Auto-Mod & Security</span>
        </button>

        <button
          onClick={() => setActiveTab('deploy')}
          className={`flex items-center gap-1.5 py-1 transition-colors whitespace-nowrap shrink-0 ${
            activeTab === 'deploy' ? 'text-indigo-400 font-semibold border-b-2 border-indigo-500' : 'hover:text-white'
          }`}
        >
          <DiscordEmoji emojiKey="WORLD" className="w-4 h-4" />
          <span>Heaven Cloud</span>
        </button>
      </nav>

      {/* Zone 3: 1 primary action */}
      <div className="flex items-center gap-3 shrink-0">
        <button
          onClick={onOpenConfigModal}
          className="p-2 bg-[#2b2d31] hover:bg-[#383a40] text-slate-300 hover:text-white rounded-lg border border-[#383a40] transition-colors"
          title="Edit Bot Owners & Prefix Config"
        >
          <DiscordEmoji emojiKey="WHITE_SETTINGS" className="w-4 h-4" />
        </button>

        <button
          onClick={onDeployClick}
          className="inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold text-white bg-indigo-600 rounded-lg hover:bg-indigo-500 active:bg-indigo-700 transition-colors whitespace-nowrap shrink-0 shadow-md shadow-indigo-900/30"
        >
          <DiscordEmoji emojiKey="WORLD" className="w-4 h-4" />
          <span>Deploy to Heaven Cloud</span>
        </button>
      </div>
    </header>
  );
};
