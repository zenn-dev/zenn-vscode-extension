import * as vscode from "vscode";

export const getWebviewSrc = (
  panel: vscode.WebviewPanel,
  extensionUri: vscode.Uri
) => {
  return panel.webview.asWebviewUri(
    vscode.Uri.joinPath(extensionUri, "dist/webviews/zennContentsPreview.js")
  );
};

export const createWebviewHtml = (webviewSrc: vscode.Uri) => {
  return (
    `<!DOCTYPE html>` +
    `<html lang="ja">` +
    `  <head>` +
    `    <meta charset="utf-8">` +
    `    <meta name="viewport" content="width=device-width,initial-scale=1.0">` +
    `    <title>Zenn Preview</title>` +
    `    <!-- 埋め込み要素のイベントを処理するためのスクリプト -->` +
    `    <script src="https://embed.zenn.studio/js/listen-embed-event.js"></script>` +
    `  </head>` +
    `  <body>` +
    `    <div id="root"></div>` +
    `    <script defer src="${webviewSrc}"></script>` +
    `  </body>` +
    `</html>`
  );
};
