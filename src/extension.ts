import * as vscode from "vscode";

import { createZennContext } from "./context/app";
import { initializeEditor } from "./context/editor";
import { initializeTreeView } from "./context/treeview";
import { initializeWebview } from "./context/webview";

export function activate(extension: vscode.ExtensionContext) {
  const context = createZennContext(extension);

  if (!context) {
    console.warn("表示できるワークスペースがありません");
    return;
  }

  extension.subscriptions.push(
    // TreeViewの初期化処理
    ...initializeTreeView(context),

    // エディターの初期化処理
    ...initializeEditor(context),

    // Webviewの初期化処理
    ...initializeWebview(context)
  );
}

// this method is called when your extension is deactivated
export function deactivate() {}
