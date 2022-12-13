import * as vscode from "vscode";

import { AppContext } from "../context/app";
import { ContentsType } from "../types";

/**
 * エディターの初期化処理
 */
export const initializeEditor = (context: AppContext): vscode.Disposable[] => {
  const { cache, getContentsType, dispatchContentsEvent: dispatch } = context;

  // コンテンツファイルを監視するためのwatcher
  const fileWatcher = vscode.workspace.createFileSystemWatcher(
    new vscode.RelativePattern(
      context.workspaceUri,
      "{articles,books}/**/*.{md,yml,yaml,png,jpg,jpeg,gif,webp}"
    )
  );

  // 本のフォルダーを監視するためのwatcher
  const bookFolderWatcher = vscode.workspace.createFileSystemWatcher(
    new vscode.RelativePattern(context.workspaceUri, "books/*")
  );

  const deleteCache = (type: ContentsType, uri: vscode.Uri): boolean => {
    return cache.deleteCache(cache.createKey(type, uri));
  };

  return [
    fileWatcher,
    bookFolderWatcher,

    // ファイルが作成された時。
    // note:
    // `vscode.workspace.onDidCreateFiles()`ではイベントが発火しない場合があるので、
    // `watcher.onDidCreate()`の方を使う
    fileWatcher.onDidCreate((uri) => {
      const type = getContentsType(uri);
      if (!type) return;

      dispatch({ type: "create-content", payload: { type, uri } });
    }),

    bookFolderWatcher.onDidCreate((uri) => {
      const type = getContentsType(uri);
      if (type !== "book") return;
      dispatch({ type: "create-content", payload: { type, uri } });
    }),

    // ファイルが更新されたとき
    vscode.workspace.onDidSaveTextDocument((doc) => {
      const uri = doc.uri;
      const type = getContentsType(uri);

      if (!type) return;

      deleteCache(type, uri);
      dispatch({ type: "update-content", payload: { type, uri } });
    }),

    // ファイル名が変更されたとき
    vscode.workspace.onDidRenameFiles(async (event) => {
      event.files.forEach(({ oldUri, newUri }) => {
        const oldType = getContentsType(oldUri);
        const newType = getContentsType(newUri);

        if (oldType) {
          deleteCache(oldType, oldUri);
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
        if (!deleteCache(type, uri)) return;

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
