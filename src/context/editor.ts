import * as vscode from "vscode";

import { AppContext } from "../context/app";

/**
 * エディターの初期化処理
 */
export const initializeEditor = (context: AppContext): vscode.Disposable[] => {
  const watcher = vscode.workspace.createFileSystemWatcher(
    new vscode.RelativePattern(context.workspaceUri, "**/*.{md,yml,yaml}")
  );

  const { cache, getContentsType, dispatchContentsEvent: dispatch } = context;

  const deleteContentCache = (uri: vscode.Uri) => {
    const type = getContentsType(uri);
    if (!type) return;

    const key = cache.createKey(type, uri);
    cache.deleteCache(key);
  };

  return [
    watcher,

    // ファイルが作成されたとき
    watcher.onDidCreate((uri) => {
      dispatch({ type: "create-content", payload: { uri } });
    }),

    // ファイルが更新されたとき
    vscode.workspace.onDidSaveTextDocument((doc) => {
      deleteContentCache(doc.uri);
      dispatch({ type: "update-content", payload: { uri: doc.uri } });
    }),

    // ファイル名が変更されたとき
    vscode.workspace.onDidRenameFiles(async (event) => {
      event.files.forEach((file) => {
        deleteContentCache(file.oldUri);
        dispatch({ type: "create-content", payload: { uri: file.newUri } });
      });
    }),

    // ファイルが削除されたとき
    vscode.workspace.onDidDeleteFiles(async (event) => {
      event.files.forEach((uri) => {
        deleteContentCache(uri);
        dispatch({ type: "delete-content", payload: { uri } });
      });
    }),

    // エディターのフォーカスが変更されたとき
    vscode.window.onDidChangeActiveTextEditor((event) => {
      if (!event || !event.viewColumn) return;

      const key = cache.createKey("previewPanel", event.document.uri);
      const panel = cache.getCache(key)?.panel;

      if (!panel) return;
      if (event.viewColumn === panel.viewColumn) return;

      // プレビューパネルを開く
      panel.reveal(void 0, true);
    }),
  ];
};
