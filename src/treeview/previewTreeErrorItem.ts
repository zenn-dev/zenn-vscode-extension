import * as vscode from "vscode";

import { PreviewTreeItem } from "./previewTreeItem";

import { ZennContext } from "../context/app";
import { ZennContentError } from "../schemas/types";

/**
 * TreeItemの基底クラス
 */
export class PreviewTreeErrorItem extends PreviewTreeItem {
  readonly isError = true;
  readonly contextValue = "error";

  constructor(context: ZennContext, error: ZennContentError) {
    super(context, error, vscode.TreeItemCollapsibleState.None);

    this.label = error.message || "エラーが発生しました";

    // エラーメッセージを表示する場合はWarningアイコンを出す
    this.iconPath = new vscode.ThemeIcon(
      "warning",
      new vscode.ThemeColor("inputValidation.warningBorder")
    );
  }
}
