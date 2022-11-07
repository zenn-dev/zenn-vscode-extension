import * as vscode from "vscode";

import { ZennContext } from "./app";

import { previewCommand } from "../commands/preview";
import { ZennPreviewContents } from "../panels/types";
import { ZennContentError } from "../schemas/types";
import { StoreEvents } from "../store/common";
import { toVSCodeUri } from "../utils/vscodeHelpers";
import { APP_COMMAND } from "../variables";
import { WebViewState } from "../webviews/types";

type WebviewPanel = vscode.WebviewPanel;

export interface WebViewContext {
  openPreviewPanel(uri: vscode.Uri): void;
  onUpdateContents(event: StoreEvents): void;
  registerPanel(
    panel: vscode.WebviewPanel,
    contents: ZennPreviewContents
  ): void;
}

/**
 * Webviewの初期化処理
 */
export const initializeWebview = (
  context: ZennContext
): vscode.Disposable[] => {
  const { bookStore, articleStore, bookChapterStore, panelStore } = context;

  const webViewContext: WebViewContext = {
    openPreviewPanel(uri) {
      const panel = panelStore.getPanel(uri);

      if (panel) return panel.open();

      const newPanel = panelStore.createPreviewPanelFromContents(context, uri);

      if (newPanel) {
        panelStore.setPanel(newPanel);
      } else {
        vscode.window.showErrorMessage("プレビューできないファイルです");
      }
    },

    registerPanel(panel, contents) {
      const previewPanel = panelStore.createPreviewPanelFromPreviewContents(
        context,
        panel,
        contents
      );

      if (!previewPanel) return;

      panelStore.setPanel(previewPanel);
    },

    onUpdateContents(event) {
      switch (event.type) {
        case "update": {
          if (!ZennContentError.isError(event.value)) {
            panelStore.updatePreview(event.value);
          }
          break;
        }
        case "delete": {
          if (!ZennContentError.isError(event.value)) {
            panelStore.disposePanel(event.value);
          }
          break;
        }
      }
    },
  };

  bookStore.addEventListener(webViewContext.onUpdateContents);
  articleStore.addEventListener(webViewContext.onUpdateContents);
  bookChapterStore.addEventListener(webViewContext.onUpdateContents);

  panelStore.addEventListener((event) => {
    switch (event.type) {
      case "OPEN_PREVIEW": {
        const uri = toVSCodeUri(event.payload.openPath);
        webViewContext.openPreviewPanel(uri);
        break;
      }
    }
  });

  return [
    // プレビューコマンドを設定
    vscode.commands.registerCommand(
      APP_COMMAND.PREVIEW,
      previewCommand(webViewContext)
    ),

    // Webviewを永続化する
    vscode.window.registerWebviewPanelSerializer("zenn-preview", {
      async deserializeWebviewPanel(panel: WebviewPanel, state?: WebViewState) {
        const contents = state?.content;

        if (contents) {
          webViewContext.registerPanel(panel, contents);
        }
      },
    }),
  ];
};
