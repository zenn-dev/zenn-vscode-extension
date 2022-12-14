import emojiRegex from "emoji-regex";

/**
 * TODO: zenn-validtor の方を使うようにする
 * Emoji を判定するための正規表現
 */
export const EMOJI_REGEX = emojiRegex();

/**
 * TODO: zenn-validtor の方を使うようにする
 * 記事のスラッグの正規表現
 */
export const ARTICLE_SLUG_PATTERN = /[0-9a-z\-_]{12,50}/;

/**
 * TODO: zenn-validtor の方を使うようにする
 * 本のスラッグの正規表現
 */
export const BOOK_SLUG_PATTERN = /[0-9a-z\-_]{12,50}/;

/**
 * TODO: zenn-validtor の方を使うようにする
 * 本のチャプターのスラッグの正規表現
 * @note チャプターの場合は文字数が 1 ~ 50 文字になる
 */
export const BOOK_CHAPTER_SLUG_PATTERN = /[0-9a-z\-_]{1,50}/;

/**
 * TODO: zenn-validtor の方を使うようにする
 * 本の設定ファイル名の正規表現
 */
export const BOOK_CONFIG_FILE_PATTERN = /config\.(?:yaml|yml)/;

/**
 * TODO: zenn-validtor の方を使うようにする
 * 本のカバー画像ファイル名の正規表現
 */
export const BOOK_COVER_IMAGE_FILE_PATTERN = /cover\.(?:png|jpg|jpeg|webp)/;

/**
 * TODO: zenn-validtor の方を使うようにする
 * 記事のFrontMatterで使用できる`publish_at`のフォーマット
 */
export const PUBLISHED_AT_PATTERN =
  /^[0-9]{4}-[0-9]{2}-[0-9]{2}(\s[0-9]{2}:[0-9]{2})?$/;

/**
 * front matterを取得するための正規表現
 */
export const FRONT_MATTER_PATTERN = /^(-{3}(?:\n|\r)([\w\W]+?)(?:\n|\r)-{3})/;
