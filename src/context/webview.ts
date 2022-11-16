import * as vscode from "vscode";

import { AppContext } from "./app";

import {
  openPreviewPanel,
  createPreviewPanel,
  registerPreviewPanel,
  updatePreviewPanel,
  disposePreviewPanel,
} from "../schemas/previewPanel";
import { WebViewState } from "../types";
import { toVSCodeUri } from "../utils/vscodeHelpers";

type WebviewPanel = vscode.WebviewPanel;

/**
 * Webviewの初期化処理
 */
export const initializeWebview = (context: AppContext): vscode.Disposable[] => {
  const { listenContentsEvent } = context;

  return [
    listenContentsEvent((event) => {
      switch (event.type) {
        case "open-preview-panel":
          openPreviewPanel(context, event.payload.path);
          break;
        case "update-content":
          updatePreviewPanel(context, event.payload.uri);
          break;
        case "delete-content":
          disposePreviewPanel(context, event.payload.uri);
          break;
      }
    }),

    // Webviewを永続化する
    vscode.window.registerWebviewPanelSerializer("zenn-preview", {
      async deserializeWebviewPanel(panel: WebviewPanel, state?: WebViewState) {
        const content = state?.content;

        if (!content) return;

        const uri = toVSCodeUri(content.path);
        const previewPanel = createPreviewPanel(uri, panel, content);

        registerPreviewPanel(context, previewPanel);
      },
    }),
  ];
};
