import * as vscode from "vscode";

import { ZennContext } from "../../context/app";
import { ArticleContent, getArticleTitle } from "../../schemas/article";
import { PreviewTreeItem } from "../previewTreeItem";

/**
 * 記事を表示するTreeItem
 */
export class ArticleTreeItem extends PreviewTreeItem {
  readonly canPreview = true;
  readonly contextValue = "article";

  constructor(context: ZennContext, content: ArticleContent) {
    super(context, content, vscode.TreeItemCollapsibleState.None);

    const published = content.value.published;

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

    this.description = [published ? "公開" : "非公開", content.value.slug]
      .filter((v) => !!v)
      .join("・");

    this.iconPath = this.getIconPath(published ? "check" : "pencil");
  }
}
