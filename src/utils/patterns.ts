import emojiRegex from "emoji-regex";

/**
 * Emoji を判定するための正規表現
 */
export const EMOJI_REGEX = emojiRegex();

/**
 * スラッグの正規表現
 */
export const SLUG_PATTERN = /[a-z0-9-]+/;

/**
 * 記事のスラッグの正規表現
 */
export const ARTICLE_SLUG_PATTERN = new RegExp(`^${SLUG_PATTERN.source}$`);

/**
 * 本のスラッグの正規表現
 */
export const BOOK_SLUG_PATTERN = new RegExp(`^${SLUG_PATTERN.source}$`);

/**
 * 本のチャプターのスラッグの正規表現
 */
export const BOOK_CHAPTER_SLUG_PATTERN = new RegExp(`^${SLUG_PATTERN.source}$`);

/**
 * front matterを取得するための正規表現
 */
export const FRONT_MATTER_PATTERN = /^(-{3}(?:\n|\r)([\w\W]+?)(?:\n|\r)-{3})/;

/**
 * 記事のFrontMatterで使用できる`publish_at`のフォーマット
 */
export const PUBLISHED_AT_PATTERN =
  /^[0-9]{4}-[0-9]{2}-[0-9]{2}(\s[0-9]{2}:[0-9]{2})?$/;
