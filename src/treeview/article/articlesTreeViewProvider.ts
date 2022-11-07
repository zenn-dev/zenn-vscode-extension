import * as vscode from "vscode";

import { ArticleTreeItem } from "./articleTreeItem";

import { ZennContext } from "../../context/app";
import { ZennContentError } from "../../schemas/types";
import { ArticleStore } from "../../store/articleStore";
import { PreviewTreeErrorItem } from "../previewTreeErrorItem";
import { ChildTreeItem, PreviewTreeItem } from "../previewTreeItem";

type TreeDataProvider = vscode.TreeDataProvider<ChildTreeItem>;

export class ArticlesTreeViewProvider implements TreeDataProvider {
  private readonly store: ArticleStore;
  private readonly context: ZennContext;

  _onDidChangeTreeData = new vscode.EventEmitter<PreviewTreeItem | void>();
  onDidChangeTreeData = this._onDidChangeTreeData.event;

  constructor(context: ZennContext) {
    this.context = context;
    this.store = context.articleStore;
  }

  reload() {
    this._onDidChangeTreeData.fire();
  }

  async getTreeItem(element: PreviewTreeItem): Promise<PreviewTreeItem> {
    return element;
  }

  async getChildren(element?: PreviewTreeItem): Promise<ChildTreeItem[]> {
    if (element) return element.getChildren();

    const treeItems = await this.store
      .loadArticles()
      .then((results) =>
        results.map((result) =>
          ZennContentError.isError(result)
            ? new PreviewTreeErrorItem(this.context, result)
            : new ArticleTreeItem(this.context, result)
        )
      );

    return PreviewTreeItem.sortTreeItems(treeItems);
  }
}
