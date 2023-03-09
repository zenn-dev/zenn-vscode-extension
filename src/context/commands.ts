import * as vscode from "vscode";

import { AppContext } from "./app";

import { newArticleCommand } from "../commands/newArticle";
import { newBookCommand } from "../commands/newBook";
import { newChapterCommand } from "../commands/newChapter";
import { openGuideCommand } from "../commands/openGuide";
import { openZennDevCommand } from "../commands/openZennDev";
import { previewCommand } from "../commands/preview";
import { refreshArticlesCommand } from "../commands/refreshArticles";
import { refreshBooksCommand } from "../commands/refreshBooks";
import { revealActiveFileCommand } from "../commands/revealActiveFile";
import { APP_COMMAND } from "../variables";

/**
 * コマンドの初期化処理
 */
export const initializeCommands = (
  context: AppContext
): vscode.Disposable[] => {
  return [
    // 記事ファイルの作成コマンド
    vscode.commands.registerCommand(
      APP_COMMAND.NEW_ARTICLE,
      newArticleCommand(context)
    ),

    // 本テンプレートの作成コマンド
    vscode.commands.registerCommand(
      APP_COMMAND.NEW_BOOK,
      newBookCommand(context)
    ),

    // プレビューコマンドを設定
    vscode.commands.registerCommand(
      APP_COMMAND.PREVIEW,
      previewCommand(context)
    ),

    // 記事一覧を再取得する
    vscode.commands.registerCommand(
      APP_COMMAND.REFRESH_ARTICLES,
      refreshArticlesCommand(context)
    ),

    // 本一覧を再取得する
    vscode.commands.registerCommand(
      APP_COMMAND.REFRESH_BOOKS,
      refreshBooksCommand(context)
    ),

    // チャプターファイルの作成コマンド
    vscode.commands.registerCommand(
      APP_COMMAND.NEW_CHAPTER,
      newChapterCommand(context)
    ),

    // ガイドを開く
    vscode.commands.registerCommand(
      APP_COMMAND.OPEN_GUIDE,
      openGuideCommand(context)
    ),

    // ツリービューでアクティブなファイルを表示するコマンド
    vscode.commands.registerCommand(
      APP_COMMAND.REVEAL_ACTIVE_FILE,
      revealActiveFileCommand(context)
    ),

    // Zenn.dev上でコンテンツを開くコマンド
    vscode.commands.registerCommand(
      APP_COMMAND.OPEN_ZENN_DEV,
      openZennDevCommand(context)
    ),
  ];
};
