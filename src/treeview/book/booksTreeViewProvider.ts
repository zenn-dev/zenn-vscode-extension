import * as vscode from "vscode";

import { BookTreeItem } from "./bookTreeItem";

import { AppContext } from "../../context/app";
import { loadBookContents } from "../../schemas/book";
import { ContentError } from "../../schemas/error";
import { getParentFolderUri } from "../../utils/vscodeHelpers";
import { PreviewTreeErrorItem } from "../previewTreeErrorItem";
import { ChildTreeItem, PreviewTreeItem } from "../previewTreeItem";

type TreeDataProvider = vscode.TreeDataProvider<ChildTreeItem>;

export class BooksTreeViewProvider implements TreeDataProvider {
  private readonly context: AppContext;
  private forceRefresh: boolean = false;
  private treeItems: PreviewTreeItem[] = [];

  _onDidChangeTreeData = new vscode.EventEmitter<PreviewTreeItem | void>();
  onDidChangeTreeData = this._onDidChangeTreeData.event;

  constructor(context: AppContext) {
    this.context = context;
  }

  reload(options?: { force?: boolean }) {
    this.forceRefresh = !!options?.force;
    this._onDidChangeTreeData.fire();
  }

  async getTreeItem(element: PreviewTreeItem): Promise<PreviewTreeItem> {
    return element;
  }

  async getChildren(element?: PreviewTreeItem): Promise<ChildTreeItem[]> {
    if (element) return element.getChildren();

    try {
      const bookContents = await loadBookContents(
        this.context,
        this.forceRefresh
      );

      const treeItems = bookContents.map((result) =>
        ContentError.isError(result)
          ? new PreviewTreeErrorItem(this.context, result)
          : new BookTreeItem(this.context, result)
      );

      this.treeItems = treeItems;

      return PreviewTreeItem.sortTreeItems(treeItems);
    } catch {
      console.error("booksフォルダ内にコンテンツが見つかりませんでした");
      return [];
    }
  }

  /**
   * TreeView.reveal API の利用のために実装が必要なメソッド
   */
  getParent() {
    return null;
  }

  /**
   * Uri から本の TreeItem を取得する
   */
  getTreeItemFromUri(uri: vscode.Uri) {
    return this.treeItems.find(
      (item) => item.contentUri?.toString() === uri.toString()
    );
  }

  /**
   * チャプターファイルなどの子要素の Uri から本自体の TreeItem を取得する
   */
  getTreeItemFromChildFileUri(uri: vscode.Uri) {
    const bookUri = getParentFolderUri(uri);
    const bookTreeItem = this.treeItems.find(
      (item) => item.contentUri?.toString() === bookUri.toString()
    ) as BookTreeItem;
    return bookTreeItem;
  }

  /**
   * チャプターファイルなどの子要素の Uri からその子要素の TreeItem を取得する
   */
  getChildTreeItemFromChildFileUri(uri: vscode.Uri) {
    const bookTreeItem = this.getTreeItemFromChildFileUri(uri);
    const childTreeItem = bookTreeItem.getTreeItemFromUri(uri);
    return childTreeItem;
  }
}
