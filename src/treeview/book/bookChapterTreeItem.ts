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

    // 設定からチャプタータイトルにチャプター番号をプリフィクスするかどうかを決定
    const isShownChapterNumber = vscode.workspace
      .getConfiguration("zenn-preview")
      .get<boolean>("showChapterNumber");
    const chapterNumberLabel = (() => {
      if (typeof meta.position === "number" && isShownChapterNumber) {
        return `${meta.position + 1}. `;
      } else {
        return "";
      }
    })();

    this.label = chapterNumberLabel + (content.value.title || content.filename);
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
