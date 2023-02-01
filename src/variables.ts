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
export const GUIDE_DOCS_BASE_URL = {
  docsUrl: "https://zenn.dev/zenn/articles/",
  apiRoot: "https://zenn.dev/api/articles/",
};

/**
 * ガイドのメタデータ
 */
export const GUIDE_DOCS_META_DATA: GuideDocsMeta[] = [
  {
    title: "記事の作成ガイド",
    slug: "zenn-cli-guide",
    hash: "cli-%E3%81%A7%E8%A8%98%E4%BA%8B%EF%BC%88article%EF%BC%89%E3%82%92%E7%AE%A1%E7%90%86%E3%81%99%E3%82%8B",
    emoji: "📝",
  },
  {
    title: "本の作成ガイド",
    slug: "zenn-cli-guide",
    hash: "cli-%E3%81%A7%E6%9C%AC%EF%BC%88book%EF%BC%89%E3%82%92%E7%AE%A1%E7%90%86%E3%81%99%E3%82%8B",
    emoji: "📚",
  },
  {
    title: "画像管理ガイド",
    slug: "deploy-github-images",
    emoji: "🏞",
    isBeta: true,
  },
  {
    title: "マークダウン記法",
    slug: "markdown-guide",
    emoji: "🖋️",
  },
  {
    title: "github.devでの編集方法",
    slug: "usage-github-dev",
    emoji: "🚀",
    isBeta: true,
  },
];
