import * as vscode from "vscode";

/**
 * 本の設定ファイルを表示するTreeItem
 */
export class BookConfigTreeItem extends vscode.TreeItem {
  public contentUri: vscode.Uri;

  constructor(uri: vscode.Uri) {
    super(uri, vscode.TreeItemCollapsibleState.None);

    this.contentUri = uri;
    this.contextValue = "bookConfig";
    this.iconPath = new vscode.ThemeIcon("gear");
    this.command = {
      command: "vscode.open",
      title: "本の設定ファイルを開く",
      arguments: [uri],
    };
  }
}
