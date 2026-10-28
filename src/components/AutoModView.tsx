import React, { useState } from 'react';
import { DiscordEmoji } from './DiscordEmoji';
import { AutoModRule, ANTINUKE_MINI_MODULES } from '../utils/botLogic';

interface AutoModViewProps {
  rules: AutoModRule[];
  onToggleRule: (ruleId: string) => void;
}

export const AutoModView: React.FC<AutoModViewProps> = ({ rules, onToggleRule }) => {
  const [newKeyword, setNewKeyword] = useState('');
  const [badWords, setBadWords] = useState<string[]>([
    'scam',
    'phishing',
    'free nitro',
    'cheat',
    'hack',
    'exploit',
  ]);

  const [antiNukeEnabled, setAntiNukeEnabled] = useState(true);
  const [miniModulesState, setMiniModulesState] = useState<Record<string, boolean>>(
    ANTINUKE_MINI_MODULES.reduce((acc, m) => ({ ...acc, [m.id]: true }), {})
  );

  // Whitelist State
  const [whitelistedUsers, setWhitelistedUsers] = useState<string[]>(['1181221352393420856', 'GuildOwner_Tejas']);
  const [whitelistedRoles, setWhitelistedRoles] = useState<string[]>(['@AntiNuke Wall Guard', '@Vault Shield Defender']);
  const [whitelistedChannels, setWhitelistedChannels] = useState<string[]>(['#antinuke-logs', '#vault-audit', '#emergency-vault']);

  // Human Trust Categories
  const [owners, setOwners] = useState<string[]>(['1181221352393420856']);
  const [admins, setAdmins] = useState<string[]>(['1181221352393420856', 'Admin_Tejas']);
  const [staff, setStaff] = useState<string[]>(['Staff_Mod1', 'Staff_Mod2']);
  const [trustedMembers, setTrustedMembers] = useState<string[]>(['Trusted_Homie']);

  // Bot Trust Categories
  const [adminBots, setAdminBots] = useState<string[]>(['Zenith#0001 (1553292201835102278)']);
  const [ticketsBots, setTicketsBots] = useState<string[]>(['ZenithTickets#0001']);
  const [levelingBots, setLevelingBots] = useState<string[]>(['ZenithXP#0001']);

  // Betrayal Guard Logs
  const [betrayalLogs, setBetrayalLogs] = useState([
    {
      id: 'bg_1',
      inviter: 'RogueAdmin_Whitelisted',
      bot: 'MaliciousNukeBot#9999',
      time: 'Today at 08:30 AM',
      action: 'Banned Inviter & Bot, revoked whitelist, restored 12 channels',
      severity: 'CRITICAL BETRAYAL',
    },
  ]);

  const [inputTarget, setInputTarget] = useState('');
  const [targetCategory, setTargetCategory] = useState<'whitelistedUsers' | 'whitelistedRoles' | 'whitelistedChannels' | 'admins' | 'staff' | 'trustedMembers' | 'adminBots' | 'ticketsBots' | 'levelingBots'>('whitelistedUsers');

  const handleAddTrustEntry = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputTarget.trim()) return;
    const val = inputTarget.trim();

    if (targetCategory === 'whitelistedUsers' && !whitelistedUsers.includes(val)) setWhitelistedUsers([...whitelistedUsers, val]);
    else if (targetCategory === 'whitelistedRoles' && !whitelistedRoles.includes(val)) setWhitelistedRoles([...whitelistedRoles, val]);
    else if (targetCategory === 'whitelistedChannels' && !whitelistedChannels.includes(val)) setWhitelistedChannels([...whitelistedChannels, val]);
    else if (targetCategory === 'admins' && !admins.includes(val)) setAdmins([...admins, val]);
    else if (targetCategory === 'staff' && !staff.includes(val)) setStaff([...staff, val]);
    else if (targetCategory === 'trustedMembers' && !trustedMembers.includes(val)) setTrustedMembers([...trustedMembers, val]);
    else if (targetCategory === 'adminBots' && !adminBots.includes(val)) setAdminBots([...adminBots, val]);
    else if (targetCategory === 'ticketsBots' && !ticketsBots.includes(val)) setTicketsBots([...ticketsBots, val]);
    else if (targetCategory === 'levelingBots' && !levelingBots.includes(val)) setLevelingBots([...levelingBots, val]);

    setInputTarget('');
  };

  const [modLogs] = useState([
    {
      id: 'log_1',
      action: 'MUTE',
      target: '@spammer_bot',
      reason: 'Triggered Mass Mention Cap (>5 mentions)',
      time: '10:14 AM',
      emoji: 'WHITE_MUTE',
    },
    {
      id: 'log_2',
      action: 'BAN',
      target: '@nitro_scammer',
      reason: 'Triggered Profanity & Toxic Filter (keyword: free nitro)',
      time: '09:42 AM',
      emoji: 'WHITE_BAN',
    },
    {
      id: 'log_3',
      action: 'BETRAYAL GUARD BAN',
      target: '@whitelisted_rogue',
      reason: 'Added unverified bot that attempted mass channel deletion. Inviter and Bot Banned.',
      time: '08:30 AM',
      emoji: 'WHITE_TERMINATE',
    },
    {
      id: 'log_4',
      action: 'FAKE ROLE DELETE',
      target: 'Role: Member.',
      reason: 'Detected hidden Administrator permission on decoy role. Role purged.',
      time: '07:30 AM',
      emoji: 'WHITE_DELETE',
    },
  ]);

  const toggleMiniModule = (id: string) => {
    setMiniModulesState((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const enableAllMiniModules = () => {
    setMiniModulesState(
      ANTINUKE_MINI_MODULES.reduce((acc, m) => ({ ...acc, [m.id]: true }), {})
    );
  };

  const disableAllMiniModules = () => {
    setMiniModulesState(
      ANTINUKE_MINI_MODULES.reduce((acc, m) => ({ ...acc, [m.id]: false }), {})
    );
  };

  const handleSimulateBetrayal = () => {
    const newLog = {
      id: `bg_${Date.now()}`,
      inviter: 'RogueAdmin_Whitelisted',
      bot: 'RogueDestructorBot#6666',
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      action: 'Betrayal Guard: Whitelisted member & bot BANNED. Whitelist revoked, 8 channels restored.',
      severity: 'CRITICAL BETRAYAL NEUTRALIZED',
    };
    setBetrayalLogs((prev) => [newLog, ...prev]);
  };

  const handleAddKeyword = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newKeyword.trim()) return;
    setBadWords((prev) => [...prev, newKeyword.trim().toLowerCase()]);
    setNewKeyword('');
  };

  const handleRemoveKeyword = (word: string) => {
    setBadWords((prev) => prev.filter((w) => w !== word));
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 text-slate-100 space-y-6">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-[#2b2d31] p-6 rounded-2xl border border-[#383a40]">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-red-500/20 text-red-300 border border-red-500/30 rounded-full text-xs font-mono">
            <DiscordEmoji emojiKey="WHITE_ANTINUKE" className="w-3.5 h-3.5" />
            <span>Anti-Nuke Shielding Active</span>
            <span className="text-slate-500">•</span>
            <span>Vault Level 10 + Betrayal Guard</span>
          </div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <DiscordEmoji emojiKey="WHITE_AUTOMOD" className="w-6 h-6" />
            <span>Anti-Nuke Vault & Betrayal Shield Control</span>
          </h2>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setAntiNukeEnabled(!antiNukeEnabled)}
            className={`px-4 py-2 rounded-xl text-xs font-extrabold flex items-center gap-2 transition-colors ${
              antiNukeEnabled
                ? 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-lg shadow-emerald-950/50'
                : 'bg-red-600 hover:bg-red-500 text-white shadow-lg shadow-red-950/50'
            }`}
          >
            <DiscordEmoji emojiKey={antiNukeEnabled ? 'BUTTON_ON' : 'BUTTON_OFF'} className="w-4 h-4" />
            <span>Anti-Nuke Vault: {antiNukeEnabled ? 'ENABLED' : 'DISABLED'}</span>
          </button>
        </div>
      </div>

      {/* Whitelist & Trust Management Panel */}
      <div className="bg-[#2b2d31] border border-[#383a40] rounded-2xl p-6 space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#383a40] pb-4">
          <div>
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <DiscordEmoji emojiKey="WHITE_CLAIM" className="w-5 h-5" />
              <span>Anti-Nuke Whitelist & Trust Categories</span>
            </h3>
            <p className="text-xs text-slate-300">
              Manage exempt Users, Roles, Channels, Human Trust Levels (.serverowner, .serveradmin, .serverstaff, .trusted) and Authorized Bots (.adminbot, .ticketsbot, .levelingbot).
            </p>
          </div>
        </div>

        {/* Quick Add Form */}
        <form onSubmit={handleAddTrustEntry} className="flex flex-col sm:flex-row gap-2 bg-[#1e1f22] p-3 rounded-xl border border-[#383a40]">
          <select
            value={targetCategory}
            onChange={(e: any) => setTargetCategory(e.target.value)}
            className="bg-[#2b2d31] border border-[#383a40] rounded-lg text-xs font-mono text-indigo-300 p-2 focus:outline-none"
          >
            <option value="whitelistedUsers">Whitelisted User</option>
            <option value="whitelistedRoles">Whitelisted Role</option>
            <option value="whitelistedChannels">Whitelisted Channel</option>
            <option value="admins">Human Admin (.serveradmin)</option>
            <option value="staff">Human Staff (.serverstaff)</option>
            <option value="trustedMembers">Trusted Member (.trusted)</option>
            <option value="adminBots">Admin Bot (.adminbot)</option>
            <option value="ticketsBots">Tickets Bot (.ticketsbot)</option>
            <option value="levelingBots">Leveling Bot (.levelingbot)</option>
          </select>

          <input
            type="text"
            value={inputTarget}
            onChange={(e) => setInputTarget(e.target.value)}
            placeholder="User ID, Role @Name, or Bot Tag..."
            className="flex-1 bg-[#2b2d31] border border-[#383a40] rounded-lg p-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 font-mono"
          />

          <button type="submit" className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-bold transition-colors shrink-0">
            + Add to Category
          </button>
        </form>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs font-mono">
          {/* Whitelisted Entities */}
          <div className="bg-[#1e1f22] p-4 rounded-xl border border-[#383a40] space-y-2">
            <span className="text-indigo-400 font-bold block text-[11px] uppercase flex items-center gap-1.5">
              <DiscordEmoji emojiKey="WHITE_CLAIM" className="w-4 h-4" />
              <span>Whitelisted Vault Entities</span>
            </span>
            <div className="space-y-1 text-slate-300 text-[11px]">
              <div><strong>Users</strong>: {whitelistedUsers.map((u) => `@${u}`).join(', ')}</div>
              <div><strong>Roles</strong>: {whitelistedRoles.join(', ')}</div>
              <div><strong>Channels</strong>: {whitelistedChannels.join(', ')}</div>
            </div>
          </div>

          {/* Trusted Humans */}
          <div className="bg-[#1e1f22] p-4 rounded-xl border border-[#383a40] space-y-2">
            <span className="text-emerald-400 font-bold block text-[11px] uppercase flex items-center gap-1.5">
              <DiscordEmoji emojiKey="WHITE_HOMIES" className="w-4 h-4" />
              <span>Trusted Humans (.serverowner, .admin, .staff, .trusted)</span>
            </span>
            <div className="space-y-1 text-slate-300 text-[11px]">
              <div><strong>Owner</strong>: {owners.map((o) => `@${o}`).join(', ')}</div>
              <div><strong>Admins</strong>: {admins.map((a) => `@${a}`).join(', ')}</div>
              <div><strong>Staff</strong>: {staff.map((s) => `@${s}`).join(', ')}</div>
              <div><strong>Trusted</strong>: {trustedMembers.map((t) => `@${t}`).join(', ')}</div>
            </div>
          </div>

          {/* Authorized Bots */}
          <div className="bg-[#1e1f22] p-4 rounded-xl border border-[#383a40] space-y-2">
            <span className="text-amber-300 font-bold block text-[11px] uppercase flex items-center gap-1.5">
              <DiscordEmoji emojiKey="WHITE_BOT" className="w-4 h-4" />
              <span>Authorized Bots (.adminbot, .ticketsbot, .levelingbot)</span>
            </span>
            <div className="space-y-1 text-slate-300 text-[11px]">
              <div><strong>Admin Bots</strong>: {adminBots.join(', ')}</div>
              <div><strong>Tickets Bots</strong>: {ticketsBots.join(', ')}</div>
              <div><strong>Leveling Bots</strong>: {levelingBots.join(', ')}</div>
            </div>
          </div>
        </div>
      </div>

      {/* Betrayal Guard & Rogue Bot Infiltration Defense */}
      <div className="bg-[#2b2d31] border border-[#383a40] rounded-2xl p-6 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#383a40] pb-4">
          <div>
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <DiscordEmoji emojiKey="WHITE_TERMINATE" className="w-5 h-5" />
              <span>Betrayal Guard & Malicious Bot Shield</span>
            </h3>
            <p className="text-xs text-slate-300">
              If a whitelisted admin invites an unverified bot that attempts nuke actions, Betrayal Guard revokes inviter whitelist, bans BOTH inviter and bot, and restores server state.
            </p>
          </div>

          <button
            onClick={handleSimulateBetrayal}
            className="px-3.5 py-2 bg-red-950 hover:bg-red-900 border border-red-800 text-red-200 text-xs font-bold rounded-xl flex items-center gap-1.5 transition-colors shrink-0"
          >
            <DiscordEmoji emojiKey="WHITE_TERMINATE" className="w-4 h-4" />
            <span>Simulate Rogue Betrayal Test</span>
          </button>
        </div>

        <div className="space-y-2">
          {betrayalLogs.map((log) => (
            <div key={log.id} className="p-3.5 bg-[#1e1f22] border border-[#383a40] rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
              <div className="space-y-0.5">
                <div className="font-bold text-red-400 flex items-center gap-2">
                  <DiscordEmoji emojiKey="WHITE_TERMINATE" className="w-4 h-4" />
                  <span>{log.severity}</span>
                  <span className="text-slate-500 font-normal">[{log.time}]</span>
                </div>
                <div className="text-slate-300">
                  Inviter: <code className="text-amber-300">{log.inviter}</code> | Bot: <code className="text-red-300">{log.bot}</code>
                </div>
                <div className="text-slate-400 text-[11px]">{log.action}</div>
              </div>
              <span className="px-2.5 py-1 bg-emerald-950 text-emerald-300 border border-emerald-800 rounded text-[10px] font-bold shrink-0 self-start sm:self-auto">
                NEUTRALIZED & RESTORED
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Anti-Nuke Mini Modules Matrix */}
      <div className="bg-[#2b2d31] border border-[#383a40] rounded-2xl p-6 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#383a40] pb-4">
          <div>
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <DiscordEmoji emojiKey="WHITE_SETTINGS" className="w-5 h-5" />
              <span>Anti-Nuke Mini Modules Matrix ({ANTINUKE_MINI_MODULES.length})</span>
            </h3>
            <p className="text-xs text-slate-300">
              Configure individual anti-nuke triggers with live ON/OFF status buttons.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={enableAllMiniModules}
              className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-lg transition-colors flex items-center gap-1.5"
            >
              <DiscordEmoji emojiKey="BUTTON_ON" className="w-3.5 h-3.5" />
              <span>Enable All</span>
            </button>
            <button
              onClick={disableAllMiniModules}
              className="px-3 py-1.5 bg-red-600 hover:bg-red-500 text-white font-bold text-xs rounded-lg transition-colors flex items-center gap-1.5"
            >
              <DiscordEmoji emojiKey="BUTTON_OFF" className="w-3.5 h-3.5" />
              <span>Disable All</span>
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {ANTINUKE_MINI_MODULES.map((m) => {
            const isOn = miniModulesState[m.id] !== false;
            return (
              <div
                key={m.id}
                className="p-3.5 bg-[#1e1f22] border border-[#383a40] rounded-xl flex items-center justify-between gap-3"
              >
                <div className="space-y-0.5 min-w-0">
                  <div className="font-bold text-xs text-white flex items-center gap-1.5 truncate">
                    <DiscordEmoji emojiKey={m.emojiKey} className="w-4 h-4 shrink-0" />
                    <span className="truncate">{m.name}</span>
                  </div>
                  <div className="text-[10px] text-slate-400 truncate">{m.description}</div>
                </div>

                <button
                  onClick={() => toggleMiniModule(m.id)}
                  className={`p-1.5 rounded-lg border transition-colors shrink-0 flex items-center gap-1 text-[10px] font-extrabold ${
                    isOn
                      ? 'bg-emerald-950/60 border-emerald-600 text-emerald-300'
                      : 'bg-red-950/60 border-red-600 text-red-300'
                  }`}
                  title={`Click to ${isOn ? 'Disable' : 'Enable'} ${m.name}`}
                >
                  <DiscordEmoji emojiKey={isOn ? 'BUTTON_ON' : 'BUTTON_OFF'} className="w-3.5 h-3.5" />
                  <span>{isOn ? 'ON' : 'OFF'}</span>
                </button>
              </div>
            );
          })}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Rules & Protections */}
        <div className="bg-[#2b2d31] border border-[#383a40] rounded-2xl p-6 space-y-6">
          <h3 className="text-base font-bold text-white flex items-center gap-2">
            <DiscordEmoji emojiKey="MODERATOR" className="w-5 h-5" />
            <span>Active Automated Filters</span>
          </h3>

          <div className="space-y-3">
            {rules.map((rule) => (
              <div
                key={rule.id}
                className="p-4 bg-[#1e1f22] border border-[#383a40] rounded-xl flex items-center justify-between gap-4"
              >
                <div className="space-y-1 min-w-0">
                  <div className="font-bold text-sm text-white flex items-center gap-2">
                    <span>{rule.name}</span>
                    <span className="text-[10px] bg-indigo-950 text-indigo-300 border border-indigo-800 px-1.5 py-0.2 rounded uppercase">
                      {rule.action}
                    </span>
                  </div>
                  <p className="text-xs text-slate-400">
                    Type: <span className="text-slate-200">{rule.type}</span>
                  </p>
                </div>

                <button
                  onClick={() => onToggleRule(rule.id)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors ${
                    rule.enabled
                      ? 'bg-emerald-600 text-white hover:bg-emerald-500'
                      : 'bg-slate-700 text-slate-400 hover:bg-slate-600'
                  }`}
                >
                  {rule.enabled ? 'ENABLED' : 'DISABLED'}
                </button>
              </div>
            ))}
          </div>

          {/* Bad Word Keyword Filter */}
          <div className="space-y-3 pt-4 border-t border-[#383a40]">
            <h4 className="text-xs font-bold text-slate-300">Profanity & Toxic Filter Keywords</h4>

            <form onSubmit={handleAddKeyword} className="flex gap-2">
              <input
                type="text"
                value={newKeyword}
                onChange={(e) => setNewKeyword(e.target.value)}
                placeholder="Add forbidden phrase..."
                className="flex-1 bg-[#1e1f22] border border-[#383a40] rounded-lg p-2 text-xs text-white placeholder-slate-400 focus:outline-none focus:border-red-500"
              />
              <button
                type="submit"
                className="px-3 py-2 bg-red-600 hover:bg-red-500 text-white rounded-lg text-xs font-semibold transition-colors"
              >
                + Add Filter
              </button>
            </form>

            <div className="flex flex-wrap gap-1.5 pt-1">
              {badWords.map((word) => (
                <span
                  key={word}
                  className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-[#1e1f22] text-red-300 border border-red-900/50 rounded-lg text-xs font-mono"
                >
                  <span>{word}</span>
                  <button
                    onClick={() => handleRemoveKeyword(word)}
                    className="text-slate-500 hover:text-red-400 font-bold"
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Live Moderation Audit Logs */}
        <div className="bg-[#2b2d31] border border-[#383a40] rounded-2xl p-6 space-y-4">
          <h3 className="text-base font-bold text-white flex items-center justify-between">
            <span className="flex items-center gap-2">
              <DiscordEmoji emojiKey="LOGGING" className="w-5 h-5" />
              <span>Guild Moderation Audit Feed</span>
            </span>
            <DiscordEmoji emojiKey="WHITE_DONE" className="w-4 h-4" />
          </h3>

          <div className="space-y-3">
            {modLogs.map((log) => (
              <div key={log.id} className="p-3.5 bg-[#1e1f22] border border-[#383a40] rounded-xl space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <DiscordEmoji emojiKey={log.emoji} className="w-4 h-4" />
                    <span className="font-extrabold text-white">{log.action}</span>
                    <span className="text-indigo-400 font-mono">{log.target}</span>
                  </div>
                  <span className="text-[10px] text-slate-400">{log.time}</span>
                </div>
                <p className="text-xs text-slate-300">{log.reason}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
