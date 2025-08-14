import * as vscode from "vscode";

import { BookChapterTreeItem } from "./bookChapterTreeItem";
import { BookConfigTreeItem } from "./bookConfigTreeItem";
import { BookCoverImageTreeItem } from "./bookCoverImageTreeItem";

import { AppContext } from "../../context/app";
import { BookContent } from "../../schemas/book";
import { loadBookChapterContent } from "../../schemas/bookChapter";
import { ContentError } from "../../schemas/error";
import { PreviewTreeErrorItem } from "../previewTreeErrorItem";
import { ChildTreeItem, PreviewTreeItem } from "../previewTreeItem";

/**
 * 本のタイトル(もしくはslug)とチャプター一覧を表示するTreeItem
 */
export class BookTreeItem extends PreviewTreeItem {
  private bookContent?: BookContent;
  private treeItems: ChildTreeItem[] = [];

  readonly contextValue = "book";

  constructor(context: AppContext, bookContent: BookContent) {
    super(context, bookContent, vscode.TreeItemCollapsibleState.Collapsed);

    const published = bookContent.value.published;

    this.canPreview = true;
    this.bookContent = bookContent;
    this.label = bookContent.value.title || void 0; // undefined の場合はファイル名が表示される

    this.description = [published ? "公開" : "非公開", bookContent.value.slug]
      .filter((v) => !!v)
      .join("・");

    this.iconPath = this.getIconPath(published ? "release-book" : "edit-book");
  }

  createErrorTreeItem(message: string) {
    return new PreviewTreeErrorItem(this.context, new ContentError(message));
  }

  async getChildren() {
    if (!this.bookContent) return [];

    const ctx = this.context;
    const { configUri, coverImageUri } = this.bookContent;

    // チャプターのTreeItemを作成
    const chapterTreeItems = await Promise.all(
      this.bookContent.chapters.map(async (meta, index) => {
        const content = await loadBookChapterContent(ctx, meta.uri);

        return ContentError.isError(content)
          ? new PreviewTreeErrorItem(ctx, content)
          : new BookChapterTreeItem(ctx, meta, content, index + 1);
      })
    );

    // 設定によりチャプター番号でソートするかファイル名でソートするかを決定
    const isSortedByChapterNumber = vscode.workspace
      .getConfiguration("zenn-preview")
      .get<boolean>("sortByChapterNumber");
    const sortedItems = isSortedByChapterNumber
      ? chapterTreeItems
      : await PreviewTreeItem.sortTreeItems(chapterTreeItems);

    const treeItems = [
      // 設定ファイルのTreeItem
      !ContentError.isError(configUri)
        ? new BookConfigTreeItem(configUri)
        : new PreviewTreeErrorItem(ctx, configUri),

      // カバー画像のTreeItem
      coverImageUri
        ? new BookCoverImageTreeItem(coverImageUri)
        : this.createErrorTreeItem("カバー画像がありません"),

      // チャプターのTreeItem一覧
      ...sortedItems,
    ].filter((v): v is ChildTreeItem => !!v);

    this.treeItems = treeItems;

    return treeItems;
  }

  /**
   * Uri からチャプターなどの TreeItem を取得する
   */
  getTreeItemFromUri(uri: vscode.Uri) {
    return this.treeItems.find((item) => {
      if ("contentUri" in item) {
        return item.contentUri?.toString() === uri.toString();
      }
    });
  }
}
