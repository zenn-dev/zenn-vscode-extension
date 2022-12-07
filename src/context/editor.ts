import * as vscode from "vscode";

import { AppContext } from "../context/app";

/**
 * エディターの初期化処理
 */
export const initializeEditor = (context: AppContext): vscode.Disposable[] => {
  const { cache, getContentsType, dispatchContentsEvent: dispatch } = context;

  const watcher = vscode.workspace.createFileSystemWatcher(
    new vscode.RelativePattern(
      context.workspaceUri,
      "{articles,books}/**/*.{md,yml,yaml,png,jpeg}"
    )
  );

  return [
    watcher,

    // ファイルが作成された時
    // `vscode.workspace.onDidCreateFiles()`ではイベントが発火しない場合があるので、
    // `watcher.onDidCreate()`を使用しています。
    watcher.onDidCreate((uri) => {
      const type = getContentsType(uri);
      if (!type) return;

      dispatch({ type: "create-content", payload: { type, uri } });
    }),

    // ファイル名が変更されたとき
    vscode.workspace.onDidRenameFiles(async (event) => {
      event.files.forEach(({ oldUri, newUri }) => {
        const oldType = getContentsType(oldUri);
        const newType = getContentsType(newUri);

        if (oldType) {
          cache.deleteCacheWithType(oldType, oldUri);
        }

        if (newType) {
          const payload = { type: newType, uri: newUri };
          dispatch({ type: "create-content", payload });
        }
      });
    }),

    // ファイルが削除されたとき
    vscode.workspace.onDidDeleteFiles(async (event) => {
      event.files.forEach((uri) => {
        const type = getContentsType(uri);
        if (!type) return;
        if (!cache.deleteCacheWithType(type, uri)) return;

        dispatch({ type: "delete-content", payload: { type, uri } });
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
