import * as vscode from "vscode";

import { AppContext } from "../context/app";

export const revealFile = (context?: AppContext) => {
  return async () => {
    if (!context) return;

    const activeDocumentUri = vscode.window.activeTextEditor?.document.uri;
    if (!activeDocumentUri) return;

    return context.dispatchContentsEvent({
      type: "reveal",
      payload: {
        uri: activeDocumentUri,
        force: true,
      },
    });
  };
};
