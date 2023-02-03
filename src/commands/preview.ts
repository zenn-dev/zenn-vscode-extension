import * as vscode from "vscode";

import { AppContext } from "../context/app";
import { PreviewTreeItem } from "../treeview/previewTreeItem";
import {
  getFilenameFromUrl,
  getParentDirectoryNameFromUrl,
} from "../utils/vscodeHelpers";

/**
 * プレビューコマンドの実装
 */
export const previewCommand = (context?: AppContext) => {
  return (treeItem?: PreviewTreeItem) => {
    if (!context) {
      return vscode.window.showErrorMessage("コマンドの実行に失敗しました");
    }

    const activeDocument = vscode.window.activeTextEditor?.document;

    // コマンドパレットから実行する場合はアクティブなファイルをプレビューする
    if (!treeItem?.canPreview && activeDocument?.languageId === "markdown") {
      const activeFileUri = activeDocument.uri.toString();
      const activeFileName = getFilenameFromUrl(activeFileUri) || "";
      const parentDirName = getParentDirectoryNameFromUrl(activeFileUri) || "";

      const uriAsArticle = vscode.Uri.joinPath(
        context.articlesFolderUri,
        activeFileName
      ).toString();
      const uriAsBookChapter = vscode.Uri.joinPath(
        context.booksFolderUri,
        parentDirName,
        activeFileName
      ).toString();

      if (
        activeFileUri === uriAsArticle ||
        activeFileUri === uriAsBookChapter
      ) {
        return context.dispatchContentsEvent({
          type: "open-preview-panel",
          payload: { path: activeFileUri },
        });
      } else {
        return vscode.window.showErrorMessage(
          "このファイルはZennリポジトリ内のarticlesフォルダまたはbooksフォルダにありません。"
        );
      }
    }

    if (!treeItem?.contentUri) {
      return vscode.window.showErrorMessage(
        "プレビューできるコンテンツがありませんでした。TreeViewからプレビューするコンテンツを選択するか、Zennリポジトリ内のarticlesフォルダまたはbooksフォルダにあるマークダウンファイルを開いた状態でコマンドを実行してください。"
      );
    }

    // TreeView からのボタンクリック
    return context.dispatchContentsEvent({
      type: "open-preview-panel",
      payload: { path: treeItem.contentUri.toString() },
    });
  };
};
