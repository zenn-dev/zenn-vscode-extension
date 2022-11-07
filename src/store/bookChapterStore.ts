import * as vscode from "vscode";

import { BookStore } from "./bookStore";
import { ContentsStoreBase } from "./common";

import {
  BookChapterContent,
  BookChapterLoadResult,
  createBookChapterContent,
  loadBookChapter,
} from "../schemas/bookChapter";
import { ZennContentError } from "../schemas/types";
import { getFilenameFromUrl } from "../utils/vscodeHelpers";

export class BookChapterStore extends ContentsStoreBase<BookChapterLoadResult> {
  readonly storeId = "bookChapters";

  private readonly bookStore: BookStore;

  constructor(bookStore: BookStore) {
    super();
    this.bookStore = bookStore;

    // 本一覧が更新されるときはキャッシュを削除する
    bookStore.addEventListener((event) => {
      if (event.type === "refresh") this.store.clear();
    });
  }

  protected async createContent(
    uri: vscode.Uri,
    text: string
  ): Promise<BookChapterLoadResult> {
    const bookUri = this.bookStore.getBookUri(uri);

    if (bookUri) return createBookChapterContent(bookUri, uri, text);

    return new ZennContentError(
      `${getFilenameFromUrl(uri) || "チャプター"}の取得に失敗しました`,
      uri
    );
  }

  getBookChapter(uri: vscode.Uri): BookChapterContent | undefined {
    const key = this.getKey(uri);
    const item = this.getItem(key);
    return ZennContentError.isError(item) ? void 0 : item;
  }

  async loadBookChapter(
    bookUri: vscode.Uri,
    uri: vscode.Uri
  ): Promise<BookChapterLoadResult> {
    const cache = this.getBookChapter(uri);
    if (cache) return cache;

    const result = await loadBookChapter(bookUri, uri);

    const key = this.getKey(result.uri);
    this.setItem(key, result);

    return result;
  }
}
