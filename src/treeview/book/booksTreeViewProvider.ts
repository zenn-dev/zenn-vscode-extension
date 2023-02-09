import * as vscode from "vscode";

import { BookTreeItem } from "./bookTreeItem";

import { AppContext } from "../../context/app";
import { loadBookContents } from "../../schemas/book";
import { ContentError } from "../../schemas/error";
import { PreviewTreeErrorItem } from "../previewTreeErrorItem";
import { ChildTreeItem, PreviewTreeItem } from "../previewTreeItem";

type TreeDataProvider = vscode.TreeDataProvider<ChildTreeItem>;

export class BooksTreeViewProvider implements TreeDataProvider {
  private readonly context: AppContext;
  private forceRefresh: boolean = false;

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

      return PreviewTreeItem.sortTreeItems(treeItems);
    } catch {
      console.error("booksフォルダ内にコンテンツが見つかりませんでした");
      return [];
    }
  }
}
