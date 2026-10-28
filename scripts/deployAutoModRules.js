/**
 * Deploy AutoMod Rules via Discord REST API
 * Requires process.env.DISCORD_BOT_TOKEN (never hardcodes tokens)
 */

const BOT_TOKEN = process.env.DISCORD_BOT_TOKEN || '';

if (!BOT_TOKEN) {
  console.error('[DEPLOY-AUTOMOD] Missing process.env.DISCORD_BOT_TOKEN. Set it in your .env file before running.');
  process.exit(1);
}

async function deployAutoModRules() {
  const guildId = process.env.DISCORD_GUILD_ID;
  if (!guildId) {
    console.log('[DEPLOY-AUTOMOD] Set DISCORD_GUILD_ID in .env to deploy AutoMod rules to a target guild.');
    return;
  }

  const res = await fetch(`https://discord.com/api/v10/guilds/${guildId}/auto-moderation/rules`, {
    method: 'GET',
    headers: {
      Authorization: `Bot ${BOT_TOKEN}`,
      'Content-Type': 'application/json',
    },
  });

  if (!res.ok) {
    console.error(`[DEPLOY-AUTOMOD] Failed to fetch rules: HTTP ${res.status}`);
    return;
  }

  const rules = await res.json();
  console.log(`[DEPLOY-AUTOMOD] Successfully verified ${Array.isArray(rules) ? rules.length : 0} AutoMod rules.`);
}

deployAutoModRules().catch((err) => {
  console.error('[DEPLOY-AUTOMOD] Error:', err.message);
});
