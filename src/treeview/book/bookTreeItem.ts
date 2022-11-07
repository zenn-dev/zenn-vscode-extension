import * as vscode from "vscode";

import { BookChapterTreeItem } from "./bookChapterTreeItem";
import { BookConfigTreeItem } from "./bookConfigTreeItem";
import { BookCoverImageTreeItem } from "./bookCoverImageTreeItem";

import { ZennContext } from "../../context/app";
import { BookContent } from "../../schemas/book";
import { ZennContentError } from "../../schemas/types";
import { PreviewTreeErrorItem } from "../previewTreeErrorItem";
import { ChildTreeItem, PreviewTreeItem } from "../previewTreeItem";

/**
 * 本のタイトル(もしくはslug)とチャプター一覧を表示するTreeItem
 */
export class BookTreeItem extends PreviewTreeItem {
  private bookContent?: BookContent;

  readonly contextValue = "book";

  constructor(context: ZennContext, bookContent: BookContent) {
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

  async getChildren() {
    if (!this.bookContent) return [];

    const { bookChapterStore } = this.context;
    const { coverImageUri, uri: bookUri } = this.bookContent;

    // チャプターのTreeItemを作成
    const chapterTreeItems = await Promise.all(
      this.bookContent.chapters.map(async (meta) => {
        const content = await bookChapterStore.loadBookChapter(
          bookUri,
          meta.uri
        );

        return ZennContentError.isError(content)
          ? new PreviewTreeErrorItem(this.context, content)
          : new BookChapterTreeItem(this.context, meta, content);
      })
    );

    return [
      // 設定ファイルのTreeItem
      new BookConfigTreeItem(this.bookContent.configUri),

      // カバー画像のTreeItem
      coverImageUri ? new BookCoverImageTreeItem(coverImageUri) : null,

      // チャプターのTreeItem一覧
      ...PreviewTreeItem.sortTreeItems(chapterTreeItems),
    ].filter((v): v is ChildTreeItem => !!v);
  }
}
