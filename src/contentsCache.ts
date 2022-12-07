import * as vscode from "vscode";

import { ArticleContent } from "./schemas/article";
import { BookContent } from "./schemas/book";
import { BookChapterContent } from "./schemas/bookChapter";
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
  createKey(type: "article", uri: vscode.Uri): ArticleCacheKey;
  createKey(type: "bookChapter", uri: vscode.Uri): BookChapterCacheKey;
  createKey(type: "previewPanel", uri: vscode.Uri): PreviewPanelCacheKey;
  createKey(type: CacheType, uri: vscode.Uri): CacheKey;
  createKey(type: string, uri: vscode.Uri) {
    return `${type}:${uri.path}`;
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

  deleteCacheWithKey(key: CacheKey): boolean {
    return !!this.getCacheObj(this.getCacheType(key))?.delete(key);
  }

  deleteCacheWithType(type: CacheType, uri: vscode.Uri): boolean {
    return !!this.getCacheObj(type)?.delete(this.createKey(type, uri));
  }
}
