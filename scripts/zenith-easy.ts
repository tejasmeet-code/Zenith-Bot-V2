#!/usr/bin/env tsx
/**
 * ============================================================================
 * ZENITH / AETHERIS - ALL-IN-ONE "EASY SUITE" CLI & DOCTOR UTILITY
 * ============================================================================
 * Usage:
 *   npx tsx scripts/zenith-easy.ts doctor          - Run full system & security health check
 *   npx tsx scripts/zenith-easy.ts setup-env       - Auto-generate & validate .env file
 *   npx tsx scripts/zenith-easy.ts sanitize-keys   - Scrub leaked tokens from .git/config
 *   npx tsx scripts/zenith-easy.ts sync-commands   - Register all Slash Commands globally
 *   npx tsx scripts/zenith-easy.ts mock-gateway    - Launch local offline Discord Gateway simulator
 *   npx tsx scripts/zenith-easy.ts watchdog        - Run server.ts with auto-restart & crash recovery
 *   npx tsx scripts/zenith-easy.ts start           - Validate environment & boot server cleanly
 * ============================================================================
 */

import fs from 'fs';
import path from 'path';
import { execSync, spawn } from 'child_process';
import dotenv from 'dotenv';

dotenv.config();

const ROOT_DIR = process.cwd();
const ENV_PATH = path.join(ROOT_DIR, '.env');
const ENV_EXAMPLE_PATH = path.join(ROOT_DIR, '.env.example');
const GIT_CONFIG_PATH = path.join(ROOT_DIR, '.git', 'config');
const FIREBASE_CONFIG_PATH = path.join(ROOT_DIR, 'firebase-applet-config.json');

const C = {
  reset: '\x1b[0m',
  bold: '\x1b[1m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  red: '\x1b[31m',
  cyan: '\x1b[36m',
  magenta: '\x1b[35m',
  gray: '\x1b[90m',
};

const log = {
  info: (msg: string) => console.log(`${C.cyan}[INFO]${C.reset} ${msg}`),
  ok: (msg: string) => console.log(`${C.green}[PASS]${C.reset} ${msg}`),
  warn: (msg: string) => console.log(`${C.yellow}[WARN]${C.reset} ${msg}`),
  err: (msg: string) => console.log(`${C.red}[FAIL]${C.reset} ${msg}`),
  title: (msg: string) =>
    console.log(`\n${C.bold}${C.magenta}=== ${msg} ===${C.reset}`),
};

export async function runDoctor(): Promise<boolean> {
  log.title('ZENITH SYSTEM DOCTOR & HEALTH AUDIT');
  let issues = 0;

  const nodeMajor = parseInt(process.versions.node.split('.')[0], 10);
  if (nodeMajor >= 18) {
    log.ok(`Node.js Runtime: v${process.versions.node} (Supported)`);
  } else {
    log.err(`Node.js Runtime: v${process.versions.node} (Requires Node >= 18)`);
    issues++;
  }

  let ffmpegAvailable = false;
  try {
    const ffmpegStatic = await import('ffmpeg-static').catch(() => null);
    if (ffmpegStatic?.default && fs.existsSync(ffmpegStatic.default as unknown as string)) {
      log.ok(`FFmpeg Audio Engine: Ready (ffmpeg-static binary located)`);
      ffmpegAvailable = true;
    }
  } catch {}

  if (!ffmpegAvailable) {
    try {
      execSync('ffmpeg -version', { stdio: 'ignore' });
      log.ok('FFmpeg Audio Engine: Ready (System PATH)');
    } catch {
      log.warn('FFmpeg Audio Engine: Not found in PATH or ffmpeg-static. Voice playback may fail.');
      issues++;
    }
  }

  if (!fs.existsSync(ENV_PATH)) {
    log.warn('.env file is missing! Run: `npx tsx scripts/zenith-easy.ts setup-env`');
    issues++;
  } else {
    log.ok('.env configuration file present.');
  }

  const requiredEnv = ['DISCORD_BOT_TOKEN'];
  const optionalEnv = ['GEMINI_API_KEY', 'DISCORD_CLIENT_SECRET', 'GITHUB_TOKEN', 'HEAVEN_CLOUD_API_KEY'];

  for (const key of requiredEnv) {
    if (process.env[key] && process.env[key]!.trim().length > 10) {
      log.ok(`Env Variable [${key}]: Configured`);
    } else {
      log.err(`Env Variable [${key}]: MISSING or INVALID (Required for Discord Bot login)`);
      issues++;
    }
  }

  for (const key of optionalEnv) {
    if (process.env[key] && process.env[key]!.trim().length > 0) {
      log.ok(`Optional Env [${key}]: Configured`);
    } else {
      log.warn(`Optional Env [${key}]: Not set (Corresponding feature will run in fallback/offline mode)`);
    }
  }

  const isHeavenCloud = process.env.HEAVEN_CLOUD === 'true';
  const enableGateway = process.env.ENABLE_BOT_GATEWAY === 'true';
  if (isHeavenCloud || enableGateway) {
    log.ok(`Discord Gateway Mode: ACTIVE (Bot will respond to live Discord events)`);
  } else {
    log.warn(
      `Discord Gateway Mode: DISABLED (Dashboard-Only Mode). Set ENABLE_BOT_GATEWAY=true in .env to run the bot locally.`
    );
  }

  if (fs.existsSync(GIT_CONFIG_PATH)) {
    const gitCfg = fs.readFileSync(GIT_CONFIG_PATH, 'utf-8');
    if (/ghp_[a-zA-Z0-9]+|github_pat_[a-zA-Z0-9_]+/.test(gitCfg)) {
      log.err('SECURITY ALERT: Plaintext GitHub PAT detected in .git/config! Run `sanitize-keys` immediately.');
      issues++;
    } else {
      log.ok('Git Config Security: Clean (No plaintext tokens in remote URL)');
    }
  }

  if (fs.existsSync(FIREBASE_CONFIG_PATH)) {
    log.ok('Firebase Config: firebase-applet-config.json found.');
  } else {
    log.warn('Firebase Config: firebase-applet-config.json missing (Firestore will use local JSON fallback).');
  }

  console.log('\n--------------------------------------------------');
  if (issues === 0) {
    log.ok('ALL CRITICAL CHECKS PASSED! System is healthy and ready to boot.');
    return true;
  } else {
    log.warn(`Doctor completed with ${issues} attention item(s). Review warnings above.`);
    return false;
  }
}

export function setupEnv(): void {
  log.title('ZENITH ENVIRONMENT BOOTSTRAPPER');

  const defaultTemplate = `# ==========================================================
# ZENITH / AETHERIS CONFIGURATION (.env)
# ==========================================================

# 1. Discord Bot Credentials (Required)
DISCORD_BOT_TOKEN=""
DISCORD_CLIENT_ID="1553292201835102278"
DISCORD_CLIENT_SECRET=""
DISCORD_REDIRECT_URI="http://localhost:3000/auth/callback"

# 2. Local Gateway Toggle (Set to "true" to run the Discord Bot locally)
ENABLE_BOT_GATEWAY="true"
HEAVEN_CLOUD="false"
TEST_MODE="false"

# 3. AI & External Integrations
GEMINI_API_KEY=""
GITHUB_TOKEN=""
HEAVEN_CLOUD_API_KEY=""

# 4. Git Sync Author Identity
GIT_AUTHOR_NAME="demonxtejas"
GIT_AUTHOR_EMAIL="bot@zenith.local"
`;

  if (!fs.existsSync(ENV_PATH)) {
    const sourceContent = fs.existsSync(ENV_EXAMPLE_PATH)
      ? fs.readFileSync(ENV_EXAMPLE_PATH, 'utf-8')
      : defaultTemplate;
    fs.writeFileSync(ENV_PATH, sourceContent, 'utf-8');
    log.ok('Created .env file! Please populate DISCORD_BOT_TOKEN and GEMINI_API_KEY.');
  } else {
    let currentEnv = fs.readFileSync(ENV_PATH, 'utf-8');
    if (!currentEnv.includes('ENABLE_BOT_GATEWAY')) {
      currentEnv += '\nENABLE_BOT_GATEWAY="true"\n';
      fs.writeFileSync(ENV_PATH, currentEnv, 'utf-8');
      log.ok('Added ENABLE_BOT_GATEWAY="true" to existing .env file.');
    } else {
      log.info('.env file already exists and is up to date.');
    }
  }
}

export function sanitizeKeys(): void {
  log.title('ZENITH CREDENTIAL SANITIZER');

  if (fs.existsSync(GIT_CONFIG_PATH)) {
    const content = fs.readFileSync(GIT_CONFIG_PATH, 'utf-8');
    const sanitized = content.replace(
      /https:\/\/[^@]+@github\.com\//g,
      'https://github.com/'
    );
    if (content !== sanitized) {
      fs.writeFileSync(GIT_CONFIG_PATH, sanitized, 'utf-8');
      log.ok('Scrubbed embedded GitHub token from .git/config!');
    } else {
      log.ok('.git/config is already clean.');
    }
  }

  const gitignorePath = path.join(ROOT_DIR, '.gitignore');
  if (fs.existsSync(gitignorePath)) {
    let gi = fs.readFileSync(gitignorePath, 'utf-8');
    const requiredIgnores = ['.env', 'firebase-applet-config.json', '*.log'];
    let updated = false;
    for (const item of requiredIgnores) {
      if (!gi.includes(item)) {
        gi += `\n${item}`;
        updated = true;
      }
    }
    if (updated) {
      fs.writeFileSync(gitignorePath, gi + '\n', 'utf-8');
      log.ok('Updated .gitignore to protect sensitive credential files.');
    }
  }
}

export async function syncCommandsCli(): Promise<void> {
  log.title('GLOBAL SLASH COMMAND SYNCHRONIZER');
  const token = process.env.DISCORD_BOT_TOKEN;
  const clientId = process.env.DISCORD_CLIENT_ID || '1553292201835102278';

  if (!token) {
    log.err('Cannot sync commands: DISCORD_BOT_TOKEN is missing from .env');
    process.exit(1);
  }

  try {
    const { REST, Routes } = await import('discord.js');
    const { DEFAULT_COMMANDS } = await import('../src/utils/botLogic.ts');

    const seen = new Set<string>();
    const payload = DEFAULT_COMMANDS.filter((c: any) => {
      const name = c.name.toLowerCase().replace(/[^a-z0-9_-]/g, '');
      if (!name || seen.has(name)) return false;
      seen.add(name);
      return true;
    }).map((c: any) => ({
      name: c.name.toLowerCase().replace(/[^a-z0-9_-]/g, ''),
      description: (c.description || `Execute ${c.name}`).slice(0, 95),
    }));

    log.info(`Pushing ${payload.length} slash commands to Discord Application (${clientId})...`);
    const rest = new REST({ version: '10' }).setToken(token);
    await rest.put(Routes.applicationCommands(clientId), { body: payload });
    log.ok(`Successfully registered ${payload.length} global slash commands!`);
  } catch (err: any) {
    log.err(`Slash Command Sync Failed: ${err.message}`);
  }
}

export async function runMockGateway(): Promise<void> {
  log.title('ZENITH OFFLINE GATEWAY SIMULATOR');
  const { processCommandInput, DEFAULT_COMMANDS, DEFAULT_AUTOMOD_RULES, DEFAULT_ANTINUKE_CONFIG } =
    await import('../src/utils/botLogic.ts');
  const { DEFAULT_BOT_CONFIG } = await import('../src/utils/botConfig.ts');

  const testCases = [
    '.help',
    '.ping',
    '.antinuke status',
    '.play Starboy The Weeknd',
    '.ban @Spammer#0001 Raiding channels',
    'check out https://discord.gg/unauthorized-invite',
  ];

  for (const input of testCases) {
    console.log(`\n${C.cyan}> User Input:${C.reset} "${input}"`);
    const res = processCommandInput(
      input,
      DEFAULT_COMMANDS,
      DEFAULT_AUTOMOD_RULES,
      DEFAULT_BOT_CONFIG,
      DEFAULT_ANTINUKE_CONFIG,
      {
        id: '1181221352393420856',
        tag: 'demonxtejas#0001',
        guildId: 'mock_guild_1',
        guildOwnerId: '1181221352393420856',
        hasAdmin: true,
        isOwner: true,
      }
    );
    console.log(`${C.green}< Bot Reply:${C.reset} ${res.content}`);
    if (res.embed?.title) {
      console.log(`${C.gray}  [Embed]: ${res.embed.title} - ${res.embed.description?.slice(0, 100)}...${C.reset}`);
    }
  }
  log.ok('Offline Gateway simulation completed.');
}

export function runWatchdog(): void {
  log.title('ZENITH 24/7 AUTO-RECOVERY WATCHDOG');
  let restarts = 0;

  const launch = () => {
    log.info(`Starting Zenith Server (Attempt #${restarts + 1})...`);
    const child = spawn('npx', ['tsx', 'server.ts'], {
      stdio: 'inherit',
      env: { ...process.env, ENABLE_BOT_GATEWAY: process.env.ENABLE_BOT_GATEWAY || 'true' },
    });

    child.on('exit', (code) => {
      if (code === 0) {
        log.info('Server exited cleanly (code 0). Stopping watchdog.');
        process.exit(0);
      }
      restarts++;
      const delay = Math.min(30000, restarts * 3000);
      log.warn(`Server crashed with exit code ${code}. Restarting in ${delay / 1000}s...`);
      setTimeout(launch, delay);
    });
  };

  launch();
}

async function main() {
  const cmd = process.argv[2] || 'doctor';
  switch (cmd) {
    case 'doctor':
      await runDoctor();
      break;
    case 'setup-env':
      setupEnv();
      break;
    case 'sanitize-keys':
      sanitizeKeys();
      break;
    case 'sync-commands':
      await syncCommandsCli();
      break;
    case 'mock-gateway':
      await runMockGateway();
      break;
    case 'watchdog':
      runWatchdog();
      break;
    case 'start':
      setupEnv();
      sanitizeKeys();
      await runDoctor();
      runWatchdog();
      break;
    default:
      console.log(`Unknown command: ${cmd}`);
      console.log('Available commands: doctor | setup-env | sanitize-keys | sync-commands | mock-gateway | watchdog | start');
  }
}

main().catch((err) => {
  console.error('[ZENITH EASY ERROR]:', err);
  process.exit(1);
});
