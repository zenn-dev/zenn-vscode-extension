import * as vscode from "vscode";

import { AppContext } from "../context/app";

/**
 * ツリービューでアクティブなファイルを表示するコマンドの実装
 */
export const revealActiveFileCommand = (context?: AppContext) => {
  return async () => {
    if (!context) return;

    const activeDocumentUri = vscode.window.activeTextEditor?.document.uri;
    if (!activeDocumentUri) return;

    return context.dispatchContentsEvent({
      type: "reveal-active-file",
      payload: {
        uri: activeDocumentUri,
        force: true,
      },
    });
  };
};
