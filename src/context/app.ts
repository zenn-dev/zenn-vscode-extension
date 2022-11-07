import * as vscode from "vscode";

import { ZennContents, ZennContentsType } from "../schemas/types";
import { ArticleStore } from "../store/articleStore";
import { BookChapterStore } from "../store/bookChapterStore";
import { BookStore } from "../store/bookStore";
import { PreviewPanelStore } from "../store/panelStore";
import { SLUG_PATTERN } from "../utils/patterns";

/**
 * 拡張内で使用するデータをまとめた型
 */
export interface ZennContext {
  readonly workspaceUri: vscode.Uri;
  readonly booksFolderUri: vscode.Uri;
  readonly articlesFolderUri: vscode.Uri;
  readonly extension: vscode.ExtensionContext;
  readonly bookStore: BookStore;
  readonly articleStore: ArticleStore;
  readonly bookChapterStore: BookChapterStore;
  readonly panelStore: PreviewPanelStore;
  getZennContents(uri: vscode.Uri): ZennContents | undefined;
  getZennContentsType(uri: vscode.Uri): ZennContentsType | undefined;
}

/**
 * ZennContext を作成する
 */
export const createZennContext = (
  extension: vscode.ExtensionContext
): ZennContext | null => {
  const workspaceUri = vscode.workspace.workspaceFolders?.[0].uri;

  if (!workspaceUri) return null;

  const slug = SLUG_PATTERN.source;
  const booksFolderUri = vscode.Uri.joinPath(workspaceUri, "books");
  const articlesFolderUri = vscode.Uri.joinPath(workspaceUri, "articles");

  const bookStore = new BookStore(booksFolderUri);
  const bookChapterStore = new BookChapterStore(bookStore);
  const articleStore = new ArticleStore(articlesFolderUri);
  const panelStore = new PreviewPanelStore();

  const patterns = {
    book: new RegExp(`^${booksFolderUri}/${slug}/?$`),
    article: new RegExp(`^${articlesFolderUri}/${slug}\\.md$`),
    bookConfig: new RegExp(`^${booksFolderUri}/${slug}/config\\.(?:yaml|yml)$`),
    bookChapter: new RegExp(`^${booksFolderUri}/${slug}/(?:\\d+\\.)?${slug}\\.md$`), // prettier-ignore
  };

  const getZennContentsType = (uri: vscode.Uri) => {
    const path = uri.toString();

    if (patterns.article.test(path)) return "article";
    if (patterns.book.test(path)) return "book";
    if (patterns.bookConfig.test(path)) return "bookConfig";
    if (patterns.bookChapter.test(path)) return "bookChapter";
  };

  const getZennContents = (uri: vscode.Uri) => {
    const type = getZennContentsType(uri);

    if (type === "article") return articleStore.getArticle(uri);
    if (type === "bookChapter") return bookChapterStore.getBookChapter(uri);
    if (type === "book" || type === "bookConfig") return bookStore.getBook(uri);
  };

  return {
    extension,
    workspaceUri,
    booksFolderUri,
    articlesFolderUri,
    bookStore,
    articleStore,
    bookChapterStore,
    panelStore,
    getZennContents,
    getZennContentsType,
  };
};
