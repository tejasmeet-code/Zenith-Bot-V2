import test from 'node:test';
import assert from 'node:assert/strict';
import {
  processCommandInput,
  runBugChecks,
  generateAntiNukeConfigEmbed,
  generateBotPingEmbed,
  generateGuildWelcomeEmbed,
  DEFAULT_COMMANDS,
  DEFAULT_AUTOMOD_RULES,
  DEFAULT_ANTINUKE_CONFIG,
  getGuildAntiNukeConfig,
} from './botLogic.ts';
import { DEFAULT_BOT_CONFIG } from './botConfig.ts';
import {
  getGuildMusicState,
  enqueueOrPlayTrack,
  advanceGuildQueue,
  rewindGuildQueue,
  stopGuildMusic,
  scoreTrackCandidate,
  resolvePlayableStreamUrl,
  smartSearchTrack,
  buildNowPlayingEmbed,
  buildFfmpegFilterGraph,
  computeAmplifiedVolume,
} from './lavalinkManager.ts';

test('processCommandInput routes slash /ping command correctly', () => {
  const result = processCommandInput('/ping', DEFAULT_COMMANDS, DEFAULT_AUTOMOD_RULES);
  assert.equal(result.isCommand, true);
  assert.match(result.content, /Pong/);
  assert.ok(result.embed);
  assert.equal(result.embed?.title?.includes('Latency'), true);
});

test('processCommandInput triggers Auto-Mod on forbidden keywords', () => {
  const result = processCommandInput('Check out this free nitro scam link!', DEFAULT_COMMANDS, DEFAULT_AUTOMOD_RULES);
  assert.equal(result.autoModTriggered, true);
  assert.match(result.content, /Auto-Mod Triggered/);
});

test('processCommandInput handles bot mention / ping telling about itself & prefix in embed', () => {
  const result1 = processCommandInput('@Zenith', DEFAULT_COMMANDS, DEFAULT_AUTOMOD_RULES, DEFAULT_BOT_CONFIG);
  assert.equal(result1.isCommand, true);
  assert.ok(result1.embed);
  assert.equal(result1.embed?.title?.includes('Zenith Anti-Nuke Vault Shield'), true);
  assert.ok(result1.embed?.thumbnail?.url);
  assert.ok(result1.embed?.fields?.some((f) => f.name.includes('Bot Prefix')));
  assert.ok(result1.embed?.fields?.some((f) => f.name.includes('How It Works')));

  const result2 = processCommandInput(`<@${DEFAULT_BOT_CONFIG.clientId}>`, DEFAULT_COMMANDS, DEFAULT_AUTOMOD_RULES, DEFAULT_BOT_CONFIG);
  assert.equal(result2.isCommand, true);
  assert.ok(result2.embed);
});

test('generateGuildWelcomeEmbed creates a rich embed for newly joined servers', () => {
  const welcome = generateGuildWelcomeEmbed('Zenith Sanctuary', DEFAULT_BOT_CONFIG);
  assert.ok(welcome.embed);
  assert.match(welcome.content, /Zenith has joined Zenith Sanctuary/);
  assert.equal(welcome.embed.title?.includes('Vault Fortification Active'), true);
  assert.ok(welcome.embed.thumbnail?.url);
  assert.ok((welcome.embed.fields?.length || 0) >= 4);
});

const ownerExecutor = { id: DEFAULT_BOT_CONFIG.ownerId, isOwner: true };

test('processCommandInput handles Anti-Nuke config command with owner permission', () => {
  const result = processCommandInput('.antinuke config', DEFAULT_COMMANDS, DEFAULT_AUTOMOD_RULES, DEFAULT_BOT_CONFIG, DEFAULT_ANTINUKE_CONFIG, ownerExecutor);
  assert.equal(result.isCommand, true);
  assert.ok(result.embed);
  assert.equal(result.embed?.title?.includes('Anti-Nuke Vault Configuration'), true);
  assert.ok(result.dropdownOptions && result.dropdownOptions.length > 5);
});

test('processCommandInput blocks unauthorized non-owner from running Anti-Nuke commands', () => {
  const nonOwnerExecutor = { id: 'random_user_999', guildOwnerId: 'server_owner_888', hasAdmin: false };
  const result = processCommandInput('.antinuke config', DEFAULT_COMMANDS, DEFAULT_AUTOMOD_RULES, DEFAULT_BOT_CONFIG, DEFAULT_ANTINUKE_CONFIG, nonOwnerExecutor);
  assert.equal(result.isCommand, true);
  assert.match(result.content, /Access Denied/);
});

test('generateAntiNukeConfigEmbed renders all mini-modules options', () => {
  const data = generateAntiNukeConfigEmbed(DEFAULT_ANTINUKE_CONFIG);
  assert.ok(data.embed);
  assert.ok(data.dropdownOptions.length >= 16);
});

test('processCommandInput handles .whitelist add user command', () => {
  const result = processCommandInput('.whitelist add user TejasTestUser', DEFAULT_COMMANDS, DEFAULT_AUTOMOD_RULES, DEFAULT_BOT_CONFIG, DEFAULT_ANTINUKE_CONFIG, ownerExecutor);
  assert.equal(result.isCommand, true);
  assert.match(result.content, /Added to Whitelist/);
  assert.ok(result.embed);
});

test('processCommandInput handles .fakeroles scan command', () => {
  const result = processCommandInput('.fakeroles scan', DEFAULT_COMMANDS, DEFAULT_AUTOMOD_RULES, DEFAULT_BOT_CONFIG, DEFAULT_ANTINUKE_CONFIG, ownerExecutor);
  assert.equal(result.isCommand, true);
  assert.match(result.content, /Fake Role & Honeypot Detector Scan Complete/);
});

test('processCommandInput handles .serveradmin add command', () => {
  const result = processCommandInput('.serveradmin add AdminUser123', DEFAULT_COMMANDS, DEFAULT_AUTOMOD_RULES, DEFAULT_BOT_CONFIG, DEFAULT_ANTINUKE_CONFIG, ownerExecutor);
  assert.equal(result.isCommand, true);
  assert.match(result.content, /Server Administrator List Updated/);
});

test('processCommandInput handles .serverowner and .serverstaff commands', () => {
  const resOwner = processCommandInput('.serverowner set 1181221352393420856', DEFAULT_COMMANDS, DEFAULT_AUTOMOD_RULES, DEFAULT_BOT_CONFIG, DEFAULT_ANTINUKE_CONFIG, ownerExecutor);
  assert.equal(resOwner.isCommand, true);
  assert.match(resOwner.content, /Server Owner Status Updated/);

  const resStaff = processCommandInput('.serverstaff add StaffOfficer9', DEFAULT_COMMANDS, DEFAULT_AUTOMOD_RULES, DEFAULT_BOT_CONFIG, DEFAULT_ANTINUKE_CONFIG, ownerExecutor);
  assert.equal(resStaff.isCommand, true);
  assert.match(resStaff.content, /Server Staff List Updated/);
});

test('processCommandInput handles bot trust commands .adminbot, .ticketsbot, .levelingbot', () => {
  const resAdmin = processCommandInput('.adminbot add ShieldBot#0001', DEFAULT_COMMANDS, DEFAULT_AUTOMOD_RULES, DEFAULT_BOT_CONFIG, DEFAULT_ANTINUKE_CONFIG, ownerExecutor);
  assert.equal(resAdmin.isCommand, true);
  assert.match(resAdmin.content, /Authorized Admin Bots Updated/);

  const resTicket = processCommandInput('.ticketsbot add TicketBot#0001', DEFAULT_COMMANDS, DEFAULT_AUTOMOD_RULES, DEFAULT_BOT_CONFIG, DEFAULT_ANTINUKE_CONFIG, ownerExecutor);
  assert.equal(resTicket.isCommand, true);
  assert.match(resTicket.content, /Authorized Ticket Bots Updated/);

  const resLevel = processCommandInput('.levelingbot add LevelXPBot#0001', DEFAULT_COMMANDS, DEFAULT_AUTOMOD_RULES, DEFAULT_BOT_CONFIG, DEFAULT_ANTINUKE_CONFIG, ownerExecutor);
  assert.equal(resLevel.isCommand, true);
  assert.match(resLevel.content, /Authorized Leveling Bots Updated/);
});

test('processCommandInput handles .betrayalguard simulate command', () => {
  const result = processCommandInput('.betrayalguard simulate', DEFAULT_COMMANDS, DEFAULT_AUTOMOD_RULES, DEFAULT_BOT_CONFIG, DEFAULT_ANTINUKE_CONFIG, ownerExecutor);
  assert.equal(result.isCommand, true);
  assert.match(result.content, /Betrayal Guard Scenario Triggered & Neutralized/);
});

test('processCommandInput handles unknown commands gracefully', () => {
  const result = processCommandInput('/nonexistentcommand123', DEFAULT_COMMANDS, DEFAULT_AUTOMOD_RULES);
  assert.equal(result.isCommand, true);
  assert.match(result.content, /Unknown command/);
});

test('runBugChecks passes all checks on default configuration', () => {
  const checkResult = runBugChecks(DEFAULT_COMMANDS, DEFAULT_AUTOMOD_RULES);
  assert.equal(checkResult.success, true);
  assert.ok(checkResult.checks.length >= 3);
});

test('processCommandInput handles .play with smart search & official singer prioritizing', () => {
  const result = processCommandInput('.play Starboy', DEFAULT_COMMANDS, DEFAULT_AUTOMOD_RULES);
  assert.equal(result.isCommand, true);
  assert.match(result.content, /Now Playing on Public Lavalink/);
  assert.ok(result.embed);
  assert.match(result.embed.title || '', /Starboy/);
  assert.ok(result.embed.thumbnail?.url);
  assert.match(result.embed.description || '', /Artist/);
});

test('processCommandInput handles .skip and smart queue / autoplay progression', () => {
  const result = processCommandInput('.skip', DEFAULT_COMMANDS, DEFAULT_AUTOMOD_RULES);
  assert.equal(result.isCommand, true);
  assert.ok(result.embed);
  assert.match(result.content, /Skipped|Autoplay/);
});

test('processCommandInput handles .pause and .resume commands', () => {
  const pauseRes = processCommandInput('.pause', DEFAULT_COMMANDS, DEFAULT_AUTOMOD_RULES);
  assert.equal(pauseRes.isCommand, true);
  assert.match(pauseRes.content, /Playback Paused/);

  const resumeRes = processCommandInput('.resume', DEFAULT_COMMANDS, DEFAULT_AUTOMOD_RULES);
  assert.equal(resumeRes.isCommand, true);
  assert.match(resumeRes.content, /Playback Resumed/);
});

test('processCommandInput handles .speed command', () => {
  const result = processCommandInput('.speed 1.25', DEFAULT_COMMANDS, DEFAULT_AUTOMOD_RULES);
  assert.equal(result.isCommand, true);
  assert.match(result.content, /Playback Speed Set to `1.25x`/);
});

test('processCommandInput handles .autoplay toggle', () => {
  const result = processCommandInput('.autoplay on', DEFAULT_COMMANDS, DEFAULT_AUTOMOD_RULES);
  assert.equal(result.isCommand, true);
  assert.match(result.content, /Autoplay Mode ENABLED/);
});

test('processCommandInput handles .247 voice channel lock', () => {
  const result = processCommandInput('.247 on', DEFAULT_COMMANDS, DEFAULT_AUTOMOD_RULES);
  assert.equal(result.isCommand, true);
  assert.match(result.content, /24\/7 Voice Channel Mode ENABLED/);
  assert.ok(result.embed);
  assert.match(result.embed.description || '', /locked in the voice channel indefinitely/);
});

test('processCommandInput handles .recap 24-hour listening statistics', () => {
  const result = processCommandInput('.recap', DEFAULT_COMMANDS, DEFAULT_AUTOMOD_RULES);
  assert.equal(result.isCommand, true);
  assert.match(result.content, /24-Hour Musical Recap/);
  assert.ok(result.embed);
  assert.ok(result.embed.fields?.some((f) => f.name.includes('Total Songs Streamed')));
});

test('processCommandInput handles .like and .liked songs collection', () => {
  const likeRes = processCommandInput('.like', DEFAULT_COMMANDS, DEFAULT_AUTOMOD_RULES);
  assert.equal(likeRes.isCommand, true);
  assert.match(likeRes.content, /Song Favorited/);

  const likedRes = processCommandInput('.liked', DEFAULT_COMMANDS, DEFAULT_AUTOMOD_RULES);
  assert.equal(likedRes.isCommand, true);
  assert.match(likedRes.content, /Liked Songs Playlist/);
});

test('processCommandInput handles .filter voice effects (8D, Bass Boost)', () => {
  const filter8d = processCommandInput('.filter 8d', DEFAULT_COMMANDS, DEFAULT_AUTOMOD_RULES);
  assert.equal(filter8d.isCommand, true);
  assert.match(filter8d.content, /8D Audio/);

  const filterBass = processCommandInput('.filter bassboost', DEFAULT_COMMANDS, DEFAULT_AUTOMOD_RULES);
  assert.equal(filterBass.isCommand, true);
  assert.match(filterBass.content, /Bass Boost/);
});

test('processCommandInput handles .source platform switcher', () => {
  const result = processCommandInput('.source youtube', DEFAULT_COMMANDS, DEFAULT_AUTOMOD_RULES);
  assert.equal(result.isCommand, true);
  assert.match(result.content, /Default Music Streaming Platform Switched to `YouTube`/);
});

test('processCommandInput handles .quality highest lossless mode', () => {
  const result = processCommandInput('.quality highest', DEFAULT_COMMANDS, DEFAULT_AUTOMOD_RULES);
  assert.equal(result.isCommand, true);
  assert.match(result.content, /Audio Quality Locked at Highest/);
});

test('processCommandInput handles .queue command', () => {
  const result = processCommandInput('.queue', DEFAULT_COMMANDS, DEFAULT_AUTOMOD_RULES);
  assert.equal(result.isCommand, true);
  assert.match(result.content, /Smart Playback Queue/);
  assert.ok(result.embed);
});

test('processCommandInput handles .music 1-page rich console', () => {
  const result = processCommandInput('.music', DEFAULT_COMMANDS, DEFAULT_AUTOMOD_RULES);
  assert.equal(result.isCommand, true);
  assert.match(result.content, /Zenith Hi-Fi Music Console/);
  assert.ok(result.embed);
});

test('processCommandInput handles .cmdchannel command and mode switching', () => {
  const result = processCommandInput('.cmdchannel mode include', DEFAULT_COMMANDS, DEFAULT_AUTOMOD_RULES, DEFAULT_BOT_CONFIG, DEFAULT_ANTINUKE_CONFIG, ownerExecutor);
  assert.equal(result.isCommand, true);
  assert.match(result.content, /Channel Access Mode set to `INCLUDE`/);
  assert.ok(result.embed);

  const addRes = processCommandInput('.cmdchannel include 1234567890', DEFAULT_COMMANDS, DEFAULT_AUTOMOD_RULES, DEFAULT_BOT_CONFIG, DEFAULT_ANTINUKE_CONFIG, ownerExecutor);
  assert.equal(addRes.isCommand, true);
  assert.match(addRes.content, /Added `#1234567890` to Included Channels/);
});

test('help command includes all new music commands under music category', () => {
  const result = processCommandInput('.help music', DEFAULT_COMMANDS, DEFAULT_AUTOMOD_RULES);
  assert.equal(result.isCommand, true);
  assert.ok(result.embed);
  assert.match(result.embed.title || '', /Music/);
  assert.ok(result.embed.fields && result.embed.fields.length >= 10);
});

test('every command has aliases and permissions defined', () => {
  for (const cmd of DEFAULT_COMMANDS) {
    assert.ok(cmd.aliases, `Command ${cmd.name} must have aliases`);
    assert.ok(cmd.aliases.length > 0, `Command ${cmd.name} aliases array must not be empty`);
    assert.ok(cmd.permissions, `Command ${cmd.name} must have permissions specified`);
  }
});

test('running (command) -i, -help, or -info shows command info, work, aliases, and permissions', () => {
  const infoCases = ['.play -i', '.play -help', '.play -info', '.honeypot -i', '.antinuke -help', '.ban -info'];
  for (const input of infoCases) {
    const res = processCommandInput(input, DEFAULT_COMMANDS, DEFAULT_AUTOMOD_RULES);
    assert.equal(res.isCommand, true);
    assert.ok(res.embed, `Expected embed for ${input}`);
    assert.match(res.embed.title || '', /Command Info:/);
    assert.ok(res.embed.fields?.some((f) => f.name.includes('Work')));
    assert.ok(res.embed.fields?.some((f) => f.name.includes('Aliases')));
    assert.ok(res.embed.fields?.some((f) => f.name.includes('Permission Required')));
    assert.ok(res.embed.fields?.some((f) => f.name.includes('Usage Syntax')));
  }
});

test('command aliases route to canonical commands properly', () => {
  // .p -> play
  const resP = processCommandInput('.p Starboy', DEFAULT_COMMANDS, DEFAULT_AUTOMOD_RULES);
  assert.equal(resP.isCommand, true);
  assert.match(resP.content, /Now Playing on Public Lavalink|Added to Queue/);

  // .s -> skip
  const resS = processCommandInput('.s', DEFAULT_COMMANDS, DEFAULT_AUTOMOD_RULES);
  assert.equal(resS.isCommand, true);
  assert.ok(resS.embed);

  // .an -> antinuke
  const resAn = processCommandInput('.an config', DEFAULT_COMMANDS, DEFAULT_AUTOMOD_RULES, DEFAULT_BOT_CONFIG, DEFAULT_ANTINUKE_CONFIG, ownerExecutor);
  assert.equal(resAn.isCommand, true);
  assert.ok(resAn.embed);

  // .hp -> honeypot
  const resHp = processCommandInput('.hp config', DEFAULT_COMMANDS, DEFAULT_AUTOMOD_RULES, DEFAULT_BOT_CONFIG, DEFAULT_ANTINUKE_CONFIG, ownerExecutor);
  assert.equal(resHp.isCommand, true);
  assert.ok(resHp.embed);
  assert.match(resHp.embed.title || '', /Honeypot Trap Security Configuration/);
});

test('Honeypot access control blocks unauthorized members and allows Server Admin+', () => {
  const unauthorizedUser = { id: 'unauth_999', tag: 'RandomUser#0001', guildOwnerId: 'owner_123', hasAdmin: false };
  const adminUser = { id: 'admin_555', tag: 'ServerAdmin#0001', guildOwnerId: 'owner_123', hasAdmin: true };

  // Blocked
  const resBlocked = processCommandInput('.honeypot on', DEFAULT_COMMANDS, DEFAULT_AUTOMOD_RULES, DEFAULT_BOT_CONFIG, DEFAULT_ANTINUKE_CONFIG, unauthorizedUser);
  assert.equal(resBlocked.isCommand, true);
  assert.match(resBlocked.content, /Access Denied/);

  // Allowed for admin
  const resAdmin = processCommandInput('.honeypot on', DEFAULT_COMMANDS, DEFAULT_AUTOMOD_RULES, DEFAULT_BOT_CONFIG, DEFAULT_ANTINUKE_CONFIG, adminUser);
  assert.equal(resAdmin.isCommand, true);
  assert.match(resAdmin.content, /Honeypot Trap Channel Armed & Enabled/);

  // Allowed for bot owner
  const resOwner = processCommandInput('.honeypot on', DEFAULT_COMMANDS, DEFAULT_AUTOMOD_RULES, DEFAULT_BOT_CONFIG, DEFAULT_ANTINUKE_CONFIG, ownerExecutor);
  assert.equal(resOwner.isCommand, true);
  assert.match(resOwner.content, /Honeypot Trap Channel Armed & Enabled/);
});

test('Honeypot command configures punishment, channel name, and test simulation', () => {
  const cfg = { ...DEFAULT_ANTINUKE_CONFIG, honeypot: { ...DEFAULT_ANTINUKE_CONFIG.honeypot } };

  // Default punishment is kick
  assert.equal(cfg.honeypot.punishment, 'kick');

  // Change punishment to ban
  const resBan = processCommandInput('.honeypot punishment ban', DEFAULT_COMMANDS, DEFAULT_AUTOMOD_RULES, DEFAULT_BOT_CONFIG, cfg, ownerExecutor);
  assert.equal(resBan.isCommand, true);
  assert.match(resBan.content, /Honeypot Punishment updated to `BAN`/);
  assert.equal(cfg.honeypot.punishment, 'ban');

  // Change punishment to quarantine
  const resQ = processCommandInput('.honeypot punishment quarantine', DEFAULT_COMMANDS, DEFAULT_AUTOMOD_RULES, DEFAULT_BOT_CONFIG, cfg, ownerExecutor);
  assert.equal(resQ.isCommand, true);
  assert.match(resQ.content, /Honeypot Punishment updated to `QUARANTINE`/);
  assert.equal(cfg.honeypot.punishment, 'quarantine');

  // Change channel name
  const resCh = processCommandInput('.honeypot channel trap-do-not-type', DEFAULT_COMMANDS, DEFAULT_AUTOMOD_RULES, DEFAULT_BOT_CONFIG, cfg, ownerExecutor);
  assert.equal(resCh.isCommand, true);
  assert.match(resCh.content, /Honeypot Channel updated to `#trap-do-not-type`/);
  assert.equal(cfg.honeypot.channelName, 'trap-do-not-type');

  // Test simulation
  const resTest = processCommandInput('.honeypot test', DEFAULT_COMMANDS, DEFAULT_AUTOMOD_RULES, DEFAULT_BOT_CONFIG, cfg, ownerExecutor);
  assert.equal(resTest.isCommand, true);
  assert.match(resTest.content, /Honeypot Trap Simulation Completed/);
  assert.ok(cfg.honeypot.logs.length > 0);

  // Disable
  const resOff = processCommandInput('.honeypot disable', DEFAULT_COMMANDS, DEFAULT_AUTOMOD_RULES, DEFAULT_BOT_CONFIG, cfg, ownerExecutor);
  assert.equal(resOff.isCommand, true);
  assert.match(resOff.content, /Honeypot Trap Channel Disarmed/);
  assert.equal(cfg.honeypot.enabled, false);
});

test('Honeypot is updated and listed in help security category', () => {
  const res = processCommandInput('.help security', DEFAULT_COMMANDS, DEFAULT_AUTOMOD_RULES);
  assert.equal(res.isCommand, true);
  assert.ok(res.embed);
  assert.ok(res.embed.fields?.some((f) => f.name.includes('.honeypot')));
});

test('ticketsbot and adminbot handle direct mentions without explicit add verb', () => {
  const config = { ...DEFAULT_BOT_CONFIG };
  const antiNuke = { ...DEFAULT_ANTINUKE_CONFIG, trustedBots: { adminBots: [] as string[], ticketsBots: [] as string[], levelingBots: [] as string[], musicBots: [] as string[], utilityBots: [] as string[] } };

  const res = processCommandInput('.ticketsbot @tickettool', DEFAULT_COMMANDS, [], config, antiNuke, { id: '1181221352393420856' });
  assert.equal(res.isCommand, true);
  assert.ok(antiNuke.trustedBots.ticketsBots.includes('@tickettool'));

  const resAdmin = processCommandInput('.adminbot @myadminbot', DEFAULT_COMMANDS, [], config, antiNuke, { id: '1181221352393420856' });
  assert.equal(resAdmin.isCommand, true);
  assert.ok(antiNuke.trustedBots.adminBots.includes('@myadminbot'));
});

test('moderation commands create cases with flexible syntax and preset codes', () => {
  const config = { ...DEFAULT_BOT_CONFIG };
  const antiNuke = { ...DEFAULT_ANTINUKE_CONFIG };

  // Ban with preset code #1
  const resBan = processCommandInput('.ban @RogueMember 7d #1 pf:https://i.imgur.com/proof.png', DEFAULT_COMMANDS, [], config, antiNuke, { id: '1181221352393420856', tag: 'Staff#0001' });
  assert.equal(resBan.isCommand, true);
  assert.ok(resBan.content.includes('Member BANED'));
  assert.ok(resBan.embed?.fields?.some((f) => f.name.includes('Case ID')));

  // Jail with 2h duration
  const resJail = processCommandInput('.jail @Troublemaker 2h r:Spamming voice pf:https://i.imgur.com/proof.png', DEFAULT_COMMANDS, [], config, antiNuke, { id: '1181221352393420856', tag: 'Staff#0001' });
  assert.equal(resJail.isCommand, true);
  assert.ok(resJail.content.includes('Member JAILED'));

  // Revert case
  const resRevert = processCommandInput('.revert CASE-1001', DEFAULT_COMMANDS, [], config, antiNuke, { id: '1181221352393420856', tag: 'Staff#0001' });
  assert.equal(resRevert.isCommand, true);
  assert.ok(resRevert.content.includes('Punishment Reverted'));

  // Case lookup
  const resCase = processCommandInput('.case CASE-1001', DEFAULT_COMMANDS, [], config, antiNuke, { id: '1181221352393420856' });
  assert.equal(resCase.isCommand, true);
  assert.ok(resCase.embed?.title?.includes('CASE-1001'));

  // ModStats lookup
  const resStats = processCommandInput('.modstats', DEFAULT_COMMANDS, [], config, antiNuke, { id: '1181221352393420856' });
  assert.equal(resStats.isCommand, true);
  assert.ok(resStats.embed?.title?.includes('Staff Moderation Statistics'));
});

test('appeals and presetreason commands configure appeals module', () => {
  const config = { ...DEFAULT_BOT_CONFIG };
  const antiNuke = { ...DEFAULT_ANTINUKE_CONFIG };

  const resApp = processCommandInput('.appeals enable', DEFAULT_COMMANDS, [], config, antiNuke, { id: '1181221352393420856' });
  assert.equal(resApp.isCommand, true);
  assert.ok(resApp.embed?.title?.includes('Appeals Module Settings'));

  const resPreset = processCommandInput('.presetreason add #6 "Voice Chat Disruption" --appealable true', DEFAULT_COMMANDS, [], config, antiNuke, { id: '1181221352393420856' });
  assert.equal(resPreset.isCommand, true);
  assert.ok(resPreset.embed?.fields?.some((f) => f.value.includes('#6')));
});

test('per-guild honeypot settings remain isolated between different servers', () => {
  const config = { ...DEFAULT_BOT_CONFIG };

  // Guild A enables honeypot
  processCommandInput('.honeypot enable', DEFAULT_COMMANDS, [], config, DEFAULT_ANTINUKE_CONFIG, { id: '1181221352393420856', guildOwnerId: 'guild_A' });
  const configA = getGuildAntiNukeConfig('guild_A');
  assert.equal(configA.honeypot.enabled, true);

  // Guild B remains disabled
  const configB = getGuildAntiNukeConfig('guild_B');
  assert.equal(configB.honeypot.enabled, false);
});

test('no prefix module allows commands without dot prefix for granted users or servers', () => {
  const config = { ...DEFAULT_BOT_CONFIG };
  const antiNuke = { ...DEFAULT_ANTINUKE_CONFIG };

  // Grant No Prefix access to User 777
  const grantRes = processCommandInput('.noprefix add user 777 30', DEFAULT_COMMANDS, [], config, antiNuke, { id: '1181221352393420856' });
  assert.equal(grantRes.isCommand, true);

  // User 777 types "ping" without prefix
  const resPing = processCommandInput('ping', DEFAULT_COMMANDS, [], config, antiNuke, { id: '777' });
  assert.equal(resPing.isCommand, true);
  assert.ok(resPing.content.includes('Pong!'));

  // Non-granted user 888 types "ping" without prefix -> ignored
  const resNoAccess = processCommandInput('ping', DEFAULT_COMMANDS, [], config, antiNuke, { id: '888' });
  assert.equal(resNoAccess.isCommand, false);

  // User 777 disables No Prefix for themselves
  const disRes = processCommandInput('.noprefix disable', DEFAULT_COMMANDS, [], config, antiNuke, { id: '777' });
  assert.equal(disRes.isCommand, true);
  assert.ok(disRes.content.includes('DISABLED'));

  // User 777 typing "ping" is now ignored
  const resOff = processCommandInput('ping', DEFAULT_COMMANDS, [], config, antiNuke, { id: '777' });
  assert.equal(resOff.isCommand, false);

  // User 777 re-enables No Prefix
  const enRes = processCommandInput('.noprefix enable', DEFAULT_COMMANDS, [], config, antiNuke, { id: '777' });
  assert.equal(enRes.isCommand, true);
  assert.ok(enRes.content.includes('ACTIVATED'));

  // Conversational messages starting with words like "like", "stop", "back", "team", "p" must NOT be treated as commands
  const resLike = processCommandInput('like what happened', DEFAULT_COMMANDS, [], config, antiNuke, { id: '777' });
  assert.equal(resLike.isCommand, false);

  const resStop = processCommandInput('stop that right now', DEFAULT_COMMANDS, [], config, antiNuke, { id: '777' });
  assert.equal(resStop.isCommand, false);

  const resSingleLetter = processCommandInput('s wait', DEFAULT_COMMANDS, [], config, antiNuke, { id: '777' });
  assert.equal(resSingleLetter.isCommand, false);

  const resP = processCommandInput('p wait', DEFAULT_COMMANDS, [], config, antiNuke, { id: '777' });
  assert.equal(resP.isCommand, false);

  // But legitimate full command names work cleanly without prefix
  const resPlay = processCommandInput('play Kesariya', DEFAULT_COMMANDS, [], config, antiNuke, { id: '777' });
  assert.equal(resPlay.isCommand, true);

  const resSkip = processCommandInput('skip', DEFAULT_COMMANDS, [], config, antiNuke, { id: '777' });
  assert.equal(resSkip.isCommand, true);
});

test('processCommandInput completely ignores @everyone and @here pings', () => {
  const config = { ...DEFAULT_BOT_CONFIG, clientId: '1553292201835102278' };
  
  const resEveryone = processCommandInput('@everyone hello everyone', DEFAULT_COMMANDS, [], config);
  assert.equal(resEveryone.isCommand, false);

  const resHere = processCommandInput('@here check this out', DEFAULT_COMMANDS, [], config);
  assert.equal(resHere.isCommand, false);

  // Pure direct bot ping still works
  const resDirect = processCommandInput('<@1553292201835102278>', DEFAULT_COMMANDS, [], config);
  assert.equal(resDirect.isCommand, true);
  assert.ok(resDirect.embed);
});

test('processCommandInput handles Utility module commands (.purge, .snipe, .botname, .botavatar, .serverinfo)', () => {
  const config = { ...DEFAULT_BOT_CONFIG, clientId: '1553292201835102278' };
  const antiNuke = { ...DEFAULT_ANTINUKE_CONFIG };
  const ownerExecutor = { id: '1181221352393420856', isOwner: true, hasAdmin: true };

  // 1. .purge
  const resPurge = processCommandInput('.purge 25 bots', DEFAULT_COMMANDS, [], config, antiNuke, ownerExecutor);
  assert.equal(resPurge.isCommand, true);
  assert.ok(resPurge.content.includes('Purged'));

  // 2. .snipe & .clearsnipe
  const resSnipe = processCommandInput('.snipe', DEFAULT_COMMANDS, [], config, antiNuke, ownerExecutor);
  assert.equal(resSnipe.isCommand, true);

  const resClearSnipe = processCommandInput('.clearsnipe', DEFAULT_COMMANDS, [], config, antiNuke, ownerExecutor);
  assert.equal(resClearSnipe.isCommand, true);
  assert.ok(resClearSnipe.content.includes('Snipe Cache Cleared'));

  // 3. .botname
  const resBotName = processCommandInput('.botname VanguardGuard', DEFAULT_COMMANDS, [], config, antiNuke, ownerExecutor);
  assert.equal(resBotName.isCommand, true);
  assert.ok(resBotName.content.includes('Bot Server Nickname Updated'));

  // 4. .botavatar
  const resBotAvatar = processCommandInput('.botavatar https://example.com/pfp.png', DEFAULT_COMMANDS, [], config, antiNuke, ownerExecutor);
  assert.equal(resBotAvatar.isCommand, true);
  assert.ok(resBotAvatar.content.includes('Bot Server Avatar Updated'));

  // 5. .serverinfo & .userinfo
  const resServerInfo = processCommandInput('.serverinfo', DEFAULT_COMMANDS, [], config, antiNuke, ownerExecutor);
  assert.equal(resServerInfo.isCommand, true);
  assert.ok(resServerInfo.embed);

  const resUserInfo = processCommandInput('.userinfo', DEFAULT_COMMANDS, [], config, antiNuke, ownerExecutor);
  assert.equal(resUserInfo.isCommand, true);
  assert.ok(resUserInfo.embed);
});

test('Music Regression: resolvePlayableStreamUrl rejects 15s preview clips and HTML webpage URLs', () => {
  // 1. iTunes 30s preview clip must be replaced with a full-length 320kbps stream
  const previewUrl =
    'https://audio-ssl.itunes.apple.com/itunes-assets/AudioPreview125/v4/a2/2a/3b/mzaf_10334.plus.aac.p.m4a';
  const resolved1 = resolvePlayableStreamUrl(previewUrl, 'Blinding Lights');
  assert.ok(
    resolved1.endsWith('.mp3') || resolved1.endsWith('.mp4'),
    'Expected full-length 320kbps stream instead of .p.m4a preview'
  );
  assert.ok(!resolved1.includes('audio-ssl.itunes.apple.com'));

  // 2. HTML webpage URLs (Spotify, YouTube, JioSaavn) must be replaced with a full-length 320kbps stream
  const spotifyPage = 'https://open.spotify.com/track/7MXVkk9YM5FZwbMM3P23tn';
  const resolved2 = resolvePlayableStreamUrl(spotifyPage, 'Starboy');
  assert.ok(resolved2.endsWith('.mp3') || resolved2.endsWith('.mp4'));
  assert.ok(!resolved2.includes('open.spotify.com'));
});

test('Music Regression: scoreTrackCandidate ranks original tracks above karaoke, instrumental, and tribute variants', () => {
  const query = 'Starboy The Weeknd';
  const originalScore = scoreTrackCandidate(query, {
    title: 'Starboy (Official Audio)',
    artist: 'The Weeknd (Official VEVO)',
    official: true,
    durationSeconds: 230,
  });
  const karaokeScore = scoreTrackCandidate(query, {
    title: 'Starboy (Karaoke Instrumental Version)',
    artist: 'Party Tyme Karaoke',
    official: false,
    durationSeconds: 230,
  });
  const tributeScore = scoreTrackCandidate(query, {
    title: 'Starboy (Originally Performed by The Weeknd)',
    artist: 'Tribute Hit Masters',
    official: false,
    durationSeconds: 230,
  });

  assert.ok(originalScore > karaokeScore + 50, `Expected original (${originalScore}) >> karaoke (${karaokeScore})`);
  assert.ok(originalScore > tributeScore + 50, `Expected original (${originalScore}) >> tribute (${tributeScore})`);
});

test('Music Regression: Per-Guild Queue Lifecycle (idle start, queue append, sequential advance, skip, stop, loop, and re-add after empty)', () => {
  const guildA = 'test_music_guild_A';
  const guildB = 'test_music_guild_B';

  // Ensure clean initial state with autoplay disabled so we can test empty-queue transition
  const stateA = getGuildMusicState(guildA);
  stateA.autoplay = false;
  stateA.loopMode = 'off';
  stopGuildMusic(guildA);

  const stateB = getGuildMusicState(guildB);
  stateB.autoplay = false;
  stopGuildMusic(guildB);

  const track1 = smartSearchTrack('Starboy', 'Spotify', 'UserA');
  const track2 = smartSearchTrack('Levitating', 'Spotify', 'UserA');
  const track3 = smartSearchTrack('Kesariya', 'Spotify', 'UserA');

  // 1. First song starts immediately when player is idle
  const step1 = enqueueOrPlayTrack(guildA, track1);
  assert.equal(step1.startedImmediately, true);
  assert.equal(step1.position, 0);
  assert.equal(stateA.currentTrack?.title, track1.title);
  assert.equal(stateA.isPlaying, true);
  assert.equal(stateA.queue.length, 0);

  // Guild B remains completely isolated and idle
  assert.equal(stateB.currentTrack, undefined);
  assert.equal(stateB.isPlaying, false);

  // 2. Second and third songs are added to the queue while track1 is playing
  const step2 = enqueueOrPlayTrack(guildA, track2);
  assert.equal(step2.startedImmediately, false);
  assert.equal(step2.position, 1);
  assert.equal(stateA.currentTrack?.title, track1.title);
  assert.equal(stateA.queue.length, 1);

  const step3 = enqueueOrPlayTrack(guildA, track3);
  assert.equal(step3.startedImmediately, false);
  assert.equal(step3.position, 2);
  assert.equal(stateA.queue.length, 2);

  // 3. When track1 ends, track2 starts automatically
  const adv1 = advanceGuildQueue(guildA);
  assert.equal(adv1.nextTrack?.title, track2.title);
  assert.equal(stateA.currentTrack?.title, track2.title);
  assert.equal(stateA.isPlaying, true);
  assert.equal(stateA.queue.length, 1);

  // 4. Test Track Loop mode: natural completion repeats current track
  stateA.loopMode = 'track';
  const advLoop = advanceGuildQueue(guildA, { fromSkip: false });
  assert.equal(advLoop.nextTrack?.title, track2.title);
  assert.equal(stateA.queue.length, 1);

  // Manual Skip bypasses single-track loop and advances to track3
  const advSkip = advanceGuildQueue(guildA, { fromSkip: true });
  assert.equal(advSkip.nextTrack?.title, track3.title);
  assert.equal(stateA.currentTrack?.title, track3.title);
  assert.equal(stateA.queue.length, 0);
  stateA.loopMode = 'off';

  // 5. When last track finishes and autoplay is off, player returns to clean idle state
  const advEmpty = advanceGuildQueue(guildA);
  assert.equal(advEmpty.nextTrack, undefined);
  assert.equal(stateA.currentTrack, undefined);
  assert.equal(stateA.isPlaying, false);
  assert.equal(stateA.queue.length, 0);

  // 6. Adding a new song after queue emptied starts playback immediately!
  const track4 = smartSearchTrack('Blinding Lights', 'YouTube', 'UserA');
  const step4 = enqueueOrPlayTrack(guildA, track4);
  assert.equal(step4.startedImmediately, true);
  assert.equal((stateA.currentTrack as any)?.title, track4.title);
  assert.equal(stateA.isPlaying, true);

  // 7. Audio filter change updates activeFilter without clearing queue or stopping playback
  enqueueOrPlayTrack(guildA, track1);
  assert.equal(stateA.queue.length, 1);
  processCommandInput('.filter bassboost', DEFAULT_COMMANDS, [], DEFAULT_BOT_CONFIG, DEFAULT_ANTINUKE_CONFIG, {
    id: '1181221352393420856',
    guildOwnerId: guildA,
  });
  assert.equal(stateA.activeFilter, 'Bass Boost');
  assert.equal(stateA.isPlaying, true);
  assert.equal(stateA.queue.length, 1);

  // 8. Minimal Now Playing Embed contains custom emojis and zero Unicode emojis
  const embed = buildNowPlayingEmbed(stateA.currentTrack!, stateA, 'Now Playing');
  assert.ok(embed.title.includes('<a:music:1555133412602286140>'));
  assert.ok(embed.description.includes('Bass Boost'));
});

test('Music Regression: rewindGuildQueue (.previous) restores previous song and keeps interrupted song at front of queue', () => {
  const guildId = 'test_previous_rewind_guild';
  const state = getGuildMusicState(guildId);
  state.autoplay = true;
  state.loopMode = 'off';
  stopGuildMusic(guildId);
  state.history = [];

  const song1 = smartSearchTrack('Starboy', 'Spotify', 'Tejas');
  const song2 = smartSearchTrack('Blinding Lights', 'Spotify', 'Tejas');
  const song3 = smartSearchTrack('Levitating', 'Spotify', 'Tejas');

  enqueueOrPlayTrack(guildId, song1);
  enqueueOrPlayTrack(guildId, song2);
  enqueueOrPlayTrack(guildId, song3);

  assert.equal(state.currentTrack?.title, song1.title);
  assert.equal(state.queue.length, 2);

  // Skip from song1 -> song2 (song1 goes into history)
  const adv = advanceGuildQueue(guildId, { fromSkip: true });
  assert.equal(adv.nextTrack?.title, song2.title);
  assert.equal(state.currentTrack?.title, song2.title);
  assert.equal(state.queue.length, 1);
  assert.equal(state.queue[0].title, song3.title);

  // Rewind (.previous) from song2 -> restores song1, and puts song2 back at the front of the queue before song3!
  const rew = rewindGuildQueue(guildId);
  assert.equal(rew.restoredTrack?.title, song1.title);
  assert.equal(state.currentTrack?.title, song1.title);
  assert.equal(state.queue.length, 2);
  assert.equal(state.queue[0].title, song2.title);
  assert.equal(state.queue[1].title, song3.title);
});

test('Music Regression: Autoplay plays full FIFO queue first and then advances sequentially after the last song', () => {
  const guildId = 'test_sequential_autoplay_guild';
  const state = getGuildMusicState(guildId);
  state.autoplay = true;
  state.loopMode = 'off';
  stopGuildMusic(guildId);
  state.history = [];

  const queuedSong1 = smartSearchTrack('Starboy', 'Spotify', 'Tejas');
  const queuedSong2 = smartSearchTrack('Kesariya', 'Spotify', 'Tejas');

  enqueueOrPlayTrack(guildId, queuedSong1);
  enqueueOrPlayTrack(guildId, queuedSong2);

  // Even with autoplay ON, advancing while queue is non-empty MUST play queuedSong2 (not autoplay!)
  const firstAdvance = advanceGuildQueue(guildId, { fromSkip: true });
  assert.equal(firstAdvance.autoplayed, false);
  assert.equal(firstAdvance.nextTrack?.title, queuedSong2.title);
  assert.equal(state.queue.length, 0);

  // Now that the queue is empty, advancing triggers sequential Autoplay after queuedSong2
  const secondAdvance = advanceGuildQueue(guildId, { fromSkip: false });
  assert.equal(secondAdvance.autoplayed, true);
  assert.ok(secondAdvance.nextTrack, 'Expected sequential autoplay track after queue emptied');
  assert.notEqual(secondAdvance.nextTrack?.title, queuedSong2.title);
});

test('Music Regression: buildFfmpegFilterGraph and computeAmplifiedVolume generate real DSP filters and 0-200% gain', () => {
  const guildId = 'test_dsp_filters_guild';
  const state = getGuildMusicState(guildId);

  state.activeFilter = '8D Audio';
  state.speed = 1.0;
  const graph8d = buildFfmpegFilterGraph(state);
  assert.ok(graph8d?.includes('apulsator'), `Expected apulsator in 8D filter graph, got: ${graph8d}`);

  state.activeFilter = 'Bass Boost';
  const graphBass = buildFfmpegFilterGraph(state);
  assert.ok(graphBass?.includes('equalizer') || graphBass?.includes('bass'), `Expected bass boost filter, got: ${graphBass}`);

  state.activeFilter = 'Nightcore';
  const graphNightcore = buildFfmpegFilterGraph(state);
  assert.ok(graphNightcore?.includes('asetrate'), `Expected asetrate in Nightcore filter, got: ${graphNightcore}`);

  assert.equal(computeAmplifiedVolume(0), 0);
  assert.equal(computeAmplifiedVolume(100), 1);
  assert.ok(computeAmplifiedVolume(150) > 1.4);
  assert.ok(computeAmplifiedVolume(200) >= 2.0);
});

test('Sideways Commands: .prefix, /prefix, prefix (No-Prefix), and .botavatar attachment work identically', () => {
  const config = { ...DEFAULT_BOT_CONFIG };
  const antiNuke = { ...DEFAULT_ANTINUKE_CONFIG };
  const ownerExec = { id: '1181221352393420856', isOwner: true, hasAdmin: true, guildOwnerId: 'sideways_guild_1' };

  // 1. Prefix via .prefix
  const resDotPrefix = processCommandInput('.prefix !', DEFAULT_COMMANDS, [], config, antiNuke, ownerExec);
  assert.equal(resDotPrefix.isCommand, true);
  assert.equal(config.prefix, '!');

  // 2. Prefix via /prefix (Slash command)
  const resSlashPrefix = processCommandInput('/prefix .', DEFAULT_COMMANDS, [], config, antiNuke, ownerExec);
  assert.equal(resSlashPrefix.isCommand, true);
  assert.equal(config.prefix, '.');

  // 3. Prefix via No-Prefix ("prefix ?")
  const resNoPrefixCmd = processCommandInput('prefix ?', DEFAULT_COMMANDS, [], config, antiNuke, ownerExec);
  assert.equal(resNoPrefixCmd.isCommand, true);
  assert.equal(config.botPrefix, '?');
  processCommandInput('?prefix .', DEFAULT_COMMANDS, [], config, antiNuke, ownerExec);
  assert.equal(config.botPrefix, '.');

  // 4. .botavatar with image attachment (no text URL needed)
  const resAvatarAttachment = processCommandInput(
    '.botavatar',
    DEFAULT_COMMANDS,
    [],
    config,
    antiNuke,
    { ...ownerExec, attachmentUrl: 'https://cdn.discordapp.com/attachments/123/456/zenith_avatar.png' }
  );
  assert.equal(resAvatarAttachment.isCommand, true);
  assert.match(resAvatarAttachment.content, /Bot Server Avatar Updated/);
});





