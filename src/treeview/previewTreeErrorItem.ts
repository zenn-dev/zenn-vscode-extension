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
  }
}
