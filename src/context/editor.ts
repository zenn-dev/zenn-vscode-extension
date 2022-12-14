import * as vscode from "vscode";

import { AppContext } from "../context/app";
import { ContentsType } from "../types";

/**
 * エディターの初期化処理
 */
export const initializeEditor = (context: AppContext): vscode.Disposable[] => {
  const {
    cache,
    workspaceUri,
    getContentsType,
    dispatchContentsEvent: dispatch,
  } = context;

  // watcher を作成する
  // watcher を使う理由は `vscode.workspace.onDidCreateFiles()` では
  // イベントが発火しない場合があるので `watcher.onDidCreate()` の方を使う
  const createFileSystemWatcher = (pattern: string) => {
    const glob = new vscode.RelativePattern(workspaceUri, pattern);
    return vscode.workspace.createFileSystemWatcher(glob, false, true, true);
  };

  // 記事ファイルを監視するためのWatcher
  const articleWatcher = createFileSystemWatcher("articles/*.md");
  // 本のフォルダーを監視するためのWatcher
  const bookWatcher = createFileSystemWatcher("books/*");
  // 本のコンテンツファイルを監視するためのWatcher
  const bookContentsFileWatcher = createFileSystemWatcher(
    "books/**/*.{md,yml,yaml,png,jpg,jpeg,gif,webp}"
  );

  const deleteCache = (type: ContentsType, uri: vscode.Uri): boolean => {
    return cache.deleteCache(cache.createKey(type, uri));
  };

  return [
    articleWatcher,
    bookWatcher,
    bookContentsFileWatcher,

    // 記事ファイルが作成された時
    articleWatcher.onDidCreate((uri) => {
      dispatch({ type: "create-content", payload: { type: "article", uri } });
    }),

    // 本のフォルダーが作成された時
    bookWatcher.onDidCreate((uri) => {
      const type = getContentsType(uri);
      if (type !== "book") return;

      dispatch({ type: "create-content", payload: { type, uri } });
    }),

    // 本のコンテンツファイルが作成された時
    bookContentsFileWatcher.onDidCreate((uri) => {
      const type = getContentsType(uri);
      if (!type) return;

      deleteCache(type, uri); // 設定ファイルやカバー画像を反映するために実行する
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

        if (oldType) deleteCache(oldType, oldUri);

        if (newType) {
          const payload = { type: newType, uri: newUri };

          deleteCache(newType, newUri);
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
