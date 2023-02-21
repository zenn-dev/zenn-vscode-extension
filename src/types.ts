import { ArticleContent, ArticlePreviewContent } from "./schemas/article";
import { BookContent, BookPreviewContent } from "./schemas/book";
import {
  BookChapterContent,
  BookChapterPreviewContent,
} from "./schemas/bookChapter";
import { ContentError } from "./schemas/error";
import { GuideContent } from "./schemas/guide";

import type * as vscode from "vscode";

/**
 * vscode.workspace.fs.readDirectory の返り値の型
 */
export type FileResult = [string, vscode.FileType];

/**
 * コンテンツの種別
 */
export type ContentsType =
  | "article"
  | "book"
  | "bookConfig"
  | "bookCoverImage"
  | "bookChapter"
  | "guide";

/**
 * コンテンツの基底型
 */
export interface ContentBase {
  type: ContentsType;
  filename: string;
  uri: vscode.Uri;
}

/**
 * コンテンツをまとめたUnion型
 */
export type Contents =
  | ArticleContent
  | BookContent
  | BookChapterContent
  | GuideContent;

/**
 * 取得結果の共通型
 */
export type ContentsLoadResult<T> = T | ContentError;

/**
 * コンテンツのイベント
 */
export type ContentsEvent =
  | {
      type: "create-content";
      payload: { uri: vscode.Uri; type: ContentsType };
    }
  | {
      type: "update-content";
      payload: { uri: vscode.Uri; type: ContentsType };
    }
  | {
      type: "delete-content";
      payload: { uri: vscode.Uri; type: ContentsType };
    }
  | {
      type: "refresh";
    }
  | {
      type: "refresh-articles";
    }
  | {
      type: "refresh-books";
    }
  | {
      type: "dispose-preview-panel";
      payload: { uri: vscode.Uri };
    }
  | {
      type: "reveal-active-file";
      payload: { uri: vscode.Uri; force?: boolean };
    }
  | PreviewEvent;

/**
 * プレビューするための基本データ型
 */
export interface PreviewContentBase {
  fullPath: string;
  filename: string;
  panelTitle: string;
  type: ContentsType;
}

/**
 * プレビュー時に扱うコンテンツのデータ型
 */
export type PreviewContents =
  | ArticlePreviewContent
  | BookPreviewContent
  | BookChapterPreviewContent;

/**
 * プレビュー時に扱うコンテンツの種別
 */
export type PreviewContentsType = PreviewContents["type"];

/**
 * プレビューパネルとの通信で使用するイベント型
 */
export type PreviewEvent =
  | {
      type: "ready-preview-panel";
      payload?: never;
      result?: PreviewContents;
    }
  | {
      type: "update-preview-panel";
      payload?: never;
      result?: PreviewContents;
    }
  | {
      type: "open-preview-panel";
      payload: { path: string };
      result?: never;
    };

/**
 * WebView内で保存した値
 */
export interface WebViewState {
  content?: PreviewContents;
}
