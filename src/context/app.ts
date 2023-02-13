import * as vscode from "vscode";

import { ContentsCache } from "../contentsCache";
import { ContentsType } from "../types";
import { ContentsEvent } from "../types";
import {
  BOOK_CONFIG_FILE_PATTERN,
  BOOK_COVER_IMAGE_FILE_PATTERN,
} from "../utils/patterns";
import { toFullPath } from "../utils/vscodeHelpers";

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
  const booksFolderUri = vscode.Uri.joinPath(workspaceUri, "books");
  const articlesFolderUri = vscode.Uri.joinPath(workspaceUri, "articles");

  const uriPatterns = {
    book: new RegExp(`^${booksFolderUri}/[^/]+/?$`),
    article: new RegExp(`^${articlesFolderUri}/[^/]+\\.md$`),
    bookChapter: new RegExp(`^${booksFolderUri}/[^/]+/[^/]+\\.md$`),
    bookConfig: new RegExp(`^${booksFolderUri}/[^/]+/${BOOK_CONFIG_FILE_PATTERN.source}$`), // prettier-ignore
    bookCoverImage: new RegExp(`^${booksFolderUri}/[^/]+/${BOOK_COVER_IMAGE_FILE_PATTERN.source}$`), // prettier-ignore
  };

  return {
    extension,
    workspaceUri,
    booksFolderUri,
    articlesFolderUri,
    cache: new ContentsCache(),

    /**
     * Uri から対応する ContentsType を返す
     * @note slug が不正でも ContentsType を取得したい場合があるため、slug は考慮されていません
     */
    getContentsType: (uri: vscode.Uri): ContentsType | undefined => {
      const path = toFullPath(uri); // schemeを含む完全なパス文字列を使用する

      if (uriPatterns.article.test(path)) return "article";
      if (uriPatterns.book.test(path)) return "book";
      if (uriPatterns.bookConfig.test(path)) return "bookConfig";
      if (uriPatterns.bookChapter.test(path)) return "bookChapter";
      if (uriPatterns.bookCoverImage.test(path)) return "bookCoverImage";
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
