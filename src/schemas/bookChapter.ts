import * as vscode from "vscode";

import { Book, loadBookContent } from "./book";
import { ContentError } from "./error";
import { withCache } from "./utils";

import { AppContext } from "../context/app";
import { ContentBase, ContentsLoadResult, PreviewContentBase } from "../types";
import { parseFrontMatter } from "../utils/helpers";
import { markdownToHtml } from "../utils/markdownHelpers";
import { FRONT_MATTER_PATTERN } from "../utils/patterns";
import {
  openTextDocument,
  getFilenameFromUrl,
  toPath,
} from "../utils/vscodeHelpers";

/**
 * 本のチャプターのメタ情報
 */
export interface BookChapter {
  slug?: string;
  title?: string;
  free?: boolean;
}

/**
 * 本のチャプター情報を全て含んだ型
 */
export interface BookChapterContent extends ContentBase {
  type: "bookChapter";
  markdown: string;
  value: BookChapter;
  bookUri: vscode.Uri;
}

/**
 * 本のチャプター情報の取得結果の型
 */
export type BookChapterLoadResult = ContentsLoadResult<BookChapterContent>;

/**
 * 本のチャプターのプレビュー時(postMessage)に使うデータ型
 */
export interface BookChapterPreviewContent extends PreviewContentBase {
  type: "bookChapter";
  html: string;
  book: Book;
  bookPath: string;
  bookFilename: string;
  chapter: BookChapter;
}

/**
 * チャプターのURIから本のURIを取り出す
 */
export const getBookUriFromChapterUri = (uri: vscode.Uri) => {
  return vscode.Uri.parse(uri.toString().replace(/\/[^\/]+\.md$/, ""));
};

/**
 * 本のチャプターを作成する
 */
export const createBookChapterContent = (
  uri: vscode.Uri,
  text: string
): BookChapterContent => {
  const filename = getFilenameFromUrl(uri) || "";

  return {
    uri,
    filename,
    type: "bookChapter",
    bookUri: getBookUriFromChapterUri(uri),
    markdown: text.replace(FRONT_MATTER_PATTERN, ""),
    value: {
      ...parseFrontMatter(text),
      slug: filename.replace(".md", ""),
    },
  };
};

/**
 * 本のチャプター情報を取得する
 */
export const loadBookChapterContent = withCache(
  ({ cache }, uri) => cache.createKey("bookChapter", uri),

  async (uri: vscode.Uri): Promise<BookChapterLoadResult> => {
    return openTextDocument(uri)
      .then((doc) => createBookChapterContent(uri, doc.getText()))
      .catch(() => {
        const filename = getFilenameFromUrl(uri) || "チャプター";
        return new ContentError(`${filename}の取得に失敗しました`, uri);
      });
  }
);

export const loadBookChapterPreviewContent = async (
  context: AppContext,
  uri: vscode.Uri,
  panel: vscode.WebviewPanel
): Promise<BookChapterPreviewContent> => {
  const chapter = await loadBookChapterContent(context, uri);
  if (ContentError.isError(chapter)) throw chapter;

  const book = await loadBookContent(context, chapter.bookUri);
  if (ContentError.isError(book)) throw book;

  return {
    type: "bookChapter",
    book: book.value,
    chapter: chapter.value,
    path: toPath(chapter.uri),
    filename: chapter.filename,
    bookPath: toPath(book.uri),
    bookFilename: book.filename,
    html: markdownToHtml(chapter.markdown, panel),
    panelTitle: `${
      chapter.value.title || chapter.filename || "チャプター"
    } のプレビュー`,
  };
};
