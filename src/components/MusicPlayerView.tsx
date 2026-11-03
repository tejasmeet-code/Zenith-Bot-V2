import React, { useState, useEffect } from 'react';
import { DiscordEmoji } from './DiscordEmoji';
import {
  GuildMusicState,
  TrackMetadata,
  MusicPlatform,
  VoiceFilter,
  PUBLIC_LAVALINK_NODES,
} from '../utils/lavalinkManager';

export const MusicPlayerView: React.FC = () => {
  const [musicState, setMusicState] = useState<GuildMusicState | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedPlatform, setSelectedPlatform] = useState<MusicPlatform>('Spotify');
  const [showRecapModal, setShowRecapModal] = useState(false);
  const [recapData, setRecapData] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  // Fetch initial music state from server
  const fetchState = async () => {
    try {
      const res = await fetch('/api/music/state');
      if (res.ok) {
        const data = await res.json();
        setMusicState(data.state);
        setSelectedPlatform(data.state.preferredSource);
      }
    } catch (err) {
      console.error('Failed to fetch music state:', err);
    }
  };

  useEffect(() => {
    fetchState();
  }, []);

  const handleAction = async (action: string, payload: any = {}) => {
    setLoading(true);
    try {
      const res = await fetch('/api/music/action', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action, ...payload }),
      });
      if (res.ok) {
        const data = await res.json();
        setMusicState(data.state);
      }
    } catch (err) {
      console.error('Music action failed:', err);
    } finally {
      setLoading(false);
    }
  };

  const handlePlaySearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    handleAction('play', { query: searchQuery, platform: selectedPlatform });
    setSearchQuery('');
  };

  const openRecap = async () => {
    try {
      const res = await fetch('/api/music/recap');
      if (res.ok) {
        const data = await res.json();
        setRecapData(data.recap);
        setShowRecapModal(true);
      }
    } catch (err) {
      console.error('Failed to fetch recap:', err);
    }
  };

  const currentTrack = musicState?.currentTrack;
  const isPlaying = musicState?.isPlaying && !musicState?.isPaused;

  const filtersList: VoiceFilter[] = [
    'None',
    '8D Audio',
    'Bass Boost',
    'Nightcore',
    'Vaporwave',
    'Treble Boost',
    'Clear Vocals',
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 text-slate-100 space-y-6">
      {/* Public Lavalink Node Banner & Voice Status */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-[#2b2d31] p-6 rounded-2xl border border-[#383a40] shadow-xl">
        <div className="space-y-1.5">
          <div className="flex flex-wrap items-center gap-2">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 rounded-full text-xs font-mono font-bold">
              <DiscordEmoji emojiKey="WHITE_MIC" className="w-3.5 h-3.5" />
              <span>Voice Channel: Lounge #1</span>
              <span className="text-slate-500">•</span>
              <span>Bitrate: 384kbps Hi-Fi FLAC</span>
            </div>

            <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 rounded-full text-xs font-mono font-bold">
              <DiscordEmoji emojiKey="MUSIC" className="w-3.5 h-3.5" />
              <span>VC Status: Playing: {currentTrack ? `${currentTrack.title} - ${currentTrack.artist}` : 'Idle'}</span>
            </div>

            {musicState?.is247 && (
              <div className="inline-flex items-center gap-1 px-2.5 py-1 bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 rounded-full text-xs font-mono font-bold">
                <DiscordEmoji emojiKey="WORLD" className="w-3.5 h-3.5" />
                <span>24/7 LOCKED IN VC</span>
              </div>
            )}

            {musicState?.autoplay && (
              <div className="inline-flex items-center gap-1 px-2.5 py-1 bg-purple-500/20 text-purple-300 border border-purple-500/30 rounded-full text-xs font-mono font-bold">
                <DiscordEmoji emojiKey="MUSIC_02" className="w-3.5 h-3.5" />
                <span>AUTOPLAY ON</span>
              </div>
            )}
          </div>

          <h2 className="text-xl font-extrabold text-white flex items-center gap-2">
            <DiscordEmoji emojiKey="MUSIC_02" className="w-6 h-6" />
            <span>Public Lavalink Audio Engine & Hi-Fi Streaming</span>
          </h2>
          <p className="text-xs text-slate-400">
            Node: <span className="text-indigo-400 font-mono font-semibold">{musicState?.lavalinkNode || 'Lavalink Lexnet EU'}</span> (28ms) • Official Singer Accounts Prioritized • Zero Latency Opus HD
          </p>
        </div>

        {/* 24h Recap Button & 24/7 Quick Toggle */}
        <div className="flex flex-wrap items-center gap-2.5">
          <button
            onClick={() => handleAction('toggle247')}
            className={`px-3 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 border transition-all ${
              musicState?.is247
                ? 'bg-emerald-600/30 border-emerald-500 text-emerald-300'
                : 'bg-[#1e1f22] border-[#383a40] text-slate-400 hover:text-white'
            }`}
          >
            <DiscordEmoji emojiKey="WORLD" className="w-4 h-4" />
            <span>24/7 Mode: {musicState?.is247 ? 'ON' : 'OFF'}</span>
          </button>

          <button
            onClick={() => handleAction('toggleAutoplay')}
            className={`px-3 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 border transition-all ${
              musicState?.autoplay
                ? 'bg-purple-600/30 border-purple-500 text-purple-300'
                : 'bg-[#1e1f22] border-[#383a40] text-slate-400 hover:text-white'
            }`}
          >
            <DiscordEmoji emojiKey="LOOP" className="w-4 h-4" />
            <span>Autoplay: {musicState?.autoplay ? 'ON' : 'OFF'}</span>
          </button>

          <button
            onClick={openRecap}
            className="px-3.5 py-2 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-md transition-all cursor-pointer"
          >
            <DiscordEmoji emojiKey="WHITE_AWARD" className="w-4 h-4" />
            <span>24h Recap</span>
          </button>
        </div>
      </div>

      {/* Source Selector Bar */}
      <div className="flex items-center justify-between flex-wrap gap-3 bg-[#2b2d31] p-3 rounded-xl border border-[#383a40]">
        <span className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
          <DiscordEmoji emojiKey="TOOL" className="w-4 h-4" />
          <span>Active Streaming Provider:</span>
        </span>

        <div className="flex flex-wrap items-center gap-2">
          {(['Spotify', 'YouTube', 'Apple Music', 'JioSaavn', 'Amazon Music'] as MusicPlatform[]).map((plat) => (
            <button
              key={plat}
              onClick={() => {
                setSelectedPlatform(plat);
                handleAction('setSource', { platform: plat });
              }}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                selectedPlatform === plat
                  ? 'bg-indigo-600 text-white shadow-md'
                  : 'bg-[#1e1f22] text-slate-400 hover:text-white border border-[#383a40]'
              }`}
            >
              <DiscordEmoji
                emojiKey={
                  plat === 'Spotify'
                    ? 'SPOTIFY'
                    : plat === 'YouTube'
                    ? 'YOUTUBE_MUSIC'
                    : plat === 'Apple Music'
                    ? 'APPLE_MUSIC'
                    : plat === 'JioSaavn'
                    ? 'JIO_SAAVAN'
                    : 'AMAZON_MUSIC'
                }
                className="w-4 h-4"
              />
              <span>{plat}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Player Display */}
        <div className="lg:col-span-2 bg-[#2b2d31] border border-[#383a40] rounded-2xl p-6 space-y-6 flex flex-col justify-between shadow-xl">
          {/* Now Playing Media Card */}
          <div className="flex flex-col sm:flex-row items-center gap-6 bg-[#1e1f22] p-5 rounded-xl border border-[#383a40]">
            <img
              src={currentTrack?.thumbnail || 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=400&auto=format&fit=crop&q=80'}
              alt={currentTrack?.title}
              className="w-36 h-36 rounded-xl object-cover border border-[#383a40] shadow-2xl shrink-0"
            />

            <div className="space-y-2.5 text-center sm:text-left flex-1 min-w-0">
              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
                <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 bg-emerald-950 text-emerald-300 border border-emerald-800 rounded text-[10px] font-bold">
                  <DiscordEmoji emojiKey="WHITE_MUSIC" className="w-3 h-3" />
                  <span>NOW PLAYING</span>
                  <span className="text-slate-500">•</span>
                  <span>{currentTrack?.source}</span>
                </div>

                <div className="inline-flex items-center gap-1 px-2 py-0.5 bg-indigo-950 text-indigo-300 border border-indigo-800 rounded text-[10px] font-bold">
                  <DiscordEmoji emojiKey="WHITE_AWARD" className="w-3 h-3" />
                  <span>Official Singer Account</span>
                </div>

                <div className="inline-flex items-center gap-1 px-2 py-0.5 bg-amber-950 text-amber-300 border border-amber-800 rounded text-[10px] font-bold">
                  <DiscordEmoji emojiKey="PREMIUM1" className="w-3 h-3" />
                  <span>384kbps Hi-Fi</span>
                </div>
              </div>

              <h3 className="text-lg sm:text-xl font-extrabold text-white truncate">
                {currentTrack?.title || 'No Track Selected'}
              </h3>
              <p className="text-xs font-semibold text-slate-300 flex items-center justify-center sm:justify-start gap-1">
                <DiscordEmoji emojiKey="PEOPLE" className="w-3.5 h-3.5" />
                <span>{currentTrack?.artist}</span>
              </p>

              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-4 text-[11px] text-slate-400">
                <span>Requested by: <span className="text-indigo-400 font-bold">{currentTrack?.requestedBy}</span></span>
                <span>•</span>
                <span className="flex items-center gap-1 text-pink-400 font-bold">
                  <DiscordEmoji emojiKey="WHITE_GIFT" className="w-3.5 h-3.5" />
                  <span>{currentTrack?.likes || 0} Likes</span>
                </span>
                <span>•</span>
                <span className="text-amber-400 font-bold">Speed: {currentTrack?.speed.toFixed(2)}x</span>
                <span>•</span>
                <span className="text-emerald-400 font-bold">Filter: {musicState?.activeFilter || 'None'}</span>
              </div>
            </div>
          </div>

          {/* Scrub Bar & Audio Wave Visualizer */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs font-mono text-slate-400">
              <span className="text-emerald-400 font-bold">01:42</span>
              <div className="flex items-center gap-1">
                <span className="w-1.5 h-3 bg-emerald-500 rounded-full animate-bounce"></span>
                <span className="w-1.5 h-6 bg-emerald-400 rounded-full animate-bounce delay-100"></span>
                <span className="w-1.5 h-4 bg-emerald-500 rounded-full animate-bounce delay-200"></span>
                <span className="w-1.5 h-7 bg-emerald-300 rounded-full animate-bounce delay-150"></span>
                <span className="w-1.5 h-3 bg-emerald-500 rounded-full animate-bounce"></span>
              </div>
              <span>{currentTrack?.duration || '03:45'}</span>
            </div>

            <div className="w-full bg-[#1e1f22] h-2.5 rounded-full overflow-hidden relative cursor-pointer border border-[#383a40]">
              <div className="bg-gradient-to-r from-emerald-500 to-teal-400 h-full w-2/5 rounded-full"></div>
            </div>
          </div>

          {/* Interactive Player Controls */}
          <div className="flex flex-wrap items-center justify-between gap-4 pt-3 border-t border-[#383a40]">
            {/* Previous & Skip */}
            <div className="flex items-center gap-2">
              <button
                onClick={() => handleAction('previous')}
                disabled={loading}
                className="p-2.5 bg-[#1e1f22] hover:bg-[#35373c] border border-[#383a40] text-slate-300 hover:text-white rounded-xl transition-all cursor-pointer"
                title="Previous Track"
              >
                <DiscordEmoji emojiKey="WHITE_PREVIOUS" className="w-5 h-5" />
              </button>

              <button
                onClick={() => handleAction('togglePause')}
                disabled={loading}
                className="p-3.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-full shadow-lg shadow-emerald-950/50 transition-all cursor-pointer"
                title={isPlaying ? 'Pause' : 'Resume'}
              >
                <DiscordEmoji emojiKey={isPlaying ? 'PAUSE' : 'RESUME'} className="w-6 h-6 object-contain" />
              </button>

              <button
                onClick={() => handleAction('skip')}
                disabled={loading}
                className="p-2.5 bg-[#1e1f22] hover:bg-[#35373c] border border-[#383a40] text-slate-300 hover:text-white rounded-xl transition-all cursor-pointer"
                title="Skip Track"
              >
                <DiscordEmoji emojiKey="WHITE_SKIP" className="w-5 h-5" />
              </button>
            </div>

            {/* Like Song Button */}
            <button
              onClick={() => handleAction('like')}
              disabled={loading}
              className="px-3 py-2 bg-pink-600/20 hover:bg-pink-600/30 text-pink-300 border border-pink-500/40 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer"
              title="Like this song"
            >
              <DiscordEmoji emojiKey="WHITE_GIFT" className="w-4 h-4" />
              <span>Like ({currentTrack?.likes || 0})</span>
            </button>

            {/* Speed Presets */}
            <div className="flex items-center gap-1 bg-[#1e1f22] p-1 rounded-xl border border-[#383a40]">
              {[0.75, 1.0, 1.25, 1.5].map((spd) => (
                <button
                  key={spd}
                  onClick={() => handleAction('setSpeed', { speed: spd })}
                  className={`px-2 py-1 rounded-lg text-xs font-mono font-bold transition-all cursor-pointer ${
                    musicState?.speed === spd ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  {spd}x
                </button>
              ))}
            </div>

            {/* Voice Filters Dropdown */}
            <div className="flex items-center gap-1.5">
              <DiscordEmoji emojiKey="TOOL" className="w-4 h-4 text-slate-400" />
              <select
                value={musicState?.activeFilter || 'None'}
                onChange={(e) => handleAction('setFilter', { filter: e.target.value })}
                className="bg-[#1e1f22] border border-[#383a40] text-xs font-bold text-slate-200 rounded-lg p-1.5 focus:outline-none focus:border-indigo-500 cursor-pointer"
              >
                {filtersList.map((f) => (
                  <option key={f} value={f}>
                    {f}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Up Next Queue & Smart Search Box */}
        <div className="bg-[#2b2d31] border border-[#383a40] rounded-2xl p-6 space-y-4 flex flex-col justify-between shadow-xl min-h-[520px]">
          <div className="space-y-3 flex-1 flex flex-col">
            <h3 className="text-sm font-bold text-white flex items-center justify-between border-b border-[#383a40] pb-2">
              <span className="flex items-center gap-2">
                <DiscordEmoji emojiKey="LIST" className="w-4 h-4" />
                <span>Smart Up-Next Queue</span>
              </span>
              <span className="text-xs font-mono text-emerald-400 font-bold">{musicState?.queue?.length || 0} Tracks</span>
            </h3>

            {/* Smart Search Form */}
            <form onSubmit={handlePlaySearch} className="flex gap-2">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={`Search lyrics, title, or official artist (${selectedPlatform})...`}
                className="flex-1 bg-[#1e1f22] border border-[#383a40] rounded-lg p-2 text-xs text-white placeholder-slate-400 focus:outline-none focus:border-emerald-500"
              />
              <button
                type="submit"
                disabled={loading}
                className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-bold transition-all shadow-md cursor-pointer shrink-0"
              >
                + Play
              </button>
            </form>

            {/* Queue List */}
            <div className="space-y-2 overflow-y-auto max-h-[330px] pr-1 flex-1">
              {musicState?.queue && musicState.queue.length > 0 ? (
                musicState.queue.map((tr, idx) => (
                  <div
                    key={tr.id}
                    className="p-2.5 rounded-xl border bg-[#1e1f22] border-[#383a40] flex items-center justify-between gap-3 hover:border-slate-500 transition-all"
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <span className="text-xs font-mono font-bold text-slate-500 w-4">{idx + 1}</span>
                      <img src={tr.thumbnail} alt={tr.title} className="w-8 h-8 rounded-lg object-cover shrink-0" />
                      <div className="min-w-0">
                        <div className="font-bold text-xs text-white truncate">{tr.title}</div>
                        <div className="text-[10px] text-slate-400 truncate flex items-center gap-1">
                          <span>{tr.artist}</span>
                          {tr.officialSinger && <span className="text-indigo-400 font-bold">• Official</span>}
                        </div>
                      </div>
                    </div>

                    <span className="text-xs font-mono text-slate-400 shrink-0">{tr.duration}</span>
                  </div>
                ))
              ) : (
                <div className="p-4 rounded-xl border border-dashed border-[#383a40] text-center space-y-1 text-slate-400">
                  <DiscordEmoji emojiKey="WHITE_MUSICNOTE" className="w-6 h-6 mx-auto text-slate-500" />
                  <div className="text-xs font-bold text-slate-300">Smart Queue is Empty</div>
                  <div className="text-[11px]">
                    {musicState?.autoplay ? 'Autoplay will seamlessly play official songs' : 'Add songs above or turn on Autoplay'}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Public Lavalink Node Health Monitor */}
          <div className="p-3 bg-[#1e1f22] rounded-xl border border-[#383a40] space-y-2 text-[11px]">
            <div className="flex items-center justify-between font-bold text-slate-300">
              <span className="flex items-center gap-1">
                <DiscordEmoji emojiKey="GLOBE" className="w-3.5 h-3.5" />
                <span>Public Lavalink Nodes ({PUBLIC_LAVALINK_NODES.length})</span>
              </span>
              <span className="text-emerald-400 font-mono">100% ONLINE</span>
            </div>
            <div className="grid grid-cols-2 gap-1.5 text-[10px] font-mono text-slate-400">
              {PUBLIC_LAVALINK_NODES.slice(0, 4).map((node) => (
                <div key={node.name} className="flex items-center justify-between bg-[#2b2d31] p-1.5 rounded">
                  <span className="truncate">{node.name.replace('Lavalink ', '')}</span>
                  <span className="text-emerald-400 font-bold">{node.ping}ms</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* 24-Hour Recap Modal */}
      {showRecapModal && recapData && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#2b2d31] border border-[#383a40] rounded-2xl max-w-xl w-full p-6 space-y-5 shadow-2xl animate-in fade-in duration-200">
            <div className="flex items-center justify-between border-b border-[#383a40] pb-3">
              <h3 className="text-base font-extrabold text-white flex items-center gap-2">
                <DiscordEmoji emojiKey="WHITE_AWARD" className="w-5 h-5" />
                <span>{recapData.title}</span>
              </h3>
              <button
                onClick={() => setShowRecapModal(false)}
                className="text-slate-400 hover:text-white font-bold text-lg p-1"
              >
                ×
              </button>
            </div>

            <p className="text-xs text-slate-300">{recapData.description}</p>

            <div className="grid grid-cols-3 gap-3">
              {recapData.fields?.slice(0, 3).map((f: any) => (
                <div key={f.name} className="bg-[#1e1f22] p-3 rounded-xl border border-[#383a40] space-y-1">
                  <div className="text-[10px] text-slate-400 font-bold">{f.name}</div>
                  <div className="text-sm font-mono font-extrabold text-emerald-400">{f.value.replace(/`/g, '')}</div>
                </div>
              ))}
            </div>

            {recapData.fields?.slice(3).map((f: any) => (
              <div key={f.name} className="bg-[#1e1f22] p-3 rounded-xl border border-[#383a40] space-y-1.5">
                <div className="text-xs font-bold text-slate-300">{f.name}</div>
                <div className="text-xs font-mono text-slate-300 whitespace-pre-line leading-relaxed">{f.value}</div>
              </div>
            ))}

            <div className="flex justify-end pt-2">
              <button
                onClick={() => setShowRecapModal(false)}
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold transition-all cursor-pointer"
              >
                Close Recap
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
