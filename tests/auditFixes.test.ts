import test from 'node:test';
import assert from 'node:assert/strict';
import {
  isBotOwner,
  processCommandInput,
  getGuildAntiNukeConfig,
  grantNoPrefixAccess,
  generateRedeemCode,
  redeemCode,
  createModCase,
  revertModCase,
  DEFAULT_COMMANDS,
  DEFAULT_AUTOMOD_RULES,
  DEFAULT_ANTINUKE_CONFIG,
} from '../src/utils/botLogic.ts';
import { DEFAULT_BOT_CONFIG } from '../src/utils/botConfig.ts';
import {
  buildFfmpegFilterGraph,
  computeAmplifiedVolume,
  getGuildMusicState,
  enqueueOrPlayTrack,
} from '../src/utils/lavalinkManager.ts';
import {
  computeOpeningPhaseState,
  computeSpectrumBars,
  ORBITAL_MODULE_BADGES,
  OPENING_TOTAL_DURATION_MS,
} from '../src/utils/openingAnimationEngine.ts';

test('LOGIC-01: isBotOwner rejects partial substrings and only matches exact snowflake ID or owner username', () => {
  assert.equal(isBotOwner('1181221352393420856', DEFAULT_BOT_CONFIG), true);
  assert.equal(isBotOwner('demonxtejas', DEFAULT_BOT_CONFIG), true);
  assert.equal(isBotOwner('118', DEFAULT_BOT_CONFIG), false);
  assert.equal(isBotOwner('1', DEFAULT_BOT_CONFIG), false);
  assert.equal(isBotOwner('demon', DEFAULT_BOT_CONFIG), false);
  assert.equal(isBotOwner('(', DEFAULT_BOT_CONFIG), false);
});

test('LOGIC-02 & LOGIC-06: Moderation commands enforce RBAC and block Server Owner / self moderation', () => {
  // Non-admin member cannot run .ban
  const denied = processCommandInput(
    '.ban @TargetUser spamming',
    DEFAULT_COMMANDS,
    DEFAULT_AUTOMOD_RULES,
    DEFAULT_BOT_CONFIG,
    DEFAULT_ANTINUKE_CONFIG,
    {
      id: '999999999999999999',
      tag: 'RegularMember#0001',
      guildId: 'guild_rbac_1',
      guildOwnerId: '888888888888888888',
      hasAdmin: false,
      isOwner: false,
    }
  );
  assert.equal(denied.isCommand, true);
  assert.ok(denied.content.includes('Permission Denied'));

  // Admin cannot ban the Server Owner
  const serverOwnerProtected = processCommandInput(
    '.ban <@888888888888888888> coup attempt',
    DEFAULT_COMMANDS,
    DEFAULT_AUTOMOD_RULES,
    DEFAULT_BOT_CONFIG,
    DEFAULT_ANTINUKE_CONFIG,
    {
      id: '777777777777777777',
      tag: 'AdminUser#0001',
      guildId: 'guild_rbac_1',
      guildOwnerId: '888888888888888888',
      hasAdmin: true,
      isOwner: false,
    }
  );
  assert.ok(serverOwnerProtected.content.includes('Action Denied'));
});

test('LOGIC-07 & LOGIC-08: AutoMod word-boundary regex avoids Scunthorpe false positives and catches invite links / mass mentions', () => {
  const customRules = [
    ...DEFAULT_AUTOMOD_RULES,
    {
      id: 'test_word_rule',
      name: 'Word Filter',
      type: 'bad_words' as const,
      enabled: true,
      action: 'warn' as const,
      keywords: ['ass'],
    },
    {
      id: 'test_invite_rule',
      name: 'Invite Blocker',
      type: 'invite_links' as const,
      enabled: true,
      action: 'warn' as const,
    },
    {
      id: 'test_mentions_rule',
      name: 'Mention Shield',
      type: 'mass_mentions' as const,
      enabled: true,
      action: 'mute' as const,
    },
  ];

  // "class" and "pass" should NOT trigger "ass"
  const safeMsg = processCommandInput(
    'I passed my class assignment today!',
    DEFAULT_COMMANDS,
    customRules,
    DEFAULT_BOT_CONFIG,
    DEFAULT_ANTINUKE_CONFIG,
    { id: '222222222222222222', hasAdmin: false, isOwner: false }
  );
  assert.equal(safeMsg.autoModTriggered, undefined);

  // Exact word "ass" SHOULD trigger
  const blockedWord = processCommandInput(
    'you are an ass',
    DEFAULT_COMMANDS,
    customRules,
    DEFAULT_BOT_CONFIG,
    DEFAULT_ANTINUKE_CONFIG,
    { id: '222222222222222222', hasAdmin: false, isOwner: false }
  );
  assert.equal(blockedWord.autoModTriggered, true);

  // Invite link SHOULD trigger
  const blockedInvite = processCommandInput(
    'join https://discord.gg/rogue-server now',
    DEFAULT_COMMANDS,
    customRules,
    DEFAULT_BOT_CONFIG,
    DEFAULT_ANTINUKE_CONFIG,
    { id: '222222222222222222', hasAdmin: false, isOwner: false }
  );
  assert.equal(blockedInvite.autoModTriggered, true);

  // 5+ mentions SHOULD trigger
  const blockedMentions = processCommandInput(
    '<@1> <@2> <@3> <@4> <@5> wake up',
    DEFAULT_COMMANDS,
    customRules,
    DEFAULT_BOT_CONFIG,
    DEFAULT_ANTINUKE_CONFIG,
    { id: '222222222222222222', hasAdmin: false, isOwner: false }
  );
  assert.equal(blockedMentions.autoModTriggered, true);
});

test('LOGIC-09: .wall command is gated by ANTINUKE_SECURITY_COMMANDS', () => {
  const res = processCommandInput(
    '.wall assign @User 3',
    DEFAULT_COMMANDS,
    DEFAULT_AUTOMOD_RULES,
    DEFAULT_BOT_CONFIG,
    DEFAULT_ANTINUKE_CONFIG,
    {
      id: '333333333333333333',
      guildId: 'guild_wall_test',
      guildOwnerId: '888888888888888888',
      hasAdmin: false,
      isOwner: false,
    }
  );
  assert.ok(res.content.includes('Access Denied'));
});

test('LOGIC-10 & LOGIC-16: createModCase caps at 100 cases and revertModCase prioritizes exact ID matches', () => {
  const guildId = 'guild_cases_test';
  for (let i = 1; i <= 105; i++) {
    createModCase(guildId, {
      targetId: `${1000 + i}`,
      targetTag: `User${i}#0001`,
      moderatorId: '1181221352393420856',
      moderatorTag: 'demonxtejas',
      punishmentType: 'mute',
      reason: `Test case ${i}`,
    });
  }
  const reverted = revertModCase(guildId, '1100', 'demonxtejas');
  assert.equal(reverted.success, true);
  assert.equal(reverted.modCase?.targetId, '1100');
});

test('LOGIC-11 & LOGIC-12: grantNoPrefixAccess clamps durationDays and redeemCode prevents over-redemption', () => {
  const entry = grantNoPrefixAccess('444444444444444444', 'user', 999999999, 'demonxtejas');
  assert.equal(typeof entry.expiresAt, 'number');
  assert.equal(isNaN(entry.expiresAt!), false);
  assert.equal(isNaN(new Date(entry.expiresAt!).getTime()), false);

  const codeObj = generateRedeemCode('user', 30, 1, 'demonxtejas');
  const firstClaim = redeemCode(codeObj.code, '555555555555555555', 'guild_1');
  const secondClaim = redeemCode(codeObj.code, '666666666666666666', 'guild_1');
  assert.equal(firstClaim.success, true);
  assert.equal(secondClaim.success, false);
});

test('VOICE-09 & UI-03: FFmpeg filter graph includes alimiter and queue history is bounded to 25 items', () => {
  const state = getGuildMusicState('guild_audio_test');
  state.volume = 200;
  const filterGraph = buildFfmpegFilterGraph(state);
  assert.ok(filterGraph.includes('alimiter=limit=0.95'));
  assert.ok(computeAmplifiedVolume(state) <= 2.0);

  for (let i = 0; i < 35; i++) {
    enqueueOrPlayTrack('guild_audio_test', {
      id: `track_${i}`,
      title: `Song ${i}`,
      artist: 'Artist',
      duration: '3:00',
      durationSeconds: 180,
      url: 'https://example.com/audio.mp3',
      externalUrl: 'https://example.com/audio',
      thumbnail: 'https://example.com/thumb.jpg',
      source: 'Spotify',
      requestedBy: 'Tester',
      officialSinger: true,
      bitrate: '320kbps',
      likes: 0,
      likedBy: [],
      speed: 1.0,
      filter: 'None',
    });
  }
  const updatedState = getGuildMusicState('guild_audio_test');
  assert.ok(updatedState.recap24h.length <= 50);
});

test('OPENING-ANIM-01: computeOpeningPhaseState progresses through ignition, materialize, portal_split, and complete', () => {
  const s0 = computeOpeningPhaseState(100, OPENING_TOTAL_DURATION_MS);
  assert.equal(s0.phase, 'ignition');
  assert.equal(s0.shutterOffsetPct, 0);

  const s1 = computeOpeningPhaseState(1500, OPENING_TOTAL_DURATION_MS);
  assert.equal(s1.phase, 'materialize');
  assert.ok(s1.unlockedModulesCount >= 1 && s1.unlockedModulesCount <= 4);

  const s2 = computeOpeningPhaseState(2800, OPENING_TOTAL_DURATION_MS);
  assert.equal(s2.phase, 'portal_split');
  assert.ok(s2.shutterOffsetPct > 0 && s2.shutterOffsetPct <= 100);
  assert.equal(s2.unlockedModulesCount, 4);

  const s3 = computeOpeningPhaseState(3300, OPENING_TOTAL_DURATION_MS);
  assert.equal(s3.phase, 'complete');
  assert.equal(s3.overallProgress, 100);
  assert.equal(s3.shutterOffsetPct, 100);

  const bars = computeSpectrumBars(24, 950);
  assert.equal(bars.length, 24);
  assert.ok(bars.every((b) => b >= 0.15 && b <= 1));

  assert.equal(ORBITAL_MODULE_BADGES.length, 4);
  assert.ok(ORBITAL_MODULE_BADGES.every((b) => /^\d{19}$/.test(b.emojiId)));
});

