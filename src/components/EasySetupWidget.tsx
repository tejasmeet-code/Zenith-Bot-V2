import React, { useState, useEffect, useCallback } from 'react';
import {
  CheckCircle2,
  AlertTriangle,
  XCircle,
  RefreshCw,
  Terminal,
  ExternalLink,
  Copy,
  Check,
  ShieldCheck,
  Music,
  Cpu,
  KeyRound,
  Sparkles,
  Wrench,
} from 'lucide-react';

interface SystemDiagnostics {
  hasBotToken: boolean;
  hasGeminiKey: boolean;
  hasFirebaseConfig: boolean;
  ffmpegReady: boolean;
  gatewayMode: 'active' | 'disabled';
  gatewayConnected: boolean;
  gatewayPing: number;
  gitConfigClean: boolean;
  clientId: string;
}

export const EasySetupWidget: React.FC = () => {
  const [diag, setDiag] = useState<SystemDiagnostics | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [syncingCommands, setSyncingCommands] = useState<boolean>(false);
  const [fixingIssues, setFixingIssues] = useState<boolean>(false);
  const [copiedInvite, setCopiedInvite] = useState<boolean>(false);
  const [statusMessage, setStatusMessage] = useState<{ text: string; type: 'success' | 'error' | 'info' } | null>(null);

  const fetchDiagnostics = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/easy/diagnostics');
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      setDiag(data);
    } catch (err: any) {
      setStatusMessage({ text: `Could not reach diagnostic endpoint: ${err.message}`, type: 'error' });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDiagnostics();
  }, [fetchDiagnostics]);

  const handleSyncSlashCommands = async () => {
    setSyncingCommands(true);
    setStatusMessage(null);
    try {
      const res = await fetch('/api/easy/sync-commands', { method: 'POST' });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Sync failed');
      setStatusMessage({
        text: `Successfully registered ${data.count || 'all'} Slash Commands globally!`,
        type: 'success',
      });
    } catch (err: any) {
      setStatusMessage({ text: `Slash Command Sync Error: ${err.message}`, type: 'error' });
    } finally {
      setSyncingCommands(false);
    }
  };

  const handleAutoFix = async () => {
    setFixingIssues(true);
    setStatusMessage(null);
    try {
      const res = await fetch('/api/easy/auto-fix', { method: 'POST' });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Auto-fix failed');
      setStatusMessage({
        text: data.fixesApplied?.length
          ? `Auto-fixed: ${data.fixesApplied.join(', ')}`
          : 'System is already clean! All auto-fixable checks passed.',
        type: 'success',
      });
      await fetchDiagnostics();
    } catch (err: any) {
      setStatusMessage({ text: `Auto-Fix Error: ${err.message}`, type: 'error' });
    } finally {
      setFixingIssues(false);
    }
  };

  const clientId = diag?.clientId || '1553292201835102278';
  const inviteUrl = `https://discord.com/api/oauth2/authorize?client_id=${clientId}&permissions=8&scope=bot%20applications.commands`;

  const copyInviteLink = () => {
    navigator.clipboard.writeText(inviteUrl);
    setCopiedInvite(true);
    setTimeout(() => setCopiedInvite(false), 2500);
  };

  const renderBadge = (ok: boolean, okText = 'READY', warnText = 'ACTION NEEDED') =>
    ok ? (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
        <CheckCircle2 className="w-3.5 h-3.5" /> {okText}
      </span>
    ) : (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-500/15 text-amber-300 border border-amber-500/30">
        <AlertTriangle className="w-3.5 h-3.5" /> {warnText}
      </span>
    );

  return (
    <div className="bg-zinc-900/90 border border-zinc-800 rounded-2xl p-6 shadow-xl backdrop-blur-md text-zinc-100 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-800 pb-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-indigo-500/15 border border-indigo-500/30 text-indigo-400">
            <Sparkles className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-lg font-bold tracking-tight text-white">Zenith Easy Control & Setup Center</h2>
            <p className="text-xs text-zinc-400">
              1-Click Diagnostics, Bot Invitation Generator, Slash Command Sync & Auto-Repair
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={fetchDiagnostics}
            disabled={loading}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-zinc-800 hover:bg-zinc-700 text-zinc-200 transition disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            Refresh Checks
          </button>
          <button
            onClick={handleAutoFix}
            disabled={fixingIssues}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-semibold bg-indigo-600 hover:bg-indigo-500 text-white shadow-sm transition disabled:opacity-50"
          >
            <Wrench className="w-3.5 h-3.5" />
            {fixingIssues ? 'Repairing...' : '1-Click Auto-Fix'}
          </button>
        </div>
      </div>

      {statusMessage && (
        <div
          className={`flex items-center justify-between px-4 py-3 rounded-xl text-xs font-medium border ${
            statusMessage.type === 'success'
              ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300'
              : statusMessage.type === 'error'
              ? 'bg-rose-500/10 border-rose-500/30 text-rose-300'
              : 'bg-sky-500/10 border-sky-500/30 text-sky-300'
          }`}
        >
          <span>{statusMessage.text}</span>
          <button onClick={() => setStatusMessage(null)} className="text-zinc-400 hover:text-white ml-4">
            <XCircle className="w-4 h-4" />
          </button>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
        <div className="p-4 rounded-xl bg-zinc-950/60 border border-zinc-800/80 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <KeyRound className="w-5 h-5 text-indigo-400 shrink-0" />
            <div>
              <div className="text-xs font-semibold text-zinc-200">Discord Bot Token</div>
              <div className="text-[11px] text-zinc-500">DISCORD_BOT_TOKEN in .env</div>
            </div>
          </div>
          {renderBadge(!!diag?.hasBotToken, 'CONFIGURED', 'MISSING')}
        </div>

        <div className="p-4 rounded-xl bg-zinc-950/60 border border-zinc-800/80 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Cpu className="w-5 h-5 text-emerald-400 shrink-0" />
            <div>
              <div className="text-xs font-semibold text-zinc-200">Discord Gateway</div>
              <div className="text-[11px] text-zinc-500">
                {diag?.gatewayConnected ? `Online (${diag.gatewayPing}ms)` : 'Heaven Cloud / Standby'}
              </div>
            </div>
          </div>
          {renderBadge(!!diag?.gatewayConnected || diag?.gatewayMode === 'disabled', 'READY', 'STANDBY')}
        </div>

        <div className="p-4 rounded-xl bg-zinc-950/60 border border-zinc-800/80 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Music className="w-5 h-5 text-pink-400 shrink-0" />
            <div>
              <div className="text-xs font-semibold text-zinc-200">FFmpeg Audio Pipeline</div>
              <div className="text-[11px] text-zinc-500">24/7 Voice & DSP Filters</div>
            </div>
          </div>
          {renderBadge(!!diag?.ffmpegReady, 'INSTALLED', 'NOT FOUND')}
        </div>

        <div className="p-4 rounded-xl bg-zinc-950/60 border border-zinc-800/80 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Sparkles className="w-5 h-5 text-amber-400 shrink-0" />
            <div>
              <div className="text-xs font-semibold text-zinc-200">Gemini AI Assistant</div>
              <div className="text-[11px] text-zinc-500">GEMINI_API_KEY in .env</div>
            </div>
          </div>
          {renderBadge(!!diag?.hasGeminiKey, 'ACTIVE', 'OPTIONAL')}
        </div>

        <div className="p-4 rounded-xl bg-zinc-950/60 border border-zinc-800/80 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <ShieldCheck className="w-5 h-5 text-teal-400 shrink-0" />
            <div>
              <div className="text-xs font-semibold text-zinc-200">Git Credential Hygiene</div>
              <div className="text-[11px] text-zinc-500">.git/config token scrub</div>
            </div>
          </div>
          {renderBadge(diag?.gitConfigClean !== false, 'CLEAN', 'TOKEN EXPOSED')}
        </div>

        <div className="p-4 rounded-xl bg-zinc-950/60 border border-zinc-800/80 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Terminal className="w-5 h-5 text-purple-400 shrink-0" />
            <div>
              <div className="text-xs font-semibold text-zinc-200">Cloud Persistence</div>
              <div className="text-[11px] text-zinc-500">Firestore + Local JSON Fallback</div>
            </div>
          </div>
          {renderBadge(!!diag?.hasFirebaseConfig, 'LINKED', 'LOCAL FALLBACK')}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
        <div className="p-4 rounded-xl bg-zinc-950/80 border border-zinc-800 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-zinc-400">
              Instant Bot Invite Link
            </span>
            <span className="text-[11px] text-indigo-400 font-mono">Permissions: Administrator (8)</span>
          </div>
          <div className="flex items-center gap-2">
            <input
              type="text"
              readOnly
              value={inviteUrl}
              className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-2 text-xs font-mono text-zinc-300 focus:outline-none"
            />
            <button
              onClick={copyInviteLink}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold bg-zinc-800 hover:bg-zinc-700 text-zinc-200 shrink-0 transition"
            >
              {copiedInvite ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
              {copiedInvite ? 'Copied' : 'Copy'}
            </button>
            <a
              href={inviteUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 px-3 py-2 rounded-lg text-xs font-semibold bg-indigo-600 hover:bg-indigo-500 text-white shrink-0 transition"
            >
              Invite <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>
        </div>

        <div className="p-4 rounded-xl bg-zinc-950/80 border border-zinc-800 flex flex-col justify-between space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-xs font-bold uppercase tracking-wider text-zinc-400">
                Global Slash Commands & CLI Doctor
              </div>
              <p className="text-[11px] text-zinc-500 mt-0.5">
                Push all slash commands to Discord or run <code className="text-indigo-300">npm run doctor</code> in terminal.
              </p>
            </div>
            <button
              onClick={handleSyncSlashCommands}
              disabled={syncingCommands}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-semibold bg-emerald-600 hover:bg-emerald-500 text-white transition disabled:opacity-50 shrink-0"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${syncingCommands ? 'animate-spin' : ''}`} />
              {syncingCommands ? 'Syncing...' : 'Sync Slash Commands'}
            </button>
          </div>
          <div className="text-[11px] font-mono bg-zinc-900/90 border border-zinc-800/80 rounded-lg px-3 py-1.5 text-zinc-400 flex items-center justify-between">
            <span>$ npx tsx scripts/zenith-easy.ts doctor</span>
            <span className="text-emerald-400">CLI Ready</span>
          </div>
        </div>
      </div>
    </div>
  );
};
export default EasySetupWidget;
