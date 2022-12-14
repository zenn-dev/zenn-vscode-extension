import * as vscode from "vscode";

import { createFileSystemWatcher } from "../../utils/vscodeHelpers";
import { AppContext } from "../app";

/**
 * 本のエディターイベントの初期化処理
 */
export const initializeBookEditor = (
  context: AppContext
): vscode.Disposable[] => {
  const {
    cache,
    workspaceUri: rootUri,
    getContentsType,
    dispatchContentsEvent,
  } = context;

  // 本のフォルダーを監視するためのWatcher
  const bookWatcher = createFileSystemWatcher(
    new vscode.RelativePattern(rootUri, "books/*"),
    { updated: false }
  );

  // 本のフォルダーが作成された時
  bookWatcher.onDidCreate((uri) => {
    if (getContentsType(uri) !== "book") return;
    const payload = { type: "book", uri } as const;
    dispatchContentsEvent({ type: "create-content", payload });
  });

  // 本のフォルダーが削除された時
  bookWatcher.onDidDelete((uri) => {
    if (!cache.deleteCacheWithType("book", uri)) return;
    const payload = { type: "book", uri } as const;
    dispatchContentsEvent({ type: "delete-content", payload });
  });

  return [bookWatcher];
};
