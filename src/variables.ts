import { GuideDocsMeta } from "./schemas/guide";

import * as pkg from "../package.json";

/** この拡張機能のID */
export const APP_ID = pkg.name;

/** コマンドを実行するときなどに使うID */
export const APP_COMMAND = {
  /** プレビュー */
  PREVIEW: pkg.contributes.commands[0].command,

  /** 記事新規作成 */
  NEW_ARTICLE: pkg.contributes.commands[1].command,

  /** 本の新規作成 */
  NEW_BOOK: pkg.contributes.commands[2].command,

  /** 記事一覧の再取得 */
  REFRESH_ARTICLES: pkg.contributes.commands[3].command,

  /** 本一覧の再取得 */
  REFRESH_BOOKS: pkg.contributes.commands[4].command,

  /** チャプターの新規作成 */
  NEW_CHAPTER: pkg.contributes.commands[5].command,

  /* ガイドを開く */
  OPEN_GUIDE: pkg.contributes.commands[6].command,

  /* ガイドを開く */
  REVEAL_FILE: pkg.contributes.commands[7].command,
} as const;

/**
 * TreeViewのID
 */
export const TREE_VIEW_ID = {
  ARTICLES: pkg.contributes.views["zenn-preview"][0].id,
  BOOKS: pkg.contributes.views["zenn-preview"][1].id,
  GUIDES: pkg.contributes.views["zenn-preview"][2].id,
} as const;

/**
 * ガイド記事用のベースURL
 */
export const GUIDE_DOCS_BASE_URL = "https://zenn.dev/zenn/articles/";

/**
 * ガイドのメタデータ
 */
export const GUIDE_DOCS_META_DATA: GuideDocsMeta[] = [
  {
    title: "記事の作成ガイド",
    slug: "zenn-cli-guide",
    hash: "cli-で記事（article）を管理する",
    emoji: "📝",
  },
  {
    title: "本の作成ガイド",
    slug: "zenn-cli-guide",
    hash: "cli-で本（book）を管理する",
    emoji: "📚",
  },
  {
    title: "画像管理ガイド",
    slug: "deploy-github-images",
    emoji: "🏞",
    isBeta: true,
  },
  {
    title: "github.devでの編集ガイド",
    slug: "usage-github-dev",
    emoji: "🚀",
    isBeta: true,
  },
  {
    title: "マークダウン記法",
    slug: "markdown-guide",
    emoji: "🖋️",
  },
];
