import * as vscode from "vscode";

import { Article } from "../schemas/article";
import { Book, BookChapterMeta } from "../schemas/book";
import { BookChapter } from "../schemas/bookChapter";
import { ZennContentsType } from "../schemas/types";

export interface PreviewContentBase {
  path: string;
  filename: string;
  type: ZennContentsType;
}

/** 記事のプレビュー時(postMessage)に使うデータ型 */
export interface ArticlePreviewContent extends PreviewContentBase {
  type: "article";
  html: string;
  article: Article;
}

export interface PreviewChapterMeta {
  path: string;
  slug: string;
  title: string | undefined | null;
}

/** 本のプレビュー時(postMessage)に使うデータ型 */
export interface BookPreviewContent extends PreviewContentBase {
  type: "book";
  book: Book;
  coverImagePath: string | null;
  chapters: PreviewChapterMeta[];
}

/** 本のチャプターのプレビュー時(postMessage)に使うデータ型 */
export interface BookChapterPreviewContents extends PreviewContentBase {
  type: "bookChapter";
  html: string;
  book: Book;
  bookPath: string;
  bookFilename: string;
  chapter: BookChapter;
}

/**
 * プレビュー時に扱うコンテンツのデータ型
 */
export type ZennPreviewContents =
  | ArticlePreviewContent
  | BookPreviewContent
  | BookChapterPreviewContents;

/**
 * プレビュー時に扱うコンテンツの種別
 */
export type ZennPreviewContentsType = ZennPreviewContents["type"];

/**
 * プレビューパネルとの通信で使用するイベント型
 */
export type ZennPreviewEvent =
  | {
      type: "READY_PREVIEW";
      payload?: never;
      result?: ZennPreviewContents;
    }
  | {
      type: "UPDATE_PREVIEW";
      payload?: never;
      result?: ZennPreviewContents;
    }
  | {
      type: "OPEN_PREVIEW";
      payload: { openPath: string };
      result?: never;
    };
