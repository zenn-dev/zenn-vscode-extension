import * as vscode from "vscode";

import { createAppContext } from "./context/app";
import { initializeCommands } from "./context/commands";
import { initializeEditor } from "./context/editor/index";
import { initializeTreeView } from "./context/treeview";
import { initializeWebview } from "./context/webview";

export function activate(extension: vscode.ExtensionContext) {
  const context = createAppContext(extension);

  if (!context) {
    vscode.window.showErrorMessage("表示できるワークスペースがありません");
    return;
  }

  extension.subscriptions.push(
    // TreeViewの初期化処理
    ...initializeTreeView(context),

    // エディターの初期化処理
    ...initializeEditor(context),

    // Webviewの初期化処理
    ...initializeWebview(context),

    // コマンドの初期化処理
    ...initializeCommands(context)
  );
}

// this method is called when your extension is deactivated
export function deactivate() {}
