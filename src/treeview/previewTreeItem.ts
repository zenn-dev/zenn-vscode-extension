import naturalCompare from "natural-compare-lite";
import * as vscode from "vscode";

import { AppContext } from "../context/app";
import { ContentError } from "../schemas/error";
import { Contents, ContentsType } from "../types";

/** TreeItem の `contextValue` に設定できる値 */
export type TreeItemType = ContentsType | "error" | "none";

/** `TreeItem.getChildren()` で返すデータ型 */
export type ChildTreeItem = PreviewTreeItem | vscode.TreeItem;

/**
 * TreeItemの基底クラス
 */
export abstract class PreviewTreeItem extends vscode.TreeItem {
  /** ソート時に使うパス文字列 */
  protected readonly path: string;
  protected readonly context: AppContext;
  protected readonly extensionUri: vscode.Uri;

  /** TreeItemをpackage.jsonの設定で判定するための値 */
  contextValue: TreeItemType = "none";

  /** Webviewでプレビューできるか */
  canPreview: boolean = false;

  /** プレビューするコンテンツのUri */
  contentUri?: vscode.Uri;

  constructor(
    context: AppContext,
    content: Contents | ContentError,
    collapsibleState: vscode.TreeItemCollapsibleState
  ) {
    super("", collapsibleState);

    this.context = context;
    this.contentUri = content.uri;
    this.resourceUri = content.uri; // VSCode のデフォルトの挙動を有効にするのに必要
    this.path = content.uri?.path || "";
    this.extensionUri = this.context.extension.extensionUri;
  }

  getIconPath(type: string) {
    return {
      dark: vscode.Uri.joinPath(
        this.extensionUri,
        `public/assets/svg/dark/${type}.svg`
      ),
      light: vscode.Uri.joinPath(
        this.extensionUri,
        `public/assets/svg/light/${type}.svg`
      ),
    };
  }

  async getChildren(): Promise<ChildTreeItem[]> {
    return [];
  }

  /**
   * TreeItemをソートする
   */
  static sortTreeItems(items: PreviewTreeItem[]): PreviewTreeItem[] {
    return items.sort((a, b) => naturalCompare(a.path, b.path));
  }
}
