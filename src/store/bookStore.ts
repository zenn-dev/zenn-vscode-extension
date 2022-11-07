import * as vscode from "vscode";

import { ContentsStoreBase } from "./common";

import {
  BookContent,
  BookLoadResult,
  createBookChapterMeta,
  loadBookContent,
  loadBookContents,
} from "../schemas/book";
import { ZennContentError } from "../schemas/types";
import { parseYaml } from "../utils/helpers";
import { SLUG_PATTERN } from "../utils/patterns";
import { toVSCodeUri } from "../utils/vscodeHelpers";

export class BookStore extends ContentsStoreBase<BookLoadResult> {
  readonly storeId = "books";
  readonly booksFolderUri: vscode.Uri;
  readonly bookFolderPattern: RegExp;

  constructor(booksFolderUri: vscode.Uri) {
    super();

    this.booksFolderUri = booksFolderUri;
    this.bookFolderPattern = new RegExp(
      `(^${this.booksFolderUri}/${SLUG_PATTERN.source})`
    );
  }

  protected getKey(uri?: vscode.Uri): string {
    const bookUri = this.getBookUri(uri);
    return super.getKey(bookUri);
  }

  protected async createContent(
    uri: vscode.Uri,
    text: string
  ): Promise<BookLoadResult> {
    const bookUri = this.getBookUri(uri);
    return bookUri
      ? loadBookContent(bookUri)
      : new ZennContentError("本の取得に失敗しました", uri);
  }

  getBookUri(uri?: vscode.Uri): vscode.Uri | undefined {
    const path = uri?.toString().match(this.bookFolderPattern)?.[1];
    return path ? toVSCodeUri(path) : void 0;
  }

  getBook(uri: vscode.Uri): BookContent | undefined {
    const key = this.getKey(uri);
    const item = this.getItem(key);

    return ZennContentError.isError(item) ? void 0 : item;
  }

  async loadBook(uri: vscode.Uri): Promise<BookLoadResult> {
    // キャッシュがあればキャッシュを返す
    const key = this.getKey(uri);
    const cache = this.getItem(key);
    if (cache && !ZennContentError.isError(cache)) return cache;

    // 本以外のUriが渡されることがあるので、本のUriに変換する
    const bookUri = this.getBookUri(uri);
    if (!bookUri) return new ZennContentError("本の取得に失敗しました");

    const book = await loadBookContent(bookUri);

    this.setItem(key, book);

    return book;
  }

  async loadBooks(force?: boolean): Promise<BookLoadResult[]> {
    // キャッシュがある場合はキャッシュを返す
    if (!force && this.store.size > 0) return [...this.store.values()];

    // forceフラグが`true`ならキャッシュを削除
    if (force) this.store.clear();

    const results = await loadBookContents(this.booksFolderUri);

    results.forEach((result) => {
      const key = this.getKey(result.uri);
      this.setItem(key, result);
    });

    return results;
  }

  async refresh() {
    await this.loadBooks(true);
    this.dispatch({ type: "refresh" });
  }
}
