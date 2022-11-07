import * as vscode from "vscode";

import { ZennContentBase, ZennContentError, ContentsLoadResult } from "./types";

import { parseFrontMatter } from "../utils/helpers";
import { FRONT_MATTER_PATTERN } from "../utils/patterns";
import { openTextDocument, getFilenameFromUrl } from "../utils/vscodeHelpers";

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
export interface BookChapterContent extends ZennContentBase {
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
 * 本のチャプターを作成する
 */
export const createBookChapterContent = (
  bookUri: vscode.Uri,
  uri: vscode.Uri,
  text: string
): BookChapterContent => {
  const filename = getFilenameFromUrl(uri) || "";

  return {
    uri,
    bookUri,
    filename,
    type: "bookChapter",
    markdown: text.replace(FRONT_MATTER_PATTERN, ""),
    value: {
      slug: filename.replace(".md", ""),
      ...parseFrontMatter(text),
    },
  };
};

/**
 * 本のチャプター情報を取得する
 */
export const loadBookChapter = async (
  bookUri: vscode.Uri,
  uri: vscode.Uri
): Promise<BookChapterLoadResult> => {
  return openTextDocument(uri)
    .then((doc) => createBookChapterContent(bookUri, uri, doc.getText()))
    .catch(() => {
      const filename = getFilenameFromUrl(uri) || "チャプター";
      return new ZennContentError(`${filename}の取得に失敗しました`, uri);
    });
};
