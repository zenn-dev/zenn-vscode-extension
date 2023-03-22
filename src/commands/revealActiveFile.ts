import * as vscode from "vscode";

import { AppContext } from "../context/app";

/**
 * ツリービューでアクティブなファイルを表示するコマンドの実装
 */
export const revealActiveFileCommand = (context?: AppContext) => {
  return () => {
    if (!context) {
      return vscode.window.showErrorMessage("コマンドの実行に失敗しました");
    }

    const activeDocumentUri = vscode.window.activeTextEditor?.document.uri;

    if (!activeDocumentUri) {
      return vscode.window.showErrorMessage(
        "ツリービューで表示できるコンテンツがありませんでした"
      );
    }

    return context.dispatchContentsEvent({
      type: "reveal-active-file",
      payload: {
        uri: activeDocumentUri,
        force: true,
      },
    });
  };
};
