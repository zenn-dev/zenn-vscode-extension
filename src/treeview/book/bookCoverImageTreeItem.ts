import * as vscode from "vscode";

/**
 * 本のカバー画像ファイルを表示するTreeItem
 */
export class BookCoverImageTreeItem extends vscode.TreeItem {
  constructor(uri: vscode.Uri) {
    super(uri, vscode.TreeItemCollapsibleState.None);

    this.contextValue = "bookCoverImage";
    this.command = {
      command: "vscode.open",
      title: "本のカバー画像を開く",
      arguments: [uri],
    };
  }
}
