import * as vscode from "vscode";

import { BookTreeItem } from "./bookTreeItem";

import { ZennContext } from "../../context/app";
import { ZennContentError } from "../../schemas/types";
import { PreviewTreeErrorItem } from "../previewTreeErrorItem";
import { ChildTreeItem, PreviewTreeItem } from "../previewTreeItem";

type TreeDataProvider = vscode.TreeDataProvider<ChildTreeItem>;

export class BooksTreeViewProvider implements TreeDataProvider {
  private readonly context: ZennContext;

  _onDidChangeTreeData = new vscode.EventEmitter<PreviewTreeItem | void>();
  onDidChangeTreeData = this._onDidChangeTreeData.event;

  constructor(context: ZennContext) {
    this.context = context;
  }

  reload() {
    this._onDidChangeTreeData.fire();
  }

  async getTreeItem(element: PreviewTreeItem): Promise<PreviewTreeItem> {
    return element;
  }

  async getChildren(element?: PreviewTreeItem): Promise<ChildTreeItem[]> {
    if (element) return element.getChildren();

    const treeItems = await this.context.bookStore
      .loadBooks()
      .then((results) =>
        results.map((result) =>
          ZennContentError.isError(result)
            ? new PreviewTreeErrorItem(this.context, result)
            : new BookTreeItem(this.context, result)
        )
      );

    return PreviewTreeItem.sortTreeItems(treeItems);
  }
}
