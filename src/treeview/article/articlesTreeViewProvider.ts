import * as vscode from "vscode";

import { ArticleTreeItem } from "./articleTreeItem";

import { AppContext } from "../../context/app";
import { loadArticleContents } from "../../schemas/article";
import { ContentError } from "../../schemas/error";
import { PreviewTreeErrorItem } from "../previewTreeErrorItem";
import { ChildTreeItem, PreviewTreeItem } from "../previewTreeItem";

type TreeDataProvider = vscode.TreeDataProvider<ChildTreeItem>;

export class ArticlesTreeViewProvider implements TreeDataProvider {
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

    const articleContents = await loadArticleContents(
      this.context,
      this.forceRefresh
    );

    const treeItems = articleContents.map((result) =>
      ContentError.isError(result)
        ? new PreviewTreeErrorItem(this.context, result)
        : new ArticleTreeItem(this.context, result)
    );

    return PreviewTreeItem.sortTreeItems(treeItems);
  }
}
