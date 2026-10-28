import { execFile } from 'child_process';
import { promisify } from 'util';
import fs from 'fs';
import path from 'path';

const execFileAsync = promisify(execFile);

export interface GitHubSyncState {
  configured: boolean;
  owner: string;
  repoName: string;
  fullName: string;
  repoUrl: string;
  branch: string;
  lastCommitSha: string;
  lastCommitMessage: string;
  lastPushedAt: string | null;
  status: 'idle' | 'syncing' | 'synced' | 'error';
  lastError?: string;
  totalPushes: number;
  autoPushOnChange: boolean;
}

const DEFAULT_REPO_NAME = process.env.GITHUB_REPO_NAME || 'Zenith-Bot-V2';

let githubSyncState: GitHubSyncState = {
  configured: Boolean(getGitHubToken()),
  owner: 'tejasmeet-code',
  repoName: DEFAULT_REPO_NAME,
  fullName: `tejasmeet-code/${DEFAULT_REPO_NAME}`,
  repoUrl: `https://github.com/tejasmeet-code/${DEFAULT_REPO_NAME}`,
  branch: 'main',
  lastCommitSha: '',
  lastCommitMessage: '',
  lastPushedAt: null,
  status: 'idle',
  totalPushes: 0,
  autoPushOnChange: true,
};

let activePushPromise: Promise<GitHubSyncState> | null = null;

export function getGitHubToken(): string {
  return (
    process.env['Github_token'] ||
    process.env.GITHUB_TOKEN ||
    process.env.GH_TOKEN ||
    ''
  ).trim();
}

export function getGitHubSyncState(): GitHubSyncState {
  githubSyncState.configured = Boolean(getGitHubToken());
  return { ...githubSyncState };
}

async function runGitCommand(args: string[], cwd: string): Promise<{ stdout: string; stderr: string }> {
  const { stdout, stderr } = await execFileAsync('git', args, {
    cwd,
    env: { ...process.env, GIT_TERMINAL_PROMPT: '0' },
    maxBuffer: 10 * 1024 * 1024,
  });
  return { stdout: stdout.trim(), stderr: stderr.trim() };
}

export async function ensureGitHubRepoExists(
  customRepoName?: string
): Promise<{ owner: string; repoName: string; htmlUrl: string }> {
  const token = getGitHubToken();
  if (!token) {
    throw new Error('GitHub token (Github_token) is not configured in environment secrets.');
  }

  const repoName = (customRepoName || githubSyncState.repoName || DEFAULT_REPO_NAME)
    .trim()
    .replace(/[^a-zA-Z0-9._-]/g, '-');

  const headers: Record<string, string> = {
    Authorization: `Bearer ${token}`,
    Accept: 'application/vnd.github+json',
    'User-Agent': 'Zenith-Bot-Control-Plane',
    'X-GitHub-Api-Version': '2022-11-28',
  };

  // 1. Get authenticated GitHub user
  const userRes = await fetch('https://api.github.com/user', { headers });
  if (!userRes.ok) {
    const errText = await userRes.text();
    throw new Error(`GitHub authentication failed (${userRes.status}): ${errText}`);
  }
  const userData: any = await userRes.json();
  const owner = userData.login || 'tejasmeet-code';

  // 2. Check if repository already exists
  const checkRes = await fetch(`https://api.github.com/repos/${owner}/${repoName}`, { headers });
  if (checkRes.ok) {
    const repoData: any = await checkRes.json();
    githubSyncState.owner = owner;
    githubSyncState.repoName = repoName;
    githubSyncState.fullName = `${owner}/${repoName}`;
    githubSyncState.repoUrl = repoData.html_url || `https://github.com/${owner}/${repoName}`;
    return { owner, repoName, htmlUrl: githubSyncState.repoUrl };
  }

  // 3. Create new repository if it does not exist
  const createRes = await fetch('https://api.github.com/user/repos', {
    method: 'POST',
    headers: {
      ...headers,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      name: repoName,
      description:
        'Zenith Discord Bot & Web Control Plane — Full-Stack Production Repository (Heaven Cloud 24/7 + AI Studio)',
      private: false,
      auto_init: false,
    }),
  });

  if (!createRes.ok && createRes.status !== 422) {
    const errText = await createRes.text();
    throw new Error(`Failed to create GitHub repository ${owner}/${repoName} (${createRes.status}): ${errText}`);
  }

  const htmlUrl = `https://github.com/${owner}/${repoName}`;
  githubSyncState.owner = owner;
  githubSyncState.repoName = repoName;
  githubSyncState.fullName = `${owner}/${repoName}`;
  githubSyncState.repoUrl = htmlUrl;

  return { owner, repoName, htmlUrl };
}

export async function syncCodeToGitHub(options?: {
  commitMessage?: string;
  repoName?: string;
  cwd?: string;
}): Promise<GitHubSyncState> {
  if (activePushPromise) {
    return activePushPromise;
  }

  activePushPromise = (async () => {
    const token = getGitHubToken();
    const cwd = options?.cwd || process.cwd();
    githubSyncState.configured = Boolean(token);

    if (!token) {
      githubSyncState.status = 'error';
      githubSyncState.lastError = 'Missing Github_token secret in environment.';
      return { ...githubSyncState };
    }

    try {
      githubSyncState.status = 'syncing';
      githubSyncState.lastError = undefined;

      const { owner, repoName, htmlUrl } = await ensureGitHubRepoExists(options?.repoName);
      const remoteUrl = `https://x-access-token:${token}@github.com/${owner}/${repoName}.git`;

      // Ensure .gitignore exists so node_modules / .env / dist are never committed
      const gitignorePath = path.join(cwd, '.gitignore');
      if (!fs.existsSync(gitignorePath)) {
        fs.writeFileSync(
          gitignorePath,
          'node_modules/\ndist/\n.env\n.env.*\n!.env.example\n.playwright-cli/\n*.log\n.DS_Store\nindex.js\n',
          'utf8'
        );
      }

      // Initialize git repo if needed
      const gitDir = path.join(cwd, '.git');
      if (!fs.existsSync(gitDir)) {
        await runGitCommand(['init', '-b', 'main'], cwd);
      }

      const authorName = process.env.GIT_AUTHOR_NAME || 'demonxtejas';
      const authorEmail = process.env.GIT_AUTHOR_EMAIL || 'bot@zenith.local';
      await runGitCommand(['config', 'user.name', authorName], cwd);
      await runGitCommand(['config', 'user.email', authorEmail], cwd);

      // Ensure branch is main
      await runGitCommand(['checkout', '-B', 'main'], cwd).catch(() => {});

      // Stage all changes respecting .gitignore
      await runGitCommand(['add', '-A'], cwd);

      const commitMsg =
        options?.commitMessage?.trim() ||
        `Zenith Auto-Deploy Sync (${new Date().toISOString()})`;

      // Check if there are staged changes or if no commits exist yet
      let hasHead = true;
      try {
        await runGitCommand(['rev-parse', '--verify', 'HEAD'], cwd);
      } catch {
        hasHead = false;
      }

      const { stdout: statusOut } = await runGitCommand(['status', '--porcelain'], cwd);
      if (!hasHead || statusOut.length > 0) {
        await runGitCommand(['commit', '-m', commitMsg, '--allow-empty'], cwd);
      }

      // Configure remote origin and push inside try/finally to guarantee token scrubbing
      try {
        await runGitCommand(['remote', 'remove', 'origin'], cwd);
      } catch {
        // origin didn't exist yet
      }
      await runGitCommand(['remote', 'add', 'origin', remoteUrl], cwd);

      try {
        await runGitCommand(['push', '-u', 'origin', 'main', '--force'], cwd);
      } finally {
        // Scrub token from stored .git/config after push regardless of success or failure
        await runGitCommand(['remote', 'set-url', 'origin', `https://github.com/${owner}/${repoName}.git`], cwd).catch(
          () => {}
        );
      }

      const { stdout: shaOut } = await runGitCommand(['rev-parse', '--short', 'HEAD'], cwd);

      githubSyncState = {
        ...githubSyncState,
        configured: true,
        owner,
        repoName,
        fullName: `${owner}/${repoName}`,
        repoUrl: htmlUrl,
        branch: 'main',
        lastCommitSha: shaOut || 'HEAD',
        lastCommitMessage: commitMsg,
        lastPushedAt: new Date().toISOString(),
        status: 'synced',
        lastError: undefined,
        totalPushes: githubSyncState.totalPushes + 1,
      };

      return { ...githubSyncState };
    } catch (err: any) {
      githubSyncState.status = 'error';
      githubSyncState.lastError = err?.message || String(err);
      console.error('[GITHUB AUTO-SYNC ERROR]:', githubSyncState.lastError);
      return { ...githubSyncState };
    } finally {
      activePushPromise = null;
    }
  })();

  return activePushPromise;
}

export function triggerBackgroundGitHubPush(reason: string): void {
  if (!getGitHubToken() || !githubSyncState.autoPushOnChange) return;
  syncCodeToGitHub({ commitMessage: `Zenith Auto-Sync: ${reason}` }).catch((err) => {
    console.warn('[GITHUB BG PUSH WARN]:', err?.message || err);
  });
}
