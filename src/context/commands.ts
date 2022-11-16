import * as vscode from "vscode";

import { AppContext } from "./app";

import { newArticleCommand } from "../commands/newArticle";
import { newBookCommand } from "../commands/newBook";
import { previewCommand } from "../commands/preview";
import { refreshArticlesCommand } from "../commands/refreshArticles";
import { refreshBooksCommand } from "../commands/refreshBooks";
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
  ];
};
