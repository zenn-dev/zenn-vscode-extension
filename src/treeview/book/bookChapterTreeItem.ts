import * as vscode from "vscode";

import { AppContext } from "../../context/app";
import { BookChapterMeta } from "../../schemas/book";
import { BookChapterContent } from "../../schemas/bookChapter";
import { PreviewTreeItem } from "../previewTreeItem";

/**
 * 本のチャプターを表示するTreeItem
 */
export class BookChapterTreeItem extends PreviewTreeItem {
  constructor(
    context: AppContext,
    meta: BookChapterMeta,
    content: BookChapterContent
  ) {
    super(context, content, vscode.TreeItemCollapsibleState.None);

    this.canPreview = true;
    this.contextValue = "bookChapter";
    this.label = content.value.title || void 0; // undefined の場合はファイル名が表示される
    this.iconPath = new vscode.ThemeIcon("file");
    this.command = {
      command: "vscode.open",
      title: `${content.filename || "チャプター"}を開く`,
      arguments: [content.uri],
    };

    this.description = [
      meta.isExcluded ? "除外" : "",
      content.value.free ? "無料" : "",
      content.value.slug,
    ]
      .filter((v) => !!v)
      .join("・");
  }
}
