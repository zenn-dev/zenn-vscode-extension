import * as vscode from "vscode";

import { ArticleTreeItem } from "./articleTreeItem";

import { AppContext } from "../../context/app";
import { loadArticleContents } from "../../schemas/article";
import { ContentError } from "../../schemas/error";
import { PreviewTreeErrorItem } from "../previewTreeErrorItem";
import { ChildTreeItem, PreviewTreeItem } from "../previewTreeItem";

type TreeDataProvider = vscode.TreeDataProvider<ChildTreeItem>;
type Item = ArticleTreeItem | PreviewTreeErrorItem;

export class ArticlesTreeViewProvider implements TreeDataProvider {
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
      const articleContents = await loadArticleContents(
        this.context,
        this.forceRefresh
      );

      const treeItems = articleContents.map((result) =>
        ContentError.isError(result)
          ? new PreviewTreeErrorItem(this.context, result)
          : new ArticleTreeItem(this.context, result)
      );

      this.treeItems = treeItems;

      return ArticlesTreeViewProvider.sortTreeItems(treeItems);
    } catch {
      console.error("articlesフォルダ内にコンテンツが見つかりませんでした");
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
   * Uri から記事の TreeItem を取得する
   */
  getTreeItemFromUri(uri: vscode.Uri) {
    return this.treeItems.find(
      (item) => item.contentUri?.toString() === uri.toString()
    );
  }

  static sortTreeItems(items: Item[]): Item[] {
    return items.sort((a, b) => {
      const aIsError = a instanceof PreviewTreeErrorItem;
      const bIsError = b instanceof PreviewTreeErrorItem;
      if (
        PreviewTreeErrorItem.isPreviewTreeErrorItem(a) ||
        PreviewTreeErrorItem.isPreviewTreeErrorItem(b)
      ) {
        return PreviewTreeErrorItem.compare(a, b);
      }

      return ArticleTreeItem.compareByTitle(a, b);
    });
  }
}
