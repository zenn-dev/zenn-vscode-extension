import * as vscode from "vscode";

import { getBookUriFromBookConfigUri } from "../../schemas/bookConfig";
import { createFileSystemWatcher } from "../../utils/vscodeHelpers";
import { AppContext } from "../app";

/**
 * 本の設定ファイルのエディターイベントの初期化処理
 */
export const initializeBookConfigEditor = (
  context: AppContext
): vscode.Disposable[] => {
  const { cache, workspaceUri, dispatchContentsEvent } = context;

  // 本の設定ファイルを監視するためのWatcher
  const bookConfigWatcher = createFileSystemWatcher(
    new vscode.RelativePattern(workspaceUri, "books/**/*.{yml,yaml}")
  );

  // 本の設定ファイルが作成された時
  bookConfigWatcher.onDidCreate((uri) => {
    const bookUri = getBookUriFromBookConfigUri(uri);
    const payload = { type: "book", uri: bookUri } as const;

    cache.deleteCacheWithType("book", bookUri);
    dispatchContentsEvent({ type: "update-content", payload });
  });

  // 本の設定ファイルが更新された時
  bookConfigWatcher.onDidChange((uri) => {
    const bookUri = getBookUriFromBookConfigUri(uri);
    const payload = { type: "book", uri: bookUri } as const;

    cache.deleteCacheWithType("book", bookUri);
    dispatchContentsEvent({ type: "update-content", payload });
  });

  // 本の設定ファイルが削除された時
  bookConfigWatcher.onDidDelete((uri) => {
    const bookUri = getBookUriFromBookConfigUri(uri);
    const payload = { type: "book", uri: bookUri } as const;

    cache.deleteCacheWithType("book", bookUri);
    dispatchContentsEvent({ type: "update-content", payload });
  });

  return [bookConfigWatcher];
};
