import * as vscode from "vscode";

import { getBookUriFromCoverImageUri } from "../../schemas/bookCoverImage";
import { createFileSystemWatcher } from "../../utils/vscodeHelpers";
import { AppContext } from "../app";

/**
 * 本のカバー画像のエディターイベントの初期化処理
 */
export const initializeBookCoverImageEditor = (
  context: AppContext
): vscode.Disposable[] => {
  const { cache, workspaceUri, dispatchContentsEvent } = context;

  // 本のカバー画像を監視するためのWatcher
  const bookCoverImageWatcher = createFileSystemWatcher(
    new vscode.RelativePattern(workspaceUri, "books/**/*.{png,jpg,jpeg,gif,webp}"), // prettier-ignore
    { updated: false }
  );

  // 本のカバー画像が作成された時
  bookCoverImageWatcher.onDidCreate((uri) => {
    const bookUri = getBookUriFromCoverImageUri(uri);
    const payload = { type: "book", uri: bookUri } as const;

    cache.deleteCacheWithType("book", bookUri);
    dispatchContentsEvent({ type: "update-content", payload });
  });

  // 本のカバー画像が削除された時
  bookCoverImageWatcher.onDidDelete((uri) => {
    const bookUri = getBookUriFromCoverImageUri(uri);
    const payload = { type: "book", uri: bookUri } as const;

    cache.deleteCacheWithType("book", bookUri);
    dispatchContentsEvent({ type: "update-content", payload });
  });

  return [bookCoverImageWatcher];
};
