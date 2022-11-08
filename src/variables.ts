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
} as const;

/**
 * TreeViewのID
 */
export const TREE_VIEW_ID = {
  ARTICLES: pkg.contributes.views["zenn-preview"][0].id,
  BOOKS: pkg.contributes.views["zenn-preview"][1].id,
} as const;
