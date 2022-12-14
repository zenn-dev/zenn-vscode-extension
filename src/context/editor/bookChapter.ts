import * as vscode from "vscode";

import { getBookUriFromChapterUri } from "../../schemas/bookChapter";
import { createFileSystemWatcher } from "../../utils/vscodeHelpers";
import { AppContext } from "../app";

/**
 * 本のチャプターのエディターイベントの初期化処理を行う
 */
export const initializeBookChapterEditor = (
  context: AppContext
): vscode.Disposable[] => {
  const { cache, workspaceUri, dispatchContentsEvent } = context;

  // 本のチャプターファイルを監視するためのWatcher
  const bookChapterFileWatcher = createFileSystemWatcher(
    new vscode.RelativePattern(workspaceUri, "books/**/*.md")
  );

  bookChapterFileWatcher.onDidCreate((uri) => {
    const payload = { type: "bookChapter", uri } as const;

    cache.deleteCacheWithType("book", getBookUriFromChapterUri(uri));
    dispatchContentsEvent({ type: "create-content", payload });
  });

  bookChapterFileWatcher.onDidChange((uri) => {
    const payload = { type: "bookChapter", uri } as const;

    cache.deleteCacheWithType("bookChapter", uri);
    dispatchContentsEvent({ type: "update-content", payload });
  });

  bookChapterFileWatcher.onDidDelete((uri) => {
    const payload = { type: "bookChapter", uri } as const;

    cache.deleteCacheWithType("bookChapter", uri);
    cache.deleteCacheWithType("book", getBookUriFromChapterUri(uri));
    dispatchContentsEvent({ type: "delete-content", payload });
  });

  return [bookChapterFileWatcher];
};
