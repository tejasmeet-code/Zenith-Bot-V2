/**
 * Deploy Zenith Bot to Heaven Cloud Node (ab1dac28)
 * Requires process.env.HEAVEN_CLOUD_API_KEY and process.env.DISCORD_BOT_TOKEN
 */

const HEAVEN_API_KEY = process.env.HEAVEN_CLOUD_API_KEY || '';
const SERVER_ID = process.env.HEAVEN_CLOUD_SERVER_ID || 'ab1dac28';
const DISCORD_TOKEN = process.env.DISCORD_BOT_TOKEN || '';

if (!HEAVEN_API_KEY) {
  console.error('[HEAVEN-DEPLOY] Missing process.env.HEAVEN_CLOUD_API_KEY in .env.');
  process.exit(1);
}

async function deployToHeavenCloud() {
  console.log(`[HEAVEN-DEPLOY] Triggering restart on Heaven Cloud Node ${SERVER_ID}...`);
  const res = await fetch(`https://dash.heavencloud.in/api/client/servers/${SERVER_ID}/power`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${HEAVEN_API_KEY}`,
      Accept: 'application/json',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ signal: 'restart' }),
  });

  if (res.ok || res.status === 204) {
    console.log(`[HEAVEN-DEPLOY] Node ${SERVER_ID} restarted successfully. Discord Token Present: ${Boolean(DISCORD_TOKEN)}`);
  } else {
    console.error(`[HEAVEN-DEPLOY] Power signal returned HTTP ${res.status}`);
  }
}

deployToHeavenCloud().catch((err) => {
  console.error('[HEAVEN-DEPLOY] Deployment error:', err.message);
});
