import * as vscode from "vscode";

import { ContentsStoreBase } from "./common";

import {
  ArticleContent,
  ArticleLoadResult,
  loadArticleContents,
  createArticleContent,
} from "../schemas/article";
import { ZennContentError } from "../schemas/types";
import { getFilenameFromUrl } from "../utils/vscodeHelpers";

export class ArticleStore extends ContentsStoreBase<ArticleLoadResult> {
  readonly storeId = "articles";
  readonly articlesFolderUri: vscode.Uri;

  constructor(articlesFolderUri: vscode.Uri) {
    super();

    this.articlesFolderUri = articlesFolderUri;
  }

  protected async createContent(
    uri: vscode.Uri,
    text: string
  ): Promise<ArticleLoadResult> {
    try {
      return createArticleContent(uri, text);
    } catch {
      const label = getFilenameFromUrl(uri) || "記事";
      return new ZennContentError(`${label}の取得に失敗しました`, uri);
    }
  }

  getArticle(uri: vscode.Uri): ArticleContent | undefined {
    const key = this.getKey(uri);
    const article = this.getItem(key);
    return ZennContentError.isError(article) ? void 0 : article;
  }

  async loadArticles(force?: boolean) {
    // キャッシュがある場合はキャッシュを返す
    if (!force && this.store.size > 0) return [...this.store.values()];

    // forceフラグが`true`ならキャッシュを削除
    if (force) this.store.clear();

    const results = await loadArticleContents(this.articlesFolderUri).catch(
      () => []
    );

    results.forEach((result) => {
      const key = this.getKey(result.uri);
      this.setItem(key, result);
    });

    return results;
  }

  async refresh() {
    await this.loadArticles(true);
    this.dispatch({ type: "refresh" });
  }
}
