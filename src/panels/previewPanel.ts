import * as vscode from "vscode";
import zennContentCSS from "zenn-content-css";

import { ZennPreviewContents, ZennPreviewEvent } from "./types";

import { ZennContext } from "../context/app";
import { ZennContents } from "../schemas/types";
import { Subscription } from "../utils/subscription";

export type PanelEvent = ZennPreviewEvent | { type: "DISPOSE" };

export abstract class PreviewPanel<
  T extends ZennPreviewContents = ZennPreviewContents
> extends Subscription<PanelEvent> {
  protected context: ZennContext;
  protected previewContent: T;
  protected readonly panel: vscode.WebviewPanel;

  constructor(
    context: ZennContext,
    panel: vscode.WebviewPanel,
    previewContent: T
  ) {
    super();

    this.context = context;
    this.panel = panel;
    this.previewContent = previewContent;

    const webviewSrc = PreviewPanel.getWebviewSrc(
      panel,
      context.extension.extensionUri
    );

    panel.title = this.getPanelTitle(previewContent);
    panel.webview.html = PreviewPanel.createWebviewHtml(webviewSrc);
    panel.webview.onDidReceiveMessage(this.onDidReceiveMessage);
    panel.onDidDispose(() => this.dispatch({ type: "DISPOSE" }));
  }

  abstract getPanelTitle(value: ZennPreviewContents): string;
  abstract createPreviewContent(content: ZennContents): T | undefined;

  private onDidReceiveMessage = (event?: ZennPreviewEvent) => {
    if (!event) return;

    switch (event.type) {
      case "READY_PREVIEW":
        this.sendPreviewEvent({
          type: "READY_PREVIEW",
          result: this.previewContent,
        });
        break;
    }

    this.dispatch(event);
  };

  protected sendPreviewEvent(event: ZennPreviewEvent) {
    this.panel.webview.postMessage(event);
    this.dispatch(event);
  }

  getPreviewContents(): T {
    return this.previewContent;
  }

  /**
   * WebViewにコンテンツの更新を伝える
   */
  updatePreview(content: ZennContents) {
    const previewContent = this.createPreviewContent(content);

    if (!previewContent) return;

    this.previewContent = previewContent;
    this.panel.title = this.getPanelTitle(previewContent);
    this.sendPreviewEvent({ type: "UPDATE_PREVIEW", result: previewContent });
  }

  asWebviewUri(uri: vscode.Uri): vscode.Uri {
    return this.panel.webview.asWebviewUri(uri);
  }

  getViewColumn(): vscode.ViewColumn | undefined {
    return this.panel.viewColumn;
  }

  open(preserveFocus?: boolean) {
    return this.panel.reveal(void 0, preserveFocus);
  }

  dispose() {
    this.panel.dispose();
  }

  static getWebviewSrc(panel: vscode.WebviewPanel, extensionUri: vscode.Uri) {
    return panel.webview.asWebviewUri(
      vscode.Uri.joinPath(extensionUri, "dist/webviews/zennContentsPreview.js")
    );
  }

  static createWebviewHtml(webviewSrc: vscode.Uri) {
    return (
      `<!DOCTYPE html>` +
      `<html lang="ja">` +
      `  <head>` +
      `    <meta charset="utf-8">` +
      `    <meta name="viewport" content="width=device-width,initial-scale=1.0">` +
      `    <title>Zenn Preview</title>` +
      `    <style>${zennContentCSS}</style>` +
      `    <!-- 埋め込み要素のイベントを処理するためのスクリプト -->` +
      `    <script src="https://embed.zenn.studio/js/listen-embed-event.js"></script>` +
      `  </head>` +
      `  <body>` +
      `    <div id="root"></div>` +
      `    <script defer src="${webviewSrc}"></script>` +
      `  </body>` +
      `</html>`
    );
  }
}
