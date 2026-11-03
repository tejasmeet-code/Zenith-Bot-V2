/**
 * Custom Discord Emojis Registry
 * Contains exact raw Discord emoji strings and parsing utilities.
 * Zero unicode emojis rule enforced.
 */

export interface DiscordEmojiData {
  name: string;
  id: string;
  animated: boolean;
  raw: string;
}

export const DISCORD_EMOJIS: Record<string, DiscordEmojiData> = {
  MUSIC_02: { name: '02music', id: '1555133215508009061', animated: true, raw: '<a:02music:1555133215508009061>' },
  AI: { name: 'AI', id: '1555133225893101600', animated: false, raw: '<:AI:1555133225893101600>' },
  AMAZON_MUSIC: { name: 'Amazon_music', id: '1555133234184978572', animated: false, raw: '<:Amazon_music:1555133234184978572>' },
  ANNOUNCE: { name: 'announce', id: '1555133241814548542', animated: true, raw: '<a:announce:1555133241814548542>' },
  ANNOUNCEMENTS: { name: 'Announcements', id: '1555133249049862205', animated: false, raw: '<:Announcements:1555133249049862205>' },
  APPLE_MUSIC: { name: 'Apple_Music', id: '1555133256477974579', animated: false, raw: '<:Apple_Music:1555133256477974579>' },
  BOT_DOWN: { name: 'Bot_down', id: '1555133264895807518', animated: true, raw: '<a:Bot_down:1555133264895807518>' },
  BUGHUNTER_1: { name: 'Bughunter_1', id: '1555133271896096788', animated: false, raw: '<:Bughunter_1:1555133271896096788>' },
  BUGHUNTER_2: { name: 'Bughunter_2', id: '1555133279030485082', animated: false, raw: '<:Bughunter_2:1555133279030485082>' },
  BUGHUNTER_3: { name: 'Bughunter_3', id: '1555133286676832366', animated: false, raw: '<:Bughunter_3:1555133286676832366>' },
  BUGHUNTER_4: { name: 'Bughunter_4', id: '1555133293765070880', animated: false, raw: '<:Bughunter_4:1555133293765070880>' },
  BUTTON_OFF: { name: 'Button_off', id: '1555133300522098758', animated: false, raw: '<:Button_off:1555133300522098758>' },
  BUTTON_ON: { name: 'Button_on', id: '1555133307434434610', animated: false, raw: '<:Button_on:1555133307434434610>' },
  COMMANDS: { name: 'Commands', id: '1555133314380206160', animated: false, raw: '<:Commands:1555133314380206160>' },
  ERROR: { name: 'error', id: '1555133322840121357', animated: true, raw: '<a:error:1555133322840121357>' },
  FEEDBACK: { name: 'feedback', id: '1555133337079914567', animated: false, raw: '<:feedback:1555133337079914567>' },
  GLOBE: { name: 'globe', id: '1555133344482590821', animated: false, raw: '<:globe:1555133344482590821>' },
  INTERNET_ERROR: { name: 'Internet_error', id: '1555133353194291231', animated: false, raw: '<:Internet_error:1555133353194291231>' },
  JIO_SAAVAN: { name: 'Jio_saavan', id: '1555133360420945940', animated: false, raw: '<:Jio_saavan:1555133360420945940>' },
  LINK: { name: 'link', id: '1555133367534624849', animated: false, raw: '<:link:1555133367534624849>' },
  LIST: { name: 'list', id: '1555133374023344242', animated: false, raw: '<:list:1555133374023344242>' },
  LOGGING: { name: 'Logging', id: '1555133381182881852', animated: false, raw: '<:Logging:1555133381182881852>' },
  LOOP: { name: 'loop', id: '1555133388149628980', animated: false, raw: '<:loop:1555133388149628980>' },
  MAINTENANCE: { name: 'Maintenance', id: '1555133395816939531', animated: false, raw: '<:Maintenance:1555133395816939531>' },
  MODERATOR: { name: 'Moderator', id: '1555133403261571144', animated: false, raw: '<:Moderator:1555133403261571144>' },
  MUSIC: { name: 'music', id: '1555133412602286140', animated: true, raw: '<a:music:1555133412602286140>' },
  NOTIFICATIONS: { name: 'Notifications', id: '1555133419971678228', animated: true, raw: '<a:Notifications:1555133419971678228>' },
  PARTNER: { name: 'Partner', id: '1555133427936919574', animated: false, raw: '<:Partner:1555133427936919574>' },
  PAUSE: { name: 'pause', id: '1555133437038297138', animated: false, raw: '<:pause:1555133437038297138>' },
  PEOPLE: { name: 'people', id: '1555133444017619028', animated: false, raw: '<:people:1555133444017619028>' },
  PING: { name: 'ping', id: '1555133452146319391', animated: true, raw: '<a:ping:1555133452146319391>' },
  PREMIUM1: { name: 'Premium1', id: '1555133459192615042', animated: false, raw: '<:Premium1:1555133459192615042>' },
  PREMIUM2: { name: 'Premium2', id: '1555133465022828626', animated: false, raw: '<:Premium2:1555133465022828626>' },
  PREMIUM3: { name: 'Premium3', id: '1555133473205780550', animated: false, raw: '<:Premium3:1555133473205780550>' },
  PREMIUM4: { name: 'Premium4', id: '1555133480810193016', animated: false, raw: '<:Premium4:1555133480810193016>' },
  REPEAT_ONE_BUTTON: { name: 'repeat_one_button', id: '1555133487844163674', animated: false, raw: '<:repeat_one_button:1555133487844163674>' },
  RESUME: { name: 'resume', id: '1555133494991265863', animated: false, raw: '<:resume:1555133494991265863>' },
  RULES: { name: 'Rules', id: '1555133502197076030', animated: false, raw: '<:Rules:1555133502197076030>' },
  SHUFFLE: { name: 'shuffle', id: '1555133509331583026', animated: false, raw: '<:shuffle:1555133509331583026>' },
  SPEED_DECREASE: { name: 'Speed_decrease', id: '1555133516923011103', animated: false, raw: '<:Speed_decrease:1555133516923011103>' },
  SPEED_MORE: { name: 'Speed_more', id: '1555133523965382737', animated: false, raw: '<:Speed_more:1555133523965382737>' },
  SPOTIFY: { name: 'Spotify', id: '1555133531666120744', animated: false, raw: '<:Spotify:1555133531666120744>' },
  SUPPORT: { name: 'Support', id: '1555133538750169149', animated: false, raw: '<:Support:1555133538750169149>' },
  TOOL: { name: 'Tool', id: '1555133545918369894', animated: false, raw: '<:Tool:1555133545918369894>' },
  WHITE_ADMIN: { name: 'white_admin', id: '1555133552797028443', animated: false, raw: '<:white_admin:1555133552797028443>' },
  WHITE_ANTINUKE: { name: 'white_antinuke', id: '1555133560334061610', animated: false, raw: '<:white_antinuke:1555133560334061610>' },
  WHITE_AUTOMOD: { name: 'white_automod', id: '1555133567762174053', animated: false, raw: '<:white_automod:1555133567762174053>' },
  WHITE_AWARD: { name: 'white_award', id: '1555133575165124638', animated: false, raw: '<:white_award:1555133575165124638>' },
  WHITE_BAN: { name: 'white_ban', id: '1555133582140248125', animated: false, raw: '<:white_ban:1555133582140248125>' },
  WHITE_BOT: { name: 'white_bot', id: '1555133589581070416', animated: false, raw: '<:white_bot:1555133589581070416>' },
  WHITE_CANCEL: { name: 'white_cancel', id: '1555133596652539988', animated: false, raw: '<:white_cancel:1555133596652539988>' },
  WHITE_CLAIM: { name: 'white_claim', id: '1555133604068200468', animated: false, raw: '<:white_claim:1555133604068200468>' },
  WHITE_CO_OWNER: { name: 'white_co_owner', id: '1555133610858647603', animated: false, raw: '<:white_co_owner:1555133610858647603>' },
  WHITE_DELETE: { name: 'white_delete', id: '1555133618072846417', animated: false, raw: '<:white_delete:1555133618072846417>' },
  WHITE_DONE: { name: 'white_Done', id: '1555133626276905040', animated: true, raw: '<a:white_Done:1555133626276905040>' },
  WHITE_FIRST: { name: 'white_first', id: '1555133634346750035', animated: false, raw: '<:white_first:1555133634346750035>' },
  WHITE_FOURTH: { name: 'white_fourth', id: '1555133642018258964', animated: false, raw: '<:white_fourth:1555133642018258964>' },
  WHITE_GAMES: { name: 'white_games', id: '1555133649504968775', animated: false, raw: '<:white_games:1555133649504968775>' },
  WHITE_GIFT: { name: 'white_gift', id: '1555133656736079934', animated: false, raw: '<:white_gift:1555133656736079934>' },
  WHITE_HEADTESTER: { name: 'white_HeadTester', id: '1555133664554393620', animated: false, raw: '<:white_HeadTester:1555133664554393620>' },
  WHITE_HELPER: { name: 'white_helper', id: '1555133671340515439', animated: false, raw: '<:white_helper:1555133671340515439>' },
  WHITE_HOMIES: { name: 'white_homies', id: '1555133678009589810', animated: false, raw: '<:white_homies:1555133678009589810>' },
  WHITE_INFO: { name: 'white_info', id: '1555133685118931086', animated: false, raw: '<:white_info:1555133685118931086>' },
  WHITE_LOADING: { name: 'white_loading', id: '1555133693704544337', animated: true, raw: '<a:white_loading:1555133693704544337>' },
  WHITE_LOCK: { name: 'white_lock', id: '1555133700835119136', animated: false, raw: '<:white_lock:1555133700835119136>' },
  WHITE_MANAGER: { name: 'white_manager', id: '1555133708057575466', animated: false, raw: '<:white_manager:1555133708057575466>' },
  WHITE_MESSAGE: { name: 'white_message', id: '1555133715477172244', animated: false, raw: '<:white_message:1555133715477172244>' },
  WHITE_MIC: { name: 'white_mic', id: '1555133722284527628', animated: false, raw: '<:white_mic:1555133722284527628>' },
  WHITE_MUSIC: { name: 'white_music', id: '1555133730371407944', animated: true, raw: '<a:white_music:1555133730371407944>' },
  WHITE_MUSICNOTE: { name: 'white_musicnote', id: '1555133737837006910', animated: false, raw: '<:white_musicnote:1555133737837006910>' },
  WHITE_MUTE: { name: 'white_mute', id: '1555133755184906250', animated: false, raw: '<:white_mute:1555133755184906250>' },
  WHITE_NO_PREFIX: { name: 'white_no_prefix', id: '1555133762734657581', animated: false, raw: '<:white_no_prefix:1555133762734657581>' },
  WHITE_OWNER: { name: 'white_owner', id: '1555133769659187260', animated: false, raw: '<:white_owner:1555133769659187260>' },
  WHITE_PARTNER: { name: 'white_partner', id: '1555133776475070464', animated: false, raw: '<:white_partner:1555133776475070464>' },
  WHITE_PREMIUM: { name: 'white_Premium', id: '1555133783634616371', animated: false, raw: '<:white_Premium:1555133783634616371>' },
  WHITE_PREVIOUS: { name: 'white_previous', id: '1555133790781972521', animated: false, raw: '<:white_previous:1555133790781972521>' },
  WHITE_ROLES: { name: 'white_roles', id: '1555133800227414016', animated: false, raw: '<:white_roles:1555133800227414016>' },
  WHITE_SECOND: { name: 'white_second', id: '1555133807643070464', animated: false, raw: '<:white_second:1555133807643070464>' },
  WHITE_SETTINGS: { name: 'white_settings', id: '1555133815536492721', animated: false, raw: '<:white_settings:1555133815536492721>' },
  WHITE_SKIP: { name: 'white_skip', id: '1555133823698604074', animated: false, raw: '<:white_skip:1555133823698604074>' },
  WHITE_STRIKE: { name: 'white_strike', id: '1555133832305451101', animated: false, raw: '<:white_strike:1555133832305451101>' },
  WHITE_SUPPORTER: { name: 'white_supporter', id: '1555133839351873556', animated: false, raw: '<:white_supporter:1555133839351873556>' },
  WHITE_SUPPORT_TEAM: { name: 'white_support_team', id: '1555133846801092631', animated: false, raw: '<:white_support_team:1555133846801092631>' },
  WHITE_TERMINATE: { name: 'white_terminate', id: '1555133855143567430', animated: false, raw: '<:white_terminate:1555133855143567430>' },
  WHITE_TESTER: { name: 'white_Tester', id: '1555133862030483548', animated: false, raw: '<:white_Tester:1555133862030483548>' },
  WHITE_THIRD: { name: 'white_third', id: '1555133869433552906', animated: false, raw: '<:white_third:1555133869433552906>' },
  WHITE_TICKET: { name: 'white_ticket', id: '1555133876433846382', animated: false, raw: '<:white_ticket:1555133876433846382>' },
  WHITE_UNLOCK: { name: 'white_unlock', id: '1555133883383681145', animated: false, raw: '<:white_unlock:1555133883383681145>' },
  WHITE_VIP: { name: 'white_vip', id: '1555133891281428500', animated: false, raw: '<:white_vip:1555133891281428500>' },
  WHITE_WARN: { name: 'white_warn', id: '1555133898156154963', animated: false, raw: '<:white_warn:1555133898156154963>' },
  WORLD: { name: 'World', id: '1555133905412030607', animated: true, raw: '<a:World:1555133905412030607>' },
  YOUTUBE_MUSIC: { name: 'YouTube_music', id: '1555133916979925143', animated: false, raw: '<:YouTube_music:1555133916979925143>' },
};

/**
 * Get Discord CDN URL for an emoji ID
 */
export function getDiscordEmojiCdnUrl(id: string, animated: boolean = false): string {
  const ext = animated ? 'gif' : 'png';
  return `https://cdn.discordapp.com/emojis/${id}.${ext}`;
}

/**
 * Regex matcher for Discord Custom Emoji syntax: <a:Name:ID> or <:Name:ID>
 */
export const DISCORD_EMOJI_REGEX = /<(a)?:([a-zA-Z0-9_]+):([0-9]+)>/g;

export interface ParsedEmojiSegment {
  type: 'text' | 'emoji';
  content: string;
  emojiData?: {
    animated: boolean;
    name: string;
    id: string;
    raw: string;
    cdnUrl: string;
  };
}

/**
 * Parse string text into array of text and emoji segments for rendering
 */
export function parseDiscordEmojis(text: string): ParsedEmojiSegment[] {
  const segments: ParsedEmojiSegment[] = [];
  let lastIndex = 0;
  let match: RegExpExecArray | null;

  const regex = new RegExp(DISCORD_EMOJI_REGEX);

  while ((match = regex.exec(text)) !== null) {
    if (match.index > lastIndex) {
      segments.push({
        type: 'text',
        content: text.slice(lastIndex, match.index),
      });
    }

    const isAnimated = match[1] === 'a';
    const name = match[2];
    const id = match[3];
    const raw = match[0];

    segments.push({
      type: 'emoji',
      content: raw,
      emojiData: {
        animated: isAnimated,
        name,
        id,
        raw,
        cdnUrl: getDiscordEmojiCdnUrl(id, isAnimated),
      },
    });

    lastIndex = regex.lastIndex;
  }

  if (lastIndex < text.length) {
    segments.push({
      type: 'text',
      content: text.slice(lastIndex),
    });
  }

  return segments;
}
