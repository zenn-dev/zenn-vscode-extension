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
    content: BookChapterContent,
    prefixNumber: number
  ) {
    super(context, content, vscode.TreeItemCollapsibleState.None);

    this.canPreview = true;
    this.contextValue = "bookChapter";

    // 設定からチャプタータイトルにチャプター番号をプリフィクスするかどうかを決定
    const isShownChapterPrefix = vscode.workspace
      .getConfiguration("zenn-preview")
      .get<boolean>("showChapterNumber");
    const chapterLabelPrefix = (() => {
      if (!isShownChapterPrefix) {
        return "";
      } else if (typeof meta.position === "number") {
        return `${prefixNumber}. `;
      } else {
        return "(除外) ";
      }
    })();

    this.label = chapterLabelPrefix + (content.value.title || content.filename);
    this.iconPath = new vscode.ThemeIcon("file");
    this.command = {
      command: "vscode.open",
      title: `${content.filename || "チャプター"}を開く`,
      arguments: [content.uri],
    };

    this.description = [
      meta.isExcluded ? (isShownChapterPrefix ? "" : "除外") : "",
      content.value.free ? "無料" : "",
      content.value.slug,
    ]
      .filter((v) => !!v)
      .join("・");
  }
}
