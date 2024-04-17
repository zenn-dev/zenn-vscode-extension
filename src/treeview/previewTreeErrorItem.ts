import * as vscode from "vscode";

import { PreviewTreeItem } from "./previewTreeItem";

import { AppContext } from "../context/app";
import { ContentError } from "../schemas/error";

/**
 * TreeItemの基底クラス
 */
export class PreviewTreeErrorItem extends PreviewTreeItem {
  readonly isError = true;
  readonly contextValue = "error";

  constructor(context: AppContext, error: ContentError) {
    super(context, error, vscode.TreeItemCollapsibleState.None);

    this.label = error.message || "エラーが発生しました";

    // エラーメッセージを表示する場合はWarningアイコンを出す
    this.iconPath = new vscode.ThemeIcon(
      "warning",
      new vscode.ThemeColor("inputValidation.warningBorder")
    );

    if (error.uri) {
      this.command = {
        command: "vscode.open",
        title: "ファイルを開く",
        arguments: [error.uri],
      };
    }
  }

  static compare(
    a: PreviewTreeErrorItem | PreviewTreeItem,
    b: PreviewTreeErrorItem | PreviewTreeItem
  ): number {
    const aIsError = PreviewTreeErrorItem.isPreviewTreeErrorItem(a);
    const bIsError = PreviewTreeErrorItem.isPreviewTreeErrorItem(b);
    if (aIsError && !bIsError) {
      return -1;
    }
    if (!aIsError && bIsError) {
      return 1;
    }

    const aUrl = a.contentUri?.toString() ?? "";
    const bUrl = b.contentUri?.toString() ?? "";
    return aUrl < bUrl ? -1 : 1;
  }

  static isPreviewTreeErrorItem(
    target: unknown
  ): target is PreviewTreeErrorItem {
    return target instanceof PreviewTreeErrorItem;
  }
}
