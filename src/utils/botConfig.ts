/**
 * Common Config / Env for Bot Identity and Help Customization
 * Bot Name: Zenith
 * Avatar and Banner fetched directly from Discord Developer Portal API
 */

export interface BotConfig {
  botName: string;
  botPrefix: string;
  prefix?: string;
  owners: string[];
  developer: string;
  clientId: string;
  ownerId: string;
  botToken: string;
  supportServer: string;
  dashboardUrl?: string;
  description?: string;
  embedThumbnail: string;
  embedBanner: string;
  embedColor: number;
  avatarHash?: string;
  bannerHash?: string;
}

export const DEFAULT_BOT_CONFIG: BotConfig = {
  botName: 'Zenith',
  botPrefix: '.',
  prefix: '.',
  owners: ['demonxtejas (1181221352393420856)'],
  developer: 'demonxtejas',
  clientId: '1553292201835102278',
  ownerId: '1181221352393420856',
  botToken: typeof process !== 'undefined' && process.env?.DISCORD_BOT_TOKEN ? process.env.DISCORD_BOT_TOKEN : '',
  supportServer: 'https://discord.gg/gFgAfpSYdp',
  dashboardUrl: 'https://demonzenith.ai.studio',
  description: 'Zenith Bot - The ultimate high-performance Discord management, moderation, music, and AI operations system.\n\nDashboard: https://demonzenith.ai.studio\nSupport: https://discord.gg/gFgAfpSYdp',
  avatarHash: '286d052869b71984debd082f899177be',
  bannerHash: '01ff0f219c447b92b2d3cd573a42d8f4',
  embedThumbnail: 'https://cdn.discordapp.com/avatars/1553292201835102278/286d052869b71984debd082f899177be.png?size=256',
  embedBanner: 'https://cdn.discordapp.com/banners/1553292201835102278/01ff0f219c447b92b2d3cd573a42d8f4.png?size=600',
  embedColor: 0x5865f2,
};
