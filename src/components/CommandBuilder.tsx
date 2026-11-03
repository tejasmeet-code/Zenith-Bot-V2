import React, { useState } from 'react';
import { DiscordEmoji } from './DiscordEmoji';
import { Command } from '../utils/botLogic';
import { DISCORD_EMOJIS } from '../utils/discordEmojis';

interface CommandBuilderProps {
  commands: Command[];
  onSaveCommand: (cmd: Command) => void;
}

export const CommandBuilder: React.FC<CommandBuilderProps> = React.memo(({ commands, onSaveCommand }) => {
  const [selectedCmd, setSelectedCmd] = useState<Command | null>(commands[0] || null);
  const [isEditing, setIsEditing] = useState(false);
  const [codeLang, setCodeLang] = useState<'nodejs' | 'python'>('nodejs');
  const [exportedCode, setExportedCode] = useState<string>('');

  const [formName, setFormName] = useState('');
  const [formDesc, setFormDesc] = useState('');
  const [formTemplate, setFormTemplate] = useState('');
  const [formCategory, setFormCategory] = useState<Command['category']>('general');

  const startCreateNew = () => {
    setSelectedCmd(null);
    setFormName('custom_cmd');
    setFormDesc('Custom server command description');
    setFormTemplate(`${DISCORD_EMOJIS.WHITE_DONE.raw} Executed command response with custom emojis!`);
    setFormCategory('general');
    setIsEditing(true);
  };

  const startEdit = (cmd: Command) => {
    setSelectedCmd(cmd);
    setFormName(cmd.name);
    setFormDesc(cmd.description);
    setFormTemplate(cmd.responseTemplate);
    setFormCategory(cmd.category);
    setIsEditing(true);
  };

  const handleSave = () => {
    const newCmd: Command = {
      id: selectedCmd ? selectedCmd.id : `cmd_${Date.now()}`,
      name: formName.toLowerCase().replace(/[^a-z0-9_]/g, ''),
      description: formDesc,
      category: formCategory,
      prefix: `!${formName}`,
      slash: true,
      responseTemplate: formTemplate,
      enabled: true,
    };

    onSaveCommand(newCmd);
    setSelectedCmd(newCmd);
    setIsEditing(false);
  };

  const fetchExportedCode = async (lang: 'nodejs' | 'python') => {
    setCodeLang(lang);
    try {
      const res = await fetch(`/api/bot/export/code?lang=${lang}`);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      setExportedCode(JSON.stringify(data, null, 2));
    } catch (e) {
      setExportedCode('// Error fetching exported code');
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 text-slate-100 space-y-6">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-[#2b2d31] p-6 rounded-2xl border border-[#383a40]">
        <div className="space-y-1">
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <DiscordEmoji emojiKey="COMMANDS" className="w-6 h-6" />
            <span>Command Studio & Code Exporter</span>
          </h2>
          <p className="text-xs text-slate-300">
            Build custom slash commands with custom Discord emojis, embed layouts, and export full Discord.js v14 or Discord.py code.
          </p>
        </div>

        <button
          onClick={startCreateNew}
          className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-semibold shadow-md transition-colors shrink-0"
        >
          <DiscordEmoji emojiKey="WHITE_DONE" className="w-4 h-4" />
          <span>+ Create Slash Command</span>
        </button>
      </div>

      {/* Main Grid Split */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Commands List Sidebar */}
        <div className="bg-[#2b2d31] border border-[#383a40] rounded-xl p-4 space-y-3 h-[520px] overflow-y-auto">
          <div className="text-xs font-bold uppercase tracking-wider text-slate-400 px-1">
            Registered Slash Commands ({commands.length})
          </div>

          <div className="space-y-1.5">
            {commands.map((cmd) => (
              <button
                key={cmd.id}
                onClick={() => {
                  setSelectedCmd(cmd);
                  setIsEditing(false);
                }}
                className={`w-full text-left p-3 rounded-lg border transition-all flex items-center justify-between ${
                  selectedCmd?.id === cmd.id && !isEditing
                    ? 'bg-indigo-950/80 border-indigo-500 text-white'
                    : 'bg-[#313338] border-[#383a40] text-slate-300 hover:bg-[#383a40]'
                }`}
              >
                <div className="space-y-0.5">
                  <div className="font-bold text-xs flex items-center gap-1.5">
                    <span className="text-indigo-400">/{cmd.name}</span>
                    <span className="text-[10px] bg-[#232428] px-1.5 py-0.2 rounded text-slate-400">
                      {cmd.category}
                    </span>
                  </div>
                  <div className="text-[11px] text-slate-400 truncate max-w-[200px]">
                    {cmd.description}
                  </div>
                </div>

                <DiscordEmoji emojiKey="WHITE_DONE" className="w-3.5 h-3.5" />
              </button>
            ))}
          </div>
        </div>

        {/* Command Detail & Editor View */}
        <div className="lg:col-span-2 bg-[#2b2d31] border border-[#383a40] rounded-xl p-6 space-y-6">
          {isEditing ? (
            <div className="space-y-4">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <DiscordEmoji emojiKey="TOOL" className="w-5 h-5" />
                <span>{selectedCmd ? `Edit Command: /${selectedCmd.name}` : 'New Slash Command'}</span>
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-300">Command Name (Slash Trigger)</label>
                  <input
                    type="text"
                    value={formName}
                    onChange={(e) => setFormName(e.target.value)}
                    placeholder="e.g. announce"
                    className="w-full bg-[#313338] border border-[#383a40] rounded-lg p-2.5 text-xs text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-300">Category</label>
                  <select
                    value={formCategory}
                    onChange={(e: any) => setFormCategory(e.target.value)}
                    className="w-full bg-[#313338] border border-[#383a40] rounded-lg p-2.5 text-xs text-white focus:outline-none focus:border-indigo-500"
                  >
                    <option value="general">General</option>
                    <option value="music">Music</option>
                    <option value="moderation">Moderation</option>
                    <option value="ai">AI</option>
                    <option value="security">Security</option>
                    <option value="tickets">Tickets</option>
                  </select>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-300">Description</label>
                <input
                  type="text"
                  value={formDesc}
                  onChange={(e) => setFormDesc(e.target.value)}
                  placeholder="What does this command do?"
                  className="w-full bg-[#313338] border border-[#383a40] rounded-lg p-2.5 text-xs text-white focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-300">Response Template (Supports Custom Discord Emojis)</label>
                <textarea
                  value={formTemplate}
                  onChange={(e) => setFormTemplate(e.target.value)}
                  rows={4}
                  className="w-full bg-[#313338] border border-[#383a40] rounded-lg p-2.5 text-xs text-white font-mono focus:outline-none focus:border-indigo-500"
                />
              </div>

              {/* Emoji Quick Picker Bar */}
              <div className="space-y-2">
                <div className="text-[11px] font-semibold text-slate-400">Quick Insert Discord Emojis</div>
                <div className="flex flex-wrap gap-1.5 p-2 bg-[#313338] rounded-lg border border-[#383a40] max-h-28 overflow-y-auto">
                  {Object.keys(DISCORD_EMOJIS).slice(0, 16).map((key) => {
                    const em = DISCORD_EMOJIS[key];
                    return (
                      <button
                        key={key}
                        type="button"
                        onClick={() => setFormTemplate((prev) => prev + ` ${em.raw}`)}
                        className="p-1 hover:bg-[#383a40] rounded transition-colors"
                        title={em.name}
                      >
                        <DiscordEmoji emojiKey={key} className="w-5 h-5" />
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="flex items-center gap-3 pt-2">
                <button
                  onClick={handleSave}
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-semibold shadow-md transition-colors"
                >
                  Save Command
                </button>
                <button
                  onClick={() => setIsEditing(false)}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-xs font-semibold transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          ) : selectedCmd ? (
            <div className="space-y-6">
              <div className="flex items-center justify-between border-b border-[#383a40] pb-4">
                <div>
                  <h3 className="text-lg font-bold text-white flex items-center gap-2">
                    <span className="text-indigo-400">/{selectedCmd.name}</span>
                    <span className="text-xs bg-[#232428] px-2 py-0.5 rounded text-slate-400 font-normal">
                      {selectedCmd.category}
                    </span>
                  </h3>
                  <p className="text-xs text-slate-300 mt-1">{selectedCmd.description}</p>
                </div>

                <button
                  onClick={() => startEdit(selectedCmd)}
                  className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-lg text-xs font-semibold transition-colors"
                >
                  Edit Command
                </button>
              </div>

              <div className="space-y-2">
                <div className="text-xs font-semibold text-slate-300">Bot Response Output Preview</div>
                <div className="p-4 bg-[#313338] rounded-xl border border-[#383a40] text-xs font-mono text-slate-200 leading-relaxed">
                  {selectedCmd.responseTemplate}
                </div>
              </div>

              {/* Code Export Box */}
              <div className="space-y-3 pt-4 border-t border-[#383a40]">
                <div className="flex items-center justify-between">
                  <div className="text-xs font-bold text-white flex items-center gap-2">
                    <DiscordEmoji emojiKey="TOOL" className="w-4 h-4" />
                    <span>Export Full Ready-to-Run Bot Code</span>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => fetchExportedCode('nodejs')}
                      className={`px-3 py-1 rounded text-xs font-semibold transition-colors ${
                        codeLang === 'nodejs' ? 'bg-indigo-600 text-white' : 'bg-[#313338] text-slate-400 hover:text-white'
                      }`}
                    >
                      Discord.js (v14)
                    </button>
                    <button
                      onClick={() => fetchExportedCode('python')}
                      className={`px-3 py-1 rounded text-xs font-semibold transition-colors ${
                        codeLang === 'python' ? 'bg-indigo-600 text-white' : 'bg-[#313338] text-slate-400 hover:text-white'
                      }`}
                    >
                      Discord.py
                    </button>
                  </div>
                </div>

                {exportedCode && (
                  <pre className="p-4 bg-[#1e1f22] rounded-xl border border-[#383a40] text-xs font-mono text-slate-300 overflow-x-auto max-h-56 leading-relaxed">
                    {exportedCode}
                  </pre>
                )}
              </div>
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
});
