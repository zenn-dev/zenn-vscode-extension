import * as vscode from "vscode";

import { AppContext } from "../context/app";
import { PreviewTreeItem } from "../treeview/previewTreeItem";

/**
 * レビューコマンドの実装
 */
export const previewCommand = (context?: AppContext) => {
  return (treeItem?: PreviewTreeItem) => {
    if (!context || !treeItem?.canPreview || !treeItem.contentUri) {
      return vscode.window.showErrorMessage(
        "プレビューできるコンテンツがありませんでした。TreeViewからプレビューするコンテンツを選択して下さい。"
      );
    }

    context.dispatchContentsEvent({
      type: "open-preview-panel",
      payload: { path: treeItem.contentUri.toString() },
    });
  };
};
