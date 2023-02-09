import * as vscode from "vscode";

import { AppContext } from "../context/app";
import { PreviewTreeItem } from "../treeview/previewTreeItem";

/**
 * プレビューコマンドの実装
 */
export const previewCommand = (context?: AppContext) => {
  return (treeItem?: PreviewTreeItem) => {
    if (!context) {
      return vscode.window.showErrorMessage("コマンドの実行に失敗しました");
    } else if (treeItem?.canPreview === false) {
      return vscode.window.showErrorMessage("プレビューできないコンテンツです");
    }

    // コマンドパレットから実行する場合はアクティブなファイルをプレビューする
    const activeDocumentUri =
      vscode.window.activeTextEditor?.document.uri.toString();

    // TreeView から実行する場合は選択された TreeItem が対応するファイルをプレビューする
    const treeItemContentUri = treeItem?.contentUri?.toString();

    // プレビューするコンテンツの Uri 文字列
    const previewContentUri = treeItemContentUri || activeDocumentUri;

    if (!previewContentUri) {
      return vscode.window.showErrorMessage(
        "プレビューできるコンテンツがありませんでした。TreeViewからプレビューするコンテンツを選択するか、Zennリポジトリ内のarticlesフォルダまたはbooksフォルダにあるマークダウンファイルを開いた状態でコマンドを実行してください。"
      );
    }

    // TreeView からのボタンクリック
    return context.dispatchContentsEvent({
      type: "open-preview-panel",
      payload: { path: previewContentUri },
    });
  };
};
