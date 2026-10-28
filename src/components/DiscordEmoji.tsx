import React, { useState } from 'react';
import { DISCORD_EMOJIS, DiscordEmojiData, getDiscordEmojiCdnUrl, parseDiscordEmojis } from '../utils/discordEmojis';

interface DiscordEmojiProps {
  emojiKey?: string;
  name?: string;
  id?: string;
  animated?: boolean;
  className?: string;
  onClick?: () => void;
}

function renderCustomVectorGlyph(name: string, className: string) {
  const lower = name.toLowerCase();
  let strokeColor = '#818cf8';
  let path = (
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2.2}
      d="M12 3l7 4v5c0 4.5-3 8.5-7 10-4-1.5-7-5.5-7-10V7l7-4z"
    />
  );

  if (lower.includes('music') || lower.includes('spotify') || lower.includes('apple') || lower.includes('saavan') || lower.includes('youtube') || lower.includes('amazon')) {
    strokeColor = '#38bdf8';
    path = (
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2.2}
        d="M9 18V5l12-2v13M9 18a3 3 0 11-6 0 3 3 0 016 0zm12-2a3 3 0 11-6 0 3 3 0 016 0z"
      />
    );
  } else if (lower.includes('done') || lower.includes('button_on') || lower.includes('unlock')) {
    strokeColor = '#34d399';
    path = (
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2.4}
        d="M5 13l4 4L19 7"
      />
    );
  } else if (lower.includes('error') || lower.includes('cancel') || lower.includes('button_off') || lower.includes('delete') || lower.includes('terminate') || lower.includes('ban')) {
    strokeColor = '#f87171';
    path = (
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2.3}
        d="M6 18L18 6M6 6l12 12"
      />
    );
  } else if (lower.includes('premium') || lower.includes('award') || lower.includes('vip') || lower.includes('gift') || lower.includes('owner')) {
    strokeColor = '#fbbf24';
    path = (
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2.2}
        d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"
      />
    );
  } else if (lower.includes('tool') || lower.includes('settings') || lower.includes('maintenance')) {
    strokeColor = '#a78bfa';
    path = (
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2.2}
        d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
      />
    );
  } else if (lower.includes('skip') || lower.includes('resume')) {
    strokeColor = '#60a5fa';
    path = (
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2.3}
        d="M5 4l10 8-10 8V4zm14 1v14"
      />
    );
  } else if (lower.includes('pause')) {
    strokeColor = '#fbbf24';
    path = (
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2.4}
        d="M10 9v6m4-6v6"
      />
    );
  } else if (lower.includes('ping') || lower.includes('world') || lower.includes('globe')) {
    strokeColor = '#2dd4bf';
    path = (
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2.2}
        d="M13 10V3L4 14h7v7l9-11h-7z"
      />
    );
  }

  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke={strokeColor}
      aria-label={`:${name}:`}
      className={`${className} inline-block align-middle shrink-0`}
    >
      {path}
    </svg>
  );
}

export const DiscordEmoji: React.FC<DiscordEmojiProps & { size?: number }> = ({
  emojiKey,
  name,
  id,
  animated,
  size,
  className = 'w-5 h-5 inline-block align-middle',
  onClick,
}) => {
  const [imgFailed, setImgFailed] = useState(false);
  let targetEmoji: DiscordEmojiData | undefined;

  if (emojiKey && DISCORD_EMOJIS[emojiKey]) {
    targetEmoji = DISCORD_EMOJIS[emojiKey];
  } else if (name) {
    const found = Object.values(DISCORD_EMOJIS).find(
      (e) => e.name.toLowerCase() === name.toLowerCase()
    );
    if (found) targetEmoji = found;
  }

  const finalId = id || targetEmoji?.id;
  const isAnimated = animated !== undefined ? animated : targetEmoji?.animated || false;
  const finalName = name || targetEmoji?.name || 'emoji';
  const sizeClass =
    size && size >= 36
      ? 'w-11 h-11 inline-block align-middle'
      : size && size >= 22
      ? 'w-6 h-6 inline-block align-middle'
      : size && size >= 18
      ? 'w-5 h-5 inline-block align-middle'
      : size && size <= 14
      ? 'w-3.5 h-3.5 inline-block align-middle'
      : className;

  if (!finalId || imgFailed) {
    return renderCustomVectorGlyph(finalName, sizeClass);
  }

  const cdnUrl = getDiscordEmojiCdnUrl(finalId, isAnimated);

  return (
    <img
      src={cdnUrl}
      alt={`:${finalName}:`}
      title={`:${finalName}:`}
      className={`${sizeClass} object-contain inline-block shrink-0 transition-transform`}
      loading="lazy"
      onClick={onClick}
      onError={() => setImgFailed(true)}
    />
  );
};

export const FormattedDiscordText: React.FC<{ text: string }> = ({ text }) => {
  const segments = parseDiscordEmojis(text);

  return (
    <span className="inline">
      {segments.map((seg, i) => {
        if (seg.type === 'emoji' && seg.emojiData) {
          return (
            <DiscordEmoji
              key={i}
              id={seg.emojiData.id}
              name={seg.emojiData.name}
              animated={seg.emojiData.animated}
              className="w-4 h-4 inline-block align-middle mx-0.5"
            />
          );
        }
        return <React.Fragment key={i}>{seg.content}</React.Fragment>;
      })}
    </span>
  );
};

export const RichDiscordText = FormattedDiscordText;
