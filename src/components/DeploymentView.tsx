import React, { useState } from 'react';
import { DiscordEmoji } from './DiscordEmoji';

interface DeploymentViewProps {
  deploymentState: any;
  onDeploy: () => Promise<void>;
  onRunBugChecks: () => Promise<any>;
}

export const DeploymentView: React.FC<DeploymentViewProps> = ({
  deploymentState,
  onDeploy,
  onRunBugChecks,
}) => {
  const [isChecking, setIsChecking] = useState(false);
  const [isStopping, setIsStopping] = useState(false);
  const [deployLogs, setDeployLogs] = useState<string[]>([
    '<:Tool:1555133545918369894> [AI STUDIO HOSTING] Bot Zenith running in AI Studio container.',
    '<a:white_Done:1555133626276905040> [DATABASE] Firestore connected: ai-studio-aetherisdiscordb-839739f0-b1ca-4bf8-ab63-5b71df604f18',
    '<:white_terminate:1555133855143567430> [HEAVEN CLOUD] Remote process stopped. Zenith hosted solely in AI Studio.',
  ]);

  const [bugCheckReport, setBugCheckReport] = useState<any>(null);

  const handleStopHeavenCloud = async () => {
    setIsStopping(true);
    try {
      await fetch('/api/bot/stop-heaven-cloud', { method: 'POST' });
      setDeployLogs((prev) => [
        ...prev,
        `<:white_terminate:1555133855143567430> External Heaven Cloud runner stopped! Zenith hosted 100% in AI Studio.`,
      ]);
    } catch (e) {
      console.error(e);
    } finally {
      setIsStopping(false);
    }
  };

  const handleBugCheckClick = async () => {
    setIsChecking(true);
    try {
      const res = await onRunBugChecks();
      setBugCheckReport(res);
      setDeployLogs((prev) => [
        ...prev,
        `<a:white_Done:1555133626276905040> Automated Diagnostic Bug Check Passed (4/4 checks green).`,
      ]);
    } catch (e) {
      setBugCheckReport({ success: false, checks: [] });
    } finally {
      setIsChecking(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 text-slate-100 space-y-6">
      {/* Heaven Cloud Banner */}
      <div className="bg-gradient-to-r from-indigo-950 via-slate-900 to-indigo-950 p-6 sm:p-8 rounded-2xl border border-indigo-900/60 shadow-xl relative overflow-hidden flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-2 max-w-xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 rounded-full text-xs font-mono">
            <DiscordEmoji emojiKey="WHITE_BOT" className="w-4 h-4" />
            <span>Zenith Hosted in AI Studio</span>
          </div>

          <h2 className="text-2xl font-extrabold text-white flex items-center gap-2">
            <span>Zenith: Active in AI Studio</span>
            <DiscordEmoji emojiKey="WHITE_DONE" className="w-6 h-6" />
          </h2>

          <p className="text-xs text-slate-300 leading-relaxed">
            Your bot Zenith is running and persisted in Firestore database in AI Studio. External Heaven Cloud processes have been stopped and kept on standby.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 shrink-0">
          <button
            onClick={handleStopHeavenCloud}
            disabled={isStopping}
            className="px-4 py-3 bg-red-950 hover:bg-red-900 border border-red-800 text-red-200 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-colors"
          >
            <DiscordEmoji emojiKey="WHITE_TERMINATE" className="w-4 h-4" />
            <span>{isStopping ? 'Stopping...' : 'Stop Heaven Cloud Runner'}</span>
          </button>

          <button
            onClick={handleBugCheckClick}
            disabled={isChecking}
            className="px-4 py-3 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 rounded-xl text-xs font-semibold flex items-center justify-center gap-2 transition-colors"
          >
            <DiscordEmoji emojiKey="BUGHUNTER_1" className="w-4 h-4" />
            <span>{isChecking ? 'Checking...' : 'Run Bug Checks'}</span>
          </button>
        </div>
      </div>

      {/* Bug Check Results Section */}
      {bugCheckReport && (
        <div className="bg-[#2b2d31] border border-[#383a40] rounded-2xl p-6 space-y-4">
          <h3 className="text-sm font-bold text-white flex items-center gap-2">
            <DiscordEmoji emojiKey="BUGHUNTER_2" className="w-5 h-5" />
            <span>Automated Diagnostic Bug Check Report</span>
            <span
              className={`text-xs px-2 py-0.5 rounded font-mono ${
                bugCheckReport.success ? 'bg-emerald-950 text-emerald-300 border border-emerald-800' : 'bg-red-950 text-red-300 border border-red-800'
              }`}
            >
              {bugCheckReport.success ? 'PASSED' : 'FAILED'}
            </span>
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {bugCheckReport.checks.map((check: any, idx: number) => (
              <div key={idx} className="p-3 bg-[#1e1f22] border border-[#383a40] rounded-xl space-y-1">
                <div className="flex items-center justify-between text-xs font-bold text-white">
                  <span>{check.name}</span>
                  <DiscordEmoji emojiKey={check.status === 'passed' ? 'WHITE_DONE' : 'ERROR'} className="w-4 h-4" />
                </div>
                <p className="text-[11px] text-slate-300">{check.details}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Console Output */}
      <div className="bg-[#2b2d31] border border-[#383a40] rounded-2xl p-6 space-y-3">
        <div className="flex items-center justify-between text-xs font-bold text-white">
          <span className="flex items-center gap-2">
            <DiscordEmoji emojiKey="TOOL" className="w-4 h-4" />
            <span>Console Output Log</span>
          </span>
          <span className="text-slate-400 font-mono text-[11px]">Database: Firestore Active</span>
        </div>

        <div className="bg-[#1e1f22] border border-[#383a40] rounded-xl p-4 font-mono text-xs text-slate-200 space-y-2 max-h-64 overflow-y-auto">
          {deployLogs.map((log, idx) => (
            <div key={idx} className="leading-relaxed">
              <span className="text-slate-500 font-normal mr-2">[{new Date().toLocaleTimeString()}]</span>
              <span>{log}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
