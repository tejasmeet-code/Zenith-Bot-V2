import React, { useState } from 'react';
import { DiscordEmoji } from './DiscordEmoji';
import { BotConfig } from '../utils/botConfig';

interface BotConfigModalProps {
  config: BotConfig;
  isOpen: boolean;
  onClose: () => void;
  onSave: (newConfig: BotConfig) => void;
}

export const BotConfigModal: React.FC<BotConfigModalProps> = ({
  config,
  isOpen,
  onClose,
  onSave,
}) => {
  const [botName, setBotName] = useState(config.botName);
  const [botPrefix, setBotPrefix] = useState(config.botPrefix);
  const [ownersInput, setOwnersInput] = useState(config.owners.join(', '));
  const [developer, setDeveloper] = useState(config.developer);
  const [clientId, setClientId] = useState(config.clientId || '1553292201835102278');
  const [ownerId, setOwnerId] = useState(config.ownerId || '1181221352393420856');
  const [botToken, setBotToken] = useState(config.botToken || '');
  const [supportServer, setSupportServer] = useState(config.supportServer || '');
  const [embedThumbnail, setEmbedThumbnail] = useState(config.embedThumbnail);
  const [embedBanner, setEmbedBanner] = useState(config.embedBanner);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const updated: BotConfig = {
      ...config,
      botName: botName.trim() || 'Zenith Bot',
      botPrefix: botPrefix.trim() || '.',
      owners: ownersInput.split(',').map((o) => o.trim()).filter(Boolean),
      developer: developer.trim() || 'demonxtejas',
      clientId: clientId.trim(),
      ownerId: ownerId.trim(),
      botToken: botToken.trim(),
      supportServer: supportServer.trim(),
      embedThumbnail: embedThumbnail.trim() || config.embedThumbnail,
      embedBanner: embedBanner.trim() || config.embedBanner,
    };

    onSave(updated);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-[#2b2d31] border border-[#383a40] rounded-2xl max-w-2xl w-full p-6 space-y-5 shadow-2xl text-slate-100 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[#383a40] pb-4">
          <div className="flex items-center gap-2">
            <DiscordEmoji emojiKey="WHITE_SETTINGS" className="w-6 h-6" />
            <h3 className="text-lg font-bold text-white">Discord Bot Credentials & Identity Settings</h3>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white font-bold text-lg">
            ×
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-300">Bot Name</label>
              <input
                type="text"
                value={botName}
                onChange={(e) => setBotName(e.target.value)}
                placeholder="e.g. Zenith Bot"
                className="w-full bg-[#1e1f22] border border-[#383a40] rounded-lg p-2.5 text-xs text-white focus:outline-none focus:border-indigo-500 font-mono"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-300">Default Bot Prefix</label>
              <input
                type="text"
                value={botPrefix}
                onChange={(e) => setBotPrefix(e.target.value)}
                placeholder="."
                className="w-full bg-[#1e1f22] border border-[#383a40] rounded-lg p-2.5 text-xs text-white focus:outline-none focus:border-indigo-500 font-mono font-bold"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-300">Discord Client ID</label>
              <input
                type="text"
                value={clientId}
                onChange={(e) => setClientId(e.target.value)}
                placeholder="1553292201835102278"
                className="w-full bg-[#1e1f22] border border-[#383a40] rounded-lg p-2.5 text-xs text-white focus:outline-none focus:border-indigo-500 font-mono"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-300">Owner User ID</label>
              <input
                type="text"
                value={ownerId}
                onChange={(e) => setOwnerId(e.target.value)}
                placeholder="1181221352393420856"
                className="w-full bg-[#1e1f22] border border-[#383a40] rounded-lg p-2.5 text-xs text-white focus:outline-none focus:border-indigo-500 font-mono"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-300">Discord Bot Token</label>
            <input
              type="password"
              value={botToken}
              onChange={(e) => setBotToken(e.target.value)}
              placeholder="MTU1MzI5..."
              className="w-full bg-[#1e1f22] border border-[#383a40] rounded-lg p-2.5 text-xs text-amber-300 focus:outline-none focus:border-indigo-500 font-mono"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-300">Bot Developer Name</label>
              <input
                type="text"
                value={developer}
                onChange={(e) => setDeveloper(e.target.value)}
                placeholder="Tejas / AI Studio"
                className="w-full bg-[#1e1f22] border border-[#383a40] rounded-lg p-2.5 text-xs text-white focus:outline-none focus:border-indigo-500 font-mono"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-300">Support Server Invite Link (Optional)</label>
              <input
                type="text"
                value={supportServer}
                onChange={(e) => setSupportServer(e.target.value)}
                placeholder="https://discord.gg/..."
                className="w-full bg-[#1e1f22] border border-[#383a40] rounded-lg p-2.5 text-xs text-white focus:outline-none focus:border-indigo-500 font-mono"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-300">Embed Thumbnail Image URL</label>
            <input
              type="text"
              value={embedThumbnail}
              onChange={(e) => setEmbedThumbnail(e.target.value)}
              className="w-full bg-[#1e1f22] border border-[#383a40] rounded-lg p-2.5 text-xs text-slate-300 focus:outline-none focus:border-indigo-500 font-mono"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-300">Embed Banner Image URL</label>
            <input
              type="text"
              value={embedBanner}
              onChange={(e) => setEmbedBanner(e.target.value)}
              className="w-full bg-[#1e1f22] border border-[#383a40] rounded-lg p-2.5 text-xs text-slate-300 focus:outline-none focus:border-indigo-500 font-mono"
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-[#383a40]">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-xs font-semibold transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-bold transition-colors shadow-md flex items-center gap-2"
            >
              <DiscordEmoji emojiKey="WHITE_DONE" className="w-4 h-4" />
              <span>Save & Sync to Firestore</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
