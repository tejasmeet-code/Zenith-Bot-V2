import React, { useState, useRef, useEffect } from 'react';
import { DiscordEmoji, FormattedDiscordText } from './DiscordEmoji';
import { DiscordMessage } from '../utils/botLogic';
import { BotConfig } from '../utils/botConfig';

interface DiscordSandboxProps {
  botConfig: BotConfig;
  onExecuteCommand: (msg: string, selectedModule?: string, selectedOptionValue?: string) => Promise<any>;
  onOpenConfigModal: () => void;
}

export const DiscordSandbox: React.FC<DiscordSandboxProps> = ({
  botConfig,
  onExecuteCommand,
  onOpenConfigModal,
}) => {
  const [activeChannel, setActiveChannel] = useState<'general' | 'bot-testing' | 'music-lounge' | 'mod-logs'>('general');
  const [inputMsg, setInputMsg] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [showSlashMenu, setShowSlashMenu] = useState(false);
  const [openDropdownMsgId, setOpenDropdownMsgId] = useState<string | null>(null);

  const chatEndRef = useRef<HTMLDivElement>(null);
  const [messages, setMessages] = useState<DiscordMessage[]>([]);

  // Load initial Help message
  useEffect(() => {
    onExecuteCommand(`${botConfig.botPrefix}help`).then((res) => {
      setMessages([
        {
          id: 'msg_initial_help',
          author: {
            id: 'bot_01',
            username: botConfig.botName,
            discriminator: '0001',
            avatar: 'bot',
            bot: true,
            roleTag: 'BOT',
          },
          content: res.reply,
          embeds: res.embed ? [res.embed] : undefined,
          dropdownOptions: res.dropdownOptions,
          timestamp: 'Today at 10:00 AM',
          channelId: 'general',
        },
      ]);
    });
  }, [botConfig]);

  const scrollToBottom = () => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setInputMsg(val);
    if (val.startsWith('/') || val.startsWith(botConfig.botPrefix)) {
      setShowSlashMenu(true);
    } else {
      setShowSlashMenu(false);
    }
  };

  const handleSend = async (overrideMsg?: string) => {
    const msgToSend = overrideMsg || inputMsg;
    if (!msgToSend.trim()) return;

    setInputMsg('');
    setShowSlashMenu(false);

    const userMsgObj: DiscordMessage = {
      id: `msg_user_${Date.now()}`,
      author: {
        id: 'user_123',
        username: 'GuildAdmin',
        discriminator: '1337',
        avatar: 'user',
        bot: false,
        roleTag: 'ADMIN',
      },
      content: msgToSend,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      channelId: activeChannel,
    };

    const loadingMsgId = `msg_loading_${Date.now()}`;
    const loadingMsgObj: DiscordMessage = {
      id: loadingMsgId,
      author: {
        id: 'bot_01',
        username: botConfig.botName,
        discriminator: '0001',
        avatar: 'bot',
        bot: true,
        roleTag: 'BOT',
      },
      content: '<a:white_loading:1555133693704544337>',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      channelId: activeChannel,
    };

    setMessages((prev) => [...prev, userMsgObj, loadingMsgObj]);
    setIsTyping(true);

    try {
      const res = await onExecuteCommand(msgToSend);
      setIsTyping(false);

      const botMsgObj: DiscordMessage = {
        id: `msg_bot_${Date.now()}`,
        author: {
          id: 'bot_01',
          username: botConfig.botName,
          discriminator: '0001',
          avatar: 'bot',
          bot: true,
          roleTag: 'BOT',
        },
        content: res.reply,
        embeds: res.embed ? [res.embed] : undefined,
        dropdownOptions: res.dropdownOptions,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        channelId: activeChannel,
      };

      setMessages((prev) => prev.filter((m) => m.id !== loadingMsgId).concat(botMsgObj));
    } catch (err) {
      setIsTyping(false);
      const errMsgObj: DiscordMessage = {
        id: `msg_err_${Date.now()}`,
        author: {
          id: 'bot_01',
          username: botConfig.botName,
          discriminator: '0001',
          avatar: 'bot',
          bot: true,
          roleTag: 'BOT',
        },
        content: `<a:error:1555133322840121357> Error executing command in sandbox.`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        channelId: activeChannel,
      };
      setMessages((prev) => prev.filter((m) => m.id !== loadingMsgId).concat(errMsgObj));
    }
  };

  const handleSelectDropdownValue = async (value: string) => {
    setOpenDropdownMsgId(null);
    setIsTyping(true);

    const loadingMsgId = `msg_loading_${Date.now()}`;
    const loadingMsgObj: DiscordMessage = {
      id: loadingMsgId,
      author: {
        id: 'bot_01',
        username: botConfig.botName,
        discriminator: '0001',
        avatar: 'bot',
        bot: true,
        roleTag: 'BOT',
      },
      content: '<a:white_loading:1555133693704544337>',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      channelId: activeChannel,
    };
    setMessages((prev) => [...prev, loadingMsgObj]);

    const res = await onExecuteCommand('', undefined, value);
    setIsTyping(false);

    const botMsgObj: DiscordMessage = {
      id: `msg_bot_${Date.now()}`,
      author: {
        id: 'bot_01',
        username: botConfig.botName,
        discriminator: '0001',
        avatar: 'bot',
        bot: true,
        roleTag: 'BOT',
      },
      content: res.reply,
      embeds: res.embed ? [res.embed] : undefined,
      dropdownOptions: res.dropdownOptions,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      channelId: activeChannel,
    };

    setMessages((prev) => prev.filter((m) => m.id !== loadingMsgId).concat(botMsgObj));
  };

  const commandAutocompleteList = [
    { name: `@${botConfig.botName}`, desc: 'Ping bot for info, prefix & how it works', emoji: 'WHITE_BOT' },
    { name: `${botConfig.botPrefix}help`, desc: 'View modular 1-page dropdown directory', emoji: 'COMMANDS' },
    { name: `${botConfig.botPrefix}botinfo`, desc: 'View bot stats, uptime, team, credits', emoji: 'WHITE_INFO' },
    { name: `${botConfig.botPrefix}antinuke config`, desc: 'Configure Anti-Nuke mini modules', emoji: 'WHITE_ANTINUKE' },
    { name: `${botConfig.botPrefix}antinuke wizard`, desc: 'Auto-create category, audit logs & wall roles', emoji: 'WHITE_LOCK' },
    { name: `${botConfig.botPrefix}whitelist`, desc: 'Manage user, role, and channel bypasses', emoji: 'WHITE_CLAIM' },
    { name: `${botConfig.botPrefix}fakeroles`, desc: 'Scan and destroy decoy & honeypot roles', emoji: 'WHITE_ROLES' },
    { name: `${botConfig.botPrefix}betrayalguard`, desc: 'Rogue bot & malicious staff containment', emoji: 'WHITE_TERMINATE' },
    { name: `${botConfig.botPrefix}serverowner`, desc: 'Manage primary server owner trust level', emoji: 'WHITE_OWNER' },
    { name: `${botConfig.botPrefix}serveradmin`, desc: 'Manage trusted server administrators', emoji: 'WHITE_ADMIN' },
    { name: `${botConfig.botPrefix}serverstaff`, desc: 'Manage trusted staff members', emoji: 'WHITE_MANAGER' },
    { name: `${botConfig.botPrefix}trusted`, desc: 'Manage trusted guild members', emoji: 'WHITE_HOMIES' },
    { name: `${botConfig.botPrefix}adminbot`, desc: 'Authorize admin moderation bots', emoji: 'WHITE_BOT' },
    { name: `${botConfig.botPrefix}ticketsbot`, desc: 'Authorize support ticket bots', emoji: 'WHITE_TICKET' },
    { name: `${botConfig.botPrefix}levelingbot`, desc: 'Authorize XP & leveling bots', emoji: 'WHITE_AWARD' },
    { name: `${botConfig.botPrefix}antinuke wizard`, desc: 'Run Anti-Nuke Vault Setup Wizard', emoji: 'WHITE_LOCK' },
    { name: `${botConfig.botPrefix}ping`, desc: 'Check WebSocket latency', emoji: 'PING' },
    { name: `${botConfig.botPrefix}play`, desc: 'Play track from Spotify/YouTube', emoji: 'MUSIC' },
    { name: `${botConfig.botPrefix}ai`, desc: 'Ask Gemini AI assistant', emoji: 'AI' },
    { name: `${botConfig.botPrefix}ban`, desc: 'Ban rule-breaking user', emoji: 'WHITE_BAN' },
    { name: `${botConfig.botPrefix}automod`, desc: 'View anti-nuke vault shield', emoji: 'WHITE_AUTOMOD' },
  ];

  const filteredMessages = messages.filter((m) => m.channelId === activeChannel);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 text-slate-100 space-y-4">
      {/* Bot Config Banner bar */}
      <div className="bg-[#2b2d31] p-3.5 rounded-xl border border-[#383a40] flex items-center justify-between gap-4 text-xs">
        <div className="flex items-center gap-3">
          <img
            src={botConfig.embedThumbnail}
            alt={botConfig.botName}
            className="w-7 h-7 rounded-full object-cover border border-indigo-500/50"
          />
          <div>
            <span className="font-bold text-white text-sm">{botConfig.botName}</span>
            <span className="text-slate-400 ml-2">
              Prefix: <code className="bg-[#1e1f22] px-1.5 py-0.5 rounded text-indigo-300 font-bold">{botConfig.botPrefix}</code>
            </span>
            <span className="text-slate-400 ml-2 hidden sm:inline">Owner ID: {botConfig.ownerId}</span>
          </div>
        </div>

        <button
          onClick={onOpenConfigModal}
          className="px-3.5 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-lg transition-colors flex items-center gap-1.5 shrink-0"
        >
          <DiscordEmoji emojiKey="WHITE_SETTINGS" className="w-3.5 h-3.5" />
          <span>Edit Config / Prefix</span>
        </button>
      </div>

      {/* Discord Shell UI Container */}
      <div className="bg-[#313338] border border-[#2b2d31] rounded-2xl overflow-hidden shadow-2xl flex h-[660px]">
        {/* Discord Channels Sidebar */}
        <div className="w-60 bg-[#2b2d31] flex flex-col border-r border-[#1e1f22] shrink-0 hidden sm:flex">
          <div className="p-3.5 border-b border-[#1e1f22] flex items-center justify-between font-bold text-sm text-white shadow-sm">
            <span className="flex items-center gap-2 truncate">
              <DiscordEmoji emojiKey="WHITE_VIP" className="w-4 h-4" />
              <span className="truncate">Official Guild</span>
            </span>
            <DiscordEmoji emojiKey="WHITE_DONE" className="w-4 h-4" />
          </div>

          <div className="p-2 space-y-1 text-xs font-semibold text-slate-400 overflow-y-auto flex-1">
            <div className="px-2 py-1 uppercase tracking-wider text-[10px] text-slate-400 font-bold">TEXT CHANNELS</div>

            <button
              onClick={() => setActiveChannel('general')}
              className={`w-full flex items-center gap-2 px-2.5 py-2 rounded-md transition-colors ${
                activeChannel === 'general' ? 'bg-[#404249] text-white' : 'hover:bg-[#35373c] hover:text-slate-200'
              }`}
            >
              <span className="text-slate-400 text-base font-normal">#</span>
              <span className="truncate">general-chat</span>
            </button>

            <button
              onClick={() => setActiveChannel('bot-testing')}
              className={`w-full flex items-center gap-2 px-2.5 py-2 rounded-md transition-colors ${
                activeChannel === 'bot-testing' ? 'bg-[#404249] text-white' : 'hover:bg-[#35373c] hover:text-slate-200'
              }`}
            >
              <span className="text-slate-400 text-base font-normal">#</span>
              <span className="truncate">bot-testing</span>
            </button>

            <button
              onClick={() => setActiveChannel('music-lounge')}
              className={`w-full flex items-center gap-2 px-2.5 py-2 rounded-md transition-colors ${
                activeChannel === 'music-lounge' ? 'bg-[#404249] text-white' : 'hover:bg-[#35373c] hover:text-slate-200'
              }`}
            >
              <span className="text-slate-400 text-base font-normal">#</span>
              <span className="truncate">music-lounge</span>
            </button>

            <button
              onClick={() => setActiveChannel('mod-logs')}
              className={`w-full flex items-center gap-2 px-2.5 py-2 rounded-md transition-colors ${
                activeChannel === 'mod-logs' ? 'bg-[#404249] text-white' : 'hover:bg-[#35373c] hover:text-slate-200'
              }`}
            >
              <span className="text-slate-400 text-base font-normal">#</span>
              <span className="truncate">mod-audit-logs</span>
            </button>
          </div>

          <div className="p-2.5 bg-[#232428] border-t border-[#1e1f22] flex items-center justify-between text-xs">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-indigo-600 flex items-center justify-center font-bold text-white relative">
                G
                <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-emerald-500 rounded-full border-2 border-[#232428]"></span>
              </div>
              <div className="leading-tight">
                <div className="font-bold text-white text-xs truncate max-w-[100px]">GuildAdmin</div>
                <div className="text-[10px] text-slate-400">#1337</div>
              </div>
            </div>
            <DiscordEmoji emojiKey="WHITE_SETTINGS" className="w-4 h-4 cursor-pointer hover:opacity-80" onClick={onOpenConfigModal} />
          </div>
        </div>

        {/* Discord Chat Main View */}
        <div className="flex-1 flex flex-col bg-[#313338] relative">
          <div className="p-3.5 border-b border-[#27292d] bg-[#313338] flex items-center justify-between shadow-sm">
            <div className="flex items-center gap-2 text-white font-bold text-sm">
              <span className="text-slate-400 text-lg">#</span>
              <span>{activeChannel}</span>
              <span className="text-xs font-normal text-slate-400 border-l border-slate-600 pl-2 ml-2 hidden md:inline">
                Test command prefix <code className="bg-[#1e1f22] px-1 rounded text-indigo-300 font-bold">{botConfig.botPrefix}help</code> or <code className="bg-[#1e1f22] px-1 rounded text-indigo-300 font-bold">{botConfig.botPrefix}antinuke config</code>
              </span>
            </div>
            <div className="flex items-center gap-2">
              <DiscordEmoji emojiKey="NOTIFICATIONS" className="w-4 h-4" />
              <DiscordEmoji emojiKey="PEOPLE" className="w-4 h-4" />
            </div>
          </div>

          {/* Messages Feed */}
          <div className="flex-1 p-4 overflow-y-auto space-y-4">
            {filteredMessages.map((msg) => (
              <div key={msg.id} className="flex gap-3 hover:bg-[#2e3035]/50 p-1.5 -mx-1.5 rounded transition-colors group">
                <div className="shrink-0">
                  {msg.author.bot ? (
                    <img
                      src={botConfig.embedThumbnail}
                      alt={botConfig.botName}
                      className="w-10 h-10 rounded-full object-cover border border-indigo-500/50 shadow-md"
                    />
                  ) : (
                    <div className="w-10 h-10 rounded-full bg-emerald-600 flex items-center justify-center text-white font-bold shadow-md">
                      A
                    </div>
                  )}
                </div>

                <div className="flex-1 space-y-2 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-sm text-white hover:underline cursor-pointer">
                      {msg.author.username}
                    </span>
                    {msg.author.bot && (
                      <span className="bg-[#5865f2] text-white text-[10px] font-bold px-1.5 py-0.2 rounded inline-flex items-center gap-0.5">
                        <DiscordEmoji emojiKey="WHITE_DONE" className="w-2.5 h-2.5" />
                        <span>BOT</span>
                      </span>
                    )}
                    <span className="text-[11px] text-slate-400 font-normal">{msg.timestamp}</span>
                  </div>

                  {/* Text Message */}
                  <div className="text-sm text-slate-200 leading-relaxed break-words">
                    <FormattedDiscordText text={msg.content} />
                  </div>

                  {/* Discord Embed Rendering */}
                  {msg.embeds &&
                    msg.embeds.map((embed, eIdx) => (
                      <div
                        key={eIdx}
                        className="p-4 bg-[#2b2d31] rounded-xl border-l-4 border-indigo-500 max-w-2xl space-y-3 shadow-xl text-xs relative overflow-hidden"
                        style={{
                          borderLeftColor: embed.color
                            ? `#${embed.color.toString(16).padStart(6, '0')}`
                            : '#5865f2',
                        }}
                      >
                        {/* Embed Thumbnail */}
                        {embed.thumbnail?.url && (
                          <img
                            src={embed.thumbnail.url}
                            alt="Thumbnail"
                            className="w-16 h-16 rounded-xl object-cover absolute top-4 right-4 border border-[#383a40] shadow-md hidden sm:block"
                          />
                        )}

                        {embed.title && (
                          <div className="font-extrabold text-base text-white pr-20 flex items-center gap-2">
                            <FormattedDiscordText text={embed.title} />
                          </div>
                        )}

                        {embed.description && (
                          <div className="text-slate-300 leading-relaxed font-sans">
                            <FormattedDiscordText text={embed.description} />
                          </div>
                        )}

                        {/* Embed Fields */}
                        {embed.fields && embed.fields.length > 0 && (
                          <div className="space-y-2 pt-2 border-t border-[#383a40]/60">
                            {embed.fields.map((f, fIdx) => (
                              <div key={fIdx} className="bg-[#1e1f22] p-2.5 rounded-lg border border-[#383a40]">
                                <div className="font-bold text-white text-xs">
                                  <FormattedDiscordText text={f.name} />
                                </div>
                                <div className="text-slate-300 font-mono text-xs mt-1 leading-relaxed">
                                  <FormattedDiscordText text={f.value} />
                                </div>
                              </div>
                            ))}
                          </div>
                        )}

                        {/* Embed Banner Image */}
                        {embed.image?.url && (
                          <div className="pt-2">
                            <img
                              src={embed.image.url}
                              alt="Embed Banner"
                              className="w-full h-36 object-cover rounded-xl border border-[#383a40] shadow-md"
                            />
                          </div>
                        )}

                        {embed.footer && (
                          <div className="text-[10px] text-slate-400 pt-2 border-t border-[#383a40] font-mono">
                            {embed.footer.text}
                          </div>
                        )}
                      </div>
                    ))}

                  {/* Category Dropdown Menu with Custom Discord Emoji Icons in front of every module name */}
                  {msg.dropdownOptions && msg.dropdownOptions.length > 0 && (
                    <div className="pt-2 max-w-2xl relative">
                      <div className="text-[11px] font-bold text-slate-400 mb-1 flex items-center gap-1.5">
                        <DiscordEmoji emojiKey="LIST" className="w-3.5 h-3.5" />
                        <span>Select Category / Mini-Module Option</span>
                      </div>

                      {/* Discord Interactive Select Menu Trigger */}
                      <button
                        type="button"
                        onClick={() =>
                          setOpenDropdownMsgId(openDropdownMsgId === msg.id ? null : msg.id)
                        }
                        className="w-full bg-[#2b2d31] hover:bg-[#313338] border border-[#383a40] text-slate-200 text-xs rounded-xl p-3 font-semibold flex items-center justify-between shadow-lg transition-colors"
                      >
                        <span className="flex items-center gap-2 truncate">
                          <DiscordEmoji emojiKey="LIST" className="w-4 h-4" />
                          <span>Select an option...</span>
                        </span>
                        <DiscordEmoji emojiKey="WHITE_SETTINGS" className="w-3.5 h-3.5 opacity-60" />
                      </button>

                      {/* Dropdown Options Popover List */}
                      {openDropdownMsgId === msg.id && (
                        <div className="absolute top-full left-0 right-0 mt-1.5 bg-[#2b2d31] border border-[#383a40] rounded-xl shadow-2xl p-1.5 z-30 max-h-60 overflow-y-auto space-y-1 animate-in fade-in slide-in-from-top-2 duration-150">
                          {msg.dropdownOptions.map((opt) => (
                            <button
                              key={opt.value}
                              onClick={() => handleSelectDropdownValue(opt.value)}
                              className="w-full flex items-center gap-2.5 p-2.5 rounded-lg hover:bg-[#35373c] text-left transition-colors group"
                            >
                              <DiscordEmoji
                                id={opt.emojiId}
                                name={opt.emojiName}
                                animated={opt.animated}
                                className="w-5 h-5 shrink-0"
                              />
                              <div className="min-w-0 flex-1">
                                <div className="font-bold text-xs text-white group-hover:text-indigo-400 transition-colors truncate">
                                  {opt.label}
                                </div>
                                <div className="text-[11px] text-slate-400 truncate">{opt.description}</div>
                              </div>
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            ))}

            {isTyping && (
              <div className="flex items-center gap-2 text-xs text-slate-400 italic pl-12 py-1">
                <DiscordEmoji emojiKey="WHITE_LOADING" className="w-4 h-4" />
                <span>{botConfig.botName} is updating embed menu...</span>
              </div>
            )}

            <div ref={chatEndRef} />
          </div>

          {/* Autocomplete Popup */}
          {showSlashMenu && (
            <div className="absolute bottom-16 left-4 right-4 bg-[#2b2d31] border border-[#383a40] rounded-xl shadow-2xl p-2 z-20 space-y-1 max-h-48 overflow-y-auto">
              <div className="text-[10px] font-bold text-slate-400 px-2 py-1 uppercase">
                Prefix Commands ({botConfig.botPrefix})
              </div>
              {commandAutocompleteList.map((cmd) => (
                <button
                  key={cmd.name}
                  onClick={() => {
                    setInputMsg(`${cmd.name} `);
                    setShowSlashMenu(false);
                  }}
                  className="w-full flex items-center justify-between p-2 rounded-lg hover:bg-[#35373c] text-left transition-colors"
                >
                  <div className="flex items-center gap-2">
                    <DiscordEmoji emojiKey={cmd.emoji} className="w-4 h-4" />
                    <span className="font-bold text-xs text-indigo-400">{cmd.name}</span>
                  </div>
                  <span className="text-[11px] text-slate-400">{cmd.desc}</span>
                </button>
              ))}
            </div>
          )}

          {/* Chat Input Field */}
          <div className="p-4 bg-[#313338] border-t border-[#27292d]">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSend();
              }}
              className="flex items-center bg-[#383a40] rounded-xl px-4 py-2.5 gap-2 border border-transparent focus-within:border-indigo-500 transition-colors"
            >
              <input
                type="text"
                value={inputMsg}
                onChange={handleInputChange}
                placeholder={`Message #${activeChannel} (try ${botConfig.botPrefix}help or ${botConfig.botPrefix}antinuke config)`}
                className="bg-transparent flex-1 text-sm text-white placeholder-slate-400 focus:outline-none"
              />

              <button
                type="submit"
                disabled={!inputMsg.trim()}
                className="p-1.5 bg-indigo-600 hover:bg-indigo-500 disabled:bg-slate-700 text-white rounded-lg transition-colors"
              >
                <DiscordEmoji emojiKey="WHITE_DONE" className="w-4 h-4" />
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};
