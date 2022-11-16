import * as vscode from "vscode";

import { ContentsCache } from "../contentsCache";
import { ContentsType } from "../types";
import { ContentsEvent } from "../types";
import { SLUG_PATTERN } from "../utils/patterns";

type EventCallback = (event: ContentsEvent) => void;

/**
 * 拡張内で使用するデータをまとめた型
 */
export interface AppContext {
  readonly cache: ContentsCache;
  readonly workspaceUri: vscode.Uri;
  readonly booksFolderUri: vscode.Uri;
  readonly articlesFolderUri: vscode.Uri;
  readonly extension: vscode.ExtensionContext;
  dispatchContentsEvent(event: ContentsEvent): void;
  getContentsType(uri: vscode.Uri): ContentsType | undefined;
  listenContentsEvent(callback: EventCallback): vscode.Disposable;
}

/**
 * AppContext を作成する
 */
export const createAppContext = (
  extension: vscode.ExtensionContext
): AppContext | null => {
  const workspaceUri = vscode.workspace.workspaceFolders?.[0].uri;

  if (!workspaceUri) return null;

  const callbacks = new Set<EventCallback>();
  const slug = SLUG_PATTERN.source;
  const booksFolderUri = vscode.Uri.joinPath(workspaceUri, "books");
  const articlesFolderUri = vscode.Uri.joinPath(workspaceUri, "articles");
  const patterns = {
    book: new RegExp(`^${booksFolderUri}/${slug}/?$`),
    article: new RegExp(`^${articlesFolderUri}/${slug}\\.md$`),
    bookConfig: new RegExp(`^${booksFolderUri}/${slug}/config\\.(?:yaml|yml)$`),
    bookChapter: new RegExp(`^${booksFolderUri}/${slug}/(?:\\d+\\.)?${slug}\\.md$`), // prettier-ignore
  };

  return {
    extension,
    workspaceUri,
    booksFolderUri,
    articlesFolderUri,
    cache: new ContentsCache(),

    getContentsType: (uri: vscode.Uri): ContentsType | undefined => {
      const path = uri.toString();

      if (patterns.article.test(path)) return "article";
      if (patterns.book.test(path)) return "book";
      if (patterns.bookConfig.test(path)) return "bookConfig";
      if (patterns.bookChapter.test(path)) return "bookChapter";
    },

    dispatchContentsEvent: (event) => {
      callbacks.forEach((cb) => cb(event));
    },

    listenContentsEvent: (cb) => {
      callbacks.add(cb);

      return {
        dispose: () => {
          callbacks.delete(cb);
        },
      };
    },
  };
};
