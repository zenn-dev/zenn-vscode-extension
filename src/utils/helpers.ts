/**
 * ===================================================================
 * :注意:
 * WebView 内で実行される関数なども含まれるので、
 * このファイルには、vscode に依存するような処理は書かないようにする
 * ===================================================================
 */

import { JSON_SCHEMA, load as parseYaml } from "js-yaml";

import { FRONT_MATTER_PATTERN, PUBLISHED_AT_PATTERN } from "./patterns";

import { ContentsType } from "../types";
import { ZENN_LINK_BASE_URL } from "../variables";

declare module "js-yaml" {
  /**
   * デフォルトの返り値の型が unknown なので Lint エラーが出る。
   * それを回避するために any 型に上書きする
   */
  function load(str: string, opts?: LoadOptions): any;
}

export { parseYaml };

/**
 * `publish_at`の日付文字列をフォーマットする
 */
export function formatPublishedAt(publishedAt?: null | string): string | null {
  if (!publishedAt) return null;
  if (!publishedAt.match(PUBLISHED_AT_PATTERN)) return "フォーマットを確認してください"; // prettier-ignore

  // safari でも Data.parse() できるように `YYYY-MM-DDThh:mm` のフォーマットでパースする
  const publishedAtUnixTime = Date.parse(
    publishedAt.length === 10
      ? `${publishedAt}T00:00` // 日付だけだとUTC時間になるので、00:00を追加してローカルタイムにする
      : publishedAt.replace(" ", "T")
  );

  if (isNaN(publishedAtUnixTime)) return "フォーマットを確認してください";

  return new Intl.DateTimeFormat("ja-jp", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(publishedAtUnixTime));
}

/**
 * Front Matterをオブジェクトに変換する
 */
export const parseFrontMatter = (
  text: string
): { [key: string]: string | undefined } => {
  const meta = FRONT_MATTER_PATTERN.exec(text)?.[2];

  // NOTE: yamlのtimestampフィールドを自動的にDateに変換されないように(published_at などの値を文字列として扱えるように)オプションを指定する
  const result = meta ? parseYaml(meta, { schema: JSON_SCHEMA }) : {};

  if (typeof result !== "object") return {};
  if (Array.isArray(result)) return {};

  return result;
};

export const parseDate = (value: unknown): Date => {
  try {
    return new Date(value as any);
  } catch {
    return new Date();
  }
};

/**
 * 14文字のランダムな文字列を返す
 */
export const generateSlug = (): string => {
  const a = Math.random().toString(16).substring(2);
  const b = Math.random().toString(16).substring(2);
  return `${a}${b}`.slice(0, 14);
};

/**
 * ランダムに Emoji を返す
 */
export const pickRandomEmoji = (): string => {
  // prettier-ignore
  const emojiList =["😺","📘","📚","📑","😊","😎","👻","🤖","😸","😽","💨","💬","💭","👋", "👌","👏","🙌","🙆","🐕","🐈","🦁","🐷","🦔","🐥","🐡","🐙","🍣","🕌","🌟","🔥","🌊","🎃","✨","🎉","⛳","🔖","📝","🗂","📌"];
  return emojiList[Math.floor(Math.random() * emojiList.length)];
};

export interface SlugsForLinkUri {
  articleSlug?: string;
  bookSlug?: string;
  chapter?: {
    bookSlug?: string;
    chapterSlug?: string;
  };
}

/**
 * zenn.dev上のコンテンツへのUriを作成する
 */
export const createZennLinkUri = (
  type: ContentsType,
  slugs: SlugsForLinkUri
) => {
  const { articleSlug, bookSlug, chapter } = slugs;
  switch (type) {
    case "article":
      return `${ZENN_LINK_BASE_URL}/articles/${articleSlug}`;
    case "book":
      return `${ZENN_LINK_BASE_URL}/books/${bookSlug}`;
    case "bookConfig":
      return `${ZENN_LINK_BASE_URL}/books/${bookSlug}`;
    case "bookChapter":
      return `${ZENN_LINK_BASE_URL}/books/${chapter?.bookSlug}?chapter_slug=${chapter?.chapterSlug}`;
  }
};
