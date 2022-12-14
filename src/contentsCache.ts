import * as vscode from "vscode";

import { ArticleContent } from "./schemas/article";
import { BookContent } from "./schemas/book";
import { BookChapterContent } from "./schemas/bookChapter";
import { getBookUriFromBookConfigUri } from "./schemas/bookConfig";
import { getBookUriFromCoverImageUri } from "./schemas/bookCoverImage";
import { PreviewPanel } from "./schemas/previewPanel";
import { Contents, ContentsType } from "./types";

export type ArticleCacheKey = `article:${string}`;
export type BookCacheKey = `book:${string}`;
export type BookChapterCacheKey = `bookChapter:${string}`;
export type PreviewPanelCacheKey = `previewPanel:${string}`;

export type CacheType = ContentsType | "previewPanel";
export type CacheValue = Contents | PreviewPanel;
export type CacheKey = `${CacheType}:${string}`;

/**
 * コンテンツのキャッシュを管理するクラス
 */
export class ContentsCache {
  private readonly caches = {
    article: new Map<string, ArticleContent>(),
    book: new Map<string, BookContent>(),
    bookChapter: new Map<string, BookChapterContent>(),
    previewPanel: new Map<string, PreviewPanel>(),
  };

  private getCacheObj(type: CacheType): Map<string, CacheValue> | undefined {
    type CacheKeys = keyof typeof this.caches;
    return this.caches[type as CacheKeys];
  }

  getCacheType(key: CacheKey): CacheType {
    return key.split(":")[0] as CacheType;
  }

  createKey(type: "book", uri: vscode.Uri): BookCacheKey;
  createKey(type: "bookConfig", uri: vscode.Uri): BookCacheKey;
  createKey(type: "article", uri: vscode.Uri): ArticleCacheKey;
  createKey(type: "bookChapter", uri: vscode.Uri): BookChapterCacheKey;
  createKey(type: "bookCoverImage", uri: vscode.Uri): BookChapterCacheKey;
  createKey(type: "previewPanel", uri: vscode.Uri): PreviewPanelCacheKey;
  createKey(type: CacheType, uri: vscode.Uri): CacheKey;
  createKey(type: CacheType, uri: vscode.Uri) {
    switch (type) {
      case "article":
      case "book":
      case "bookChapter":
      case "previewPanel":
        return `${type}:${uri.path}`;
      case "bookConfig":
        return `book:${getBookUriFromBookConfigUri(uri).path}`;
      case "bookCoverImage":
        return `book:${getBookUriFromCoverImageUri(uri).path}`;
    }
  }

  getCache(key: BookCacheKey): BookContent | undefined;
  getCache(key: ArticleCacheKey): ArticleContent | undefined;
  getCache(key: BookChapterCacheKey): BookChapterContent | undefined;
  getCache(key: PreviewPanelCacheKey): PreviewPanel;
  getCache(key: CacheKey): Contents;
  getCache(key: CacheKey) {
    const type = this.getCacheType(key);
    return this.getCacheObj(type)?.get(key);
  }

  setCache(key: BookCacheKey, value: BookContent): void;
  setCache(key: ArticleCacheKey, value: ArticleContent): void;
  setCache(key: BookChapterCacheKey, value: BookChapterContent): void;
  setCache(key: PreviewPanelCacheKey, value: PreviewPanel): void;
  setCache(key: CacheKey, value: CacheValue): void;
  setCache(key: CacheKey, value: CacheValue) {
    const type = this.getCacheType(key);
    this.getCacheObj(type)?.set(key, value);
  }

  deleteCache(key: CacheKey): boolean {
    return !!this.getCacheObj(this.getCacheType(key))?.delete(key);
  }

  deleteCacheWithType(type: CacheType, uri: vscode.Uri): boolean {
    return this.deleteCache(this.createKey(type, uri));
  }
}
