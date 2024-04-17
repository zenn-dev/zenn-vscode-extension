import naturalCompare from "natural-compare-lite";
import * as vscode from "vscode";

import { AppContext } from "../../context/app";
import { ArticleContent, getArticleTitle } from "../../schemas/article";
import { PreviewTreeItem } from "../previewTreeItem";

/**
 * 記事を表示するTreeItem
 */
export class ArticleTreeItem extends PreviewTreeItem {
  readonly canPreview = true;
  readonly contextValue = "article";
  readonly content: ArticleContent;

  constructor(context: AppContext, content: ArticleContent) {
    super(context, content, vscode.TreeItemCollapsibleState.None);

    const published = content.value.published;

    this.contentUri = content.uri;

    this.label = getArticleTitle({
      emoji: content.value.emoji,
      title: content.value.title,
      filename: content.filename,
    });

    this.command = {
      command: "vscode.open",
      title: "記事ファイルを開く",
      arguments: [content.uri],
    };

    this.content = content;

    this.description = [published ? "公開" : "非公開", content.value.slug]
      .filter((v) => !!v)
      .join("・");

    this.iconPath = this.getIconPath(published ? "check" : "pencil");
  }

  static compareByTitle(a: ArticleTreeItem, b: ArticleTreeItem): number {
    const aTitle = a.content.value.title;
    const bTitle = b.content.value.title;
    if (aTitle === bTitle) {
      return 0;
    }
    if (aTitle === undefined) {
      return -1;
    }
    if (bTitle === undefined) {
      return 1;
    }

    return naturalCompare(aTitle, bTitle);
  }
}
