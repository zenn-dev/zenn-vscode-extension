import * as vscode from "vscode";

import { ArticleContent } from "./article";
import { BookContent } from "./book";
import { BookChapterContent } from "./bookChapter";

/**
 * コンテンツのエラーを扱うクラス
 */
export class ZennContentError extends Error {
  readonly uri?: vscode.Uri;

  constructor(message: string, uri?: vscode.Uri) {
    super(message);

    this.uri = uri;
  }

  static isError(value: unknown): value is ZennContentError {
    return value instanceof ZennContentError;
  }
}

/**
 * 取得結果の共通型
 */
export type ContentsLoadResult<T> = T | ZennContentError;

/**
 * コンテンツの種別
 */
export type ZennContentsType =
  | "article"
  | "book"
  | "bookConfig"
  | "bookChapter";

/**
 * コンテンツの基底型
 */
export interface ZennContentBase {
  type: ZennContentsType;
  filename: string;
  uri: vscode.Uri;
}

export type ZennContents = ArticleContent | BookContent | BookChapterContent;
