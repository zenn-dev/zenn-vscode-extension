import * as vscode from "vscode";

import { newArticleCommand } from "../commands/newArticle";
import { newBookCommand } from "../commands/newBook";
import { ZennContext } from "../context/app";
import { ZennContentsType } from "../schemas/types";
import { APP_COMMAND } from "../variables";

/**
 * エディターの初期化処理
 */
export const initializeEditor = (context: ZennContext): vscode.Disposable[] => {
  const watcher = vscode.workspace.createFileSystemWatcher(
    new vscode.RelativePattern(context.workspaceUri, "**/*.{md,yml,yaml}")
  );

  const {
    bookStore,
    articleStore,
    bookChapterStore,
    panelStore,
    getZennContentsType,
  } = context;

  const updateContents = (
    type: ZennContentsType,
    uri: vscode.Uri,
    text: string
  ) => {
    switch (type) {
      case "article":
        articleStore.updateContent(uri, text);
        break;
      case "book":
      case "bookConfig":
        bookStore.updateContent(uri, text);
        break;
      case "bookChapter":
        bookChapterStore.updateContent(uri, text);
        break;
    }
  };

  return [
    watcher,

    // ファイルが作成されたとき
    watcher.onDidCreate(async (uri) => {
      const type = getZennContentsType(uri);

      if (!type) return;

      const file = await vscode.workspace.openTextDocument(uri);

      updateContents(type, uri, file.getText());
    }),

    // ファイルが更新されたとき
    vscode.workspace.onDidSaveTextDocument((document) => {
      const uri = document.uri;
      const type = getZennContentsType(uri);

      if (!type) return;

      updateContents(type, uri, document.getText());
    }),

    // ファイル名が変更されたとき
    vscode.workspace.onDidRenameFiles(async (event) => {
      const typeList = event.files
        .flatMap((file) => [
          getZennContentsType(file.oldUri),
          getZennContentsType(file.newUri),
        ])
        .filter((type) => !!type);

      if (!typeList.length) return;

      await Promise.all([articleStore.refresh(), bookStore.refresh()]);
    }),

    // ファイルが削除されたとき
    vscode.workspace.onDidDeleteFiles(async (event) => {
      event.files.forEach((uri) => {
        articleStore.deleteContent(uri);
        bookStore.deleteContent(uri);
        bookChapterStore.deleteContent(uri);
      });
    }),

    // エディターのフォーカスが変更されたとき
    vscode.window.onDidChangeActiveTextEditor((event) => {
      if (!event || !event.viewColumn) return;

      const panel = panelStore.getPanel(event.document.uri);

      if (!panel) return;
      if (event.viewColumn === panel.getViewColumn()) return;

      // プレビューパネルを開く
      panel?.open(true);
    }),

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
  ];
};
